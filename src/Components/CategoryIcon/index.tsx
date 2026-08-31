import { Box } from '@chakra-ui/react'
import {
  FiActivity,
  FiCoffee,
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiShoppingCart,
  FiTruck,
  FiZap,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

const CATEGORY_ICONS: Record<string, IconType> = {
  'Food & Drink': FiCoffee,
  Transport: FiTruck,
  Lodging: FiHome,
  Activities: FiActivity,
  Shopping: FiShoppingBag,
  Groceries: FiShoppingCart,
  Utilities: FiZap,
  Other: FiPackage,
}

export function categoryIcon(category?: string): IconType {
  if (!category) return FiPackage
  return CATEGORY_ICONS[category] ?? FiPackage
}

interface CategoryIconProps {
  category?: string
  size?: string
}

export function CategoryIcon({ category, size = '40px' }: CategoryIconProps) {
  const Icon = categoryIcon(category)
  return (
    <Box
      w={size}
      h={size}
      borderRadius="lg"
      bg="primary.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="primary.600"
      flexShrink={0}
      aria-hidden="true"
    >
      <Icon size={18} />
    </Box>
  )
}
