import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentHome from './student/pages/StudentHome';
import Appointments from './student/pages/Appointments';
import StaffLogin from './staff/pages/StaffLogin';
import StaffDashboard from './staff/pages/StaffDashboard';
import StaffAppointments from './staff/pages/StaffAppointments';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/appointments" element={<StaffAppointments />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
