import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "../layouts/MainLayout";

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

export const router = createBrowserRouter([
   {
      path: "/",
      element: <MainLayout />,
      children: [
         { index: true, element: <ChooseRole /> },
         { path: "login", element: <Login /> },
         { path: "changePassword", element: <ChangePassword /> },

         // Admin
         { path: "home", element: <Home /> },
         { path: "teachers", element: <Teachers /> },
         { path: "groups", element: <Groups /> },
         { path: "groups/:id", element: <GroupDetail /> },
         { path: "subjects", element: <Subjects /> },
         { path: "students", element: <Students /> },

         // Student
         { path: "student/home", element: <StudentHome /> },
         { path: "student/grades", element: <StudentGrades /> },

         // Teacher
         { path: "teacher/home", element: <TeacherHome /> },
         { path: "teacher/groups", element: <TeacherGroups /> },
         { path: "teacher/groups/:group/:subject", element: <TeacherGroupDetail /> },

         { path: "*", element: <NotFound /> },
      ],
   },
]);