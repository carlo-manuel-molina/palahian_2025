"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu } from '@headlessui/react';
import Link from 'next/link';
// import { FaBars } from 'react-icons/fa'; // Uncomment if react-icons is installed

export default function Navbar({ menuConfig, userType }: { menuConfig: Array<{ label: string; href: string }>; userType: 'breeder' | 'fighter' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    }
    if (menuOpen || profileOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen, profileOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="w-full bg-green-50/80 backdrop-blur-md border-b border-green-200 px-2 sm:px-6 py-1 sm:py-2 flex items-center justify-between relative z-50">
      {/* Welcome message */}
      <div className="flex-1 text-left"></div>
      
      {/* Burger menu icon with Headless UI Menu */}
      <div className="relative mr-2" ref={menuRef}>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-green-200 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={() => {
            setMenuOpen((v) => !v);
            setProfileOpen(false);
          }}
          aria-label="Main menu"
        >
          <svg className="w-6 h-6 text-green-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-green-200 rounded-lg shadow-lg focus:outline-none z-50">
            <div className="py-1">
              {menuConfig.map((item) => (
                <Link key={item.href} href={item.href} className="block px-4 py-2 text-sm text-green-900 hover:bg-green-100 border-t border-green-100 first:border-t-0">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User icon and dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-green-200 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={() => {
            setProfileOpen((v) => !v);
            setMenuOpen(false);
          }}
          aria-label="User menu"
        >
          <svg className="w-6 h-6 text-green-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
          </svg>
        </button>
        {mounted && profileOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white border border-green-200 rounded-lg shadow-lg z-50">
            <button
              className="block w-full text-left px-4 py-2 text-green-900 hover:bg-green-100"
              onClick={() => { setProfileOpen(false); router.push('/dashboard?editFarm=1'); }}
            >
              Edit Farm Details
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-green-900 hover:bg-green-100 border-t border-green-100"
              onClick={() => { setProfileOpen(false); router.push('/login?logout=true'); }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
} 