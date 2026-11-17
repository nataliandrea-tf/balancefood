module Api
  module V1
    class UsersController < ApplicationController
      def create
        user = User.new(user_params)

        if user.save
          render json: { user: user_json(user), token: AuthToken.encode(user) },
                 status: :created
        else
          render json: { errors: user.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:email, :name, :password,
                                     :monthly_balance, :current_balance)
      end

      def user_json(user)
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          monthly_balance: user.monthly_balance,
          current_balance: user.saldo_actual
        }
      end
    end
  end
end
