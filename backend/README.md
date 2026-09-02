# Backend — API REST

API en **Ruby on Rails 8.1** (modo API) con **PostgreSQL 16**. Es la única fuente de verdad de la
lógica de negocio: autenticación, autorización, validaciones y el cálculo del recomendador
presupuestario.

## Requisitos

- Ruby 3.3.7 (ver `.ruby-version`)
- PostgreSQL corriendo localmente (o `DATABASE_URL` apuntando a uno)
- Bundler

## Correr en local

```bash
cd backend
bundle install
bin/rails db:create db:migrate
bin/rails server
```

La API queda en `http://localhost:3000`.

Endpoints base:

- `GET /health` -> `200 {"status":"ok","service":"balancefood-backend","time":"..."}` (usado por el pipeline)
- `GET /up` -> health check por defecto de Rails
- `/api/v1/...` -> endpoints de negocio (por implementar)

## Tests, lint y seguridad

```bash
bin/rails test
bin/rubocop
bin/brakeman --no-pager
bin/bundler-audit
```

Con PostgreSQL en Docker (sin instalarlo localmente):

```bash
docker run -d --name balancefood-db -p 5433:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine
DATABASE_URL=postgres://postgres:postgres@localhost:5433 bin/rails db:test:prepare test
```

## Estructura prevista

```
app/
├── controllers/api/v1/   # Endpoints REST versionados
├── models/               # ActiveRecord: relaciones y validaciones
├── services/             # Lógica de negocio
├── policies/             # Autorización por rol (Pundit)
└── serializers/          # Contrato JSON de salida
```

Ver [docs/01-arquitectura.md](../docs/01-arquitectura.md).

## Docker

```bash
docker build -t balancefood-backend backend
docker run -d --name balancefood-backend -p 3000:80 \
  -e RAILS_MASTER_KEY=<contenido de backend/config/master.key> \
  -e DATABASE_URL=postgres://user:pass@host:5432/balancefood_backend_production \
  balancefood-backend
```

El contenedor escucha en el puerto **80** (Thruster delante de Puma).

## CI/CD

El pipeline vive en el `Jenkinsfile` de la raíz del repositorio. Ver el README principal,
sección **CI/CD (Jenkins)**.
