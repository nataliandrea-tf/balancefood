class AgregarRestriccionesNotNull < ActiveRecord::Migration[8.1]
  def change
    change_column_null :users, :email, false
    change_column_null :users, :name, false
    change_column_null :users, :password_digest, false

    change_column_null :restaurants, :name, false
    change_column_null :restaurants, :address, false
    change_column_null :restaurants, :campus, false

    change_column_null :menu_items, :name, false
    change_column_null :menu_items, :price, false

    change_column_null :expenses, :amount, false
    change_column_null :expenses, :spent_on, false
  end
end
