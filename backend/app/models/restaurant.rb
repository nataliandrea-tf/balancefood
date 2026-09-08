class Restaurant < ApplicationRecord
  belongs_to :user
  has_many :menu_items, dependent: :destroy

  validates :name, presence: true, length: { maximum: 120 }
  validates :address, presence: true
  validates :campus, presence: true
end
