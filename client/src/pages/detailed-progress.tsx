import { Link, useLocation, useSearch } from "wouter";
import { ArrowLeft, Mail, Phone, Calendar, Clock, User, BarChart as BarChartIcon, BookOpen, CheckCircle, Clock3, CalendarRange, Brain, Sparkles, Activity, TrendingUp, Trophy, Target, ChevronRight, CheckCircle2, Circle, Video, Headphones, MessageCircle, HelpCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import profileImage from "@assets/generated_images/user_profile_avatar.png";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";



// Placeholder Components for each tab
const Overview = () => (
    <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">Activity Score</span>
                        <Activity className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="mb-3">
                        <span className="text-2xl font-bold text-gray-900">88%</span>
                    </div>
                    <Progress value={88} className="h-2.5 bg-gray-100" indicatorClassName="bg-[#8b5cf6]" />
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">Overall Progress</span>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="mb-3">
                        <span className="text-2xl font-bold text-gray-900">88.5%</span>
                    </div>
                    <Progress value={88.5} className="h-2.5 bg-gray-100" indicatorClassName="bg-[#8b5cf6]" />
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">Tests Taken</span>
                        <Trophy className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="mb-1">
                        <span className="text-2xl font-bold text-gray-900">58</span>
                    </div>
                    <span className="text-xs text-gray-400">Avg: 87%</span>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">Attendance</span>
                        <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="mb-1">
                        <span className="text-2xl font-bold text-gray-900">90%</span>
                    </div>
                    <span className="text-xs text-gray-400">54/60 classes</span>
                </CardContent>
            </Card>
        </div>

        {/* Areas to Focus On */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5" />
                    Areas to Focus On
                </h3>
                <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-full border border-gray-200">
                        Electrochemistry
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-full border border-gray-200">
                        Complex Numbers
                    </span>
                </div>
            </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-0.5">Modern Physics</h4>
                            <p className="text-xs text-gray-500">Physics</p>
                        </div>
                        <div className="text-right">
                            <span className="bg-[#8b5cf6] text-white text-xs font-bold px-3 py-1 rounded-full block w-fit ml-auto mb-1">
                                Attended
                            </span>
                            <span className="text-[10px] text-gray-400">2025-10-16</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-0.5">Electrochemistry</h4>
                            <p className="text-xs text-gray-500">Chemistry</p>
                        </div>
                        <div className="text-right">
                            <span className="bg-[#8b5cf6] text-white text-xs font-bold px-3 py-1 rounded-full block w-fit ml-auto mb-1">
                                Attended
                            </span>
                            <span className="text-[10px] text-gray-400">2025-10-15</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-0.5">Complex Numbers</h4>
                            <p className="text-xs text-gray-500">Mathematics</p>
                        </div>
                        <div className="text-right">
                            <span className="bg-[#8b5cf6] text-white text-xs font-bold px-3 py-1 rounded-full block w-fit ml-auto mb-1">
                                Attended
                            </span>
                            <span className="text-[10px] text-gray-400">2025-10-14</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* My Courses Section */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <BookOpen className="w-5 h-5" />
                    My Courses
                </h3>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1">JEE Main 2025 Complete</h4>
                                <p className="text-xs text-gray-500">Physics, Chemistry, Mathematics</p>
                            </div>
                            <span className="bg-[#3b82f6] text-white text-xs font-bold px-2 py-1 rounded-md">85%</span>
                        </div>
                        <Progress value={85} className="h-2.5 bg-gray-100" indicatorClassName="bg-[#8b5cf6]" />
                    </div>

                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1">Advanced Mathematics</h4>
                                <p className="text-xs text-gray-500">Calculus, Algebra, Trigonometry</p>
                            </div>
                            <span className="bg-[#3b82f6] text-white text-xs font-bold px-2 py-1 rounded-md">92%</span>
                        </div>
                        <Progress value={92} className="h-2.5 bg-gray-100" indicatorClassName="bg-[#8b5cf6]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

const data = [
  { name: 'Jan', value: 45 },
  { name: 'Feb', value: 52 },
  { name: 'Mar', value: 61 },
  { name: 'Apr', value: 68 },
  { name: 'May', value: 74 },
  { name: 'Jun', value: 79 },
  { name: 'Jul', value: 84 },
  { name: 'Aug', value: 87 },
  { name: 'Sep', value: 91 },
];

const MyProgress = () => (
    <div className="space-y-6">
        <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5" />
                    Progress Trend
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6b7280', fontSize: 12 }} 
                                dy={10}
                            />
                            <YAxis 
                                hide={false}
                                axisLine={true}
                                tickLine={true}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                domain={[0, 100]}
                                ticks={[0, 25, 50, 75, 100]}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#8b5cf6" 
                                strokeWidth={2} 
                                dot={{ fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#8b5cf6' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center items-center gap-2 mt-4 text-sm text-[#8b5cf6] font-medium">
                    <div className="w-2 h-2 rounded-full border-2 border-[#8b5cf6] bg-white"></div>
                    Overall Progress (%)
                </div>
            </CardContent>
        </Card>

        {/* Subject-wise Progress */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Subject-wise Progress</h3>
                
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">Physics</h4>
                            <span className="text-xs text-gray-400">90%</span>
                        </div>
                        <Progress value={90} className="h-3 bg-[#3b82f6]" indicatorClassName="bg-[#8b5cf6]" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">Chemistry</h4>
                            <span className="text-xs text-gray-400">84%</span>
                        </div>
                        <Progress value={84} className="h-3 bg-[#3b82f6]" indicatorClassName="bg-[#8b5cf6]" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">Mathematics</h4>
                            <span className="text-xs text-gray-400">87%</span>
                        </div>
                        <Progress value={87} className="h-3 bg-[#3b82f6]" indicatorClassName="bg-[#8b5cf6]" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">Calculus</h4>
                            <span className="text-xs text-gray-400">0%</span>
                        </div>
                        <Progress value={0} className="h-3 bg-[#3b82f6]" indicatorClassName="bg-[#8b5cf6]" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">Algebra</h4>
                            <span className="text-xs text-gray-400">0%</span>
                        </div>
                        <Progress value={0} className="h-3 bg-[#3b82f6]" indicatorClassName="bg-[#8b5cf6]" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">Trigonometry</h4>
                            <span className="text-xs text-gray-400">0%</span>
                        </div>
                        <Progress value={0} className="h-3 bg-[#3b82f6]" indicatorClassName="bg-[#8b5cf6]" />
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Course Progress Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4">JEE Main 2025 Complete</h4>
                    <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                        <span>Overall Progress</span>
                        <span className="font-bold text-gray-900">85%</span>
                    </div>
                    <Progress value={85} className="h-3 bg-[#3b82f6]" indicatorClassName="bg-[#8b5cf6]" />
                    
                    <div className="mt-4">
                        <p className="text-xs text-gray-400 mb-2">Subjects:</p>
                        <div className="flex gap-2 flex-wrap">
                            {["Physics", "Chemistry", "Mathematics"].map((subject) => (
                                <span key={subject} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                                    {subject}
                                </span>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Advanced Mathematics</h4>
                    <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                        <span>Overall Progress</span>
                        <span className="font-bold text-gray-900">92%</span>
                    </div>
                    <Progress value={92} className="h-3 bg-[#3b82f6]" indicatorClassName="bg-[#8b5cf6]" />
                    
                    <div className="mt-4">
                        <p className="text-xs text-gray-400 mb-2">Subjects:</p>
                        <div className="flex gap-2 flex-wrap">
                            {["Calculus", "Algebra", "Trigonometry"].map((subject) => (
                                <span key={subject} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                                    {subject}
                                </span>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);
const MyTests = () => (
    <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
            <Select defaultValue="All Courses">
                <SelectTrigger className="w-auto min-w-[140px] bg-white border-gray-200 rounded-xl h-10 text-sm">
                    <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All Courses">All Courses</SelectItem>
                    <SelectItem value="JEE Main 2025 Complete">JEE Main 2025 Complete</SelectItem>
                    <SelectItem value="Advanced Mathematics">Advanced Mathematics</SelectItem>
                    <SelectItem value="Physics Mastery">Physics Mastery</SelectItem>
                </SelectContent>
            </Select>

            <Select defaultValue="All Subjects">
                <SelectTrigger className="w-auto min-w-[140px] bg-white border-gray-200 rounded-xl h-10 text-sm">
                    <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All Subjects">All Subjects</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Algebra">Algebra</SelectItem>
                    <SelectItem value="Calculus">Calculus</SelectItem>
                    <SelectItem value="Trigonometry">Trigonometry</SelectItem>
                </SelectContent>
            </Select>

            <Select defaultValue="All Time">
                <SelectTrigger className="w-auto min-w-[140px] bg-white border-gray-200 rounded-xl h-10 text-sm">
                    <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All Time">All Time</SelectItem>
                    <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                    <SelectItem value="Last 9 Days">Last 9 Days</SelectItem>
                    <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                </SelectContent>
            </Select>

            <Select defaultValue="All Types">
                <SelectTrigger className="w-auto min-w-[140px] bg-white border-gray-200 rounded-xl h-10 text-sm">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="DTP">DTP</SelectItem>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">Total Tests</span>
                        <Trophy className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="mb-1">
                        <span className="text-3xl font-bold text-gray-900">58</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">Average Score</span>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="mb-1">
                        <span className="text-3xl font-bold text-gray-900">87%</span>
                    </div>
                </CardContent>
            </Card>

             <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">MCQ Accuracy</span>
                        <Target className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="mb-1">
                        <span className="text-3xl font-bold text-gray-900">87%</span>
                    </div>
                    <span className="text-xs text-gray-400">679/780</span>
                </CardContent>
            </Card>
        </div>

        {/* MCQ Performance Chart */}
        <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">MCQ Performance by Subject</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={[
                                { subject: 'Physics', attempted: 260, correct: 240 },
                                { subject: 'Chemistry', attempted: 260, correct: 218 },
                                { subject: 'Mathematics', attempted: 260, correct: 230 },
                            ]} 
                            barGap={0}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="subject" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6b7280', fontSize: 12 }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f3f4f6' }}
                            />
                            <Legend 
                                iconType="square"
                                formatter={(value) => <span className="text-sm text-gray-600 font-medium ml-1">{value}</span>}
                            />
                            <Bar dataKey="attempted" name="Attempted" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="correct" name="Correct" fill="#000000" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        {/* Accuracy and Recent Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Accuracy by Subject - Pie Chart */}
            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Accuracy by Subject</h3>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Physics', value: 90 },
                                        { name: 'Chemistry', value: 84 },
                                        { name: 'Mathematics', value: 87 },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={80}
                                    paddingAngle={0}
                                    dataKey="value"
                                >
                                    <Cell fill="#000000" />
                                    <Cell fill="#9ca3af" /> 
                                    <Cell fill="#4b5563" />
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Custom Labels overlay - simplified for mockup */}
                        <div className="absolute top-1/2 right-[10%] transform -translate-y-1/2 text-xs font-medium hidden md:block">
                            <div className="mb-8">Physics: 90%</div>
                            <div className="mt-12">Mathematics: 87%</div>
                        </div>
                        <div className="absolute top-1/2 left-[10%] transform -translate-y-1/2 text-xs font-medium hidden md:block">
                             <div>Chemistry: 84%</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Practice Sessions */}
            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Practice Sessions</h3>
                    <div className="space-y-6">
                        {[
                            { subject: 'Physics', score: '23/25 correct', percent: '92%', date: '2025-10-16' },
                            { subject: 'Chemistry', score: '21/25 correct', percent: '84%', date: '2025-10-15' },
                            { subject: 'Mathematics', score: '27/30 correct', percent: '90%', date: '2025-10-14' }
                        ].map((session, index) => (
                            <div key={index} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm mb-0.5">{session.subject}</h4>
                                    <p className="text-xs text-gray-500">{session.score}</p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-[#8b5cf6] text-white text-xs font-bold px-3 py-1 rounded-full block w-fit ml-auto mb-1">
                                        {session.percent}
                                    </span>
                                    <span className="text-[10px] text-gray-400">{session.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);
const MyAttendance = () => (
    <div className="space-y-6">
        <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Attendance Calendar</h3>
                    <span className="text-sm text-gray-500">December 2025</span>
                </div>

                <div className="flex gap-4 mb-8 text-xs">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Present</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-gray-600">Absent</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-gray-600">Upcoming</span>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-3">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-400 mb-2">
                            {day}
                        </div>
                    ))}
                    
                    {/* Empty slot for Sunday (Dec 1 is Monday) */}
                    <div className="aspect-square"></div>

                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        // Mock logic for status
                        let status = "present";
                        if (day > 15) status = "upcoming";
                        else if ([3, 8, 12].includes(day)) status = "absent";
                        else if ([6, 7, 13, 14].includes(day)) status = "upcoming"; // Weekends

                        let bgClass = "bg-green-50 text-green-700 border-green-100"; // Default Present
                        if (status === "absent") bgClass = "bg-red-50 text-red-700 border-red-100";
                        if (status === "upcoming") bgClass = "bg-blue-50 text-blue-700 border-blue-100";

                        return (
                             <div key={day} className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold border ${bgClass}`}>
                                {day}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    </div>
);
const MyTimetable = () => {
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
    const [selectedSubject, setSelectedSubject] = useState("All Subjects");

    // Sample Data
    const scheduleData = [
        { day: "Monday", time: "09:00 - 10:30", subject: "Physics", topic: "Modern Physics", teacher: "Dr. Sharma", type: "live class", color: "blue" },
        { day: "Monday", time: "11:00 - 12:30", subject: "Chemistry", topic: "Electrochemistry", teacher: "Prof. Gupta", type: "live class", color: "purple" },
        { day: "Tuesday", time: "09:00 - 10:30", subject: "Physics", topic: "Nuclear Physics", teacher: "Dr. Sharma", type: "live class", color: "blue" },
        { day: "Tuesday", time: "11:00 - 12:30", subject: "Chemistry", topic: "Surface Chemistry", teacher: "Prof. Gupta", type: "live class", color: "purple" },
        { day: "Wednesday", time: "09:00 - 10:30", subject: "Mathematics", topic: "Calculus", teacher: "Dr. Patel", type: "live class", color: "purple" },
        { day: "Wednesday", time: "14:00 - 15:30", subject: "Physics", topic: "Semiconductors", teacher: "Dr. Sharma", type: "live class", color: "blue" },
        { day: "Thursday", time: "11:00 - 12:30", subject: "Chemistry", topic: "Chemical Bonding", teacher: "Prof. Gupta", type: "live class", color: "purple" },
        { day: "Thursday", time: "14:00 - 15:30", subject: "Mathematics", topic: "Probability", teacher: "Dr. Patel", type: "live class", color: "purple" },
        { day: "Friday", time: "09:00 - 10:30", subject: "Physics", topic: "Quantum Mechanics", teacher: "Dr. Sharma", type: "live class", color: "blue" },
        { day: "Friday", time: "11:00 - 12:30", subject: "Chemistry", topic: "Coordination Compounds", teacher: "Prof. Gupta", type: "live class", color: "purple" },
    ];

    const filteredSchedule = selectedSubject === "All Subjects" 
        ? scheduleData 
        : scheduleData.filter(item => item.subject === selectedSubject);

    // Helper to group by day for list view
    const groupedByDay = filteredSchedule.reduce((acc, curr) => {
        if (!acc[curr.day]) acc[curr.day] = [];
        acc[curr.day].push(curr);
        return acc;
    }, {} as Record<string, typeof scheduleData>);

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex justify-between items-center mb-6">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-auto min-w-[140px] bg-white border-[#8b5cf6] text-[#8b5cf6] rounded-xl h-10 text-sm font-medium border-2">
                        <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All Subjects">All Subjects</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setViewMode("calendar")}
                        className={`${viewMode === 'calendar' ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] hover:text-white' : 'text-gray-500 hover:text-gray-900'} h-8 px-3 rounded-md flex items-center gap-2 transition-all`}
                    >
                        <Calendar className="w-4 h-4" />
                        Calendar
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setViewMode("list")}
                        className={`${viewMode === 'list' ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] hover:text-white' : 'text-gray-500 hover:text-gray-900'} h-8 px-3 rounded-md flex items-center gap-2 transition-all`}
                    >
                        <div className="w-4 h-4 flex flex-col justify-between py-0.5">
                            <span className="w-full h-0.5 bg-current rounded-full"></span>
                            <span className="w-full h-0.5 bg-current rounded-full"></span>
                            <span className="w-full h-0.5 bg-current rounded-full"></span>
                        </div>
                        List
                    </Button>
                </div>
            </div>

            {/* Calendar View */}
            {viewMode === "calendar" && (
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-[1000px]">
                        {daysOfWeek.map(day => {
                            const dayClasses = filteredSchedule.filter(item => item.day === day);
                            return (
                                <div key={day} className="flex-1 min-w-[140px] space-y-3">
                                    <div className="text-sm font-medium text-gray-900 mb-4">{day}</div>
                                    
                                    {dayClasses.length === 0 ? (
                                        <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
                                            No classes
                                        </div>
                                    ) : (
                                        dayClasses.map((cls, idx) => (
                                            <Card key={idx} className={`border-l-4 ${cls.color === 'blue' ? 'border-l-[#3b82f6]' : 'border-l-[#8b5cf6]'} shadow-sm hover:shadow-md transition-shadow`}>
                                                <CardContent className="p-3">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                        <Clock className="w-3 h-3" />
                                                        {cls.time}
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 text-sm">{cls.subject}</h4>
                                                    <p className="text-xs text-gray-500 mb-2">{cls.topic}</p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                                                        <User className="w-3 h-3" />
                                                        {cls.teacher}
                                                    </div>
                                                    <span className={`inline-block ${cls.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                                                        {cls.type}
                                                    </span>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <div className="space-y-8">
                    <h3 className="text-lg font-bold text-gray-900">Weekly Schedule</h3>
                    
                    {Object.keys(groupedByDay).length === 0 ? (
                         <div className="text-center py-10 text-gray-500">No classes found for the selected filter.</div>
                    ) : (
                        daysOfWeek.filter(day => groupedByDay[day]).map(day => (
                            <div key={day} className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-500">{day}</h4>
                                <div className="space-y-3">
                                    {groupedByDay[day].map((cls, idx) => (
                                        <div key={idx} className={`flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white rounded-xl border-l-4 ${cls.color === 'blue' ? 'border-l-[#3b82f6]' : 'border-l-[#8b5cf6]'} shadow-sm`}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <div className="flex items-center gap-2 font-bold text-gray-900">
                                                        <BookOpen className="w-4 h-4 text-gray-400" />
                                                        {cls.subject}
                                                    </div>
                                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {cls.type}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500 ml-6">
                                                    {cls.topic}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-6 ml-6 md:ml-0 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    {cls.time}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {cls.teacher}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
const MyCourses = () => {
    const coursesData = [
        {
            title: "HSC 12 Complete Course",
            subjects: [
                {
                    name: "Physics",
                    chapters: [
                        {
                            name: "Rotational Dynamics",
                            progress: 75,
                            topics: [
                                { name: "Moment of Inertia", completed: true },
                                { name: "Torque & Angular Momentum", completed: true },
                                { name: "Rolling Motion", completed: false },
                                { name: "Applications of Torque", completed: false }
                            ]
                        },
                        {
                            name: "Mechanical Properties of Fluids",
                            progress: 45,
                            topics: [
                                { name: "Surface Tension", completed: true },
                                { name: "Viscosity", completed: false },
                                { name: "Bernoulli's Principle", completed: false }
                            ]
                        },
                        {
                            name: "Kinetic Theory of Gases",
                            progress: 30,
                            topics: [
                                { name: "Ideal Gas Equation", completed: true },
                                { name: "Mean Free Path", completed: false },
                                { name: "Specific Heat Capacity", completed: false }
                            ]
                        }
                    ]
                },
                {
                    name: "Chemistry",
                    chapters: [
                        {
                            name: "Solid State",
                            progress: 80,
                            topics: [
                                { name: "Unit Cells", completed: true },
                                { name: "Packing Efficiency", completed: true },
                                { name: "Imperfections in Solids", completed: false }
                            ]
                        },
                        {
                            name: "Solutions",
                            progress: 60,
                            topics: [
                                { name: "Concentration Terms", completed: true },
                                { name: "Colligative Properties", completed: true },
                                { name: "Van't Hoff Factor", completed: false }
                            ]
                        },
                        {
                            name: "Ionic Equilibria",
                            progress: 20,
                            topics: [
                                { name: "Acids and Bases", completed: true },
                                { name: "pH Scale", completed: false },
                                { name: "Buffer Solutions", completed: false }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            title: "JEE Main Complete Course",
            subjects: [
                {
                    name: "Mathematics",
                    chapters: [
                        {
                            name: "Complex Numbers",
                            progress: 65,
                            topics: [
                                { name: "Algebra of Complex Numbers", completed: true },
                                { name: "Argand Plane", completed: true },
                                { name: "Cube Roots of Unity", completed: false }
                            ]
                        },
                        {
                            name: "Quadratic Equations",
                            progress: 50,
                            topics: [
                                { name: "Nature of Roots", completed: true },
                                { name: "Relation between Roots and Coefficients", completed: true },
                                { name: "Location of Roots", completed: false }
                            ]
                        },
                        {
                            name: "Matrices & Determinants",
                            progress: 90,
                            topics: [
                                { name: "Types of Matrices", completed: true },
                                { name: "Inverse of Matrix", completed: true },
                                { name: "Cramer's Rule", completed: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            title: "JEE Advanced Complete Course",
            subjects: [
                {
                    name: "Physics",
                    chapters: [
                        {
                            name: "Mechanics",
                            progress: 65,
                            topics: [
                                { name: "Newton's Laws", completed: true },
                                { name: "Work Power Energy", completed: true },
                                { name: "Rotational Motion", completed: false }
                            ]
                        },
                        {
                            name: "Electromagnetism",
                            progress: 45,
                            topics: [
                                { name: "Electrostatics", completed: true },
                                { name: "Current Electricity", completed: false },
                                { name: "Magnetism", completed: false }
                            ]
                        },
                        {
                            name: "Modern Physics",
                            progress: 30,
                            topics: [
                                { name: "Photoelectric Effect", completed: true },
                                { name: "Atomic Structure", completed: false },
                                { name: "Nuclear Physics", completed: false }
                            ]
                        }
                    ]
                },
                {
                    name: "Chemistry",
                    chapters: [
                        {
                            name: "Physical Chemistry",
                            progress: 70,
                            topics: [
                                { name: "Thermodynamics", completed: true },
                                { name: "Chemical Kinetics", completed: true },
                                { name: "Electrochemistry", completed: false }
                            ]
                        },
                        {
                            name: "Organic Chemistry",
                            progress: 40,
                            topics: [
                                { name: "GOC", completed: true },
                                { name: "Hydrocarbons", completed: false },
                                { name: "Aldehydes & Ketones", completed: false }
                            ]
                        },
                        {
                            name: "Inorganic Chemistry",
                            progress: 55,
                            topics: [
                                { name: "Chemical Bonding", completed: true },
                                { name: "Coordination Compounds", completed: true },
                                { name: "P-Block Elements", completed: false }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    return (
        <div className="space-y-6">
            {coursesData.map((course, index) => (
                <Card key={index} className="border-0 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                            <BookOpen className="w-5 h-5 text-gray-700" />
                            {course.title}
                        </h3>

                        <div className="space-y-8">
                            {course.subjects.map((subject, subIndex) => (
                                <div key={subIndex}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <h4 className="font-bold text-gray-900">{subject.name}</h4>
                                        <span className="bg-[#3b82f6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {subject.chapters.length} Chapters
                                        </span>
                                    </div>

                                    <Accordion type="single" collapsible className="w-full space-y-2">
                                        {subject.chapters.map((chapter, chapIndex) => (
                                            <AccordionItem key={chapIndex} value={`item-${index}-${subIndex}-${chapIndex}`} className="border border-gray-100 rounded-xl px-4 bg-white data-[state=open]:bg-gray-50/50 data-[state=open]:border-[#8b5cf6]/20 transition-all">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex flex-1 items-center justify-between mr-4">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className={`w-4 h-4 ${chapter.progress === 100 ? 'text-green-500' : 'text-gray-300'}`} />
                                                            <span className="font-medium text-gray-700 text-sm text-left">{chapter.name}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                            {chapter.progress}%
                                                        </span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pb-4 pt-1">
                                                    <div className="space-y-4 pl-6">
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={chapter.progress} className="h-2 flex-1" indicatorClassName="bg-[#8b5cf6]" />
                                                        </div>
                                                        
                                                        <div className="grid gap-2">
                                                            {chapter.topics.map((topic, topicIndex) => (
                                                                <div key={topicIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                                                    {topic.completed ? (
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                                    ) : (
                                                                        <Circle className="w-3.5 h-3.5 text-gray-300" />
                                                                    )}
                                                                    <span className={topic.completed ? "text-gray-900" : ""}>{topic.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
const AiLearning = () => {
    // Pie Chart Data
    const pieData = [
        { name: 'Completed', value: 157, color: '#000000' },
        { name: 'In Progress', value: 21, color: '#e5e7eb' },
    ];

    return (
        <div className="space-y-6">
            {/* 1. Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-5">
                         <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-700 text-sm">AI Videos</span>
                            <Video className="w-5 h-5 text-gray-400" />
                         </div>
                         <div className="text-3xl font-bold text-gray-900 mb-1">156</div>
                         <div className="text-xs text-gray-500 mb-3">of 178</div>
                         <Progress value={88} className="h-2.5 bg-gray-100" indicatorClassName="bg-[#8b5cf6]" />
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-5">
                         <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-700 text-sm">Watch Time</span>
                            <Video className="w-5 h-5 text-gray-400" />
                         </div>
                         <div className="text-3xl font-bold text-gray-900 mb-1">117h</div>
                         <div className="text-xs text-gray-500 mb-3">7020 minutes</div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-5">
                         <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-700 text-sm">Podcasts</span>
                            <Headphones className="w-5 h-5 text-gray-400" />
                         </div>
                         <div className="text-3xl font-bold text-gray-900 mb-1">52</div>
                         <div className="text-xs text-gray-500 mb-3">26h listened</div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-5">
                         <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-700 text-sm">AI Queries</span>
                            <Brain className="w-5 h-5 text-gray-400" />
                         </div>
                         <div className="text-3xl font-bold text-gray-900 mb-1">345</div>
                         <div className="text-xs text-gray-500 mb-3">Total questions asked</div>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Video Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Video Completion Status */}
                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Video Completion Status</h3>
                        <div className="flex flex-col items-center">
                            <div className="h-[200px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={0}
                                            outerRadius={80}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center gap-6 mt-4">
                                 <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-black"></div>
                                    <span className="text-sm text-gray-600">Completed: 157</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-200"></div>
                                    <span className="text-sm text-gray-600">In Progress: 21</span>
                                 </div>
                            </div>
                            <div className="text-center mt-6">
                                <div className="text-3xl font-bold text-gray-900">88%</div>
                                <div className="text-sm text-gray-500">Average Completion Rate</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Videos Watched */}
                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Videos Watched</h3>
                        <div className="space-y-6">
                             {[
                                { title: "Quantum Mechanics Basics", subject: "Physics", duration: "55 min", progress: 100 },
                                { title: "Electrochemistry Advanced", subject: "Chemistry", duration: "60 min", progress: 95 },
                                { title: "Complex Numbers Mastery", subject: "Mathematics", duration: "50 min", progress: 100 }
                             ].map((video, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{video.title}</h4>
                                            <p className="text-xs text-gray-500">{video.subject} • {video.duration}</p>
                                        </div>
                                        <span className="bg-[#8b5cf6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {video.progress}%
                                        </span>
                                    </div>
                                    <Progress value={video.progress} className="h-2.5 bg-gray-100" indicatorClassName={video.progress === 100 ? "bg-[#8b5cf6]" : "bg-[#3b82f6]"} />
                                </div>
                             ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Doubt Clearing Activity */}
            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <HelpCircle className="w-5 h-5" />
                        Doubt Clearing Activity
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                <span className="text-gray-600 font-medium">Total Doubts</span>
                                <span className="text-xl font-bold text-gray-900">48</span>
                            </div>
                             <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                <span className="text-gray-600 font-medium">Resolved</span>
                                <span className="text-xl font-bold text-green-500">45</span>
                            </div>
                             <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                <span className="text-gray-600 font-medium">Pending</span>
                                <span className="text-xl font-bold text-orange-500">3</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                <span className="text-gray-600 font-medium">Avg Resolution Time</span>
                                <span className="text-xl font-bold text-gray-900">20m</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Recent Doubts</h4>
                            <div className="space-y-4">
                                 {[
                                    { question: "Explain Compton Effect in detail", subject: "Physics", status: "resolved" },
                                    { question: "Nernst Equation applications", subject: "Chemistry", status: "pending" },
                                    { question: "De Moivre's theorem proof", subject: "Mathematics", status: "resolved" }
                                 ].map((doubt, i) => (
                                    <div key={i} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="font-bold text-gray-900 text-sm line-clamp-1">{doubt.question}</h5>
                                        </div>
                                        <div className="flex justify-between items-center">
                                             <span className="text-xs text-gray-500">{doubt.subject}</span>
                                             <span className={`text-[10px] font-bold px-2 py-1 rounded-full text-white ${doubt.status === 'resolved' ? 'bg-[#8b5cf6]' : 'bg-[#3b82f6]'}`}>
                                                {doubt.status}
                                             </span>
                                        </div>
                                    </div>
                                 ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 4. Podcast Activity */}
            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <Headphones className="w-5 h-5" />
                        Podcast Activity
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                         <div className="bg-gray-50 p-4 rounded-xl">
                            <span className="text-sm text-gray-500 block mb-1">Total Listened</span>
                            <span className="text-2xl font-bold text-gray-900">52</span>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-xl">
                            <span className="text-sm text-gray-500 block mb-1">Total Time</span>
                            <span className="text-2xl font-bold text-gray-900">26h</span>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-xl">
                            <span className="text-sm text-gray-500 block mb-1">Favorite Topics</span>
                            <div className="flex gap-2 mt-1">
                                <span className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded-md">Physics Concepts</span>
                                <span className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded-md">JEE Strategy</span>
                            </div>
                         </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Recent Podcasts</h4>
                        <div className="space-y-3">
                            {[
                                { title: "Modern Physics Insights", subject: "Physics", duration: "35 min", date: "2025-10-15" },
                                { title: "JEE Exam Strategy 2025", subject: "General", duration: "30 min", date: "2025-10-13" },
                                { title: "Complex Numbers Tips", subject: "Mathematics", duration: "28 min", date: "2025-10-12" }
                            ].map((podcast, i) => (
                                 <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm mb-0.5">{podcast.title}</h5>
                                        <p className="text-xs text-gray-500">{podcast.subject} • {podcast.duration}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{podcast.date}</span>
                                 </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
const MyEngagement = () => {
    // Activity Score Trend Data
    const activityTrendData = Array.from({ length: 30 }, (_, i) => ({
        day: `Day ${i + 1}`,
        score: 80 + Math.random() * 20
    }));

    // Weekly Attendance Data
    const weeklyAttendanceData = [
        { week: 'Week 1', attended: 12, missed: 4 },
        { week: 'Week 2', attended: 11, missed: 5 },
        { week: 'Week 3', attended: 5, missed: 11 },
        { week: 'Week 4', attended: 6, missed: 10 },
    ];

    // Video Completion Data
    const videoCompletionData = [
        { name: 'Fully Watched', value: 156, color: '#000000' },
        { name: 'Partially Watched', value: 53, color: '#e5e7eb' },
        { name: 'Not Watched', value: 22, color: '#f3f4f6' },
    ];

    // Doubts by Subject Data
    const doubtsBySubjectData = [
        { subject: 'Physics', count: 18, color: '#8b5cf6' },
        { subject: 'Chemistry', count: 17, color: '#8b5cf6' },
        { subject: 'Mathematics', count: 13, color: '#8b5cf6' },
    ];

    return (
        <div className="space-y-6">
            {/* 1. Overall Score & Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Overall Activity Score */}
                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                        <h3 className="text-lg font-bold text-gray-900 w-full mb-4">Overall Activity Score</h3>
                        <div className="relative w-48 h-48 flex items-center justify-center">
                             {/* Mock Radial Chart using SVG */}
                             <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    stroke="#f3f4f6"
                                    strokeWidth="24"
                                    fill="transparent"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    stroke="black"
                                    strokeWidth="24"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 80}
                                    strokeDashoffset={2 * Math.PI * 80 * (1 - 0.88)}
                                    strokeLinecap="round"
                                />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-gray-900">88</span>
                                <span className="text-xs text-gray-500">Activity Score</span>
                             </div>
                        </div>
                        <div className="mt-4 flex flex-col items-center gap-2">
                            <span className="bg-green-100 text-green-700 text-sm font-bold px-4 py-1 rounded-full">
                                Excellent
                            </span>
                            <span className="text-sm text-gray-500">Class Average: 75</span>
                            <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                                <TrendingUp className="w-4 h-4" />
                                Above Average
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Breakdown */}
                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Activity Breakdown</h3>
                        <div className="space-y-6">
                            {[
                                { label: "Live Class Participation", value: 90 },
                                { label: "Ai Video Engagement", value: 88 },
                                { label: "Podcast Listening", value: 85 },
                                { label: "Mcq Practice", value: 91 },
                                { label: "Doubt Clearing", value: 86 },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                        <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                                    </div>
                                    <Progress value={item.value} className="h-2.5 bg-gray-100" indicatorClassName="bg-[#8b5cf6]" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Activity Score Trend */}
            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Activity Score Trend (Last 30 Days)</h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={activityTrendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="day" 
                                    hide={false} 
                                    axisLine={true} 
                                    tickLine={true} 
                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                    interval={1} // Show every 2nd label to avoid crowding
                                    tickFormatter={(value) => {
                                         // Show specific labels or simplify
                                         const dayNum = parseInt(value.split(' ')[1]);
                                         return dayNum % 2 === 0 ? value : '';
                                    }}
                                />
                                <YAxis 
                                    hide={false}
                                    domain={[0, 100]}
                                    axisLine={true}
                                    tickLine={true}
                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="#8b5cf6" 
                                    strokeWidth={2} 
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Live Class & Weekly Attendance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Live Class Participation */}
                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                            <Video className="w-5 h-5 text-gray-700" />
                            Live Class Participation
                        </h3>
                        
                        <div className="flex justify-between items-center mb-8 px-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">54</div>
                                <div className="text-xs text-gray-500">Attended</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">6</div>
                                <div className="text-xs text-gray-500">Missed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-500">90%</div>
                                <div className="text-xs text-gray-500">Attendance</div>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-red-500 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Missed Classes Alert</h4>
                                <p className="text-xs text-gray-500">6 classes missed recently</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Weekly Attendance */}
                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Attendance</h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyAttendanceData} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="attended" fill="#000000" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar dataKey="missed" fill="#f3f4f6" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 4. AI Video Engagement & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                            <Video className="w-5 h-5 text-gray-700" />
                            AI Video Engagement
                        </h3>
                        
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-500">Videos Watched</span>
                                <span className="font-bold text-gray-900 text-sm">156 / 178</span>
                            </div>
                            <Progress value={88} className="h-2.5 bg-gray-100" indicatorClassName="bg-[#8b5cf6]" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold text-gray-900">117h</div>
                                <div className="text-xs text-gray-500">Watch Time</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold text-gray-900">88%</div>
                                <div className="text-xs text-gray-500">Completion Rate</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Video Completion Distribution</h3>
                        <div className="flex items-center justify-between">
                             <div className="h-[160px] w-[160px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={videoCompletionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={0}
                                            outerRadius={80}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {videoCompletionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 pl-8 space-y-3">
                                <div className="text-sm font-medium text-gray-900">Fully Watched: 156</div>
                                <div className="text-sm font-medium text-gray-500">Partially Watched: 53</div>
                                <div className="text-sm font-medium text-gray-300">Not Watched: 22</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 5. Podcast & MCQ Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                            <Headphones className="w-5 h-5 text-gray-700" />
                            Podcast Consumption
                        </h3>
                         <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold text-gray-900">52</div>
                                <div className="text-xs text-gray-500">Episodes</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold text-gray-900">26h</div>
                                <div className="text-xs text-gray-500">Listen Time</div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Favorite Topics</h4>
                            <div className="flex gap-2 flex-wrap">
                                <span className="bg-[#3b82f6] text-white text-xs px-3 py-1 rounded-full font-medium">Physics Concepts</span>
                                <span className="bg-[#3b82f6] text-white text-xs px-3 py-1 rounded-full font-medium">JEE Strategy</span>
                                <span className="bg-[#3b82f6] text-white text-xs px-3 py-1 rounded-full font-medium">Math Problem Solving</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                            <BookOpen className="w-5 h-5 text-gray-700" />
                            MCQ Practice Stats
                        </h3>
                         <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold text-gray-900">780</div>
                                <div className="text-xs text-gray-500">Questions</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold text-green-500">87%</div>
                                <div className="text-xs text-gray-500">Accuracy</div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900">Accuracy by Subject</h4>
                             {[
                                { label: "Physics", value: 90 },
                                { label: "Chemistry", value: 84 },
                                { label: "Mathematics", value: 87 },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500">{item.label}</span>
                                        <span className="text-xs font-bold text-gray-900">{item.value}%</span>
                                    </div>
                                    <Progress value={item.value} className="h-1.5 bg-gray-100" indicatorClassName="bg-[#8b5cf6]" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 6. Doubt Clearing Activity */}
            <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <HelpCircle className="w-5 h-5 text-gray-700" />
                        Doubt Clearing Activity
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-gray-900">48</div>
                                    <div className="text-xs text-gray-500">Total</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-green-500">45</div>
                                    <div className="text-xs text-gray-500">Resolved</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-orange-500">3</div>
                                    <div className="text-xs text-gray-500">Pending</div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <span className="text-xs text-gray-500 block mb-1">Avg Resolution Time</span>
                                <span className="text-2xl font-bold text-gray-900">20 min</span>
                            </div>
                        </div>

                         <div className="h-[180px] w-full">
                             <div className="text-sm font-medium text-gray-900 mb-4">Doubts by Subject</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={doubtsBySubjectData} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="mt-8">
                         <h4 className="text-sm font-medium text-gray-900 mb-4">Pending Doubts</h4>
                         <div className="border border-orange-100 bg-orange-50 rounded-xl p-4 flex items-start gap-3">
                            <HelpCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                            <div>
                                <h5 className="font-bold text-gray-900 text-sm">Nernst Equation applications</h5>
                                <p className="text-xs text-gray-500">Chemistry • 15/10/2025</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const TABS = [
  { id: "overview", label: "Overview", icon: BarChartIcon },
  { id: "progress", label: "My Progress", icon: Activity },
  { id: "tests", label: "My Tests", icon: CheckCircle },
  { id: "attendance", label: "My Attendance", icon: Clock3 },
  { id: "timetable", label: "My Timetable", icon: CalendarRange },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "ai", label: "AI & Learning", icon: Brain },
  { id: "engagement", label: "My Engagement", icon: Sparkles },
];

import { BottomNav } from "@/components/BottomNav";

export default function DetailedProgress() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [activeTab, setActiveTab] = useState("overview");
  const params = new URLSearchParams(search);
  const showNav = params.get("nav") === "true";

  useEffect(() => {
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [search]);

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <Overview />;
      case "progress": return <MyProgress />;
      case "tests": return <MyTests />;
      case "attendance": return <MyAttendance />;
      case "timetable": return <MyTimetable />;
      case "courses": return <MyCourses />;
      case "ai": return <AiLearning />;
      case "engagement": return <MyEngagement />;
      default: return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/dashboard")}
            className="-ml-2"
        >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Detailed Progress</h1>
      </div>

      <div className="pt-4 pb-0 px-4 space-y-6">
        {/* User Info Card */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-shrink-0">
                 <Avatar className="w-20 h-20 border-2 border-gray-100">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback className="text-2xl text-gray-700 bg-gray-200">P</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        Pramod Kumar
                        <span className="bg-[#8b5cf6] text-white text-xs px-3 py-1 rounded-full font-medium">
                            active
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>pramod0605@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>+91-9876500605</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Enrolled: 2024-01-10</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Last active: 16/10/2025</span>
                    </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Choice Chips */}
      <div className="sticky top-[72px] bg-gray-50 z-10 pt-4 pb-2">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-3 px-4 pb-4">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                activeTab === tab.id 
                                ? "bg-primary text-white shadow-lg shadow-primary/25" 
                                : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* Tab Content */}
      <div className={`px-4 pb-8 min-h-[300px] ${showNav ? 'pb-24' : ''}`}>
        {renderContent()}
      </div>

      {showNav && <BottomNav />}
    </div>
  );
}
