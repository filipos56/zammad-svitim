<!-- Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import AddMenu from '#desktop/components/layout/LayoutSidebar/LeftSidebar/MenuContainer/AddMenu/AddMenu.vue'
import AdminMenu from '#desktop/components/layout/LayoutSidebar/LeftSidebar/MenuContainer/AdminMenu/AdminMenu.vue'
import { SidebarName } from '#desktop/components/layout/types.ts'
import { useSidebarDisplay } from '#desktop/components/layout/useSidebarDisplay.ts'
import SvitimMenu from '#desktop/components/svitim/SvitimMenu.vue'

const { isSidebarCollapsed } = useSidebarDisplay(SidebarName.Primary)
</script>

<template>
  <div
    role="list"
    class="flex items-center gap-1.5 rounded-xl bg-gray-700 p-2 empty:hidden"
    :class="{ 'flex-col bg-transparent': isSidebarCollapsed }"
  >
    <!-- Svitim pro tebe (fork): Kalendář + upozornění na chat -->
    <SvitimMenu />
    <AdminMenu role="listitem" />
    <AddMenu role="listitem" />
  </div>
</template>
