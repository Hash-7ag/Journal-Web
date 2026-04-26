import React from 'react'
import { useNavigate } from 'react-router-dom'
import { setUserData } from '../store/userStore.js';

function ChooseRole() {

   const navigate = useNavigate()

   const moveToLogin = (role) => {
      setUserData(null, role);
      navigate('/login')
   }

   return (
      <div className='mt-32'>
         <div className="join join-vertical lg:join-horizontal">
            <button onClick={() => moveToLogin('student')} className="btn btn-xl hover:bg-slate-700 join-item px-5 py-3">Student</button>
            <button onClick={() => moveToLogin('teacher')} className="btn btn-xl hover:bg-slate-700 join-item px-5 py-3">Teacher</button>
            <button onClick={() => moveToLogin('admin')} className="btn btn-xl hover:bg-red-500 join-item px-5 py-3 ">Admin</button>
         </div>
      </div>
   )
}

export default ChooseRole
