import {
  LayoutDashboard,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  BarChart3,
  X,
  WalletCards,
  FileText,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import Logo from "../ui/Logo";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "People",
    path: "/people",
    icon: Users,
  },
  {
    name: "Records",
    path: "/records",
    icon: FileText,
  },
  {
    name: "Money Given",
    path: "/given",
    icon: ArrowUpRight,
  },
  {
    name: "Money Borrowed",
    path: "/borrowed",
    icon: ArrowDownLeft,
  },
  {
    name: "Payments",
    path: "/payments",
    icon: CreditCard,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-slate-950/30
            backdrop-blur-sm
            lg:hidden
          "
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-72
          flex-col
          border-r border-zinc-200
          bg-white
          shadow-[4px_0_24px_rgba(15,23,42,0.03)]
          transition-transform duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}

        <div className="flex h-20 items-center justify-between border-b border-zinc-100 px-6">

          <Logo />

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              lg:hidden
            "
          >
            <X size={19} />
          </button>

        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 font-mono text-[9px] font-medium uppercase tracking-[0.3em] text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    transition-all
                    duration-200

                    ${
                      isActive
                        ? "bg-violet-50 text-violet-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          transition-all

                          ${
                            isActive
                              ? "bg-violet-100 text-violet-600"
                              : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
                          }
                        `}
                      >
                        <Icon size={17} />
                      </span>

                      <span className="truncate">
                        {item.name}
                      </span>

                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-600" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}

          </div>

        </nav>

        {/* Bottom brand card */}

        <div className="p-4">

          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              border border-violet-100
              bg-gradient-to-br
              from-violet-50
              via-white
              to-indigo-50
              p-4
            "
          >

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-100/70" />

            <div className="relative">

              <div className="mb-4 flex items-center justify-between">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-violet-100
                    text-violet-600
                  "
                >
                  <WalletCards size={17} />
                </div>

                <span className="font-mono text-[8px] font-medium uppercase tracking-[0.2em] text-violet-300">
                  LENDLEDGER
                </span>

              </div>

              <p className="text-xs font-medium text-slate-600">
                Keep every rupee accounted for.
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-400">
                Your personal financial ledger.
              </p>

            </div>

          </div>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;