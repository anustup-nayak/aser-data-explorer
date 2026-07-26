# Contributing

This is an independent, source-linked explorer, not an official ASER Centre or Pratham product.
Contributions are welcome when they preserve analytical meaning, provenance, accessibility, and
the existing visual grammar.

## Development

1. Use Node.js 22 and `npm ci`.
2. Copy `.env.example` to `.env.local` and configure PostgreSQL.
3. Run `npm run dev`.
4. Before opening a pull request, run:

```bash
npx tsc --noEmit --incremental false
npm run lint
npm test
```

Data changes must also pass `npm run db:pg:verify` against the target database. Never add a value
without its official source URL, PDF page, unit, construct, and comparability designation. Do not
bundle ASER PDFs or marks unless you have explicit redistribution permission.

Keep pull requests focused. Explain the user-visible impact, analytical assumptions, tests, and
any source documents used. Do not commit credentials, generated builds, database dumps, or local
tool state.
