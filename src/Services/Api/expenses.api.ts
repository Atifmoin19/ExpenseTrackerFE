import { appApi } from 'Services/Api/app.api'
import { TRIP_EXPENSES, TRIP_EXPENSE_DETAIL } from 'Constants/endpoints'
import type { ApiEnvelope, Expense, ExpenseSplit, SplitType } from 'Features/Schema/types'
import { generateLocalId, queueExpenseOffline } from 'Services/offlineQueue'

export interface ListExpensesParams {
  tripId: string
  limit?: number
  cursor?: string
  category?: string
  memberId?: string
  dateFrom?: string
  dateTo?: string
}

export interface CreateExpensePayload {
  description: string
  amount: number
  currency: string
  category?: string
  notes?: string
  tags?: string[]
  receiptUrl?: string
  paidBy: string
  splitType: SplitType
  splits: ExpenseSplit[]
  date: string
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>

export const expensesApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    listExpenses: builder.query<ApiEnvelope<Expense[]>, ListExpensesParams>({
      query: ({ tripId, ...params }) => ({ url: TRIP_EXPENSES(tripId), method: 'GET', params }),
      providesTags: (result, _error, { tripId }) =>
        result?.data
          ? [
              ...result.data.map((e) => ({ type: 'Expense' as const, id: e.id })),
              { type: 'ExpenseList' as const, id: tripId },
            ]
          : [{ type: 'ExpenseList' as const, id: tripId }],
    }),
    getExpense: builder.query<ApiEnvelope<Expense>, { tripId: string; expenseId: string }>({
      query: ({ tripId, expenseId }) => ({ url: TRIP_EXPENSE_DETAIL(tripId, expenseId), method: 'GET' }),
      providesTags: (_result, _error, { expenseId }) => [{ type: 'Expense', id: expenseId }],
    }),
    createExpense: builder.mutation<
      ApiEnvelope<Expense>,
      { tripId: string; body: CreateExpensePayload; optimisticListArgs?: ListExpensesParams[]; localId?: string }
    >({
      query: ({ tripId, body, localId }) => ({
        url: TRIP_EXPENSES(tripId),
        method: 'POST',
        body,
        headers: localId ? { 'X-Offline-Local-Id': localId } : undefined,
      }),
      async onQueryStarted({ tripId, body, optimisticListArgs, localId: argLocalId }, { dispatch, queryFulfilled }) {
        const localId = argLocalId ?? generateLocalId()
        const optimisticExpense: Expense = {
          id: localId,
          tripId,
          description: body.description,
          amount: body.amount,
          currency: body.currency,
          category: body.category,
          notes: body.notes,
          tags: body.tags ?? [],
          receiptUrl: body.receiptUrl,
          paidBy: body.paidBy,
          splitType: body.splitType,
          splits: body.splits,
          createdBy: body.paidBy,
          date: body.date,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pendingSync: true,
        }
        const argsList = optimisticListArgs && optimisticListArgs.length ? optimisticListArgs : [{ tripId }]
        const patches = argsList.map((args) =>
          dispatch(
            expensesApi.util.updateQueryData('listExpenses', args, (draft) => {
              if (draft?.data) draft.data.unshift(optimisticExpense)
            }),
          ),
        )
        try {
          await queryFulfilled
        } catch (err) {
          const apiError = (err as { error?: { status?: number } })?.error
          const isNetworkFailure = apiError && apiError.status === undefined
          if (isNetworkFailure) {
            // Offline (or the request never reached the server): keep the
            // optimistic row (badge shows "offline — will sync") and persist
            // it so the service worker / reconnect handler can replay it.
            await queueExpenseOffline(localId, tripId, body)
          } else {
            patches.forEach((p) => p.undo())
          }
        }
      },
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'ExpenseList', id: tripId },
        { type: 'Dashboard', id: tripId },
        { type: 'Timeline', id: tripId },
      ],
    }),
    updateExpense: builder.mutation<
      ApiEnvelope<Expense>,
      { tripId: string; expenseId: string; body: UpdateExpensePayload }
    >({
      query: ({ tripId, expenseId, body }) => ({ url: TRIP_EXPENSE_DETAIL(tripId, expenseId), method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { tripId, expenseId }) => [
        { type: 'Expense', id: expenseId },
        { type: 'ExpenseList', id: tripId },
        { type: 'Dashboard', id: tripId },
        { type: 'Timeline', id: tripId },
      ],
    }),
    deleteExpense: builder.mutation<ApiEnvelope<null>, { tripId: string; expenseId: string }>({
      query: ({ tripId, expenseId }) => ({ url: TRIP_EXPENSE_DETAIL(tripId, expenseId), method: 'DELETE' }),
      invalidatesTags: (_result, _error, { tripId, expenseId }) => [
        { type: 'Expense', id: expenseId },
        { type: 'ExpenseList', id: tripId },
        { type: 'Dashboard', id: tripId },
        { type: 'Timeline', id: tripId },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useListExpensesQuery,
  useGetExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi
