import { Link, useLocation } from "wouter";
import { ChevronLeft, Search, Layers, FileText, Video, ChevronDown, ChevronUp, Clock, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data (Reusing structure from curriculum)
const CHAPTERS_DATA = [
  {
    id: 1,
    number: "01",
    name: "Units & Measurements",
    desc: "Fundamentals of physical quantities, units, dimensions, and error analysis.",
    topics: 5,
    pdfs: 2,
    videos: 3,
    topicList: [
      { id: 101, number: "1.1", name: "Physical Quantities", duration: "15 mins", pdfs: 1, videos: 1 },
      { id: 102, number: "1.2", name: "Units and Dimensions", duration: "25 mins", pdfs: 1, videos: 1 },
      { id: 103, number: "1.3", name: "Error Analysis", duration: "20 mins", pdfs: 0, videos: 1 },
    ]
  },
  {
    id: 2,
    number: "02",
    name: "Kinematics in 1D & 2D",
    desc: "Motion in a straight line, vectors, projectile motion, and relative velocity.",
    topics: 8,
    pdfs: 3,
    videos: 5,
    topicList: [
      { id: 201, number: "2.1", name: "Motion in Straight Line", duration: "30 mins", pdfs: 1, videos: 2 },
      { id: 202, number: "2.2", name: "Vectors", duration: "25 mins", pdfs: 1, videos: 1 },
      { id: 203, number: "2.3", name: "Projectile Motion", duration: "40 mins", pdfs: 1, videos: 2 },
    ]
  },
  {
    id: 3,
    number: "03",
    name: "Laws of Motion",
    desc: "Newton's laws, friction, circular motion, and dynamics of particles.",
    topics: 6,
    pdfs: 2,
    videos: 4,
    topicList: [
      { id: 301, number: "3.1", name: "Newton's First Law", duration: "20 mins", pdfs: 1, videos: 1 },
      { id: 302, number: "3.2", name: "Newton's Second Law", duration: "35 mins", pdfs: 1, videos: 2 },
      { id: 303, number: "3.3", name: "Friction", duration: "25 mins", pdfs: 0, videos: 1 },
    ]
  },
  {
    id: 4,
    number: "04",
    name: "Work, Energy & Power",
    desc: "Concepts of work, kinetic & potential energy, conservation laws, and collisions.",
    topics: 7,
    pdfs: 3,
    videos: 4,
    topicList: []
  },
  {
    id: 5,
    number: "05",
    name: "Rotational Motion",
    desc: "Center of mass, torque, angular momentum, and moment of inertia.",
    topics: 9,
    pdfs: 4,
    videos: 6,
    topicList: []
  }
];

export default function LearningPath() {
  const [, setLocation] = useLocation();
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleChapter = (id: number) => {
    if (expandedChapter === id) {
      setExpandedChapter(null);
    } else {
      setExpandedChapter(id);
    }
  };

  const filteredChapters = CHAPTERS_DATA.filter(chapter => 
    chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chapter.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-primary p-6 pt-8 pb-8 rounded-b-[30px] shadow-lg z-10 sticky top-0">
        <div className="flex items-center gap-4 mb-6 text-white">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 -ml-2"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Course Chapters</h1>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-2 flex items-center gap-2 h-12">
          <Search className="w-5 h-5 text-gray-400 ml-3" />
          <Input 
            placeholder="Search chapters..." 
            className="border-0 shadow-none focus-visible:ring-0 text-base h-full bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {filteredChapters.length > 0 ? (
            filteredChapters.map((chapter) => (
              <div 
                key={chapter.id} 
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-300"
              >
                {/* Chapter Number Watermark */}
                <span className="absolute top-2 right-4 text-6xl font-bold text-gray-50 opacity-50 pointer-events-none">
                  {chapter.number}
                </span>
                
                <div 
                  className="relative z-10 cursor-pointer"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-gray-900 pr-8">
                      <span className="text-primary mr-2">Ch {chapter.number}</span>
                      {chapter.name}
                    </h3>
                    <div className="text-gray-400">
                      {expandedChapter === chapter.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed max-w-[85%]">
                    {chapter.desc}
                  </p>
                  
                  {/* Removed choice chips */}
                </div>

                {/* Expanded Topics List */}
                <AnimatePresence>
                  {expandedChapter === chapter.id && chapter.topicList && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-4 pt-4 border-t border-gray-100"
                    >
                      <div className="space-y-3">
                        {chapter.topicList.length > 0 ? (
                          chapter.topicList.map((topic) => (
                            <div 
                              key={topic.id} 
                              className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col gap-2 cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => setLocation("/topic-details")}
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-gray-800">
                                  <span className="text-primary/70 mr-2 text-xs">{topic.number}</span>
                                  {topic.name}
                                </h4>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-center text-gray-400 py-2">Topics content coming soon</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              <p>No chapters found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}