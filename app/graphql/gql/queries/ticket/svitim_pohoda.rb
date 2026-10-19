# Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

# Svitim pro tebe (fork): objednavky zakaznika z Pohody pro panel „Pohoda“ v detailu ticketu.
# Data pripravuje skript ~/bin/pohoda-do-ticketu.py na serveru (cte zrcadlo Pohody, login
# zammad_reader) a uklada je zakaznikovi do preferences["svitim_pohoda"]. Zammad sam na
# databazi Pohody nesaha -- obraz nema ovladac MS SQL a nepotrebuje ho. Filip 19. 10. 2026.
module Gql::Queries
  class Ticket::SvitimPohoda < BaseQuery
    description 'Svitim fork: Pohoda orders of the ticket customer.'

    argument :ticket_id, GraphQL::Types::ID, loads: Gql::Types::TicketType, description: 'The ticket'

    type GraphQL::Types::JSON, null: true

    requires_permission 'ticket.agent'

    def resolve(ticket:)
      ticket.customer&.preferences&.dig('svitim_pohoda')
    end
  end
end
