## Frontend Setup

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Run backend and frontend:

```bash
npm --prefix backend run start
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Integration

- Central API management lives in:
  - `src/lib/api/client.ts` (fetch wrapper + token refresh retry)
  - `src/lib/api/cache-store.ts` (Zustand query cache + TTL + invalidation)
  - `src/lib/api/query-keys.ts` (stable cache keys)
  - `src/lib/api/services/*` (separate endpoint functions)
  - `src/lib/api/types.ts` (typed contracts)
  - `src/lib/api/error.ts` (normalized error handling)
  - `src/lib/api/hooks.ts` (`useApiQuery`, `useApiMutation` with cache support)
- Query caching:
  - per-query `cacheKey` + `staleTimeMs`
  - in-flight request deduplication
  - targeted invalidation via keys/predicates
- Mutations:
  - supports optimistic cache updates
  - supports list/detail invalidation keys on success
- Auth is backend-driven through `src/contexts/AuthContext.tsx`.
- Admin/User pages are connected to backend endpoints with loading/error UI states.

## Build Check

```bash
npx tsc --noEmit
npm run build
```
