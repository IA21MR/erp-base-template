# erp-base-template

Template base del ERP modular. Este repo es el **origen** del que parte el generador de proyectos: el generador lo clona, recorta módulos no elegidos, aplica branding y produce un repo nuevo por cliente.

## Qué contiene

- `app/` — Backend NestJS (DDD + hexagonal + plugin-system).
- `web/` — Frontend Next.js.

## Módulos del catálogo

Definidos en `app/src/shared/plugin-system/application/ModuleCatalog.ts`.

| Módulo | Tipo | Dependencias |
|---|---|---|
| `auth` | core | `users` |
| `users` | core | — |
| `organizations` | opcional | `users` |
| `contacts` | opcional | `users` |

Activación por proyecto: `app/src/modules.config.ts` → `ACTIVE_MODULES`.

## Arranque local (desarrollo del template)

```powershell
cd app
npm install
cp .env.example .env
# editar .env con credenciales locales
npm run prisma:migrate:dev
npm run start:dev
```

## Roadmap

- [x] Fase 0.1: ModuleManifest + builder dinámico + AppModule refactor
- [ ] Fase 0.2: Fragmentación de `schema.prisma` por módulo
- [ ] Fase 0.3: Seeds por módulo
- [ ] Fase 0.4: Branding tokenizable (tailwind + theme config)
- [ ] Fase 1: Generador CLI
- [ ] Fase 2: Wizard UI
