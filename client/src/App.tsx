import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Login from "@/pages/login";
import HomeData from "@/pages/home";
import Cart from "@/pages/cart";
import Courses from "@/pages/courses";
import CourseDetails from "@/pages/course-details";
import Curriculum from "@/pages/curriculum";
import MyCourses from "@/pages/my-courses";
import LearningPath from "@/pages/learning-path";
import TopicDetails from "@/pages/topic-details";
import Profile from "@/pages/profile";
import Dashboard from "@/pages/dashboard";
import DetailedProgress from "@/pages/detailed-progress";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/login" component={Login} />
      <Route path="/home" component={HomeData} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/detailed-progress" component={DetailedProgress} />
      <Route path="/cart" component={Cart} />
      <Route path="/courses" component={Courses} />
      <Route path="/my-courses" component={MyCourses} />
      <Route path="/course-details" component={CourseDetails} />
      <Route path="/curriculum" component={Curriculum} />
      <Route path="/learning-path" component={LearningPath} />
      <Route path="/topic-details" component={TopicDetails} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
