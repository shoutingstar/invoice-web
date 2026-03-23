'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="w-full justify-start"
    >
      <LogOut className="mr-2 h-4 w-4" />
      로그아웃
    </Button>
  )
}
