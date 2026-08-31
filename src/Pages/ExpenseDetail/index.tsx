import { useMemo } from 'react'
import { Box, Button, Divider, HStack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { Link as RouterLink, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { FiEdit2, FiInfo, FiTrash2 } from 'react-icons/fi'
import type { TripOutletContext } from 'Components/TripLayout'
import { useDeleteExpenseMutation, useGetExpenseQuery } from 'Services/Api/expenses.api'
import { useGetDashboardSummaryQuery } from 'Services/Api/dashboard.api'
import { CategoryIcon } from 'Components/CategoryIcon'
import { MemberAvatar } from 'Components/MemberAvatar'
import { ConfirmDialog } from 'Components/ConfirmDialog'
import { EmptyState } from 'Components/EmptyState'
import { CardSkeleton } from 'Components/LoadingSkeleton'
import { computeYourShare, formatCurrency } from 'Features/Schema/splitUtils'
import { useAssetUrl } from 'Features/Hooks/useAssetUrl'
import { useAppToast } from 'Features/Hooks/useAppToast'

function ExpenseDetail() {
  const { trip, members, currentUid, isAdmin } = useOutletContext<TripOutletContext>()
  const { expenseId = '' } = useParams<{ expenseId: string }>()
  const navigate = useNavigate()
  const toast = useAppToast()
  const deleteDisclosure = useDisclosure()

  const { data, isLoading, isError } = useGetExpenseQuery({ tripId: trip.id, expenseId }, { skip: !expenseId })
  // Not tied to this one expense — memberBalances is the trip's overall net
  // position per member (all expenses + settlements combined), used below to
  // give honest "where things stand now" context rather than a fake
  // per-expense settled flag that isn't backed by real data.
  const { data: summaryData } = useGetDashboardSummaryQuery(trip.id)
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation()

  const expense = data?.data
  const resolvedReceiptUrl = useAssetUrl(expense?.receiptUrl)

  const memberByUid = useMemo(() => Object.fromEntries(members.map((m) => [m.uid, m])), [members])
  const balanceByUid = useMemo(
    () => Object.fromEntries((summaryData?.data?.memberBalances ?? []).map((mb) => [mb.uid, mb.net])),
    [summaryData],
  )

  const canEdit = !!expense && (isAdmin || expense.createdBy === currentUid)

  const handleDelete = async () => {
    if (!expense) return
    try {
      await deleteExpense({ tripId: trip.id, expenseId: expense.id }).unwrap()
      toast.success('Expense deleted')
      navigate(`/trips/${trip.id}/expenses`)
    } catch (err) {
      toast.error('Could not delete expense', err)
    } finally {
      deleteDisclosure.onClose()
    }
  }

  if (isLoading) {
    return (
      <VStack align="stretch" spacing={4} maxW="640px">
        <CardSkeleton height="80px" />
        <CardSkeleton height="260px" />
      </VStack>
    )
  }

  if (isError || !expense) {
    return (
      <EmptyState
        icon={<FiInfo size={40} color="var(--chakra-colors-ink-400)" />}
        title="Expense not found"
        description="This expense may have been deleted, or you no longer have access."
      />
    )
  }

  const paidByMember = memberByUid[expense.paidBy]
  const paidByName = expense.paidBy === currentUid ? 'You' : (paidByMember?.displayName ?? 'Someone')
  const yourShare = computeYourShare(expense, currentUid)

  let dateLabel = expense.date
  try {
    dateLabel = format(new Date(expense.date), 'EEEE, MMM d, yyyy')
  } catch {
    // keep raw string
  }

  return (
    <VStack align="stretch" spacing={6} maxW="640px">
      <VStack align="stretch" spacing={5} bg="white" p={{ base: 5, md: 7 }} borderRadius="xl" boxShadow="cardShadow">
        <HStack spacing={4} align="flex-start">
          <CategoryIcon category={expense.category} size="48px" />
          <VStack align="flex-start" spacing={0.5} flex={1} minW={0}>
            <Text fontSize="lg" fontWeight={800} color="ink.900" fontFamily="heading" noOfLines={2}>
              {expense.description}
            </Text>
            <Text fontSize="sm" color="ink.500">
              {expense.category ?? 'Uncategorized'} · {dateLabel}
            </Text>
          </VStack>
        </HStack>

        <VStack align="flex-start" spacing={0}>
          <Text fontSize="xs" color="ink.500" textTransform="uppercase" letterSpacing="0.04em" fontWeight={600}>
            Total amount
          </Text>
          <Text fontSize="3xl" fontWeight={800} color="ink.900" fontFamily="heading">
            {formatCurrency(expense.amount, expense.currency)}
          </Text>
        </VStack>

        <HStack justify="space-between" p={3} borderRadius="lg" bg="ink.50">
          <HStack spacing={2}>
            <MemberAvatar uid={expense.paidBy} name={paidByName} photoUrl={paidByMember?.photoUrl} size="sm" />
            <Text fontSize="sm" color="ink.800">
              <b>{paidByName}</b> paid
            </Text>
          </HStack>
          <VStack align="flex-end" spacing={0}>
            <Text
              fontSize="sm"
              fontWeight={700}
              color={
                yourShare.tone === 'positive' ? 'positive.700' : yourShare.tone === 'negative' ? 'negative.700' : 'ink.700'
              }
            >
              {yourShare.primary}
            </Text>
            {yourShare.secondary && (
              <Text fontSize="xs" color="positive.600">
                {yourShare.secondary}
              </Text>
            )}
          </VStack>
        </HStack>

        {expense.notes && (
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="xs" fontWeight={600} color="ink.500" textTransform="uppercase" letterSpacing="0.04em">
              Notes
            </Text>
            <Text fontSize="sm" color="ink.700" whiteSpace="pre-wrap">
              {expense.notes}
            </Text>
          </VStack>
        )}

        {expense.receiptUrl && (
          <VStack align="flex-start" spacing={2}>
            <Text fontSize="xs" fontWeight={600} color="ink.500" textTransform="uppercase" letterSpacing="0.04em">
              Receipt
            </Text>
            <Box
              as="img"
              src={resolvedReceiptUrl}
              alt="Receipt"
              maxW="220px"
              maxH="280px"
              borderRadius="lg"
              objectFit="cover"
              boxShadow="cardShadow"
            />
          </VStack>
        )}

        <Divider borderColor="ink.100" />

        <VStack align="stretch" spacing={2}>
          <Text fontSize="xs" fontWeight={600} color="ink.500" textTransform="uppercase" letterSpacing="0.04em">
            Split breakdown
          </Text>
          <VStack align="stretch" spacing={0} divider={<Box borderBottomWidth="1px" borderColor="ink.100" />}>
            {expense.splits.map((s) => {
              const m = memberByUid[s.uid]
              const name = s.uid === currentUid ? 'You' : (m?.displayName ?? 'Former member')
              return (
                <HStack key={s.uid} justify="space-between" py={2}>
                  <HStack spacing={2}>
                    <MemberAvatar uid={s.uid} name={name} photoUrl={m?.photoUrl} size="xs" />
                    <Text fontSize="sm" color="ink.800" fontWeight={s.uid === currentUid ? 700 : 400}>
                      {name}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight={600} color="ink.700">
                    {formatCurrency(s.amount, expense.currency)}
                  </Text>
                </HStack>
              )
            })}
          </VStack>
        </VStack>

        <Divider borderColor="ink.100" />

        <VStack align="stretch" spacing={2}>
          <Text fontSize="xs" fontWeight={600} color="ink.500" textTransform="uppercase" letterSpacing="0.04em">
            Current balances
          </Text>
          <Text fontSize="xs" color="ink.500">
            These reflect every expense and settlement on this trip together, not just this one — this app doesn't
            track a per-expense "settled" state.
          </Text>
          <VStack align="stretch" spacing={1.5} pt={1}>
            {expense.splits.map((s) => {
              const net = balanceByUid[s.uid]
              const m = memberByUid[s.uid]
              const name = s.uid === currentUid ? 'You' : (m?.displayName ?? 'Former member')
              if (net === undefined) return null
              return (
                <HStack key={s.uid} justify="space-between">
                  <Text fontSize="xs" color="ink.600">
                    {name}
                  </Text>
                  <Text fontSize="xs" fontWeight={600} color={Math.abs(net) < 0.005 ? 'ink.500' : net > 0 ? 'positive.700' : 'negative.700'}>
                    {Math.abs(net) < 0.005
                      ? 'Settled up'
                      : `${net > 0 ? 'Owed' : 'Owes'} ${formatCurrency(Math.abs(net), trip.currency)} overall`}
                  </Text>
                </HStack>
              )
            })}
          </VStack>
        </VStack>

        {canEdit && (
          <HStack pt={2}>
            <Button
              as={RouterLink}
              to={`/trips/${trip.id}/expenses/${expense.id}/edit`}
              leftIcon={<FiEdit2 />}
              colorScheme="primary"
              flex={1}
            >
              Edit
            </Button>
            <Button leftIcon={<FiTrash2 />} variant="outline" colorScheme="red" onClick={deleteDisclosure.onOpen}>
              Delete
            </Button>
          </HStack>
        )}
      </VStack>

      <ConfirmDialog
        isOpen={deleteDisclosure.isOpen}
        onClose={deleteDisclosure.onClose}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete this expense?"
        description="This can't be undone. Everyone's balances on this trip will be recalculated."
        confirmLabel="Delete expense"
      />
    </VStack>
  )
}

export default ExpenseDetail
