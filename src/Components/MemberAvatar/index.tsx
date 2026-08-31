import { Avatar, Box, HStack, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'
import { FiX } from 'react-icons/fi'
import { useAssetUrl } from 'Features/Hooks/useAssetUrl'

const AVATAR_PALETTE = ['#0E7C74', '#C24630', '#8A6D3B', '#3B6EA5', '#7B4F9E', '#2E9E58', '#B0568A']

export function colorForUid(uid: string): string {
  let hash = 0
  for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

interface MemberAvatarProps {
  uid: string
  name: string
  photoUrl?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export function MemberAvatar({ uid, name, photoUrl, size = 'sm' }: MemberAvatarProps) {
  // photoUrl is a private object storage key, not a directly-fetchable URL —
  // resolve it to a short-lived viewable URL (see Services/uploads.ts).
  const resolvedSrc = useAssetUrl(photoUrl)
  return (
    <Tooltip label={name} openDelay={300}>
      <Avatar
        name={name}
        src={resolvedSrc}
        size={size}
        bg={colorForUid(uid)}
        color="white"
        fontWeight={600}
        aria-label={name}
      />
    </Tooltip>
  )
}

interface MemberChipProps extends MemberAvatarProps {
  onRemove?: () => void
  removeLabel?: string
}

export function MemberChip({ uid, name, photoUrl, onRemove, removeLabel }: MemberChipProps) {
  return (
    <Tag size="lg" borderRadius="full" bg="ink.100" pl={1} pr={onRemove ? 1 : 3} py={1}>
      <HStack spacing={2}>
        <MemberAvatar uid={uid} name={name} photoUrl={photoUrl} size="xs" />
        <TagLabel fontWeight={500} color="ink.800">
          {name}
        </TagLabel>
        {onRemove && (
          <Box
            as="button"
            type="button"
            onClick={onRemove}
            aria-label={removeLabel ?? `Remove ${name}`}
            display="flex"
            alignItems="center"
            color="ink.500"
            px={2}
            py={1}
            borderRadius="full"
            _hover={{ bg: 'ink.200', color: 'negative.600' }}
            _focusVisible={{ boxShadow: '0 0 0 2px var(--chakra-colors-primary-300)' }}
          >
            <FiX size={14} aria-hidden="true" />
          </Box>
        )}
      </HStack>
    </Tag>
  )
}
