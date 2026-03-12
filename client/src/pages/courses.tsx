import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Search, Filter, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import profileImage from "@assets/generated_images/user_profile_avatar.png";
import excelImage from "@assets/generated_images/business_meeting_with_charts.png";
import travelImage from "@assets/generated_images/traveler_looking_at_view.png";
import designImage from "@assets/generated_images/woman_working_on_laptop.png";
import codeImage from "@assets/generated_images/programming_code_screen.png";

// --- Mock Data ---

const CATEGORIES = [
  "Most Popular",
  "Board Exams",
  "Medical Entrance",
  "Engineering Entrance",
  "Integrated Programs",
  "Pharmacy Courses"
];

const SUB_CATEGORIES: Record<string, string[]> = {
  "Board Exams": [
    "All",
    "10th/SSLC",
    "I PUC/11th Commerce",
    "II PUC/12th Science",
    "II PUC/12th Commerce"
  ],
  "Medical Entrance": ["All", "NEET UG", "NEET PG", "AIIMS"],
  "Engineering Entrance": ["All", "JEE Main", "JEE Advanced", "KCET", "COMEDK"],
  "Integrated Programs": ["All", "PCMB", "PCMC"],
  "Pharmacy Courses": ["All", "B.Pharm", "D.Pharm"],
};

// Mapping secondary selection to tertiary options
const SUPER_SUB_CATEGORIES: Record<string, { label: string; icon?: string }[]> = {
  "10th/SSLC": [
    { label: "CBSE Board 10th", icon: "📘" },
    { label: "ICSE Board 10th", icon: "📗" },
    { label: "Karnataka SSLC", icon: "🏛️" },
    { label: "Maharashtra SSC", icon: "🏛️" },
    { label: "Tamil Nadu SSLC", icon: "🏛️" },
    { label: "Andhra Pradesh SSC", icon: "🏛️" },
    { label: "Telangana SSC", icon: "🏛️" },
    { label: "Kerala SSLC", icon: "🏛️" },
  ],
  "II PUC/12th Science": [
    { label: "CBSE Class 12", icon: "📘" },
    { label: "Karnataka 2nd PUC", icon: "🏛️" },
    { label: "Maharashtra HSC", icon: "🏛️" },
  ],
  // Fallback generic data for other categories to show functionality
  "default": [
    { label: "Option 1", icon: "📄" },
    { label: "Option 2", icon: "📄" },
    { label: "Option 3", icon: "📄" },
  ]
};

const COURSES_DATA = [
  {
    id: 1,
    title: "Complete 10th Grade Science Bundle",
    instructor: "Sarah Jenkins",
    rating: 4.9,
    price: 49.99,
    image: designImage,
    category: "Board Exams",
    subCategory: "10th/SSLC",
    superSubCategory: "CBSE Board 10th"
  },
  {
    id: 2,
    title: "Mathematics Masterclass for SSLC",
    instructor: "David Chen",
    rating: 4.7,
    price: 35.00,
    image: codeImage,
    category: "Board Exams",
    subCategory: "10th/SSLC",
    superSubCategory: "Karnataka SSLC"
  },
  {
    id: 3,
    title: "NEET Biology Crash Course",
    instructor: "Dr. Anjali Gupta",
    rating: 4.8,
    price: 120.00,
    image: excelImage,
    category: "Medical Entrance",
    subCategory: "NEET UG",
    superSubCategory: "Option 1"
  },
  {
    id: 4,
    title: "JEE Mains Physics Prep",
    instructor: "Robert Ransdell",
    rating: 4.6,
    price: 90.00,
    image: travelImage,
    category: "Engineering Entrance",
    subCategory: "JEE Main",
    superSubCategory: "Option 1"
  },
  {
    id: 5,
    title: "ICSE 10th Physics Comprehensive",
    instructor: "Michael Ross",
    rating: 4.5,
    price: 45.00,
    image: excelImage,
    category: "Board Exams",
    subCategory: "10th/SSLC",
    superSubCategory: "ICSE Board 10th"
  },
  {
    id: 6,
    title: "Maharashtra SSC Marathi Grammar",
    instructor: "Priya Patil",
    rating: 4.8,
    price: 25.00,
    image: designImage,
    category: "Board Exams",
    subCategory: "10th/SSLC",
    superSubCategory: "Maharashtra SSC"
  },
  {
    id: 7,
    title: "Tamil Nadu SSLC Social Science",
    instructor: "K. Raman",
    rating: 4.6,
    price: 30.00,
    image: travelImage,
    category: "Board Exams",
    subCategory: "10th/SSLC",
    superSubCategory: "Tamil Nadu SSLC"
  },
  {
    id: 8,
    title: "Kerala SSLC Malayalam",
    instructor: "Lakshmi Nair",
    rating: 4.9,
    price: 20.00,
    image: codeImage,
    category: "Board Exams",
    subCategory: "10th/SSLC",
    superSubCategory: "Kerala SSLC"
  },
  {
    id: 9,
    title: "CBSE Class 12 Chemistry",
    instructor: "Dr. H. Singh",
    rating: 4.7,
    price: 55.00,
    image: excelImage,
    category: "Board Exams",
    subCategory: "II PUC/12th Science",
    superSubCategory: "CBSE Class 12"
  },
  {
    id: 10,
    title: "Karnataka 2nd PUC Math",
    instructor: "B. Gowda",
    rating: 4.8,
    price: 40.00,
    image: codeImage,
    category: "Board Exams",
    subCategory: "II PUC/12th Science",
    superSubCategory: "Karnataka 2nd PUC"
  }
];

export default function Courses() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedSuperSubCategory, setSelectedSuperSubCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to get tertiary options safely
  const getSuperSubOptions = (subCat: string) => {
    return SUPER_SUB_CATEGORIES[subCat] || (subCat === "All" ? [] : SUPER_SUB_CATEGORIES["default"]);
  };

  // Filter Logic
  const filteredCourses = COURSES_DATA.filter(course => {
    // 1. Search Query
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 2. Category
    if (selectedCategory && selectedCategory !== "Most Popular" && course.category !== selectedCategory) {
      return false;
    }
    // 3. Sub Category
    if (selectedSubCategory && selectedSubCategory !== "All" && course.subCategory !== selectedSubCategory) {
        // If "All" is selected, don't filter by subcategory
        return false;
    }
    // 4. Super Sub Category
    if (selectedSuperSubCategory && course.superSubCategory !== selectedSuperSubCategory) {
       return false;
    }
    return true;
  });

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
          <h1 className="text-xl font-bold">Explore Courses</h1>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-2 flex items-center gap-2 h-12">
          <Search className="w-5 h-5 text-gray-400 ml-3" />
          <Input 
            placeholder="Search for courses..." 
            className="border-0 shadow-none focus-visible:ring-0 text-base h-full bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {/* Level 1: Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">Categories</h3>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-2 pb-2 px-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedSubCategory(null);
                      setSelectedSuperSubCategory(null);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
          </div>

          {/* Level 2: Sub-Categories (Dependent on Level 1) */}
          {selectedCategory && SUB_CATEGORIES[selectedCategory] && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">Select Program</h3>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2 pb-2 px-1">
                  {SUB_CATEGORIES[selectedCategory].map((subCat) => (
                    <button
                      key={subCat}
                      onClick={() => {
                        setSelectedSubCategory(subCat);
                        setSelectedSuperSubCategory(null);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedSubCategory === subCat 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      {subCat}
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
              </ScrollArea>
            </div>
          )}

          {/* Level 3: Super Sub-Categories (Dependent on Level 2) */}
          {selectedSubCategory && selectedSubCategory !== "All" && (
             <div className="animate-in fade-in slide-in-from-top-2 duration-300">
               <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">Specific Board/Exam</h3>
               <div className="flex flex-wrap gap-2 px-1">
                 {getSuperSubOptions(selectedSubCategory).map((item) => (
                   <button
                     key={item.label}
                     onClick={() => setSelectedSuperSubCategory(item.label)}
                     className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                       selectedSuperSubCategory === item.label
                         ? "bg-primary text-white border-primary shadow-sm"
                         : "bg-white text-gray-600 border-gray-100 hover:border-primary/30"
                     }`}
                   >
                     {item.icon && <span>{item.icon}</span>}
                     {item.label}
                   </button>
                 ))}
               </div>
             </div>
          )}

          {/* Results Section */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {filteredCourses.length} Courses Found
              </h3>
              <Button variant="ghost" size="sm" className="text-gray-400">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="space-y-4">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div 
                    key={course.id} 
                    className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 animate-in fade-in zoom-in-95 duration-300 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setLocation("/course-details")}
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                             <h4 className="font-bold text-sm leading-tight text-gray-900 line-clamp-2 mb-1">
                                {course.title}
                             </h4>
                             <div className="bg-yellow-50 text-yellow-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                {course.rating}
                             </div>
                        </div>
                        <p className="text-xs text-gray-500">{course.instructor}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                         <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-500 font-normal hover:bg-gray-100">
                            {course.superSubCategory}
                         </Badge>
                         <span className="text-primary font-bold text-base">${course.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p>No courses found matching your selection.</p>
                    <Button 
                        variant="link" 
                        onClick={() => {
                            setSelectedCategory(null);
                            setSelectedSubCategory(null);
                            setSelectedSuperSubCategory(null);
                            setSearchQuery("");
                        }}
                    >
                        Clear Filters
                    </Button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
