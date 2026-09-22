/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        card: 'var(--card-bg)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        accent: 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-contrast': 'var(--accent-contrast)',
        border: 'var(--border)',
        'priority-high': 'var(--priority-high)',
        'priority-mid': 'var(--priority-mid)',
        'priority-low': 'var(--priority-low)',
        'priority-high-soft': 'var(--priority-high-soft)',
        'priority-mid-soft': 'var(--priority-mid-soft)',
        'priority-low-soft': 'var(--priority-low-soft)',
      },
    },
  },
  plugins: [],
}
