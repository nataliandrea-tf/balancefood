module Api
  module V1
    class ExpensesController < ApplicationController
      before_action :authenticate!
      before_action :set_expense, only: [ :show, :update, :destroy ]

      def index
        gastos = current_user.expenses
        gastos = gastos.for_month(Date.parse(params[:month])) if params[:month].present?

        render json: {
          expenses: gastos.order(spent_on: :desc).map { |g| expense_json(g) },
          summary: resumen(gastos)
        }
      end

      def show
        render json: expense_json(@expense)
      end

      def create
        gasto = current_user.expenses.build(expense_params)

        if gasto.save
          render json: expense_json(gasto), status: :created
        else
          render json: { errors: gasto.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      def update
        if @expense.update(expense_params)
          render json: expense_json(@expense)
        else
          render json: { errors: @expense.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      def destroy
        @expense.destroy
        head :no_content
      end

      private

      def set_expense
        @expense = current_user.expenses.find(params[:id])
      end

      def expense_params
        params.require(:expense).permit(:amount, :description, :spent_on, :menu_item_id)
      end

      def expense_json(gasto)
        gasto.slice(:id, :amount, :description, :spent_on, :menu_item_id)
      end

      def resumen(gastos)
        total = gastos.sum(:amount)
        saldo = current_user.current_balance

        {
          total_gastado: total,
          saldo_actual: saldo,
          dias_restantes_mes: dias_restantes,
          presupuesto_diario: saldo && dias_restantes.positive? ? saldo / dias_restantes : nil
        }
      end

      def dias_restantes
        (Date.current.end_of_month - Date.current).to_i + 1
      end
    end
  end
end
