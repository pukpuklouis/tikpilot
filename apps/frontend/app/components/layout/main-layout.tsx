import { Link, NavLink } from "@remix-run/react";
import { ReactNode } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { 
  Home, 
  Smartphone, 
  Play, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Bell,
  ServerCog
} from "lucide-react";
import { useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">TikPilot</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings">
                <Settings size={16} className="mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black/50 md:hidden" 
            onClick={closeSidebar}
          />
        )}
        
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-20 mt-16 w-64 transform border-r bg-background transition-transform duration-200 md:static md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="flex flex-col gap-1 p-4">
            <NavItem to="/" icon={<Home size={20} />} label="Dashboard" onClick={closeSidebar} />
            <NavItem to="/emulators" icon={<Smartphone size={20} />} label="Emulator Setup" onClick={closeSidebar} />
            <NavItem to="/actions" icon={<Play size={20} />} label="Action Control" onClick={closeSidebar} />
            <NavItem to="/api-test" icon={<ServerCog size={20} />} label="API Test" onClick={closeSidebar} />
            <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" onClick={closeSidebar} className="md:hidden" />
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

function NavItem({ to, icon, label, onClick, className }: NavItemProps) {
  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {icon}
      {label}
    </NavLink>
  );
}
