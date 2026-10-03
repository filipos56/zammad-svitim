// Copyright (C) 2012-2026 Zammad Foundation, https://zammad-foundation.org/

// Svitim pro tebe (fork): Enter odesle odpoved, Shift+Enter udela novy radek.
// Zapina se jen pres meta.submitOnEnter (nastavuje ho typ odpovedi "Chat"), takze u mailu
// a poznamek zustava Enter novym radkem. Stav se cte az pri stisku klavesy -- editor se
// pri prepnuti typu odpovedi znovu nevytvari.

import { Extension } from '@tiptap/core'

import type { EditorState } from '@tiptap/pm/state'

export const EXTENSION_NAME = 'submitOnEnter'

interface SubmitOnEnterOptions {
  isActive: () => boolean
  submit: () => void
}

// Otevrena nabidka (textove moduly "::", zminky "@", znalostni baze "??") ma Enter pro vyber
// polozky -- v tu chvili nic neodesilat.
const hasActiveSuggestion = (state: EditorState) =>
  state.plugins.some((plugin) => {
    const pluginState = plugin.getState(state) as { active?: boolean } | undefined
    return !!pluginState && typeof pluginState === 'object' && pluginState.active === true
  })

export default Extension.create<SubmitOnEnterOptions>({
  name: EXTENSION_NAME,

  // Pred vychozi obsluhou Enteru (novy odstavec), jinak by se k nasi nikdy nedostal.
  priority: 1000,

  addOptions() {
    return {
      isActive: () => false,
      submit: () => {},
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (!this.options.isActive()) return false
        if (editor.view.composing) return false
        if (hasActiveSuggestion(editor.state)) return false
        if (editor.isEmpty) return true

        this.options.submit()
        return true
      },
    }
  },
})
