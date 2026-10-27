class AgregarRestriccionesCheck < ActiveRecord::Migration[8.1]
  def change
    add_check_constraint :menu_items, "price > 0", name: "menu_items_price_positivo"
    add_check_constraint :expenses, "amount > 0", name: "expenses_amount_positivo"
    add_check_constraint :users, "current_balance >= 0", name: "users_current_balance_no_negativo"
    add_check_constraint :users, "monthly_balance >= 0", name: "users_monthly_balance_no_negativo"
  end
end
