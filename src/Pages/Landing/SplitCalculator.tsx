import { useState } from 'react'
import { Box, Flex, HStack, Input, InputGroup, InputLeftAddon, Text, VStack } from '@chakra-ui/react'
import { SplitTypeSelector } from 'Components/SplitTypeSelector'
import { formatCurrency } from 'Features/Schema/splitUtils'
import type { SplitType } from 'Features/Schema/types'
import { EXAMPLE_DEFAULT_AMOUNT, PERSON_COLORS, SPLIT_TYPE_COPY, exampleSplit } from './splitExample'

const motionSafe = '@media (prefers-reduced-motion: no-preference)'

/** Live demo of the real split rules (Features/Schema/splitUtils.resolveSplits,
 *  the same code the add-expense form uses). Not a screenshot. */
export function SplitCalculator() {
  const [type, setType] = useState<SplitType>('shares')
  const [raw, setRaw] = useState(String(EXAMPLE_DEFAULT_AMOUNT))
  const parsed = Number(raw)
  const amount = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 1_000_000) : 0
  const rows = exampleSplit(type, amount)

  return (
    <VStack
      align="stretch"
      spacing={4}
      bg="white"
      borderRadius="2xl"
      boxShadow="0 24px 60px -24px rgba(14, 124, 116, 0.35), 0 2px 6px rgba(24, 28, 27, 0.06)"
      border="1px solid"
      borderColor="ink.100"
      p={{ base: 4, sm: 6 }}
      w="full"
    >
      <Flex justify="space-between" align="center" gap={3}>
        <Box minW={0}>
          <Text fontSize="xs" fontWeight={700} color="primary.600" textTransform="uppercase" letterSpacing="0.08em">
            Try it
          </Text>
          <Text fontFamily="heading" fontWeight={700} color="ink.900" lineHeight={1.3}>
            Beach shack dinner
          </Text>
        </Box>
        <InputGroup size="sm" w="132px" flexShrink={0}>
          <InputLeftAddon>₹</InputLeftAddon>
          <Input
            aria-label="Bill amount in rupees"
            type="number"
            inputMode="decimal"
            min={0}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            fontWeight={600}
          />
        </InputGroup>
      </Flex>

      <SplitTypeSelector value={type} onChange={setType} />
      <Text fontSize="sm" color="ink.600" mt={-1}>
        {SPLIT_TYPE_COPY[type].blurb}
      </Text>

      <Flex h="10px" borderRadius="full" overflow="hidden" bg="ink.100" aria-hidden="true">
        {rows.map((row, i) => (
          <Box
            key={row.name}
            bg={PERSON_COLORS[i]}
            w={`${row.fraction * 100}%`}
            sx={{ [motionSafe]: { transition: 'width 0.35s ease' } }}
          />
        ))}
      </Flex>

      <VStack as="ul" align="stretch" spacing={2} listStyleType="none" aria-live="polite">
        {rows.map((row, i) => (
          <HStack as="li" key={row.name} justify="space-between" spacing={3}>
            <HStack spacing={2} minW={0}>
              <Box w="10px" h="10px" borderRadius="full" bg={PERSON_COLORS[i]} flexShrink={0} />
              <Text fontWeight={600} color="ink.800">
                {row.name}
              </Text>
              {row.label && (
                <Text fontSize="xs" color="ink.600" bg="ink.50" px={2} py={0.5} borderRadius="full">
                  {row.label}
                </Text>
              )}
            </HStack>
            <Text fontWeight={700} color="ink.900" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(row.amount, 'INR')}
            </Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  )
}
