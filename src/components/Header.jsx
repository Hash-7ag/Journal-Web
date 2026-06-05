import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiUsers, FiBook, FiGrid, FiUser, FiHome, FiAward, FiLogOut } from 'react-icons/fi'
import { getUserStoreData, clearUserStoreData } from '../store/userStore.js';
import { capitalize } from '../scripts/capitalize.js'
import api from '../scripts/api.js'

function Header() {
   const location = useLocation()
   const navigate = useNavigate()
   const hiddenPaths = ['/', '/login', '/changePassword', '/choose-role']
   const isHidden = hiddenPaths.includes(location.pathname)

   const [logoutError, setLogoutError] = useState('');
   const [logoHovered, setLogoHovered] = useState(false);
   const [profileInitials, setProfileInitials] = useState('');

   const [theme, setTheme] = useState(
      () => localStorage.getItem('theme') || 'light'
   )
   const [logoutModal, setLogoutModal] = useState(false)
   const [loggingOut, setLoggingOut] = useState(false)
   useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);

      if (theme === 'dark') {
         document.documentElement.classList.add('dark');
      } else {
         document.documentElement.classList.remove('dark');
      }
   }, [theme]);

   const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

   const role = getUserStoreData()?.role;

   useEffect(() => {
      if (!role) return;
      api.get(`/${role}/getMyProfile`)
         .then(res => {
            const name = res.data?.name ?? '';
            const surname = res.data?.surname ?? '';
            setProfileInitials(`${name.charAt(0)}${surname.charAt(0)}`.toUpperCase());
         })
         .catch(() => { });
   }, [role]);

   const handleLogout = async () => {
      try {
         setLoggingOut(true);
         setLogoutError('');
         await api.post(`/${role}/logoutAs${capitalize(role)}`);
         localStorage.removeItem('group_creation_draft');
         clearUserStoreData();
         setLogoutModal(false);
         navigate('/');
      } catch (err) {
         setLogoutError(err.response?.data?.message || 'Xəta baş verdi. Yenidən cəhd edin.');
      } finally {
         setLoggingOut(false);
      }
   };

   const adminLinks = [
      { to: '/students', label: 'Şagirdlər', icon: <FiUsers size={15} /> },
      { to: '/teachers', label: 'Müəllimlər', icon: <FiUser size={15} /> },
      { to: '/subjects', label: 'Fənlər', icon: <FiBook size={15} /> },
      { to: '/groups', label: 'Qruplar', icon: <FiGrid size={15} /> },
      { to: '/home', label: 'Profil', icon: <FiHome size={15} /> },
   ]

   const studentLinks = [
      { to: '/student/home', label: 'Profil', icon: <FiHome size={15} /> },
      { to: '/student/grades', label: 'Qiymətlər', icon: <FiAward size={15} /> },
   ]

   const teacherLinks = [
      { to: '/teacher/home', label: 'Profil', icon: <FiHome size={15} /> },
      { to: '/teacher/groups', label: 'Qruplar', icon: <FiGrid size={15} /> },
   ]

   const navLinks =
      role === 'student' ? studentLinks :
         role === 'teacher' ? teacherLinks :
            adminLinks

   const homeLink =
      role === 'student' ? '/student/home' :
         role === 'teacher' ? '/teacher/home' :
            '/home'

   const isActive = (to) => {
      if (to === location.pathname) return true
      if (to !== '/' && location.pathname.startsWith(to) && to !== '/home' && to !== '/student/home' && to !== '/teacher/home') return true
      return false
   }

   return (
      <>
         <header className="w-full sticky top-0 z-50 bg-base-100/80 backdrop-blur border-b border-base-200 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

               {/* Logo */}
               <Link
                  to="/"
                  className="flex items-center"
                  onMouseEnter={() => setLogoHovered(true)}
                  onMouseLeave={() => setLogoHovered(false)}
               >
                  <div className="relative flex items-center">
                     {/* Иконка — сдвигается вправо при hover */}
                     <div
                        className="relative w-8 h-8 shrink-0 transition-transform duration-300 ease-in-out hidden [@media(hover:hover)]:block"
                        style={{ transform: logoHovered ? 'translateX(4px)' : 'translateX(0px)' }}
                     >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] rounded-lg shadow-md rotate-45" />
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">EC</div>
                     </div>
                     {/* Иконка без анимации для тач-устройств */}
                     <div className="relative w-8 h-8 shrink-0 [@media(hover:hover)]:hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] rounded-lg shadow-md rotate-45" />
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">EC</div>
                     </div>

                     {/* Текст — вылезает из-за иконки, абсолютно позиционирован */}
                     <div
                        className="absolute left-8 hidden [@media(hover:hover)]:block overflow-hidden transition-all duration-300 ease-in-out"
                        style={{
                           maxWidth: logoHovered ? '160px' : '0px',
                           opacity: logoHovered ? 1 : 0,
                        }}
                     >
                        <span className="font-semibold text-sm opacity-80 whitespace-nowrap pl-2">
                           Elektron Cədvəl
                        </span>
                     </div>
                  </div>
               </Link>

               {/* Nav */}
               {!isHidden && (
                  <nav className="flex items-center gap-1">
                     {navLinks.map(({ to, label, icon }) => (
                        <Link
                           key={to}
                           to={to}
                           className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                              ${isActive(to)
                                 ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                                 : 'opacity-60 hover:opacity-100 hover:bg-base-200'
                              }`}
                        >
                           {icon}
                           <span className="hidden md:block">{label}</span>
                        </Link>
                     ))}
                  </nav>
               )}

               {/* Right side */}
               <div className="flex items-center gap-2">

                  {/* Theme toggle */}
                  <label className="w-8 h-8 rounded-full border opacity-50 hover:opacity-100 hover:border-base-400 hover:text-base-400 transition-all duration-200 swap swap-rotate cursor-pointer">
                     <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                     <svg className="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                     </svg>
                     <svg className="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                     </svg>
                  </label>

                  {!isHidden && (
                     <>
                        {/* Avatar */}
                        <Link to={homeLink}>
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                              {profileInitials || role?.charAt(0).toUpperCase()}
                           </div>
                        </Link>

                        {/* Logout button */}
                        <button
                           onClick={() => setLogoutModal(true)}
                           className="w-8 h-8 rounded-full border border-base-400 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-red-50 hover:border-red-200 hover:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200"
                        >
                           <FiLogOut size={14} />
                        </button>
                     </>
                  )}
               </div>
            </div>
         </header>

         {/* Logout confirm modal */}
         {logoutModal && (
            <div className="modal modal-open z-50" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8 max-w-sm">

                  {/* Icon */}
                  <div className="flex flex-col items-center gap-2 text-center">
                     <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center justify-center text-red-400 mb-1">
                        <FiLogOut size={22} />
                     </div>
                     <h3 className="text-lg font-bold">Çıxmaq istəyirsiniz?</h3>
                     <p className="text-xs opacity-40 leading-relaxed">
                        Hesabınızdan çıxacaqsınız. Yenidən daxil olmaq üçün login lazım olacaq.
                     </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                     <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex-1 py-2.5 rounded-xl bg-red-400 hover:bg-red-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60"
                     >
                        {loggingOut
                           ? <span className="loading loading-spinner loading-xs" />
                           : <><FiLogOut size={14} /> Çıx</>
                        }
                     </button>
                     <button
                        onClick={() => { setLogoutModal(false); setLogoutError(''); }}
                        className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
                     >
                        Ləğv et
                     </button>
                  </div>

                  {/* Server error + force logout */}
                  {logoutError && (
                     <div className="flex flex-col gap-2">
                        <div role="alert" className="alert alert-error rounded-xl text-xs py-2">
                           <span>{logoutError}</span>
                        </div>
                        <button
                           onClick={() => {
                              clearUserStoreData();
                              setLogoutModal(false);
                              setLogoutError('');
                              navigate('/');
                           }}
                           className="w-full py-2 rounded-xl border border-red-200 text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        >
                           Məcburi çıx (serverdən asılı olmayaraq)
                        </button>
                     </div>
                  )}

               </div>
               {/* backdrop */}
               <div className="modal-backdrop" onClick={() => setLogoutModal(false)} />
            </div>
         )}
      </>
   )
}

export default Header