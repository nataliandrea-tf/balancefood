Rails.application.routes.draw do
  # Health check por defecto de Rails (200 si la app bootea sin excepciones).
  get "up" => "rails/health#show", as: :rails_health_check

  # Health check propio, usado por el pipeline de Jenkins.
  get "health" => "health#show", as: :health

  namespace :api do
    namespace :v1 do
      post "auth/signup", to: "users#create"
      post "auth/login", to: "sessions#create"
      delete "auth/logout", to: "sessions#destroy"
      get "auth/me", to: "sessions#me"

      resources :restaurants do
        resources :menu_items, only: [ :index, :create ]
      end

      resources :menu_items, only: [ :show, :update, :destroy ]
    end
  end
end
