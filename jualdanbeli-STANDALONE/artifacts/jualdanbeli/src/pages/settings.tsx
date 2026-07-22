import { useUpdateUser } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, KeyRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const API_BASE = "/api";

async function changePassword(token: string, currentPassword: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/users/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal mengubah password");
  return data;
}

export default function Settings() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token") || "";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    shopName: "",
    shopDescription: "",
    city: "",
  });

  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: "",
        shopName: user.sellerInfo?.shopName || "",
        shopDescription: user.sellerInfo?.shopDescription || "",
        city: user.sellerInfo?.city || "",
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    updateUser.mutate({ userId: user.id, data: formData }, {
      onSuccess: () => {
        toast({ title: "Profil berhasil diperbarui!" });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Gagal memperbarui profil", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      toast({ title: "Password baru tidak cocok", description: "Pastikan konfirmasi password sama dengan password baru", variant: "destructive" });
      return;
    }
    if (pwForm.newPw.length < 8) {
      toast({ title: "Password terlalu pendek", description: "Minimal 8 karakter", variant: "destructive" });
      return;
    }
    setChangingPw(true);
    try {
      await changePassword(token, pwForm.current, pwForm.newPw);
      toast({ title: "Password berhasil diubah! 🔐", description: "Gunakan password baru Anda untuk login berikutnya" });
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err: any) {
      toast({ title: "Gagal mengubah password", description: err.message, variant: "destructive" });
    } finally {
      setChangingPw(false);
    }
  };

  const Layout = user?.role === "seller" ? SellerLayout : MainLayout;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Pengaturan Akun</h1>

        <div className="space-y-8">
          {/* Informasi Profil */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pribadi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Alamat Email</Label>
                  <Input value={user?.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email tidak dapat diubah.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nama lengkap Anda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomor HP</Label>
                    <Input
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08xx-xxxx-xxxx"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Alamat Pengiriman Default</Label>
                  <Textarea
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Alamat lengkap untuk pengiriman..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {user?.role === "seller" && (
              <Card>
                <CardHeader>
                  <CardTitle>Detail Toko</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Toko</Label>
                      <Input
                        value={formData.shopName}
                        onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                        placeholder="Nama toko Anda"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Kota / Asal</Label>
                      <Input
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="contoh: Jakarta Selatan"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Deskripsi Toko</Label>
                    <Textarea
                      value={formData.shopDescription}
                      onChange={e => setFormData({ ...formData, shopDescription: e.target.value })}
                      placeholder="Ceritakan apa yang Anda jual kepada pembeli..."
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={updateUser.isPending}>
                {updateUser.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Simpan Perubahan
              </Button>
            </div>
          </form>

          {/* Ganti Password */}
          <form onSubmit={handleChangePassword}>
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Ganti Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Password Lama</Label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      placeholder="Masukkan password saat ini"
                      value={pwForm.current}
                      onChange={e => setPwForm({ ...pwForm, current: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Password Baru</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      placeholder="Minimal 8 karakter"
                      value={pwForm.newPw}
                      onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwForm.newPw && pwForm.newPw.length < 8 && (
                    <p className="text-xs text-destructive">Password minimal 8 karakter</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Konfirmasi Password Baru</Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ketik ulang password baru"
                      value={pwForm.confirm}
                      onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                    <p className="text-xs text-destructive">Password tidak cocok</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={changingPw || !pwForm.current || !pwForm.newPw || !pwForm.confirm}
                    className="w-full sm:w-auto"
                  >
                    {changingPw ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                    Ubah Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </Layout>
  );
}
