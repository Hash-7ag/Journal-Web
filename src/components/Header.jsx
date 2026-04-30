import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function Header() {

   const location = useLocation();
   const hiddenPaths = ['/', '/login', '/changePassword'];
   const isHidden = hiddenPaths.includes(location.pathname);

   return (
      <header className="navbar bg-base-100 shadow-sm container mx-auto">
         <div className="navbar-start flex">
            {
               !isHidden && (
                  <ul className="menu menu-horizontal px-1 gap-2">
                     <li><Link to="/students">Students</Link></li>
                     <li><Link to="/teachers">Teachers</Link></li>
                     <li><Link to="/subjects">Subjects</Link></li>
                     <li><Link to="/groups">Groups</Link></li>
                     <li><Link to="/home">My Profile</Link></li>
                  </ul>
               )
            }
         </div>
         <Link to="/home" className="navbar-end avatar cursor-pointer">
            <div className="rounded-full w-10">
               <img alt="Header Avatar" src='https://i.pinimg.com/736x/f5/47/d8/f547d800625af9056d62efe8969aeea0.jpg' />
            </div>
         </Link>
      </header>
   )
}

export default Header
