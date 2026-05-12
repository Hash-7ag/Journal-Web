import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "../layouts/MainLayout";

const Groups = lazy(() => import("../pages/admin/Groups"));
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

export const router = createBrowserRouter([
   {
      path: "/",
      element: <MainLayout />,
      children: [
         { index: true, element: <ChooseRole /> },
         { path: "login", element: <Login /> },
         { path: "changePassword", element: <ChangePassword /> },
         { path: "home", element: <Home /> },
         { path: "teachers", element: <Teachers /> },
         { path: "groups", element: <Groups /> },
         { path: "subjects", element: <Subjects /> },
         { path: "students", element: <Students /> },
         { path: "student/home", element: <StudentHome /> },
         { path: "student/grades", element: <StudentGrades /> },
         { path: "*", element: <NotFound /> }
      ],
   },
]);