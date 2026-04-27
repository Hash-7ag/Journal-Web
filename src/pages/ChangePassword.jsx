import React, { useState, useEffect } from 'react';
import { capitalize } from '../scripts/capitalize.js';
import { api } from '../scripts/api.js';
import { getUserData } from '../store/userStore';
import { useNavigate } from 'react-router-dom'

function ChangePassword() {
   const navigate = useNavigate();

   const [loading, setLoading] = useState(false);
   const [confirmPassword, setConfirmPassword] = useState('');
   const [passwordMatchError, setPasswordMatchError] = useState(false);
   const [msg, setMsg] = useState({ msg: '', type: '' });

   const [formValues, setFormValues] = useState({
      username: '',
      oldPassword: '',
      newPassword: ''
   });

   useEffect(() => {
      const userData = getUserData();
      if (userData.username && userData.role) {
         setFormValues(prev => ({ ...prev, username: userData.username }));
      }
   }, []);

   const handleFormChange = (e) => {
      const { name, value } = e.target;
      setFormValues(prev => ({ ...prev, [name]: value }));
      if (name === 'newPassword') {
         setPasswordMatchError(confirmPassword !== value);
      }
   };

   const handleConfirmChange = (e) => {
      const value = e.target.value;
      setConfirmPassword(value);
      setPasswordMatchError(formValues.newPassword !== value);
   };

   const handleSubmit = async () => {
      try {
         setLoading(true);
         if (
            formValues.username.trim() === '' ||
            formValues.oldPassword.trim() === '' ||
            formValues.newPassword.trim() === ''
         ) {
            setMsg({ msg: 'Məlumatlar doldurulmayıb', type: 'error' });
            return;
         }
         if (formValues.newPassword !== confirmPassword) {
            setPasswordMatchError(true);
            setMsg({ msg: 'Yeni parollar uyğun gəlmir', type: 'error' });
            return;
         }

         const userData = getUserData();
         const role = userData.role;
         if (!role) throw new Error('Role not found');

         const res = await api.post(`/${role}/changePasswordAs${capitalize(role)}`, formValues);
         setMsg({ msg: 'Uğurla daxil oldunuz!', type: 'success' });

         setFormValues(prev => ({ ...prev, oldPassword: '', newPassword: '' }));
         setConfirmPassword('');
         setPasswordMatchError(false);

         navigate('/home');
      } catch (error) {
         setMsg({ msg: 'Uğursuz giriş', type: 'error' });
         console.log(error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="w-96 flex flex-col gap-5">
         <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <legend className="fieldset-legend text-xl">Parolunuzu dəyişdirin!</legend>

            <label className="label">İstifadəçi adı</label>
            <input
               type="text"
               className="p-3 input"
               name="username"
               value={formValues.username}
               onChange={handleFormChange}
               readOnly
            />

            <label className="label">Köhnə password</label>
            <input
               type="password"
               className="p-3 input validator"
               required
               placeholder="Password"
               minLength="8"
               pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
               title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
               name="oldPassword"
               value={formValues.oldPassword}
               onChange={handleFormChange}
            />
            <p className="validator-hint hidden">Required</p>

            <label className="label">Yeni password</label>
            <input
               type="password"
               className="p-3 input validator"
               required
               placeholder="Password"
               minLength="8"
               pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
               title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
               name="newPassword"
               value={formValues.newPassword}
               onChange={handleFormChange}
            />
            <p className="validator-hint hidden">Required</p>

            <label className="label">Yeni password (təsdiq)</label>
            <input
               type="password"
               className="p-3 input validator"
               required
               placeholder="Password"
               minLength="8"
               pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
               title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
               name="confirmPassword"
               value={confirmPassword}
               onChange={handleConfirmChange}
            />
            <p className={`validator-hint ${passwordMatchError ? '' : 'hidden'}`}>
               Şifrələr uyğun gəlmir
            </p>

            <button className="btn btn-neutral mt-4" onClick={handleSubmit}>
               {loading ? 'Dəyişdirilir...' : 'Parolu dəyiş'}
            </button>
         </fieldset>

         {msg?.msg !== '' && (
            <div role="alert" className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
               >
                  {msg.type === 'success' ? (
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                     />
                  ) : (
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                     />
                  )}
               </svg>
               <span>{msg.msg}</span>
            </div>
         )}
      </div>
   );
}

export default ChangePassword;