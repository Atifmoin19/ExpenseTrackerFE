import { Box, Text, VStack } from '@chakra-ui/react'
import { formatCurrency } from 'Features/Schema/splitUtils'

interface BalanceCardProps {
  label: string
  amount: number
  currency: string
  tone?: 'neutral' | 'signed'
  helpText?: string
}

/**
 * A single stat tile (total / your expense / you owe / you get). When
 * `tone="signed"`, positive amounts render green ("you get") and amounts
 * below zero render coral ("you owe") — the sign is never shown twice.
 */
export function BalanceCard({ label, amount, currency, tone = 'neutral', helpText }: BalanceCardProps) {
  const isSigned = tone === 'signed'
  const color = isSigned ? (amount >= 0 ? 'positive.700' : 'negative.700') : 'ink.900'
  const bg = isSigned ? (amount >= 0 ? 'positive.50' : 'negative.50') : 'white'

  return (
    <VStack
      align="flex-start"
      spacing={1}
      p={4}
      borderRadius="xl"
      bg={bg}
      boxShadow="cardShadow"
      minW={0}
    >
      <Text fontSize="xs" fontWeight={600} color="ink.500" textTransform="uppercase" letterSpacing="0.04em">
        {label}
      </Text>
      <Text
        fontSize="xl"
        fontWeight={800}
        color={color}
        fontFamily="heading"
        noOfLines={1}
        sx={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {formatCurrency(Math.abs(amount), currency)}
      </Text>
      {helpText && (
        <Box fontSize="xs" color="ink.500">
          {helpText}
        </Box>
      )}
    </VStack>
  )
}
