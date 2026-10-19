<!-- Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
// Svitim pro tebe (fork): panel „Objednávky (Pohoda)“ v detailu ticketu. Vsechny objednavky
// zakaznika, nejnovejsi nahore: datum, stav, uhrazeno / doruceno (zaskrtnuti), zbozi na
// rozkliknuti, reklamace. Data pripravuje ~/bin/pohoda-do-ticketu.py na serveru (zrcadlo
// Pohody), Zammad je cte z preferences zakaznika (dotaz ticketSvitimPohoda). Filip 19. 10. 2026.
import gql from 'graphql-tag'
import { computed, onMounted, ref, watch } from 'vue'

import { getApolloClient } from '#shared/server/apollo/client.ts'

import { useTicketInformation } from '#desktop/pages/ticket/composables/useTicketInformation.ts'
import type { TicketSidebarEmits, TicketSidebarProps } from '#desktop/pages/ticket/types/sidebar.ts'

import TicketSidebarContent from '../TicketSidebarContent.vue'
import TicketSidebarWrapper from '../TicketSidebarWrapper.vue'

defineProps<TicketSidebarProps>()
const emit = defineEmits<TicketSidebarEmits>()

// Panel se v liste vpravo zobrazi, az kdyz se sam „ohlasi“ (stejne jako checklist).
onMounted(() => emit('show'))

interface Polozka {
  nazev: string
  mnozstvi: number
  mj: string
}
interface Objednavka {
  cislo: string
  datum: string
  kc: number | null
  stav: string
  dopravce: string
  uhrazeno: boolean
  uhrazeno_dne: string
  doruceno: boolean
  storno: boolean
  zbozi: Polozka[]
}
interface Reklamace {
  cislo: string
  datum: string
  zbozi: string
  stav: string
}
interface PohodaData {
  data_k: string
  telefon: string | null
  objednavky: Objednavka[]
  reklamace: Reklamace[]
}

const QUERY = gql`
  query ticketSvitimPohoda($ticketId: ID!) {
    ticketSvitimPohoda(ticketId: $ticketId)
  }
`

const { ticketId } = useTicketInformation()
const data = ref<PohodaData | null>(null)
const nacteno = ref(false)
const otevrene = ref<Record<string, boolean>>({})

const nacti = async () => {
  if (!ticketId.value) return
  try {
    const result = await getApolloClient().query({
      query: QUERY,
      variables: { ticketId: ticketId.value },
      fetchPolicy: 'network-only',
    })
    data.value = (result.data?.ticketSvitimPohoda as PohodaData) || null
  } catch {
    data.value = null
  }
  nacteno.value = true
}

watch(ticketId, nacti, { immediate: true })

const datum = (iso: string) => {
  if (!iso) return ''
  const [r, m, d] = iso.split('-')
  return `${Number(d)}. ${Number(m)}. ${r}`
}
const kc = (castka: number | null) =>
  castka === null ? '' : `${Math.round(castka).toLocaleString('cs-CZ')} Kč`

const objednavky = computed(() => data.value?.objednavky || [])
</script>

<template>
  <TicketSidebarWrapper :key="sidebar" :sidebar="sidebar" :sidebar-plugin="sidebarPlugin" :selected="selected">
    <TicketSidebarContent :title="sidebarPlugin.title" :icon="sidebarPlugin.icon">
      <div class="flex flex-col gap-3 text-sm" data-test-id="svitim-pohoda">
        <CommonLabel v-if="!nacteno" size="small">Načítám…</CommonLabel>

        <template v-else-if="!data">
          <CommonLabel size="small">
            Údaje z Pohody zatím nejsou (doplní se do minuty od nového ticketu).
          </CommonLabel>
        </template>

        <template v-else>
          <div class="text-xs text-stone-200 dark:text-neutral-500">
            Pohoda k {{ data.data_k }} · kopie, ne živý stav
            <template v-if="data.telefon"> · tel. {{ data.telefon }}</template>
          </div>

          <CommonLabel v-if="!objednavky.length" size="small">
            V Pohodě žádná objednávka na tento e-mail.
          </CommonLabel>

          <div
            v-for="o in objednavky"
            :key="o.cislo"
            class="rounded-lg border border-neutral-100 p-2.5 dark:border-gray-900"
            :class="{ 'opacity-60': o.storno }"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold text-black dark:text-white">{{ o.cislo }}</span>
              <span class="text-xs text-stone-200 dark:text-neutral-500">{{ datum(o.datum) }}</span>
            </div>
            <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span
                class="rounded px-1.5 py-0.5"
                :class="
                  o.storno
                    ? 'bg-red-50 text-red-500 dark:bg-red-900'
                    : o.stav === 'Dokončeno'
                      ? 'bg-green-100 text-green-500 dark:bg-green-900'
                      : 'bg-blue-200 text-gray-100 dark:bg-gray-700 dark:text-neutral-400'
                "
                >{{ o.stav }}</span
              >
              <span class="flex items-center gap-1" :title="o.uhrazeno_dne ? `uhrazeno ${datum(o.uhrazeno_dne)}` : ''">
                <CommonIcon :name="o.uhrazeno ? 'check-square' : 'square'" size="xs" />
                Uhrazeno
              </span>
              <span class="flex items-center gap-1">
                <CommonIcon :name="o.doruceno ? 'check-square' : 'square'" size="xs" />
                Doručeno
              </span>
            </div>
            <div class="mt-1 text-xs text-stone-200 dark:text-neutral-500">
              {{ kc(o.kc) }}<template v-if="o.dopravce"> · {{ o.dopravce }}</template>
            </div>
            <button
              v-if="o.zbozi.length"
              type="button"
              class="mt-1.5 flex items-center gap-1 text-xs text-blue-800 hover:underline"
              @click="otevrene[o.cislo] = !otevrene[o.cislo]"
            >
              <CommonIcon :name="otevrene[o.cislo] ? 'chevron-up' : 'chevron-down'" size="xs" />
              Zboží ({{ o.zbozi.length }})
            </button>
            <ul v-if="otevrene[o.cislo]" class="mt-1 flex flex-col gap-0.5 ps-1 text-xs">
              <li v-for="(p, i) in o.zbozi" :key="i">
                {{ p.mnozstvi }} {{ p.mj }} {{ p.nazev }}
              </li>
            </ul>
          </div>

          <template v-if="data.reklamace?.length">
            <CommonLabel size="small" class="mt-1 font-semibold">Reklamace v Pohodě</CommonLabel>
            <div v-for="r in data.reklamace" :key="r.cislo" class="text-xs">
              {{ r.cislo }} · {{ datum(r.datum) }} · {{ r.zbozi }} · {{ r.stav }}
            </div>
          </template>
        </template>
      </div>
    </TicketSidebarContent>
  </TicketSidebarWrapper>
</template>
