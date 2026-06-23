
import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password'];
const ALWAYS_ALLOW = ['/_next', '/favicon', '/api', '/AthletiQ_logo', '/avatar', '/landing'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    if (pathname === '/landing') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (ALWAYS_ALLOW.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    if (PUBLIC_ROUTES.some((route) => pathname === route)) {
        return NextResponse.next();
    }

    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
