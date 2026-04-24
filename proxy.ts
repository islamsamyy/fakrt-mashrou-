import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedPaths = [
    '/onboarding',
    '/dashboard',
    '/add-idea',
    '/messages',
    '/settings',
    '/kyc',
    '/portfolio',
    '/saved',
    '/funding-progress',
    '/checkout',
    '/admin',
    '/notifications',
  ]

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirect unauthenticated users to login
  if (isProtectedPath && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/register']
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && user) {
    // Redirect to correct dashboard based on role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'founder'
    return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
  }

  // BUG #16 FIX: Role-based access control for protected routes
  if (isProtectedPath && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = (profile?.role as 'investor' | 'founder' | 'admin') ?? 'founder'
    const pathname = request.nextUrl.pathname

    // Define role requirements for each protected route
    const roleRequirements: Record<string, string[]> = {
      '/admin': ['admin'],
      '/dashboard/investor': ['investor', 'admin'],
      '/dashboard/founder': ['founder', 'admin'],
      '/portfolio': ['investor', 'admin'],
      '/saved': ['investor', 'admin'],
    }

    // Check if user's role has access to this route
    let hasAccess = true
    for (const [route, allowedRoles] of Object.entries(roleRequirements)) {
      if (pathname.startsWith(route)) {
        hasAccess = allowedRoles.includes(userRole)
        break
      }
    }

    // If user doesn't have access to this route, redirect to their dashboard
    if (!hasAccess) {
      return NextResponse.redirect(
        new URL(`/dashboard/${userRole}`, request.url)
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
