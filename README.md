# Fastify Prisma API

API de autenticação construída com Fastify seguindo uma arquitetura em camadas.

## Visão Geral

A aplicação está organizada nos seguintes módulos:

- `domain`: entidades e contratos de repositório.
- `application`: casos de uso e regras de negócio.
- `infrastructure`: integrações externas (Prisma, criptografia e JWT).
- `presentation`: controllers HTTP.
- `main`: inicialização do Fastify, rotas e middlewares.

## Pré-requisitos

- Node.js 18+
- PostgreSQL (ou o banco compatível configurado no `.env`)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente no arquivo `.env` com as credenciais do banco e os segredos JWT:

   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_db?schema=public"
   JWT_SECRET="sua_chave_jwt"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_SECRET="sua_chave_refresh"
   JWT_REFRESH_EXPIRES_IN="7d"
   ```

3. Execute as migrações e a seed:

   ```bash
   npm run migrate
   npm run seed
   ```

## Execução

```bash
npm run dev
```

O servidor será iniciado por padrão em `http://localhost:3333`.

## Scripts Principais

- `npm run dev`: inicia o servidor em modo desenvolvimento com watch.
- `npm run build`: gera os artefatos compilados TypeScript.
- `npm run migrate`: executa `prisma migrate dev`.
- `npm run seed`: executa o seed configurado em `prisma/seed.ts`.

## Rotas de Autenticação

| Método | Caminho          | Descrição                 |
| ------ | ---------------- | ------------------------- |
| POST   | `/auth/register` | Cria um novo usuário      |
| POST   | `/auth/login`    | Autentica e gera tokens   |
| GET    | `/auth/profile`  | Retorna o perfil do usuário autenticado |
| POST   | `/auth/refresh`  | Gera novo token de acesso |

## Estrutura das Pastas

```
src/
  application/
  domain/
  infrastructure/
  main/
    middleware/
    routes/
  presentation/
    controllers/
    interfaces/
```

## Testes

```bash
npm test
```

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
