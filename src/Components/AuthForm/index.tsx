import { useState } from 'react'
import {
  Button,
  Divider,
  HStack,
  Input,
  FormControl,
  FormErrorMessage,
  PinInput,
  PinInputField,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiMail } from 'react-icons/fi'
import { emailOtpSchema, type EmailOtpFormValues } from 'Features/Schema/auth.schema'
import { requestOtp, verifyOtp, loginWithGoogle } from 'Services/auth'
import { useAppDispatch } from 'Features/Store/common'
import { setDemo, setTokens } from 'Features/Store/authSlice'
import { setUserProfile } from 'Features/Store/userSlice'
import { setLoggedIn } from 'Features/Store/appReducer.slice'
import { GoogleSignInButton } from 'Components/GoogleSignInButton'
import { useAppToast } from 'Features/Hooks/useAppToast'
import type { AuthTokens } from 'Services/auth'
import type { User } from 'Features/Schema/types'

interface AuthFormProps {
  /** Fired after a successful OTP verify or Google sign-in (tokens + profile already in Redux). */
  onAuthenticated?: () => void
  ctaCopy?: string
}

export function AuthForm({ onAuthenticated, ctaCopy }: AuthFormProps) {
  const dispatch = useAppDispatch()
  const toast = useAppToast()

  const [stage, setStage] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailOtpFormValues>({ resolver: zodResolver(emailOtpSchema) })

  const finishLogin = (tokens: AuthTokens, user: User) => {
    dispatch(setTokens(tokens))
    dispatch(setDemo(false))
    dispatch(setUserProfile(user))
    dispatch(setLoggedIn(true))
    onAuthenticated?.()
  }

  const onSubmitEmail = async (values: EmailOtpFormValues) => {
    setIsSendingCode(true)
    try {
      await requestOtp(values.email)
      setEmail(values.email)
      setCode('')
      setStage('code')
    } catch (err) {
      toast.error('Could not send a verification code', err)
    } finally {
      setIsSendingCode(false)
    }
  }

  const onVerifyCode = async (submittedCode?: string) => {
    const value = submittedCode ?? code
    if (value.length !== 6) return
    setIsVerifying(true)
    try {
      const { tokens, user } = await verifyOtp(email, value)
      finishLogin(tokens, user)
    } catch (err) {
      toast.error('That code is invalid or expired', err)
      setCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsSendingCode(true)
    try {
      await requestOtp(email)
      toast.success('Sent a new code')
    } catch (err) {
      toast.error('Could not resend the code', err)
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleGoogleCredential = async (idToken: string) => {
    setIsGoogleLoading(true)
    try {
      const { tokens, user } = await loginWithGoogle(idToken)
      finishLogin(tokens, user)
    } catch (err) {
      toast.error('Google sign-in failed', err)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  if (stage === 'code') {
    return (
      <VStack spacing={4} w="full" py={2}>
        <FiMail size={32} color="var(--chakra-colors-primary-500)" aria-hidden="true" />
        <VStack spacing={1}>
          <Text fontWeight={700} color="ink.900" textAlign="center">
            Enter the code we sent to
          </Text>
          <Text fontWeight={700} color="ink.900" textAlign="center">
            {email}
          </Text>
        </VStack>
        <Text fontSize="sm" color="ink.500" textAlign="center">
          It expires soon — check your inbox (and spam folder).
        </Text>

        <HStack justify="center">
          <PinInput value={code} onChange={setCode} onComplete={(value) => void onVerifyCode(value)} otp autoFocus>
            {Array.from({ length: 6 }).map((_, i) => (
              <PinInputField key={i} />
            ))}
          </PinInput>
        </HStack>

        <Button
          w="full"
          size="lg"
          colorScheme="primary"
          onClick={() => void onVerifyCode()}
          isLoading={isVerifying}
          isDisabled={code.length !== 6}
        >
          Verify and continue
        </Button>

        <HStack spacing={4}>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setStage('email')
              setCode('')
            }}
          >
            Use a different email
          </Button>
          <Button variant="link" size="sm" isLoading={isSendingCode} onClick={handleResend}>
            Resend code
          </Button>
        </HStack>
      </VStack>
    )
  }

  return (
    <VStack spacing={4} w="full" as="form" onSubmit={handleSubmit(onSubmitEmail)} noValidate>
      <FormControl isInvalid={!!errors.email}>
        <Input
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          size="lg"
          autoComplete="email"
          spellCheck={false}
          aria-label="Email address"
          {...register('email')}
        />
        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
      </FormControl>
      <Button type="submit" size="lg" w="full" colorScheme="primary" isLoading={isSubmitting || isSendingCode}>
        {ctaCopy ?? 'Continue with email'}
      </Button>

      <HStack w="full" spacing={3}>
        <Divider />
        <Text fontSize="xs" color="ink.400" whiteSpace="nowrap">
          OR
        </Text>
        <Divider />
      </HStack>

      <GoogleSignInButton onCredential={handleGoogleCredential} />
      {isGoogleLoading && (
        <Text fontSize="xs" color="ink.500">
          Signing in…
        </Text>
      )}
    </VStack>
  )
}
