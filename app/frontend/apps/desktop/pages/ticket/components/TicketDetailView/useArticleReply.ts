// Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

import { computed, type Ref } from 'vue'

import { useTicketView } from '#shared/entities/ticket/composables/useTicketView.ts'
import type { TicketById } from '#shared/entities/ticket/types.ts'
import type { AppSpecificTicketArticleType } from '#shared/entities/ticket-article/action/plugins/types.ts'

export const useArticleReply = (
  ticket: Ref<TicketById>,
  ticketArticleTypes: Ref<AppSpecificTicketArticleType[]>,
) => {
  const { isTicketCustomer } = useTicketView(ticket)

  const createArticleType = computed(() => ticket.value.createArticleType?.name)

  const currentTicketArticleType = computed(() => {
    if (isTicketCustomer.value) return 'web'

    if (createArticleType.value && ['phone', 'web'].includes(createArticleType.value))
      return 'email'

    return createArticleType.value
  })

  const allowedArticleTypes = computed(() => ['note', 'phone', currentTicketArticleType.value])

  const availableArticleTypes = computed(() => {
    const filtered = ticketArticleTypes.value.filter((type) =>
      allowedArticleTypes.value.includes(type.value),
    )

    return filtered.map((type) => ({
      articleType: type.value,
      label: type.buttonLabel,
      icon: type.icon,
      performReply: (() =>
        type.performReply?.(ticket.value)) as AppSpecificTicketArticleType['performReply'],
    }))
  })

  const noteArticleType = computed(() =>
    availableArticleTypes.value.find((t) => t.articleType === 'note'),
  )

  const customerReplyArticleType = computed(() =>
    availableArticleTypes.value.find((t) => t.articleType === 'web'),
  )

  // Svitim pro tebe (fork): u ticketu z chatu je vychozi odpovedi „Odeslat do chatu“.
  const chatArticleType = computed(() =>
    availableArticleTypes.value.find((t) => t.articleType === 'chat'),
  )

  const defaultArticleType = computed(() => {
    if (isTicketCustomer.value) return customerReplyArticleType.value
    return chatArticleType.value || noteArticleType.value
  })

  return { noteArticleType, customerReplyArticleType, chatArticleType, defaultArticleType }
}
