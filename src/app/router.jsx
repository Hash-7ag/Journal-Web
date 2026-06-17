import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import MainLayout from '../layouts/MainLayout';
import { getUserStoreData, getAuthRole } from '../store/userStore.js';

const Landing = lazy(() => import('../pages/Landing.jsx'));
const Groups = lazy(() => import('../pages/admin/Groups'));
const GroupDetail = lazy(() => import('../pages/admin/GroupDetail'));
const Subjects = lazy(() => import('../pages/admin/Subjects'));
const Students = lazy(() => import('../pages/admin/Students'));
const Teachers = lazy(() => import('../pages/admin/Teachers'));
const Home = lazy(() => import('../pages/admin/Home'));
const ChangePassword = lazy(() => import('../pages/auth/ChangePassword'));
const ChooseRole = lazy(() => import('../pages/auth/ChooseRole'));
const Login = lazy(() => import('../pages/auth/Login'));
const NotFound = lazy(() => import('../pages/error/NotFound'));
const StudentHome = lazy(() => import('../pages/student/StudentHome'));
const StudentGrades = lazy(() => import('../pages/student/StudentGrades'));
const TeacherHome = lazy(() => import('../pages/teacher/TeacherHome'));
const TeacherGroups = lazy(() => import('../pages/teacher/TeacherGroups.jsx'));
const TeacherGroupDetail = lazy(() => import('../pages/teacher/TeacherGroupDetail.jsx'));
const GroupSubjectDetail = lazy(() => import('../pages/admin/GroupSubjectDetail'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const Parents = lazy(() => import('../pages/admin/Parents'));
const ParentHome = lazy(() => import('../pages/parent/ParentHome'));
const ParentGrades = lazy(() => import('../pages/parent/ParentGrades'));

const homeRoutes = {
  admin: '/home',
  student: '/student/home',
  teacher: '/teacher/home',
  parent: '/parent/home',
};

function PublicGuard({ children }) {
  const role = getAuthRole(); // только реальный вход
  if (role) return <Navigate to={homeRoutes[role] ?? '/home'} replace />;
  return children;
}

function PrivateGuard({ children, allowedRole }) {
  const role = getAuthRole(); // только реальный вход
  if (!role) return <Navigate to="/choose-role" replace />;
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={homeRoutes[role] ?? '/choose-role'} replace />;
  }
  return children;
}

function LandingGuard({ children }) {
  const role = getAuthRole(); // только реальный вход
  if (role) return <Navigate to={homeRoutes[role] ?? '/home'} replace />;
  return children;
}
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // Landing — только для гостей; залогиненных кидает на их home
      {
        index: true,
        element: (
          <LandingGuard>
            <Landing />
          </LandingGuard>
        ),
      },

      {
        path: 'choose-role',
        element: (
          <PublicGuard>
            <ChooseRole />
          </PublicGuard>
        ),
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: 'changePassword',
        element: (
          <PrivateGuard>
            <ChangePassword />
          </PrivateGuard>
        ),
      },

      // Admin
      {
        path: 'home',
        element: (
          <PrivateGuard allowedRole="admin">
            <Home />
          </PrivateGuard>
        ),
      },
      {
        path: 'teachers',
        element: (
          <PrivateGuard allowedRole="admin">
            <Teachers />
          </PrivateGuard>
        ),
      },
      {
        path: 'groups',
        element: (
          <PrivateGuard allowedRole="admin">
            <Groups />
          </PrivateGuard>
        ),
      },
      {
        path: 'groups/:id/:semestr',
        element: (
          <PrivateGuard allowedRole="admin">
            <GroupDetail />
          </PrivateGuard>
        ),
      },
      {
        path: 'subjects',
        element: (
          <PrivateGuard allowedRole="admin">
            <Subjects />
          </PrivateGuard>
        ),
      },
      {
        path: 'groups/:id/subject/:subjectId/:semestr',
        element: (
          <PrivateGuard allowedRole="admin">
            <GroupSubjectDetail />
          </PrivateGuard>
        ),
      },
      {
        path: 'students',
        element: (
          <PrivateGuard allowedRole="admin">
            <Students />
          </PrivateGuard>
        ),
      },
      {
        path: 'parents',
        element: (
          <PrivateGuard allowedRole="admin">
            <Parents />
          </PrivateGuard>
        ),
      },

      // Student
      {
        path: 'student/home',
        element: (
          <PrivateGuard allowedRole="student">
            <StudentHome />
          </PrivateGuard>
        ),
      },
      {
        path: 'student/grades',
        element: (
          <PrivateGuard allowedRole="student">
            <StudentGrades />
          </PrivateGuard>
        ),
      },

      // Teacher
      {
        path: 'teacher/home',
        element: (
          <PrivateGuard allowedRole="teacher">
            <TeacherHome />
          </PrivateGuard>
        ),
      },
      {
        path: 'teacher/groups',
        element: (
          <PrivateGuard allowedRole="teacher">
            <TeacherGroups />
          </PrivateGuard>
        ),
      },
      {
        path: 'teacher/groups/:group/:subject',
        element: (
          <PrivateGuard allowedRole="teacher">
            <TeacherGroupDetail />
          </PrivateGuard>
        ),
      },

      // Parent
      {
        path: 'parent/home',
        element: (
          <PrivateGuard allowedRole="parent">
            <ParentHome />
          </PrivateGuard>
        ),
      },
      {
        path: 'parent/grades',
        element: (
          <PrivateGuard allowedRole="parent">
            <ParentGrades />
          </PrivateGuard>
        ),
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
