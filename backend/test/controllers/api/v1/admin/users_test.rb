require "test_helper"

module Api
  module V1
    module Admin
      class UsersTest < ActionDispatch::IntegrationTest
        setup do
          @admin = users(:admin)
          @estudiante = users(:natalia)
        end

        test "un admin puede listar los usuarios" do
          get "/api/v1/admin/users", headers: auth_header(@admin)

          assert_response :success
          assert_operator response.parsed_body.size, :>=, 2
        end

        test "un estudiante recibe 403" do
          get "/api/v1/admin/users", headers: auth_header(@estudiante)

          assert_response :forbidden
        end

        test "sin token recibe 401" do
          get "/api/v1/admin/users"

          assert_response :unauthorized
        end

        private

        def auth_header(user)
          { "Authorization" => "Bearer #{AuthToken.encode(user)}" }
        end
      end
    end
  end
end
