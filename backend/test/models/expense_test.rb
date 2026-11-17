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

  test "registrar un gasto baja el saldo disponible por su monto" do
    natalia = users(:natalia)
    antes = natalia.saldo_actual

    Expense.create!(user: natalia, amount: 3000, spent_on: Date.current)

    assert_equal antes - 3000, natalia.saldo_actual
  end

  test "editar el monto recalcula el saldo disponible" do
    natalia = users(:natalia)
    antes = natalia.saldo_actual
    gasto = Expense.create!(user: natalia, amount: 3000, spent_on: Date.current)

    gasto.update!(amount: 5000)

    assert_equal antes - 5000, natalia.saldo_actual
  end

  test "eliminar un gasto devuelve su monto al saldo disponible" do
    natalia = users(:natalia)
    antes = natalia.saldo_actual
    gasto = Expense.create!(user: natalia, amount: 3000, spent_on: Date.current)

    gasto.destroy

    assert_equal antes, natalia.saldo_actual
  end

  test "no permite un gasto mayor al saldo disponible del mes" do
    natalia = users(:natalia)
    disponible = natalia.saldo_actual

    gasto = Expense.new(user: natalia, amount: disponible + 1, spent_on: Date.current)

    assert_not gasto.valid?
  end

  test "no permite editar un gasto a un monto mayor al saldo disponible" do
    natalia = users(:natalia)
    gasto = Expense.create!(user: natalia, amount: 3000, spent_on: Date.current)
    disponible = natalia.saldo_actual + gasto.amount

    assert_not gasto.update(amount: disponible + 1)
  end

  test "editar solo la fecha dentro del mes no cambia el saldo" do
    natalia = users(:natalia)
    gasto = Expense.create!(user: natalia, amount: 3000, spent_on: Date.current.end_of_month)
    antes = natalia.saldo_actual

    gasto.update!(spent_on: Date.current.beginning_of_month)

    assert_equal antes, natalia.saldo_actual
  end
end
