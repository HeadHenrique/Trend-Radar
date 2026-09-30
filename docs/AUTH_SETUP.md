# Auth Setup — First Internal Admin

## Status

The application uses Supabase Auth with email + password and has no public signup screen.

At the end of Stage 2 the project had zero Auth users, so no fake user was created.

## Recommended internal configuration

For an internal product, verify in the Supabase Auth settings that public self-signup is disabled.

The frontend must never expose an admin, secret, or service role key.

## Option A — Create the first user in the Supabase Dashboard

1. Open the Trend Radar project in Supabase.
2. Go to **Authentication → Users**.
3. Create the real internal user with their real e-mail and a password.
4. Copy the generated user UUID.
5. Assign the role from a trusted server/admin environment using the Admin API.
6. Sign out and sign back in after changing app metadata so the JWT contains the current role.

## Assign the role securely

Authorization uses:

`app_metadata.trend_radar_role`

Allowed values:

- `viewer`
- `editor`
- `admin`

Example one-off server-side script:

```ts
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

const { error } = await admin.auth.admin.updateUserById(
  process.env.TREND_RADAR_USER_ID!,
  {
    app_metadata: {
      trend_radar_role: 'admin',
    },
  },
)

if (error) throw error
```

Security rules for this script:

- run it only in a trusted server/local admin environment;
- never use a `VITE_*` variable for `SUPABASE_SERVICE_ROLE_KEY`;
- never commit the secret;
- never place the script with real credentials in the repository;
- remove temporary local credentials after use when appropriate.

## Option B — Create the first admin entirely through the Admin API

A trusted server/admin script may create the real user directly:

```ts
const { data, error } = await admin.auth.admin.createUser({
  email: process.env.TREND_RADAR_ADMIN_EMAIL!,
  password: process.env.TREND_RADAR_ADMIN_PASSWORD!,
  email_confirm: true,
  app_metadata: {
    trend_radar_role: 'admin',
  },
})
```

Do not hardcode the e-mail or password in the repository.

## Role behavior

### viewer

Can read monitored profiles.

### editor

Can read, create, and edit only human-controlled fields.

### admin

Has the same business-data permissions as editor in Stage 2 and is reserved for future administrative features.

### authenticated user without a valid role

RLS returns no access to business rows.

## Important

Role authorization is based on `app_metadata`, not `user_metadata`.

After changing `app_metadata`, refresh the session or sign in again so the new JWT contains the updated claim.
