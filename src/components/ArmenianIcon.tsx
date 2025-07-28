export const ArmenianIcon = ({ className = "h-12 w-12" }: { className?: string }) => {
  return (
    <div className={`${className} rounded-xl bg-gradient-armenian flex items-center justify-center shadow-lg ring-2 ring-primary/30 transition-all duration-300 hover:ring-primary/50`}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className="h-7 w-7 text-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Armenian Cross (Khachkar style) */}
        <path 
          d="M12 2L12 22M4 8L20 8M6 6L18 6M6 10L18 10M8 4L16 4M8 12L16 12M10 14L14 14" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        {/* Decorative elements */}
        <circle cx="12" cy="8" r="2" fill="currentColor" opacity="0.3"/>
        <path 
          d="M8 16C8 18 10 20 12 20C14 20 16 18 16 16" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
