class CreateMenuItems < ActiveRecord::Migration[8.1]
  def change
    create_table :menu_items do |t|
      t.references :restaurant, null: false, foreign_key: true
      t.string :name
      t.text :description
      t.integer :price
      t.string :category
      t.boolean :available, null: false, default: true

      t.timestamps
    end
  end
end
