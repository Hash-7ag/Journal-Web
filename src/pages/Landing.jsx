import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
   FiArrowRight, FiDatabase, FiUsers, FiBook, FiLayers,
   FiSliders, FiClipboard, FiEye, FiExternalLink, FiFileText,
   FiServer, FiCode
} from 'react-icons/fi';
import { PiStudent } from 'react-icons/pi';

// ── Reveal-on-scroll wrapper ────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
   const ref = useRef(null);
   const [visible, setVisible] = useState(false);

   useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const observer = new IntersectionObserver(
         ([entry]) => { if (entry.isIntersecting) setVisible(true); },
         { threshold: 0.15 }
      );
      observer.observe(el);
      return () => observer.disconnect();
   }, []);

   return (
      <div
         ref={ref}
         className={className}
         style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
         }}
      >
         {children}
      </div>
   );
}

function Landing() {
   const navigate = useNavigate();

   const features = [
      { icon: <FiDatabase size={20} />, title: 'Şagird bazası', desc: 'Bütün şagirdlərin vahid məlumat bazasının yaradılması və idarəsi.', color: 'from-[#8B5CF6] to-[#3B82F6]' },
      { icon: <FiUsers size={20} />, title: 'Müəllim bazası', desc: 'Bütün müəllimlərin məlumat bazasının yaradılması və izlənməsi.', color: 'from-[#3B82F6] to-[#60A5FA]' },
      { icon: <FiBook size={20} />, title: 'Fənlərin idarəsi', desc: 'Fənlərin yaradılması və onların müəllimlərə təyin edilməsi.', color: 'from-[#8B5CF6] to-[#A78BFA]' },
      { icon: <FiLayers size={20} />, title: 'Qrupların idarəsi', desc: 'Qrupların yaradılması, şagird və fənlərlə tam idarəetmə.', color: 'from-[#6366F1] to-[#8B5CF6]' },
      { icon: <FiSliders size={20} />, title: 'Çevik tənzimləmə', desc: 'Bütün məlumatları asanlıqla dəyişmək və uyğunlaşdırmaq imkanı.', color: 'from-[#3B82F6] to-[#8B5CF6]' },
      { icon: <FiClipboard size={20} />, title: 'Müəllim paneli', desc: 'Müəllimlər üçün dərs, qiymət və davamiyyət idarəetmə sistemi.', color: 'from-[#A78BFA] to-[#60A5FA]' },
      { icon: <FiEye size={20} />, title: 'Şagird girişi', desc: 'Şagirdlərin öz məlumatlarını və qiymətlərini izləmə imkanı.', color: 'from-[#8B5CF6] to-[#3B82F6]' },
   ];

   const developers = [
      {
         name: 'Vidadi Əliyev', position: 'Müəllim', initials: 'VƏ',
         area: 'Backend', icon: <FiServer size={13} />,
         color: 'from-[#8B5CF6] to-[#6366F1]',
         glow: 'group-hover:shadow-[0_0_40px_-8px_rgba(139,92,246,0.5)]',
         badge: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30',
      },
      {
         name: 'Əli Həsənov', position: 'Tələbə', initials: 'ƏH',
         area: 'Frontend', icon: <FiCode size={13} />,
         color: 'from-[#3B82F6] to-[#60A5FA]',
         glow: 'group-hover:shadow-[0_0_40px_-8px_rgba(59,130,246,0.5)]',
         badge: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
      },
      {
         name: 'Xəzər İbrahimli', position: 'Tələbə', initials: 'Xİ',
         area: 'Frontend', icon: <FiCode size={13} />,
         color: 'from-[#3B82F6] to-[#60A5FA]',
         glow: 'group-hover:shadow-[0_0_40px_-8px_rgba(59,130,246,0.5)]',
         badge: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
      },
   ];

   const socials = [
      { label: 'Facebook', href: 'https://www.facebook.com/bakucultureandcrafts/?locale=az_AZ' },
      { label: 'Instagram', href: 'https://www.instagram.com/explore/locations/1026288168/mdniyyt-v-sntkarliq-uzr-baki-dovlt-pes-thsil-mrkzi/' },
   ];

   return (
      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">

         {/* ── Animated background (tablet & up only) ── */}
         <div className="bg-fx pointer-events-none absolute inset-0 overflow-hidden">

            {/* Grid */}
            <div className="bg-grid absolute inset-0" />

            {/* Gradient blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#8B5CF6]/30 to-[#3B82F6]/20 blur-3xl animate-blob animate-pulse-glow" />
            <div className="absolute top-1/4 -right-32 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-[#3B82F6]/25 to-[#A78BFA]/20 blur-3xl animate-blob animation-delay-2000 animate-pulse-glow" />
            <div className="absolute top-2/3 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#6366F1]/25 to-[#8B5CF6]/20 blur-3xl animate-blob animation-delay-4000 animate-pulse-glow" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-[#A78BFA]/20 to-[#3B82F6]/15 blur-3xl animate-blob animation-delay-6000 animate-pulse-glow" />

            {/* Floating particles */}
            <div className="particle absolute top-[15%] left-[10%]" />
            <div className="particle absolute top-[30%] left-[80%] animation-delay-2000" />
            <div className="particle absolute top-[55%] left-[20%] animation-delay-4000" />
            <div className="particle absolute top-[70%] left-[65%] animation-delay-1000" />
            <div className="particle absolute top-[85%] left-[40%] animation-delay-3000" />
            <div className="particle absolute top-[45%] left-[90%] animation-delay-5000" />
            <div className="particle absolute top-[10%] left-[50%] animation-delay-6000" />
         </div>

         <style>{`
            @keyframes blob {
               0%, 100% { transform: translate(0, 0) scale(1); }
               33% { transform: translate(30px, -40px) scale(1.1); }
               66% { transform: translate(-20px, 20px) scale(0.95); }
            }
            .animate-blob { animation: blob 16s ease-in-out infinite; }
                  
            @keyframes pulse-glow {
               0%, 100% { opacity: 1; }
               50% { opacity: 0.55; }
            }
            .animate-pulse-glow { animation: blob 16s ease-in-out infinite, pulse-glow 8s ease-in-out infinite; }
                  
            .animation-delay-1000 { animation-delay: 1s; }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-3000 { animation-delay: 3s; }
            .animation-delay-4000 { animation-delay: 4s; }
            .animation-delay-5000 { animation-delay: 5s; }
            .animation-delay-6000 { animation-delay: 6s; }
                  
            @keyframes float-in {
               from { opacity: 0; transform: translateY(20px); }
               to { opacity: 1; transform: translateY(0); }
            }
                  
            /* Grid */
            .bg-grid {
               background-image:
                  linear-gradient(to right, rgba(139,92,246,0.06) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(139,92,246,0.06) 1px, transparent 1px);
               background-size: 56px 56px;
               mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%);
               -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%);
               animation: grid-drift 30s linear infinite;
            }
            @keyframes grid-drift {
               from { background-position: 0 0, 0 0; }
               to { background-position: 56px 56px, 56px 56px; }
            }
                  
            /* Particles */
            .particle {
               width: 6px;
               height: 6px;
               border-radius: 9999px;
               background: linear-gradient(to bottom right, #8B5CF6, #3B82F6);
               opacity: 0.4;
               box-shadow: 0 0 8px 1px rgba(139,92,246,0.4);
               animation: particle-float 12s ease-in-out infinite;
            }
            @keyframes particle-float {
               0%, 100% { transform: translateY(0) translateX(0); opacity: 0.25; }
               50% { transform: translateY(-40px) translateX(15px); opacity: 0.6; }
            }
                  
            /* Disable all background FX on phones (< 768px) */
            @media (max-width: 767px) {
               .bg-fx { display: none; }
            }
                  
            /* Respect reduced-motion preference */
            @media (prefers-reduced-motion: reduce) {
               .animate-blob, .animate-pulse-glow, .bg-grid, .particle {
                  animation: none;
               }
            }
         `}</style>

         {/* ── HERO ── */}
         <section className="relative px-6 pt-20 pb-24 flex flex-col items-center text-center">
            <div
               className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] shadow-2xl mb-8"
               style={{ animation: 'float-in 0.8s cubic-bezier(0.22,1,0.36,1) both' }}
            >
               <span className="text-white font-bold text-2xl tracking-tight">EC</span>
            </div>

            <h1
               className="text-4xl sm:text-6xl font-bold mb-5 bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] bg-clip-text text-transparent leading-tight"
               style={{ animation: 'float-in 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}
            >
               E-Cədvəl
            </h1>

            <p
               className="text-base sm:text-lg opacity-50 max-w-xl leading-relaxed mb-10"
               style={{ animation: 'float-in 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s both' }}
            >
               Təhsil müəssisəsinin elektron idarəetmə platforması — şagirdlər, müəllimlər,
               qruplar, fənlər, qiymətlər və davamiyyət bir sistemdə.
            </p>

            <div
               className="flex flex-col sm:flex-row gap-3"
               style={{ animation: 'float-in 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s both' }}
            >
               <button
                  onClick={() => navigate('/choose-role')}
                  className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300 hover:-translate-y-0.5"
               >
                  Sistemə giriş
                  <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
               </button>
               <a
                  href="#about"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-base-200 bg-base-100/60 backdrop-blur-md text-sm font-semibold hover:bg-base-200/60 transition-all duration-300"
               >
                  Haqqında
               </a>
            </div>
         </section>

         {/* ── FEATURES ── */}
         <section className="relative px-6 py-16 max-w-6xl mx-auto">
            <Reveal>
               <div className="text-center mb-12">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3">İmkanlar</h2>
                  <p className="text-sm opacity-40 max-w-md mx-auto">Platformanın təklif etdiyi əsas funksiyalar</p>
               </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {features.map((f, i) => (
                  <Reveal key={f.title} delay={i * 80}>
                     <div className="group h-full bg-base-100/60 backdrop-blur-md border border-base-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#8B5CF6]/30 transition-all duration-300">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                           {f.icon}
                        </div>
                        <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                        <p className="text-sm opacity-50 leading-relaxed">{f.desc}</p>
                     </div>
                  </Reveal>
               ))}
            </div>
         </section>

         {/* ── ABOUT / OWNERSHIP ── */}
         <section id="about" className="relative px-6 py-16 max-w-4xl mx-auto scroll-mt-24">
            <Reveal>
               <div className="bg-base-100/60 backdrop-blur-md border border-base-200/80 rounded-3xl overflow-hidden shadow-lg">
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6]" />
                  <div className="p-8 sm:p-10 flex flex-col gap-6">
                     <div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-[#8B5CF6] opacity-70">Haqqında</span>
                        <h2 className="text-2xl font-bold mt-2 leading-snug">
                           Mədəniyyət və Sənətkarlıq üzrə Bakı Dövlət Peşə Təhsil Mərkəzi
                        </h2>
                     </div>
                     <p className="text-sm opacity-50 leading-relaxed">
                        E-Cədvəl platforması hazırda Mədəniyyət və Sənətkarlıq üzrə Bakı Dövlət Peşə
                        Təhsil Mərkəzinin sərəncamındadır və mərkəzin gündəlik idarəetmə proseslərini
                        rəqəmsallaşdırmaq üçün hazırlanmışdır.
                     </p>
                  </div>
               </div>
            </Reveal>
         </section>

         {/* ── DEVELOPERS ── */}
         <section className="relative px-6 py-16 max-w-4xl mx-auto">
            <Reveal>
               <div className="text-center mb-12">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3">Komanda</h2>
                  <p className="text-sm opacity-40 max-w-md mx-auto">Platformanı yaradan və inkişaf etdirən şəxslər</p>
               </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
               {developers.map((dev, i) => (
                  <Reveal key={dev.name} delay={i * 100}>
                     <div className={`group relative h-full bg-base-100/60 backdrop-blur-md border border-base-200/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:-translate-y-1.5 transition-all duration-300 ${dev.glow}`}>

                        {/* Area badge */}
                        <div className={`absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${dev.badge}`}>
                           {dev.icon}
                           {dev.area}
                        </div>

                        {/* Avatar */}
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${dev.color} flex items-center justify-center text-white text-xl font-bold shadow-md mb-4 mt-2 group-hover:scale-110 transition-transform duration-300`}>
                           {dev.initials}
                        </div>

                        <div className="font-semibold text-base">{dev.name}</div>
                        <div className="text-xs opacity-40 mt-1 flex items-center gap-1">
                           {dev.position === 'Tələbə' ? <PiStudent size={12} /> : <FiUsers size={12} />}
                           {dev.position}
                        </div>
                     </div>
                  </Reveal>
               ))}
            </div>
         </section>

         {/* ── DOCUMENTS / SƏNƏDLƏR ── */}
         <section className="relative px-6 py-16 max-w-4xl mx-auto">
            <Reveal>
               <a
                  href="https://www.scribd.com/document/650114169/Bak%C4%B1-Do-vl%C9%99t-Pes-%C9%99-T%C9%99hsil-M%C9%99rk%C9%99zl%C9%99ri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 bg-base-100/60 backdrop-blur-md border border-base-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#8B5CF6]/30 transition-all duration-300"
               >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300">
                     <FiFileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="font-semibold text-base">Sənədlər</div>
                     <div className="text-sm opacity-50">Mərkəz haqqında rəsmi sənəd</div>
                  </div>
                  <FiExternalLink size={18} className="opacity-30 group-hover:opacity-70 transition-opacity duration-300 shrink-0" />
               </a>
            </Reveal>
         </section>

         {/* ── FOOTER ── */}
         <footer className="relative px-6 py-12 border-t border-base-200/60 mt-8">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white font-bold text-sm shadow-md">
                     EC
                  </div>
                  <div className="text-sm opacity-50">E-Cədvəl · {new Date().getFullYear()}</div>
               </div>

               <div className="flex items-center gap-3">
                  {socials.map(s => (
                     <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-base-200 bg-base-100/60 backdrop-blur-md text-xs font-semibold opacity-60 hover:opacity-100 hover:bg-base-200/60 transition-all duration-300"
                     >
                        {s.label}
                        <FiExternalLink size={12} />
                     </a>
                  ))}
               </div>
            </div>
         </footer>
      </div>
   );
}

export default Landing;