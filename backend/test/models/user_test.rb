require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "es válido con atributos correctos" do
    user = User.new(email: "nueva@utem.cl", name: "Nueva", password: "secreta123")
    assert user.valid?, user.errors.full_messages.join(", ")
  end

  test "rechaza email duplicado sin importar mayúsculas" do
    user = User.new(email: "NATALIA@UTEM.CL", name: "Otra", password: "secreta123")
    assert_not user.valid?
    assert_includes user.errors[:email], "has already been taken"
  end

  test "rechaza email con formato inválido" do
    user = User.new(email: "esto-no-es-un-correo", name: "Nueva", password: "secreta123")
    assert_not user.valid?
  end

  test "rechaza saldo negativo" do
    user = User.new(email: "otra@utem.cl", name: "Nueva", password: "secreta123",
                    current_balance: -100)
    assert_not user.valid?
  end

  test "autentica solo con la contraseña correcta" do
    user = users(:natalia)
    assert user.authenticate("secreta123")
    assert_not user.authenticate("incorrecta")
  end

  test "elimina sus gastos al ser destruido" do
    user = users(:natalia)
    assert_difference "Expense.count", -1 do
      user.destroy
    end
  end
end
