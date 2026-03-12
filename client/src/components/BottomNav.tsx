import { useLocation, useSearch } from "wouter";
import { Home, Grid, User, BookOpen, CalendarDays } from "lucide-react";

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const currentTab = params.get("tab");

  const isActive = (path: string, tab?: string) => {
    if (path === "/detailed-progress") {
      return location === path && currentTab === tab;
    }
    return location === path;
  };

  const NavIcon = ({ icon: Icon, active, onClick }: { icon: any, active?: boolean, onClick?: () => void }) => (
    <button 
      className={`p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors ${active ? 'bg-white/20 text-white' : ''}`}
      onClick={onClick}
    >
      <Icon className="w-6 h-6" />
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary rounded-t-[30px] shadow-2xl px-8 pb-8 pt-4 flex justify-between items-center z-50">
      <NavIcon 
        icon={Grid} 
        active={isActive("/dashboard")} 
        onClick={() => setLocation("/dashboard")} 
      />
      
      <NavIcon 
        icon={BookOpen} 
        active={isActive("/my-courses")} 
        onClick={() => setLocation("/my-courses?nav=true")} 
      />
      
      <div 
        className="bg-white/20 p-3 rounded-xl shadow-lg relative cursor-pointer" 
        onClick={() => setLocation("/home")}
      >
        <div className={`absolute inset-0 bg-white/20 blur-sm rounded-xl ${isActive("/home") ? "opacity-100" : "opacity-0"}`} />
        <Home className="w-6 h-6 text-white relative z-10" />
      </div>
      
      <NavIcon 
        icon={CalendarDays} 
        active={isActive("/detailed-progress", "timetable")} 
        onClick={() => setLocation("/detailed-progress?tab=timetable&nav=true")} 
      />
      
      <NavIcon 
        icon={User} 
        active={isActive("/profile")} 
        onClick={() => setLocation("/profile")} 
      />
    </div>
  );
}
