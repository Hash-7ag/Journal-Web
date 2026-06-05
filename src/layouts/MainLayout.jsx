import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { Suspense } from 'react'

function MainLayout() {
   const { pathname } = useLocation()
   const isLanding = pathname === '/'

   return (
      <div className={`${isLanding ? 'w-full' : 'container'} mx-auto flex flex-col justify-center items-center`}>
         <Header />
         <main className='w-full'>
            <Suspense fallback={<div className='w-full flex justify-center items-center'><span className="loading loading-spinner loading-xl"></span></div>}>
               <Outlet />
            </Suspense>
         </main>
      </div>
   )
}

export default MainLayout