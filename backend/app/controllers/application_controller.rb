class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable

  private

  def authenticate!
    return if current_user

    render json: { error: "No autorizado" }, status: :unauthorized
  end

  # Autorización por rol: solo un administrador pasa. Un usuario autenticado sin
  # el rol recibe 403; uno no autenticado ya fue cortado antes por authenticate!.
  def require_admin!
    return if current_user&.admin?

    render json: { error: "Acceso denegado" }, status: :forbidden
  end

  # Permite la acción solo al dueño del recurso o a un administrador.
  def autorizar_dueno_o_admin!(recurso)
    return if current_user&.admin? || recurso.user_id == current_user&.id

    render json: { error: "No tienes permiso para esta acción" }, status: :forbidden
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
