
import React from 'react';
import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

const MobileContainer = ({ children, className }: MobileContainerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-400 rounded-full blur-3xl"></div>
      </div>

      {/* Mobile Device Frame - Only visible on larger screens */}
      <div className={cn(
        "w-full max-w-sm mx-auto lg:max-w-md xl:max-w-lg relative z-10",
        "lg:bg-gradient-to-b lg:from-gray-900 lg:to-black lg:rounded-[3rem] lg:p-3 lg:shadow-2xl",
        "lg:relative lg:overflow-hidden",
        "transform lg:hover:scale-[1.02] transition-transform duration-300",
        className
      )}>
        {/* Device Camera Notch - Only visible on larger screens */}
        <div className="hidden lg:block absolute top-7 left-1/2 transform -translate-x-1/2 w-36 h-7 bg-black rounded-full z-30 shadow-inner">
          <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-full"></div>
          <div className="absolute top-2 right-6 w-2 h-2 bg-gray-800 rounded-full"></div>
        </div>
        
        {/* Screen Content */}
        <div className={cn(
          "w-full h-screen lg:h-[850px] xl:h-[950px]",
          "bg-white lg:rounded-[2.5rem] overflow-hidden",
          "relative shadow-inner lg:shadow-2xl",
          "border-4 lg:border-gray-800"
        )}>
          <div className="w-full h-full overflow-auto">
            {children}
          </div>
        </div>
        
        {/* Home Indicator - Only visible on larger screens */}
        <div className="hidden lg:block absolute bottom-6 left-1/2 transform -translate-x-1/2 w-36 h-1.5 bg-white rounded-full opacity-80 shadow-lg"></div>
        
        {/* Side Buttons - Only visible on larger screens */}
        <div className="hidden lg:block absolute left-[-4px] top-32 w-1 h-16 bg-gray-700 rounded-l-full"></div>
        <div className="hidden lg:block absolute left-[-4px] top-52 w-1 h-12 bg-gray-700 rounded-l-full"></div>
        <div className="hidden lg:block absolute left-[-4px] top-68 w-1 h-12 bg-gray-700 rounded-l-full"></div>
        <div className="hidden lg:block absolute right-[-4px] top-40 w-1 h-20 bg-gray-700 rounded-r-full"></div>
      </div>
    </div>
  );
};

export default MobileContainer;
