import { useEffect, useMemo, useState } from 'react'
import { Box, Button, HStack, Input, Select, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react'
import { Link as RouterLink, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { format, isToday, isYesterday } from 'date-fns'
import type { TripOutletContext } from 'Components/TripLayout'
import { useListExpensesQuery, type ListExpensesParams } from 'Services/Api/expenses.api'
import { usePendingExpenses } from 'Features/Hooks/usePendingExpenses'
import { ExpenseListItem } from 'Components/ExpenseListItem'
import { ListSkeleton } from 'Components/LoadingSkeleton'
import { EmptyState } from 'Components/EmptyState'
import { EXPENSE_CATEGORIES } from 'Features/Schema/expense.schema'
import type { Expense } from 'Features/Schema/types'

function dateGroupLabel(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMM d')
}

function ExpenseList() {
  const { trip, members, currentUid } = useOutletContext<TripOutletContext>()
  const navigate = useNavigate()

  // Filters live in the URL so they're shareable/bookmarkable and survive back/forward navigation.
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? ''
  const memberId = searchParams.get('member') ?? ''
  const dateFrom = searchParams.get('from') ?? ''
  const dateTo = searchParams.get('to') ?? ''

  const setFilter = (key: 'category' | 'member' | 'from' | 'to', value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<Expense[]>([])

  const memberNameByUid = useMemo(
    () => Object.fromEntries(members.map((m) => [m.uid, m.displayName])),
    [members],
  )

  const queryArgs: ListExpensesParams = {
    tripId: trip.id,
    limit: 20,
    cursor,
    category: category || undefined,
    memberId: memberId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }

  const { data, isLoading, isFetching } = useListExpensesQuery(queryArgs)
  const pendingExpenses = usePendingExpenses(trip.id)

  // Reset pagination whenever filters change
  useEffect(() => {
    setCursor(undefined)
    setItems([])
  }, [category, memberId, dateFrom, dateTo])

  useEffect(() => {
    if (!data?.data) return
    setItems((prev) => (cursor ? [...prev, ...data.data] : data.data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const hasFilters = category || memberId || dateFrom || dateTo
  const allItems = useMemo(
    () => (!cursor && !hasFilters ? [...pendingExpenses, ...items] : items),
    [cursor, hasFilters, pendingExpenses, items],
  )

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const expense of allItems) {
      const key = expense.date?.slice(0, 10) ?? 'unknown'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(expense)
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [allItems])

  return (
    <VStack align="stretch" spacing={5}>
      <HStack justify="space-between">
        <Text fontSize="sm" color="ink.500">
          {allItems.length} expense{allItems.length === 1 ? '' : 's'}
        </Text>
        <Button as={RouterLink} to={`/trips/${trip.id}/expenses/new`} colorScheme="primary" size="sm">
          Add expense
        </Button>
      </HStack>

      <Wrap spacing={2}>
        <WrapItem>
          <Select
            size="sm"
            placeholder="Category"
            aria-label="Filter by category"
            value={category}
            onChange={(e) => setFilter('category', e.target.value)}
            w="150px"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </WrapItem>
        <WrapItem>
          <Select
            size="sm"
            placeholder="Paid by"
            aria-label="Filter by member"
            value={memberId}
            onChange={(e) => setFilter('member', e.target.value)}
            w="150px"
          >
            {members.map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.uid === currentUid ? 'You' : m.displayName}
              </option>
            ))}
          </Select>
        </WrapItem>
        <WrapItem>
          <Input
            size="sm"
            type="date"
            value={dateFrom}
            onChange={(e) => setFilter('from', e.target.value)}
            w="150px"
            aria-label="From date"
          />
        </WrapItem>
        <WrapItem>
          <Input
            size="sm"
            type="date"
            value={dateTo}
            onChange={(e) => setFilter('to', e.target.value)}
            w="150px"
            aria-label="To date"
          />
        </WrapItem>
        {!!hasFilters && (
          <WrapItem>
            <Button size="sm" variant="ghost" onClick={() => setSearchParams({}, { replace: true })}>
              Clear
            </Button>
          </WrapItem>
        )}
      </Wrap>

      {isLoading ? (
        <ListSkeleton />
      ) : allItems.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="No expenses yet"
          description={hasFilters ? 'Try adjusting your filters.' : 'Add the first expense for this trip.'}
          actionLabel={hasFilters ? undefined : 'Add expense'}
          onAction={hasFilters ? undefined : () => navigate(`/trips/${trip.id}/expenses/new`)}
        />
      ) : (
        <VStack align="stretch" spacing={4}>
          {groups.map(([dateKey, expenses]) => (
            <Box key={dateKey}>
              <Text fontSize="xs" fontWeight={700} color="ink.500" textTransform="uppercase" letterSpacing="0.04em" mb={1} px={1}>
                {dateGroupLabel(dateKey)}
              </Text>
              <VStack align="stretch" spacing={0} bg="white" borderRadius="xl" boxShadow="cardShadow" px={2} divider={<Box borderBottomWidth="1px" borderColor="ink.100" />}>
                {expenses.map((expense) => (
                  <ExpenseListItem
                    key={expense.id}
                    expense={expense}
                    currentUserUid={currentUid}
                    memberNameByUid={memberNameByUid}
                    onClick={() =>
                      !expense.pendingSync && navigate(`/trips/${trip.id}/expenses/${expense.id}/edit`)
                    }
                  />
                ))}
              </VStack>
            </Box>
          ))}

          {data?.meta?.hasMore && (
            <Button
              alignSelf="center"
              variant="outline"
              size="sm"
              isLoading={isFetching}
              onClick={() => data.meta?.cursor && setCursor(data.meta.cursor)}
            >
              Load more
            </Button>
          )}
        </VStack>
      )}
    </VStack>
  )
}

export default ExpenseList
