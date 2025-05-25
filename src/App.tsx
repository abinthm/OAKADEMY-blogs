import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Link } from 'react-router-dom';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WriteBlogPage from './pages/WriteBlogPage';
import ViewBlogPage from './pages/ViewBlogPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import PendingPostsPage from './pages/PendingPostsPage';

// Route protection
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

const NotFound = () => (
  <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
    <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
    <Link
      to="/"
      className="px-4 py-2 bg-[#3B3D87] text-white rounded-md hover:bg-[#2d2f66] transition-colors"
    >
      Back to Home
    </Link>
  </div>
);

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={
              user ? <Navigate to="/" replace /> : <LoginPage />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/" replace /> : <RegisterPage />
            } />
            <Route path="/post/:id" element={<ViewBlogPage />} />
            
            {/* Protected Routes */}
            <Route path="/write" element={<ProtectedRoute><WriteBlogPage /></ProtectedRoute>} />
            <Route path="/edit/:id" element={<ProtectedRoute><WriteBlogPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/pending-posts" element={<ProtectedRoute><PendingPostsPage /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;