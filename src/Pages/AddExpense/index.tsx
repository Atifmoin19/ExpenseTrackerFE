import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  NumberInput,
  NumberInputField,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import type { TripOutletContext } from 'Components/TripLayout'
import { addExpenseSchema, EXPENSE_CATEGORIES, type AddExpenseFormValues } from 'Features/Schema/expense.schema'
import { resolveSplits, formatCurrency, type DraftSplitLine } from 'Features/Schema/splitUtils'
import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseQuery,
  useUpdateExpenseMutation,
} from 'Services/Api/expenses.api'
import { SplitTypeSelector } from 'Components/SplitTypeSelector'
import { MemberAvatar } from 'Components/MemberAvatar'
import { ConfirmDialog } from 'Components/ConfirmDialog'
import { useAppToast } from 'Features/Hooks/useAppToast'
import { useUnsavedChangesWarning } from 'Features/Hooks/useUnsavedChangesWarning'
import { generateLocalId } from 'Services/offlineQueue'
import { uploadImage } from 'Services/uploads'
import { useAssetUrl } from 'Features/Hooks/useAssetUrl'
import type { SplitType } from 'Features/Schema/types'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function AddExpense() {
  const { trip, members, currentUid, isAdmin } = useOutletContext<TripOutletContext>()
  const { expenseId } = useParams<{ expenseId: string }>()
  const isEditMode = !!expenseId
  const navigate = useNavigate()
  const toast = useAppToast()

  const { data: existing, isLoading: isLoadingExisting } = useGetExpenseQuery(
    { tripId: trip.id, expenseId: expenseId ?? '' },
    { skip: !isEditMode },
  )
  const [createExpense] = useCreateExpenseMutation()
  const [updateExpense] = useUpdateExpenseMutation()
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation()

  const [selectedUids, setSelectedUids] = useState<string[]>(members.map((m) => m.uid))
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({})
  const [percentages, setPercentages] = useState<Record<string, string>>({})
  const [sharesMap, setSharesMap] = useState<Record<string, string>>({})
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptLocalPreview, setReceiptLocalPreview] = useState<string | undefined>(undefined)
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false)
  // receiptUrl is a private object storage key once uploaded/loaded from the
  // server — resolve it for display; a freshly-picked file shows its local
  // blob preview instead (receiptLocalPreview) so there's no round trip.
  const resolvedReceiptUrl = useAssetUrl(receiptUrl)
  const receiptPreviewSrc = receiptLocalPreview ?? resolvedReceiptUrl

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AddExpenseFormValues>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
      currency: trip.currency,
      category: EXPENSE_CATEGORIES[0],
      notes: '',
      tags: [],
      paidBy: currentUid,
      date: todayIso(),
      splitType: 'equal',
      splits: [],
    },
  })

  const amount = watch('amount') || 0
  const splitType = watch('splitType')

  useUnsavedChangesWarning(isDirty && !isSubmitting)

  // Hydrate the form when editing an existing expense
  useEffect(() => {
    const e = existing?.data
    if (!e) return
    reset({
      description: e.description,
      amount: e.amount,
      currency: e.currency,
      category: e.category ?? EXPENSE_CATEGORIES[0],
      notes: e.notes ?? '',
      tags: e.tags,
      paidBy: e.paidBy,
      date: e.date?.slice(0, 10) ?? todayIso(),
      splitType: e.splitType,
      splits: e.splits,
    })
    setSelectedUids(e.splits.map((s) => s.uid))
    setExactAmounts(Object.fromEntries(e.splits.map((s) => [s.uid, String(s.amount ?? '')])))
    setPercentages(Object.fromEntries(e.splits.map((s) => [s.uid, String(s.percentage ?? '')])))
    setSharesMap(Object.fromEntries(e.splits.map((s) => [s.uid, String(s.shares ?? '')])))
    setTags(e.tags)
    setReceiptUrl(e.receiptUrl)
    setReceiptFile(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing])

  // Local blob preview for a freshly-picked receipt file (avoids waiting on
  // a view-endpoint round trip for something we already have bytes for).
  useEffect(() => {
    if (!receiptFile) {
      setReceiptLocalPreview(undefined)
      return
    }
    const url = URL.createObjectURL(receiptFile)
    setReceiptLocalPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [receiptFile])

  // Keep the RHF `splits` field in sync with the split editor's local state
  useEffect(() => {
    const lines: DraftSplitLine[] = selectedUids.map((uid) => ({
      uid,
      amount: exactAmounts[uid] !== undefined && exactAmounts[uid] !== '' ? Number(exactAmounts[uid]) : undefined,
      percentage: percentages[uid] !== undefined && percentages[uid] !== '' ? Number(percentages[uid]) : undefined,
      shares: sharesMap[uid] !== undefined && sharesMap[uid] !== '' ? Number(sharesMap[uid]) : undefined,
    }))
    setValue('splits', lines, { shouldValidate: false })
    setValue('tags', tags, { shouldValidate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUids, exactAmounts, percentages, sharesMap, tags])

  const toggleMember = (uid: string) => {
    setSelectedUids((prev) => (prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]))
  }

  const summary = useMemo(() => {
    const lines: DraftSplitLine[] = selectedUids.map((uid) => ({
      uid,
      amount: exactAmounts[uid] ? Number(exactAmounts[uid]) : undefined,
      percentage: percentages[uid] ? Number(percentages[uid]) : undefined,
      shares: sharesMap[uid] ? Number(sharesMap[uid]) : undefined,
    }))
    if (splitType === 'exact') {
      const sum = lines.reduce((acc, l) => acc + (l.amount ?? 0), 0)
      return { label: `${formatCurrency(sum, trip.currency)} of ${formatCurrency(amount, trip.currency)} assigned`, ok: Math.abs(sum - amount) < 0.01 }
    }
    if (splitType === 'percentage') {
      const sum = lines.reduce((acc, l) => acc + (l.percentage ?? 0), 0)
      return { label: `${sum.toFixed(1)}% of 100% assigned`, ok: Math.abs(sum - 100) < 0.01 }
    }
    if (splitType === 'shares') {
      const sum = lines.reduce((acc, l) => acc + (l.shares ?? 0), 0)
      return { label: `${sum} total share${sum === 1 ? '' : 's'}`, ok: sum > 0 }
    }
    return null
  }, [selectedUids, exactAmounts, percentages, sharesMap, splitType, amount, trip.currency])

  const previewSplits = useMemo(() => {
    const lines: DraftSplitLine[] = selectedUids.map((uid) => ({
      uid,
      amount: exactAmounts[uid] ? Number(exactAmounts[uid]) : undefined,
      percentage: percentages[uid] ? Number(percentages[uid]) : undefined,
      shares: sharesMap[uid] ? Number(sharesMap[uid]) : undefined,
    }))
    return resolveSplits(splitType, lines, amount || 0)
  }, [selectedUids, exactAmounts, percentages, sharesMap, splitType, amount])

  const handleReceiptChange = async (file: File | null) => {
    if (!file) return
    setIsUploadingReceipt(true)
    try {
      const key = await uploadImage(file, 'receipt')
      setReceiptUrl(key)
      setReceiptFile(file)
    } catch (err) {
      toast.error('Could not upload receipt', err)
    } finally {
      setIsUploadingReceipt(false)
    }
  }

  const addTag = () => {
    const value = tagDraft.trim()
    if (value && !tags.includes(value)) setTags((prev) => [...prev, value])
    setTagDraft('')
  }

  const onSubmit = async (values: AddExpenseFormValues) => {
    const resolved = resolveSplits(values.splitType, values.splits, values.amount)
    const body = {
      description: values.description,
      amount: values.amount,
      currency: values.currency,
      category: values.category,
      notes: values.notes || undefined,
      tags: values.tags,
      receiptUrl,
      paidBy: values.paidBy,
      splitType: values.splitType,
      splits: resolved,
      date: values.date,
    }

    try {
      if (isEditMode && expenseId) {
        await updateExpense({ tripId: trip.id, expenseId, body }).unwrap()
        toast.success('Expense updated')
      } else {
        const localId = generateLocalId()
        await createExpense({ tripId: trip.id, body, localId, optimisticListArgs: [{ tripId: trip.id, limit: 20 }] }).unwrap()
        toast.success('Expense added')
      }
      navigate(`/trips/${trip.id}/expenses`)
    } catch (err) {
      // Network-failure case is already handled by the offline queue inside
      // the mutation itself (optimistic entry stays, no error surfaced).
      const apiError = err as { status?: number }
      if (apiError?.status !== undefined) {
        toast.error(isEditMode ? 'Could not update expense' : 'Could not add expense', err)
      } else {
        toast.info("You're offline", 'This expense will sync automatically once you reconnect.')
        navigate(`/trips/${trip.id}/expenses`)
      }
    }
  }

  const deleteDisclosure = useDisclosure()

  const handleDelete = async () => {
    if (!expenseId) return
    try {
      await deleteExpense({ tripId: trip.id, expenseId }).unwrap()
      toast.success('Expense deleted')
      navigate(`/trips/${trip.id}/expenses`)
    } catch (err) {
      toast.error('Could not delete expense', err)
    } finally {
      deleteDisclosure.onClose()
    }
  }

  const canEdit = !isEditMode || isAdmin || existing?.data?.createdBy === currentUid

  if (isEditMode && isLoadingExisting) {
    return <Text color="ink.500">Loading expense…</Text>
  }

  return (
    <VStack align="stretch" spacing={6} maxW="640px">
      <Heading size="lg" fontFamily="heading" color="ink.900">
        {isEditMode ? 'Edit expense' : 'Add expense'}
      </Heading>

      <Box as="form" onSubmit={handleSubmit(onSubmit)} noValidate bg="white" p={{ base: 5, md: 7 }} borderRadius="xl" boxShadow="cardShadow">
        <VStack spacing={5} align="stretch">
          <FormControl isInvalid={!!errors.description} isRequired>
            <FormLabel fontSize="sm">Description</FormLabel>
            <Input size="lg" placeholder="Dinner at the beach shack" {...register('description')} />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

          <HStack align="flex-start" spacing={4}>
            <FormControl isInvalid={!!errors.amount} isRequired>
              <FormLabel fontSize="sm">Amount</FormLabel>
              <InputGroup size="lg">
                <InputLeftAddon>{trip.currency}</InputLeftAddon>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register('amount', { valueAsNumber: true })}
                />
              </InputGroup>
              <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.date} isRequired>
              <FormLabel fontSize="sm">Date</FormLabel>
              <Input type="date" size="lg" {...register('date')} />
              <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
            </FormControl>
          </HStack>

          <HStack align="flex-start" spacing={4}>
            <FormControl isInvalid={!!errors.paidBy} isRequired>
              <FormLabel fontSize="sm">Paid by</FormLabel>
              <Select size="lg" {...register('paidBy')}>
                {members.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.uid === currentUid ? 'You' : m.displayName}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Category</FormLabel>
              <Select size="lg" {...register('category')}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel fontSize="sm">Split between</FormLabel>
            <SplitTypeSelector value={splitType} onChange={(v: SplitType) => setValue('splitType', v)} />
          </FormControl>

          <VStack align="stretch" spacing={2} bg="ink.50" borderRadius="lg" p={3}>
            {members.map((m) => {
              const checked = selectedUids.includes(m.uid)
              return (
                <HStack key={m.uid} spacing={3} opacity={checked ? 1 : 0.5}>
                  <Checkbox isChecked={checked} onChange={() => toggleMember(m.uid)} aria-label={`Include ${m.displayName}`} />
                  <MemberAvatar uid={m.uid} name={m.displayName} photoUrl={m.photoUrl} size="xs" />
                  <Text fontSize="sm" flex={1} noOfLines={1}>
                    {m.uid === currentUid ? 'You' : m.displayName}
                  </Text>
                  {checked && splitType === 'equal' && (
                    <Text fontSize="sm" color="ink.500">
                      {formatCurrency(previewSplits.find((s) => s.uid === m.uid)?.amount ?? 0, trip.currency)}
                    </Text>
                  )}
                  {checked && splitType === 'exact' && (
                    <NumberInput size="sm" w="110px" min={0} precision={2} value={exactAmounts[m.uid] ?? ''} onChange={(v) => setExactAmounts((p) => ({ ...p, [m.uid]: v }))}>
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  )}
                  {checked && splitType === 'percentage' && (
                    <NumberInput size="sm" w="90px" min={0} max={100} value={percentages[m.uid] ?? ''} onChange={(v) => setPercentages((p) => ({ ...p, [m.uid]: v }))}>
                      <NumberInputField placeholder="0%" />
                    </NumberInput>
                  )}
                  {checked && splitType === 'shares' && (
                    <NumberInput size="sm" w="80px" min={1} step={1} value={sharesMap[m.uid] ?? ''} onChange={(v) => setSharesMap((p) => ({ ...p, [m.uid]: v }))}>
                      <NumberInputField placeholder="1" />
                    </NumberInput>
                  )}
                </HStack>
              )
            })}
            {summary && (
              <Text fontSize="xs" fontWeight={600} color={summary.ok ? 'positive.700' : 'negative.700'} pt={1}>
                {summary.label}
              </Text>
            )}
            {errors.splits && (
              <Text fontSize="xs" color="negative.700">
                {errors.splits.message as string}
              </Text>
            )}
          </VStack>

          <FormControl>
            <FormLabel fontSize="sm">Notes (optional)</FormLabel>
            <Textarea rows={2} placeholder="Anything worth remembering" {...register('notes')} />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Tags</FormLabel>
            <Wrap spacing={2} mb={tags.length ? 2 : 0}>
              {tags.map((t) => (
                <WrapItem key={t}>
                  <Tag borderRadius="full" bg="primary.50" color="primary.700">
                    <TagLabel>{t}</TagLabel>
                    <TagCloseButton onClick={() => setTags((prev) => prev.filter((x) => x !== t))} />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
            <HStack>
              <Input
                size="sm"
                placeholder="Add a tag and press Enter"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button size="sm" onClick={addTag}>
                Add
              </Button>
            </HStack>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Receipt (optional)</FormLabel>
            {receiptUrl ? (
              <HStack>
                <Box as="img" src={receiptPreviewSrc} alt="Receipt preview" w="56px" h="56px" borderRadius="md" objectFit="cover" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReceiptUrl(undefined)
                    setReceiptFile(null)
                  }}
                >
                  Remove
                </Button>
              </HStack>
            ) : (
              <Button as="label" size="sm" variant="outline" cursor="pointer" isLoading={isUploadingReceipt} htmlFor="receipt-upload">
                Upload photo
                <Input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  display="none"
                  onChange={(e) => handleReceiptChange(e.target.files?.[0] ?? null)}
                />
              </Button>
            )}
          </FormControl>

          <HStack pt={2}>
            <Button type="submit" size="lg" colorScheme="primary" flex={1} isLoading={isSubmitting} isDisabled={!canEdit}>
              {isEditMode ? 'Save changes' : 'Add expense'}
            </Button>
            {isEditMode && canEdit && (
              <Button size="lg" variant="outline" colorScheme="red" onClick={deleteDisclosure.onOpen}>
                Delete
              </Button>
            )}
          </HStack>
          {!canEdit && (
            <Text fontSize="xs" color="ink.500">
              Only the person who added this expense, or a trip admin, can edit it.
            </Text>
          )}
        </VStack>
      </Box>

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

export default AddExpense
