import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import graduateImage from "@assets/generated_images/student_graduate_waving.png";
import studentsImage from "@assets/generated_images/two_students_learning.png";

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();

  const slides = [
    {
      image: studentsImage,
      title: "Start learning now!",
      description: "Interested in to learn from the best teachers around the world?",
    },
    {
      image: graduateImage,
      title: "Start learning now",
      description: "Start learning from the best instructors in different topics.",
    },
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      setLocation("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] rounded-full bg-primary/10 -z-10 blur-3xl" />
      <div className="absolute bottom-[20%] right-[-10%] w-[200px] h-[200px] rounded-full bg-primary/5 -z-10 blur-2xl" />

      <div className="flex-1 flex flex-col items-center justify-center w-full mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center space-y-8 w-full"
          >
            <div className="relative w-full aspect-square max-w-[300px] flex items-center justify-center">
               {/* Circle background behind image */}
               <div className="absolute inset-4 bg-gray-50 rounded-full -z-10" />
               <img 
                src={slides[step].image} 
                alt="Onboarding illustration" 
                className="w-full h-full object-contain p-4"
              />
            </div>
            
            <div className="space-y-3 max-w-[280px]">
              <h1 className="text-2xl font-bold text-foreground">
                {slides[step].title}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {slides[step].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full mb-8">
        {step === slides.length - 1 ? (
          <div className="flex flex-col gap-4 w-full px-4">
            <Button 
              className="w-full h-12 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20" 
              onClick={() => setLocation("/login")}
            >
              Login
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-2xl text-base font-semibold border-primary/20 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => setLocation("/login")} // In a real app, this would go to signup
            >
              Sign up
            </Button>
            
            <button 
              className="text-xs text-muted-foreground mt-2"
              onClick={() => setLocation("/login")}
            >
              Skip login
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full px-2">
            <button 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              onClick={() => setLocation("/login")}
            >
              Skip
            </button>
            
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${step === index ? "bg-primary" : "bg-primary/20"}`} 
                />
              ))}
              {/* Add a 3rd dot just to match the visual if desired, but 2 slides = 2 dots usually. 
                  The image showed 3 dots. Let's add a fake one or just stick to 2.
                  The image has 3 dots. I'll add a 3rd dummy dot or just assume there are 3 steps.
                  Let's stick to 2 for now as I only have 2 images. 
              */}
            </div>
            
            <button 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
