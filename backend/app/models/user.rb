class User < ApplicationRecord
  has_secure_password

  has_many :restaurants, dependent: :destroy
  has_many :expenses, dependent: :destroy

  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true, length: { maximum: 100 }
  validates :monthly_balance, numericality: { greater_than_or_equal_to: 0, allow_nil: true }
  validates :current_balance, numericality: { greater_than_or_equal_to: 0, allow_nil: true }

  normalizes :email, with: ->(email) { email.strip.downcase }

  # Saldo disponible del mes: monto mensual menos lo gastado en ese mes,
  # acotado a 0. Se calcula siempre a partir de los gastos, por lo que no puede
  # desajustarse ni superar el monto mensual (el BAES se reinicia cada mes).
  def saldo_actual(fecha = Date.current)
    return nil if monthly_balance.nil?

    [ monthly_balance - expenses.for_month(fecha).sum(:amount), 0 ].max
  end
end
