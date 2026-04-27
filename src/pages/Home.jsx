import React from 'react'

function Home() {
   return (
      <div className='w-full h-full flex flex-row justify-center items-center'>
         <section className='w-1/5 h-96 rounded-lg flex flex-col gap-2'>
            <div className="avatar indicator">
               <div className="w-44 rounded-3xl">
                  <img alt="Main Avatar" src="https://i.pinimg.com/736x/f5/47/d8/f547d800625af9056d62efe8969aeea0.jpg" />
               </div>
            </div>
            <h2 className='text-xl font-bold'>User Name</h2>
            <h2 className='text-xl font-bold'>Role</h2>
         </section>
         <section className='w-3/5 h-96 rounded-lg flex flex-col gap-2'>
            <h2 className='text-xl font-bold'>Name: </h2>
            <h2 className='text-xl font-bold'>Surname: </h2>
            <h2 className='text-xl font-bold'>Phone: </h2>
            <h2 className='text-xl font-bold'>Email: </h2>
         </section>
      </div>
   )
}

export default Home
