# Policy base de Pundit: por defecto niega todo. Cada policy concreta habilita
# solo las acciones que correspondan.
class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    false
  end

  def show?
    false
  end

  def create?
    false
  end

  def update?
    false
  end

  def destroy?
    false
  end

  def admin?
    user&.admin?
  end
end
