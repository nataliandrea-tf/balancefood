class CreateRestaurants < ActiveRecord::Migration[8.1]
  def change
    create_table :restaurants do |t|
      t.string :name
      t.string :address
      t.string :campus
      t.string :category
      t.text :description
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
