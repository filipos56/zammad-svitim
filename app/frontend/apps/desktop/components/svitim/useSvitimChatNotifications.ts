// Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

// Svitim pro tebe (fork): vyskakovaci upozorneni prohlizece + zvuk na NOVOU ZPRAVU ZAKAZNIKA
// V CHATU (poradnik bod 5). Na maily ne -- Filip 30. 9. 2026: „na mail nechodí žádná
// notifikace, ale na chat vždy a důrazně“. Nove rozhrani Zammadu upozorneni prohlizece
// vubec nema. Kazdych 15 s se zepta serveru (ticketsSvitimChatActivity) na zpravy od
// posledniho dotazu. Zapina se tlacitkem v levem panelu (povoleni prohlizece chce klik).

import { useIntervalFn, useLocalStorage } from '@vueuse/core'
import gql from 'graphql-tag'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getApolloClient } from '#shared/server/apollo/client.ts'

const ACTIVITY_QUERY = gql`
  query ticketsSvitimChatActivity($since: ISO8601DateTime!) {
    ticketsSvitimChatActivity(since: $since)
  }
`

interface ChatActivity {
  id: number
  ticket: number
  number: string
  title: string
  text: string
  at: string
}

const supported = typeof window !== 'undefined' && 'Notification' in window

export const useSvitimChatNotifications = () => {
  const router = useRouter()
  const wanted = useLocalStorage('svitim-chat-notifications', true)
  const permission = ref<NotificationPermission | 'unsupported'>(
    supported ? Notification.permission : 'unsupported',
  )
  const active = computed(() => wanted.value && permission.value === 'granted')

  let since = new Date().toISOString()
  const seen = new Set<number>()

  const show = (item: ChatActivity) => {
    const viewingIt =
      document.visibilityState === 'visible' &&
      window.location.pathname.endsWith(`/tickets/${item.ticket}`)
    if (viewingIt) return

    const notification = new Notification(`💬 Chat #${item.number}`, {
      body: item.text || item.title,
      tag: `svitim-chat-${item.ticket}`,
      requireInteraction: true,
    })
    notification.onclick = () => {
      window.focus()
      router.push(`/tickets/${item.ticket}`)
      notification.close()
    }

    new Audio('/assets/sounds/chat_message.mp3').play().catch(() => undefined)
  }

  const check = async () => {
    if (!active.value) return
    const now = new Date().toISOString()
    try {
      const result = await getApolloClient().query({
        query: ACTIVITY_QUERY,
        variables: { since },
        fetchPolicy: 'no-cache',
      })
      since = now
      ;((result.data?.ticketsSvitimChatActivity as ChatActivity[]) || []).forEach((item) => {
        if (seen.has(item.id)) return
        seen.add(item.id)
        show(item)
      })
    } catch {
      // Vypadek spojeni: zkusi se pri dalsim kole od stejneho casu.
    }
  }

  useIntervalFn(check, 15_000)

  const toggle = async () => {
    if (!supported) return
    if (active.value) {
      wanted.value = false
      return
    }
    if (Notification.permission !== 'granted') {
      permission.value = await Notification.requestPermission()
    }
    wanted.value = true
    since = new Date().toISOString()
  }

  return { supported, active, permission, toggle }
}
