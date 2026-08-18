import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Sparkles, History, User } from "lucide-react";

export const BottomNavigation: React.FC = () => {
  const navItems = [
    { to: "/dashboard", label: "Home", icon: Home },
    { to: "/research", label: "Research", icon: Sparkles },
    { to: "/history", label: "History", icon: History },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-6 py-2.5 md:hidden shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] py-1 transition-all duration-150 ${
                  isActive
                    ? "text-indigo-600 font-bold"
                    : "text-slate-400 hover:text-slate-700 font-bold"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 scale-105"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-[10px] uppercase mt-1 tracking-tight ${
                      isActive ? "text-indigo-600 font-extrabold" : "text-slate-400 font-bold"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
