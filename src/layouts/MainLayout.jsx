import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import { Suspense } from 'react'

function MainLayout() {
   return (
      <div className='container mx-auto flex flex-col justify-center items-center'>
         <Header />
         <main>
            <Suspense fallback={<h1>Loading...</h1>}>
               <Outlet />
            </Suspense>
         </main>
      </div>
   )
}

export default MainLayout
