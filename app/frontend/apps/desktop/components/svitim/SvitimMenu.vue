<!-- Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
// Svitim pro tebe (fork): tlacitka v levem dolnim panelu vedle nastaveni a „+“:
// - Kalendář: otevre kalendar Nextcloudu v nove zalozce (Filip 19. 10. 2026, varianta 3a)
// - upozorneni na chat: zapnout/vypnout vyskakovaci okna prohlizece (poradnik bod 5)
import CommonButton from '#desktop/components/CommonButton/CommonButton.vue'

import { useSvitimChatNotifications } from './useSvitimChatNotifications.ts'

const KALENDAR_URL = 'https://svit.musilda.com/apps/calendar/'

const { supported, active, permission, toggle } = useSvitimChatNotifications()

const openCalendar = () => window.open(KALENDAR_URL, '_blank', 'noopener')
</script>

<template>
  <CommonButton
    v-tooltip="$t('Calendar')"
    icon="calendar"
    size="large"
    variant="neutral"
    :aria-label="$t('Calendar')"
    data-test-id="svitim-calendar-button"
    @click="openCalendar"
  />
  <CommonButton
    v-if="supported"
    v-tooltip="
      permission === 'denied'
        ? $t('Chat notifications are blocked in the browser settings')
        : active
          ? $t('Chat notifications are on (click to turn off)')
          : $t('Turn on chat notifications')
    "
    :icon="active ? 'chat' : 'no-notifications'"
    size="large"
    :variant="active ? 'primary' : 'neutral'"
    :aria-label="$t('Chat notifications')"
    data-test-id="svitim-chat-notifications-button"
    @click="toggle"
  />
</template>
