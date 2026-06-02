import React from 'react';

function InfoCard({ icon, label, value }) {
   return (
      <div className="flex flex-col gap-1 bg-base-200/50 rounded-xl px-4 py-3 border border-base-200">
         <div className="flex items-center gap-1.5 text-xs opacity-40 font-medium">{icon}{label}</div>
         <div className="text-sm font-semibold">{value}</div>
      </div>
   );
}

export default InfoCard;