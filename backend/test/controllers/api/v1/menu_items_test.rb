require "test_helper"

module Api
  module V1
    class MenuItemsTest < ActionDispatch::IntegrationTest
      setup do
        @local = restaurants(:casino_central)
        @dueno = users(:comerciante)
        @ajeno = users(:natalia)
      end

      test "index es publico y lista la carta del local" do
        get "/api/v1/restaurants/#{@local.id}/menu_items"

        assert_response :success
        assert_equal 2, response.parsed_body.size
      end

      test "index filtra por precio maximo" do
        get "/api/v1/restaurants/#{@local.id}/menu_items", params: { max_price: 2500 }

        assert_response :success
        assert_equal 1, response.parsed_body.size
        assert_equal "Completo italiano", response.parsed_body.first["name"]
      end

      test "index filtra los no disponibles" do
        menu_items(:completo).update!(available: false)

        get "/api/v1/restaurants/#{@local.id}/menu_items", params: { available: "true" }

        assert_response :success
        assert_equal 1, response.parsed_body.size
      end

      test "show devuelve un plato" do
        get "/api/v1/menu_items/#{menu_items(:menu_dia).id}"

        assert_response :success
        assert_equal 3500, response.parsed_body["price"]
      end

      test "create requiere autenticacion" do
        assert_no_difference "MenuItem.count" do
          post "/api/v1/restaurants/#{@local.id}/menu_items",
               params: { menu_item: { name: "Pirata", price: 100 } }, as: :json
        end

        assert_response :unauthorized
      end

      test "create agrega un plato al local propio" do
        assert_difference "MenuItem.count", 1 do
          post "/api/v1/restaurants/#{@local.id}/menu_items",
               params: { menu_item: { name: "Sopa", price: 1800 } },
               headers: auth_header(@dueno), as: :json
        end

        assert_response :created
        assert_equal @local.id, MenuItem.last.restaurant_id
      end

      test "create no permite agregar platos a un local ajeno" do
        assert_no_difference "MenuItem.count" do
          post "/api/v1/restaurants/#{@local.id}/menu_items",
               params: { menu_item: { name: "Pirata", price: 100 } },
               headers: auth_header(@ajeno), as: :json
        end

        assert_response :not_found
      end

      test "create rechaza precio invalido" do
        post "/api/v1/restaurants/#{@local.id}/menu_items",
             params: { menu_item: { name: "Gratis", price: 0 } },
             headers: auth_header(@dueno), as: :json

        assert_response :unprocessable_entity
      end

      test "update modifica un plato propio" do
        item = menu_items(:menu_dia)

        patch "/api/v1/menu_items/#{item.id}",
              params: { menu_item: { price: 3800 } },
              headers: auth_header(@dueno), as: :json

        assert_response :success
        assert_equal 3800, item.reload.price
      end

      test "update no permite modificar un plato ajeno" do
        item = menu_items(:menu_dia)

        patch "/api/v1/menu_items/#{item.id}",
              params: { menu_item: { price: 1 } },
              headers: auth_header(@ajeno), as: :json

        assert_response :not_found
        assert_equal 3500, item.reload.price
      end

      test "destroy elimina un plato propio" do
        assert_difference "MenuItem.count", -1 do
          delete "/api/v1/menu_items/#{menu_items(:completo).id}",
                 headers: auth_header(@dueno)
        end

        assert_response :no_content
      end

      test "destroy no permite eliminar un plato ajeno" do
        assert_no_difference "MenuItem.count" do
          delete "/api/v1/menu_items/#{menu_items(:completo).id}",
                 headers: auth_header(@ajeno)
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
