import {
  Badge,
  Box,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  VStack,
  IconButton,
} from '@chakra-ui/react'
import { formatDistanceToNow } from 'date-fns'
import { useListNotificationsQuery, useMarkNotificationReadMutation } from 'Services/Api/notifications.api'

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
        fill="currentColor"
      />
    </svg>
  )
}

export function NotificationBell() {
  const { data } = useListNotificationsQuery({ limit: 10 })
  const [markRead] = useMarkNotificationReadMutation()
  const notifications = data?.data ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            icon={<BellIcon />}
            variant="ghost"
            size="sm"
            borderRadius="full"
            color="ink.700"
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              colorScheme="red"
              borderRadius="full"
              fontSize="0.6rem"
              minW="16px"
              textAlign="center"
              aria-hidden="true"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="320px" maxH="400px" overflowY="auto">
        <PopoverArrow />
        <PopoverHeader fontWeight={700} fontSize="sm">
          Notifications
        </PopoverHeader>
        <PopoverBody>
          {notifications.length === 0 ? (
            <Text fontSize="sm" color="ink.500" textAlign="center" py={4}>
              You're all caught up.
            </Text>
          ) : (
            <VStack align="stretch" spacing={1}>
              {notifications.map((n) => (
                <Button
                  key={n.id}
                  variant="ghost"
                  justifyContent="flex-start"
                  h="auto"
                  py={2}
                  whiteSpace="normal"
                  textAlign="left"
                  fontWeight={400}
                  bg={n.read ? 'transparent' : 'primary.10'}
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <VStack align="flex-start" spacing={0.5} w="full">
                    <Text fontSize="sm" fontWeight={600} color="ink.900">
                      {n.title}
                    </Text>
                    <Text fontSize="xs" color="ink.600" noOfLines={2}>
                      {n.body}
                    </Text>
                    <Text fontSize="0.65rem" color="ink.400">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </Text>
                  </VStack>
                </Button>
              ))}
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
