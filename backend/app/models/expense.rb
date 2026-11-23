class Expense < ApplicationRecord
  # Registra en la tabla audits cada creación, edición y borrado del gasto
  # (quién lo hizo y qué cambió). Ver GET /expenses/:id/historial.
  audited

  belongs_to :user
  belongs_to :menu_item, optional: true

  validates :amount, presence: true,
                     numericality: { only_integer: true, greater_than: 0 }
  validates :spent_on, presence: true
  validate :no_supera_saldo
  validates :menu_item, presence: { message: "no existe" }, if: :menu_item_id?

  scope :for_month, ->(date) { where(spent_on: date.beginning_of_month..date.end_of_month) }

  private

  # El saldo no se guarda: se calcula como monto mensual menos los gastos del
  # mes (ver User#saldo_actual). Aquí solo validamos que el gasto no deje el
  # saldo del mes en negativo. Se excluye el propio gasto para que al editar su
  # monto se compare contra los demás gastos del mes, no contra sí mismo.
  def no_supera_saldo
    return if user.nil? || user.monthly_balance.nil? || amount.nil? || spent_on.nil?

    gastado = user.expenses.for_month(spent_on).where.not(id: id).sum(:amount)
    disponible = user.monthly_balance - gastado
    return if amount <= disponible

    errors.add(:amount, "supera tu saldo disponible")
  end
end
