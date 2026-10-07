import plugin from 'tailwindcss/plugin';

/**
 * GLASS MONOLITH cut-corner system.
 * Sharp 45-degree cuts via clip-path polygon. NO rounded corners anywhere.
 */
const CUT_SIZES = { sm: '8px', md: '14px', lg: '22px' };

// Symmetric dual-corner cut (top-right + bottom-left) — the signature panel shape.
const cutDual = (c) =>
  `polygon(0 0, calc(100% - ${c}) 0, 100% ${c}, 100% 100%, ${c} 100%, 0 calc(100% - ${c}))`;

// Single corner tag cut (top-right only).
const cutTag = (c) => `polygon(0 0, calc(100% - ${c}) 0, 100% ${c}, 100% 100%, 0 100%)`;

// Full quad cut (all four corners nicked).
const cutQuad = (c) =>
  `polygon(${c} 0, calc(100% - ${c}) 0, 100% ${c}, 100% calc(100% - ${c}), calc(100% - ${c}) 100%, ${c} 100%, 0 calc(100% - ${c}), 0 ${c})`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // MONOSPACE ONLY. Both stacks resolve to mono per the visual language.
        mono: ['"JetBrains Mono"', '"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['"JetBrains Mono"', '"Space Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        void: {
          950: '#030304', // deep dark space background
          900: '#050607',
          800: '#0a0d0e',
          700: '#111517',
        },
        chrome: {
          DEFAULT: '#c8ccd2', // chrome silver
          dim: '#7d838c',
          faint: '#3a3f45',
        },
        blood: {
          DEFAULT: '#ff2d55', // blood red
          dim: '#8f1030',
          deep: '#3d0513',
        },
        toxic: {
          DEFAULT: '#00ff66', // toxic green
          dim: '#0a5c2c',
          deep: '#03240f',
        },
        bone: '#ededef', // cold white
      },
      boxShadow: {
        'glow-green': '0 0 12px rgba(0,255,102,0.55), 0 0 42px rgba(0,255,102,0.18)',
        'glow-red': '0 0 12px rgba(255,45,85,0.6), 0 0 42px rgba(255,45,85,0.22)',
        'glow-white': '0 0 10px rgba(237,237,239,0.5), 0 0 34px rgba(237,237,239,0.16)',
        'panel': '0 24px 80px rgba(0,0,0,0.65)',
      },
      backdropBlur: {
        '3xl': '64px',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        // ---- Cut-corner clip paths (45-degree) ----
        '.clip-cut-sm': { clipPath: cutDual(CUT_SIZES.sm) },
        '.clip-cut': { clipPath: cutDual(CUT_SIZES.md) },
        '.clip-cut-lg': { clipPath: cutDual(CUT_SIZES.lg) },
        '.clip-tag': { clipPath: cutTag(CUT_SIZES.md) },
        '.clip-tag-sm': { clipPath: cutTag(CUT_SIZES.sm) },
        '.clip-quad': { clipPath: cutQuad(CUT_SIZES.sm) },
        // Sharp rhombus for heatmap cells (pointed, never square).
        '.clip-diamond': { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
        '.clip-rhombus': { clipPath: 'polygon(18% 0%, 100% 0%, 82% 100%, 0% 100%)' },

        // ---- Glassmorphism ----
        '.glass': {
          backgroundColor: 'rgba(0,0,0,0.60)',
          backdropFilter: 'blur(32px) saturate(140%)',
          WebkitBackdropFilter: 'blur(32px) saturate(140%)',
        },
        '.glass-deep': {
          backgroundColor: 'rgba(0,0,0,0.78)',
          backdropFilter: 'blur(48px) saturate(160%)',
          WebkitBackdropFilter: 'blur(48px) saturate(160%)',
        },

        // ---- Neon text ----
        '.text-glow-green': { textShadow: '0 0 8px rgba(0,255,102,0.8), 0 0 28px rgba(0,255,102,0.35)' },
        '.text-glow-red': { textShadow: '0 0 8px rgba(255,45,85,0.8), 0 0 28px rgba(255,45,85,0.35)' },
        '.text-glow-white': { textShadow: '0 0 8px rgba(237,237,239,0.65), 0 0 26px rgba(237,237,239,0.28)' },

        // ---- HUD chrome hairline borders ----
        '.border-chrome': { borderColor: 'rgba(255,255,255,0.20)' },
      });
    }),
  ],
};
