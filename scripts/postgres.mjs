#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

const command = process.argv[2];
const allowed = new Set(["check", "migrate", "seed", "verify"]);
if (!allowed.has(command)) {
  console.error("Usage: node scripts/postgres.mjs <check|migrate|seed|verify>");
  process.exit(2);
}

const connectionUrl = command === "check"
  ? process.env.DATABASE_URL
  : process.env.DATABASE_URL_UNPOOLED;
if (!connectionUrl) {
  console.error(`${command === "check" ? "DATABASE_URL" : "DATABASE_URL_UNPOOLED"} is required.`);
  process.exit(2);
}

const isNeon = new URL(connectionUrl).hostname.endsWith(".neon.tech");
const neonSql = isNeon ? neon(connectionUrl) : null;
const postgresSql = isNeon ? null : postgres(connectionUrl, {
  max: 1, connect_timeout: 10, idle_timeout: 5, max_lifetime: 60, prepare: false,
});

const query = async (text, parameters = []) => isNeon
  ? [...await neonSql.query(text, parameters)]
  : [...await postgresSql.unsafe(text, parameters)];

const transaction = async (statements) => {
  if (isNeon) {
    return neonSql.transaction((tx) =>
      statements.map(({ text, parameters = [] }) => tx.query(text, parameters)));
  }
  return postgresSql.begin(async (tx) => {
    const results = [];
    for (const { text, parameters = [] } of statements)
      results.push(await tx.unsafe(text, parameters));
    return results;
  });
};

const close = async () => {
  if (postgresSql) await postgresSql.end({ timeout: 5 });
};

const EXPECTED = Object.freeze({
  rows: 12552,
  state: 8901,
  national: 132,
  district: 3519,
});

function canonical(row) {
  return [
    row.id, row.dataset, row.observation_year, row.geography_type, row.geography,
    row.parent_geography ?? "", row.domain, row.indicator, row.subgroup_label,
    Number(row.numeric_value).toFixed(6), row.unit, row.pdf_page_number,
    row.source_url, row.comparability,
  ].join("\u001f");
}

function checksum(rows) {
  const hash = createHash("sha256");
  for (const row of [...rows].sort((a, b) => a.id.localeCompare(b.id)))
    hash.update(canonical(row)).update("\n");
  return hash.digest("hex");
}

async function sourceRows() {
  const directory = await mkdtemp(join(tmpdir(), "aser-pg-source-"));
  const database = join(directory, "source.sqlite");
  try {
    const files = (await readdir(new URL("../drizzle/", import.meta.url)))
      .filter((file) => file.endsWith(".sql"))
      .sort();
    for (const file of files) {
      const migration = await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8");
      const applied = spawnSync("sqlite3", [database], {
        input: migration,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      });
      if (applied.status !== 0) throw new Error(`${file}: ${applied.stderr.trim()}`);
    }
    const query = spawnSync("sqlite3", ["-json", database,
      `SELECT id, dataset, observation_year, geography_type, geography,
        parent_geography, domain, indicator, subgroup_label, numeric_value,
        unit, pdf_page_number, source_url, comparability
       FROM public_observations ORDER BY id;`], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    if (query.status !== 0) throw new Error(query.stderr.trim());
    return JSON.parse(query.stdout);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function targetRows() {
  return query(`SELECT id, dataset, observation_year, geography_type, geography,
      parent_geography, domain, indicator, subgroup_label, numeric_value,
      unit, pdf_page_number, source_url, comparability
    FROM public_observations ORDER BY id`);
}

async function verify() {
  const [source, target] = await Promise.all([sourceRows(), targetRows()]);
  const counts = Object.fromEntries((await query(`
    SELECT geography_type, COUNT(*)::int AS count
    FROM public_observations GROUP BY geography_type ORDER BY geography_type
  `)).map((row) => [row.geography_type, row.count]));
  const sourceHash = checksum(source);
  const targetHash = checksum(target);
  const result = {
    sourceRows: source.length,
    targetRows: target.length,
    geographyCounts: counts,
    sourceSha256: sourceHash,
    targetSha256: targetHash,
    exactMatch: source.length === EXPECTED.rows
      && target.length === EXPECTED.rows
      && counts.state === EXPECTED.state
      && counts.national === EXPECTED.national
      && counts.district === EXPECTED.district
      && sourceHash === targetHash,
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.exactMatch) process.exitCode = 1;
}

const COLUMNS = [
  "id", "dataset", "observation_year", "geography_type", "geography",
  "parent_geography", "domain", "indicator", "subgroup_label", "numeric_value",
  "unit", "pdf_page_number", "source_url", "comparability",
];

function insertStatement(table, rows) {
  const parameters = [];
  const tuples = rows.map((row) => {
    const values = COLUMNS.map((column) => row[column] ?? null);
    const placeholders = values.map((value) => {
      parameters.push(value);
      return `$${parameters.length}`;
    });
    return `(${placeholders.join(",")})`;
  });
  return {
    text: `INSERT INTO ${table} (${COLUMNS.join(",")}) VALUES ${tuples.join(",")}`,
    parameters,
  };
}

try {
  if (command === "check") {
    const [row] = await query(`
      SELECT current_database() AS database, current_user AS role,
        current_setting('server_version_num')::int AS version
    `);
    console.log(JSON.stringify({
      connected: true,
      database: row.database,
      role: row.role,
      postgresMajor: Math.floor(row.version / 10000),
    }));
  } else if (command === "migrate") {
    const schema = await readFile(new URL("../db/postgres.sql", import.meta.url), "utf8");
    const statements = schema
      .replaceAll(/--.*$/gm, "")
      .split(";")
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({ text }));
    await transaction(statements);
    console.log(JSON.stringify({ migrated: true, schema: "public_observations" }));
  } else if (command === "seed") {
    const rows = await sourceRows();
    if (rows.length !== EXPECTED.rows)
      throw new Error(`Refusing import: expected ${EXPECTED.rows} source rows, found ${rows.length}.`);
    await query("DROP TABLE IF EXISTS public_observations_import");
    await query("CREATE TABLE public_observations_import (LIKE public_observations INCLUDING ALL)");
    for (let offset = 0; offset < rows.length; offset += 250) {
      const statement = insertStatement("public_observations_import", rows.slice(offset, offset + 250));
      await query(statement.text, statement.parameters);
    }
    const [staging] = await query("SELECT COUNT(*)::int AS count FROM public_observations_import");
    if (staging.count !== EXPECTED.rows)
      throw new Error(`Refusing promotion: expected ${EXPECTED.rows} staged rows, found ${staging.count}.`);
    await transaction([
      { text: "TRUNCATE TABLE public_observations" },
      { text: `INSERT INTO public_observations (${COLUMNS.join(",")})
        SELECT ${COLUMNS.join(",")} FROM public_observations_import ORDER BY id` },
      { text: "DROP TABLE public_observations_import" },
    ]);
    console.log(JSON.stringify({ seeded: true, rows: rows.length, sha256: checksum(rows) }));
  } else {
    await verify();
  }
} catch (error) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const category =
    message.includes("password authentication failed") ? "authentication_failed"
      : message.includes("database") && message.includes("does not exist") ? "database_not_found"
        : message.includes("role") && message.includes("does not exist") ? "role_not_found"
          : message.includes("fetch failed") ? "https_fetch_failed"
            : message.includes("endpoint") ? "endpoint_error"
              : message.includes("connection string") ? "connection_string_error"
                : "unclassified";
  const source = error && typeof error === "object" && "sourceError" in error
    && error.sourceError && typeof error.sourceError === "object"
    ? error.sourceError
    : null;
  const safe = error && typeof error === "object" ? {
    error: error.constructor?.name ?? "DatabaseError",
    category,
    code: "code" in error && error.code ? String(error.code) : null,
    severity: "severity_local" in error
      ? String(error.severity_local ?? "")
      : "severity" in error ? String(error.severity ?? "") : null,
    syscall: "syscall" in error ? String(error.syscall) : null,
    sourceCode: source && "code" in source ? String(source.code) : null,
  } : {
    error: "DatabaseError", category, code: null, severity: null,
    syscall: null, sourceCode: null,
  };
  console.error(JSON.stringify(safe));
  process.exitCode = 1;
} finally {
  await close();
}
