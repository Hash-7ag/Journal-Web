import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import { Suspense } from 'react'

function MainLayout() {
   return (
      <div className='container mx-auto flex flex-col justify-center items-center'>
         <Header />
         <main className='w-full'>
            <Suspense fallback={<div className='w-full flex justify-center items-center'><span class="loading loading-spinner loading-xl"></span></div>}>
               <Outlet />
            </Suspense>
         </main>
      </div>
   )
}

export default MainLayout
