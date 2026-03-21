import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // В демо-версии просто пропускаем все запросы
  return NextResponse.next();
}

export const config = {
  matcher: ["/psychologist/:path*", "/admin/:path*"],
};
