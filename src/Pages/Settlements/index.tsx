import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { useOutletContext } from 'react-router-dom'
import { format } from 'date-fns'
import type { TripOutletContext } from 'Components/TripLayout'
import {
  useCreateSettlementMutation,
  useGetSuggestedSettlementsQuery,
  useListSettlementsQuery,
} from 'Services/Api/settlements.api'
import { MemberAvatar } from 'Components/MemberAvatar'
import { EmptyState } from 'Components/EmptyState'
import { CardSkeleton } from 'Components/LoadingSkeleton'
import { formatCurrency } from 'Features/Schema/splitUtils'
import { useAppToast } from 'Features/Hooks/useAppToast'
import type { SettlementMethod, SuggestedSettlement } from 'Features/Schema/types'

function nameFor(uid: string, currentUid: string, memberNameByUid: Record<string, string>) {
  return uid === currentUid ? 'You' : memberNameByUid[uid] ?? 'Someone'
}

function Settlements() {
  const { trip, members, currentUid } = useOutletContext<TripOutletContext>()
  const toast = useAppToast()
  const { data: suggestedData, isLoading: isSuggestedLoading } = useGetSuggestedSettlementsQuery(trip.id)
  const { data: historyData, isLoading: isHistoryLoading } = useListSettlementsQuery(trip.id)
  const [createSettlement, { isLoading: isSettling }] = useCreateSettlementMutation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [active, setActive] = useState<SuggestedSettlement | null>(null)
  const [method, setMethod] = useState<SettlementMethod>('upi')
  const [note, setNote] = useState('')

  const memberNameByUid = Object.fromEntries(members.map((m) => [m.uid, m.displayName]))

  const openSettle = (s: SuggestedSettlement) => {
    setActive(s)
    setMethod('upi')
    setNote('')
    onOpen()
  }

  const confirmSettle = async () => {
    if (!active) return
    try {
      await createSettlement({
        tripId: trip.id,
        settledBy: currentUid,
        body: { fromUid: active.fromUid, toUid: active.toUid, amount: active.amount, method, note: note || undefined },
      }).unwrap()
      toast.success('Marked as settled')
      onClose()
    } catch (err) {
      toast.error('Could not record settlement', err)
    }
  }

  const suggested = suggestedData?.data ?? []
  const history = historyData?.data ?? []

  return (
    <VStack align="stretch" spacing={6}>
      <VStack align="stretch" spacing={3}>
        <Text fontWeight={700} color="ink.900">
          Suggested settlements
        </Text>
        <Text fontSize="sm" color="ink.500">
          The fewest transactions needed to settle everyone up.
        </Text>
        {isSuggestedLoading ? (
          <CardSkeleton height="140px" />
        ) : suggested.length === 0 ? (
          <EmptyState icon="🎉" title="All settled up" description="No outstanding balances on this trip." />
        ) : (
          <VStack align="stretch" spacing={2} bg="white" borderRadius="xl" boxShadow="cardShadow" p={2}>
            {suggested.map((s, i) => (
              <HStack key={`${s.fromUid}-${s.toUid}-${i}`} justify="space-between" p={2} borderRadius="lg" _hover={{ bg: 'ink.50' }}>
                <HStack spacing={2}>
                  <MemberAvatar uid={s.fromUid} name={nameFor(s.fromUid, currentUid, memberNameByUid)} size="sm" />
                  <Text fontSize="sm" color="ink.400">
                    →
                  </Text>
                  <MemberAvatar uid={s.toUid} name={nameFor(s.toUid, currentUid, memberNameByUid)} size="sm" />
                  <VStack align="flex-start" spacing={0} pl={1}>
                    <Text fontSize="sm" fontWeight={600}>
                      {nameFor(s.fromUid, currentUid, memberNameByUid)} pays {nameFor(s.toUid, currentUid, memberNameByUid)}
                    </Text>
                    <Text fontSize="xs" color="ink.500">
                      {formatCurrency(s.amount, trip.currency)}
                    </Text>
                  </VStack>
                </HStack>
                <Button size="sm" colorScheme="primary" onClick={() => openSettle(s)}>
                  Settle
                </Button>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>

      <VStack align="stretch" spacing={3}>
        <Text fontWeight={700} color="ink.900">
          History
        </Text>
        {isHistoryLoading ? (
          <CardSkeleton height="100px" />
        ) : history.length === 0 ? (
          <Text fontSize="sm" color="ink.500">
            No settlements recorded yet.
          </Text>
        ) : (
          <VStack align="stretch" spacing={0} bg="white" borderRadius="xl" boxShadow="cardShadow" px={3} divider={<Box borderBottomWidth="1px" borderColor="ink.100" />}>
            {history.map((s) => (
              <HStack key={s.id} justify="space-between" py={3}>
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="sm" fontWeight={600}>
                    {nameFor(s.fromUid, currentUid, memberNameByUid)} → {nameFor(s.toUid, currentUid, memberNameByUid)}
                  </Text>
                  <Text fontSize="xs" color="ink.500" textTransform="capitalize">
                    {s.method} · {(() => {
                      try {
                        return format(new Date(s.createdAt), 'MMM d, yyyy')
                      } catch {
                        return ''
                      }
                    })()}
                  </Text>
                </VStack>
                <Text fontWeight={700} fontSize="sm" color="positive.700">
                  {formatCurrency(s.amount, trip.currency)}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>Confirm settlement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {active && (
              <VStack align="stretch" spacing={4}>
                <Text fontSize="sm" color="ink.700">
                  {nameFor(active.fromUid, currentUid, memberNameByUid)} pays{' '}
                  {nameFor(active.toUid, currentUid, memberNameByUid)}{' '}
                  <b>{formatCurrency(active.amount, trip.currency)}</b>
                </Text>
                <FormControl>
                  <FormLabel fontSize="sm">Method</FormLabel>
                  <RadioGroup value={method} onChange={(v) => setMethod(v as SettlementMethod)}>
                    <HStack spacing={5}>
                      <Radio value="upi">UPI</Radio>
                      <Radio value="cash">Cash</Radio>
                      <Radio value="bank">Bank</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Note (optional)</FormLabel>
                  <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Paid via Google Pay" />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="primary" onClick={confirmSettle} isLoading={isSettling}>
              Confirm settled
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default Settlements
