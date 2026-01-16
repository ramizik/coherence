import { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, Settings, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/auth';

/**
 * UserMenu - Dropdown menu for authenticated users
 * 
 * Features:
 * - User avatar/initial display
 * - Dropdown menu with options
 * - Sign out functionality
 * - Glassmorphic design
 */
export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  // Get user initials for avatar
  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email[0].toUpperCase();
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200 group"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-[13px] font-semibold">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name || user.email} className="w-full h-full rounded-lg object-cover" />
          ) : (
            getInitials()
          )}
        </div>

        {/* User Info */}
        <div className="text-left hidden sm:block">
          <p className="text-[13px] font-medium text-white truncate max-w-[120px]">
            {user.name || user.email.split('@')[0]}
          </p>
          <p className="text-[11px] text-gray-500">
            {user.email.length > 20 ? user.email.slice(0, 20) + '...' : user.email}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          strokeWidth={2} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-slide-down z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-white/5 bg-white/5">
            <p className="text-[14px] font-semibold text-white truncate">
              {user.name || 'User'}
            </p>
            <p className="text-[12px] text-gray-400 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Navigate to profile
                console.log('Navigate to profile');
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <UserIcon className="w-4 h-4" strokeWidth={2} />
              <span className="text-[14px]">Profile</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Navigate to settings
                console.log('Navigate to settings');
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <Settings className="w-4 h-4" strokeWidth={2} />
              <span className="text-[14px]">Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Navigate to help
                console.log('Navigate to help');
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4" strokeWidth={2} />
              <span className="text-[14px]">Help & Support</span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-white/5 py-2">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
              <span className="text-[14px]">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
