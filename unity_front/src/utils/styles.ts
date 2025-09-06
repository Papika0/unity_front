/**
 * Common component style classes that can be reused across components
 * These classes help reduce repetition of complex Tailwind class combinations
 */

export const commonStyles = {
  // Typography
  heading: {
    section: 'text-lg font-normal font-roboto leading-normal',
    subsection: 'text-xl font-normal font-roboto leading-loose',
  },

  // Text content
  text: {
    body: 'text-base font-normal font-roboto leading-relaxed',
    link: 'text-xl font-normal font-roboto leading-relaxed',
    small: 'text-xs font-normal font-roboto leading-3',
  },

  // Interactive elements
  interactive: {
    transition: 'transition-colors duration-200',
    hover: 'hover:text-zinc-600',
  },

  // Layout
  spacing: {
    section: 'mb-6',
    list: 'space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-4 gap-8',
  },

  // Colors
  colors: {
    primary: 'text-zinc-900',
    accent: 'text-red-700 hover:text-red-800',
  },
}

/**
 * Utility function to combine common style patterns
 */
export function combineClasses(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Common button style combinations
 */
export const buttonStyles = {
  primary:
    'px-6 py-3 bg-zinc-900 text-white text-sm font-normal font-roboto uppercase leading-relaxed tracking-widest hover:bg-zinc-800 transition-colors duration-200 text-center',
  outline:
    'px-6 py-3 border border-zinc-900 text-zinc-900 text-sm font-normal font-roboto uppercase leading-relaxed tracking-widest hover:bg-zinc-900 hover:text-white transition-colors duration-200 text-center',
}

/**
 * Common link style combinations
 */
export const linkStyles = {
  footer: 'text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600',
  header: 'text-base xl:text-lg font-medium transition-colors duration-200',
  small: 'text-xs font-normal font-roboto leading-3 text-red-700 hover:text-red-800',
}
