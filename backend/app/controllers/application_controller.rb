class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable

  private

  def authenticate!
    return if current_user

    render json: { error: "No autorizado" }, status: :unauthorized
  end

  def current_user
    return @current_user if defined?(@current_user)

    @current_user = User.find_by(id: token_payload&.dig(:user_id))
  end

  def token_payload
    header = request.headers["Authorization"]
    return nil unless header&.start_with?("Bearer ")

    AuthToken.decode(header.split(" ", 2).last)
  end

  def not_found(exception)
    render json: { error: "Recurso no encontrado" }, status: :not_found
  end

  def unprocessable(exception)
    render json: { errors: exception.record.errors.full_messages },
           status: :unprocessable_entity
  end
end
