import { HStack, Text } from '@chakra-ui/react'
import type { SplitType } from 'Features/Schema/types'

const OPTIONS: { value: SplitType; label: string }[] = [
  { value: 'equal', label: 'Equal' },
  { value: 'exact', label: 'Exact' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'shares', label: 'Shares' },
]

interface SplitTypeSelectorProps {
  value: SplitType
  onChange: (value: SplitType) => void
}

export function SplitTypeSelector({ value, onChange }: SplitTypeSelectorProps) {
  return (
    <HStack
      as="div"
      role="radiogroup"
      aria-label="Split type"
      spacing={1}
      bg="ink.100"
      borderRadius="lg"
      p={1}
      w="full"
    >
      {OPTIONS.map((opt) => {
        const selected = value === opt.value
        return (
          <Text
            as="button"
            type="button"
            role="radio"
            aria-checked={selected}
            key={opt.value}
            onClick={() => onChange(opt.value)}
            flex={1}
            textAlign="center"
            fontSize="sm"
            fontWeight={600}
            py={1.5}
            borderRadius="md"
            color={selected ? 'primary.700' : 'ink.600'}
            bg={selected ? 'white' : 'transparent'}
            boxShadow={selected ? 'cardShadow' : 'none'}
            transition="background-color 150ms ease-out, color 150ms ease-out, box-shadow 150ms ease-out"
            _focusVisible={{ boxShadow: '0 0 0 2px var(--chakra-colors-primary-300)', outline: 'none' }}
            _hover={{ color: 'primary.700' }}
          >
            {opt.label}
          </Text>
        )
      })}
    </HStack>
  )
}
