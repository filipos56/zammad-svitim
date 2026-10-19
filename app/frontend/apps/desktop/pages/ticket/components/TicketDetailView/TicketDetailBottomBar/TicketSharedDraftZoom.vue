<!-- Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
// Svitim pro tebe (fork): misto „Koncept k dispozici“ (dva kliky: panel -> Vložit) je tu
// fialove tlacitko „Odpověď od AI“, ktere navrh vlozi do pole odpovedi jednim klikem.
// Logika vlozeni je stejna jako v TicketSharedDraftFlyout.vue (applySharedDraft), vcetne
// dotazu, kdyz uz je v poli rozepsany text. Male tlacitko vedle otevre puvodni panel
// s nahledem a s „Zahodit návrh“. Poradnik k forku bod 1, Filip 26. 9. a 19. 10. 2026.
import { toRef } from 'vue'

import type { FormRef } from '#shared/components/Form/types.ts'
import { useForm } from '#shared/components/Form/useForm.ts'
import { useConfirmation } from '#shared/composables/useConfirmation.ts'

import CommonButton from '#desktop/components/CommonButton/CommonButton.vue'
import { useFlyout } from '#desktop/components/CommonFlyout/useFlyout.ts'
import { useTicketSharedDraft } from '#desktop/pages/ticket/composables/useTicketSharedDraft.ts'

const props = defineProps<{
  sharedDraftId?: string | null
  form?: FormRef
}>()

useFlyout({
  name: 'shared-draft',
  component: () => import('../../TicketSharedDraftFlyout.vue'),
  global: true,
})

const { openSharedDraftFlyout } = useTicketSharedDraft()

const { isDirty, triggerFormUpdater } = useForm(toRef(props, 'form'))
const { waitForConfirmation } = useConfirmation()

const applyAiDraft = async () => {
  if (!props.sharedDraftId) return

  if (isDirty.value) {
    const confirmed = await waitForConfirmation(
      __('There is existing content. Do you want to overwrite it?'),
      {
        headerTitle: __('Apply draft'),
        buttonLabel: __('Overwrite content'),
        buttonVariant: 'danger',
      },
    )
    if (!confirmed) return
  }

  triggerFormUpdater({
    additionalParams: { sharedDraftId: props.sharedDraftId, draftType: 'detail-view' },
  })
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <CommonButton
      prefix-icon="smart-assist"
      size="large"
      variant="primary"
      class="bg-[#7c3aed]! text-white! hover:bg-[#6d28d9]! focus-visible:outline-[#7c3aed]!"
      data-test-id="svitim-ai-reply-button"
      @click="applyAiDraft"
      >{{ $t('AI reply') }}</CommonButton
    >
    <CommonButton
      v-tooltip="$t('Draft available')"
      icon="template"
      size="large"
      variant="tertiary"
      :aria-label="$t('Draft available')"
      @click="openSharedDraftFlyout('detail-view', sharedDraftId, form)"
    />
  </div>
</template>
