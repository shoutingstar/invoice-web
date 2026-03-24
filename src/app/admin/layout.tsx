import type { ReactNode } from 'react'
import { Container } from '@/components/layout/container'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <Container className="py-8">{children}</Container>
}
