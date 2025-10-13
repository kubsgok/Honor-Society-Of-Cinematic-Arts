import { NavBar } from '../components/NavBar'

export default function RestrictedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <NavBar />

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] px-4 py-16">
        <div className="text-center">
          <div className="mx-auto mb-6 w-44 h-44 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-26 w-16 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              {/* taller shackle */}
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 10V7a5 5 0 0110 0v3" />
              {/* lock body (taller) */}
              <rect x="5.5" y="10.5" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Access denied</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            You don't have permission to view this page. If you believe this is a mistake, contact an administrator or
            sign in with an account that has access.
          </p>
        </div>
      </main>
    </div>
  )
}