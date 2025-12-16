import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Hanya log untuk request halaman dan API (abaikan static files/images biar tidak spam)
    if (
        !request.url.includes('/_next') &&
        !request.url.includes('/favicon.ico') &&
        !request.url.includes('/public')
    ) {
        const timestamp = new Date().toISOString();
        const method = request.method;
        const url = request.nextUrl.pathname;

        // Log format: [WAKTU] METHOD /url
        console.log(`[${timestamp}] ${method} ${url}`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
