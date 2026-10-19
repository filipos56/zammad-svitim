# Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

# Svitim pro tebe (fork): nove zpravy zakazniku z webchatu od daneho casu -- pro vyskakovaci
# upozorneni prohlizece v novem rozhrani (poradnik bod 5). Jen chat: na maily Filip upozorneni
# nechce (rozhodnuto 30. 9. 2026). Jen tickety, ktere operator smi cist.
module Gql::Queries
  class Tickets::SvitimChatActivity < BaseQuery
    description 'Svitim fork: customer chat messages created after the given time.'

    argument :since, GraphQL::Types::ISO8601DateTime, description: 'Only messages created after this time (max. 10 minutes back)'

    type GraphQL::Types::JSON, null: false

    requires_permission 'ticket.agent'

    def resolve(since:)
      typ    = ::Ticket::Article::Type.lookup(name: 'chat')
      sender = ::Ticket::Article::Sender.lookup(name: 'Customer')
      return [] if !typ || !sender

      ::Ticket::Article
        .where(type_id: typ.id, sender_id: sender.id)
        .where('created_at > ?', [since, 10.minutes.ago].max)
        .order(:id).limit(20)
        .filter_map do |article|
          ticket = article.ticket
          next if !::TicketPolicy.new(context.current_user, ticket).agent_read_access?

          {
            id:     article.id,
            ticket: ticket.id,
            number: ticket.number,
            title:  ticket.title.to_s,
            text:   article.body_as_text.to_s.strip[0, 140],
            at:     article.created_at.iso8601,
          }
        end
    end
  end
end
