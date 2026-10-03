// Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

// Svitim pro tebe (fork): prectene / neprectene tickety (poradnik bod 13).
// Detail ticketu zapise "videl jsem" (mutace ticketSvitimSeen -> recent_views), prehled si
// pro nactene radky zjisti, kdy je operator naposledy otevrel (query ticketsSvitimSeen),
// a ticket, kde zakaznik napsal pozdeji, ukaze tucne. Dotazy jsou mimo cachovany prehled.

import { useIntervalFn } from '@vueuse/core'
import gql from 'graphql-tag'
import { shallowRef, watch, type Ref } from 'vue'

import type { TicketById } from '#shared/entities/ticket/types.ts'
import { getApolloClient } from '#shared/server/apollo/client.ts'

import { useKeepAliveHooks } from '#desktop/composables/useKeepAliveHooks.ts'

const SEEN_MUTATION = gql`
  mutation ticketSvitimSeen($ticketId: ID!) {
    ticketSvitimSeen(ticketId: $ticketId) {
      success
    }
  }
`

const SEEN_QUERY = gql`
  query ticketsSvitimSeen($ticketInternalIds: [Int!]!) {
    ticketsSvitimSeen(ticketInternalIds: $ticketInternalIds)
  }
`

const markTicketSeen = (ticketId: string) =>
  getApolloClient()
    .mutate({ mutation: SEEN_MUTATION, variables: { ticketId } })
    .catch(() => undefined)

/** Detail ticketu: zapsat, ze ho operator videl -- pri otevreni, navratu na zalozku i nove zprave. */
export const useSvitimMarkTicketSeen = (ticket: Ref<TicketById | undefined>) => {
  let active = true
  const mark = () => {
    if (!active || !ticket.value?.id) return
    markTicketSeen(ticket.value.id)
  }

  watch(() => [ticket.value?.id, ticket.value?.articleCount], mark, { immediate: true })

  useKeepAliveHooks({
    onActivated: () => {
      active = true
      mark()
    },
    onDeactivated: () => {
      active = false
    },
  })
}

/** Prehled: kdy operator naposledy otevrel nactene tickety; isUnread() pro tucny radek. */
export const useSvitimTicketsSeen = (
  items: Ref<{ internalId?: number; lastContactCustomerAt?: string | null }[]>,
  enabled: () => boolean,
) => {
  const seen = shallowRef<Record<string, string>>({})
  const loaded = shallowRef(false)

  const refresh = async () => {
    if (!enabled()) return
    const ids = items.value.map((item) => item.internalId).filter((id): id is number => !!id)
    if (!ids.length) return

    try {
      const result = await getApolloClient().query({
        query: SEEN_QUERY,
        variables: { ticketInternalIds: ids },
        fetchPolicy: 'no-cache',
      })
      seen.value = (result.data?.ticketsSvitimSeen as Record<string, string>) || {}
      loaded.value = true
    } catch {
      // Bez prav nebo pri vypadku: nic netucnit, prehled musi fungovat dal.
      loaded.value = false
    }
  }

  watch(() => items.value.map((item) => item.internalId).join(','), refresh, { immediate: true })
  useKeepAliveHooks({ onActivated: refresh })
  useIntervalFn(refresh, 30_000)

  const isUnread = (item: { internalId?: number; lastContactCustomerAt?: string | null }) => {
    if (!loaded.value || !item.internalId || !item.lastContactCustomerAt) return false
    const lastSeen = seen.value[String(item.internalId)]
    return !lastSeen || new Date(item.lastContactCustomerAt) > new Date(lastSeen)
  }

  return { isUnread }
}
