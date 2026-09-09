class Expense < ApplicationRecord
  belongs_to :user
  belongs_to :menu_item, optional: true

  validates :amount, presence: true,
                     numericality: { only_integer: true, greater_than: 0 }
  validates :spent_on, presence: true

  scope :for_month, ->(date) { where(spent_on: date.beginning_of_month..date.end_of_month) }

  after_create :descontar_saldo
  after_destroy :devolver_saldo

  private

  def descontar_saldo
    return if user.current_balance.nil?

    user.update_column(:current_balance, [ user.current_balance - amount, 0 ].max)
  end

  def devolver_saldo
    return if user.current_balance.nil?

    user.update_column(:current_balance, user.current_balance + amount)
  end
end
