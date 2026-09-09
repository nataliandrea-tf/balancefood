<div align="center">

# 🍽️ BalanceFood

### Optimiza tu Saldo JUNAEB

Plataforma web para la optimización del gasto alimentario estudiantil

![Rails](https://img.shields.io/badge/Ruby_on_Rails-8.1-CC0000?style=flat&logo=rubyonrails&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-63_passing-1D9E75?style=flat)
![Estado](https://img.shields.io/badge/Estado-Evaluación_1-1D9E75?style=flat)

**Universidad Tecnológica Metropolitana** · Facultad de Ingeniería · Escuela de Informática
Computación Web y Móvil · Campus Macul · Santiago de Chile, 2026

</div>

---

## 📌 El problema

Las plataformas oficiales de las concesionarias JUNAEB (Edenred, Pluxee) muestran el saldo disponible y el listado de locales en convenio, **pero no informan los precios reales de los menús**.

Esto obliga al estudiante a desplazarse físicamente para conocer las cartas, y provoca que el saldo mensual se agote antes de la siguiente recarga.

## 💡 La solución

BalanceFood es una capa de inteligencia complementaria sobre ese ecosistema:

| | Funcionalidad | Estado |
|:---:|---|:---:|
| 🏪 | **Catálogo con precios reales** de los menús de cada local | ✅ Evaluación 1 |
| 💸 | **Registro de consumos** con descuento automático del saldo | ✅ Evaluación 1 |
| 📉 | **Proyección presupuestaria**: cuánto puedes gastar por día hasta fin de mes | ✅ Evaluación 1 |
| 🎯 | **Motor recomendador** que cruza saldo remanente con menús costeables | 🔜 Evaluación 3 |
| 📍 | **Mapa de locales cercanos** con geolocalización | 🔜 Evaluación 2 |

## 👥 Equipo

| Integrante | GitHub | Rol Evaluación 1 |
|---|---|---|
| Natalia Torres Flores | [@nataliandrea-tf](https://github.com/nataliandrea-tf) | Tech Lead · desarrollo completo |

> **Nota sobre la modalidad.** La Tarea 0 se planificó como trabajo grupal de tres integrantes con rotación del rol de Tech Lead. Ante la ausencia de participación de los otros dos integrantes —situación informada al docente y verificable en el historial de commits— el desarrollo de la Evaluación 1 fue autorizado en modalidad individual.
>
> Por esa razón los Pull Requests figuran autoaprobados: el flujo de ramas, PR y revisión se mantuvo íntegro, pero no existió otro integrante activo que ejerciera el Code Review.

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | Ruby 3.3.7 · Ruby on Rails 8.1.3 (modo API) |
| **Autenticación** | `has_secure_password` (bcrypt) + `ActiveSupport::MessageVerifier` |
| **Frontend Web** | React 19 · JavaScript · Vite 8 · React Router 7 |
| **Base de datos** | PostgreSQL 16 |
| **Testing** | Minitest (63 tests: unitarios e integración) |
| **Calidad** | RuboCop · Brakeman · bundler-audit · ESLint |
| **Servidor** | Puma · Thruster · Docker |
| **CI/CD** | Jenkins ([job](https://jenkins.frubilarz.cl/job/balancefood-backend/)) |
| **Control de versiones** | Git · GitHub |

> El frontend se implementó en JavaScript y no en TypeScript, como preveía la Tarea 0. El enunciado admite ambas opciones; se priorizó velocidad de desarrollo dada la modalidad individual.

## 🏗️ Arquitectura

```
┌─────────────────────────┐
│   Frontend — React 19   │   Vite · React Router · Context API
│   localhost:5173        │   Sin lógica de negocio
└───────────┬─────────────┘
            │
            │  REST / JSON
            │  Authorization: Bearer <token>
            ▼
┌─────────────────────────┐
│   Backend — Rails 8.1   │   API REST · modo API (sin vistas)
│   localhost:3000        │   Validaciones · reglas de negocio
└───────────┬─────────────┘
            │
            │  Active Record
            ▼
┌─────────────────────────┐
│      PostgreSQL 16      │   Claves foráneas · índices
└─────────────────────────┘
```

**Responsabilidades de cada capa**

- **Frontend.** Renderiza vistas, valida formularios antes de enviar y gestiona el estado de sesión. Todo el acceso HTTP pasa por un único módulo (`src/api/client.js`) que adjunta el token, traduce los errores de la API a mensajes legibles y captura fallos de red.
- **Backend.** Expone la API REST versionada bajo `/api/v1`, valida los datos, aplica las reglas de negocio y controla el acceso a los recursos. Es la única frontera de seguridad real del sistema.
- **Base de datos.** Garantiza integridad referencial mediante claves foráneas y restricciones, independientemente de lo que haga la aplicación.

## 🗃️ Modelo de datos

```
   User ──1:N──> Restaurant ──1:N──> MenuItem
     │                                   │
     │ 1:N                               │ 1:N
     ▼                                   ▼
  Expense <───────── N:1 (opcional) ─────┘
```

| Entidad | Campos | Notas |
|---|---|---|
| `User` | `email` (único), `password_digest`, `name`, `monthly_balance`, `current_balance` | Correo normalizado a minúsculas |
| `Restaurant` | `name`, `address`, `campus`, `category`, `description`, `user_id` | Pertenece al usuario que lo publica |
| `MenuItem` | `restaurant_id`, `name`, `description`, `price`, `category`, `available` | `available` por defecto `true` |
| `Expense` | `user_id`, `menu_item_id` (nulable), `amount`, `description`, `spent_on` | Índice compuesto `[user_id, spent_on]` |

**Decisiones de modelado**

- **Montos como enteros.** El peso chileno no tiene decimales. Usar `decimal` o `float` introduciría errores de redondeo sin representar nada real.
- **`menu_item` opcional en `Expense`.** Un estudiante puede registrar un consumo en un local que no está en el catálogo; el gasto sigue siendo válido.
- **`dependent: :nullify` al eliminar un plato.** Los gastos históricos se conservan y quedan desvinculados: el consumo ya ocurrió, y que el local retire el plato de su carta no borra el hecho.
- **Índice compuesto `[user_id, spent_on]`.** La consulta central del sistema es "gastos de este usuario en este mes"; sin el índice, PostgreSQL recorre la tabla completa.

## 🔌 API REST

Todos los endpoints cuelgan de `/api/v1`. La versión en la ruta permite evolucionar el contrato sin romper clientes ya desplegados (relevante para la app Flutter de la Evaluación 2).

### Autenticación

| Método | Ruta | Auth | Descripción |
|---|---|:---:|---|
| `POST` | `/auth/signup` | — | Registro. Devuelve usuario y token |
| `POST` | `/auth/login` | — | Inicio de sesión. Devuelve usuario y token |
| `DELETE` | `/auth/logout` | ✅ | Cierre de sesión |
| `GET` | `/auth/me` | ✅ | Datos del usuario autenticado |

### Locales

| Método | Ruta | Auth | Descripción |
|---|---|:---:|---|
| `GET` | `/restaurants` | — | Listado. Filtros: `campus`, `category` |
| `GET` | `/restaurants/:id` | — | Detalle con su carta de menús |
| `POST` | `/restaurants` | ✅ | Crear |
| `PATCH` | `/restaurants/:id` | ✅ | Actualizar (solo propios) |
| `DELETE` | `/restaurants/:id` | ✅ | Eliminar (solo propios) |

### Platos

| Método | Ruta | Auth | Descripción |
|---|---|:---:|---|
| `GET` | `/restaurants/:id/menu_items` | — | Carta. Filtros: `max_price`, `available` |
| `POST` | `/restaurants/:id/menu_items` | ✅ | Crear en local propio |
| `GET` | `/menu_items/:id` | — | Detalle |
| `PATCH` | `/menu_items/:id` | ✅ | Actualizar (solo propios) |
| `DELETE` | `/menu_items/:id` | ✅ | Eliminar (solo propios) |

### Gastos

| Método | Ruta | Auth | Descripción |
|---|---|:---:|---|
| `GET` | `/expenses` | ✅ | Listado propio + resumen. Filtro: `month` |
| `POST` | `/expenses` | ✅ | Registrar (descuenta del saldo) |
| `GET` | `/expenses/:id` | ✅ | Detalle |
| `PATCH` | `/expenses/:id` | ✅ | Actualizar |
| `DELETE` | `/expenses/:id` | ✅ | Eliminar (devuelve el monto al saldo) |

### Códigos HTTP

| Código | Cuándo |
|---|---|
| `200` | Lectura o actualización exitosa |
| `201` | Recurso creado |
| `204` | Eliminación exitosa, sin contenido |
| `401` | Token ausente, inválido o expirado |
| `404` | Recurso inexistente o perteneciente a otro usuario |
| `422` | Datos que no superan las validaciones |

## 🔐 Autenticación

El servidor firma un token con `ActiveSupport::MessageVerifier` que contiene el `user_id` y expira a las 24 horas. El cliente lo envía en cada petición mediante la cabecera `Authorization: Bearer <token>`.

**El servidor no almacena sesiones.** Verifica la firma con la clave secreta de la aplicación. El contenido del token es legible —Base64 no es cifrado— pero no es falsificable sin esa clave.

Se optó por `MessageVerifier` en lugar de una gem de JWT para no incorporar dependencias externas adicionales, dado que el pipeline ejecuta `bundler-audit` sobre todas las gems del proyecto.

**Cierre de sesión.** Un token firmado no puede invalidarse sin mantener estado en el servidor. El logout consiste en que el cliente descarte su token; es la contrapartida de no almacenar sesiones.

**Aislamiento de recursos.** Las acciones de escritura resuelven el recurso partiendo del usuario autenticado (`current_user.restaurants.find(...)`), lo que genera un `WHERE user_id = ? AND id = ?`. Un usuario que intenta modificar un recurso ajeno recibe `404`, no `403`: no se le confirma que el recurso existe.

> Los roles y permisos diferenciados no forman parte del alcance de la Evaluación 1 (punto 21.2 del enunciado) y serán incorporados en la Evaluación 2. Lo implementado aquí es propiedad de recursos, derivada de las relaciones del modelo.

## 🚀 Instalación y ejecución

### Requisitos

- Ruby 3.3.7 (la versión exacta que usa el pipeline; ver `backend/.ruby-version`)
- Node.js 22 o superior
- PostgreSQL 16

> En Windows se recomienda WSL2 con Ubuntu 24.04. Ruby 3.3.7 no compila correctamente sobre Ubuntu 26.04 por incompatibilidades de GCC 15 y OpenSSL 3.5.

### Backend

```bash
cd backend
bundle install
bin/rails db:create db:migrate
bin/rails server
```

Disponible en `http://localhost:3000`. Verificar con `http://localhost:3000/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Disponible en `http://localhost:5173`.

### Ejecutar los tests

```bash
cd backend
bin/rails test
```

63 tests: 19 unitarios de modelos y 44 de integración sobre los endpoints.

### Verificaciones de calidad

```bash
cd backend
bin/rubocop          # estilo de código
bin/brakeman         # vulnerabilidades en la aplicación
bin/bundler-audit    # vulnerabilidades en las gems
```

```bash
cd frontend
npm run lint
```

## ⚙️ Variables de entorno

### Backend

| Variable | Requerida | Por defecto | Descripción |
|---|:---:|---|---|
| `CORS_ORIGINS` | No | `http://localhost:5173` | Orígenes autorizados, separados por coma |
| `DATABASE_URL` | Solo producción | — | Cadena de conexión a PostgreSQL |
| `RAILS_MASTER_KEY` | Solo producción | — | Contenido de `config/master.key` |

En desarrollo, `config/database.yml` omite el usuario y toma el del sistema operativo, por lo que no requiere configuración adicional.

`config/master.key` no está versionado (figura en `.gitignore`). Descifra `config/credentials.yml.enc`, donde vive `secret_key_base`, que a su vez firma los tokens de autenticación.

### Frontend

| Variable | Requerida | Por defecto | Descripción |
|---|:---:|---|---|
| `VITE_API_URL` | No | `http://localhost:3000/api/v1` | URL base de la API. Vite la incrusta en el bundle al compilar (ver `frontend/.env.example`); en producción el pipeline la fija en `https://apibalancefood.frubilarz.cl/api/v1` |

## 🌐 Producción

| Recurso | URL |
|---|---|
| API | <https://apibalancefood.frubilarz.cl> |
| Health check | <https://apibalancefood.frubilarz.cl/health> |
| Frontend | <https://balancefood.frubilarz.cl> |

### Credenciales de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| _pendiente_ | | |

## 📂 Estructura del repositorio

```
balancefood/
├── backend/          # API REST en Ruby on Rails
│   ├── app/
│   │   ├── controllers/api/v1/   # Controladores versionados
│   │   ├── models/               # Entidades y reglas de negocio
│   │   └── services/             # AuthToken
│   ├── config/
│   ├── db/migrate/               # Migraciones
│   └── test/                     # 63 tests
├── frontend/         # Aplicación web en React
│   └── src/
│       ├── api/                  # Cliente HTTP centralizado
│       ├── context/              # Estado de sesión
│       └── pages/                # Vistas por ruta
├── mobile/           # Aplicación en Flutter (Evaluación 2)
└── Jenkinsfile       # Pipeline de CI/CD
```

## 🌿 Flujo de trabajo

Nadie trabaja directo sobre `main`. Una rama por funcionalidad, Pull Request con descripción de las decisiones técnicas, y merge tras la revisión.

```bash
git checkout main && git pull origin main
git checkout -b feature/nombre-funcionalidad
# ... commits pequeños y descriptivos ...
git push -u origin feature/nombre-funcionalidad
```

Los mensajes de commit siguen [Conventional Commits](https://www.conventionalcommits.org/es/): un tipo (`feat`, `fix`, `docs`, `chore`), un ámbito entre paréntesis y una descripción en imperativo. El cuerpo explica el *porqué* de la decisión, no el *qué* del cambio.

**El despliegue sale de la rama `production`, no de `main`.** Para publicar se abre un Pull Request de `main` hacia `production`; el pipeline detecta la rama y ejecuta el despliegue.

## 🤖 Uso de Inteligencia Artificial

Se utilizó Claude (Anthropic) como herramienta de apoyo durante el desarrollo, en las modalidades que autoriza el punto 14 del enunciado: consulta de decisiones de diseño, generación de código base, explicación de mensajes de error y redacción de documentación.

Todo el código incorporado al proyecto fue revisado, ejecutado y verificado mediante la suite de tests antes de integrarse. Las decisiones técnicas documentadas en este README y en los Pull Requests corresponden a decisiones tomadas y comprendidas por la autora, y son defendibles individualmente.

Casos concretos donde el diagnóstico requirió comprensión propia del código:

- Rails 8 serializa los mensajes firmados en JSON, por lo que las claves del payload regresan como cadenas y no como símbolos. Esto hacía que `token_payload[:user_id]` devolviera `nil` y todo recurso protegido respondiera `401` pese a recibir un token válido. Se resolvió normalizando el payload con `with_indifferent_access` en el propio servicio, en lugar de parchear el controlador.
- Las llaves foráneas de PostgreSQL impedían eliminar un plato referenciado por un gasto. La solución no fue relajar la restricción sino definir la semántica correcta: el gasto histórico se conserva y se desvincula.

## ⚙️ CI/CD (Jenkins)

Job: <https://jenkins.frubilarz.cl/job/balancefood-backend/> (Multibranch Pipeline sobre este repo; cada rama y PR obtiene su propio pipeline a partir del `Jenkinsfile` de la raíz). Cubre `backend/` y `frontend/`; `mobile/` queda pendiente.

Etapas que corren en **todas las ramas**:

1. **Checkout**
2. **Test DB** — PostgreSQL efímero (`postgres:16-alpine`) en la red `course-net`
3. **Backend: Build & Test** — en `ruby:3.3.7-slim` (gems cacheadas en el volumen `balancefood-backend-bundle`)
   - **Install deps** — `bundle install`
   - **Lint** — `bin/rubocop`
   - **Security** — `bin/brakeman` + `bin/bundler-audit`
   - **Test** — `bin/rails db:test:prepare test`
4. **Frontend: Build & Test** — en `node:22-alpine` (cache de npm en el volumen `balancefood-frontend-npm`)
   - **npm ci**
   - **ESLint** — `npm run lint`. Mientras la app tenga errores de lint pendientes el stage queda **UNSTABLE** (amarillo) sin cortar el build; cuando se corrijan hay que volverlo bloqueante en el `Jenkinsfile`.
   - **Vite build** — `npm run build` con `VITE_API_URL=https://apibalancefood.frubilarz.cl/api/v1`
5. **Backend: Build image** — `docker build backend/`
6. **Frontend: Build image** — `docker build frontend/` (multi-stage: compila con Vite y sirve `dist/` con Nginx; `VITE_API_URL` va como `--build-arg` porque Vite la incrusta en el bundle)

Solo en la rama **`production`**, y solo si toda la CI anterior pasó:

7. **Backend: Deploy** — reemplaza el contenedor `balancefood-backend`, publicado en `127.0.0.1:4101`, con `CORS_ORIGINS=https://balancefood.frubilarz.cl`
8. **Backend: Health Check** — `curl -f http://127.0.0.1:4101/health` (hasta 240 s) y luego `https://apibalancefood.frubilarz.cl/health`
9. **Frontend: Deploy** — reemplaza el contenedor `balancefood-frontend`, publicado en `127.0.0.1:4103`
10. **Frontend: Health Check** — `curl -f http://127.0.0.1:4103/health`, comprueba que `/` devuelva el `index.html` de la SPA y luego `https://balancefood.frubilarz.cl/`

Las migraciones se ejecutan al arrancar el contenedor del backend mediante `bin/rails db:prepare`, no como una etapa separada del pipeline.

Dominios públicos (DNS → servidor de Jenkins; el reverse proxy del servidor apunta cada host a su puerto local):

| Servicio | Contenedor | Puerto local | Dominio |
|---|---|---|---|
| API Rails | `balancefood-backend` | `127.0.0.1:4101` | **https://apibalancefood.frubilarz.cl** |
| Web React | `balancefood-frontend` | `127.0.0.1:4103` | **https://balancefood.frubilarz.cl** |

Para desplegar: PR a `main` (CI en verde) y luego PR de `main` a `production`; el push a `production` dispara el deploy de ambos servicios en el mismo build.

### Credenciales requeridas en Jenkins (solo para deploy)

| ID | Tipo | Valor |
|---|---|---|
| `balancefood-backend-rails-master-key` | Secret text | contenido de `backend/config/master.key` (32 caracteres hex, sin salto de línea) |
| `balancefood-backend-database-url` | Secret text | `postgres://balancefood_backend_user:<password>@postgres:5432` |

Sin ellas el stage **Deploy** falla; las demás etapas no las necesitan.

Cómo crearlas: **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**, Kind = *Secret text*, Scope = *Global*, y en **ID** poner exactamente el ID de la tabla (el `Jenkinsfile` las busca por ese ID).

`backend/config/master.key` no está en git; es la llave que descifra `backend/config/credentials.yml.enc` (donde vive `secret_key_base`). Quien clone el repo sin la llave puede obtenerla de otro miembro del equipo o regenerar ambas con:

```bash
cd backend
rm config/credentials.yml.enc
bin/rails credentials:edit   # crea config/master.key + config/credentials.yml.enc nuevos
```

(Si se regeneran, hay que actualizar la credencial `balancefood-backend-rails-master-key` en Jenkins.)

### Base de datos de producción

En producción la app usa **cuatro bases** en el mismo PostgreSQL (Solid Cache / Queue / Cable): `balancefood_backend_production`, `balancefood_backend_production_cache`, `balancefood_backend_production_queue` y `balancefood_backend_production_cable`. `backend/config/database.yml` toma host, puerto, usuario y password de `DATABASE_URL` para las cuatro y descarta el nombre de base que traiga la URL. El contenedor las crea al arrancar (`bin/rails db:prepare`), así que el usuario de la URL necesita permiso `CREATEDB`, o hay que crearlas a mano antes del primer deploy.

En el servidor de Jenkins ya existe un PostgreSQL compartido (`postgres:16-alpine`) conectado a la red Docker `course-net`; su contenedor se llama `postgres`, y ese es el host de la URL. Provisión inicial, una sola vez, como superusuario (`docker exec -it postgres psql -U postgres`):

```sql
CREATE USER balancefood_backend_user WITH PASSWORD '<password>';
CREATE DATABASE balancefood_backend_production       OWNER balancefood_backend_user;
CREATE DATABASE balancefood_backend_production_cache OWNER balancefood_backend_user;
CREATE DATABASE balancefood_backend_production_queue OWNER balancefood_backend_user;
CREATE DATABASE balancefood_backend_production_cable OWNER balancefood_backend_user;
REVOKE ALL ON DATABASE balancefood_backend_production,
                       balancefood_backend_production_cache,
                       balancefood_backend_production_queue,
                       balancefood_backend_production_cable FROM PUBLIC;
```

### Reverse proxy (Nginx + Certbot)

Los contenedores solo escuchan en loopback (`127.0.0.1:4101` el backend, `127.0.0.1:4103` el frontend). Para exponerlos en sus dominios hace falta un server block en Nginx por cada uno y luego `certbot --nginx -d <dominio>`. Backend:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name apibalancefood.frubilarz.cl;
    location / {
        proxy_pass http://127.0.0.1:4101;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Frontend (`/etc/nginx/sites-available/balancefood.frubilarz.cl`, enlazado en `sites-enabled`):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name balancefood.frubilarz.cl;
    location / {
        proxy_pass http://127.0.0.1:4103;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d balancefood.frubilarz.cl
```

El Nginx que vive dentro del contenedor del frontend (`frontend/nginx.conf`) solo sirve los estáticos de Vite con fallback a `index.html` para las rutas de React Router; TLS y dominio los maneja el Nginx del servidor.

## 🚦 Estado del proyecto

| Hito | Alcance | Estado |
|---|---|:---:|
| **Tarea 0** | Propuesta y planificación | ✅ Aprobada |
| **Evaluación 1** | Web: API, base de datos, autenticación, 3 CRUD y deploy | 🟡 En desarrollo |
| **Evaluación 2** | Móvil: Flutter con geolocalización | ⚪ Pendiente |
| **Evaluación 3** | Calidad, testing, performance y DevOps | ⚪ Pendiente |

---

<div align="center">
<sub>Proyecto académico · UTEM 2026</sub>
</div>
