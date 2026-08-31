import { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { onboardingProfileSchema, type OnboardingProfileFormValues } from 'Features/Schema/auth.schema'
import { consumePendingInviteCode, peekPendingInviteCode } from 'Services/auth'
import { uploadImage } from 'Services/uploads'
import { useUpdateMeMutation } from 'Services/Api/auth.api'
import { useAcceptInviteMutation, useGetInvitePreviewQuery } from 'Services/Api/invites.api'
import { useAppDispatch, useAppSelector } from 'Features/Store/common'
import { setUserProfile } from 'Features/Store/userSlice'
import { useAppToast } from 'Features/Hooks/useAppToast'
import { useAssetUrl } from 'Features/Hooks/useAssetUrl'

function Onboarding() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const toast = useAppToast()
  const profile = useAppSelector((state) => state.user.profile)
  const [updateMe] = useUpdateMeMutation()
  const [acceptInvite] = useAcceptInviteMutation()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | undefined>(undefined)
  const existingPhotoUrl = useAssetUrl(profile?.photoUrl)
  const pendingInviteCode = peekPendingInviteCode()

  const { data: invitePreview } = useGetInvitePreviewQuery(pendingInviteCode ?? '', { skip: !pendingInviteCode })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingProfileFormValues>({
    resolver: zodResolver(onboardingProfileSchema),
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

  const onSubmit = async (values: OnboardingProfileFormValues) => {
    try {
      let photoUrl = profile?.photoUrl
      if (photoFile) {
        photoUrl = await uploadImage(photoFile, 'avatar')
      }
      const result = await updateMe({ displayName: values.displayName, photoUrl }).unwrap()
      if (result?.data) dispatch(setUserProfile(result.data))

      const code = consumePendingInviteCode()
      if (code) {
        try {
          const accepted = await acceptInvite(code).unwrap()
          toast.success('Welcome!', `You've joined ${accepted.data?.name ?? 'the trip'}.`)
          navigate(`/trips/${accepted.data?.id}/expenses`, { replace: true })
          return
        } catch (err) {
          toast.error("Couldn't join that trip automatically", err)
        }
      }
      navigate('/', { replace: true })
    } catch (err) {
      toast.error('Could not save your profile', err)
    }
  }

  return (
    <Box minH="100dvh" display="flex" alignItems="center" justifyContent="center" p={6} bg="ink.50">
      <VStack
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        spacing={5}
        w="full"
        maxW="380px"
        bg="white"
        p={{ base: 6, sm: 8 }}
        borderRadius="2xl"
        boxShadow="cardShadow"
      >
        <VStack spacing={1}>
          <Heading size="md" color="ink.900">
            Set up your profile
          </Heading>
          <Text fontSize="sm" color="ink.500" textAlign="center">
            {invitePreview?.data
              ? `You're joining "${invitePreview.data.tripName}" — just a couple of details first.`
              : "Just a couple of details before you get started."}
          </Text>
        </VStack>

        <VStack spacing={2}>
          <Avatar size="xl" name={profile?.email ?? 'You'} src={localPreview ?? existingPhotoUrl} bg="primary.500" color="white" />
          <Button
            as="label"
            size="sm"
            variant="outline"
            cursor="pointer"
            htmlFor="avatar-upload"
          >
            Choose photo
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              display="none"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
          </Button>
        </VStack>

        <FormControl isInvalid={!!errors.displayName}>
          <FormLabel fontSize="sm">Display name</FormLabel>
          <Input size="lg" placeholder="Jamie Rivera" autoComplete="name" {...register('displayName')} />
          <FormErrorMessage>{errors.displayName?.message}</FormErrorMessage>
        </FormControl>

        <Button type="submit" size="lg" w="full" colorScheme="primary" isLoading={isSubmitting}>
          {invitePreview?.data ? 'Save and join trip' : 'Continue'}
        </Button>
      </VStack>
    </Box>
  )
}

export default Onboarding
