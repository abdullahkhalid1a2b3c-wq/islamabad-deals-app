# Standing Rules for DealPlate Development

## Architecture & Code Guidelines

1. **Four-Layer Architecture**:
   - **Screens (`app/`)**: UI rendering and layout only. No direct network or DB calls.
   - **Hooks (`src/features/*`)**: Feature business logic and TanStack Query state wrappers.
   - **Services (`src/services/*`)**: All network/API/Supabase and mock DB calls. Screens must NEVER import the Supabase client directly.
   - **Mock Data (`src/services/mock/*`)**: Mock data sits behind the exact same TypeScript interfaces (`src/services/api/types.ts`) as real backend services.

2. **TypeScript Strictness**:
   - Strict mode enabled (`"strict": true`).
   - Explicit types required. Never use `any` without an inline comment explaining why it is strictly necessary.

3. **Theme & Design System**:
   - All colors, spacing, radii, typography, and shadows MUST be imported from `src/theme`.
   - Hard-coded hex/rgb colors, magic spacing numbers, or raw font definitions in components are strictly forbidden.

4. **Data Validation**:
   - All input and environment schemas must be validated with Zod in `src/validation`.

5. **Secrets & Security**:
   - No secrets or API keys in application code.
   - Only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` may be exposed client-side.
   - The Supabase `service_role` key must NEVER appear anywhere in the client codebase.

6. **Authentic UI & Coming Soon Labels**:
   - Never fake working functionality. Features not yet implemented must be clearly labeled with "Coming soon" or "Coming in a later step".

7. **Timezone & Date Logic**:
   - All time, date, and expiry calculations MUST use the `Asia/Karachi` timezone via helper functions in `src/utils/time.ts`.

8. **Task Completion Protocol**:
   - Every task MUST end by running type-check (`npm run typecheck`), linting (`npm run lint`), and tests (`npm test`). All errors must be fixed before declaring done.

9. **Summary**:
   - Summarize all files created and modified at the end of each task.
