/**
 * ============================================================
 * DashboardLayout — Authenticated Dashboard Layout Wrapper
 * ============================================================
 * Provides the layout structure for all authenticated dashboard
 * pages (patient, doctor, admin). Renders:
 *  - Navbar at the top
 *  - Sidebar for navigation on the left
 *  - Main content area using React Router's <Outlet />
 * 
 * The 'fade-in' class provides a smooth entrance animation
 * when switching between dashboard pages.
 * ============================================================
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content fade-in">
          {/* Renders the matched child route component */}
          <Outlet />
        </main>
      </div>
    </>
  );
}
