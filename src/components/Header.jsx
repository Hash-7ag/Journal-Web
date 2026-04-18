import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
   return (
      <header className="navbar bg-base-100 shadow-sm container mx-auto">
         <div className="navbar-start flex">
            <ul className="menu menu-horizontal px-1">
               <Link to="/"><li><a href="">Home</a></li></Link>
               <Link to="login"><li><a href="">Login</a></li></Link>
            </ul>
         </div>
         <div className="navbar-end avatar">
            <div className="mask mask-squircle w-16">
               <img src="https://cdn.discordapp.com/attachments/1486991179621863518/1495192484370976806/user-profile-icon-circle_1256048-12499.png?ex=69e55a03&is=69e40883&hm=b6937b9b168f94a98e8c2624fe7bd2ee4af3590ba289103ab7e1dfe579347766&" />
            </div>
         </div>
      </header>
   )
}

export default Header
