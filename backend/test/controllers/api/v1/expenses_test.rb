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

      test "rechaza un gasto que supera el saldo disponible" do
        post "/api/v1/expenses",
             params: { expense: { amount: 999_999, spent_on: Date.current } },
             headers: auth_header(@usuario), as: :json

        assert_response :unprocessable_entity
        assert_equal 32000, @usuario.reload.current_balance
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

      test "index con month malformado responde 400" do
        get "/api/v1/expenses", params: { month: "abc" },
                                headers: auth_header(@usuario)

        assert_response :bad_request
        assert_equal "Parámetro month inválido. Usa el formato AAAA-MM",
                     response.parsed_body["error"]
      end

      test "create con menu_item inexistente responde 422" do
        post "/api/v1/expenses",
             params: { expense: { amount: 1000, spent_on: Date.current, menu_item_id: 999_999 } },
             headers: auth_header(@usuario), as: :json

        assert_response :unprocessable_entity
        assert_includes response.parsed_body["errors"], "Menu item no existe"
        assert_equal 32000, @usuario.reload.current_balance
      end

      test "index con month como arreglo responde 400" do
        get "/api/v1/expenses", params: { month: [ "x" ] },
                                headers: auth_header(@usuario)

        assert_response :bad_request
      end

      test "index con mes imposible responde 400" do
        get "/api/v1/expenses", params: { month: "2024-13" },
                                headers: auth_header(@usuario)

        assert_response :bad_request
      end

      test "index con solo un número responde 400" do
        get "/api/v1/expenses", params: { month: "12" },
                                headers: auth_header(@usuario)

        assert_response :bad_request
      end

      test "update con menu_item inexistente responde 422" do
        gasto = expenses(:almuerzo_lunes)

        patch "/api/v1/expenses/#{gasto.id}",
              params: { expense: { menu_item_id: 999_999 } },
              headers: auth_header(@usuario), as: :json

        assert_response :unprocessable_entity
        assert_equal menu_items(:menu_dia).id, gasto.reload.menu_item_id
      end

        test "sin month, el resumen usa solo el mes actual" do
        Expense.create!(user: @usuario, amount: 1000, spent_on: 2.months.ago.to_date)

        get "/api/v1/expenses", headers: auth_header(@usuario)

        assert_equal 2, response.parsed_body["expenses"].size
        assert_equal 3500, response.parsed_body["summary"]["total_gastado"]
      end


        test "con month, el resumen usa ese mes" do
        Expense.create!(user: @usuario, amount: 1000, spent_on: 2.months.ago.to_date)

        get "/api/v1/expenses", params: { month: 2.months.ago.strftime("%Y-%m") },
                                headers: auth_header(@usuario)

        assert_equal 1, response.parsed_body["expenses"].size
        assert_equal 1000, response.parsed_body["summary"]["total_gastado"]
      end

        test "con month sin gastos, el resumen es cero" do
        get "/api/v1/expenses", params: { month: "2020-01" },
                                headers: auth_header(@usuario)

        assert_equal 0, response.parsed_body["expenses"].size
        assert_equal 0, response.parsed_body["summary"]["total_gastado"]
      end

      private

      def auth_header(user)
        { "Authorization" => "Bearer #{AuthToken.encode(user)}" }
      end
    end
  end
end
