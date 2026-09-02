# Frontend Web — React

SPA en React 18 con TypeScript y Vite. Consume la API mediante REST/JSON. No contiene lógica de negocio.

## Inicialización (Evaluación 1)

```bash
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

## Estructura prevista

```
src/
├── api/          # Cliente HTTP y funciones por recurso
├── components/   # Componentes reutilizables
├── pages/        # Vistas asociadas a rutas
├── hooks/        # Lógica de estado reutilizable
├── context/      # Sesión y usuario autenticado
└── types/        # Tipos del contrato de la API
```

Ver [docs/01-arquitectura.md](../docs/01-arquitectura.md).
