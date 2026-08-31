## Frontend Setup

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<replace_google_oauth_client_id>
NEXT_PUBLIC_PUSHER_KEY=<replace_pusher_key>
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<replace_vapid_public_key>
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
- Public registration creates a normal user; admins can promote users to Intifadah/internal role from role management.
- Realtime in-app notifications use Pusher when `NEXT_PUBLIC_PUSHER_*` and backend `PUSHER_*` values are configured.
- Background notifications use Web Push. The backend requires `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`; the frontend receives only `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Users enable it from the notification menu after installation or sign-in.
- Admin/User pages are connected to backend endpoints with loading/error UI states.

## Build Check

```bash
npx tsc --noEmit
npm run build
```
