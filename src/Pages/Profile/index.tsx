import { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormValues } from 'Features/Schema/auth.schema'
import { useAppDispatch, useAppSelector } from 'Features/Store/common'
import { setUserProfile } from 'Features/Store/userSlice'
import { useUpdateMeMutation } from 'Services/Api/auth.api'
import { uploadImage } from 'Services/uploads'
import { useAppToast } from 'Features/Hooks/useAppToast'
import { useAssetUrl } from 'Features/Hooks/useAssetUrl'
import { usePushSubscription } from 'Features/Hooks/usePushSubscription'

function Profile() {
  const profile = useAppSelector((state) => state.user.profile)
  const dispatch = useAppDispatch()
  const toast = useAppToast()
  const [updateMe] = useUpdateMeMutation()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | undefined>(undefined)
  const existingPhotoUrl = useAssetUrl(profile?.photoUrl)
  const { isSupported, isSubscribed, isChecking, subscribe, unsubscribe } = usePushSubscription()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: profile?.displayName ?? '' },
  })

  useEffect(() => {
    if (!photoFile) {
      setLocalPreview(undefined)
      return
    }
    const url = URL.createObjectURL(photoFile)
    setLocalPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photoFile])

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      let photoUrl = profile?.photoUrl
      if (photoFile) {
        photoUrl = await uploadImage(photoFile, 'avatar')
      }
      const result = await updateMe({ displayName: values.displayName, photoUrl }).unwrap()
      if (result?.data) dispatch(setUserProfile(result.data))
      setPhotoFile(null)
      toast.success('Profile updated')
    } catch (err) {
      toast.error('Could not update profile', err)
    }
  }

  const togglePush = async (enabled: boolean) => {
    try {
      if (enabled) {
        const ok = await subscribe()
        if (ok) {
          toast.success('Push notifications enabled')
        } else {
          toast.info('Notifications not enabled', 'Permission was denied or is unsupported in this browser.')
        }
      } else {
        await unsubscribe()
      }
    } catch (err) {
      toast.error('Could not update notification settings', err)
    }
  }

  return (
    <VStack align="stretch" spacing={6} maxW="480px">
      <Heading size="lg" fontFamily="heading" color="ink.900">
        Profile
      </Heading>

      <Box as="form" onSubmit={handleSubmit(onSubmit)} noValidate bg="white" p={{ base: 5, md: 7 }} borderRadius="xl" boxShadow="cardShadow">
        <VStack spacing={5} align="stretch">
          <VStack spacing={2}>
            <Avatar size="xl" name={profile?.displayName ?? 'You'} src={localPreview ?? existingPhotoUrl} bg="primary.500" color="white" />
            <Button as="label" size="sm" variant="outline" cursor="pointer" htmlFor="profile-photo-upload">
              Change photo
              <Input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                display="none"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </Button>
          </VStack>

          <FormControl isInvalid={!!errors.displayName}>
            <FormLabel fontSize="sm">Display name</FormLabel>
            <Input size="lg" autoComplete="name" {...register('displayName')} />
            <FormErrorMessage>{errors.displayName?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Email</FormLabel>
            <Input size="lg" value={profile?.email ?? ''} isReadOnly bg="ink.50" />
          </FormControl>

          <Button type="submit" size="lg" colorScheme="primary" isLoading={isSubmitting} isDisabled={!isDirty && !photoFile}>
            Save changes
          </Button>
        </VStack>
      </Box>

      <Box bg="white" p={{ base: 5, md: 7 }} borderRadius="xl" boxShadow="cardShadow">
        <HStack justify="space-between">
          <Box>
            <Text fontWeight={600} fontSize="sm" color="ink.900">
              Push notifications
            </Text>
            <Text fontSize="xs" color="ink.500">
              {isSupported ? 'Get notified about new expenses and settlements.' : 'Not supported in this browser.'}
            </Text>
          </Box>
          <Switch isChecked={isSubscribed} isDisabled={!isSupported || isChecking} onChange={(e) => togglePush(e.target.checked)} />
        </HStack>
      </Box>
    </VStack>
  )
}

export default Profile
