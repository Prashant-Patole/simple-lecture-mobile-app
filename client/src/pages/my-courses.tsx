import { Link, useLocation, useSearch } from "wouter";
import { ChevronLeft, Search, PlayCircle, FileText, Clock, MoreVertical, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import excelImage from "@assets/generated_images/business_meeting_with_charts.png";
import designImage from "@assets/generated_images/woman_working_on_laptop.png";
import codeImage from "@assets/generated_images/programming_code_screen.png";
import { BottomNav } from "@/components/BottomNav";

// Mock Enrolled Courses Data
const ENROLLED_COURSES = [
  {
    id: 1,
    title: "Complete 10th Grade Science Bundle",
    subtitle: "Master Physics, Chemistry and Biology",
    instructor: "Sarah Jenkins",
    progress: 35,
    totalLessons: 120,
    completedLessons: 42,
    lastAccessed: "2 hours ago",
    duration: "45h 30m",
    image: designImage,
    category: "Board Exams",
    enrolledDate: "Dec 12, 2024"
  },
  {
    id: 4,
    title: "The Future of AI",
    subtitle: "Understanding Artificial Intelligence",
    instructor: "Mark Smith",
    progress: 12,
    totalLessons: 45,
    completedLessons: 5,
    lastAccessed: "1 day ago",
    duration: "12h 15m",
    image: excelImage,
    category: "Tech",
    enrolledDate: "Jan 05, 2025"
  },
  {
    id: 2,
    title: "Mathematics Masterclass for SSLC",
    subtitle: "Algebra, Geometry and Trigonometry",
    instructor: "David Chen",
    progress: 78,
    totalLessons: 80,
    completedLessons: 62,
    lastAccessed: "3 days ago",
    duration: "32h 45m",
    image: codeImage,
    category: "Board Exams",
    enrolledDate: "Nov 20, 2024"
  }
];

export default function MyCourses() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const showNav = params.get("nav") === "true";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-primary p-6 pt-8 pb-8 rounded-b-[30px] shadow-lg z-10">
        <div className="flex items-center gap-4 mb-6 text-white">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 -ml-2"
            onClick={() => setLocation("/home")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">My Courses</h1>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-2 flex items-center gap-2 h-12">
          <Search className="w-5 h-5 text-gray-400 ml-3" />
          <Input 
            placeholder="Search my courses..." 
            className="border-0 shadow-none focus-visible:ring-0 text-base h-full bg-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${showNav ? 'pb-24' : ''}`}>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-2xl font-bold text-primary">{ENROLLED_COURSES.length}</h3>
             <p className="text-xs text-gray-500 font-medium">Courses in Progress</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-2xl font-bold text-green-500">2</h3>
             <p className="text-xs text-gray-500 font-medium">Completed Courses</p>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">In Progress</h2>
          
          {ENROLLED_COURSES.map((course) => (
            <div 
              key={course.id} 
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Image Section */}
              <div className="w-full aspect-video relative">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                   <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm shadow-sm border-0 font-bold">
                     {course.category}
                   </Badge>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium line-clamp-1">
                    {course.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 w-fit px-2 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 w-fit px-2 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Enrolled: {course.enrolledDate}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 font-semibold">
                    <span>{course.progress}% Completed</span>
                    <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                  </div>
                  <Progress value={course.progress} className="h-2 bg-gray-100 [&>div]:bg-primary" />
                </div>

                <Button 
                  className="w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 mt-2"
                  onClick={() => setLocation("/learning-path")}
                >
                  Start Learning
                  <PlayCircle className="w-4 h-4 ml-2 fill-current" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {showNav && <BottomNav />}
    </div>
  );
}
