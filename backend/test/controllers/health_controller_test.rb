require "test_helper"

class HealthControllerTest < ActionDispatch::IntegrationTest
  test "GET /health responde 200 con status ok" do
    get "/health"

    assert_response :success
    body = response.parsed_body
    assert_equal "ok", body["status"]
    assert_equal "balancefood-backend", body["service"]
  end
end
