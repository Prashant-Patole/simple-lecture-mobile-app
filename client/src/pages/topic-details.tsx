import { useLocation } from "wouter";
import { ChevronLeft, PlayCircle, MessageSquare, Mic, ListChecks, FileText, ClipboardList, Brain, Clock, Send, Play, Target, Flame, Calendar as CalendarIcon, Download, Printer, CheckCircle2, AlertCircle, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TABS = [
  { id: "videos", label: "Videos", icon: PlayCircle },
  { id: "ai", label: "AI Assistant", icon: Brain },
  { id: "podcast", label: "Podcast", icon: Mic },
  { id: "mcq", label: "MCQs", icon: ListChecks },
  { id: "dpt", label: "DPT", icon: Clock },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
];

// Mock Videos Data
const VIDEOS_DATA = [
  {
    id: 1,
    title: "Introduction to Physical Quantities",
    duration: "12:30",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60",
    desc: "Understanding the basics of physical quantities and their importance."
  },
  {
    id: 2,
    title: "Fundamental vs Derived Quantities",
    duration: "15:45",
    thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=60",
    desc: "Deep dive into the differences between fundamental and derived quantities."
  },
  {
    id: 3,
    title: "Systems of Units (SI, CGS, FPS)",
    duration: "10:15",
    thumbnail: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=60",
    desc: "Explaining different systems of units used in physics globally."
  }
];

const DPT_COMPLETED_DATES = [
  new Date(2025, 11, 5),
  new Date(2025, 11, 8),
  new Date(2025, 11, 10),
  new Date(2025, 11, 12),
  new Date(2025, 11, 15),
  new Date(2025, 11, 17),
];

const RECENT_SCORES = [
  { date: "17 Dec 25", score: 85 },
  { date: "15 Dec 25", score: 92 },
  { date: "12 Dec 25", score: 78 },
  { date: "10 Dec 25", score: 88 },
];

// Mock Assignments Data
const ASSIGNMENTS_DATA = [
  {
    id: 1,
    title: "Kinematics Problem Set",
    description: "Solve problems on motion, velocity, and acceleration",
    dueDate: "01/11/2025",
    totalMarks: 30,
    status: "pending",
  },
  {
    id: 2,
    title: "Laws of Motion Assignment",
    description: "Application of Newton's laws",
    dueDate: "25/10/2025",
    totalMarks: 20,
    status: "submitted",
    score: 18,
  },
  {
    id: 3,
    title: "Atomic Structure Quiz",
    description: "Test your knowledge of atomic models",
    dueDate: "30/10/2025",
    totalMarks: 30,
    status: "graded",
    score: 27,
  }
];

const ASSIGNMENT_QUESTIONS = [
  {
    id: 1,
    question: "A car accelerates from 10 m/s to 30 m/s in 5 seconds. What is the acceleration?",
  },
  {
    id: 2,
    question: "Which law of motion explains why passengers jerk forward when a bus suddenly stops?",
  }
];

const GRADED_QUIZ_DATA = [
  {
    id: 1,
    question: "The charge on an electron is:",
    options: [
      "-1.6 × 10⁻¹⁹ C",
      "+1.6 × 10⁻¹⁹ C",
      "-9.11 × 10⁻³¹ C",
      "+9.11 × 10⁻³¹ C"
    ],
    correctAnswer: 0,
    userAnswer: 0,
    explanation: "Electron has a negative charge of 1.6 × 10⁻¹⁹ coulombs"
  },
  {
    id: 2,
    question: "According to Bohr's model, energy of electron in nth orbit is:",
    options: [
      "13.6/n² eV",
      "-13.6/n² eV",
      "-13.6n² eV",
      "13.6n² eV"
    ],
    correctAnswer: 1,
    userAnswer: 1,
    explanation: "Energy of electron in nth orbit of hydrogen atom is given by E = -13.6/n² eV"
  }
];

export default function TopicDetails() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("videos");
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [mcqStarted, setMcqStarted] = useState(false);
  const [mcqConfig, setMcqConfig] = useState({
    level: "easy",
    questions: "10",
    time: "15"
  });

  const [dptView, setDptView] = useState<'dashboard' | 'config' | 'test'>('dashboard');
  const [dptConfig, setDptConfig] = useState({
    level: "mixed",
    questions: "10",
    time: "15"
  });

  const notesRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (notesRef.current) {
      const canvas = await html2canvas(notesRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('notes.pdf');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "videos":
        if (selectedVideo !== null) {
          const video = VIDEOS_DATA.find(v => v.id === selectedVideo);
          return (
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                className="-ml-2 mb-2 gap-1 text-gray-500 hover:text-primary"
                onClick={() => setSelectedVideo(null)}
              >
                <ChevronLeft className="w-4 h-4" /> Back to Videos
              </Button>
              
              {/* Video Player UI */}
              <div className="bg-black aspect-video rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-lg">
                {/* Placeholder for video content */}
                <div className="absolute inset-0 bg-black/40" />
                <PlayCircle className="w-16 h-16 text-white opacity-90 hover:scale-110 transition-transform cursor-pointer relative z-10" />
                
                {/* Mock Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="h-1 bg-white/30 rounded-full mb-3 overflow-hidden cursor-pointer">
                    <div className="h-full w-1/3 bg-primary rounded-full" />
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <div className="flex gap-4 text-xs font-medium">
                      <span>04:12 / {video?.duration}</span>
                    </div>
                    <div className="flex gap-3">
                       {/* Mock Icons for controls */}
                       <div className="w-4 h-4 bg-white/80 rounded-sm" />
                       <div className="w-4 h-4 bg-white/80 rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-900">{video?.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {video?.desc}
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-4">
             {VIDEOS_DATA.map((video) => (
               <div 
                 key={video.id} 
                 className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-shadow group"
                 onClick={() => setSelectedVideo(video.id)}
               >
                 <div className="w-32 aspect-video rounded-xl overflow-hidden relative flex-shrink-0">
                   <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <PlayCircle className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                   </div>
                   <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                     {video.duration}
                   </div>
                 </div>
                 
                 <div className="flex flex-col justify-center gap-1">
                   <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                     {video.title}
                   </h3>
                   <p className="text-xs text-gray-500 line-clamp-2">
                     {video.desc}
                   </p>
                 </div>
               </div>
             ))}
          </div>
        );
      case "ai":
        return (
          <div className="flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Hello! I am your Physics Teacher.</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  Ask any question about this topic and get instant, personalized explanations.
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Input 
                  placeholder="Ask a question..." 
                  className="pr-10 h-12 rounded-2xl bg-white border-gray-200 shadow-sm"
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-1 top-1 text-gray-400 hover:text-primary h-10 w-10"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <Button 
                size="icon" 
                className="h-12 w-12 rounded-2xl shadow-md shadow-primary/20 flex-shrink-0"
              >
                <Mic className="w-5 h-5" />
              </Button>
            </div>
          </div>
        );
      case "podcast":
        return (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Mic className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Audio Summary</h3>
              <p className="text-xs text-gray-500">Listen to the key concepts on the go.</p>
              <div className="h-1 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full w-1/3 bg-purple-600 rounded-full" />
              </div>
            </div>
            <Button size="icon" variant="ghost">
              <PlayCircle className="w-8 h-8 text-primary fill-current" />
            </Button>
          </div>
        );
      case "mcq":
        if (!mcqStarted) {
          return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Configure Practice Test</h3>
                <p className="text-gray-500 text-sm">Customize your MCQ session to test your knowledge.</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select 
                    value={mcqConfig.level} 
                    onValueChange={(val) => setMcqConfig({...mcqConfig, level: val})}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Select 
                    value={mcqConfig.questions} 
                    onValueChange={(val) => setMcqConfig({...mcqConfig, questions: val})}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select number of questions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                      <SelectItem value="25">25 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Duration</Label>
                  <Select 
                    value={mcqConfig.time} 
                    onValueChange={(val) => setMcqConfig({...mcqConfig, time: val})}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 Minutes</SelectItem>
                      <SelectItem value="30">30 Minutes</SelectItem>
                      <SelectItem value="60">60 Minutes</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 mt-4"
                onClick={() => setMcqStarted(true)}
              >
                Start Test <Play className="w-4 h-4 ml-2 fill-current" />
              </Button>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="-ml-2 text-gray-500 hover:text-primary"
                onClick={() => setMcqStarted(false)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Config
              </Button>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                <Clock className="w-4 h-4" /> 
                {mcqConfig.time === 'unlimited' ? 'Unlimited' : `${mcqConfig.time}:00`}
              </div>
            </div>

            {[1, 2, 3].map((q) => (
              <div key={q} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Q{q}</span>
                  <span className="text-xs text-gray-400">1 Mark</span>
                </div>
                <p className="text-sm font-medium mb-4">Which of the following is a fundamental physical quantity?</p>
                <div className="space-y-2">
                  {["Velocity", "Time", "Force", "Momentum"].map((opt, i) => (
                    <button key={i} className="w-full text-left text-sm p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-colors">
                      {String.fromCharCode(65 + i)}. {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case "dpt":
        if (dptView === 'config') {
          return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Configure Daily Practice</h3>
                <p className="text-gray-500 text-sm">Customize today's session.</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select 
                    value={dptConfig.level} 
                    onValueChange={(val) => setDptConfig({...dptConfig, level: val})}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Select 
                    value={dptConfig.questions} 
                    onValueChange={(val) => setDptConfig({...dptConfig, questions: val})}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select number of questions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                      <SelectItem value="25">25 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Duration</Label>
                  <Select 
                    value={dptConfig.time} 
                    onValueChange={(val) => setDptConfig({...dptConfig, time: val})}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 Minutes</SelectItem>
                      <SelectItem value="30">30 Minutes</SelectItem>
                      <SelectItem value="60">60 Minutes</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <Button 
                  variant="outline"
                  className="flex-1 h-12 rounded-xl font-bold border-gray-200"
                  onClick={() => setDptView('dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-purple-200 bg-purple-600 hover:bg-purple-700"
                  onClick={() => setDptView('test')}
                >
                  Start Test <Play className="w-4 h-4 ml-2 fill-current" />
                </Button>
              </div>
            </div>
          );
        }

        if (dptView === 'test') {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="-ml-2 text-gray-500 hover:text-purple-600"
                  onClick={() => setDptView('config')}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Config
                </Button>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                  <Clock className="w-4 h-4" /> 
                  {dptConfig.time === 'unlimited' ? 'Unlimited' : `${dptConfig.time}:00`}
                </div>
              </div>

              {[1, 2, 3].map((q) => (
                <div key={q} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">Q{q}</span>
                    <span className="text-xs text-gray-400">1 Mark</span>
                  </div>
                  <p className="text-sm font-medium mb-4">Which of the following is a fundamental physical quantity?</p>
                  <div className="space-y-2">
                    {["Velocity", "Time", "Force", "Momentum"].map((opt, i) => (
                      <button key={i} className="w-full text-left text-sm p-3 rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors">
                        {String.fromCharCode(65 + i)}. {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Today's Challenge */}
            <div className="bg-purple-50 p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  <Flame className="w-3 h-3 fill-current" /> 7 Day Streak
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4 pt-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Today's Challenge</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                    Test your knowledge with 10 questions covering all topics
                  </p>
                </div>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 py-6 h-auto font-bold shadow-lg shadow-purple-200"
                  onClick={() => setDptView('config')}
                >
                  Start Today's DPT
                </Button>
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-purple-100/50">
                <div className="text-center">
                  <div className="font-bold text-gray-900">10</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Questions</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">15</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">Mixed</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Difficulty</div>
                </div>
              </div>
            </div>

            {/* Your Progress */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Your Progress</h3>
                <CalendarIcon className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex justify-center">
                <Calendar
                  mode="multiple"
                  selected={DPT_COMPLETED_DATES}
                  className="rounded-md border-none"
                  classNames={{
                    day_selected: "bg-purple-600 text-white hover:bg-purple-600 focus:bg-purple-600 font-bold",
                    day_today: "text-purple-600 font-bold",
                  }}
                />
              </div>
              
              <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 justify-center">
                <div className="w-3 h-3 bg-purple-600 rounded-full" />
                <span>Completed</span>
              </div>
            </div>

            {/* Recent Scores */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Recent Scores</h3>
              <div className="space-y-3">
                {RECENT_SCORES.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-xs border border-gray-100 text-gray-500">
                        {item.date.split(' ')[0]}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.date}
                      </div>
                    </div>
                    <div className="font-bold text-purple-600">
                      {item.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "notes":
        return (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden" ref={notesRef}>
            <div className="p-6 flex flex-wrap items-start gap-4 print:hidden">
              <h3 className="font-bold text-xl text-gray-900 leading-tight max-w-[200px]">
                Electric Charges and Fields
              </h3>
              <div className="flex gap-2 ml-auto sm:ml-0" data-html2canvas-ignore="true">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 h-9 text-xs"
                  onClick={handleDownloadPDF}
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 h-9 text-xs"
                  onClick={handlePrint}
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </Button>
              </div>
            </div>
            
            <div className="px-8 pb-8 pt-2 print:p-0">
              <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
                <div>
                  <p>
                    Charge is a fundamental property of matter that causes it to experience a force when placed in an electromagnetic field. There are two types of electric charges: positive and negative.
                  </p>
                </div>

                <div>
                  <h4 className="text-gray-900 font-bold text-base mb-2">Key Concepts:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Properties of electric charges</li>
                    <li>Conservation of charge</li>
                    <li>Quantization of charge</li>
                    <li>Charging by induction and conduction</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-gray-900 font-bold text-base mb-2">Formulas:</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono text-xs">
                    <p>Charge: q = ne (where n is integer, e = 1.6 × 10⁻¹⁹ C)</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-gray-900 font-bold text-base mb-2">Coulomb's Law:</h4>
                  <p>
                    The force between two point charges is directly proportional to the product of the magnitude of the two charges and inversely proportional to the square of the distance between them.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono text-xs mt-2">
                    <p>F = k(q₁q₂)/r²</p>
                    <p className="text-gray-400 mt-1">where k = 9 × 10⁹ Nm²/C²</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "assignments":
        if (selectedAssignment !== null) {
          const assignment = ASSIGNMENTS_DATA.find(a => a.id === selectedAssignment);
          return (
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                className="-ml-2 mb-2 gap-1 text-gray-500 hover:text-primary"
                onClick={() => setSelectedAssignment(null)}
              >
                <ChevronLeft className="w-4 h-4" /> Back to Assignments
              </Button>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-6 right-6">
                  {assignment?.status === 'pending' && (
                    <div className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      <Clock3 className="w-3.5 h-3.5" /> Pending
                    </div>
                  )}
                  {assignment?.status === 'submitted' && (
                    <div className="flex items-center gap-1.5 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5" /> Submitted
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-1 pr-24">{assignment?.title}</h2>
                <p className="text-gray-500 text-sm mb-4">{assignment?.description}</p>
                <div className="flex gap-6 text-sm text-gray-500">
                  <span className="font-medium">Due: <span className="text-gray-700">{assignment?.dueDate}</span></span>
                  <span className="font-medium">Total Marks: <span className="text-gray-700">{assignment?.totalMarks}</span></span>
                </div>
              </div>

              {assignment?.status === 'graded' ? (
                <div className="space-y-6">
                  {/* Score Card */}
                  <div className="bg-green-50 border border-green-100 rounded-3xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-gray-900 font-bold mb-1">Your Score</h3>
                        <div className="text-4xl font-bold text-green-600">
                          {assignment.score}/{assignment.totalMarks}
                        </div>
                      </div>
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <div className="border-t border-green-100 pt-4">
                       <p className="text-sm font-bold text-gray-900 mb-1">Instructor Feedback:</p>
                       <p className="text-sm text-gray-600">Great understanding of concepts!</p>
                    </div>
                  </div>

                  {/* Graded Questions */}
                  <div className="space-y-4">
                    {GRADED_QUIZ_DATA.map((q, index) => (
                      <div key={q.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Question {index + 1}</h3>
                        <p className="text-gray-700 font-medium mb-4">{q.question}</p>
                        
                        <div className="space-y-2 mb-4">
                          {q.options.map((option, optIndex) => {
                            const isCorrect = optIndex === q.correctAnswer;
                            const isSelected = optIndex === q.userAnswer;
                            
                            return (
                              <div 
                                key={optIndex}
                                className={cn(
                                  "w-full text-left text-sm p-3 rounded-xl border transition-colors flex justify-between items-center",
                                  isCorrect 
                                    ? "bg-green-50 border-green-200 text-green-800 font-medium" 
                                    : isSelected && !isCorrect
                                      ? "bg-red-50 border-red-200 text-red-800"
                                      : "bg-gray-50 border-gray-100 text-gray-600"
                                )}
                              >
                                {option}
                                {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                {isSelected && !isCorrect && <AlertCircle className="w-4 h-4 text-red-600" />}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <p className="text-xs font-bold text-gray-900 mb-1">Explanation:</p>
                          <p className="text-xs text-gray-500">{q.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : assignment?.status === 'submitted' ? (
                <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 mb-4">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Assignment Submitted</h3>
                  <p className="text-sm text-gray-500 font-medium mb-2">Submitted on 20/10/2025</p>
                  <p className="text-sm text-gray-400">Your assignment is being graded. Results will be available soon.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {ASSIGNMENT_QUESTIONS.map((q, index) => (
                      <div key={q.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Question {index + 1}</h3>
                        <p className="text-gray-700 font-medium mb-4">{q.question}</p>
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Your Answer</Label>
                          <textarea 
                            className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary resize-none outline-none text-sm"
                            placeholder="Type your answer here..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-4 pb-8">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-12 rounded-xl font-bold border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Save Draft
                    </Button>
                    <Button 
                      className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                      Submit Assignment
                    </Button>
                  </div>
                </>
              )}
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {ASSIGNMENTS_DATA.map((assignment) => (
              <div 
                key={assignment.id} 
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  if (['pending', 'submitted', 'graded'].includes(assignment.status)) {
                    setSelectedAssignment(assignment.id);
                  }
                }}
              >
                 {/* Status Badge */}
                 <div className="absolute top-6 right-6">
                    {assignment.status === 'pending' && (
                      <div className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        <Clock3 className="w-3.5 h-3.5" /> Pending
                      </div>
                    )}
                    {assignment.status === 'submitted' && (
                      <div className="flex items-center gap-1.5 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5" /> Submitted
                      </div>
                    )}
                    {assignment.status === 'graded' && (
                      <div className="flex items-center gap-1.5 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Graded
                      </div>
                    )}
                 </div>

                 {/* Left Border Accent */}
                 <div className={cn(
                   "absolute left-0 top-0 bottom-0 w-1.5",
                   assignment.status === 'pending' ? "bg-red-500" :
                   assignment.status === 'submitted' ? "bg-blue-500" : "bg-purple-600"
                 )} />

                 <div className="pr-24"> {/* Padding for status badge */}
                   <h3 className="text-lg font-bold text-gray-900 mb-1">{assignment.title}</h3>
                   <p className="text-gray-500 text-sm mb-6">{assignment.description}</p>
                   
                   <div className="flex items-center justify-between">
                     <div className="flex gap-6 text-sm text-gray-500">
                       <span className="font-medium">Due: <span className="text-gray-700">{assignment.dueDate}</span></span>
                       <span className="font-medium">Total Marks: <span className="text-gray-700">{assignment.totalMarks}</span></span>
                     </div>
                     
                     {(assignment.status === 'submitted' || assignment.status === 'graded') && assignment.score && (
                       <div className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
                         Score: {assignment.score}/{assignment.totalMarks}
                       </div>
                     )}
                   </div>
                 </div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
            <FileText className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm">Content for {activeTab} coming soon</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-primary pt-8 pb-6 px-6 rounded-b-[30px] shadow-lg z-20 sticky top-0 print:hidden">
        <div className="flex items-center gap-4 text-white mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 -ml-2"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-bold leading-tight">1.1 Physical Quantities</h1>
        </div>
        
        {/* Choice Chips Navigation */}
        <ScrollArea className="w-full whitespace-nowrap -mx-6 px-6 print:hidden">
          <div className="flex space-x-3 pb-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                    isActive 
                      ? "bg-white text-primary border-white shadow-lg scale-105" 
                      : "bg-white/10 text-white border-transparent hover:bg-white/20"
                  )}
                >
                  <tab.icon className={cn("w-4 h-4", isActive ? "fill-current" : "")} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}