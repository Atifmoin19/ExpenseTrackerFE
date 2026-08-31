import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOutletContext } from 'react-router-dom'
import type { TripOutletContext } from 'Components/TripLayout'
import { addMemberByEmailSchema, type AddMemberByEmailFormValues } from 'Features/Schema/trip.schema'
import { useAddMemberMutation, useRemoveMemberMutation } from 'Services/Api/members.api'
import { useCreateInviteMutation } from 'Services/Api/invites.api'
import { MemberChip } from 'Components/MemberAvatar'
import { ConfirmDialog } from 'Components/ConfirmDialog'
import { useAppToast } from 'Features/Hooks/useAppToast'

interface ContactPickerNavigator extends Navigator {
  contacts?: {
    select: (properties: string[], options?: { multiple?: boolean }) => Promise<Array<{ email?: string[]; name?: string[] }>>
  }
}

function InviteMembers() {
  const { trip, members, isAdmin, currentUid } = useOutletContext<TripOutletContext>()
  const toast = useAppToast()
  const [createInvite, { isLoading: isCreatingInvite }] = useCreateInviteMutation()
  const [addMember] = useAddMemberMutation()
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation()
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [pendingRemoval, setPendingRemoval] = useState<{ uid: string; name: string } | null>(null)
  const removeDisclosure = useDisclosure()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberByEmailFormValues>({ resolver: zodResolver(addMemberByEmailSchema) })

  const generateLink = async () => {
    try {
      const result = await createInvite(trip.id).unwrap()
      const code = result.data?.code
      if (code) setInviteLink(`${window.location.origin}/invite/${code}`)
    } catch (err) {
      toast.error('Could not create invite link', err)
    }
  }

  const copyLink = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Link copied')
    } catch {
      toast.info('Copy failed', 'Select and copy the link manually.')
    }
  }

  const shareLink = async () => {
    if (!inviteLink) return
    if (navigator.share) {
      try {
        await navigator.share({ title: `Join ${trip.name} on Expense Tracker`, url: inviteLink })
      } catch {
        // user cancelled share sheet — no-op
      }
    } else {
      copyLink()
    }
  }

  const importFromContacts = async () => {
    const nav = navigator as ContactPickerNavigator
    if (!nav.contacts?.select) {
      toast.info('Contact import not available', 'Your browser does not support picking contacts — add by email instead.')
      return
    }
    try {
      const contacts = await nav.contacts.select(['email', 'name'], { multiple: true })
      const emails = contacts.flatMap((c) => c.email ?? [])
      for (const email of emails) {
        await addMember({ tripId: trip.id, body: { email } }).catch(() => null)
      }
      if (emails.length) toast.success(`Invited ${emails.length} contact${emails.length > 1 ? 's' : ''}`)
    } catch {
      // user cancelled the picker — no-op
    }
  }

  const onAddByEmail = async (values: AddMemberByEmailFormValues) => {
    try {
      await addMember({ tripId: trip.id, body: values }).unwrap()
      toast.success('Member added')
      reset()
    } catch (err) {
      toast.error('Could not add member', err)
    }
  }

  const onRemove = async () => {
    if (!pendingRemoval) return
    try {
      await removeMember({ tripId: trip.id, uid: pendingRemoval.uid }).unwrap()
      toast.success('Member removed')
    } catch (err) {
      toast.error('Could not remove member', err)
    } finally {
      removeDisclosure.onClose()
      setPendingRemoval(null)
    }
  }

  return (
    <VStack align="stretch" spacing={6} maxW="640px">
      <VStack align="stretch" spacing={3} bg="white" p={5} borderRadius="xl" boxShadow="cardShadow">
        <Heading size="sm" color="ink.900">
          Invite link
        </Heading>
        {inviteLink ? (
          <VStack align="stretch" spacing={2}>
            <Input value={inviteLink} isReadOnly fontSize="sm" bg="ink.50" />
            <HStack>
              <Button size="sm" onClick={copyLink} flex={1}>
                Copy
              </Button>
              <Button size="sm" onClick={shareLink} flex={1} colorScheme="primary">
                Share
              </Button>
            </HStack>
          </VStack>
        ) : (
          <Button onClick={generateLink} isLoading={isCreatingInvite} colorScheme="primary" alignSelf="flex-start">
            Create invite link
          </Button>
        )}
      </VStack>

      <VStack align="stretch" spacing={3} bg="white" p={5} borderRadius="xl" boxShadow="cardShadow">
        <Heading size="sm" color="ink.900">
          Add by email
        </Heading>
        <HStack as="form" onSubmit={handleSubmit(onAddByEmail)} noValidate align="flex-start">
          <FormControl isInvalid={!!errors.email}>
            <Input
              placeholder="friend@example.com"
              size="md"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              {...register('email')}
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>
          <Button type="submit" isLoading={isSubmitting} colorScheme="primary" flexShrink={0}>
            Add
          </Button>
        </HStack>
        <Button variant="outline" size="sm" alignSelf="flex-start" onClick={importFromContacts}>
          Import from contacts
        </Button>
      </VStack>

      <VStack align="stretch" spacing={3} bg="white" p={5} borderRadius="xl" boxShadow="cardShadow">
        <Heading size="sm" color="ink.900">
          Members ({members.length})
        </Heading>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {members.map((m) => (
            <HStack key={m.uid} spacing={1}>
              <MemberChip uid={m.uid} name={m.uid === currentUid ? `${m.displayName} (you)` : m.displayName} photoUrl={m.photoUrl} />
              {isAdmin && m.uid !== currentUid && (
                <Menu>
                  <MenuButton as={IconButton} aria-label={`Options for ${m.displayName}`} icon={<Text>⋯</Text>} size="xs" variant="ghost" />
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setPendingRemoval({ uid: m.uid, name: m.displayName })
                        removeDisclosure.onOpen()
                      }}
                      color="negative.600"
                    >
                      Remove from trip
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            </HStack>
          ))}
        </Box>
      </VStack>

      <ConfirmDialog
        isOpen={removeDisclosure.isOpen}
        onClose={() => {
          removeDisclosure.onClose()
          setPendingRemoval(null)
        }}
        onConfirm={onRemove}
        isLoading={isRemoving}
        title={`Remove ${pendingRemoval?.name ?? 'this member'}?`}
        description="They'll lose access to this trip's expenses and balances. This can't be undone."
        confirmLabel="Remove member"
      />
    </VStack>
  )
}

export default InviteMembers
