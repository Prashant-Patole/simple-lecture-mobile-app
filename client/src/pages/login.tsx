import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setLocation("/home");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Welcome back! <span className="text-2xl">✌️</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Login to your account and enjoy learning..
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-14 rounded-2xl border-gray-100 hover:bg-gray-50 hover:border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
              {/* <span className="font-medium text-gray-700">Google</span> */}
            </div>
          </Button>
          <Button variant="outline" className="h-14 rounded-2xl border-gray-100 hover:bg-gray-50 hover:border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-6 h-6" />
              {/* <span className="font-medium text-gray-700">Facebook</span> */}
            </div>
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input 
                        placeholder="instructor@demo.com" 
                        {...field} 
                        className="pl-12 h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="........" 
                        {...field} 
                        className="pl-12 pr-12 h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="button" 
              onClick={() => setLocation("/home")}
              className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 mt-4"
            >
              Login
            </Button>
          </form>
        </Form>

        <div className="text-center text-xs text-muted-foreground px-8 leading-relaxed">
          By using our services, you agree to our <a href="#" className="underline">Terms & Policies</a>
        </div>
      </div>

      <div className="space-y-6 mt-8 mb-4 text-center">
        <div className="text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/" className="font-semibold text-foreground hover:underline">Sign up</Link>
        </div>
        
        <div className="text-sm">
          <a href="#" className="font-medium text-muted-foreground hover:text-primary transition-colors">Forget Password</a>
        </div>
      </div>
      
      {/* Decorative circle */}
      <div className="absolute top-[20%] right-[-30%] w-[300px] h-[300px] rounded-full bg-primary/5 -z-10 blur-3xl pointer-events-none" />
    </div>
  );
}
