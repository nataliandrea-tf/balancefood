class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email
      t.string :password_digest
      t.string :name
      t.integer :monthly_balance
      t.integer :current_balance

      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
