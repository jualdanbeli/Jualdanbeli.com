import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

const API_BASE = "/api";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: emailOrPhone.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Terjadi kesalahan");
      }
      setSent(true);
    } catch (err: any) {
      toast({ title: "Gagal mengirim", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke halaman login
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">jb</span>
            </div>
            <span className="font-bold text-xl text-foreground">jualdanbeli</span>
          </div>

          {sent ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-8 pb-6 text-center">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-green-800 mb-2">Email Terkirim!</h2>
                <p className="text-green-700 text-sm mb-1">
                  Jika akun dengan <strong>{emailOrPhone}</strong> terdaftar, link reset password telah dikirim ke email yang terdaftar.
                </p>
                <p className="text-green-600 text-xs mt-3">Link berlaku selama <strong>1 jam</strong>. Cek folder Spam jika tidak masuk ke Inbox.</p>
                <Button asChild className="mt-6 w-full">
                  <Link href="/login">Kembali ke Login</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Lupa Password?</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Masukkan email atau nomor HP yang terdaftar. Kami akan kirimkan link reset password ke email kamu.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailOrPhone">Email atau Nomor HP</Label>
                    <Input
                      id="emailOrPhone"
                      type="text"
                      placeholder="contoh@email.com atau 08xx-xxxx-xxxx"
                      value={emailOrPhone}
                      onChange={e => setEmailOrPhone(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full font-semibold" disabled={loading || !emailOrPhone.trim()}>
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengirim...</>
                    ) : (
                      <><Mail className="w-4 h-4 mr-2" />Kirim Link Reset Password</>
                    )}
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                  💡 <strong>Tidak dapat email?</strong> Pastikan email yang dimasukkan sama dengan email saat mendaftar, dan cek folder <em>Spam</em> atau <em>Promosi</em>.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Branding side */}
      <div className="hidden md:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 opacity-90 z-0" />
        <div className="relative z-10 text-primary-foreground max-w-lg">
          <h2 className="text-4xl font-extrabold mb-6">Keamanan Akun Anda.</h2>
          <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
            Reset password aman dalam hitungan menit. Link dikirim langsung ke email terdaftar.
          </p>
          <div className="space-y-4">
            {[
              "Link berlaku 1 jam — aman dari penyalahgunaan",
              "Tidak perlu menghubungi admin",
              "Password baru langsung aktif setelah reset",
            ].map(text => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
