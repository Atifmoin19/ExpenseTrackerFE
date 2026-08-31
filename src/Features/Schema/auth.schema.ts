import { z } from 'zod'

export const emailOtpSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
})

export type EmailOtpFormValues = z.infer<typeof emailOtpSchema>

export const otpCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
})

export type OtpCodeFormValues = z.infer<typeof otpCodeSchema>

export const onboardingProfileSchema = z.object({
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name is too long'),
  photoUrl: z.string().optional(),
})

export type OnboardingProfileFormValues = z.infer<typeof onboardingProfileSchema>

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name is too long'),
  photoUrl: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
