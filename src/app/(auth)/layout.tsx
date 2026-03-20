import { AuthHeader } from '@/components/layout/auth-header'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
