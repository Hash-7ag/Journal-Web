import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
   return (
      <header className="navbar bg-base-100 shadow-sm container mx-auto">
         <div className="navbar-start flex">
            <ul className="menu menu-horizontal px-1 gap-2">
               {/* <li><Link to="/">ChooseRole</Link></li>
               <li><Link to="/login">Login</Link></li>
               <li><Link to="/home">Home</Link></li>
               <li><Link to="/error">Error</Link></li> */}
            </ul>
         </div>
         <div className="navbar-end avatar">
            <div className="rounded-full w-12">
               <img src="https://cdn.discordapp.com/attachments/1486991179621863518/1495192484370976806/user-profile-icon-circle_1256048-12499.png?ex=69e55a03&is=69e40883&hm=b6937b9b168f94a98e8c2624fe7bd2ee4af3590ba289103ab7e1dfe579347766&" />
            </div>
         </div>
      </header>
   )
}

export default Header
