# US References Foundation

## Etapa 5.1

Objetivo:

criar a fundação mínima de referências US para que o pipeline automático existente forme uma base real de Reels dos Estados Unidos.

Nenhum collector foi executado manualmente.

## Estado antes do cadastro

- monitored_profiles = 3
- BR = 3
- US = 0
- collection_runs = 21
- instagram_posts = 60
- monitored_profile_posts = 60
- running collection_runs = 0

Perfis BR:

- leonardofroese
- raphaelcostaoficial
- helio.tatsuo

## Shortlist pesquisada

Foram avaliados seis candidatos públicos.

### 1. Alex Hormozi — @hormozi

Posicionamento:

- scaling;
- vendas;
- ofertas;
- marketing;
- crescimento empresarial.

Atividade:

- perfil público;
- alta frequência de conteúdo;
- forte uso de vídeo curto.

Qualidade para Orbit:

- excelente sinal para vendas/crescimento;
- muito ativo;
- forte como trendsetter.

Fontes:

- https://www.acquisition.com/
- https://linktr.ee/ahormozi
- https://www.instagram.com/hormozi/

### 2. Leila Hormozi — @leilahormozi

Posicionamento:

- liderança;
- contratação;
- cultura;
- gestão;
- sistemas operacionais.

Atividade:

- perfil público;
- conteúdo frequente;
- forte presença em vídeo curto/Reels.

Qualidade para Orbit:

- excelente para liderança e gestão;
- complementar a creators mais orientados a vendas/financeiro;
- alta utilidade para detectar formatos e assuntos de gestão.

Fontes:

- https://www.acquisition.com/
- https://leilahormozi.com/
- https://www.instagram.com/leilahormozi/

### 3. Codie Sanchez — @codiesanchez

Posicionamento:

- business ownership;
- small business acquisition;
- finanças;
- crescimento;
- estratégia.

Atividade:

- perfil público;
- conteúdo frequente;
- presença forte em Instagram e vídeo.

Qualidade para Orbit:

- excelente referência em empreendedorismo, aquisição e finanças empresariais;
- forte conexão com SMBs dos EUA.

Fontes:

- https://codiesanchez.com/
- https://www.contrarianthinking.co/
- https://linktr.ee/codiesanchez
- https://www.instagram.com/codiesanchez/

### 4. Chris Do — @thechrisdo

Posicionamento:

- marketing;
- vendas;
- branding;
- entrepreneurship;
- business management.

Atividade:

- perfil público;
- conteúdo recente e frequente;
- forte uso de conteúdo educacional curto.

Qualidade para Orbit:

- excelente para marketing/vendas/posicionamento;
- público empresarial e criativo.

Fontes:

- https://thefutur.com/
- https://www.instagram.com/thechrisdo/

### 5. Donald Miller — @donaldmiller

Posicionamento:

- StoryBrand;
- marketing;
- messaging;
- small business coaching.

Atividade:

- perfil público;
- presença social consolidada.

Qualidade para Orbit:

- boa referência para marketing e comunicação de negócios;
- menos amplo em gestão/operações.

Fontes:

- https://businessmadesimple.com/
- https://linktr.ee/donaldmiller
- https://www.instagram.com/donaldmiller/

### 6. Noah Kagan — @noahkagan

Posicionamento:

- empreendedorismo;
- marketing;
- crescimento;
- operação real de AppSumo.

Atividade:

- conteúdo recente em 2026;
- publica aprendizados operacionais e empresariais.

Qualidade para Orbit:

- boa referência prática de empreendedorismo e gestão;
- útil como sinal de founder/operator.

Fontes:

- https://noahkagan.com/
- https://www.instagram.com/noahkagan/

## Selecionados

### Leila Hormozi — @leilahormozi

Group:

`trendsetter`

Justificativa:

- frequência alta de conteúdo;
- forte uso de vídeo curto;
- temas recorrentes de liderança, gestão, cultura e operação;
- especialmente útil para detectar cedo formatos e argumentos em gestão empresarial.

Metadata cadastrada:

- primary_market_code = US
- profile_group = trendsetter
- niche = Liderança
- category = Gestão e Liderança Empresarial
- priority = 2
- tags:
  - liderança
  - gestão
  - cultura
  - processos
  - estratégia
- active = true

Provider fields deixados para o collector:

- instagram_external_id = NULL
- display_name = NULL
- profile_picture_url = NULL
- followers_count = NULL
- monitoring_status = pending
- last_collected_at = NULL
- next_collection_at = NULL

### Codie Sanchez — @codiesanchez

Group:

`reference`

Justificativa:

- benchmark consolidado em aquisição e crescimento de small businesses;
- forte orientação a business ownership, finanças e operação;
- complementa Leila sem duplicar o mesmo eixo editorial.

Metadata cadastrada:

- primary_market_code = US
- profile_group = reference
- niche = Empreendedorismo
- category = Aquisição e Crescimento de Negócios
- priority = 2
- tags:
  - empreendedorismo
  - financeiro
  - estratégia
  - gestão
  - aquisições
- active = true

Provider fields deixados para o collector:

- instagram_external_id = NULL
- display_name = NULL
- profile_picture_url = NULL
- followers_count = NULL
- monitoring_status = pending
- last_collected_at = NULL
- next_collection_at = NULL

## Capacidade operacional

Após o cadastro:

- monitored_profiles = 5
- BR = 3
- US = 2
- todos priority 2

Profile Collector:

- até 24 ticks/dia;
- priority 2 é due aproximadamente a cada 6h;
- pior caso teórico com 5 perfis: ~20 coletas/dia;
- cadência real observada é próxima de 7h por causa do alinhamento do schedule, o que reduz a demanda para ~17 coletas/dia.

Conclusão:

capacidade suficiente sem alterar scheduler.

Posts Collector:

- 6 ticks/dia;
- cada novo perfil US precisa 1 onboarding;
- depois, 1 coleta a cada 72h;
- 5 perfis em recorrência representam ~1,7 coletas/dia em média, além do onboarding inicial dos dois US.

Conclusão:

capacidade suficiente.

## Fluxo esperado

```text
US profile pending
→ Profile Collector automático
→ healthy
→ Posts Collector automático
→ posts_snapshot real
→ Reels aparecem em /trends > EUA
```

A Etapa 5.1 não aguardou esse fluxo terminar.

## Limites

- exatamente 2 perfis US cadastrados;
- nenhum terceiro perfil criado;
- nenhum collector executado manualmente;
- nenhum provider job manual;
- nenhum n8n alterado;
- nenhum schedule alterado;
- nenhum schema/migration;
- nenhuma IA;
- nenhum Brazil Gap.
