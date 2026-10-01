# Ingestion POC — Etapa 3

## Objetivo

Validar a primeira coleta real ponta a ponta de metadados de um perfil monitorado:

```text
Supabase
→ n8n
→ Instagram Provider
→ normalização
→ Supabase
→ frontend
```

A POC foi limitada a metadados do perfil. Posts, snapshots, IA e Trend Engine ficaram fora do escopo.

## Projeto n8n

Projeto utilizado:

`Henrique Castro <head.henriquecastro@gmail.com>`

Workflow:

`Trend Radar — Profile Collector POC`

Workflow ID:

`BijTnAz2cSLTMzva`

Editor:

`https://henriquecastro.app.n8n.cloud/workflow/BijTnAz2cSLTMzva`

Estado final:

- DRAFT;
- não publicado;
- sem versão ativa;
- Manual Trigger;
- sem Schedule Trigger.

## Provider

Provider utilizado:

`Bright Data Instagram Profiles Scraper API`

Dataset ID utilizado:

`gd_l1vikfch901nx3by4`

Credential n8n:

- nome: `Trend Radar — Bright Data API`;
- tipo: `httpHeaderAuth`.

O valor do token não é armazenado no GitHub nem neste documento.

## Supabase

Projeto:

`zqwlyqnwcpddmknjnune`

Credential n8n:

- nome: `Supabase account`;
- tipo: `supabaseApi`.

A credencial server-side fica apenas no cofre do n8n.

## Estrutura do workflow

1. Manual Trigger.
2. Buscar um perfil `active=true` e `monitoring_status=pending`.
3. Disparar coleta do provider usando o username vindo do Supabase.
4. Confirmar que o provider aceitou a requisição.
5. Fazer polling limitado do snapshot.
6. Baixar o snapshot quando `ready`.
7. Normalizar para `InstagramProviderProfileResult`.
8. Confirmar que o username retornado corresponde ao solicitado.
9. Atualizar campos provider/operacionais no Supabase.
10. Em erro, marcar `monitoring_status=error` com mensagem sanitizada.

## Formato normalizado

```ts
type InstagramProviderProfileResult = {
  instagramUsername: string
  instagramExternalId: string | null
  displayName: string | null
  profilePictureUrl: string | null
  followersCount: number | null
  fetchedAt: string
}
```

Campos ausentes não são inventados.

## Retry e polling

Requests externos:

- retry limitado;
- máximo 3 tentativas;
- sem loop infinito.

Polling final:

- checagem 1 após 25s;
- checagem 2 após mais 25s;
- checagem 3 após mais 25s.

Timeout total do workflow:

`180 segundos`.

Na POC, a coleta real observada levou aproximadamente 59 segundos.

## Perfil da prova

Perfil:

`leonardofroese`

O username foi usado somente para a prova real. Depois da validação o draft foi generalizado e não contém esse username como regra permanente.

## Resultado real do provider

Resumo dos metadados usados:

- username correspondente: `leonardofroese`;
- external ID retornado: presente;
- nome público: presente;
- foto de perfil: presente;
- seguidores: `2766`;
- snapshot: 1 registro e 0 erros.

O provider devolveu campos extras além dos necessários. Esses campos não foram gravados em tabelas de negócio nem encaminhados para IA.

## Resultado normalizado

```text
instagramUsername = leonardofroese
instagramExternalId = 6280370116
displayName = Leonardo Froese | Lucro e Gestão Empresarial
profilePictureUrl = presente
followersCount = 2766
fetchedAt = 2026-10-01T00:44:08.107-03:00
```

## Campos atualizados no Supabase

Somente:

- `instagram_external_id`;
- `display_name`;
- `profile_picture_url`;
- `followers_count`;
- `monitoring_status`;
- `last_collected_at`;
- `next_collection_at`;
- `last_collection_error`.

Estado final observado:

```text
instagram_username = leonardofroese
followers_count = 2766
monitoring_status = healthy
last_collected_at = 2026-10-01 03:44:08.107+00
next_collection_at = 2026-10-01 09:44:08.144+00
last_collection_error = NULL
active = true
priority = 2
```

Campos humanos não foram alterados pelo collector.

## Política de next_collection_at

Para a POC:

- prioridade 1 → +1h;
- prioridade 2 → +6h;
- prioridade 3 → +24h.

O perfil usado possui prioridade 2, portanto recebeu +6h.

## Tratamento de erro validado

A segunda execução encontrou o snapshot ainda `running` após a janela inicial de polling.

O fluxo:

- marcou `monitoring_status = error`;
- gravou mensagem curta/sanitizada;
- não zerou followers;
- não removeu external ID anterior;
- não alterou campos humanos.

Após o snapshot ficar pronto, a mesma coleta foi retomada e o estado final passou para `healthy`, limpando `last_collection_error`.

## Execuções manuais

Quantidade total:

`3`

1. falha local no primeiro IF por tipagem booleana;
2. provider ainda `running` após ~45s, validando o caminho de erro;
3. snapshot existente reutilizado, coleta concluída e update real executado.

Foram disparadas somente duas coletas reais no provider; a terceira execução reutilizou o snapshot da segunda.

## Correções realizadas

- correção das condições booleanas dos IF nodes;
- aumento da janela de polling de 45s para 75s;
- reutilização do snapshot existente para evitar uma terceira coleta;
- remoção do username hardcoded da versão final do draft;
- organização visual do pipeline em grupo semântico.

## Segurança

Confirmado:

- nenhuma secret/service key no frontend;
- nenhuma credencial gravada em GitHub;
- documentação contém somente nomes e tipos de credencial;
- nodes HTTP usam credential do cofre do n8n;
- nenhum token foi colocado em parâmetros visíveis do node;
- nenhuma migration nova foi criada.

## Limitações

- workflow ainda é manual;
- não há Schedule Trigger;
- não há ingestão de posts;
- não há snapshots históricos;
- não há Trend Engine;
- a latência do provider pode ultrapassar a janela de polling em alguns casos;
- a recorrência e política definitiva de retry serão tratadas somente quando autorizadas.

## Próxima etapa

Não iniciada:

`ETAPA 3.1 — POSTS + SNAPSHOTS INICIAIS`
