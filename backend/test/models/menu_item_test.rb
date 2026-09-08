require "test_helper"

require "test_helper"

class MenuItemTest < ActiveSupport::TestCase
  test "rechaza precio negativo o cero" do
    item = MenuItem.new(restaurant: restaurants(:casino_central), name: "Test", price: 0)
    assert_not item.valid?
  end

  test "rechaza precio con decimales" do
    item = MenuItem.new(restaurant: restaurants(:casino_central), name: "Test", price: 1500.5)
    assert_not item.valid?
  end

  test "affordable_with devuelve solo lo costeable" do
    resultado = MenuItem.affordable_with(2500)
    assert_includes resultado, menu_items(:completo)
    assert_not_includes resultado, menu_items(:menu_dia)
  end

  test "affordable_with excluye los no disponibles" do
    menu_items(:completo).update!(available: false)
    assert_not_includes MenuItem.affordable_with(2500), menu_items(:completo)
  end

  test "queda disponible por defecto" do
    item = MenuItem.create!(restaurant: restaurants(:casino_central), name: "Nuevo", price: 1000)
    assert item.available
  end
end
