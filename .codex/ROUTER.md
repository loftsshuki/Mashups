# Codex router

Read this before broad exploration. Open only the section relevant to the task.

- App/runtime work → `app/`
- Routes/pages → `app/src/app/`
- UI/components → `app/src/components/`
- Shared logic/integrations → `app/src/lib/`
- Tests → `app/tests/` and nearby test files
- Package commands/dependencies → `app/package.json`
- Usage/tooling → `.codex/RTK.md` and `.codex/USAGE.md`

Fast verification:
- lint: `cd app && npm run lint`
- types: `cd app && npm run typecheck`
- unit: `cd app && npm test`
- build only when warranted: `cd app && npm run build`
- E2E only for affected flows: `cd app && npm run test:e2e`
