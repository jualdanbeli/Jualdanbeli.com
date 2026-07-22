import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { useRegister, RegisterInput, RegisterInputRole } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store, Loader2, User, ShoppingBag } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(9, "Please enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["buyer", "seller"] as const),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "buyer",
    },
  });

  function onSubmit(data: RegisterInput) {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        setToken(res.token);
        toast({
          title: "Account created!",
          description: "Welcome to jualdanbeli.",
        });
        setLocation(res.user.role === "seller" ? "/seller/dashboard" : "/");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error?.response?.data?.error || "Something went wrong. Please try again.",
        });
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      <div className="w-full md:w-1/2 lg:w-5/12 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 mt-8 md:mt-0">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">
              jualdanbeli
            </span>
          </div>

          <Card className="border-none shadow-xl bg-white">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>
                Join Indonesia's most trusted marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>I want to...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="buyer" className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                                <User className="mb-2 h-6 w-6" />
                                <span className="font-semibold">Buy</span>
                                <span className="text-[10px] text-muted-foreground mt-1 text-center font-normal">Shop from millions of products</span>
                              </FormLabel>
                            </FormItem>
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="seller" className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                                <ShoppingBag className="mb-2 h-6 w-6" />
                                <span className="font-semibold">Sell</span>
                                <span className="text-[10px] text-muted-foreground mt-1 text-center font-normal">Open a shop and start earning</span>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Budi Santoso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="budi@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="081234567890" type="tel" {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormDescription>Must be at least 8 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-6" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Create Account
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t pt-6 pb-2">
              <div className="text-sm text-center text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Masuk
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      <div className="hidden md:block flex-1 bg-muted relative overflow-hidden">
        {/* We can use an image here for visual impact */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-teal-800 opacity-90 z-10 mix-blend-multiply"></div>
        <img 
          src="https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&q=80&w=2000" 
          alt="Marketplace background" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-20 h-full flex flex-col justify-center p-16 text-white max-w-xl">
          <h2 className="text-4xl font-extrabold mb-6">Discover the richness of Indonesia.</h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            From local crafts to the latest electronics. Join the community that brings buyers and sellers together in a safe, vibrant digital market.
          </p>
        </div>
      </div>
    </div>
  );
}
