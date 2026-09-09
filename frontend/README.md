# Frontend Web — React

SPA en React 19 con Vite. Consume la API mediante REST/JSON. No contiene lógica de negocio.

## Desarrollo

```bash
npm install
cp .env.example .env    # opcional: VITE_API_URL apunta por defecto a http://localhost:3000/api/v1
npm run dev             # http://localhost:5173
npm run lint
npm run build           # genera dist/
```

## Producción (Docker)

`Dockerfile` multi-stage: compila con Vite en `node:22-alpine` y sirve `dist/` con `nginx:alpine`
(`nginx.conf`: fallback a `index.html` para React Router y `/health` para el pipeline).
`VITE_API_URL` se fija en tiempo de build, por eso es un `--build-arg`:

```bash
docker build --build-arg VITE_API_URL=https://apibalancefood.frubilarz.cl/api/v1 -t balancefood-frontend .
docker run -d -p 4103:80 --name balancefood-frontend balancefood-frontend
```

El pipeline de Jenkins (`Jenkinsfile` en la raíz) hace exactamente esto y publica el contenedor en
`127.0.0.1:4103`, expuesto como <https://balancefood.frubilarz.cl>. Ver la sección CI/CD del README principal.

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
