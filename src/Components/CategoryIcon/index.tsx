import { Box } from '@chakra-ui/react'

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Drink': '🍔',
  Transport: '🚕',
  Lodging: '🏨',
  Activities: '🎟️',
  Shopping: '🛍️',
  Groceries: '🛒',
  Utilities: '💡',
  Other: '📦',
}

export function categoryEmoji(category?: string): string {
  if (!category) return '📦'
  return CATEGORY_ICONS[category] ?? '📦'
}

interface CategoryIconProps {
  category?: string
  size?: string
}

export function CategoryIcon({ category, size = '40px' }: CategoryIconProps) {
  return (
    <Box
      w={size}
      h={size}
      borderRadius="lg"
      bg="primary.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="1.1rem"
      flexShrink={0}
      aria-hidden="true"
    >
      {categoryEmoji(category)}
    </Box>
  )
}
