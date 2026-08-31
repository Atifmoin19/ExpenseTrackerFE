import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from 'Features/Store/common'
import { consumePendingInviteCode } from 'Services/auth'
import { useAcceptInviteMutation } from 'Services/Api/invites.api'
import { useAppToast } from 'Features/Hooks/useAppToast'

/**
 * Covers the deep-link case where a user opened /invite/{code} while logged
 * out, completed sign-in (OTP or Google), and now needs the invite they
 * started with to be accepted automatically instead of just dropping them
 * on Home.
 */
export function useAcceptPendingInvite() {
  const navigate = useNavigate()
  const toast = useAppToast()
  const isLoggedIn = useAppSelector((state) => state.app.isLoggedIn)
  const profile = useAppSelector((state) => state.user.profile)
  const [acceptInvite] = useAcceptInviteMutation()
  const handledRef = useRef(false)

  useEffect(() => {
    if (!isLoggedIn || !profile?.displayName || handledRef.current) return
    const code = consumePendingInviteCode()
    if (!code) return
    handledRef.current = true

    acceptInvite(code)
      .unwrap()
      .then((result) => {
        toast.success('Welcome!', `You've joined ${result.data?.name ?? 'the trip'}.`)
        navigate('/')
      })
      .catch((err) => toast.error("Couldn't join that trip automatically", err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, profile])
}
