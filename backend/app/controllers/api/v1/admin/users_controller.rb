module Api
  module V1
    module Admin
      # Endpoint de administración: lista todos los usuarios del sistema.
      # Restringido por rol: authenticate! corta a los no autenticados (401) y
      # la UserPolicy (vía authorize) a los que no son admin (403).
      class UsersController < ApplicationController
        before_action :authenticate!

        def index
          authorize User, :index?

          usuarios = User.order(:name).map { |u| user_json(u) }
          render json: usuarios
        end

        private

        def user_json(user)
          {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        end
      end
    end
  end
end
