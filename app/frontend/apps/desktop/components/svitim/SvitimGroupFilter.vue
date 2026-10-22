<!-- Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/ -->

<!-- Svitim pro tebe (fork, 22. 10. 2026): zaskrtavatka skupin nad prehledem ticketu. -->
<script setup lang="ts">
import { useSvitimGroupFilter } from '#desktop/entities/ticket/svitim/groups.ts'

const { groups, showFilter, isVisible, toggle } = useSvitimGroupFilter()

const onChange = (event: Event, id: number) => {
  toggle(id)
  // Posledni skupinu vypnout nejde -- vratit zaskrtnuti i v prohlizeci.
  ;(event.target as HTMLInputElement).checked = isVisible(id)
}
</script>

<template>
  <div v-if="showFilter" class="flex items-center gap-3" role="group" :aria-label="$t('Groups')">
    <label
      v-for="group in groups"
      :key="group.id"
      class="flex cursor-pointer items-center gap-1.5 text-sm text-gray-100 select-none dark:text-neutral-400"
    >
      <input
        type="checkbox"
        class="h-4 w-4 cursor-pointer accent-blue-800"
        :checked="isVisible(group.id)"
        @change="onChange($event, group.id)"
      />
      <span
        class="inline-block h-3 w-[3px] rounded-sm"
        :class="group.name === 'Podpora' ? 'bg-transparent' : 'bg-[#a855f7]'"
        aria-hidden="true"
      />
      {{ group.name }}
    </label>
  </div>
</template>
