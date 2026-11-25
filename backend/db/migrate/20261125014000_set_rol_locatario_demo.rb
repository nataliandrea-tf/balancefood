class SetRolLocatarioDemo < ActiveRecord::Migration[8.1]
  # Asigna el rol "locatario" (valor 2 en el enum role) al usuario dueño de
  # locales en producción. La base ya existe y db:prepare no reejecuta las
  # semillas, por eso se corrige aquí para que el usuario quede con su rol.
  #
  # Idempotente: solo toca esa fila y puede reaplicarse sin efectos extra.
  # Se usa SQL directo para no depender del modelo User.
  def up
    execute(<<~SQL)
      UPDATE users SET role = 2 WHERE email = 'locatario@balancefood.cl'
    SQL
  end

  def down
    execute(<<~SQL)
      UPDATE users SET role = 0 WHERE email = 'locatario@balancefood.cl'
    SQL
  end
end
