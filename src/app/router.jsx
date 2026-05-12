import { createBrowserRouter, redirect } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../../src/scripts/api";
import { getUserStoreData } from '../store/userStore.js';


const Groups = lazy(() => import("../pages/admin/Groups"));
const Subjects = lazy(() => import("../pages/admin/Subjects"));
const Students = lazy(() => import("../pages/admin/Students"));
const Teachers = lazy(() => import("../pages/admin/Teachers"));
const ChangePassword = lazy(() => import("../pages/auth/ChangePassword"));
const ChooseRole = lazy(() => import("../pages/auth/ChooseRole"));
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/auth/Login"));
const NotFound = lazy(() => import("../pages/error/NotFound"));

const userData = getUserStoreData();
const role = userData.role

async function publicLoader() {
   try {
      await api.get(`/${role}/getMyProfile`);
      return redirect('/home'); // если авторизован
   } catch {
      return null;
   }
}

async function privateLoader() {
   try {
      await api.get(`/${role}/getMyProfile`);
      return null;
   } catch {
      return redirect('/login');
   }
}

export const router = createBrowserRouter([
   {
      path: "/",
      element: <MainLayout />,
      children: [
         {
            index: true,
            loader: publicLoader,
            element: <ChooseRole />
         },
         {
            path: "login",
            loader: publicLoader,
            element: <Login />
         },
         {
            path: "changePassword",
            element: <ChangePassword />
         },

         // Private routers
         {
            path: "home",
            loader: privateLoader,
            element: <Home />
         },
         {
            path: "teachers",
            loader: privateLoader,
            element: <Teachers />
         },
         {
            path: "groups",
            loader: privateLoader,
            element: <Groups />
         },
         {
            path: "subjects",
            loader: privateLoader,
            element: <Subjects />
         },
         {
            path: "students",
            loader: privateLoader,
            element: <Students />
         },

         { path: "*", element: <NotFound /> }
      ],
   },
]);