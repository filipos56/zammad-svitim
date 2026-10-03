# Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

# Svitim pro tebe (fork): kdy aktualni operator naposledy otevrel dane tickety.
# Prehled podle toho zobrazi tucne ticket, kde zakaznik napsal pozdeji (poradnik bod 13).
# Zamerne mimo ticketsCachedByOverview -- ten je cachovany pro vsechny, tohle je osobni.
module Gql::Queries
  class Tickets::SvitimSeen < BaseQuery
    description 'Svitim fork: when the current agent last opened the given tickets.'

    argument :ticket_internal_ids, [Integer], description: 'Internal ticket IDs (max. 500)'

    type GraphQL::Types::JSON, null: false

    requires_permission 'ticket.agent'

    def resolve(ticket_internal_ids:)
      ::RecentView
        .where(created_by_id: context.current_user.id, o_id: ticket_internal_ids.first(500),
               recent_view_object_id: ::ObjectLookup.by_name('Ticket'))
        .pluck(:o_id, :updated_at)
        .to_h { |id, at| [id.to_s, at.iso8601] }
    end
  end
end
