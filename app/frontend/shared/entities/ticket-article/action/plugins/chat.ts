// Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

// Svitim pro tebe (fork): odpoved do zivého chatu na webu.
// Nabizi se jen u ticketu, ktery vznikl z chatu (createArticleType = chat -- nastavuje ho most
// chat-most.rb). Clanek typu "chat" od operatora most posle navstevnikovi do chatu stejne jako
// verejnou poznamku. Enter odesila (meta.submitOnEnter), Shift+Enter = novy radek.

import { EnumTicketArticleSenderName } from '#shared/graphql/types.ts'

import type { TicketArticleAction, TicketArticleActionPlugin, TicketArticleType } from './types.ts'

const isChatTicket = (ticket: { createArticleType?: { name?: string | null } | null }) =>
  ticket.createArticleType?.name === 'chat'

const actionPlugin: TicketArticleActionPlugin = {
  order: 50,

  addActions(ticket, article) {
    if (!isChatTicket(ticket)) return []
    if (
      article.sender?.name !== EnumTicketArticleSenderName.Customer ||
      article.type?.name !== 'chat'
    )
      return []

    const action: TicketArticleAction = {
      apps: ['mobile', 'desktop'],
      label: __('Reply'),
      name: 'chat',
      icon: 'reply',
      view: {
        agent: ['change'],
      },
      perform(ticket, article, { openReplyForm }) {
        openReplyForm({ articleType: 'chat' })
      },
    }
    return [action]
  },

  addTypes(ticket) {
    if (!isChatTicket(ticket)) return []

    const type: TicketArticleType = {
      apps: ['mobile', 'desktop'],
      value: 'chat',
      label: __('Chat'),
      buttonLabel: __('Send to chat'),
      icon: 'chat',
      view: {
        agent: ['change'],
      },
      internal: false,
      fields: {
        attachments: {},
        body: {
          required: true,
        },
      },
      editorMeta: {
        submitOnEnter: {},
      },
    }
    return [type]
  },
}

export default actionPlugin
