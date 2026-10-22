// Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

// Svitim pro tebe (fork): panel „Pohoda“ — objednavky zakaznika z ucetnictvi (Filip 19. 10. 2026).
import {
  TicketSidebarScreenType,
  type TicketSidebarContext,
} from '#desktop/pages/ticket/types/sidebar.ts'

import SvitimPohoda from '../SvitimPohoda/SvitimPohoda.vue'

import type { TicketSidebarPlugin } from './types.ts'

export default <TicketSidebarPlugin>{
  title: __('Orders (Pohoda)'),
  component: SvitimPohoda,
  permissions: ['ticket.agent'],
  screens: [TicketSidebarScreenType.TicketDetailView],
  views: ['agent'],
  icon: 'card-list',
  order: 1100,
  // Jen v Podpore -- v osobni skupine (Filip – osobní, 22. 10. 2026) data z Pohody nechceme.
  available: (context: TicketSidebarContext) => context.ticket?.value?.group?.name === 'Podpora',
}
