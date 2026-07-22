import { useCreateProduct, useGetCategories } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImagePlus, Upload, X, Link as LinkIcon } from "lucide-react";

const API_BASE = "/api";

async function uploadImageFile(file: File, token: string): Promise<string> {
  const urlRes = await fetch(`${API_BASE}/storage/uploads/request-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!urlRes.ok) throw new Error("Gagal mendapatkan URL upload");
  const { uploadURL, objectPath } = await urlRes.json();

  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadRes.ok) throw new Error("Gagal upload gambar");

  return `${API_BASE}/storage${objectPath}`;
}

export default function ProductForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createProduct = useCreateProduct();
  const { data: categories } = useGetCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token") || "";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    condition: "new" as "new" | "used",
    categoryId: "",
    images: [] as string[],
    imageUrl: "",
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.categoryId || formData.images.length === 0) {
      toast({ title: "Form belum lengkap", description: "Isi semua field wajib dan tambahkan minimal 1 gambar.", variant: "destructive" });
      return;
    }

    createProduct.mutate({
      data: {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        condition: formData.condition,
        categoryId: parseInt(formData.categoryId),
        images: formData.images,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Produk berhasil dipublikasikan! 🎉" });
        setLocation("/seller/products");
      },
      onError: (err: any) => {
        toast({ title: "Gagal membuat produk", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 5 - formData.images.length;
    const toUpload = files.slice(0, remaining);

    setUploadingImages(true);
    const uploaded: string[] = [];
    for (const file of toUpload) {
      try {
        const url = await uploadImageFile(file, token);
        uploaded.push(url);
      } catch {
        toast({ title: `Gagal upload ${file.name}`, variant: "destructive" });
      }
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
    setUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addImageByUrl = () => {
    if (formData.imageUrl && formData.images.length < 5) {
      setFormData(prev => ({ ...prev, images: [...prev.images, prev.imageUrl], imageUrl: "" }));
    }
  };

  return (
    <SellerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Tambah Produk Baru</h1>
        <p className="text-muted-foreground">Isi detail produk untuk dijual di toko Anda.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Informasi Dasar</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Produk *</Label>
                  <Input
                    placeholder="contoh: Sepatu Sneakers Pria Original Nike"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kategori *</Label>
                  <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Deskripsi Produk *</Label>
                  <Textarea
                    placeholder="Jelaskan produk Anda secara detail — ukuran, bahan, warna, kondisi, dll."
                    className="min-h-[150px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Harga & Stok</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Harga (IDR) *</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stok *</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Kondisi *</Label>
                  <Select value={formData.condition} onValueChange={(v: "new" | "used") => setFormData({ ...formData, condition: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kondisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Baru</SelectItem>
                      <SelectItem value="used">Bekas / Second</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle>Foto Produk *</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {/* Upload from device */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" />Upload dari Perangkat</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={formData.images.length >= 5 || uploadingImages}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={formData.images.length >= 5 || uploadingImages}
                  >
                    {uploadingImages ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengupload...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" />Pilih Foto</>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">atau</span>
                  </div>
                </div>

                {/* Add via URL */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" />Masukkan URL Gambar</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addImageByUrl}
                      disabled={!formData.imageUrl || formData.images.length >= 5}
                    >
                      Tambah
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">{formData.images.length}/5 foto ditambahkan</p>

                {/* Image grid */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden relative group border">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Utama</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImages}
                      className="aspect-square bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      <ImagePlus className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-xs font-medium">Tambah Foto</span>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full font-bold text-lg py-6" disabled={createProduct.isPending || uploadingImages}>
              {createProduct.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              Publikasikan Produk
            </Button>
          </div>
        </div>
      </form>
    </SellerLayout>
  );
}
