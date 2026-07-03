import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'
import presetWind from '@unocss/preset-wind'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    UnoCSS({
      presets: [presetWind()],
      theme: {
        colors: {
          surface: 'var(--surface)',
          background: 'var(--surface)',
          'surface-dim': 'var(--surface-dim)',
          'surface-bright': 'var(--surface-bright)',
          'surface-container-lowest': 'var(--surface-container-lowest)',
          'surface-container-low': 'var(--surface-container-low)',
          'surface-container': 'var(--surface-container)',
          'surface-container-high': 'var(--surface-container-high)',
          'surface-container-highest': 'var(--surface-container-highest)',
          'on-surface': 'var(--on-surface)',
          'on-surface-variant': 'var(--on-surface-variant)',
          'inverse-surface': 'var(--inverse-surface)',
          'inverse-on-surface': 'var(--inverse-on-surface)',
          outline: 'var(--outline)',
          'outline-variant': 'var(--outline-variant)',
          primary: 'var(--primary)',
          'on-primary': 'var(--on-primary)',
          'primary-container': 'var(--primary-container)',
          'on-primary-container': 'var(--on-primary-container)',
          'inverse-primary': 'var(--inverse-primary)',
          'primary-fixed': 'var(--primary-fixed)',
          'on-primary-fixed': 'var(--on-primary-fixed)',
          secondary: 'var(--secondary)',
          'on-secondary': 'var(--on-secondary)',
          'secondary-container': 'var(--secondary-container)',
          'on-secondary-container': 'var(--on-secondary-container)',
          'tertiary-container': '#d6e3ff',
          error: 'var(--error)',
          'on-error': 'var(--on-error)',
          'error-container': 'var(--error-container)',
          'on-error-container': 'var(--on-error-container)',
          white: '#ffffff',
        },
        fontFamily: {
          mono: "'JetBrains Mono', monospace",
          body: "'Inter', sans-serif",
        },
        spacing: {
          gutter: 'var(--gutter)',
          'margin-mobile': 'var(--margin-mobile)',
          'margin-desktop': 'var(--margin-desktop)',
          'stack-sm': 'var(--stack-sm)',
          'stack-md': 'var(--stack-md)',
          'stack-lg': 'var(--stack-lg)',
        },
      },
      shortcuts: {
        'font-headline-md': 'font-mono text-[20px] font-semibold leading-[28px]',
        'font-headline-lg': 'font-mono text-[28px] font-semibold leading-[36px]',
        'font-label-caps': 'font-mono text-[12px] font-bold leading-[16px] tracking-[0.05em]',
        'font-data-display': 'font-mono text-[24px] font-bold leading-[24px]',
        'font-body-lg': 'font-body text-[16px] leading-[24px]',
        'font-body-sm': 'font-body text-[14px] leading-[20px]',
        'text-headline-md': 'text-[20px] leading-[28px]',
        'text-headline-lg': 'text-[28px] leading-[36px]',
        'text-label-caps': 'text-[12px] leading-[16px]',
        'text-data-display': 'text-[24px] leading-[24px]',
        'text-body-lg': 'text-[16px] leading-[24px]',
        'text-body-sm': 'text-[14px] leading-[20px]',
        'custom-scrollbar': 'scrollbar-thin',
      },
    }),
    preact(),
  ],
})
