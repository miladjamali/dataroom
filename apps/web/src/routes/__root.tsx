// src/routes/__root.tsx
import { Outlet, createRootRoute, Link } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ToastContainer } from 'react-toastify'
import { useAuth } from '@/lib/auth-context'
import { Building2, Menu, X } from 'lucide-react'
import { useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const { isAuthenticated, user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  console.log('RootComponent is rendering!')
  
  const handleLogout = () => {
    logout()
    // Navigate to home after logout
    window.location.href = '/'
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <Link to="/" className="text-xl font-bold text-gray-900">
                <span className="hidden sm:inline">DataRoom MVP</span>
                <span className="sm:hidden">DataRoom</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Home
              </Link>
              <a 
                href="http://localhost:3001" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Documentation
              </a>
              
              {isAuthenticated ? (
                // Authenticated user menu
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/files" 
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    Files
                  </Link>
                  <Link 
                    to="/upload" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Upload
                  </Link>
                  <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                    <span className="text-sm text-gray-500 hidden lg:inline">
                      Welcome, {user?.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                // Guest user menu
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/files" 
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    Files
                  </Link>
                  <Link 
                    to="/upload" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Upload
                  </Link>
                  <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                    <Link 
                      to="/login" 
                      className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="bg-gray-100 text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-600 hover:text-blue-600 p-2 rounded-md transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link 
                  to="/"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium transition-colors"
                >
                  Home
                </Link>
                <a 
                  href={import.meta.env.VITE_APP_API_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium transition-colors"
                >
                  Documentation
                </a>
                <Link 
                  to="/files"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium transition-colors"
                >
                  Files
                </Link>
                <Link 
                  to="/upload"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium transition-colors"
                >
                  Upload
                </Link>
                
                {isAuthenticated ? (
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Welcome, {user?.name}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        closeMobileMenu()
                      }}
                      className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                    <Link 
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-md font-medium transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <div className="min-h-screen">
        <Outlet />
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* <TanStackRouterDevtools /> */}
    </>
  )
}