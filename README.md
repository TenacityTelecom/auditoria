# auditoria

Microsserviço Node.js + TypeScript para registro e consulta de auditorias, seguindo a arquitetura **Routes → Controller → Service → Repository**.

## Estrutura

```
src/
├── app.ts                        # Bootstrap da aplicação
├── Routes/
│   ├── index.ts                  # Router raiz + health check
│   └── auditoria.routes.ts       # Rotas do módulo de auditoria
├── Controllers/
│   └── AuditoriaController.ts
├── Services/
│   └── AuditoriaService.ts
├── Repositories/
│   └── AuditoriaRepository.ts
├── Models/
│   └── Auditoria.ts              # Model Sequelize tipado
├── Middlewares/
│   └── errorHandler.ts           # Tratamento global de erros
├── errors/
│   └── AppError.ts               # Erro customizado com statusCode
└── database/
    └── sequelize.ts              # Conexão Sequelize
migrations/
└── 20260423000000-create-auditorias.js
tests/
└── unit/modules/
    ├── AuditoriaController.test.ts
    ├── AuditoriaService.test.ts
    └── AuditoriaRepository.test.ts
```

## Endpoints

### Health check

```
GET /health
```

### Salvar auditoria

```
POST /auditoria/store
Content-Type: application/json

{
  "ip": "192.168.1.1",
  "modulo": "usuarios",
  "autor": "joao.silva",
  "descricao": "Usuário realizou login",
  "dispositivo": "desktop",
  "navegador": "Chrome 123"
}
```

**Regras:**
- Todos os campos são obrigatórios.
- `dispositivo` aceita apenas `desktop` ou `mobile`.
- `modulo` é salvo em letras minúsculas automaticamente.

**Resposta de sucesso:** `201 Created`

```json
{
  "id": 1,
  "ip": "192.168.1.1",
  "modulo": "usuarios",
  "autor": "joao.silva",
  "descricao": "Usuário realizou login",
  "dispositivo": "desktop",
  "navegador": "Chrome 123",
  "created_at": "2026-04-24T00:00:00.000Z",
  "updated_at": "2026-04-24T00:00:00.000Z"
}
```

---

### Consultar auditorias

```
GET /auditoria?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD[&modulo=...][&usuario=...]
```

| Parâmetro    | Obrigatório | Descrição                      |
|--------------|-------------|--------------------------------|
| `data_inicio`| Sim         | Data inicial (formato YYYY-MM-DD) |
| `data_fim`   | Sim         | Data final (formato YYYY-MM-DD, inclui até 23:59:59) |
| `modulo`     | Não         | Filtra por módulo              |
| `usuario`    | Não         | Filtra por autor               |

**Exemplo:**
```
GET /auditoria?data_inicio=2026-01-01&data_fim=2026-01-31&modulo=usuarios&usuario=joao.silva
```

**Resposta de sucesso:** `200 OK` — array de auditorias ordenado por `created_at DESC`.

---

## Respostas de erro

| Status | Situação                              |
|--------|---------------------------------------|
| `400`  | Campos obrigatórios ausentes ou inválidos |
| `500`  | Erro interno do servidor              |

```json
{ "error": "Mensagem descritiva do erro." }
```

---

## Banco de dados

Tabela: `auditorias`

| Coluna       | Tipo           |
|--------------|----------------|
| `id`         | INT UNSIGNED PK AUTO_INCREMENT |
| `ip`         | VARCHAR(255)   |
| `modulo`     | VARCHAR(255)   |
| `autor`      | VARCHAR(255)   |
| `descricao`  | TEXT           |
| `dispositivo`| VARCHAR(255)   |
| `navegador`  | VARCHAR(255)   |
| `created_at` | DATETIME       |
| `updated_at` | DATETIME       |

Configuração em `config/config.json`. Para rodar a migration:

```bash
npx sequelize-cli db:migrate
```

---

## Scripts

| Comando           | Descrição                              |
|-------------------|----------------------------------------|
| `npm run dev`     | Sobe a API em modo desenvolvimento     |
| `npm run build`   | Compila TypeScript para `dist/`        |
| `npm start`       | Executa a versão compilada             |
| `npm test`        | Executa os testes unitários            |

A API sobe na porta `6777` por padrão (configurável via variável de ambiente `PORT`).
