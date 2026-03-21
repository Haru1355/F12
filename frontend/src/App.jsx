import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProfile } from './pages/AdminProfile';
import { AdminTests } from './pages/AdminTests';
import { AdminSessions } from './pages/AdminSessions';
import { PsychologistDashboard } from './pages/PsychologistDashboard';
import { PsychologistProfile } from './pages/PsychologistProfile';
import { ClientForm } from './pages/ClientForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/form/:formId" element={<ClientForm />} />

          {/* Админ */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/tests" element={<ProtectedRoute allowedRoles={['admin']}><AdminTests /></ProtectedRoute>} />
          <Route path="/admin/sessions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSessions /></ProtectedRoute>} />

          {/* Психолог */}
          <Route path="/psychologist" element={<ProtectedRoute allowedRoles={['psychologist']}><PsychologistDashboard /></ProtectedRoute>} />
          <Route path="/psychologist/profile" element={<ProtectedRoute allowedRoles={['psychologist']}><PsychologistProfile /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;