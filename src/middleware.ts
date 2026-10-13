import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if request is for API
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Handle OPTIONS preflight request
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
      response.headers.set('Access-Control-Max-Age', '86400');
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
