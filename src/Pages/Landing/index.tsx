import { useEffect, type ReactNode } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Button, Container, Flex, Heading, HStack, Link, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { FiArrowRight, FiBell, FiCheckCircle, FiDownload, FiGithub, FiMapPin, FiPlusCircle, FiWifiOff } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { DemoButton, DEMO_ENABLED } from 'Components/DemoButton'
import { useAppSelector } from 'Features/Store/common'
import { APP_HOME, APP_NAME } from 'Constants/routes'
import type { SplitType } from 'Features/Schema/types'
import { SplitCalculator } from './SplitCalculator'
import { EXAMPLE_DEFAULT_AMOUNT, PERSON_COLORS, SPLIT_TYPE_COPY, exampleSplit } from './splitExample'

const GITHUB_URL = 'https://github.com/Atifmoin19/ExpenseTrackerFE'
const PORTFOLIO_URL = 'https://portfolio.fullstackcity.in'

const rise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
`
// Only the calculator card animates: fading the headline in would delay LCP.
const riseIn = (delayMs: number) => ({
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${rise} 0.6s ${delayMs}ms ease-out both`,
  },
})

function LogoMark({ size = 32 }: { size?: number }) {
  return <img src="/icons/icon.svg" width={size} height={size} alt="" style={{ borderRadius: size / 4.5 }} />
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <VStack spacing={3} textAlign="center" maxW="2xl" mx="auto" mb={{ base: 8, md: 12 }}>
      <Text fontSize="xs" fontWeight={700} color="primary.600" textTransform="uppercase" letterSpacing="0.1em">
        {eyebrow}
      </Text>
      <Heading as="h2" fontSize={{ base: '2xl', md: '3xl' }} color="ink.900" lineHeight={1.2}>
        {title}
      </Heading>
      {children && (
        <Text color="ink.600" fontSize={{ base: 'md', md: 'lg' }}>
          {children}
        </Text>
      )}
    </VStack>
  )
}

const STEPS: { icon: IconType; title: string; body: string }[] = [
  { icon: FiMapPin, title: 'Start a trip', body: 'Name it, pick the currency, and share an invite link with the group.' },
  {
    icon: FiPlusCircle,
    title: 'Log what you spend',
    body: 'Who paid, how much, and how to split it: equally, exact amounts, percentages or shares.',
  },
  {
    icon: FiCheckCircle,
    title: 'Settle up',
    body: 'Balances update as you go. Suggested payments clear every debt in as few transfers as possible.',
  },
]

const SPLIT_TYPES: SplitType[] = ['equal', 'exact', 'percentage', 'shares']

function SplitTypeCard({ type }: { type: SplitType }) {
  const rows = exampleSplit(type, EXAMPLE_DEFAULT_AMOUNT)
  return (
    <VStack align="stretch" spacing={3} bg="white" borderRadius="xl" border="1px solid" borderColor="ink.100" p={5}>
      <Box>
        <Heading as="h3" fontSize="md" color="ink.900">
          {SPLIT_TYPE_COPY[type].title}
        </Heading>
        <Text fontSize="sm" color="ink.600" mt={1}>
          {SPLIT_TYPE_COPY[type].blurb}
        </Text>
      </Box>
      <Flex h="8px" borderRadius="full" overflow="hidden" bg="ink.100" aria-hidden="true">
        {rows.map((row, i) => (
          <Box key={row.name} bg={PERSON_COLORS[i]} w={`${row.fraction * 100}%`} />
        ))}
      </Flex>
      <Text fontSize="sm" color="ink.700" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {rows.map((row) => `${row.name} ₹${row.amount.toLocaleString('en-IN')}`).join(' · ')}
      </Text>
    </VStack>
  )
}

const FEATURES: { icon: IconType; title: string; body: string }[] = [
  {
    icon: FiWifiOff,
    title: 'Works with no signal',
    body: 'Add expenses on a ferry or a mountain pass. They are saved on your phone and sync on their own once you are back online, never twice.',
  },
  {
    icon: FiDownload,
    title: 'Install it like an app',
    body: 'Use "Add to Home screen" in your browser. It opens full screen and loads instantly, with no app store involved.',
  },
  {
    icon: FiBell,
    title: 'Nudges, not nagging',
    body: 'Optional push notifications tell you when someone adds an expense or settles up with you.',
  },
]

function Landing() {
  const navigate = useNavigate()
  const isLoggedIn = useAppSelector((state) => state.app.isLoggedIn)

  useEffect(() => {
    document.title = `${APP_NAME}: split group trip expenses and settle up`
  }, [])

  const primaryCta = isLoggedIn ? (
    <Button as={RouterLink} to={APP_HOME} size="lg" rightIcon={<FiArrowRight />} w={{ base: 'full', sm: 'auto' }}>
      Open app
    </Button>
  ) : DEMO_ENABLED ? (
    <Box w={{ base: 'full', sm: 'auto' }}>
      <DemoButton buttonProps={{ variant: 'solid', w: { base: 'full', sm: 'auto' }, px: 8 }} onStarted={() => navigate(APP_HOME)} />
    </Box>
  ) : (
    <Button as={RouterLink} to="/login" size="lg" rightIcon={<FiArrowRight />} w={{ base: 'full', sm: 'auto' }}>
      Sign in
    </Button>
  )

  // "Sign in" is the secondary action only when the demo is the primary one.
  const secondaryCta =
    !isLoggedIn && DEMO_ENABLED ? (
      <Button as={RouterLink} to="/login" size="lg" variant="outline" w={{ base: 'full', sm: 'auto' }}>
        Sign in
      </Button>
    ) : null

  return (
    <Box bg="ink.50" minH="100dvh" overflowX="hidden">
      {/* Nav */}
      <Box as="header" position="sticky" top={0} zIndex={10} bg="rgba(247, 248, 248, 0.85)" backdropFilter="saturate(180%) blur(10px)" borderBottom="1px solid" borderColor="ink.100">
        <Container maxW="6xl" px={4}>
          <Flex h="60px" align="center" justify="space-between">
            <HStack spacing={2}>
              <LogoMark size={30} />
              <Text fontFamily="heading" fontWeight={800} fontSize="lg" color="ink.900">
                {APP_NAME}
              </Text>
            </HStack>
            {isLoggedIn ? (
              <Button as={RouterLink} to={APP_HOME} size="sm">
                Open app
              </Button>
            ) : (
              <Button as={RouterLink} to="/login" size="sm" variant="ghost">
                Sign in
              </Button>
            )}
          </Flex>
        </Container>
      </Box>

      <Box as="main">
        {/* Hero */}
        <Box
          bg="radial-gradient(circle at 85% 10%, var(--chakra-colors-primary-100) 0%, transparent 45%), radial-gradient(circle at 0% 90%, var(--chakra-colors-primary-50) 0%, transparent 40%)"
        >
          <Container maxW="6xl" px={4} py={{ base: 10, md: 20 }}>
            <Stack direction={{ base: 'column', lg: 'row' }} spacing={{ base: 10, lg: 16 }} align="center">
              <VStack align="flex-start" spacing={6} flex={1}>
                <Text
                  fontSize="xs"
                  fontWeight={700}
                  color="primary.700"
                  bg="primary.50"
                  border="1px solid"
                  borderColor="primary.100"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  For group trips · Free · Works offline
                </Text>
                <Heading as="h1" fontSize={{ base: '4xl', md: '5xl' }} lineHeight={1.08} color="ink.900" letterSpacing="-0.02em">
                  Split every trip expense.{' '}
                  <Box as="span" color="primary.500">
                    End the trip all square.
                  </Box>
                </Heading>
                <Text fontSize={{ base: 'md', md: 'lg' }} color="ink.600" maxW="lg">
                  Log who paid, split it four ways, and see exactly who owes whom. When the trip is over, settle up in a few
                  taps instead of a spreadsheet.
                </Text>
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} w={{ base: 'full', sm: 'auto' }} align="flex-start">
                  {primaryCta}
                  {secondaryCta}
                </Stack>
                {!isLoggedIn && DEMO_ENABLED && (
                  <Text fontSize="sm" color="ink.600" mt={-2}>
                    The demo opens a sample Goa trip with no sign-up. It resets after 24 hours.
                  </Text>
                )}
              </VStack>
              <Box flex={1} w="full" maxW={{ base: 'full', lg: '460px' }} sx={riseIn(0)}>
                <SplitCalculator />
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* How it works */}
        <Container maxW="6xl" px={4} py={{ base: 14, md: 20 }}>
          <SectionHeading eyebrow="How it works" title="Three steps from first chai to final settle-up" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }} as="ol" listStyleType="none">
            {STEPS.map((step, i) => (
              <VStack as="li" key={step.title} align="flex-start" spacing={3} bg="white" borderRadius="xl" border="1px solid" borderColor="ink.100" p={6}>
                <HStack spacing={3}>
                  <Flex w="40px" h="40px" borderRadius="lg" bg="primary.50" color="primary.600" align="center" justify="center">
                    <step.icon size={20} aria-hidden="true" />
                  </Flex>
                  <Text fontSize="sm" fontWeight={700} color="ink.600">
                    Step {i + 1}
                  </Text>
                </HStack>
                <Heading as="h3" fontSize="lg" color="ink.900">
                  {step.title}
                </Heading>
                <Text color="ink.600">{step.body}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>

        {/* Split types */}
        <Box bg="white" borderY="1px solid" borderColor="ink.100">
          <Container maxW="6xl" px={4} py={{ base: 14, md: 20 }}>
            <SectionHeading eyebrow="Four ways to split" title="Fair is not always equal">
              The same ₹{EXAMPLE_DEFAULT_AMOUNT.toLocaleString('en-IN')} dinner for You, Aarav, Meera and Kabir, split each way.
            </SectionHeading>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
              {SPLIT_TYPES.map((type) => (
                <SplitTypeCard key={type} type={type} />
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        {/* Offline + install */}
        <Container maxW="6xl" px={4} py={{ base: 14, md: 20 }}>
          <SectionHeading eyebrow="Built for the road" title="Made for places with bad signal" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }}>
            {FEATURES.map((f) => (
              <HStack key={f.title} align="flex-start" spacing={4} p={2}>
                <Flex w="44px" h="44px" flexShrink={0} borderRadius="xl" bg="primary.500" color="white" align="center" justify="center">
                  <f.icon size={20} aria-hidden="true" />
                </Flex>
                <Box>
                  <Heading as="h3" fontSize="md" color="ink.900" mb={1}>
                    {f.title}
                  </Heading>
                  <Text color="ink.600" fontSize="sm">
                    {f.body}
                  </Text>
                </Box>
              </HStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" borderTop="1px solid" borderColor="ink.100" bg="white">
        <Container maxW="6xl" px={4} py={8}>
          <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} spacing={4}>
            <HStack spacing={2}>
              <LogoMark size={24} />
              <Text fontWeight={700} color="ink.800">
                {APP_NAME}
              </Text>
            </HStack>
            <HStack spacing={6} fontSize="sm" color="ink.600">
              <Link href={GITHUB_URL} isExternal display="inline-flex" alignItems="center" gap={1.5}>
                <FiGithub aria-hidden="true" /> GitHub
              </Link>
              <Link href={PORTFOLIO_URL} isExternal>
                Built by Atif Moin
              </Link>
            </HStack>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}

export default Landing
