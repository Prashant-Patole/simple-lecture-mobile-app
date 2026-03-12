import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, User, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

import { BottomNav } from "@/components/BottomNav";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    fullName: "Pramod",
    email: "pramod0605@gmail.com",
    phone: "9886733599",
    dob: "2025-05-12"
  });

  const handleSave = () => {
    // Mock save functionality
    console.log("Saving profile:", formData);
    // Could show a toast here
    setLocation("/home");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/home")}
            className="-ml-2"
        >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-4">
            <Avatar className="w-16 h-16 bg-gray-100">
                <AvatarFallback className="text-xl text-gray-700">P</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-xl font-bold text-gray-900">Pramod</h2>
                <p className="text-gray-500 text-sm">pramod0605@gmail.com</p>
            </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h3>
            
            <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4" />
                    Full Name
                </Label>
                <Input 
                    id="fullName" 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="bg-gray-50 border-gray-200 h-12 text-base"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    Email Address
                </Label>
                <Input 
                    id="email" 
                    value={formData.email} 
                    readOnly
                    className="bg-gray-100 border-gray-200 text-gray-500 h-12 text-base"
                />
                <p className="text-xs text-gray-400 pl-1">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    Phone Number
                </Label>
                <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-gray-50 border-gray-200 h-12 text-base"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="dob" className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                </Label>
                <div className="relative">
                    <Input 
                        id="dob" 
                        type="date"
                        value={formData.dob} 
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        className="bg-gray-50 border-gray-200 h-12 text-base w-full"
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-32 z-20">
        <Button 
            className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            onClick={handleSave}
        >
            Save Changes
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
