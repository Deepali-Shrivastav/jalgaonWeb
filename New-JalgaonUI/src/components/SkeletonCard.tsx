import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-hairline-soft shadow-sm animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-slate-200 w-full"></div>
      
      {/* Content placeholder */}
      <div className="p-5 space-y-4">
        {/* Title and Badge */}
        <div className="flex justify-between items-start">
          <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
          <div className="h-5 bg-slate-200 rounded-full w-16"></div>
        </div>
        
        {/* Details lines */}
        <div className="space-y-2 pt-2 border-t border-hairline-soft">
          <div className="h-4 bg-slate-200 rounded-md w-full"></div>
          <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
        </div>
        
        {/* Footer/Action */}
        <div className="pt-2">
          <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  );
}
