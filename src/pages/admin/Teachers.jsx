import React, { useState, useEffect } from 'react';
import { api } from '../../scripts/api';

function Teachers() {
   const [teachers, setTeachers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [formData, setFormData] = useState({
      name: '',
      surname: '',
      fatherName: '',
      username: '',
      password: '',
      phoneNumber: '',
      email: '',
   });
   const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const response = await api.get('/admin/getAllTeachers');
            setTeachers(response.data);
         } catch (err) {
            console.error('Yüklənmə zamanı xəta:', err);
            setError(err.message || 'yükləmə xətası');
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleAddTeacher = async () => {
      const required = ['name', 'surname', 'fatherName', 'username', 'password', 'phoneNumber', 'email'];
      const missing = required.filter(field => !formData[field].trim());
      if (missing.length) {
         setError(`Please fill: ${missing.join(', ')}`);
         return;
      }

      try {
         setSubmitting(true);
         const response = await api.post('/admin/createTeacher', formData);
         const newTeacher = response.data;
         setTeachers(prev => [newTeacher, ...prev]);
         setIsModalOpen(false);
         setFormData({
            name: '',
            surname: '',
            fatherName: '',
            username: '',
            password: '',
            phoneNumber: '',
            email: '',
         });
         setError('');
      } catch (err) {
         console.error('Create teacher error:', err);
         setError(err.response?.data?.message || 'Failed to create teacher');
      } finally {
         setSubmitting(false);
      }
   };

   if (loading) {
      return <div className="flex justify-center items-center h-screen">Yüklənmə...</div>;
   }

   return (
      <div>
         <ul className="list bg-base-100 rounded-box shadow-md">
            <li className="tracking-wide flex justify-between items-center">
               <span className="p-4 pb-2 text-xs opacity-60">All Teachers List</span>
               <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-2 rounded-lg text-md text-slate-300 hover:text-slate-200 bg-base-200 hover:bg-base-300 scale-95 sm:scale-100 transition-colors duration-200"
               >
                  Add Teacher +
               </button>
            </li>

            {teachers.length === 0 ? (
               <li className="list-row justify-center p-4 text-center text-gray-500">
                  No teachers found
               </li>
            ) : (
               teachers.map((teacher, index) => (
                  <li className="list-row mt-2 mb-6 mx-10 shadow-md" key={teacher._id || index}>
                     <div>
                        <img
                           className="size-10 rounded-box"
                           src="https://i.pinimg.com/736x/f5/47/d8/f547d800625af9056d62efe8969aeea0.jpg"
                           alt="Avatar"
                        />
                     </div>
                     <div>
                        <div>{teacher.name} {teacher.surname}</div>
                     </div>
                     <button className="scale-100 sm:scale-125 p-2 rounded-full text-slate-500 hover:text-slate-400 bg-base-100 hover:bg-base-200 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                     </button>
                     <button className="scale-100 sm:scale-125 p-2 rounded-full text-slate-500 hover:text-slate-400 bg-base-100 hover:bg-base-200 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                           <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                     </button>
                  </li>
               ))
            )}
         </ul>

         {isModalOpen && (
            <div className="modal modal-open" role="dialog">
               <div className="modal-box flex flex-col justify-center items-center">
                  <h3 className="text-lg font-bold">Add Teacher</h3>
                  <p className="py-4">Fill the data</p>
                  <div className="w-full flex flex-row justify-center items-center gap-5">
                     <div className="w-full flex flex-col justify-center items-center gap-[42px]">
                        <input
                           type="text"
                           name="name"
                           value={formData.name}
                           onChange={handleInputChange}
                           className="input border border-base-200 shadow-md shadow-base-300 p-3 text-lg hover:bg-base-200 text-slate-300 hover:text-slate-300"
                           placeholder="Name"
                        />
                        <input
                           type="text"
                           name="surname"
                           value={formData.surname}
                           onChange={handleInputChange}
                           className="input border border-base-200 shadow-md shadow-base-300 p-3 text-lg hover:bg-base-200 text-slate-300 hover:text-slate-300"
                           placeholder="Surname"
                        />
                        <input
                           type="text"
                           name="fatherName"
                           value={formData.fatherName}
                           onChange={handleInputChange}
                           className="input border border-base-200 shadow-md shadow-base-300 p-3 text-lg hover:bg-base-200 text-slate-300 hover:text-slate-300"
                           placeholder="Father Name"
                        />
                     </div>
                     <div className="w-full flex flex-col justify-center items-center gap-4">
                        <input
                           type="text"
                           name="username"
                           value={formData.username}
                           onChange={handleInputChange}
                           className="input border border-base-200 shadow-md shadow-base-300 p-3 text-lg hover:bg-base-200 text-slate-300 hover:text-slate-300"
                           placeholder="Username"
                        />
                        <input
                           type="password"
                           name="password"
                           value={formData.password}
                           onChange={handleInputChange}
                           className="input border border-base-200 shadow-md shadow-base-300 p-3 text-lg hover:bg-base-200 text-slate-300 hover:text-slate-300"
                           placeholder="Password"
                        />
                        <input
                           type="email"
                           name="email"
                           value={formData.email}
                           onChange={handleInputChange}
                           className="input border border-base-200 shadow-md shadow-base-300 p-3 text-lg hover:bg-base-200 text-slate-300 hover:text-slate-300"
                           placeholder="Email"
                        />
                        <input
                           type="tel"
                           name="phoneNumber"
                           value={formData.phoneNumber}
                           onChange={handleInputChange}
                           className="input border border-base-200 shadow-md shadow-base-300 p-3 text-lg hover:bg-base-200 text-slate-300 hover:text-slate-300"
                           placeholder="Phone"
                        />
                     </div>
                  </div>
                  {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                  <div className="modal-action flex gap-14">
                     <button
                        onClick={handleAddTeacher}
                        disabled={submitting}
                        className="btn scale-100 sm:scale-125 py-2 px-4 rounded-md text-slate-300 hover:text-slate-300 bg-base-100 hover:bg-base-200 transition-colors duration-200"
                     >
                        {submitting ? 'Adding...' : 'Add'}
                     </button>
                     <button onClick={() => setIsModalOpen(false)} className="btn scale-100 sm:scale-125 py-2 px-4 rounded-md text-slate-300 hover:text-slate-300 bg-base-100 hover:bg-base-200 transition-colors duration-200">
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default Teachers
