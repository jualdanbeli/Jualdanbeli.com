import { MainLayout } from "@/components/layout/MainLayout";

export default function Privacy() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Kebijakan Privasi</h1>
        <p className="text-muted-foreground mb-8">Terakhir diperbarui: 1 Januari 2025</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Pendahuluan</h2>
            <p className="text-muted-foreground leading-relaxed">
              PT jualdanbeli Indonesia ("kami") berkomitmen untuk melindungi privasi Anda sesuai dengan 
              Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP) dan peraturan 
              perundang-undangan Indonesia lainnya yang berlaku. Kebijakan Privasi ini menjelaskan bagaimana 
              kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Data yang Kami Kumpulkan</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Data yang Anda berikan:</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Nama lengkap, alamat email, nomor telepon</li>
                  <li>Alamat pengiriman dan tagihan</li>
                  <li>Foto profil (opsional)</li>
                  <li>Informasi toko (untuk Penjual): nama toko, deskripsi, kota</li>
                  <li>Informasi rekening bank (untuk penarikan dana Penjual)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data yang dikumpulkan otomatis:</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Alamat IP dan informasi perangkat</li>
                  <li>Data penggunaan dan aktivitas di Platform</li>
                  <li>Cookie dan teknologi serupa</li>
                  <li>Log transaksi dan riwayat pesanan</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Tujuan Penggunaan Data</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Kami menggunakan data Anda untuk:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Memproses transaksi dan mengelola akun Anda</li>
              <li>Mengirimkan konfirmasi pesanan dan notifikasi layanan</li>
              <li>Meningkatkan keamanan dan mencegah penipuan</li>
              <li>Memenuhi kewajiban hukum dan regulasi</li>
              <li>Memberikan layanan pelanggan</li>
              <li>Menganalisis penggunaan Platform untuk peningkatan layanan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Dasar Hukum Pemrosesan</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Kami memproses data pribadi Anda berdasarkan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Perjanjian:</strong> Pemrosesan diperlukan untuk memenuhi kontrak layanan dengan Anda</li>
              <li><strong className="text-foreground">Kewajiban hukum:</strong> Kepatuhan terhadap peraturan perpajakan dan keuangan Indonesia</li>
              <li><strong className="text-foreground">Kepentingan sah:</strong> Pencegahan penipuan dan keamanan Platform</li>
              <li><strong className="text-foreground">Persetujuan:</strong> Untuk komunikasi pemasaran (dapat ditarik kapan saja)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Berbagi Data dengan Pihak Ketiga</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Kami tidak menjual data pribadi Anda. Kami dapat berbagi data dengan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Penjual:</strong> Nama dan alamat pengiriman untuk memproses pesanan Anda</li>
              <li><strong className="text-foreground">Mitra pengiriman:</strong> Data yang diperlukan untuk pengiriman barang</li>
              <li><strong className="text-foreground">Penyedia pembayaran:</strong> Data transaksi untuk memproses pembayaran</li>
              <li><strong className="text-foreground">Otoritas hukum:</strong> Jika diwajibkan oleh hukum atau perintah pengadilan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Keamanan Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kami menerapkan langkah-langkah keamanan teknis dan organisasional yang sesuai untuk melindungi 
              data pribadi Anda dari akses tidak sah, pengungkapan, perubahan, atau penghancuran. Data disimpan 
              di server yang berlokasi di Indonesia dan dienkripsi menggunakan standar industri.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Hak-Hak Anda</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Sesuai UU PDP, Anda berhak untuk:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Mengakses:</strong> Meminta salinan data pribadi Anda yang kami simpan</li>
              <li><strong className="text-foreground">Memperbaiki:</strong> Memperbarui data yang tidak akurat atau tidak lengkap</li>
              <li><strong className="text-foreground">Menghapus:</strong> Meminta penghapusan data dalam kondisi tertentu</li>
              <li><strong className="text-foreground">Membatasi:</strong> Membatasi pemrosesan data dalam kondisi tertentu</li>
              <li><strong className="text-foreground">Portabilitas:</strong> Menerima data Anda dalam format yang dapat dibaca mesin</li>
              <li><strong className="text-foreground">Menolak:</strong> Menolak pemrosesan untuk tujuan tertentu</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Untuk mengajukan permintaan hak-hak tersebut, hubungi kami di privacy@jualdanbeli.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Retensi Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kami menyimpan data pribadi Anda selama akun Anda aktif atau selama diperlukan untuk menyediakan 
              layanan. Data transaksi disimpan minimal 5 tahun sesuai ketentuan perpajakan Indonesia. Setelah 
              akun dihapus, data akan dihapus dalam 30 hari, kecuali diwajibkan untuk disimpan oleh hukum.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Cookie</h2>
            <p className="text-muted-foreground leading-relaxed">
              Platform menggunakan cookie untuk meningkatkan pengalaman pengguna, menyimpan preferensi, 
              dan menganalisis lalu lintas situs. Anda dapat mengatur preferensi cookie melalui pengaturan 
              browser Anda. Menonaktifkan cookie tertentu dapat mempengaruhi fungsionalitas Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Perubahan Kebijakan</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan material akan 
              diberitahukan melalui email atau notifikasi di Platform setidaknya 14 hari sebelum berlaku. 
              Penggunaan Platform setelah perubahan berlaku dianggap sebagai penerimaan kebijakan yang diperbarui.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Kontak & Pengaduan</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pertanyaan atau keluhan terkait privasi data dapat disampaikan kepada Data Protection Officer kami:<br />
              <strong className="text-foreground">Email:</strong> privacy@jualdanbeli.com<br />
              <strong className="text-foreground">Telepon:</strong> (021) 000-0000<br />
              <strong className="text-foreground">Alamat:</strong> PT jualdanbeli Indonesia, Jakarta, Indonesia<br /><br />
              Jika Anda tidak puas dengan respons kami, Anda dapat mengajukan pengaduan kepada 
              Badan Siber dan Sandi Negara (BSSN) atau Komisi Informasi sesuai ketentuan yang berlaku.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
