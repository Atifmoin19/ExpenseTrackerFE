import { useEffect, useState } from 'react'
import { Box, Button, Heading, Spinner, Text, VStack } from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { FiAlertTriangle, FiBriefcase } from 'react-icons/fi'
import { AuthForm } from 'Components/AuthForm'
import { useAppSelector } from 'Features/Store/common'
import { useAcceptInviteMutation, useGetInvitePreviewQuery } from 'Services/Api/invites.api'
import { setPendingInviteCode } from 'Services/auth'
import { useAppToast } from 'Features/Hooks/useAppToast'
import { EmptyState } from 'Components/EmptyState'
import { APP_HOME, APP_NAME } from 'Constants/routes'

function InviteLanding() {
  const { code = '' } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const toast = useAppToast()
  const isLoggedIn = useAppSelector((state) => state.app.isLoggedIn)
  const authChecked = useAppSelector((state) => state.app.authChecked)
  const profile = useAppSelector((state) => state.user.profile)
  const [isJoining, setIsJoining] = useState(false)

  const { data: preview, isLoading, isError } = useGetInvitePreviewQuery(code, { skip: !code })
  const [acceptInvite] = useAcceptInviteMutation()

  useEffect(() => {
    if (!authChecked || !code) return
    if (!isLoggedIn) {
      setPendingInviteCode(code)
      return
    }
    if (isLoggedIn && !profile?.displayName) {
      // Logged in but hasn't finished profile setup yet — send them through
      // onboarding first, which will auto-accept this invite once they're done.
      setPendingInviteCode(code)
      navigate('/onboarding', { replace: true })
    }
  }, [authChecked, isLoggedIn, profile, code, navigate])

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      const result = await acceptInvite(code).unwrap()
      toast.success('You joined the trip!')
      navigate(`/trips/${result.data?.id}/expenses`, { replace: true })
    } catch (err) {
      toast.error("Couldn't join this trip", err)
    } finally {
      setIsJoining(false)
    }
  }

  if (!authChecked || isLoading) {
    return (
      <Box display="flex" minH="100dvh" alignItems="center" justifyContent="center">
        <Spinner size="lg" color="primary.500" />
      </Box>
    )
  }

  if (isError || !preview?.data) {
    return (
      <Box display="flex" minH="100dvh" alignItems="center" justifyContent="center" p={6}>
        <EmptyState
          icon={<FiAlertTriangle size={40} color="var(--chakra-colors-negative-500)" />}
          title="This invite link isn't valid"
          description="It may have expired or already reached its use limit. Ask the trip admin for a new link."
          actionLabel={`Go to ${APP_NAME}`}
          onAction={() => navigate(APP_HOME)}
        />
      </Box>
    )
  }

  const trip = preview.data

  return (
    <Box minH="100dvh" display="flex" alignItems="center" justifyContent="center" p={6} bg="ink.50">
      <VStack spacing={6} w="full" maxW="400px" bg="white" p={{ base: 6, sm: 8 }} borderRadius="2xl" boxShadow="cardShadow">
        <VStack spacing={1} textAlign="center">
          <FiBriefcase size={32} color="var(--chakra-colors-primary-500)" aria-hidden="true" />
          <Heading size="md" color="ink.900">
            You're invited to {trip.tripName}
          </Heading>
          <Text fontSize="sm" color="ink.500">
            {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')} ·{' '}
            {trip.memberCount} {trip.memberCount === 1 ? 'member' : 'members'}
          </Text>
        </VStack>

        {isLoggedIn && profile?.displayName ? (
          <Button size="lg" w="full" colorScheme="primary" onClick={handleJoin} isLoading={isJoining}>
            Join trip
          </Button>
        ) : (
          <VStack spacing={3} w="full">
            <Text fontSize="sm" color="ink.600" textAlign="center">
              Sign in to join — we'll add you to the trip automatically.
            </Text>
            <AuthForm ctaCopy="Continue and join trip" />
          </VStack>
        )}
      </VStack>
    </Box>
  )
}

export default InviteLanding
