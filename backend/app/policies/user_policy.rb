# Acción restringida por rol: solo un administrador puede listar los usuarios.
class UserPolicy < ApplicationPolicy
  def index?
    admin?
  end
end
