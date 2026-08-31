import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { createTripSchema, CURRENCIES, type CreateTripFormValues } from 'Features/Schema/trip.schema'
import { useCreateTripMutation } from 'Services/Api/trips.api'
import { useAppToast } from 'Features/Hooks/useAppToast'
import { useUnsavedChangesWarning } from 'Features/Hooks/useUnsavedChangesWarning'

function CreateTrip() {
  const navigate = useNavigate()
  const toast = useAppToast()
  const [createTrip] = useCreateTripMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateTripFormValues>({
    resolver: zodResolver(createTripSchema),
    defaultValues: { currency: 'INR', name: '', description: '', startDate: '', endDate: '' },
  })

  useUnsavedChangesWarning(isDirty && !isSubmitting)

  const onSubmit = async (values: CreateTripFormValues) => {
    try {
      const result = await createTrip({
        name: values.name,
        description: values.description || undefined,
        startDate: values.startDate,
        endDate: values.endDate,
        currency: values.currency,
      }).unwrap()
      toast.success('Trip created')
      navigate(`/trips/${result.data?.id}/members`)
    } catch (err) {
      toast.error('Could not create trip', err)
    }
  }

  return (
    <VStack align="stretch" spacing={6} maxW="560px" mx="auto">
      <VStack align="flex-start" spacing={1}>
        <Heading size="lg" fontFamily="heading" color="ink.900">
          Plan a new trip
        </Heading>
        <Text fontSize="sm" color="ink.500">
          Set the basics — you can invite people and add expenses right after.
        </Text>
      </VStack>

      <Box as="form" onSubmit={handleSubmit(onSubmit)} noValidate bg="white" p={{ base: 5, md: 7 }} borderRadius="xl" boxShadow="cardShadow">
        <VStack spacing={5} align="stretch">
          <FormControl isInvalid={!!errors.name} isRequired>
            <FormLabel fontSize="sm">Trip name</FormLabel>
            <Input size="lg" placeholder="Goa Weekend" {...register('name')} />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>

          <HStack spacing={4} align="flex-start">
            <FormControl isInvalid={!!errors.startDate} isRequired>
              <FormLabel fontSize="sm">Start date</FormLabel>
              <Input type="date" size="lg" {...register('startDate')} />
              <FormErrorMessage>{errors.startDate?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.endDate} isRequired>
              <FormLabel fontSize="sm">End date</FormLabel>
              <Input type="date" size="lg" {...register('endDate')} />
              <FormErrorMessage>{errors.endDate?.message}</FormErrorMessage>
            </FormControl>
          </HStack>

          <FormControl isInvalid={!!errors.currency} isRequired>
            <FormLabel fontSize="sm">Currency</FormLabel>
            <Select size="lg" {...register('currency')}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.currency?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.description}>
            <FormLabel fontSize="sm">Description (optional)</FormLabel>
            <Textarea placeholder="Anything worth noting about this trip" rows={3} {...register('description')} />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

          <Button type="submit" size="lg" colorScheme="primary" isLoading={isSubmitting}>
            Create trip
          </Button>
        </VStack>
      </Box>
    </VStack>
  )
}

export default CreateTrip
