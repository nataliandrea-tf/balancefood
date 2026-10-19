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

  test "editar el monto ajusta el saldo por la diferencia" do
  natalia = users(:natalia) # saldo inicial 32000
  gasto = Expense.create!(user: natalia, amount: 3000, spent_on: Date.current)
  assert_equal 29000, natalia.reload.current_balance

  gasto.update!(amount: 5000)
  assert_equal 27000, natalia.reload.current_balance
end


  test "no permite editar un gasto a un monto mayor al saldo disponible" do
    natalia = users(:natalia)
    gasto = Expense.create!(user: natalia, amount: 3000, spent_on: Date.current)
    saldo = natalia.reload.current_balance

    assert_not gasto.update(amount: saldo + 3000 + 1)
    assert_equal saldo, natalia.reload.current_balance
  end

  test "bajar el monto de un gasto devuelve la diferencia al saldo" do
    natalia = users(:natalia)
    gasto = Expense.create!(user: natalia, amount: 5000, spent_on: Date.current)
    saldo = natalia.reload.current_balance

    gasto.update!(amount: 2000)
    assert_equal saldo + 3000, natalia.reload.current_balance
  end

  test "editar solo la fecha no modifica el saldo" do
    natalia = users(:natalia)
    gasto = Expense.create!(user: natalia, amount: 3000, spent_on: Date.current)
    saldo = natalia.reload.current_balance

    gasto.update!(spent_on: Date.yesterday)
    assert_equal saldo, natalia.reload.current_balance
  end
end
