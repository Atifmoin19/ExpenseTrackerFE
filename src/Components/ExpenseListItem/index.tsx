import { Badge, HStack, Text, VStack } from '@chakra-ui/react'
import type { Expense } from 'Features/Schema/types'
import { formatCurrency } from 'Features/Schema/splitUtils'
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

  const yourSplit = expense.splits.find((s) => s.uid === currentUserUid)
  const youPaid = expense.paidBy === currentUserUid

  let yourImpact: { label: string; amount: number; positive: boolean } | null = null
  if (youPaid) {
    const othersOwe = expense.amount - (yourSplit?.amount ?? 0)
    yourImpact = othersOwe > 0.005 ? { label: 'you lent', amount: othersOwe, positive: true } : null
  } else if (yourSplit) {
    yourImpact = { label: 'you owe', amount: yourSplit.amount, positive: false }
  }

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
      <VStack align="flex-end" spacing={0} flexShrink={0}>
        {yourImpact ? (
          <>
            <Text fontSize="xs" color="ink.500">
              {yourImpact.label}
            </Text>
            <Text fontWeight={700} fontSize="sm" color={yourImpact.positive ? 'positive.700' : 'negative.700'}>
              {formatCurrency(yourImpact.amount, expense.currency)}
            </Text>
          </>
        ) : (
          <Text fontSize="xs" color="ink.400">
            not involved
          </Text>
        )}
      </VStack>
    </HStack>
  )
}
