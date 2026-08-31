import { SimpleGrid, VStack, HStack, Text, List, ListItem } from '@chakra-ui/react'
import { useOutletContext } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format } from 'date-fns'
import type { TripOutletContext } from 'Components/TripLayout'
import { useGetDashboardChartsQuery, useGetDashboardSummaryQuery, useGetTripTimelineQuery } from 'Services/Api/dashboard.api'
import { BalanceCard } from 'Components/BalanceCard'
import { ChartCard } from 'Components/ChartCard'
import { MemberAvatar, colorForUid } from 'Components/MemberAvatar'
import { CardSkeleton } from 'Components/LoadingSkeleton'
import { EmptyState } from 'Components/EmptyState'
import { formatCurrency } from 'Features/Schema/splitUtils'

const PIE_PALETTE = ['#0E7C74', '#33A695', '#7ECB94', '#E5B361', '#C24630', '#7B4F9E', '#3B6EA5', '#586360']

function currencyTooltipFormatter(currency: string) {
  return (value: number | string | readonly (number | string)[] | undefined) =>
    formatCurrency(Number(Array.isArray(value) ? value[0] : (value ?? 0)), currency)
}

function Dashboard() {
  const { trip, currentUid } = useOutletContext<TripOutletContext>()
  const { data: summaryData, isLoading: isSummaryLoading } = useGetDashboardSummaryQuery(trip.id)
  const { data: chartsData, isLoading: isChartsLoading } = useGetDashboardChartsQuery(trip.id)
  const { data: timelineData, isLoading: isTimelineLoading } = useGetTripTimelineQuery({ tripId: trip.id, limit: 15 })

  const summary = summaryData?.data
  const charts = chartsData?.data
  const timeline = timelineData?.data ?? []

  if (isSummaryLoading) {
    return (
      <VStack align="stretch" spacing={4}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} height="90px" />
          ))}
        </SimpleGrid>
        <CardSkeleton height="260px" />
      </VStack>
    )
  }

  return (
    <VStack align="stretch" spacing={6}>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
        <BalanceCard label="Total expense" amount={summary?.totalExpense ?? 0} currency={trip.currency} />
        <BalanceCard label="Your expense" amount={summary?.yourExpense ?? 0} currency={trip.currency} />
        <BalanceCard label="You owe" amount={-(summary?.youOwe ?? 0)} currency={trip.currency} tone="signed" />
        <BalanceCard label="You get back" amount={summary?.youGet ?? 0} currency={trip.currency} tone="signed" />
      </SimpleGrid>

      <VStack align="stretch" spacing={3} bg="white" borderRadius="xl" boxShadow="cardShadow" p={4}>
        <Text fontWeight={700} fontSize="sm" color="ink.900">
          Member balances
        </Text>
        {!summary?.memberBalances.length ? (
          <Text fontSize="sm" color="ink.500">
            No balances yet.
          </Text>
        ) : (
          <List spacing={3}>
            {summary.memberBalances.map((mb) => (
              <ListItem key={mb.uid}>
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <MemberAvatar uid={mb.uid} name={mb.name} size="xs" />
                    <Text fontSize="sm" color="ink.800">
                      {mb.uid === currentUid ? 'You' : mb.name}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight={700} color={mb.net >= 0 ? 'positive.700' : 'negative.700'}>
                    {mb.net >= 0 ? '+' : '-'}
                    {formatCurrency(Math.abs(mb.net), trip.currency)}
                  </Text>
                </HStack>
              </ListItem>
            ))}
          </List>
        )}
      </VStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        <ChartCard title="Spend by category" isEmpty={!isChartsLoading && !charts?.byCategory.length}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts?.byCategory ?? []}
                dataKey="amount"
                nameKey="category"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
              >
                {(charts?.byCategory ?? []).map((entry, i) => (
                  <Cell key={entry.category} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={currencyTooltipFormatter(trip.currency)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Spend by member" isEmpty={!isChartsLoading && !charts?.byMember.length}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts?.byMember ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chakra-colors-ink-100)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--chakra-colors-ink-400)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--chakra-colors-ink-400)" width={40} />
              <Tooltip formatter={currencyTooltipFormatter(trip.currency)} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {(charts?.byMember ?? []).map((entry) => (
                  <Cell key={entry.uid} fill={colorForUid(entry.uid)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </SimpleGrid>

      <ChartCard title="Spending over time" isEmpty={!isChartsLoading && !charts?.timeline.length} height={220}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={charts?.timeline ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chakra-colors-ink-100)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              stroke="var(--chakra-colors-ink-400)"
              tickFormatter={(d: string) => {
                try {
                  return format(new Date(d), 'MMM d')
                } catch {
                  return d
                }
              }}
            />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--chakra-colors-ink-400)" width={40} />
            <Tooltip formatter={currencyTooltipFormatter(trip.currency)} />
            <Line type="monotone" dataKey="amount" stroke="#0E7C74" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <VStack align="stretch" spacing={3} bg="white" borderRadius="xl" boxShadow="cardShadow" p={4}>
        <Text fontWeight={700} fontSize="sm" color="ink.900">
          Activity
        </Text>
        {isTimelineLoading ? (
          <CardSkeleton height="120px" />
        ) : timeline.length === 0 ? (
          <EmptyState title="No activity yet" description="Actions on this trip will show up here." />
        ) : (
          <VStack align="stretch" spacing={0} divider={<Text as="hr" borderColor="ink.100" />}>
            {timeline.map((activity) => (
              <HStack key={activity.id} py={2.5} align="flex-start" justify="space-between">
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="sm" color="ink.800">
                    {activity.title}
                  </Text>
                  <Text fontSize="xs" color="ink.500">
                    {activity.body}
                  </Text>
                </VStack>
                <Text fontSize="xs" color="ink.400" flexShrink={0} whiteSpace="nowrap">
                  {(() => {
                    try {
                      return format(new Date(activity.createdAt), 'MMM d, h:mm a')
                    } catch {
                      return ''
                    }
                  })()}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    </VStack>
  )
}

export default Dashboard
