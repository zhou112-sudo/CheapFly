import { NavLink, Outlet } from "react-router-dom";

import { cn } from "@/lib/utils";

const navClass = ({ isActive }) =>
  cn(
    "inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-secondary text-foreground shadow-sm ring-1 ring-border/60"
      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
  );

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5 md:h-[4.25rem] md:px-10">
          <NavLink to="/" className="shrink-0 text-base font-semibold tracking-tight text-foreground md:text-lg">
            特价机票发现
          </NavLink>
          <nav className="flex items-center gap-2" aria-label="主导航">
            <NavLink to="/" end className={navClass}>
              机票搜索
            </NavLink>
            <NavLink to="/explore" className={navClass}>
              低价精选
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/80 py-10 text-center text-xs leading-relaxed text-muted-foreground md:py-12">
        机票价格随市场变动，展示信息仅供参考，请以预订时为准。
      </footer>
    </div>
  );
}
