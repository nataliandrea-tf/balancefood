# Backend — API REST

API en Ruby on Rails 7 (modo API) con PostgreSQL. Es la única fuente de verdad de la lógica de negocio: autenticación, autorización, validaciones y el cálculo del recomendador presupuestario.

## Inicialización (Evaluación 1)

```bash
rails new . --api --database=postgresql
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
