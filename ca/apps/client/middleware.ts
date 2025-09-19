import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only allow citizens to access client app
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return token?.role === "citizen";
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"]
};