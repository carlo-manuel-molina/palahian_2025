import React from 'react';

export default function Header() {
  return (
    <header className="w-full bg-green-100/80 backdrop-blur-md border-b border-green-200 shadow-sm py-2 px-3 sm:py-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <img src="/gamefowl-farm.jpg" alt="Palahian Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow mr-2 sm:mr-3 border-2 border-green-300" />
        <span
          className="text-2xl sm:text-3xl font-bold text-green-900 drop-shadow"
          style={{ fontFamily: 'Dancing Script, cursive', letterSpacing: '1px', textShadow: '1px 1px 4px #222' }}
        >
          palahian.com
        </span>
      </div>
    </header>
  );
} 