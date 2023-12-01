import { defineConfig, presetAttributify, presetIcons, presetUno } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetAttributify(),
    presetIcons({
      collections: {
        tabler: () => import('@iconify-json/tabler/icons.json').then(i => i.default),
      }
  })],
});
