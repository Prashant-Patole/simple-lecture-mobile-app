import { Link, useLocation } from "wouter";
import { ChevronLeft, Star, Clock, Globe, Award, BookOpen, CheckCircle, PlayCircle, FileText, HelpCircle, Users, BarChart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import profileImage from "@assets/generated_images/user_profile_avatar.png";
import designImage from "@assets/generated_images/woman_working_on_laptop.png";
import physicsImage from "@assets/generated_images/physics_lab_experiment.png";
import chemistryImage from "@assets/generated_images/chemistry_beakers_reaction.png";
import biologyImage from "@assets/generated_images/biology_dna_model.png";

// Mock Data for the details page
const COURSE_DETAILS = {
  id: 1,
  title: "Complete 10th Grade Science Bundle",
  subtitle: "Master Physics, Chemistry, and Biology for Board Exams with top educators.",
  subjects: ["Physics", "Chemistry", "Biology"],
  rating: 4.9,
  reviewCount: 1240,
  duration: "120 Hours",
  originalPrice: 49.99,
  discountedPrice: 29.99,
  image: designImage,
  instructor: {
    name: "Sarah Jenkins",
    role: "Senior Science Faculty",
    image: profileImage
  },
  about: "This comprehensive course is designed to help 10th-grade students master the entire Science syllabus. Whether you are preparing for CBSE, ICSE, or State Boards, this program covers every concept in depth with real-world examples, experiments, and problem-solving sessions.",
  included: [
    { icon: PlayCircle, label: "250+ Hours of Live & Recorded Classes" },
    { icon: FileText, label: "Downloadable PDF Notes & Mind Maps" },
    { icon: HelpCircle, label: "24/7 Doubt Solving Support" },
    { icon: BookOpen, label: "10 Full-length Mock Tests" }
  ],
  whatYouLearn: [
    "Understand fundamental concepts of Physics, Chemistry, and Biology.",
    "Solve complex numerical problems with easy techniques.",
    "Perform virtual lab experiments to grasp practical applications.",
    "Master time management strategies for board exams."
  ],
  subjectsMaster: [
    {
      name: "Physics: Motion & Laws",
      image: physicsImage,
      desc: "Master Newton's laws, force, and motion with practical examples."
    },
    {
      name: "Chemistry: Reactions",
      image: chemistryImage,
      desc: "Understand chemical equations, balancing, and types of reactions."
    },
    {
      name: "Biology: Life Processes",
      image: biologyImage,
      desc: "Explore nutrition, respiration, and transport in living organisms."
    },
    {
      name: "Physics: Light & Optics",
      image: physicsImage, // Reusing for variety
      desc: "Learn about reflection, refraction, lenses, and mirrors."
    },
    {
      name: "Chemistry: Elements",
      image: chemistryImage, // Reusing
      desc: "Dive into the periodic table and properties of elements."
    }
  ],
  features: [
    { icon: Users, title: "Expert Faculty", desc: "Learn from teachers with 10+ years of experience." },
    { icon: BarChart, title: "Performance Analysis", desc: "Get detailed insights into your strengths and weaknesses." },
    { icon: Award, title: "Certification", desc: "Earn a certificate of completion upon finishing the course." }
  ]
};

export default function CourseDetails() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Top Banner / Header */}
      <div className="relative h-[400px] w-full">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={COURSE_DETAILS.image} 
            alt={COURSE_DETAILS.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        </div>

        {/* Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex gap-2">
             <Button variant="secondary" size="icon" className="rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0">
                <CheckCircle className="w-5 h-5" />
             </Button>
          </div>
        </div>

        {/* Banner Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {COURSE_DETAILS.subjects.map(subject => (
              <Badge key={subject} variant="secondary" className="bg-primary/80 hover:bg-primary text-white border-0 backdrop-blur-sm">
                {subject}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl font-bold leading-tight">{COURSE_DETAILS.title}</h1>
          <p className="text-white/80 text-sm line-clamp-2">{COURSE_DETAILS.subtitle}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-yellow-400 font-bold">
              <span className="text-white mr-1">{COURSE_DETAILS.rating}</span>
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <span className="text-white/60 font-normal ml-1">({COURSE_DETAILS.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <Clock className="w-4 h-4" />
              <span>{COURSE_DETAILS.duration}</span>
            </div>
          </div>

          <div className="flex items-end gap-3 pt-2">
             <span className="text-3xl font-bold text-primary-foreground">${COURSE_DETAILS.discountedPrice}</span>
             <span className="text-lg text-white/60 line-through mb-1">${COURSE_DETAILS.originalPrice}</span>
             <Badge variant="outline" className="border-green-400 text-green-400 mb-1 ml-auto">
                40% OFF
             </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 space-y-8 -mt-6 bg-gray-50 rounded-t-[30px] relative z-0">
        
        {/* About this program */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">About this program</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {COURSE_DETAILS.about}
          </p>
        </section>

        {/* This course includes */}
        <section className="space-y-4">
           <h2 className="text-lg font-bold text-gray-900">This course includes</h2>
           <div className="grid grid-cols-1 gap-3">
              {COURSE_DETAILS.included.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <item.icon className="w-4 h-4" />
                   </div>
                   {item.label}
                </div>
              ))}
           </div>
        </section>

        {/* What you'll learn */}
        <section className="space-y-4">
           <h2 className="text-lg font-bold text-gray-900">What you'll learn</h2>
           <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
              {COURSE_DETAILS.whatYouLearn.map((point, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                   <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                   <p className="text-sm text-gray-600 leading-snug">{point}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Subjects you'll master */}
        <section className="space-y-4">
           <h2 className="text-lg font-bold text-gray-900">Subjects you'll master</h2>
           <ScrollArea className="w-full whitespace-nowrap">
             <div className="flex w-max space-x-4 pb-4">
              {COURSE_DETAILS.subjectsMaster.map((subject, idx) => (
                 <div key={idx} className="w-[220px] bg-white rounded-3xl p-3 shadow-sm border border-gray-100 flex flex-col">
                    <div className="relative rounded-2xl overflow-hidden mb-3 aspect-video">
                       <img src={subject.image} alt={subject.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <h3 className="font-bold text-sm text-gray-900 mb-1 leading-tight whitespace-normal">{subject.name}</h3>
                      <p className="text-xs text-gray-500 leading-snug mb-3 whitespace-normal line-clamp-2">
                        {subject.desc}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-auto w-full text-xs h-8 rounded-xl border-primary/20 text-primary hover:bg-primary/5 hover:text-primary font-semibold"
                        onClick={() => setLocation("/curriculum")}
                      >
                        Explore Curriculum
                      </Button>
                    </div>
                 </div>
              ))}
             </div>
             <ScrollBar orientation="horizontal" className="hidden" />
           </ScrollArea>
        </section>

        {/* Course Features */}
        <section className="space-y-4">
           <h2 className="text-lg font-bold text-gray-900">Course Features</h2>
           <div className="grid grid-cols-1 gap-4">
              {COURSE_DETAILS.features.map((feature, idx) => (
                 <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary flex-shrink-0">
                       <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                       <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
                    </div>
                 </div>
              ))}
           </div>
        </section>

      </div>

      {/* Sticky Bottom Enroll Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 px-6 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
         <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/25">
            Enroll Now
         </Button>
      </div>

    </div>
  );
}
