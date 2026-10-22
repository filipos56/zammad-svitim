<!-- Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import type { FormRef } from '#shared/components/Form/types.ts'
import type { MacroById } from '#shared/entities/macro/types.ts'

import CommonButton from '#desktop/components/CommonButton/CommonButton.vue'

// Svitim pro tebe (fork): koncepty a makra z rozbalovaci sipky jsme nepouzivali
// (ukazovala jen „No items available“), proto tu zustava jen samotne tlacitko.
interface Props {
  ticketId: string
  form?: FormRef
  groupId?: string
  disabled: boolean
  canUseDraft?: boolean
  sharedDraftId?: string | null
  // Svitim pro tebe (fork): zlute tlacitko = „Uzavřít ticket“, nejde dokud chybi stitky.
  closeBlocked?: boolean
}

defineProps<Props>()

defineEmits<{
  submit: [MouseEvent]
  'execute-macro': [MacroById]
}>()
</script>

<template>
  <!-- Svitim pro tebe (fork): jen „Uzavřít ticket“, bez šipky s koncepty a makry, světle zelené. -->
  <CommonButton
    v-tooltip="closeBlocked ? $t('Fill in the ticket labels first') : undefined"
    size="large"
    variant="none"
    class="bg-[#86efac]! text-black! hover:bg-[#4ade80]!"
    type="button"
    :disabled="disabled || closeBlocked"
    @click="$emit('submit', $event)"
  >
    {{ $t('Close ticket') }}
  </CommonButton>
</template>
