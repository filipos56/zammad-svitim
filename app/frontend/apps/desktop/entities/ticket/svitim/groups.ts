// Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

// Svitim pro tebe (fork, 22. 10. 2026): zaskrtavatka skupin nad prehledem ticketu.
// Filip chce Podporu i svou osobni posta v jednech prehledech a jen si zaskrtavat, co vidi.
// Pamatuje se SKRYTE skupiny (v prohlizeci), takze nova skupina se ukaze sama od sebe.
// Filtruje server (argument svitimGroupIds), takze sedi i strankovani a pocet ticketu.

import { useLocalStorage } from '@vueuse/core'
import gql from 'graphql-tag'
import { computed, shallowRef } from 'vue'

import { getApolloClient } from '#shared/server/apollo/client.ts'

interface SvitimGroup {
  id: number
  name: string
}

const GROUPS_QUERY = gql`
  query ticketsSvitimGroups {
    ticketsSvitimGroups
  }
`

const groups = shallowRef<SvitimGroup[]>([])
const hiddenGroupIds = useLocalStorage<number[]>('svitim-skryte-skupiny', [])
let loaded = false

const loadGroups = () => {
  if (loaded) return
  loaded = true

  getApolloClient()
    .query({ query: GROUPS_QUERY, fetchPolicy: 'network-only' })
    .then((result) => {
      groups.value = result.data?.ticketsSvitimGroups ?? []
    })
    .catch(() => {
      loaded = false
    })
}

export const useSvitimGroupFilter = () => {
  loadGroups()

  // Zaskrtavatka maji smysl jen pri vic nez jedne skupine.
  const showFilter = computed(() => groups.value.length > 1)

  // undefined = bez filtru (vse), jinak seznam viditelnych skupin.
  const groupIds = computed(() => {
    if (!showFilter.value) return undefined

    const visible = groups.value.map((group) => group.id).filter((id) => !hiddenGroupIds.value.includes(id))
    if (visible.length === groups.value.length || visible.length === 0) return undefined

    return visible
  })

  const isVisible = (id: number) => !hiddenGroupIds.value.includes(id)

  // Posledni zaskrtnutou skupinu vypnout nejde, prehled by byl prazdny.
  const isLastVisible = (id: number) =>
    isVisible(id) && groups.value.filter((group) => isVisible(group.id)).length <= 1

  const toggle = (id: number) => {
    if (isLastVisible(id)) return

    if (isVisible(id)) {
      hiddenGroupIds.value = [...hiddenGroupIds.value, id]
      return
    }

    hiddenGroupIds.value = hiddenGroupIds.value.filter((hiddenId) => hiddenId !== id)
  }

  return { groups, showFilter, groupIds, isVisible, isLastVisible, toggle }
}
