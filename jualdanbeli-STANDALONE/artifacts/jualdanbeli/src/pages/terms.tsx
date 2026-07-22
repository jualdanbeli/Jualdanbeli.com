import { MainLayout } from "@/components/layout/MainLayout";

export default function Terms() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Syarat & Ketentuan</h1>
        <p className="text-muted-foreground mb-8">Terakhir diperbarui: 1 Januari 2025</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Penerimaan Syarat</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dengan mengakses dan menggunakan platform jualdanbeli ("Platform"), Anda menyatakan telah membaca, memahami, 
              dan menyetujui Syarat & Ketentuan ini. Platform ini dikelola oleh PT jualdanbeli Indonesia, sebuah perusahaan 
              yang didirikan dan beroperasi sesuai hukum Republik Indonesia. Jika Anda tidak setuju dengan ketentuan ini, 
              harap hentikan penggunaan Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Definisi</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Platform</strong>: Situs web dan layanan jualdanbeli yang dapat diakses melalui jualdanbeli.com</li>
              <li><strong className="text-foreground">Pengguna</strong>: Setiap orang yang mendaftar dan menggunakan Platform</li>
              <li><strong className="text-foreground">Pembeli</strong>: Pengguna yang melakukan pembelian produk</li>
              <li><strong className="text-foreground">Penjual</strong>: Pengguna yang mendaftarkan dan menjual produk</li>
              <li><strong className="text-foreground">Rekening Bersama (Escrow)</strong>: Sistem penahanan dana sementara hingga transaksi selesai</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Pendaftaran Akun</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Untuk menggunakan fitur tertentu, Anda harus mendaftar dan membuat akun. Anda wajib:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Berusia minimal 17 tahun atau memiliki persetujuan orang tua/wali</li>
              <li>Memberikan informasi yang akurat, lengkap, dan terkini</li>
              <li>Menjaga kerahasiaan kata sandi akun Anda</li>
              <li>Bertanggung jawab atas semua aktivitas yang terjadi di akun Anda</li>
              <li>Segera memberitahu kami jika terdapat akses tidak sah ke akun Anda</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Kewajiban Penjual</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Sebagai Penjual, Anda menyetujui bahwa:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Produk yang dijual adalah milik sah Anda dan tidak melanggar hak pihak ketiga</li>
              <li>Deskripsi, foto, dan harga produk adalah akurat dan tidak menyesatkan</li>
              <li>Produk yang dijual tidak termasuk barang terlarang sesuai hukum Indonesia</li>
              <li>Anda bertanggung jawab atas kualitas produk dan pengiriman tepat waktu</li>
              <li>Anda menyetujui komisi platform sebesar 2% dari nilai transaksi yang berhasil</li>
              <li>Anda wajib menyelesaikan pesanan yang masuk dalam waktu 2x24 jam</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Sistem Rekening Bersama (Escrow)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Platform menggunakan sistem Rekening Bersama (Escrow) untuk melindungi Pembeli dan Penjual:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Dana Pembeli ditahan oleh Platform setelah pembayaran berhasil</li>
              <li>Dana diteruskan ke Penjual setelah Pembeli mengkonfirmasi penerimaan barang</li>
              <li>Jika terjadi sengketa, Platform berhak menahan dana hingga sengketa diselesaikan</li>
              <li>Refund dilakukan dalam 3-7 hari kerja untuk kartu kredit/debit</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Barang Dilarang</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Dilarang keras menjual produk berikut:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Narkotika, psikotropika, dan zat adiktif ilegal</li>
              <li>Senjata api, amunisi, dan bahan peledak tanpa izin resmi</li>
              <li>Produk bajakan atau melanggar hak kekayaan intelektual</li>
              <li>Produk pornografi atau konten dewasa</li>
              <li>Hewan yang dilindungi atau produk yang membahayakan lingkungan</li>
              <li>Barang hasil tindak kejahatan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Penyelesaian Sengketa</h2>
            <p className="text-muted-foreground leading-relaxed">
              Jika terjadi sengketa antara Pembeli dan Penjual, kedua belah pihak diharapkan menyelesaikan secara 
              musyawarah terlebih dahulu. Jika tidak tercapai kesepakatan, Platform berwenang menjadi mediator dan 
              keputusan Platform bersifat final. Sengketa yang tidak dapat diselesaikan akan diserahkan kepada 
              Badan Arbitrase Nasional Indonesia (BANI) sesuai peraturan yang berlaku.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Batasan Tanggung Jawab</h2>
            <p className="text-muted-foreground leading-relaxed">
              Platform bertindak sebagai perantara antara Pembeli dan Penjual. Platform tidak bertanggung jawab 
              atas kualitas produk yang dijual oleh Penjual, namun Platform berkomitmen untuk membantu menyelesaikan 
              sengketa yang terjadi. Total tanggung jawab Platform tidak melebihi nilai transaksi yang dipersengketakan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Hukum yang Berlaku</h2>
            <p className="text-muted-foreground leading-relaxed">
              Syarat & Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia, 
              termasuk namun tidak terbatas pada UU No. 11 Tahun 2008 tentang ITE, PP No. 71 Tahun 2019 
              tentang PSTE, dan UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Kontak</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pertanyaan mengenai Syarat & Ketentuan ini dapat disampaikan kepada:<br />
              <strong className="text-foreground">PT jualdanbeli Indonesia</strong><br />
              Email: legal@jualdanbeli.com<br />
              Telepon: (021) 000-0000
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
