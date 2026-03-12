import { Link, useLocation } from "wouter";
import { ChevronLeft, Book, FileText, Video, Brain, MessageSquare, Database, PenTool, Clock, Layers, FileCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import physicsBanner from "@assets/generated_images/physics_curriculum_banner.png";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const CURRICULUM_DATA = {
  subject: "Physics",
  description: "Master the fundamental laws of the universe, from kinematics to quantum mechanics, designed specifically for NEET & JEE aspirants.",
  chapterCount: 15,
  topicCount: 120,
  bannerImage: physicsBanner,
  features: [
    { icon: Brain, title: "AI-Based Tutorial", desc: "Personalized learning paths adapted to your pace." },
    { icon: MessageSquare, title: "Instant AI Assistance", desc: "Get real-time answers to your doubts 24/7." },
    { icon: Database, title: "Question Bank", desc: "Access to 5000+ practice questions with solutions." },
    { icon: PenTool, title: "Practice Sessions", desc: "Topic-wise practice drills to strengthen concepts." },
    { icon: Clock, title: "Daily Practice Test (DPT)", desc: "Regular assessments to track your progress." },
    { icon: FileText, title: "Detailed Notes", desc: "Comprehensive study material for revision." },
    { icon: FileCheck, title: "Assignments", desc: "Challenging problems to test deep understanding." },
  ],
  chapters: [
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
  ]
};

export default function Curriculum() {
  const [, setLocation] = useLocation();
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  const toggleChapter = (id: number) => {
    if (expandedChapter === id) {
      setExpandedChapter(null);
    } else {
      setExpandedChapter(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Top Banner */}
      <div className="relative h-[300px] w-full">
        <div className="absolute inset-0">
          <img 
            src={CURRICULUM_DATA.bannerImage} 
            alt={CURRICULUM_DATA.subject} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
        </div>

        <div className="absolute top-0 left-0 right-0 p-6 z-10">
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{CURRICULUM_DATA.subject}</h1>
          <p className="text-white/80 text-sm mb-4 line-clamp-2 max-w-md">{CURRICULUM_DATA.description}</p>
          <div className="flex gap-4 text-sm font-medium">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{CURRICULUM_DATA.chapterCount} Chapters</span>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{CURRICULUM_DATA.topicCount} Topics</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-10">
        
        {/* Intro Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Complete Learning Experience</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Everything you need to master Physics (NEET/JEE) in one comprehensive package
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {CURRICULUM_DATA.features.map((feature, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{feature.title}</h3>
                <p className="text-[10px] text-gray-500 leading-tight">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Complete Course Curriculum */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Complete Course Curriculum</h2>
          <div className="space-y-4">
            {CURRICULUM_DATA.chapters.map((chapter) => (
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
                    <h3 className="text-lg font-bold text-gray-900">
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
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-0 text-xs font-medium gap-1 px-3 py-1">
                      <Layers className="w-3 h-3" /> {chapter.topics} Topics
                    </Badge>
                    {chapter.pdfs > 0 && (
                      <Badge variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100 border-0 text-xs font-medium gap-1 px-3 py-1">
                        <FileText className="w-3 h-3" /> {chapter.pdfs} PDFs
                      </Badge>
                    )}
                    {chapter.videos > 0 && (
                      <Badge variant="secondary" className="bg-purple-50 text-purple-600 hover:bg-purple-100 border-0 text-xs font-medium gap-1 px-3 py-1">
                        <Video className="w-3 h-3" /> {chapter.videos} Videos
                      </Badge>
                    )}
                  </div>
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
                            <div key={topic.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-gray-800">
                                  <span className="text-primary/70 mr-2 text-xs">{topic.number}</span>
                                  {topic.name}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                                  <Clock className="w-3 h-3" /> {topic.duration}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                {topic.pdfs > 0 && (
                                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-6 bg-white border-red-100 text-red-500 font-normal gap-1">
                                    <FileText className="w-3 h-3" /> PDF {topic.pdfs > 1 && `(${topic.pdfs})`}
                                  </Badge>
                                )}
                                {topic.videos > 0 && (
                                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-6 bg-white border-purple-100 text-purple-500 font-normal gap-1">
                                    <Video className="w-3 h-3" /> Video {topic.videos > 1 && `(${topic.videos})`}
                                  </Badge>
                                )}
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
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
