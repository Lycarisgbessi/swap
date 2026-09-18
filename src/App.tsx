import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Courses from './pages/public/Courses';
import CourseDetail from './pages/public/CourseDetail';
import AccessCourse from './pages/public/AccessCourse';
import PaymentReturn from './pages/public/PaymentReturn';
import PaymentCancel from './pages/public/PaymentCancel';
import Overview from './pages/dashboard/Overview';
import AdminCourses from './pages/dashboard/AdminCourses';
import AdminCourseDetail from './pages/dashboard/AdminCourseDetail';
import AdminStudents from './pages/dashboard/AdminStudents';
import AdminSettings from './pages/dashboard/AdminSettings';
import AdminLogin from './pages/auth/AdminLogin';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './components/ThemeProvider';
import SmoothScroll from './components/SmoothScroll';
import { ToastProvider } from './components/Toast';
import { SettingsProvider } from './components/SettingsProvider';
import { isAuthenticated } from './services/api';
import Cursor from './components/Cursor';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <SettingsProvider>
        <ToastProvider>
          <SmoothScroll />
          <Cursor />
          <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<CourseDetail />} />
            </Route>

            {/* Accès apprenant (sans layout) */}
            <Route path="/access/:token" element={<AccessCourse />} />

            {/* Retour paiement Djomy */}
            <Route path="/payment/return" element={<PaymentReturn />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Dashboard Routes — accès sécurisé */}
            <Route path="/admin" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Overview />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/:id" element={<AdminCourseDetail />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
