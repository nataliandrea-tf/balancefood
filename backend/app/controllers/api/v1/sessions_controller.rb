module Api
  module V1
    class SessionsController < ApplicationController
      before_action :authenticate!, only: [ :destroy, :me ]

      def create
        user = User.find_by(email: params[:email].to_s.strip.downcase)

        if user&.authenticate(params[:password])
          render json: { user: user_json(user), token: AuthToken.encode(user) }
        else
          render json: { error: "Correo o contraseña incorrectos" },
                 status: :unauthorized
        end
      end

      def destroy
        head :no_content
      end

      def me
        render json: { user: user_json(current_user) }
      end

      private

      def user_json(user)
        user.slice(:id, :email, :name, :monthly_balance, :current_balance)
      end
    end
  end
end
