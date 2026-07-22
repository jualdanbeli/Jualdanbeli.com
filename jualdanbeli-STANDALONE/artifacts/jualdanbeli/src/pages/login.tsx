import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { useLogin, LoginInput } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Masukkan email yang valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: LoginInput) {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        setToken(res.token);
        toast({ title: "Berhasil masuk!", description: "Selamat datang kembali." });
        setLocation(res.user.role === "admin" ? "/admin" : (res.user.role === "seller" ? "/seller/dashboard" : "/"));
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Login gagal",
          description: "Email atau password salah. Coba lagi.",
        });
      }
    });
  }

  function fillAdmin() {
    form.setValue("email", "radjapamungkas007@gmail.com");
    form.setValue("password", "Admin123!");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      {/* Form side */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">jualdanbeli</span>
          </Link>

          <Card className="border-none shadow-xl bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">Masuk ke Akun</CardTitle>
              <p className="text-sm text-muted-foreground">Masukkan email dan password kamu</p>
            </CardHeader>

            <CardContent className="pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="contoh@email.com"
                            type="email"
                            autoComplete="email"
                            className="h-11"
                            {...field}
                          />
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
                          <div className="relative">
                            <Input
                              placeholder="Masukkan password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              className="h-11 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-11 font-semibold text-base" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Masuk
                  </Button>
                </form>
              </Form>

              {/* Quick fill admin */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs font-semibold text-blue-800 mb-2">Masuk sebagai Operator/Admin:</p>
                <div className="text-xs text-blue-700 space-y-0.5 mb-2">
                  <div>Email: <span className="font-mono font-semibold">radjapamungkas007@gmail.com</span></div>
                  <div>Password: <span className="font-mono font-semibold">Admin123!</span></div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 text-xs h-8"
                  onClick={fillAdmin}
                >
                  Isi Otomatis & Masuk sebagai Admin
                </Button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-0">
              <div className="text-sm text-center">
                <Link href="/forgot-password" className="text-muted-foreground hover:text-primary hover:underline transition-colors">
                  Lupa password?
                </Link>
              </div>
              <div className="text-sm text-center text-muted-foreground">
                Belum punya akun?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Daftar sekarang
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Branding side */}
      <div className="hidden md:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 opacity-90 z-0" />
        <div className="relative z-10 text-primary-foreground max-w-lg">
          <h2 className="text-4xl font-extrabold mb-6">Jual & Beli dengan Aman.</h2>
          <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
            Platform marketplace Indonesia dengan sistem Rekening Bersama (Escrow) — uang aman hingga barang diterima.
          </p>
          <div className="space-y-4">
            {[
              "Pembayaran 100% Aman via Escrow",
              "Pengiriman ke Seluruh Indonesia",
              "Terdaftar OSS · NIB 2403240017145",
            ].map(text => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
