<div align="center">

# 🍽️ BalanceFood

### Optimiza tu Saldo JUNAEB

Plataforma web y móvil para la optimización del gasto alimentario estudiantil

![Rails](https://img.shields.io/badge/Ruby_on_Rails-7-CC0000?style=flat&logo=rubyonrails&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Flutter](https://img.shields.io/badge/Flutter-Dart-02569B?style=flat&logo=flutter&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-Tarea_0-yellow?style=flat)

**Universidad Tecnológica Metropolitana** · Facultad de Ingeniería · Escuela de Informática
Computación Web y Móvil · Santiago de Chile, 2026

</div>

---

## 📌 El problema

Las plataformas oficiales de las concesionarias JUNAEB (Edenred, Pluxee) muestran el saldo disponible y el listado de locales en convenio, **pero no informan los precios reales de los menús**.

Esto obliga al estudiante a desplazarse físicamente para conocer las cartas, y provoca que el saldo mensual se agote antes de la siguiente recarga.

## 💡 La solución

BalanceFood es una capa de inteligencia complementaria sobre ese ecosistema:

| | Funcionalidad |
|:---:|---|
| 🏪 | **Catálogo con precios reales** de los menús de cada local en convenio |
| 🎯 | **Motor recomendador** que cruza tu saldo remanente con lo que puedes costear hoy |
| 📉 | **Proyección de gasto y alertas** antes de cruzar umbrales críticos |
| 🏷️ | **Vitrina de ofertas** para pymes cercanas a los campus |

## 👥 Equipo

| Integrante | GitHub | Evaluación 1 | Evaluación 2 | Evaluación 3 |
|---|---|:---:|:---:|:---:|
| Natalia Torres Flores | [@nataliandrea-tf](https://github.com/nataliandrea-tf) | 👑 Tech Lead | SE | SE |
| Bryan Alexis Avila Gatica | `@usuario` | SE | 👑 Tech Lead | SE |
| Ian Nicolás Tseng Pereira | `@usuario` | SE | SE | 👑 Tech Lead |

> El rol de Tech Lead rota en cada evaluación para que todos ejerzan liderazgo técnico.

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | Ruby 3.3 · Ruby on Rails 7 (API) · JWT · Pundit |
| **Frontend Web** | React 18 · TypeScript · Vite |
| **Base de datos** | PostgreSQL 16 |
| **Aplicación móvil** | Flutter · Dart |
| **Testing** | RSpec · Vitest |
| **Control de versiones** | Git · GitHub |
| **Gestión** | GitHub Projects |
| **CI/CD** | Jenkins ([jenkins.frubilarz.cl](https://jenkins.frubilarz.cl/job/balancefood-backend/)) |

## 📂 Estructura del repositorio

```
balancefood/
├── backend/      # API REST en Ruby on Rails      (Evaluación 1)
├── frontend/     # Aplicación web en React        (Evaluación 1)
├── mobile/       # Aplicación en Flutter          (Evaluación 2)
├── docs/         # Documentación del proyecto
└── .github/      # Plantillas de PR/issues y CI
```

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [📋 Propuesta y Planificación](docs/00-propuesta-y-planificacion.md) | Documento de entrega de la Tarea 0 |
| [🏗️ Arquitectura](docs/01-arquitectura.md) | Componentes, responsabilidades y decisiones |
| [🗃️ Modelo de datos](docs/02-modelo-de-datos.md) | Entidades, relaciones y diccionario |
| [🌿 Estrategia Git](docs/03-estrategia-git.md) | Ramas, commits, PR y Code Review |
| [📊 Tablero de trabajo](docs/04-tablero.md) | Configuración y uso de GitHub Projects |
| [📅 Planificación](docs/05-planificacion.md) | Cronograma, hitos y riesgos |
| [🤖 Uso de IA](docs/06-uso-de-ia.md) | Política y trazabilidad |

## 🚦 Estado del proyecto

| Hito | Alcance | Estado |
|---|---|:---:|
| **Tarea 0** | Propuesta y planificación | 🟡 En entrega |
| **Evaluación 1** | Web: API, base de datos, autenticación, CRUD y deploy | ⚪ Pendiente |
| **Evaluación 2** | Móvil: Flutter con geolocalización | ⚪ Pendiente |
| **Evaluación 3** | Calidad, testing, performance y DevOps | ⚪ Pendiente |

## 🤝 Cómo contribuir

Nadie trabaja directo sobre `main`. Una rama por funcionalidad, Pull Request y revisión de otro integrante.

```bash
git checkout main && git pull origin main
git checkout -b feature/nombre-funcionalidad
# ... commits pequeños y descriptivos ...
git push -u origin feature/nombre-funcionalidad
```

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para el detalle completo.

---

<div align="center">
<sub>Proyecto académico · UTEM 2026</sub>
</div>

## ⚙️ CI/CD (Jenkins)

Job: <https://jenkins.frubilarz.cl/job/balancefood-backend/> (Multibranch Pipeline sobre este
repo; cada rama y PR obtiene su propio pipeline a partir del `Jenkinsfile` de la raíz).
Por ahora cubre solo `backend/`.

Etapas que corren en **todas las ramas**:

1. **Checkout**
2. **Test DB** - PostgreSQL efímero (`postgres:16-alpine`) en la red `course-net`
3. **Install deps** - `bundle install` en `ruby:3.3.7-slim` (gems cacheadas en el volumen `balancefood-backend-bundle`)
4. **Lint** - `bin/rubocop`
5. **Security** - `bin/brakeman` + `bin/bundler-audit`
6. **Test** - `bin/rails db:test:prepare test`
7. **Build image** - `docker build backend/`

Solo en la rama **`production`**:

8. **Deploy** - reemplaza el contenedor `balancefood-backend`, publicado en `127.0.0.1:4101`
9. **Migrate** - `bin/rails db:migrate` dentro del contenedor
10. **Health Check** - `curl -f http://127.0.0.1:4101/health` y luego `https://apibalancefood.frubilarz.cl/health`

Dominio público: **https://apibalancefood.frubilarz.cl** (DNS -> servidor de Jenkins; el reverse
proxy del servidor debe apuntar ese host a `127.0.0.1:4101`).

### Credenciales requeridas en Jenkins (solo para deploy)

| ID | Tipo | Valor |
|---|---|---|
| `balancefood-backend-rails-master-key` | Secret text | contenido de `backend/config/master.key` (32 caracteres hex, sin salto de línea) |
| `balancefood-backend-database-url` | Secret text | `postgres://balancefood_backend_user:<password>@postgres:5432` (el nombre de base al final es opcional y se ignora, ver abajo) |

Sin ellas el stage **Deploy** falla; las demás etapas (todas las ramas) no las necesitan.

Cómo crearlas en Jenkins: **Manage Jenkins → Credentials → System → Global credentials →
Add Credentials**, Kind = *Secret text*, Scope = *Global*, y en **ID** poner exactamente el ID
de la tabla (el `Jenkinsfile` las busca por ese ID).

`backend/config/master.key` no está en git (está en `.gitignore`); es la llave que descifra
`backend/config/credentials.yml.enc` (donde vive `secret_key_base`). Quien tenga el repo clonado
sin la llave puede obtenerla de otro miembro del equipo o regenerar ambas con:

```bash
cd backend
rm config/credentials.yml.enc
bin/rails credentials:edit   # crea config/master.key + config/credentials.yml.enc nuevos
```

(Si se regeneran, hay que actualizar la credencial `balancefood-backend-rails-master-key` en Jenkins.)

### Base de datos de producción

En producción la app usa **cuatro bases** en el mismo PostgreSQL (Solid Cache / Queue / Cable):
`balancefood_backend_production`, `balancefood_backend_production_cache`,
`balancefood_backend_production_queue` y `balancefood_backend_production_cable`.
`backend/config/database.yml` toma host, puerto, usuario y password de `DATABASE_URL` para las
cuatro y descarta el nombre de base que traiga la URL. El contenedor las crea al arrancar
(`bin/rails db:prepare`), así que el usuario de la URL necesita permiso `CREATEDB`, o hay que
crearlas a mano antes del primer deploy.

En el servidor de Jenkins ya existe un PostgreSQL compartido (`postgres:16-alpine`) conectado a la
red Docker `course-net`; su contenedor se llama `postgres`, y ese es el host de la URL (la app corre
en la misma red). Provisión inicial, una sola vez, como superusuario
(`docker exec -it postgres psql -U postgres`):

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

El contenedor solo escucha en `127.0.0.1:4101`. Para exponerlo en `https://apibalancefood.frubilarz.cl`
(el DNS ya apunta al servidor) hace falta un server block en Nginx igual al de los otros
proyectos del curso y luego `certbot --nginx -d apibalancefood.frubilarz.cl`:

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

### Primer deploy

1. Crear las dos credenciales en Jenkins y la base/usuario en PostgreSQL (arriba).
2. Crear la rama `production` desde `main` y hacer push: `git checkout -b production && git push -u origin production`.
3. El Multibranch Pipeline detecta la rama y corre CI + Deploy + Migrate + Health Check.
4. Verificar: `curl https://apibalancefood.frubilarz.cl/health`.
