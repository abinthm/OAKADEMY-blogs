import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, PenSquare, User, LogOut, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/Frame 1.svg';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img src={logo} alt="Logo" className="h-14 w-auto" />
            </Link>
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center h-20">
            <Link to="/" className="flex-shrink-0">
              <span className="text-[#3B3D87] font-serif text-base md:text-2xl font-bold whitespace-nowrap tracking-wide">Voice of the Oak</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#3B3D87] transition-colors">
              Home
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/write"
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-[#3B3D87] hover:bg-[#2d2f66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B3D87] transition-colors"
                >
                  Write Story
                </Link>
                
                <Link
                  to="/pending-posts"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#3B3D87] hover:bg-gray-50 transition-colors"
                >
                  Pending Posts
                </Link>
                
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <div className="relative ml-3">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B3D87]"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                      {user.avatar && !avatarError ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={user.avatar}
                          alt={user.name}
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-[#3B3D87] bg-opacity-20 flex items-center justify-center">
                          <span className="text-[#3B3D87] font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  
                  {isMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <div className="py-1" role="none">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Your Profile
                          </div>
                        </Link>
                        <Link
                          to="/write"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <PenSquare className="mr-2 h-4 w-4" />
                            Write Story
                          </div>
                        </Link>
                        <Link
                          to="/pending-posts"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            Pending Posts
                          </div>
                        </Link>
                        {user.isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              Admin Dashboard
                            </div>
                          </Link>
                        )}
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          <div className="flex items-center">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-[#3B3D87] hover:text-[#2d2f66] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-[#3B3D87] hover:bg-[#2d2f66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B3D87] transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#3B3D87]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#3B3D87] hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#3B3D87] hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  to="/write"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#3B3D87] hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Write Story
                </Link>
                <Link
                  to="/pending-posts"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#3B3D87] hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pending Posts
                </Link>
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#3B3D87] hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#3B3D87] hover:bg-gray-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#3B3D87] hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-[#3B3D87] hover:bg-[#2d2f66] hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;