require "test_helper"

module Api
  module V1
    class ExpensesTest < ActionDispatch::IntegrationTest
      setup do
        @usuario = users(:natalia)
        @ajeno = users(:comerciante)
      end

      test "index requiere autenticacion" do
        get "/api/v1/expenses"
        assert_response :unauthorized
      end

      test "index lista solo los gastos propios" do
        Expense.create!(user: @ajeno, amount: 9999, spent_on: Date.current)

        get "/api/v1/expenses", headers: auth_header(@usuario)

        assert_response :success
        montos = response.parsed_body["expenses"].map { |g| g["amount"] }
        assert_not_includes montos, 9999
      end

      test "index incluye el resumen presupuestario" do
        get "/api/v1/expenses", headers: auth_header(@usuario)

        resumen = response.parsed_body["summary"]
        assert_equal 3500, resumen["total_gastado"]
        assert resumen["dias_restantes_mes"].positive?
      end

      test "index filtra por mes" do
        Expense.create!(user: @usuario, amount: 1000, spent_on: 2.months.ago)

        get "/api/v1/expenses",
            params: { month: Date.current.to_s },
            headers: auth_header(@usuario)

        assert_equal 1, response.parsed_body["expenses"].size
      end

      test "create registra el gasto y descuenta el saldo" do
        saldo_previo = @usuario.current_balance

        assert_difference "Expense.count", 1 do
          post "/api/v1/expenses",
               params: { expense: { amount: 2000, description: "Once", spent_on: Date.current } },
               headers: auth_header(@usuario), as: :json
        end

        assert_response :created
        assert_equal saldo_previo - 2000, @usuario.reload.current_balance
      end

      test "create acepta gasto sin menu_item" do
        post "/api/v1/expenses",
             params: { expense: { amount: 1500, spent_on: Date.current } },
             headers: auth_header(@usuario), as: :json

        assert_response :created
        assert_nil response.parsed_body["menu_item_id"]
      end

      test "create rechaza monto cero" do
        post "/api/v1/expenses",
             params: { expense: { amount: 0, spent_on: Date.current } },
             headers: auth_header(@usuario), as: :json

        assert_response :unprocessable_entity
      end

      test "el saldo nunca queda negativo" do
        post "/api/v1/expenses",
             params: { expense: { amount: 999_999, spent_on: Date.current } },
             headers: auth_header(@usuario), as: :json

        assert_response :created
        assert_equal 0, @usuario.reload.current_balance
      end

      test "destroy devuelve el monto al saldo" do
        gasto = expenses(:almuerzo_lunes)
        saldo_previo = @usuario.current_balance

        delete "/api/v1/expenses/#{gasto.id}", headers: auth_header(@usuario)

        assert_response :no_content
        assert_equal saldo_previo + gasto.amount, @usuario.reload.current_balance
      end

      test "no permite ver un gasto ajeno" do
        gasto = Expense.create!(user: @ajeno, amount: 5000, spent_on: Date.current)

        get "/api/v1/expenses/#{gasto.id}", headers: auth_header(@usuario)

        assert_response :not_found
      end

      test "no permite eliminar un gasto ajeno" do
        gasto = Expense.create!(user: @ajeno, amount: 5000, spent_on: Date.current)

        assert_no_difference "Expense.count" do
          delete "/api/v1/expenses/#{gasto.id}", headers: auth_header(@usuario)
        end

        assert_response :not_found
      end

      private

      def auth_header(user)
        { "Authorization" => "Bearer #{AuthToken.encode(user)}" }
      end
    end
  end
end
