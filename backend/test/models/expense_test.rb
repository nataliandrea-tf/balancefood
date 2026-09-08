require "test_helper"

require "test_helper"

class ExpenseTest < ActiveSupport::TestCase
  test "es válido sin menu_item asociado" do
    gasto = Expense.new(user: users(:natalia), amount: 5000, spent_on: Date.current)
    assert gasto.valid?
  end

  test "exige usuario" do
    gasto = Expense.new(amount: 5000, spent_on: Date.current)
    assert_not gasto.valid?
  end

  test "rechaza monto cero" do
    gasto = Expense.new(user: users(:natalia), amount: 0, spent_on: Date.current)
    assert_not gasto.valid?
  end

  test "for_month filtra por mes calendario" do
    antiguo = Expense.create!(user: users(:natalia), amount: 1000, spent_on: 2.months.ago)
    resultado = Expense.for_month(Date.current)
    assert_includes resultado, expenses(:almuerzo_lunes)
    assert_not_includes resultado, antiguo
  end
end
