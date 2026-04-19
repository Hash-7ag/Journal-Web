import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "../layouts/MainLayout";
const ChooseRole = lazy(() => import("../pages/ChooseRole"));
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const NotFound = lazy(() => import("../pages/NotFound"));

export const router = createBrowserRouter([
   {
      path: "/",
      element: <MainLayout />,
      children: [
         { index: true, element: <ChooseRole /> },
         { path: "login", element: <Login /> },
         { path: "home", element: <Home /> },
         { path: "*", element: <NotFound /> }
      ],
   },
])