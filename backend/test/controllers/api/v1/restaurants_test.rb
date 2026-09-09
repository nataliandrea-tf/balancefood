require "test_helper"

module Api
  module V1
    class RestaurantsTest < ActionDispatch::IntegrationTest
      test "index es publico y lista los locales" do
        get "/api/v1/restaurants"

        assert_response :success
        assert_equal 1, response.parsed_body.size
      end

      test "index filtra por campus" do
        get "/api/v1/restaurants", params: { campus: "Inexistente" }

        assert_response :success
        assert_empty response.parsed_body
      end

      test "show incluye el menu del local" do
        get "/api/v1/restaurants/#{restaurants(:casino_central).id}"

        assert_response :success
        assert_equal 2, response.parsed_body["menu_items"].size
      end

      test "show responde 404 si el local no existe" do
        get "/api/v1/restaurants/999999"
        assert_response :not_found
      end

      test "create requiere autenticacion" do
        assert_no_difference "Restaurant.count" do
          post "/api/v1/restaurants", params: {
            restaurant: { name: "Pirata", address: "x", campus: "y" }
          }, as: :json
        end

        assert_response :unauthorized
      end

      test "create guarda el local del usuario autenticado" do
        assert_difference "Restaurant.count", 1 do
          post "/api/v1/restaurants",
               params: { restaurant: { name: "Nuevo", address: "Calle 1", campus: "Central" } },
               headers: auth_header(users(:natalia)), as: :json
        end

        assert_response :created
        assert_equal users(:natalia).id, Restaurant.last.user_id
      end

      test "create rechaza datos invalidos" do
        post "/api/v1/restaurants",
             params: { restaurant: { name: "" } },
             headers: auth_header(users(:natalia)), as: :json

        assert_response :unprocessable_entity
        assert response.parsed_body["errors"].present?
      end

      test "update modifica un local propio" do
        local = restaurants(:casino_central)

        patch "/api/v1/restaurants/#{local.id}",
              params: { restaurant: { description: "Actualizado" } },
              headers: auth_header(users(:comerciante)), as: :json

        assert_response :success
        assert_equal "Actualizado", local.reload.description
      end

      test "update no permite modificar un local ajeno" do
        local = restaurants(:casino_central)
        original = local.description

        patch "/api/v1/restaurants/#{local.id}",
              params: { restaurant: { description: "Hackeado" } },
              headers: auth_header(users(:natalia)), as: :json

        assert_response :not_found
        assert_equal original, local.reload.description
      end

      test "destroy elimina un local propio" do
        assert_difference "Restaurant.count", -1 do
          delete "/api/v1/restaurants/#{restaurants(:casino_central).id}",
                 headers: auth_header(users(:comerciante))
        end

        assert_response :no_content
      end

      test "destroy no permite eliminar un local ajeno" do
        assert_no_difference "Restaurant.count" do
          delete "/api/v1/restaurants/#{restaurants(:casino_central).id}",
                 headers: auth_header(users(:natalia))
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
