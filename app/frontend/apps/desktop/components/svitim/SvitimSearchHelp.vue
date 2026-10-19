<!-- Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
// Svitim pro tebe (fork): nápověda k hledání — operátoři zkratky typu state.name:closed
// sami nevymyslí. Filip 1. 10. 2026 (poradník bod 14). Česky natvrdo: zkratky jsou
// technické a překladová tabulka by tu nic nepřinesla.
import { useLocalStorage } from '@vueuse/core'

const open = useLocalStorage('svitim-search-help-open', false)

const radky: [string, string][] = [
  ['reklamace', 'slovo kdekoli — předmět, text, odesílatel i obsah příloh (PDF, Word, Excel)'],
  ['lamp*', 'začátek slova — lampa, lampička, lampičky'],
  ['"rozbitá lampa"', 'přesně tato slova za sebou'],
  ['13039', 'ticket podle čísla'],
  ['jana@seznam.cz', 'všechno od zákazníka'],
  ['state.name:closed reklamace', 'jen uzavřené (open = otevřené, new = nové)'],
  ['customer.email:*@seznam.cz', 'podle domény odesílatele'],
  ['article.attachment.title:*.pdf', 'tickety s PDF přílohou'],
  ['created_at:[2026-09-01 TO 2026-09-30]', 'podle data vytvoření'],
  ['kanal:chat', 'jen chaty (email, phone = telefon)'],
  ['reklamace AND lampa', 'obě slova; OR = aspoň jedno, NOT = bez slova'],
]
</script>

<template>
  <section class="mb-3" data-test-id="svitim-search-help">
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-sm text-neutral-400 hover:bg-blue-900 hover:text-white"
      :aria-expanded="open"
      @click="open = !open"
    >
      <CommonIcon name="info-circle" size="tiny" class="shrink-0" />
      <span>Jak hledat (zkratky)</span>
      <CommonIcon :name="open ? 'chevron-up' : 'chevron-down'" size="xs" class="ms-auto" />
    </button>
    <dl v-if="open" class="mt-1 flex flex-col gap-1.5 px-2 text-xs">
      <div v-for="[kod, popis] in radky" :key="kod" class="flex flex-col">
        <dt>
          <code class="rounded bg-gray-700 px-1.5 py-0.5 text-white">{{ kod }}</code>
        </dt>
        <dd class="ms-0 mt-0.5 text-neutral-400">{{ popis }}</dd>
      </div>
      <p class="mt-1 text-neutral-500">Hledá se i v uzavřených ticketech.</p>
    </dl>
  </section>
</template>
