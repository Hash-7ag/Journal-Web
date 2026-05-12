import { Link } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

function NotFound() {
   return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
         <div className="w-full max-w-2xl flex flex-col gap-4">
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden">
               {/* Градиентная полоса – как в Home */}
               <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />

               <div className="p-8 flex flex-col items-center gap-6 text-center">
                  {/* Иконка с градиентным кругом – стилизация под аватар */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-lg">
                     <FiAlertTriangle size={48} />
                  </div>

                  {/* Заголовок 404 */}
                  <div className="space-y-2">
                     <h1 className="text-5xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
                        404
                     </h1>
                     <p className="text-base font-medium opacity-70">Səhifə tapılmadı</p>
                     <p className="text-sm opacity-50 max-w-xs mx-auto">
                        Bəlkə də sınıq linkə klik etmisiniz, ya da səhifə silinib.
                     </p>
                  </div>

                  {/* Кнопка возврата на главную */}
                  <Link
                     to="/"
                     className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:opacity-90 hover:shadow-md"
                  >
                     <FiHome size={18} />
                     Ana Səhifəyə Geri Dön
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );
}

export default NotFound;