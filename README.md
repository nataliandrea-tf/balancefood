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
| **CI/CD** | GitHub Actions |

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