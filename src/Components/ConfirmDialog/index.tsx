import { useRef } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
} from '@chakra-ui/react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  isLoading?: boolean
  isDestructive?: boolean
}

/**
 * Confirmation gate for destructive, irreversible actions (delete expense,
 * remove member, ...) — never fire those directly from a single click.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  isLoading,
  isDestructive = true,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent mx={4}>
          <AlertDialogHeader fontSize="md" fontWeight={700}>
            {title}
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text fontSize="sm" color="ink.600">
              {description}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button
              colorScheme={isDestructive ? 'red' : 'primary'}
              onClick={onConfirm}
              ml={3}
              isLoading={isLoading}
            >
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
