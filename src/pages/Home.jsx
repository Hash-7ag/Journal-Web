import React, { useState, useEffect } from 'react';
import { capitalize } from '../scripts/capitalize.js'
import { api } from '../scripts/api.js';

function Home() {
   const [userData, setUserData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const response = await api.get('/admin/getMyProfile');
            setUserData(response.data);
         } catch (err) {
            console.error('Yüklənmə zamanı xəta:', err);
            setError(err.message || 'yükləmə xətası');
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, []);

   if (loading) {
      return <div className="flex justify-center items-center h-screen">Yüklənmə...</div>;
   }

   if (error) {
      return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
   }

   if (!userData) {
      return null;
   }

   return (
      <div className="w-full h-full flex flex-row justify-center items-center gap-8 p-4">

         <section className="w-1/5 h-96 rounded-lg flex flex-col gap-2 items-center">
            <div className="avatar indicator">
               <div className="w-44 rounded-3xl">
                  <img
                     alt="Main Avatar"
                     src="https://i.pinimg.com/736x/f5/47/d8/f547d800625af9056d62efe8969aeea0.jpg"
                  />
               </div>
            </div>
            <h2 className="text-xl font-bold">{userData.username || '—'}</h2>
            <h2 className="text-lg text-gray-600">{capitalize(userData.role) || role}</h2>
         </section>

         <section className="w-3/5 h-96 rounded-lg flex flex-col gap-3">
            <h2 className="text-xl font-bold">Name: {userData.name || '—'}</h2>
            <h2 className="text-xl font-bold">Surname: {userData.surname || '—'}</h2>
            <h2 className="text-xl font-bold">Phone: {userData.phone || '—'}</h2>
            <h2 className="text-xl font-bold">Email: {userData.email || '—'}</h2>
         </section>
      </div>
   );
}

export default Home;