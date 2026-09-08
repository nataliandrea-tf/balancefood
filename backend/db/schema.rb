# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_08_200257) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "expenses", force: :cascade do |t|
    t.integer "amount"
    t.datetime "created_at", null: false
    t.string "description"
    t.bigint "menu_item_id"
    t.date "spent_on"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["menu_item_id"], name: "index_expenses_on_menu_item_id"
    t.index ["user_id", "spent_on"], name: "index_expenses_on_user_id_and_spent_on"
    t.index ["user_id"], name: "index_expenses_on_user_id"
  end

  create_table "menu_items", force: :cascade do |t|
    t.boolean "available", default: true, null: false
    t.string "category"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name"
    t.integer "price"
    t.bigint "restaurant_id", null: false
    t.datetime "updated_at", null: false
    t.index ["restaurant_id"], name: "index_menu_items_on_restaurant_id"
  end

  create_table "restaurants", force: :cascade do |t|
    t.string "address"
    t.string "campus"
    t.string "category"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_restaurants_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "current_balance"
    t.string "email"
    t.integer "monthly_balance"
    t.string "name"
    t.string "password_digest"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "expenses", "menu_items"
  add_foreign_key "expenses", "users"
  add_foreign_key "menu_items", "restaurants"
  add_foreign_key "restaurants", "users"
end
