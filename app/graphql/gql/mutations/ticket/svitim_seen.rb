# Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

# Svitim pro tebe (fork): operator otevrel ticket -> zapsat do recent_views.
# Nove rozhrani (desktop) to samo nedela, takze nebylo z ceho poznat prectene/neprectene
# tickety (poradnik bod 13). Zaroven tim zacne fungovat seznam "Naposledy zobrazene".
module Gql::Mutations
  class Ticket::SvitimSeen < BaseMutation
    description 'Svitim fork: mark a ticket as seen by the current agent.'

    argument :ticket_id, GraphQL::Types::ID, loads: Gql::Types::TicketType, description: 'The ticket the agent has opened'

    field :success, Boolean, null: false, description: 'Was the view recorded?'

    requires_permission 'ticket.agent'

    def resolve(ticket:)
      ::RecentView.log(ticket, context.current_user)

      { success: true }
    end
  end
end
