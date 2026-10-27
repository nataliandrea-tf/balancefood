require "test_helper"

# Verifica que PostgreSQL rechace datos inválidos aunque se omitan
# las validaciones del modelo (update_column no ejecuta validaciones).
class RestriccionesBdTest < ActiveSupport::TestCase
  test "la BD rechaza un usuario sin email" do
    assert_raises(ActiveRecord::NotNullViolation) do
      users(:natalia).update_column(:email, nil)
    end
  end

  test "la BD rechaza un local sin campus" do
    assert_raises(ActiveRecord::NotNullViolation) do
      restaurants(:casino_central).update_column(:campus, nil)
    end
  end

  test "la BD rechaza un plato sin precio" do
    assert_raises(ActiveRecord::NotNullViolation) do
      menu_items(:menu_dia).update_column(:price, nil)
    end
  end

  test "la BD rechaza un gasto sin fecha" do
    assert_raises(ActiveRecord::NotNullViolation) do
      expenses(:almuerzo_lunes).update_column(:spent_on, nil)
    end
  end

  test "la BD rechaza un precio negativo" do
    error = assert_raises(ActiveRecord::StatementInvalid) do
      menu_items(:menu_dia).update_column(:price, -1)
    end
    assert_match "menu_items_price_positivo", error.message
  end

  test "la BD rechaza un gasto de monto cero" do
    error = assert_raises(ActiveRecord::StatementInvalid) do
      expenses(:almuerzo_lunes).update_column(:amount, 0)
    end
    assert_match "expenses_amount_positivo", error.message
  end

  test "la BD rechaza un saldo negativo" do
    error = assert_raises(ActiveRecord::StatementInvalid) do
      users(:natalia).update_column(:current_balance, -1)
    end
    assert_match "users_current_balance_no_negativo", error.message
  end

  test "la BD rechaza un saldo mensual negativo" do
    error = assert_raises(ActiveRecord::StatementInvalid) do
      users(:natalia).update_column(:monthly_balance, -1)
    end
    assert_match "users_monthly_balance_no_negativo", error.message
  end

  test "la BD acepta saldo cero o sin configurar" do
    usuario = users(:natalia)

    usuario.update_column(:current_balance, 0)
    usuario.update_column(:monthly_balance, nil)

    assert_equal 0, usuario.reload.current_balance
    assert_nil usuario.monthly_balance
  end
end
