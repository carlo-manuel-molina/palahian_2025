import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
// import { FaBars } from 'react-icons/fa'; // Uncomment if react-icons is installed

export default function Navbar({ onSectionSelect }: { onSectionSelect?: (section: string) => void }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (open || menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, menuOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to get the button position for portal placement
  function getMenuButtonRect(ref: React.RefObject<HTMLDivElement | null>) {
    if (!ref.current) return { top: 0, left: 0, width: 0 };
    const rect = ref.current.getBoundingClientRect();
    return { top: rect.bottom + window.scrollY, left: rect.right + window.scrollX - 224, width: 224 };
  }

  return (
    <nav className="w-full bg-green-50/80 backdrop-blur-md border-b border-green-200 px-2 sm:px-6 py-1 sm:py-2 flex items-center justify-between relative">
      {/* Welcome message */}
      <div className="flex-1 text-left"></div>
      {/* Burger menu icon */}
      <div className="relative mr-2" ref={menuRef}>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-green-200 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Main menu"
        >
          {/* <FaBars className="w-6 h-6 text-green-900" /> */}
          <svg className="w-6 h-6 text-green-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {mounted && menuOpen && createPortal(
          <div
            className="fixed bg-white border border-green-200 rounded-lg shadow-lg z-[9999] w-56"
            style={getMenuButtonRect(menuRef)}
          >
            <button className="block w-full text-left px-4 py-2 text-green-900 hover:bg-green-100" onClick={() => { setMenuOpen(false); if (onSectionSelect) onSectionSelect('bloodlines'); }}>Bloodlines</button>
            <button className="block w-full text-left px-4 py-2 text-green-900 hover:bg-green-100 border-t border-green-100" onClick={() => { setMenuOpen(false); if (onSectionSelect) onSectionSelect('breeding'); }}>Breeding Materials</button>
            <button className="block w-full text-left px-4 py-2 text-green-900 hover:bg-green-100 border-t border-green-100" onClick={() => { setMenuOpen(false); if (onSectionSelect) onSectionSelect('battle'); }}>Battle Crosses</button>
            <button className="block w-full text-left px-4 py-2 text-green-900 hover:bg-green-100 border-t border-green-100" onClick={() => { setMenuOpen(false); if (onSectionSelect) onSectionSelect('sale'); }}>Available For Sale</button>
          </div>,
          document.body
        )}
      </div>
      {/* User icon and dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-green-200 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={() => setOpen((v) => !v)}
          aria-label="User menu"
        >
          <svg className="w-6 h-6 text-green-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
          </svg>
        </button>
        {mounted && open && createPortal(
          <div
            className="fixed bg-white border border-green-200 rounded-lg shadow-lg z-[9999] w-44"
            style={getMenuButtonRect(dropdownRef)}
          >
            <button
              className="block w-full text-left px-4 py-2 text-green-900 hover:bg-green-100"
              onClick={() => { setOpen(false); router.push('/dashboard?editFarm=1'); }}
            >
              Edit Farm Details
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-green-900 hover:bg-green-100 border-t border-green-100"
              onClick={() => { setOpen(false); router.push('/login?logout=true'); }}
            >
              Logout
            </button>
          </div>,
          document.body
        )}
      </div>
    </nav>
  );
} 