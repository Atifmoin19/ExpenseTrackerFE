import { Box, Flex, HStack, Text, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider } from '@chakra-ui/react'
import { Link as RouterLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'Features/Store/common'
import { resetApp } from 'Features/Store/appReducer.slice'
import { clearUserProfile } from 'Features/Store/userSlice'
import { clearTokens } from 'Features/Store/authSlice'
import { logout } from 'Services/auth'
import { useAssetUrl } from 'Features/Hooks/useAssetUrl'
import { NotificationBell } from 'Components/NotificationBell'
import { OfflineBanner } from 'Components/OfflineBanner'

function BrandMark() {
  return (
    <HStack spacing={2} as={RouterLink} to="/" aria-label="Expense Tracker home">
      <Box w="30px" h="30px" borderRadius="8px" bg="primary.500" display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontWeight={800} fontSize="sm">
          $
        </Text>
      </Box>
      <Text fontWeight={800} fontSize="md" color="ink.900" display={{ base: 'none', sm: 'block' }}>
        Expense Tracker
      </Text>
    </HStack>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 11.5L12 4l9 7.5M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9"
        stroke={active ? 'currentColor' : 'currentColor'}
        strokeWidth={active ? 2.4 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth={active ? 2.4 : 1.8} />
      <path
        d="M4.5 20c1.4-3.6 4.2-5.5 7.5-5.5s6.1 1.9 7.5 5.5"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}

const MOBILE_NAV_ITEMS = [
  { to: '/', label: 'Trips', icon: HomeIcon },
  { to: '/profile', label: 'Profile', icon: ProfileIcon },
]

export function AppShell() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const profile = useAppSelector((state) => state.user.profile)
  const refreshToken = useAppSelector((state) => state.auth.refreshToken)
  const avatarUrl = useAssetUrl(profile?.photoUrl)

  const handleSignOut = async () => {
    if (refreshToken) await logout(refreshToken)
    dispatch(resetApp())
    dispatch(clearUserProfile())
    dispatch(clearTokens())
    navigate('/login', { replace: true })
  }

  return (
    <Flex direction="column" minH="100dvh" bg="ink.50">
      <OfflineBanner />
      <Flex
        as="header"
        align="center"
        justify="space-between"
        px={{ base: 4, md: 8 }}
        h="64px"
        bg="white"
        borderBottom="1px solid"
        borderColor="ink.100"
        position="sticky"
        top={0}
        zIndex="sticky"
      >
        <BrandMark />
        <HStack spacing={3}>
          <NotificationBell />
          <Menu placement="bottom-end">
            <MenuButton aria-label="Account menu" borderRadius="full">
              <Avatar size="sm" name={profile?.displayName ?? 'You'} src={avatarUrl} bg="primary.500" color="white" />
            </MenuButton>
            <MenuList>
              <MenuItem as={RouterLink} to="/profile">
                Profile
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleSignOut} color="negative.600">
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <Box as="main" flex={1} px={{ base: 4, md: 8 }} py={6} pb={{ base: '84px', md: 6 }} maxW="1100px" w="full" mx="auto">
        <Outlet />
      </Box>

      <Flex
        as="nav"
        aria-label="Primary"
        display={{ base: 'flex', md: 'none' }}
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="white"
        borderTop="1px solid"
        borderColor="ink.100"
        justify="space-around"
        py={2}
        pb="calc(env(safe-area-inset-bottom, 0px) + 8px)"
        zIndex="sticky"
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
          const Icon = item.icon
          return (
            <Flex
              key={item.to}
              as={RouterLink}
              to={item.to}
              direction="column"
              align="center"
              minW="64px"
              minH="44px"
              justify="center"
              color={active ? 'primary.600' : 'ink.400'}
              _focusVisible={{ boxShadow: '0 0 0 2px var(--chakra-colors-primary-300)', borderRadius: 'md' }}
            >
              <Icon active={active} />
              <Text fontSize="0.65rem" fontWeight={600} mt={0.5}>
                {item.label}
              </Text>
            </Flex>
          )
        })}
      </Flex>
    </Flex>
  )
}
