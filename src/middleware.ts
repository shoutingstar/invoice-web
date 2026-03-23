import { auth } from '@/auth'
import { ROUTES } from '@/lib/constants'

export default auth(req => {
  const isLoggedIn = !!req.auth
  const isProtected =
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/invoices')
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')

  // 보호된 라우트 접근 시 미인증이면 로그인 페이지로
  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL(ROUTES.LOGIN, req.nextUrl))
  }

  // 로그인 페이지 접근 시 이미 인증되어 있으면 대시보드로
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL(ROUTES.DASHBOARD, req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
