class CreateExpenses < ActiveRecord::Migration[8.1]
  def change
    create_table :expenses do |t|
      t.references :user, null: false, foreign_key: true
      t.references :menu_item, null: true, foreign_key: true
      t.integer :amount
      t.string :description
      t.date :spent_on

      t.timestamps
    end
    add_index :expenses, [ :user_id, :spent_on ]
  end
end
