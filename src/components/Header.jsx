import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiUsers, FiBook, FiGrid, FiUser, FiHome } from 'react-icons/fi'
import { FaUser } from "react-icons/fa";

function Header() {
   const location = useLocation()
   const hiddenPaths = ['/', '/login', '/changePassword']
   const isHidden = hiddenPaths.includes(location.pathname)

   const [theme, setTheme] = useState(
      () => localStorage.getItem('theme') || 'light'
   )

   useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
   }, [theme])

   const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

   const navLinks = [
      { to: '/students', label: 'Students', icon: <FiUsers size={15} /> },
      { to: '/teachers', label: 'Teachers', icon: <FiUser size={15} /> },
      { to: '/subjects', label: 'Subjects', icon: <FiBook size={15} /> },
      { to: '/groups', label: 'Groups', icon: <FiGrid size={15} /> },
      { to: '/home', label: 'Profile', icon: <FiHome size={15} /> },
   ]

   return (
      <header className="w-full sticky top-0 z-50 bg-base-100/80 backdrop-blur border-b border-base-200 shadow-sm">
         <div className="container mx-auto px-4 h-16 flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white font-bold text-sm shadow-md">
                  EC
               </div>
               <span className="font-semibold text-sm hidden sm:block opacity-80">
                  Elektron Cədvəl
               </span>
            </Link>

            {/* Nav links */}
            {!isHidden && (
               <nav className="flex items-center gap-1">
                  {navLinks.map(({ to, label, icon }) => (
                     <Link
                        key={to}
                        to={to}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                           ${location.pathname === to
                              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                              : 'opacity-60 hover:opacity-100 hover:bg-base-200'
                           }`}
                     >
                        {icon}
                        <span className="hidden md:block">{label}</span>
                     </Link>
                  ))}
               </nav>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">

               {/* Theme toggle */}
               <label className="swap swap-rotate cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                  <input
                     type="checkbox"
                     checked={theme === 'dark'}
                     onChange={toggleTheme}
                  />
                  {/* sun */}
                  <svg className="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                     <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                  </svg>
                  {/* moon */}
                  <svg className="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                     <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                  </svg>
               </label>

               {/* Avatar */}
               {!isHidden && (
                  <Link to="/home">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                        <FaUser />
                     </div>
                  </Link>
               )}
            </div>
         </div>
      </header>
   )
}

export default Header