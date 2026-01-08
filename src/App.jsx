import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import AnnouncementList from './components/AnnouncementList';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import StudentLogin from './components/StudentLogin';
import StudentDashboard from './components/StudentDashboard';

// Protected Route Wrapper
function ProtectedRoute({ children, role }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center" style={{ marginTop: '4rem' }}>Loading...</div>;

  if (!user) {
    if (role === 'admin') return <Navigate to="/admin/login" />;
    if (role === 'student') return <Navigate to="/student/login" />;
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/dashboard" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>

        {/* Footer */}
        <footer className="text-center" style={{ padding: '2rem', color: '#888', fontSize: '0.9rem', borderTop: '1px solid #eee', marginTop: 'auto' }}>
          &copy; {new Date().getFullYear()} College Announcement Portal
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
