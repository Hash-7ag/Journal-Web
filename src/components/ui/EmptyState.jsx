import React from 'react';

function EmptyState({ icon, text }) {
   return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
         {icon}<span className="text-sm">{text}</span>
      </div>
   );
}

export default EmptyState;