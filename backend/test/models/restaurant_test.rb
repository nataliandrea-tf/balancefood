require "test_helper"

class RestaurantTest < ActiveSupport::TestCase
  test "exige nombre, dirección y campus" do
    assert_not Restaurant.new(user: users(:comerciante)).valid?
  end

  test "elimina sus platos al ser destruido" do
    assert_difference "MenuItem.count", -2 do
      restaurants(:casino_central).destroy
    end
  end

  test "conserva los gastos al eliminar un plato" do
    assert_no_difference "Expense.count" do
      menu_items(:menu_dia).destroy
    end
    assert_nil expenses(:almuerzo_lunes).reload.menu_item_id
  end
end
