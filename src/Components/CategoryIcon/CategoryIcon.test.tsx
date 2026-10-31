import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { FiCoffee, FiPackage } from 'react-icons/fi'
import { CategoryIcon, categoryIcon } from 'Components/CategoryIcon'

describe('CategoryIcon', () => {
  it('maps known categories and falls back to the package icon', () => {
    expect(categoryIcon('Food & Drink')).toBe(FiCoffee)
    expect(categoryIcon('Unknown')).toBe(FiPackage)
    expect(categoryIcon(undefined)).toBe(FiPackage)

    const { container } = render(
      <ChakraProvider>
        <CategoryIcon category="Transport" />
      </ChakraProvider>,
    )
    expect(container.querySelector('svg')).not.toBeNull()
  })
})
