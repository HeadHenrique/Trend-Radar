# API Spec

## Supabase client

O frontend usa o Data API via `@supabase/supabase-js` com publishable key e JWT do usuário autenticado.

## Auth

Implementado:

- `signInWithPassword`;
- `signOut`;
- restauração de sessão;
- listener de mudança de sessão.

Não existe signup público na UI.

## Profiles Repository

Implementado em `src/features/profiles/repository.ts`:

```ts
listProfiles(params?)
createProfile(input)
updateProfile(id, input)
setProfileActive(id, active)
```

### Escrita humana

O cliente envia somente:

- instagram username;
- mercado;
- grupo;
- nicho;
- categoria;
- prioridade;
- tags;
- active.

Não envia campos operacionais/provider nem auditoria.

### Username

É normalizado em `normalizeInstagram.ts`.

Depois de existir `instagram_external_id`, o banco protege o username contra mudança pelo frontend.

### Estados

A página trata:

- loading;
- empty;
- error;
- success.

## Backend futuro

Campos provider serão atualizados por backend/n8n em etapa posterior, usando credencial server-side separada.
