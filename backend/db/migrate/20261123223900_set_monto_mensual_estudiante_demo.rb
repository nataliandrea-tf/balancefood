class SetMontoMensualEstudianteDemo < ActiveRecord::Migration[8.1]
  # Ajusta el monto mensual BAES del estudiante demo a $48.000.
  #
  # El saldo disponible se calcula como monthly_balance menos los gastos del
  # mes (ver User#saldo_actual), así que con 0 gastos el saldo mostrado es el
  # monto mensual. La base ya existía con 32.000 y db:prepare no reejecuta las
  # semillas, por eso se corrige aquí para que producción quede en 48.000.
  #
  # Idempotente: solo toca la fila del estudiante demo y puede reaplicarse sin
  # efectos adicionales. Se usa SQL directo para no depender del modelo User.
  def up
    execute(<<~SQL)
      UPDATE users
         SET monthly_balance = 48000,
             current_balance = 48000
       WHERE email = 'demo@utem.cl'
    SQL
  end

  def down
    execute(<<~SQL)
      UPDATE users
         SET monthly_balance = 32000,
             current_balance = 32000
       WHERE email = 'demo@utem.cl'
    SQL
  end
end
