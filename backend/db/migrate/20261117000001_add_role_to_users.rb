class AddRoleToUsers < ActiveRecord::Migration[8.1]
  def change
    # 0 = estudiante (por defecto), 1 = admin. Ver el enum en el modelo User.
    add_column :users, :role, :integer, default: 0, null: false
  end
end
