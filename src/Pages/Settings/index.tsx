import { useEffect } from 'react'
import { Box, Button, Checkbox, Heading, HStack, Radio, RadioGroup, Select, Text, VStack } from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOutletContext } from 'react-router-dom'
import { FiLock } from 'react-icons/fi'
import type { TripOutletContext } from 'Components/TripLayout'
import { tripSettingsSchema, type TripSettingsFormValues } from 'Features/Schema/trip.schema'
import { useUpdateTripSettingsMutation } from 'Services/Api/trips.api'
import { useUpdateMemberRoleMutation } from 'Services/Api/members.api'
import { MemberAvatar } from 'Components/MemberAvatar'
import { EmptyState } from 'Components/EmptyState'
import { useAppToast } from 'Features/Hooks/useAppToast'
import type { MemberRole } from 'Features/Schema/types'

function Settings() {
  const { trip, members, isAdmin, currentUid } = useOutletContext<TripOutletContext>()
  const toast = useAppToast()
  const [updateSettings, { isLoading: isSavingSettings }] = useUpdateTripSettingsMutation()
  const [updateRole] = useUpdateMemberRoleMutation()

  const { control, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<TripSettingsFormValues>({
    resolver: zodResolver(tripSettingsSchema),
    defaultValues: { expensePermission: trip.expensePermission, allowedMemberIds: trip.allowedMemberIds ?? [] },
  })

  useEffect(() => {
    reset({ expensePermission: trip.expensePermission, allowedMemberIds: trip.allowedMemberIds ?? [] })
  }, [trip, reset])

  const expensePermission = watch('expensePermission')

  const onSubmit = async (values: TripSettingsFormValues) => {
    try {
      await updateSettings({ tripId: trip.id, body: values }).unwrap()
      toast.success('Trip settings saved')
    } catch (err) {
      toast.error('Could not save settings', err)
    }
  }

  const onRoleChange = async (uid: string, role: MemberRole) => {
    try {
      await updateRole({ tripId: trip.id, uid, role }).unwrap()
      toast.success('Role updated')
    } catch (err) {
      toast.error('Could not update role', err)
    }
  }

  if (!isAdmin) {
    return (
      <EmptyState
        icon={<FiLock size={40} color="var(--chakra-colors-ink-400)" />}
        title="Admins only"
        description="Only trip admins can change these settings."
      />
    )
  }

  return (
    <VStack align="stretch" spacing={6} maxW="640px">
      <Box as="form" onSubmit={handleSubmit(onSubmit)} bg="white" p={{ base: 5, md: 7 }} borderRadius="xl" boxShadow="cardShadow">
        <VStack align="stretch" spacing={5}>
          <Heading size="sm" color="ink.900">
            Who can add expenses?
          </Heading>
          <Controller
            control={control}
            name="expensePermission"
            render={({ field }) => (
              <RadioGroup value={field.value} onChange={field.onChange}>
                <VStack align="stretch" spacing={3}>
                  <Radio value="all_members">All members</Radio>
                  <Radio value="admin_only">Admins only</Radio>
                  <Radio value="selected_members">Selected members</Radio>
                </VStack>
              </RadioGroup>
            )}
          />

          {expensePermission === 'selected_members' && (
            <Controller
              control={control}
              name="allowedMemberIds"
              render={({ field }) => (
                <VStack align="stretch" spacing={2} bg="ink.50" borderRadius="lg" p={3}>
                  {members.map((m) => {
                    const checked = field.value.includes(m.uid)
                    return (
                      <Checkbox
                        key={m.uid}
                        isChecked={checked}
                        onChange={() =>
                          field.onChange(
                            checked ? field.value.filter((id) => id !== m.uid) : [...field.value, m.uid],
                          )
                        }
                      >
                        {m.uid === currentUid ? 'You' : m.displayName}
                      </Checkbox>
                    )
                  })}
                </VStack>
              )}
            />
          )}

          <Button type="submit" colorScheme="primary" alignSelf="flex-start" isLoading={isSubmitting || isSavingSettings}>
            Save settings
          </Button>
        </VStack>
      </Box>

      <Box bg="white" p={{ base: 5, md: 7 }} borderRadius="xl" boxShadow="cardShadow">
        <VStack align="stretch" spacing={4}>
          <Heading size="sm" color="ink.900">
            Member roles
          </Heading>
          {members.map((m) => (
            <HStack key={m.uid} justify="space-between">
              <HStack spacing={2}>
                <MemberAvatar uid={m.uid} name={m.displayName} photoUrl={m.photoUrl} size="sm" />
                <Text fontSize="sm">{m.uid === currentUid ? 'You' : m.displayName}</Text>
              </HStack>
              <Select
                size="sm"
                w="130px"
                value={m.role}
                isDisabled={m.uid === currentUid}
                onChange={(e) => onRoleChange(m.uid, e.target.value as MemberRole)}
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </Select>
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  )
}

export default Settings
