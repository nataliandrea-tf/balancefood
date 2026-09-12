# Datos de demostración de BalanceFood.
#
#   bin/rails db:seed
#
# El script es idempotente: puede ejecutarse varias veces sin duplicar
# registros, porque busca cada entidad por su clave natural antes de crearla.
#
# Los precios corresponden a la carta vigente del local a septiembre de 2026
# y son referenciales: no han sido validados con el comercio.

puts "Sembrando datos de demostración…"

# ---------------------------------------------------------------------------
# Usuarios
# ---------------------------------------------------------------------------

estudiante = User.find_or_initialize_by(email: "demo@utem.cl")
estudiante.assign_attributes(
  name: "Estudiante Demo",
  password: "balancefood2026",
  monthly_balance: 32_000,
  current_balance: 32_000
)
estudiante.save!

comerciante = User.find_or_initialize_by(email: "locatario@balancefood.cl")
comerciante.assign_attributes(
  name: "Locatario Demo",
  password: "balancefood2026",
  monthly_balance: 0,
  current_balance: 0
)
comerciante.save!

puts "  #{User.count} usuarios"

# ---------------------------------------------------------------------------
# Locales y cartas
# ---------------------------------------------------------------------------

CATALOGO = [
  {
    name: "Tío Cleme",
    address: "Av. José Pedro Alessandri 1242, Ñuñoa, Región Metropolitana",
    campus: "Campus Ñuñoa",
    category: "Food Truck",
    description: "El Tío Cleme ofrece comida rápida y variada a precio estudiante: " \
                 "hamburguesas, churrascos, completos, empanadas, sushi y gohan. " \
                 "Acepta Beca JUNAEB.",
    menu: [
      { name: "Churrasco Italiano",             price: 2_000, category: "Almuerzo" },
      { name: "Barros Luco",                    price: 2_000, category: "Almuerzo" },
      { name: "Empanada de Pino",               price: 2_900, category: "Almuerzo" },
      { name: "Empanada de Pino Ají",           price: 2_900, category: "Almuerzo" },
      { name: "Empanada Napolitana",            price: 2_900, category: "Almuerzo" },
      { name: "Empanada Pollo, choclo y queso", price: 2_900, category: "Almuerzo" },
      { name: "Completo Italiano",              price: 2_900, category: "Almuerzo" },
      { name: "Hamburguesa Italiana",           price: 2_500, category: "Almuerzo" },
      { name: "Hamburguesa Queso Tomate",       price: 2_500, category: "Almuerzo" },
      { name: "Hamburguesa Vegana",             price: 1_800, category: "Almuerzo" },
      { name: "Gohan",                          price: 5_000, category: "Almuerzo" },
      { name: "Queque 200 gr",                  price: 500,   category: "Snack" },
      { name: "Lata Coca-Cola 350 ml",          price: 1_500, category: "Bebestible" },
      { name: "Lata Sprite 350 ml",             price: 1_500, category: "Bebestible" },
      { name: "Jugo en caja naranja 200 cc",    price: 800,   category: "Bebestible" }
    ]
  }
].freeze

CATALOGO.each do |datos|
  menu = datos[:menu]

  local = Restaurant.find_or_initialize_by(name: datos[:name], user: comerciante)
  local.assign_attributes(datos.except(:menu))
  local.save!

  menu.each do |plato|
    item = MenuItem.find_or_initialize_by(restaurant: local, name: plato[:name])
    item.assign_attributes(plato.merge(available: true))
    item.save!
  end

  puts "  #{local.name}: #{menu.size} platos"
end

# ---------------------------------------------------------------------------
# Gastos de ejemplo del estudiante
# ---------------------------------------------------------------------------
#
# Se crean solo si el estudiante aún no tiene gastos registrados, para no
# alterar el saldo en ejecuciones sucesivas. Los callbacks del modelo Expense
# descuentan cada monto de current_balance automáticamente.

if estudiante.expenses.none?
  estudiante.update!(current_balance: estudiante.monthly_balance)

  churrasco = MenuItem.find_by(name: "Churrasco Italiano")
  completo  = MenuItem.find_by(name: "Completo Italiano")

  [
    { menu_item: churrasco, amount: churrasco.price, description: "Almuerzo entre clases", spent_on: 3.days.ago.to_date },
    { menu_item: completo,  amount: completo.price,  description: "Once rápida",           spent_on: 1.day.ago.to_date },
    { menu_item: nil,       amount: 3_200,           description: "Almuerzo fuera del campus", spent_on: Date.current }
  ].each { |gasto| estudiante.expenses.create!(gasto) }

  puts "  #{estudiante.expenses.count} gastos de ejemplo"
end

puts
puts "Listo."
puts "  Estudiante: demo@utem.cl / balancefood2026"
puts "  Locatario:  locatario@balancefood.cl / balancefood2026"
puts "  Saldo del estudiante: $#{estudiante.reload.current_balance}"
