# Autorización de locales:
# - Restricción por propiedad: el dueño gestiona su local.
# - Restricción por rol: un administrador gestiona cualquier local.
# Cualquier otro usuario autenticado recibe 403.
class RestaurantPolicy < ApplicationPolicy
  def update?
    admin? || propietario?
  end

  def destroy?
    update?
  end

  private

  def propietario?
    record.user_id == user&.id
  end
end
