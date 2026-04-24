# banco-horas

Microservico Node.js para banco de horas com arquitetura modular baseada em DDD, regras de dominio isoladas e adaptadores de infraestrutura para Express e Sequelize.

## Arquitetura

- `src/modules/banco-horas/domain`: entidades, contratos e servicos puros de dominio.
- `src/modules/banco-horas/application`: casos de uso da aplicacao.
- `src/modules/banco-horas/infrastructure`: adaptadores externos, incluindo persistencia Sequelize.
- `src/modules/banco-horas/presentation`: controllers HTTP.
- `src/shared`: bootstrap, configuracao e tratamento de erros.
- `src/shared/infrastructure/persistence/sequelize`: modelos e conexao Sequelize em TypeScript.

## Scripts

- `npm run dev`: sobe a API em modo desenvolvimento.
- `npm run build`: compila TypeScript para `dist`.
- `npm start`: executa a versao compilada.
- `npm run test:ci`: executa testes com cobertura.

## Deploy automatizado

O workflow de CI valida build e testes. O workflow de CD publica a imagem no GHCR e faz deploy automatico via SSH quando os secrets abaixo estiverem configurados:

- `DEPLOY_HOST`
- `DEPLOY_USERNAME`
- `DEPLOY_SSH_KEY`
- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`

## Variaveis de ambiente

- `PORT`
- `HTTPS_PORT`
- `ENABLE_HTTPS`
- `HTTPS_KEY_PATH`
- `HTTPS_CERT_PATH`
- `DB_CONFIG_ENV`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`