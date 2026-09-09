class MenuItem < ApplicationRecord
  belongs_to :restaurant
  has_many :expenses, dependent: :nullify

  validates :name, presence: true, length: { maximum: 120 }
  validates :price, presence: true,
                    numericality: { only_integer: true, greater_than: 0 }

  scope :available, -> { where(available: true) }
  scope :affordable_with, ->(budget) { available.where(price: ..budget) }
end
