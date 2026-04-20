import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { capitalize } from '../scripts/capitalize.js'
import { api } from '../scripts/api.js';

function Login() {

   const [loading, setLoading] = useState(false)

   const defaultForm = {
      username: '',
      password: ''
   }

   const [formValues, setFormValues] = useState(defaultForm);
   const [msg, setMsg] = useState({
      msg: '',
      type: ''
   })

   const location = useLocation();
   const role = location.state?.role


   const login = async () => {
      try {
         setLoading(true)
         if (formValues.password.trim() == '' || formValues.username.trim() == '') {
            setMsg({
               msg: 'Məlumatlar doldurulmayıb',
               type: 'error'
            });
            return;
         }

         const res = await api.post(`/${role}/loginAs${capitalize(role)}`, formValues);

         setMsg({
            msg: 'Uğurla daxil oldunuz!',
            type: 'success'
         })
      } catch (error) {
         setMsg({
            msg: 'Uğursuz giriş',
            type: 'error'
         })
         console.log(error);
      }
      finally {
         setLoading(false)
      }
   }

   const changeValues = (e) => {
      const { name, value } = e;
      setFormValues(prev => ({
         ...prev,
         [name]: value
      }))
   }

   return (
      <div className='w-96 flex flex-col gap-5'>
         <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <legend className="fieldset-legend text-xl"> {capitalize(role)} kimi daxi ol</legend>

            <label className="label">User Name</label>
            <input name='username' value={formValues.username} className="p-3 input" type="text" placeholder="Username" onChange={(e) => changeValues(e.target)} />

            <label className="label">Password</label>
            <input name='password' value={formValues.password} className="p-3 input" type="password" placeholder="Password" onChange={(e) => changeValues(e.target)} />

            <button className="btn btn-neutral mt-4" onClick={login}>{loading ? 'Daxil olunur' : 'Daxil ol'}</button>
         </fieldset>
         {
            msg?.msg == '' ?
               <div></div>
               : msg.type === 'success'
                  ? <div role="alert" className="alert alert-success">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <span>{`${msg.msg}`}</span>
                  </div>
                  : <div role="alert" className="alert alert-error">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <span>{`${msg.msg}`}</span>
                  </div>
         }
      </div>
   )
}

export default Login
