import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

const API_BASE = "/api";

export default function ResetPassword() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
    else setError("Token tidak ditemukan. Minta link reset password baru.");
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast({ title: "Password tidak cocok", description: "Pastikan konfirmasi password sama", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password terlalu pendek", description: "Minimal 8 karakter", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mereset password");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">jb</span>
            </div>
            <span className="font-bold text-xl text-foreground">jualdanbeli</span>
          </div>

          {success ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-8 pb-6 text-center">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-green-800 mb-2">Password Berhasil Direset!</h2>
                <p className="text-green-700 text-sm mb-4">
                  Password baru Anda sudah aktif. Silakan login dengan password baru.
                </p>
                <Button asChild className="w-full">
                  <Link href="/login">Masuk Sekarang</Link>
                </Button>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-8 pb-6 text-center">
                <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-800 mb-2">Link Tidak Valid</h2>
                <p className="text-red-700 text-sm mb-4">{error}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/forgot-password">Minta Link Baru</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Buat Password Baru</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Masukkan password baru untuk akun Anda.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Password Baru</Label>
                    <div className="relative">
                      <Input
                        type={showPw ? "text" : "password"}
                        placeholder="Minimal 8 karakter"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPassword && newPassword.length < 8 && (
                      <p className="text-xs text-destructive">Minimal 8 karakter</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Konfirmasi Password Baru</Label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Ketik ulang password baru"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirm && newPassword !== confirm && (
                      <p className="text-xs text-destructive">Password tidak cocok</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-semibold"
                    disabled={loading || !newPassword || !confirm || newPassword !== confirm || newPassword.length < 8}
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Simpan Password Baru
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Ingat password?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Masuk</Link>
          </p>
        </div>
      </div>

      {/* Branding side */}
      <div className="hidden md:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 opacity-90 z-0" />
        <div className="relative z-10 text-primary-foreground max-w-lg">
          <h2 className="text-4xl font-extrabold mb-6">Akun Anda Aman.</h2>
          <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
            Buat password baru yang kuat untuk melindungi akun jualdanbeli Anda.
          </p>
          <div className="space-y-4">
            {[
              "Gunakan kombinasi huruf, angka & simbol",
              "Minimal 8 karakter untuk keamanan optimal",
              "Jangan bagikan password kepada siapapun",
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
