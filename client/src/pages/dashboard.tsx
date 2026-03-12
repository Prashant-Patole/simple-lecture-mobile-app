import { Link, useLocation } from "wouter";
import { Home, Grid, User, FileText, Video, MessageCircle, ChevronDown, Flame, VideoIcon, BookOpen, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Mock Data
const UPCOMING_CLASSES = [
  {
    id: 1,
    subject: "Physics",
    topic: "Electromagnetic Induction",
    time: "10:00 AM",
    instructor: "Dr. Rajesh Kumar Sharma",
    isToday: true
  },
  {
    id: 2,
    subject: "Mathematics",
    topic: "Calculus - Derivatives",
    time: "02:00 PM",
    instructor: "Prof. Sarah Miller",
    isToday: true
  },
  {
    id: 3,
    subject: "Chemistry",
    topic: "Organic Chemistry Basics",
    time: "11:00 AM",
    instructor: "Dr. Alan Grant",
    isToday: false
  }
];

const ASSIGNMENTS = [
  {
    id: 1,
    subject: "Physics",
    title: "Force & Motion Problems",
    status: "Completed",
    dueDate: "Yesterday"
  },
  {
    id: 2,
    subject: "Mathematics",
    title: "Calculus Worksheet 3",
    status: "Pending",
    dueDate: "Today, 5:00 PM"
  },
  {
    id: 3,
    subject: "Chemistry",
    title: "Lab Report: Titration",
    status: "Pending",
    dueDate: "Tomorrow"
  }
];

import { BottomNav } from "@/components/BottomNav";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 relative">
      {/* Header / Welcome Section */}
      <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 bg-gray-100">
            <AvatarFallback className="text-xl text-gray-700">P</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, Pramod!</h1>
            <p className="text-gray-500 text-sm mt-1">
              Keep up the great work! Every day is a step closer to your goals.
            </p>
            <p className="text-gray-500 text-sm mt-1">pramod0605@gmail.com</p>
            
            <div className="flex gap-8 mt-4">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Attendance</p>
                <p className="text-2xl font-bold text-primary">0%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Student ID</p>
                <p className="text-lg font-bold text-gray-900">47A9B651</p>
              </div>
            </div>
            
            <Button 
                variant="outline" 
                className="mt-4 w-full border-primary text-primary hover:bg-primary/5 rounded-xl h-10 text-sm font-bold"
                onClick={() => setLocation("/detailed-progress")}
            >
                View My Detailed Progress
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Daily Practice Test */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-gray-900">Daily Practice Test</h2>
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                Pending Today
              </span>
            </div>

            {/* Days Row */}
            <div className="flex justify-between mb-4">
              {['F', 'S', 'S', 'M', 'T', 'W', 'T'].map((day, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="flex gap-8 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Streak</p>
                <div className="flex items-center gap-1 font-bold text-gray-900">
                  <Flame className="w-4 h-4 text-primary fill-primary" />
                  0 days
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Average Score</p>
                <div className="font-bold text-gray-900">0%</div>
              </div>
            </div>

            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-11">
              Take Today's DPT
            </Button>
          </CardContent>
        </Card>

        {/* Subject Progress */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="inline-block w-1 h-4 bg-gray-900 rounded-full"></span>
                Subject Progress
              </h2>
              <Select defaultValue="all">
                <SelectTrigger className="w-[80px] h-8 rounded-full border-primary text-primary text-xs font-bold">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="math">Math</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No progress data available yet</p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Classes</h2>
          <div className="space-y-4">
            {UPCOMING_CLASSES.map((cls) => (
                <Card key={cls.id} className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{cls.subject}</h3>
                        {cls.isToday && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">Today</span>
                        )}
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-4">{cls.topic}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                        </div>
                        {cls.time}
                        </div>
                        <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {cls.instructor}
                        </div>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-11 flex items-center gap-2">
                        <VideoIcon className="w-4 h-4" />
                        Join Class
                    </Button>
                    </CardContent>
                </Card>
            ))}
          </div>
        </div>

        {/* Assignments Section */}
        <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Assignments</h2>
            <div className="space-y-4">
                {ASSIGNMENTS.map((assignment) => (
                    <Card key={assignment.id} className="border-0 shadow-sm rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900">{assignment.subject}</h3>
                                <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                                    assignment.status === 'Completed' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {assignment.status}
                                </span>
                            </div>
                            
                            <p className="text-gray-500 text-sm mb-2">{assignment.title}</p>
                            <p className="text-xs text-gray-400 mb-4">Due: {assignment.dueDate}</p>

                            {assignment.status === 'Pending' && (
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-10 text-sm">
                                    Submit Assignment
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>

      {/* Floating Bottom Nav - Full Width touching bottom */}
      <BottomNav />
    </div>
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
