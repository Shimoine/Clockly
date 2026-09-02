import {
  CalendarDays,
  List,
  FileCode2,
  Settings,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";
import { NavLink } from "react-router-dom";

export default function AppSidebar() {
  const menuItems = [
    {
      name: "Calendar",
      path: "/calendar",
      icon: CalendarDays,
    },
    {
      name: "Rule List",
      path: "/rules",
      icon: List,
    },
    {
      name: "Make Rule",
      path: "/make-rule",
      icon: FileCode2,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-900">
            <img src="/clockly-logo.svg" alt="" className="size-8" />
          </div>

          <div>
            <h1 className="text-lg font-bold">
              Clockly
            </h1>

            <p className="text-xs text-slate-500">
              Visual Calendar Programming
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-slate-100 font-medium"
                        : "hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <a
          href="https://github.com/Shimoine/Clockly"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
        >
          <FaGithub size={18} />
          GitHub
        </a>
      </div>
    </aside>
  );
}
