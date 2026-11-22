class ApplicationController < ActionController::API
  include Pundit::Authorization

  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable
  # Cuando una policy de Pundit niega la acción, se responde 403.
  rescue_from Pundit::NotAuthorizedError, with: :forbidden

  private

  def authenticate!
    return if current_user

    render json: { error: "No autorizado" }, status: :unauthorized
  end

  # Pundit usa este método (pundit_user) para evaluar las policies.
  def current_user
    return @current_user if defined?(@current_user)

    @current_user = User.find_by(id: token_payload&.dig(:user_id))
  end

  def token_payload
    header = request.headers["Authorization"]
    return nil unless header&.start_with?("Bearer ")

    AuthToken.decode(header.split(" ", 2).last)
  end

  def not_found(_exception)
    render json: { error: "Recurso no encontrado" }, status: :not_found
  end

  def unprocessable(exception)
    render json: { errors: exception.record.errors.full_messages },
           status: :unprocessable_entity
  end

  def forbidden
    render json: { error: "No tienes permiso para esta acción" }, status: :forbidden
  end
end
