import { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router";
import {
  IconHome,
  IconGavel,
  IconShield,
  IconUser,
  IconLogout,
  IconPlus,
  IconMenu,
  IconX,
} from "../common/icons";
import { DetailPanel, DetailPanelProvider } from "../common/detail-panel";
import { useAuthStore } from "../../store/auth-store";

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navItems = [
    { to: "/", icon: IconHome, label: "Dashboard", match: (p: string) => p === "/" },
    { to: "/disputes", icon: IconGavel, label: "Disputes", match: (p: string) => p.startsWith("/disputes") },
    { to: "/account", icon: IconUser, label: "Account", match: (p: string) => p.startsWith("/account") },
    { to: "/kyc", icon: IconShield, label: "Identity & Bank", match: (p: string) => p.startsWith("/kyc") },
  ];

  // Close sidebar on route change for mobile users
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 z-50 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        <div className="px-5 py-5 border-b border-gray-100/50 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
              <IconShield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">
              Escrow
            </span>
          </Link>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-6 pb-3">
          <Link
            to="/escrow/new"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <IconPlus className="w-4.5 h-4.5" />
            New Escrow
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, match }) => {
            const active = match(location.pathname);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary-50 text-primary-700 font-semibold"
                    : "text-gray-500 hover:bg-gray-50/80 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-primary-600" : "text-gray-400"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100/50 p-4 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/50">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 shrink-0 uppercase shadow-sm">
              {user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name ?? "User"}
              </p>
              <p className="text-xs font-medium text-gray-500 truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <IconLogout className="w-4.5 h-4.5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <DetailPanelProvider>
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 antialiased flex flex-col lg:flex-row">
        
        {/* Mobile Header Top Navigation */}
        <header className="lg:hidden fixed top-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 z-30 flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
              <IconShield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight">Escrow</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <IconMenu className="w-6 h-6" />
          </button>
        </header>

        {/* Global Sidebar component */}
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        {/* Main Content Viewport */}
        <main className="flex-1 min-h-screen pt-16 lg:pt-0 lg:ml-64 transition-all duration-300">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 lg:py-10">
            <Outlet />
          </div>
        </main>

        {/* Overlay Context Detail Panel Slider */}
        <DetailPanel />
      </div>
    </DetailPanelProvider>
  );
}
