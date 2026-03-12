import { Link, useLocation } from "wouter";
import { Home, Grid, User, FileText, Video, ShoppingCart, Bell, Menu, Search, Star, Clock, ChevronRight, Heart, MessageSquare, Award, CreditCard, HelpCircle, LogOut, Compass, BookOpen, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import profileImage from "@assets/generated_images/user_profile_avatar.png";
import excelImage from "@assets/generated_images/business_meeting_with_charts.png";
import travelImage from "@assets/generated_images/traveler_looking_at_view.png";
import designImage from "@assets/generated_images/woman_working_on_laptop.png";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const FEATURED_COURSE = {
  id: 1,
  title: "Excel from Beginner to Advanced",
  instructor: "Robert Ransdell",
  rating: 4.8,
  price: 100.00,
  duration: "1:40 Hours",
  image: excelImage,
  category: "Business"
};

const NEWEST_COURSES = [
  {
    id: 2,
    title: "How to Travel Around the World",
    instructor: "Jane Ross",
    rating: 5.0,
    price: 25.00,
    duration: "2:30 Hours",
    image: travelImage,
    category: "Lifestyle"
  },
  {
    id: 3,
    title: "Web Design for Beginners",
    instructor: "Linda Rogers",
    rating: 4.25,
    price: 10.00,
    duration: "3:10 Hours",
    image: designImage,
    category: "Design"
  },
  {
    id: 4,
    title: "The Future of AI",
    instructor: "Mark Smith",
    rating: 4.9,
    price: 60.00,
    duration: "5:00 Hours",
    image: excelImage, // Reusing for now
    category: "Tech"
  }
];

import { BottomNav } from "@/components/BottomNav";

export default function HomeData() {
  const [, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowSearch(window.scrollY < 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-primary font-sans overflow-hidden relative">
      {/* Sidebar Menu Layer (Background) */}
      <div className="absolute inset-0 pt-16 pl-6 text-white w-3/4">
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
            <Avatar className="w-16 h-16 border-2 border-white/20">
                <AvatarImage src={profileImage} />
                <AvatarFallback>RR</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-xl font-bold">Robert Ransdell</h2>
                <p className="text-white/70 text-sm">Let's start learning!</p>
            </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-4 scrollbar-hide">
            <NavButton icon={Home} label="Home" active />
            <NavButton icon={Grid} label="Dashboard" />
            <NavButton icon={FileText} label="My Courses" />
            <NavButton icon={Compass} label="Explore Courses" />
            </div>

            <div className="pb-16 pt-4">
            <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10 pl-0"
                onClick={() => setLocation("/login")}
            >
                <LogOut className="w-5 h-5" />
                Log out
            </Button>
            </div>
        </div>
      </div>

      {/* Main Content Layer (Foreground) */}
      <motion.div 
        animate={isSidebarOpen ? { 
            scale: 0.8, 
            x: 260,
            rotate: -5, // Slight rotation for the squeeze effect
            borderRadius: "40px"
        } : { 
            scale: 1, 
            x: 0, 
            rotate: 0,
            borderRadius: "0px"
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative bg-gray-50 min-h-screen shadow-2xl overflow-y-auto h-screen"
        onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
      >
        <div className="pb-24">
            {/* Header Section with Purple Background */}
            <div className="bg-primary pt-10 pb-16 px-6 rounded-b-[40px] relative transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white hover:bg-white/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsSidebarOpen(!isSidebarOpen);
                        }}
                    >
                        <Menu className="w-10 h-10" />
                    </Button>

                    <div>
                    <h1 className="text-white text-xl font-bold flex items-center gap-2">
                        Hi Robert Ransdell <span className="text-xl">👋</span>
                    </h1>
                    <p className="text-white/80 text-sm">Let's start learning!</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button 
                    size="icon" 
                    className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => setLocation("/cart")}
                    >
                    <ShoppingCart className="w-5 h-5" />
                    {/* Notification Dot */}
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-primary" />
                    </Button>
                    <Button size="icon" className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-primary" />
                    </Button>
                </div>
                </div>

                {/* Search Bar - Floating and Hides on Scroll */}
                <AnimatePresence>
                {showSearch && (
                    <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -bottom-7 left-6 right-6 z-10"
                    >
                    <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center gap-2 h-14">
                        <Search className="w-5 h-5 text-gray-400 ml-3" />
                        <Input 
                        placeholder="What are you going to find?" 
                        className="border-0 shadow-none focus-visible:ring-0 text-base h-full bg-transparent"
                        />
                    </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            <div className="mt-12 px-6 space-y-8">
                {/* Featured Courses */}
                <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Featured Courses</h2>
                </div>
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                    <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video">
                        <img src={FEATURED_COURSE.image} alt={FEATURED_COURSE.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-primary font-bold text-sm">
                        ${FEATURED_COURSE.price.toFixed(2)}
                        </div>
                    </div>
                    <div className="space-y-2">
                    <h3 className="font-bold text-lg leading-tight">{FEATURED_COURSE.title}</h3>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                            <AvatarImage src={profileImage} />
                            <AvatarFallback>IN</AvatarFallback>
                        </Avatar>
                        <span>{FEATURED_COURSE.instructor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{FEATURED_COURSE.duration}</span>
                        </div>
                    </div>
                    </div>
                </div>
                </section>

                {/* Newest Courses */}
                <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Newest Courses</h2>
                    <button className="text-gray-400 text-sm hover:text-primary">View All</button>
                </div>
                
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex w-max space-x-4 pb-4">
                    {NEWEST_COURSES.map((course) => (
                        <div key={course.id} className="w-[200px] bg-white rounded-3xl p-3 shadow-sm border border-gray-100 flex flex-col">
                        <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[4/3]">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1 text-xs font-bold">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {course.rating}
                            </div>
                        </div>
                        <h3 className="font-bold text-sm mb-1 whitespace-normal line-clamp-2 h-10 leading-tight">
                            {course.title}
                        </h3>
                        <div className="text-xs text-gray-500 mb-2">{course.instructor}</div>
                        <div className="mt-auto flex justify-between items-center">
                            <span className="text-primary font-bold text-sm">${course.price.toFixed(2)}</span>
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Course
                            </span>
                        </div>
                        </div>
                    ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="hidden" />
                </ScrollArea>
                </section>
                
                {/* Best Rated (Placeholder to match scroll) */}
                <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Best Rated</h2>
                    <button className="text-gray-400 text-sm hover:text-primary">View All</button>
                </div>
                </section>
            </div>
        </div>

        {/* Floating Bottom Nav - Full Width touching bottom */}
        <BottomNav />
      </motion.div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  const [, setLocation] = useLocation();
  
  return (
    <button 
      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}
      onClick={() => {
        if (label === "Explore Courses") {
          setLocation("/courses");
        } else if (label === "Home") {
            setLocation("/home");
        } else if (label === "My Courses") {
            setLocation("/my-courses");
        } else if (label === "Dashboard") {
            setLocation("/dashboard");
        }
      }}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {active && <div className="ml-auto w-1 h-8 bg-white rounded-full absolute right-0" />} 
    </button>
  );
}

function NavIcon({ icon: Icon, active, onClick }: { icon: any, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      className={`p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors ${active ? 'bg-white/20 text-white' : ''}`}
      onClick={onClick}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}
