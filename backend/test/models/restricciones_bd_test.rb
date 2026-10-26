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
end
