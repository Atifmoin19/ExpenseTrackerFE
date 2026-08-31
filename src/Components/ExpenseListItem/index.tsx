import { Badge, HStack, Text, VStack } from '@chakra-ui/react'
import type { Expense } from 'Features/Schema/types'
import { computeYourShare, formatCurrency } from 'Features/Schema/splitUtils'
import { CategoryIcon } from 'Components/CategoryIcon'

interface ExpenseListItemProps {
  expense: Expense
  currentUserUid: string
  memberNameByUid: Record<string, string>
  onClick?: () => void
}

export function ExpenseListItem({ expense, currentUserUid, memberNameByUid, onClick }: ExpenseListItemProps) {
  const paidByName =
    expense.paidBy === currentUserUid ? 'You' : memberNameByUid[expense.paidBy] ?? 'Someone'

  const yourShare = computeYourShare(expense, currentUserUid)

  return (
    <HStack
      as="button"
      type="button"
      onClick={onClick}
      w="full"
      spacing={3}
      py={3}
      px={2}
      borderRadius="lg"
      textAlign="left"
      transition="background-color 120ms ease-out"
      _hover={{ bg: 'ink.50' }}
      _focusVisible={{ boxShadow: '0 0 0 2px var(--chakra-colors-primary-300)', outline: 'none' }}
      _active={{ transform: 'scale(0.99)' }}
    >
      <CategoryIcon category={expense.category} />
      <VStack align="flex-start" spacing={0.5} flex={1} minW={0}>
        <HStack spacing={2} w="full">
          <Text fontWeight={600} fontSize="sm" color="ink.900" noOfLines={1}>
            {expense.description}
          </Text>
          {expense.pendingSync && (
            <Badge colorScheme="orange" fontSize="0.6rem" borderRadius="full" flexShrink={0}>
              offline · will sync
            </Badge>
          )}
        </HStack>
        <Text fontSize="xs" color="ink.500" noOfLines={1}>
          {paidByName} paid {formatCurrency(expense.amount, expense.currency)}
        </Text>
      </VStack>
      <VStack align="flex-end" spacing={0} flexShrink={0} maxW="150px">
        <Text
          fontSize="xs"
          fontWeight={600}
          textAlign="right"
          noOfLines={1}
          color={
            yourShare.tone === 'positive'
              ? 'positive.700'
              : yourShare.tone === 'negative'
                ? 'negative.700'
                : 'ink.400'
          }
        >
          {yourShare.primary}
        </Text>
        {yourShare.secondary && (
          <Text fontSize="xs" color="positive.600" textAlign="right" noOfLines={1}>
            {yourShare.secondary}
          </Text>
        )}
      </VStack>
    </HStack>
  )
}
