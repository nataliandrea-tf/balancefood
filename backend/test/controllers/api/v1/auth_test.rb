require "test_helper"

module Api
  module V1
    class AuthTest < ActionDispatch::IntegrationTest
      test "registro crea usuario y devuelve token" do
        assert_difference "User.count", 1 do
          post "/api/v1/auth/signup", params: {
            user: { email: "nueva@utem.cl", name: "Nueva", password: "secreta123" }
          }, as: :json
        end

        assert_response :created
        cuerpo = response.parsed_body
        assert cuerpo["token"].present?
        assert_equal "nueva@utem.cl", cuerpo["user"]["email"]
        assert_nil cuerpo["user"]["password_digest"]
      end

      test "registro rechaza email duplicado" do
        assert_no_difference "User.count" do
          post "/api/v1/auth/signup", params: {
            user: { email: "natalia@utem.cl", name: "Otra", password: "secreta123" }
          }, as: :json
        end

        assert_response :unprocessable_entity
        assert response.parsed_body["errors"].present?
      end

      test "registro rechaza datos invalidos" do
        post "/api/v1/auth/signup", params: {
          user: { email: "no-es-correo", name: "", password: "x" }
        }, as: :json

        assert_response :unprocessable_entity
      end

      test "login exitoso devuelve token" do
        post "/api/v1/auth/login", params: {
          email: "NATALIA@UTEM.CL", password: "secreta123"
        }, as: :json

        assert_response :success
        assert response.parsed_body["token"].present?
      end

      test "login rechaza contrasena incorrecta" do
        post "/api/v1/auth/login", params: {
          email: "natalia@utem.cl", password: "incorrecta"
        }, as: :json

        assert_response :unauthorized
      end

      test "login rechaza correo inexistente" do
        post "/api/v1/auth/login", params: {
          email: "nadie@utem.cl", password: "secreta123"
        }, as: :json

        assert_response :unauthorized
      end

      test "recurso protegido rechaza peticion sin token" do
        get "/api/v1/auth/me"
        assert_response :unauthorized
      end

      test "recurso protegido rechaza token invalido" do
        get "/api/v1/auth/me", headers: { "Authorization" => "Bearer inventado" }
        assert_response :unauthorized
      end

      test "recurso protegido acepta token valido" do
        get "/api/v1/auth/me", headers: auth_header(users(:natalia))

        assert_response :success
        assert_equal users(:natalia).id, response.parsed_body["user"]["id"]
      end

      test "logout responde sin contenido" do
        delete "/api/v1/auth/logout", headers: auth_header(users(:natalia))
        assert_response :no_content
      end

      private

      def auth_header(user)
        { "Authorization" => "Bearer #{AuthToken.encode(user)}" }
      end
    end
  end
end
