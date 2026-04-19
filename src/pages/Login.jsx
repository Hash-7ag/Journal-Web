import React from 'react'
import { useLocation } from 'react-router-dom'
import { capitalize } from '../scripts/capitalize.js'

function Login() {

   const location = useLocation();
   const role = location.state?.role

   return (
      <div className='w-72'>
         <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <legend className="fieldset-legend text-xl">Login as {capitalize(role)}</legend>

            <label className="label">User Name</label>
            <input className="p-3 input" type="text" placeholder="User Name" />

            <label className="label">Password</label>
            <input className="p-3 input" type="password" placeholder="Password" />

            <button className="btn btn-neutral mt-4">Login</button>
         </fieldset>
      </div>
   )
}

export default Login
