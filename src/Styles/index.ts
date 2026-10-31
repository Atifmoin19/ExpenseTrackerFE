import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

/**
 * Design system tokens for All Square.
 *
 * Accent: deep teal (money + travel, distinct from the generic AI blue/purple).
 * Neutrals are tinted very slightly toward the accent hue rather than pure gray.
 * Semantic colors: `positive` (you are owed / green) and `negative` (you owe / coral).
 */

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

export const theme = extendTheme({
  config,
  components: {
    Alert: {
      baseStyle: {
        container: { borderRadius: '12px', fontSize: '14px' },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: '12px',
        _focusVisible: { boxShadow: '0 0 0 3px var(--chakra-colors-primary-200)' },
      },
      defaultProps: { colorScheme: 'primary' },
    },
    Input: {
      defaultProps: { focusBorderColor: 'primary.500' },
    },
    Textarea: {
      defaultProps: { focusBorderColor: 'primary.500' },
    },
    Select: {
      defaultProps: { focusBorderColor: 'primary.500' },
    },
    Card: {
      baseStyle: {
        container: { borderRadius: '16px' },
      },
    },
    Modal: {
      baseStyle: {
        dialogContainer: { overscrollBehavior: 'contain' },
        body: { overscrollBehavior: 'contain' },
      },
    },
    Popover: {
      baseStyle: {
        body: { overscrollBehavior: 'contain' },
      },
    },
    Tabs: {
      defaultProps: { colorScheme: 'primary' },
    },
    Switch: {
      defaultProps: { colorScheme: 'primary' },
    },
    Checkbox: {
      defaultProps: { colorScheme: 'primary' },
    },
    Radio: {
      defaultProps: { colorScheme: 'primary' },
    },
    Progress: {
      defaultProps: { colorScheme: 'primary' },
    },
  },
  colors: {
    // Deep teal accent
    primary: {
      10: '#F4FAF9',
      50: '#E6F5F3',
      100: '#C2E7E2',
      200: '#93D3CA',
      300: '#5FBDB0',
      400: '#33A695',
      500: '#0E7C74',
      600: '#0B6560',
      700: '#094F4C',
      800: '#073B39',
      900: '#052928',
    },
    // Warm ink neutrals, very slightly teal-tinted (never pure black/white)
    ink: {
      50: '#F7F8F8',
      100: '#EEF0F0',
      200: '#DCE0DF',
      300: '#C1C7C6',
      400: '#9CA5A3',
      500: '#75807E',
      600: '#586360',
      700: '#414A48',
      800: '#2A302F',
      900: '#181C1B',
      950: '#0E1110',
    },
    // Positive = you are owed money (green)
    positive: {
      50: '#EAF7EE',
      100: '#CDECD6',
      300: '#7ECB94',
      500: '#2E9E58',
      600: '#238046',
      700: '#1B6337',
    },
    // Negative = you owe money (coral/red)
    negative: {
      50: '#FDEEEC',
      100: '#FAD3CD',
      300: '#F09E8E',
      500: '#E15A41',
      600: '#C24630',
      700: '#993623',
    },
    gray2: {
      50: '#f2f2f2',
      100: '#d9d9d9',
      300: '#bbbbbb',
      500: '#9d9d9d',
      700: '#808080',
      900: '#616161',
    },
  },
  fonts: {
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    heading: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.8125rem',
    md: '0.9375rem',
    lg: '1.0625rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  shadows: {
    all: '0 0 10px 1px rgba(0,0,0,0.3)',
    onlyBottom: 'rgba(0, 0, 0, 0.15) 0px 1.95px 2.6px',
    cardShadow: '0 1px 2px rgba(14, 17, 16, 0.06), 0 4px 12px rgba(14, 17, 16, 0.06)',
    cardShadowHover: '0 2px 4px rgba(14, 17, 16, 0.08), 0 8px 20px rgba(14, 17, 16, 0.10)',
    none: 'none',
  },
  radii: {
    sm: '8px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    '2xl': '22px',
  },
  breakpoints: {
    xs: '300px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    '2xl': '1400px',
    '3xl': '1600px',
    '4xl': '1900px',
  },
  styles: {
    global: {
      'html, body': {
        background: 'ink.50',
        color: 'ink.900',
        fontVariantNumeric: 'tabular-nums',
      },
      '*::selection': {
        background: 'primary.200',
      },
    },
  },
})
