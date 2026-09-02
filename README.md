\# BalanceFood — Optimiza tu Saldo JUNAEB



Plataforma web y móvil para la optimización del gasto alimentario de estudiantes beneficiarios de la Beca de Alimentación JUNAEB.



\*\*Universidad Tecnológica Metropolitana — Facultad de Ingeniería — Escuela de Informática\*\*

Asignatura: Computación Web y Móvil · Santiago de Chile, 2026



\---



\## 1. Descripción



Las plataformas oficiales de las concesionarias JUNAEB (Edenred, Pluxee) muestran el saldo disponible y el listado de locales en convenio, pero no informan los precios reales de los menús. Esto obliga al estudiante a desplazarse físicamente para conocer las cartas y provoca que el saldo mensual se agote antes de la siguiente recarga.



BalanceFood es una capa de inteligencia complementaria sobre ese ecosistema. Entrega:



\- Catálogo público de locales con precios reales y verificables de sus menús.

\- Motor recomendador que cruza el saldo remanente con los menús costeables hoy.

\- Proyección de gasto y alertas de déficit antes de cruzar umbrales críticos.

\- Vitrina de ofertas para pymes cercanas a los campus universitarios.



\## 2. Equipo



| Integrante | GitHub | Rol E1 | Rol E2 | Rol E3 |

|---|---|---|---|---|

| Natalia Torres Flores | @nataliandrea-tf | Tech Lead | SE | SE |

| Bryan Alexis Avila Gatica | @usuario | SE | Tech Lead | SE |

| Ian Nicolás Tseng Pereira | @usuario | SE | SE | Tech Lead |



\## 3. Stack tecnológico



| Capa | Tecnología |

|---|---|

| Backend | Ruby 3.3 · Ruby on Rails 7 (modo API) · JWT |

| Frontend Web | React 18 · TypeScript · Vite |

| Base de datos | PostgreSQL 16 |

| Aplicación móvil | Flutter · Dart |

| Testing | RSpec · Vitest |

| Control de versiones | Git · GitHub |

| Gestión | GitHub Projects |

| CI/CD | GitHub Actions |



\## 4. Estructura del repositorio



```

balancefood/

├── backend/       # API REST en Ruby on Rails (Evaluación 1)

├── frontend/      # Aplicación web en React (Evaluación 1)

├── mobile/        # Aplicación Flutter (Evaluación 2)

├── docs/          # Documentación del proyecto

└── .github/       # Plantillas de PR/issues y workflows de CI

```



\## 5. Documentación



| Documento | Contenido |

|---|---|

| \[Tarea 0 — Propuesta y Planificación](docs/00-propuesta-y-planificacion.md) | Documento de entrega completo |

| \[Arquitectura](docs/01-arquitectura.md) | Componentes, responsabilidades y evolución |

| \[Modelo de datos](docs/02-modelo-de-datos.md) | Entidades, relaciones y diccionario |

| \[Estrategia Git](docs/03-estrategia-git.md) | Ramas, commits, Pull Requests y Code Review |

| \[Tablero de trabajo](docs/04-tablero.md) | Configuración y uso de GitHub Projects |

| \[Planificación](docs/05-planificacion.md) | Cronograma, hitos y responsabilidades |

| \[Uso de IA](docs/06-uso-de-ia.md) | Política y trazabilidad del uso de IA generativa |



\## 6. Estado del proyecto



| Hito | Alcance | Estado |

|---|---|---|

| Tarea 0 | Propuesta y planificación | En entrega |

| Evaluación 1 | Aplicación web (API + React + Auth + CRUD + Deploy) | Pendiente |

| Evaluación 2 | Aplicación móvil Flutter con geolocalización | Pendiente |

| Evaluación 3 | Calidad, testing, performance y DevOps | Pendiente |

