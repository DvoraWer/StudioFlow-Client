import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import RoleHome from './pages/RoleHome.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import ClassesPage from './pages/ClassesPage.jsx';
import ClassDetailsPage from './pages/ClassDetailsPage.jsx';
import ParticipantsPage from './pages/ParticipantsPage.jsx';
import MyRegistrationsPage from './pages/MyRegistrationsPage.jsx';

import AdminOverviewPage from './pages/admin/AdminOverviewPage.jsx';
import ClassFormPage from './pages/admin/ClassFormPage.jsx';
import RoomsPage from './pages/admin/RoomsPage.jsx';
import RoomFormPage from './pages/admin/RoomFormPage.jsx';
import InstructorsPage from './pages/admin/InstructorsPage.jsx';
import InstructorFormPage from './pages/admin/InstructorFormPage.jsx';

import InstructorOverviewPage from './pages/instructor/InstructorOverviewPage.jsx';
import InstructorClassesPage from './pages/instructor/InstructorClassesPage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RoleHome />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Public / any authenticated — spec §21 */}
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/classes/:id" element={<ClassDetailsPage />} />

        {/* Admin or the class's own instructor — spec §21 */}
        <Route
          path="/classes/:id/participants"
          element={
            <ProtectedRoute roles={['Admin', 'Instructor']}>
              <ParticipantsPage />
            </ProtectedRoute>
          }
        />

        {/* Member — spec §21 */}
        <Route
          path="/me/registrations"
          element={
            <ProtectedRoute roles="Member">
              <MyRegistrationsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin — spec §21 */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles="Admin">
              <AdminOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes/new"
          element={
            <ProtectedRoute roles="Admin">
              <ClassFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes/:id/edit"
          element={
            <ProtectedRoute roles="Admin">
              <ClassFormPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute roles="Admin">
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rooms/new"
          element={
            <ProtectedRoute roles="Admin">
              <RoomFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rooms/:id/edit"
          element={
            <ProtectedRoute roles="Admin">
              <RoomFormPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/instructors"
          element={
            <ProtectedRoute roles="Admin">
              <InstructorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/instructors/new"
          element={
            <ProtectedRoute roles="Admin">
              <InstructorFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/instructors/:id/edit"
          element={
            <ProtectedRoute roles="Admin">
              <InstructorFormPage mode="edit" />
            </ProtectedRoute>
          }
        />

        {/* Instructor — spec §13 */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute roles="Instructor">
              <InstructorOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/classes"
          element={
            <ProtectedRoute roles="Instructor">
              <InstructorClassesPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
