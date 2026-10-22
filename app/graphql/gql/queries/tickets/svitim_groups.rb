# Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

# Svitim pro tebe (fork, 22. 10. 2026): skupiny pro zaskrtavatka nad prehledem ticketu
# (Podpora / Filip – osobní). Jen skupiny, do kterych operator vidi a ktere maji aspon jeden ticket.
module Gql::Queries
  class Tickets::SvitimGroups < BaseQuery
    description 'Svitim fork: groups for the overview group filter.'

    type GraphQL::Types::JSON, null: false

    requires_permission 'ticket.agent'

    def resolve
      ids = context.current_user.group_ids_access(:overview)
      ids = ::Ticket.where(group_id: ids).distinct.pluck(:group_id)

      ::Group.where(id: ids, active: true).order(:name).map { |group| { id: group.id, name: group.name } }
    end
  end
end
