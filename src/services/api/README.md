# API Layer

This directory houses modules that talk to Supabase and other external services. Each module should:

- Export async functions that encapsulate Supabase queries or RPC calls
- Normalize raw responses into the domain types defined under `src/types`
- Propagate typed errors so callers can present localized messages

Planned modules:
- `client.ts` – shared Supabase client + auth helpers
- `user.ts` – registration, login, profile retrieval
- `template.ts` – checklist template CRUD
- `dailyChecklist.ts` – daily record CRUD
- `log.ts` – activity log persistence
- `logger.ts` – existing demo logger utilities (kept for compatibility)
