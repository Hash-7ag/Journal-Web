import { createBrowserRouter, Navigate } from "react-router-dom";
import { useState, useEffect, lazy } from "react";
import MainLayout from "../layouts/MainLayout";
import { getUserStoreData } from "../store/userStore.js";
import api from "../scripts/api.js";

const Groups = lazy(() => import("../pages/admin/Groups"));
const GroupDetail = lazy(() => import("../pages/admin/GroupDetail"));
const Subjects = lazy(() => import("../pages/admin/Subjects"));
const Students = lazy(() => import("../pages/admin/Students"));
const Teachers = lazy(() => import("../pages/admin/Teachers"));
const Home = lazy(() => import("../pages/admin/Home"));
const ChangePassword = lazy(() => import("../pages/auth/ChangePassword"));
const ChooseRole = lazy(() => import("../pages/auth/ChooseRole"));
const Login = lazy(() => import("../pages/auth/Login"));
const NotFound = lazy(() => import("../pages/error/NotFound"));
const StudentHome = lazy(() => import("../pages/student/StudentHome"));
const StudentGrades = lazy(() => import("../pages/student/StudentGrades"));
const TeacherHome = lazy(() => import("../pages/teacher/TeacherHome"));
const TeacherGroups = lazy(() => import("../pages/teacher/TeacherGroups"));
const TeacherGroupDetail = lazy(() => import("../pages/teacher/TeacherGroupDetail"));

const homeRoutes = {
   admin: '/home',
   student: '/student/home',
   teacher: '/teacher/home',
};

// "/" и "/login" — если уже залогинен редирект на home
function PublicGuard({ children }) {
   const { role } = getUserStoreData();
   const ls = localStorage.getItem("app_user_role");
   if (ls && role) return <Navigate to={homeRoutes[role] ?? '/home'} replace />;
   return children;
}

// Приватные страницы — проверяем localStorage и роль
function PrivateGuard({ children, allowedRole }) {
   const ls = localStorage.getItem("app_user_role");
   if (!ls) return <Navigate to="/" replace />;

   const { role } = getUserStoreData();
   if (!role) return <Navigate to="/" replace />;

   // если роль не совпадает — редирект на свой home
   if (allowedRole && role !== allowedRole) {
      return <Navigate to={homeRoutes[role] ?? '/'} replace />;
   }

   return children;
}

// changePassword — берет роль из localStorage
function ChangePasswordGuard({ children }) {
   const ls = localStorage.getItem("app_user_role");
   if (!ls) return <Navigate to="/" replace />;

   const { role } = getUserStoreData();
   if (!role) return <Navigate to="/" replace />;

   const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'redirect'

   const homeRoutes = {
      admin: '/home',
      student: '/student/home',
      teacher: '/teacher/home',
   };

   useEffect(() => {
      api.get(`/${role}/getMyProfile`)
         .then(res => {
            // если пароль уже изменён — на home
            if (res.data.isChangePassword) {
               setStatus('redirect');
            } else {
               setStatus('ok');
            }
         })
         .catch(() => {
            // если ошибка — пусть идёт на home, там разберётся
            setStatus('redirect');
         });
   }, []);

   if (status === 'loading') {
      return (
         <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
            <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
         </div>
      );
   }

   if (status === 'redirect') {
      return <Navigate to={homeRoutes[role]} replace />;
   }

   return children;
}

export const router = createBrowserRouter([
   {
      path: "/",
      element: <MainLayout />,
      children: [
         {
            index: true,
            element: (
               <PublicGuard>
                  <ChooseRole />
               </PublicGuard>
            )
         },
         {
            path: "login",
            element: (
               <PublicGuard>
                  <Login />
               </PublicGuard>
            )
         },
         {
            path: "changePassword",
            element: (
               <ChangePasswordGuard>
                  <ChangePassword />
               </ChangePasswordGuard>
            )
         },

         // Admin
         { path: "home", element: <PrivateGuard allowedRole="admin"><Home /></PrivateGuard> },
         { path: "teachers", element: <PrivateGuard allowedRole="admin"><Teachers /></PrivateGuard> },
         { path: "groups", element: <PrivateGuard allowedRole="admin"><Groups /></PrivateGuard> },
         { path: "groups/:id", element: <PrivateGuard allowedRole="admin"><GroupDetail /></PrivateGuard> },
         { path: "subjects", element: <PrivateGuard allowedRole="admin"><Subjects /></PrivateGuard> },
         { path: "students", element: <PrivateGuard allowedRole="admin"><Students /></PrivateGuard> },

         // Student
         { path: "student/home", element: <PrivateGuard allowedRole="student"><StudentHome /></PrivateGuard> },
         { path: "student/grades", element: <PrivateGuard allowedRole="student"><StudentGrades /></PrivateGuard> },

         // Teacher
         { path: "teacher/home", element: <PrivateGuard allowedRole="teacher"><TeacherHome /></PrivateGuard> },
         { path: "teacher/groups", element: <PrivateGuard allowedRole="teacher"><TeacherGroups /></PrivateGuard> },
         { path: "teacher/groups/:group/:subject", element: <PrivateGuard allowedRole="teacher"><TeacherGroupDetail /></PrivateGuard> },

         { path: "*", element: <NotFound /> },
      ],
   },
]);