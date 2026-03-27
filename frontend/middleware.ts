import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Nếu cố tình vào trang /admin mà không có token
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // 2. Có token nhưng không phải Admin (role != 1)
    // Lưu ý: role=1 theo nguyên tắc phân quyền em đã nêu từ đầu
    if (role !== 'Admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. Nếu đã đăng nhập rồi mà còn quay lại trang /login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Cấu hình để middleware chỉ chạy ở những đường dẫn nhất định
export const config = {
  matcher: ['/admin/:path*', '/login'],
};