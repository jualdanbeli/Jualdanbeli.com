import { MainLayout } from "@/components/layout/MainLayout";
import { JDBLogo } from "@/components/JDBLogo";
import { Button } from "@/components/ui/button";
import { Shield, Award, FileText, Download, Globe, Lock, CheckCircle2, Star } from "lucide-react";

const OWNER = {
  nama: "Hari Muhammad Hamzah",
  merek: "J&B™ jualdanbeli™",
  tanggalPendaftaran: "17 Juli 2024",
  nib: "2403240017145",
  negara: "Indonesia",
};

function printCertificate() {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>Sertifikat Kepemilikan Merek – J&B jualdanbeli</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #fff; color: #111; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm 18mm; border: 12px solid #111; position: relative; }
  .border-inner { position: absolute; inset: 18px; border: 3px solid #FF3C00; pointer-events: none; }
  .header { text-align: center; margin-bottom: 10mm; }
  .logo-box { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6mm; }
  .logo-text { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
  .tm { color: #FF3C00; font-size: 14px; vertical-align: super; }
  .sub { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #FF3C00; }
  h1 { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
  .divider { width: 80mm; height: 3px; background: linear-gradient(90deg,#FF3C00,#111,#FF3C00); margin: 4mm auto; }
  .subtitle { font-size: 13px; color: #555; letter-spacing: 1px; }
  .body { margin: 8mm 0; }
  .body p { font-size: 13px; line-height: 1.8; color: #333; margin-bottom: 3mm; }
  .name { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #111; text-align: center; margin: 8mm 0; border-bottom: 2px solid #111; padding-bottom: 3mm; }
  .brand-box { background: #111; color: #fff; border-radius: 8px; padding: 6mm 8mm; margin: 6mm 0; text-align: center; }
  .brand-name { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: #FF3C00; }
  .brand-sub { font-size: 10px; letter-spacing: 3px; color: #aaa; margin-top: 2px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin: 6mm 0; }
  .field { background: #f8f8f8; border: 1px solid #ddd; border-radius: 4px; padding: 3mm 4mm; }
  .field-label { font-size: 9px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px; }
  .field-value { font-size: 13px; font-weight: 600; color: #111; margin-top: 1mm; }
  .rights { background: #fff8f5; border: 1px solid #FF3C00; border-radius: 6px; padding: 5mm; margin: 6mm 0; }
  .rights h3 { font-size: 11px; font-weight: 700; color: #FF3C00; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2mm; }
  .rights ul { list-style: none; padding: 0; }
  .rights li { font-size: 11px; color: #333; padding: 1mm 0; padding-left: 4mm; position: relative; }
  .rights li::before { content: "✓"; position: absolute; left: 0; color: #FF3C00; font-weight: 700; }
  .footer { margin-top: 10mm; display: flex; justify-content: space-between; align-items: flex-end; }
  .sign-box { text-align: center; }
  .sign-line { width: 50mm; height: 1px; background: #111; margin: 12mm auto 2mm; }
  .sign-name { font-size: 11px; font-weight: 700; }
  .sign-title { font-size: 9px; color: #777; }
  .seal { width: 30mm; height: 30mm; border: 3px solid #FF3C00; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; }
  .seal-inner { font-size: 8px; text-align: center; font-weight: 700; color: #FF3C00; text-transform: uppercase; line-height: 1.4; }
  .notice { font-size: 9px; color: #999; text-align: center; margin-top: 8mm; border-top: 1px solid #eee; padding-top: 4mm; }
</style>
</head>
<body>
<div class="page">
  <div class="border-inner"></div>
  <div class="header">
    <div class="logo-box">
      <div>
        <div class="logo-text">J<span style="color:#FF3C00">&amp;</span>B<span class="tm">™</span></div>
        <div class="sub">jualdanbeli</div>
      </div>
    </div>
    <h1>Sertifikat Kepemilikan Merek</h1>
    <div class="divider"></div>
    <p class="subtitle">CERTIFICATE OF BRAND OWNERSHIP &amp; INTELLECTUAL PROPERTY DECLARATION</p>
  </div>

  <div class="body">
    <p>Sertifikat ini menyatakan bahwa merek dagang <strong>J&amp;B™</strong> dan <strong>jualdanbeli™</strong> beserta seluruh aset visual, logo, dan identitas merek yang terdapat dalam platform marketplace ini adalah sepenuhnya dimiliki oleh:</p>

    <div class="name">${OWNER.nama}</div>

    <div class="brand-box">
      <div class="brand-name">J&amp;B™ jualdanbeli™</div>
      <div class="brand-sub">Merek Dagang Resmi · Registered Trademark</div>
    </div>

    <div class="grid">
      <div class="field">
        <div class="field-label">Nama Pemilik</div>
        <div class="field-value">${OWNER.nama}</div>
      </div>
      <div class="field">
        <div class="field-label">Nomor Induk Berusaha (NIB)</div>
        <div class="field-value">${OWNER.nib}</div>
      </div>
      <div class="field">
        <div class="field-label">Merek Terdaftar</div>
        <div class="field-value">J&amp;B™ · jualdanbeli™</div>
      </div>
      <div class="field">
        <div class="field-label">Tanggal Deklarasi</div>
        <div class="field-value">${new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
      <div class="field">
        <div class="field-label">Negara Asal</div>
        <div class="field-value">Republik Indonesia</div>
      </div>
      <div class="field">
        <div class="field-label">Kelas Merek (DJKI)</div>
        <div class="field-value">Kelas 35 · Kelas 38 · Kelas 42</div>
      </div>
    </div>

    <div class="rights">
      <h3>Hak Eksklusif Pemilik Merek</h3>
      <ul>
        <li>Hak tunggal penggunaan logo J&amp;B, nama "jualdanbeli", dan seluruh identitas visual merek</li>
        <li>Hak eksklusif atas dashboard operator dan pengelolaan platform marketplace</li>
        <li>Hak menetapkan tarif layanan, komisi, dan kebijakan platform</li>
        <li>Hak penuh atas seluruh kode sumber dan aset digital platform</li>
        <li>Hak lisensi kepada pihak ketiga atas persetujuan tertulis pemilik</li>
        <li>Perlindungan hukum atas pelanggaran HKI berdasarkan UU No. 20 Tahun 2016 tentang Merek</li>
      </ul>
    </div>
  </div>

  <div class="footer">
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-name">${OWNER.nama}</div>
      <div class="sign-title">Pemilik &amp; Pemegang Hak Merek</div>
    </div>
    <div class="seal">
      <div class="seal-inner">J&amp;B<br/>RESMI<br/>™<br/>2024</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-name">Platform Administrator</div>
      <div class="sign-title">Sistem jualdanbeli</div>
    </div>
  </div>

  <div class="notice">
    Dokumen ini merupakan deklarasi kepemilikan merek internal. Untuk perlindungan hukum penuh, daftarkan merek Anda di DJKI (djki.kemenkumham.go.id).<br/>
    © ${new Date().getFullYear()} J&amp;B™ jualdanbeli™ — Semua hak cipta dilindungi. Dilarang menggandakan atau menggunakan merek ini tanpa izin tertulis dari pemilik.
  </div>
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}

export default function MerekPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <JDBLogo size="lg" variant="full" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-4">Kepemilikan Merek Dagang</h1>
          <p className="text-muted-foreground mt-2">Identitas &amp; Hak Kekayaan Intelektual Platform</p>
        </div>

        {/* Certificate Card */}
        <div className="relative border-4 border-gray-900 rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-2 border-2 border-orange-500 rounded-xl pointer-events-none z-10" />
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-2">
                <Award className="w-12 h-12 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">Sertifikat Kepemilikan Merek</h2>
              <div className="h-1 w-40 mx-auto bg-gradient-to-r from-orange-500 via-white to-orange-500 mt-3 rounded" />
            </div>

            <p className="text-gray-300 text-center text-sm mb-6">
              Menyatakan bahwa merek dagang <strong className="text-orange-400">J&amp;B™</strong> dan{" "}
              <strong className="text-orange-400">jualdanbeli™</strong> sepenuhnya dimiliki oleh:
            </p>

            <div className="text-center mb-8">
              <div className="inline-block border-b-2 border-white pb-2">
                <p className="text-4xl font-black text-white" style={{fontFamily:"Georgia, serif"}}>
                  {OWNER.nama}
                </p>
              </div>
              <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mt-2">Pemilik &amp; Pemegang Hak Eksklusif</p>
            </div>

            <div className="bg-orange-500/20 border border-orange-500/40 rounded-xl p-4 text-center mb-8">
              <p className="text-4xl font-black text-orange-400">J&amp;B™</p>
              <p className="text-lg font-bold text-white mt-1">jualdanbeli™</p>
              <p className="text-xs text-orange-300/70 uppercase tracking-widest mt-1">Merek Dagang Resmi</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {[
                { label: "Pemilik", value: OWNER.nama },
                { label: "NIB", value: OWNER.nib },
                { label: "Merek", value: "J&B™ · jualdanbeli™" },
                { label: "Negara", value: "Republik Indonesia" },
                { label: "Tanggal Deklarasi", value: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
                { label: "Kelas DJKI", value: "35 · 38 · 42" },
              ].map((f) => (
                <div key={f.label} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{f.label}</p>
                  <p className="text-sm font-semibold text-white mt-1">{f.value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-end">
              <div className="text-center">
                <div className="w-40 h-px bg-white mb-2" />
                <p className="text-xs font-bold text-white">{OWNER.nama}</p>
                <p className="text-[10px] text-gray-400">Pemilik Merek</p>
              </div>
              <div className="w-16 h-16 rounded-full border-2 border-orange-500 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[8px] font-black text-orange-400 uppercase leading-tight">J&amp;B<br/>RESMI<br/>™</p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-40 h-px bg-white mb-2" />
                <p className="text-xs font-bold text-white">Platform Administrator</p>
                <p className="text-[10px] text-gray-400">Sistem jualdanbeli</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center mb-10">
          <Button size="lg" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8" onClick={printCertificate}>
            <Download className="w-5 h-5" />
            Download / Cetak Sertifikat
          </Button>
        </div>

        {/* Rights Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-orange-500" />
              <h3 className="font-bold text-lg">Hak Eksklusif Pemilik</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Hak tunggal penggunaan logo J&B dan nama jualdanbeli",
                "Hak eksklusif atas dashboard operator platform",
                "Hak menetapkan tarif, komisi, dan kebijakan platform",
                "Hak penuh atas seluruh kode sumber & aset digital",
                "Hak lisensi kepada pihak ketiga atas persetujuan pemilik",
              ].map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: r }} />
                </li>
              ))}
            </ul>
          </div>

          <div className="border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-blue-500" />
              <h3 className="font-bold text-lg">Perlindungan Hukum</h3>
            </div>
            <ul className="space-y-2">
              {[
                "UU No. 20 Tahun 2016 tentang Merek dan Indikasi Geografis",
                "UU No. 28 Tahun 2014 tentang Hak Cipta",
                "UU No. 11 Tahun 2008 tentang ITE",
                "Perlindungan merek di seluruh wilayah NKRI",
                "Dasar pendaftaran resmi di DJKI Kemenkumham RI",
              ].map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* DJKI Registration CTA */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Star className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Daftarkan Merek Secara Resmi di DJKI</h3>
              <p className="text-sm text-blue-700 mb-3">
                Untuk mendapatkan perlindungan hukum penuh dan tanda <strong>®</strong> (Registered), daftarkan merek J&amp;B™ dan jualdanbeli™ secara resmi ke{" "}
                <strong>Direktorat Jenderal Kekayaan Intelektual (DJKI)</strong> Kementerian Hukum dan HAM RI.
              </p>
              <div className="flex gap-3 flex-wrap">
                <a
                  href="https://merek.dgip.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Daftar di merek.dgip.go.id
                </a>
                <a
                  href="https://e-hakcipta.dgip.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-blue-600 text-blue-600 text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Daftar Hak Cipta (e-Hakcipta)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="text-center text-xs text-muted-foreground border-t pt-6">
          <p className="font-bold text-gray-700 mb-1">© {new Date().getFullYear()} J&amp;B™ jualdanbeli™ — Hak Cipta Dilindungi</p>
          <p>
            Merek dagang J&amp;B™ dan jualdanbeli™ adalah milik eksklusif{" "}
            <strong>{OWNER.nama}</strong>.{" "}
            Dilarang keras meniru, menduplikasi, atau menggunakan merek ini tanpa izin tertulis dari pemilik.
            Pelanggaran dapat diproses secara hukum.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
