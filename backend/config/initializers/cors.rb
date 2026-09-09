# Origenes permitidos para peticiones cross-origin (el frontend vive en otro dominio).
# En desarrollo Vite sirve en http://localhost:5173; en produccion el pipeline de Jenkins
# pasa CORS_ORIGINS=https://balancefood.frubilarz.cl al contenedor. Varios origenes: separados por coma.
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("CORS_ORIGINS", "http://localhost:5173").split(",")

    resource "*",
             headers: :any,
             methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
             expose: [ "Authorization" ]
  end
end
