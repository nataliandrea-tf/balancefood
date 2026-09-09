class User < ApplicationRecord
  has_secure_password

  has_many :restaurants, dependent: :destroy
  has_many :expenses, dependent: :destroy

  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true, length: { maximum: 100 }
  validates :monthly_balance, numericality: { greater_than_or_equal_to: 0, allow_nil: true }
  validates :current_balance, numericality: { greater_than_or_equal_to: 0, allow_nil: true }

  normalizes :email, with: ->(email) { email.strip.downcase }
end
