class AuthToken
  EXPIRACION = 24.hours

  class << self
    def encode(user)
      verifier.generate({ user_id: user.id }, expires_in: EXPIRACION)
    end

    def decode(token)
      verifier.verified(token)&.with_indifferent_access
    end

    private

    def verifier
      Rails.application.message_verifier(:auth_token)
    end
  end
end
