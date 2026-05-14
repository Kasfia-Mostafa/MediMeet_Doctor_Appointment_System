import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import Landing from './pages/public/Landing';
import SignIn from './pages/public/SignIn';
import SignUp from './pages/public/SignUp';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Blog from './pages/public/Blog';
import BlogDetails from './pages/public/BlogDetails';
import FindDoctor from './pages/public/FindDoctor';
import DoctorDetails from './pages/public/DoctorDetails';
import BookAppointment from './pages/public/BookAppointment';
import NotFound from './pages/public/NotFound';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientRecords from './pages/patient/PatientRecords';
import PatientBilling from './pages/patient/PatientBilling';
import PatientWellness from './pages/patient/PatientWellness';
import PatientFamily from './pages/patient/PatientFamily';
import PatientSettings from './pages/patient/PatientSettings';
import PatientReviews from './pages/patient/PatientReviews';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorPatientDetail from './pages/doctor/DoctorPatientDetail';
import DoctorSettings from './pages/doctor/DoctorSettings';
import DoctorReviews from './pages/doctor/DoctorReviews';
import DoctorEarnings from './pages/doctor/DoctorEarnings';
import DoctorAppointments from './pages/doctor/DoctorAppointments';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStaff from './pages/admin/AdminStaff';
import AdminBlog from './pages/admin/AdminBlog';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AddDoctor from './pages/admin/AddDoctor';
import AdminDoctors from './pages/admin/AdminDoctors';
import DoctorDetail from './pages/admin/DoctorDetail';
import AdminAppointments from './pages/admin/AdminAppointments';

// Routing Guards
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'toast', duration: 3000, style: { background: 'var(--surface-container-lowest)', color: 'var(--text-primary)', border: '1px solid var(--outline-variant)' } }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/blog/:id" element={<PublicLayout><BlogDetails /></PublicLayout>} />
        <Route path="/find-doctor" element={<PublicLayout><FindDoctor /></PublicLayout>} />
        <Route path="/doctor-details/:id" element={<PublicLayout><DoctorDetails /></PublicLayout>} />
        <Route path="/book-appointment" element={<ProtectedRoute><PublicLayout><BookAppointment /></PublicLayout></ProtectedRoute>} />

        {/* Patient Routes */}
        <Route path="/patient" element={<RoleRoute roles={['patient']}><DashboardLayout /></RoleRoute>}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="billing" element={<PatientBilling />} />
          <Route path="wellness" element={<PatientWellness />} />
          <Route path="family" element={<PatientFamily />} />
          <Route path="reviews" element={<PatientReviews />} />
          <Route path="patientprofile" element={<PatientSettings />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={<RoleRoute roles={['doctor']}><DashboardLayout /></RoleRoute>}>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="patients/:id" element={<DoctorPatientDetail />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="reviews" element={<DoctorReviews />} />
          <Route path="earnings" element={<DoctorEarnings />} />
          <Route path="doctorprofile" element={<DoctorSettings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<RoleRoute roles={['admin']}><DashboardLayout /></RoleRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminStaff />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="doctors/:id" element={<DoctorDetail />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="add-doctor" element={<AddDoctor />} />
          <Route path="articles" element={<AdminBlog />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="adminprofile" element={<AdminSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </>
  );
}

export default App;
