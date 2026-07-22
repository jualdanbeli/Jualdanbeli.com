import nodemailer from "nodemailer";
import { logger } from "./logger";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@jualdanbeli.com";
const APP_URL = process.env.APP_URL ?? "https://jualdanbeli.replit.app";

function createTransporter() {
  if (RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: { user: "resend", pass: RESEND_API_KEY },
    });
  }
  logger.warn("RESEND_API_KEY not set — email disabled");
  return null;
}

async function sendMail(to: string, subject: string, html: string) {
  const transporter = createTransporter();
  if (!transporter) return;
  try {
    await transporter.sendMail({ from: `jualdanbeli <${FROM_EMAIL}>`, to, subject, html });
    logger.info({ to, subject }, "email sent");
  } catch (err) {
    logger.error({ err, to, subject }, "email send failed");
  }
}

function baseTemplate(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FAF9F7;margin:0;padding:0}
    .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
    .header{background:#2563EB;padding:24px 32px}
    .header h1{color:#fff;margin:0;font-size:22px;font-weight:700}
    .header p{color:rgba(255,255,255,.8);margin:4px 0 0;font-size:13px}
    .body{padding:32px}
    .badge{display:inline-block;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:600}
    .btn{display:inline-block;background:#2563EB;color:#fff!important;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px}
    .footer{background:#F5F5F5;padding:16px 32px;font-size:12px;color:#888;text-align:center}
    table{width:100%;border-collapse:collapse}td{padding:8px 0;border-bottom:1px solid #F0F0F0;font-size:14px}
    .label{color:#888;width:40%}.value{font-weight:500;color:#1A1A1A}
    h2{margin:0 0 16px;font-size:18px;color:#1A1A1A}p{color:#555;line-height:1.6;font-size:14px}
  </style></head><body><div class="wrap">
    <div class="header"><h1>jualdanbeli</h1><p>Marketplace Terpercaya Indonesia</p></div>
    <div class="body">${content}</div>
    <div class="footer">© 2025 jualdanbeli · <a href="${APP_URL}">Kunjungi toko</a></div>
  </div></body></html>`;
}

export async function sendOrderCreatedEmail(to: string, data: {
  orderId: number;
  buyerName: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  sellerName: string;
}) {
  const html = baseTemplate(`
    <h2>Pesanan Berhasil Dibuat! 🎉</h2>
    <p>Halo <strong>${data.buyerName}</strong>, pesanan kamu sudah diterima dan sedang diproses penjual.</p>
    <table>
      <tr><td class="label">No. Pesanan</td><td class="value">#${data.orderId}</td></tr>
      <tr><td class="label">Produk</td><td class="value">${data.productName} × ${data.quantity}</td></tr>
      <tr><td class="label">Penjual</td><td class="value">${data.sellerName}</td></tr>
      <tr><td class="label">Total</td><td class="value">Rp ${data.totalAmount.toLocaleString("id-ID")}</td></tr>
      <tr><td class="label">Status</td><td class="value"><span class="badge" style="background:#EFF6FF;color:#2563EB">Menunggu Pembayaran</span></td></tr>
    </table>
    <p style="margin-top:16px">Dana kamu dilindungi sistem <strong>Rekening Bersama (Escrow)</strong> — uang aman sampai barang diterima.</p>
    <a href="${APP_URL}/orders/${data.orderId}" class="btn">Lihat Pesanan</a>
  `);
  await sendMail(to, `Pesanan #${data.orderId} berhasil dibuat — jualdanbeli`, html);
}

export async function sendOrderStatusEmail(to: string, data: {
  orderId: number;
  recipientName: string;
  status: string;
  trackingNumber?: string;
  courierName?: string;
}) {
  const statusMap: Record<string, { label: string; color: string; bg: string; message: string }> = {
    paid: { label: "Pembayaran Diterima", color: "#22A48A", bg: "#E8F8F5", message: "Penjual sedang mempersiapkan pesanan kamu." },
    shipped: { label: "Pesanan Dikirim", color: "#2563EB", bg: "#EFF6FF", message: "Pesanan kamu sedang dalam perjalanan!" },
    completed: { label: "Pesanan Selesai", color: "#16A34A", bg: "#F0FDF4", message: "Terima kasih sudah berbelanja di jualdanbeli!" },
    cancelled: { label: "Pesanan Dibatalkan", color: "#DC2626", bg: "#FEF2F2", message: "Pesanan kamu telah dibatalkan." },
    disputed: { label: "Dalam Sengketa", color: "#D97706", bg: "#FFFBEB", message: "Tim kami sedang menangani sengketa ini." },
  };
  const s = statusMap[data.status] ?? { label: data.status, color: "#555", bg: "#F5F5F5", message: "" };
  const trackingInfo = data.trackingNumber
    ? `<tr><td class="label">No. Resi</td><td class="value">${data.trackingNumber} (${data.courierName ?? ""})</td></tr>` : "";

  const html = baseTemplate(`
    <h2>Update Pesanan #${data.orderId}</h2>
    <p>Halo <strong>${data.recipientName}</strong>, ada update untuk pesanan kamu:</p>
    <table>
      <tr><td class="label">No. Pesanan</td><td class="value">#${data.orderId}</td></tr>
      <tr><td class="label">Status Baru</td><td class="value"><span class="badge" style="background:${s.bg};color:${s.color}">${s.label}</span></td></tr>
      ${trackingInfo}
    </table>
    <p style="margin-top:16px">${s.message}</p>
    <a href="${APP_URL}/orders/${data.orderId}" class="btn">Lihat Detail Pesanan</a>
  `);
  await sendMail(to, `Pesanan #${data.orderId}: ${s.label} — jualdanbeli`, html);
}

export async function sendWelcomeEmail(to: string, name: string) {
  const html = baseTemplate(`
    <h2>Selamat Datang di jualdanbeli! 🎊</h2>
    <p>Halo <strong>${name}</strong>! Akun kamu sudah berhasil dibuat.</p>
    <p>Sekarang kamu bisa:</p>
    <ul style="color:#555;font-size:14px;line-height:2">
      <li>🛍️ Belanja ribuan produk dari penjual terpercaya</li>
      <li>🔒 Pembayaran aman dengan Rekening Bersama (Escrow)</li>
      <li>🚚 Pengiriman ke seluruh Indonesia dengan berbagai kurir</li>
      <li>⭐ Ulasan dan rating penjual terverifikasi</li>
    </ul>
    <a href="${APP_URL}" class="btn">Mulai Belanja Sekarang</a>
  `);
  await sendMail(to, "Selamat datang di jualdanbeli! 🎊", html);
}

export async function sendPasswordResetEmail(to: string, data: { name: string; resetLink: string }) {
  const html = baseTemplate(`
    <h2>Reset Password Akun 🔐</h2>
    <p>Halo <strong>${data.name}</strong>, kami menerima permintaan reset password untuk akun kamu.</p>
    <p>Klik tombol di bawah ini untuk membuat password baru. Link ini berlaku selama <strong>1 jam</strong>.</p>
    <a href="${data.resetLink}" class="btn">Reset Password Sekarang</a>
    <p style="margin-top:24px;font-size:12px;color:#999">Jika kamu tidak meminta reset password, abaikan email ini. Password kamu tidak akan berubah.</p>
    <p style="font-size:12px;color:#999">Atau salin link ini ke browser:<br><span style="word-break:break-all;color:#2563EB">${data.resetLink}</span></p>
  `);
  await sendMail(to, "Reset Password — jualdanbeli", html);
}

export async function sendShippingDisputeEmail(to: string, data: {
  orderId: number;
  buyerName: string;
  disputeType: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  description: string;
}) {
  const typeMap: Record<string, { label: string; color: string; bg: string; urgent: boolean }> = {
    paket_tidak_sampai: { label: "Paket Tidak Sampai", color: "#D97706", bg: "#FFFBEB", urgent: false },
    paket_hilang:       { label: "Paket Hilang", color: "#DC2626", bg: "#FEF2F2", urgent: true },
    kurir_nakal:        { label: "Oknum Kurir Bermasalah", color: "#DC2626", bg: "#FEF2F2", urgent: true },
    paket_rusak:        { label: "Paket Rusak / Cacat", color: "#D97706", bg: "#FFFBEB", urgent: false },
    barang_tidak_sesuai:{ label: "Barang Tidak Sesuai", color: "#7C3AED", bg: "#F5F3FF", urgent: false },
    other:              { label: "Sengketa Umum", color: "#555", bg: "#F5F5F5", urgent: false },
  };
  const t = typeMap[data.disputeType] ?? typeMap.other;
  const urgentBanner = t.urgent ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:12px 16px;margin-bottom:16px;color:#991B1B;font-size:13px;font-weight:600;">🚨 Kasus ini akan langsung diescalasi ke manajemen kurir dan tim keamanan jualdanbeli.</div>` : "";

  const html = baseTemplate(`
    <h2>Laporan Pengiriman Diterima ✅</h2>
    <p>Halo <strong>${data.buyerName}</strong>, laporan Anda untuk pesanan #${data.orderId} telah diterima dan sedang diproses.</p>
    ${urgentBanner}
    <table>
      <tr><td class="label">No. Pesanan</td><td class="value">#${data.orderId}</td></tr>
      <tr><td class="label">Jenis Masalah</td><td class="value"><span class="badge" style="background:${t.bg};color:${t.color}">${t.label}</span></td></tr>
      ${data.courierName ? `<tr><td class="label">Kurir</td><td class="value">${data.courierName}</td></tr>` : ""}
      ${data.trackingNumber ? `<tr><td class="label">No. Resi</td><td class="value font-mono">${data.trackingNumber}</td></tr>` : ""}
      <tr><td class="label">Deskripsi</td><td class="value" style="white-space:pre-wrap">${data.description}</td></tr>
    </table>
    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:16px;margin-top:20px">
      <p style="margin:0;font-size:13px;color:#1E40AF"><strong>📋 Apa yang terjadi selanjutnya:</strong></p>
      <ul style="margin:8px 0 0;padding-left:20px;font-size:13px;color:#1E40AF;line-height:2">
        <li>Tim admin akan memverifikasi laporan dalam <strong>1×24 jam</strong></li>
        <li>Dana escrow tetap ditahan aman selama proses berlangsung</li>
        ${t.urgent ? "<li>Laporan diteruskan ke manajemen kurir untuk investigasi</li>" : ""}
        <li>Keputusan final disampaikan dalam <strong>3–5 hari kerja</strong></li>
      </ul>
    </div>
    <a href="${APP_URL}/orders/${data.orderId}" class="btn">Pantau Status Laporan</a>
    <p style="margin-top:16px;font-size:12px;color:#999">Pertanyaan? Hubungi CS kami melalui fitur Support di aplikasi jualdanbeli.</p>
  `);
  await sendMail(to, `Laporan pesanan #${data.orderId} diterima — jualdanbeli`, html);
}

export async function sendPaymentSuccessEmail(to: string, data: {
  orderId: number;
  buyerName: string;
  amount: number;
  paymentMethod: string;
}) {
  const html = baseTemplate(`
    <h2>Pembayaran Berhasil ✅</h2>
    <p>Halo <strong>${data.buyerName}</strong>, pembayaran pesanan kamu telah dikonfirmasi!</p>
    <table>
      <tr><td class="label">No. Pesanan</td><td class="value">#${data.orderId}</td></tr>
      <tr><td class="label">Jumlah</td><td class="value">Rp ${data.amount.toLocaleString("id-ID")}</td></tr>
      <tr><td class="label">Metode</td><td class="value">${data.paymentMethod}</td></tr>
      <tr><td class="label">Dana</td><td class="value">Ditahan di Rekening Bersama</td></tr>
    </table>
    <p style="margin-top:16px">Dana akan dilepas ke penjual setelah kamu konfirmasi penerimaan barang.</p>
    <a href="${APP_URL}/orders/${data.orderId}" class="btn">Pantau Pesanan</a>
  `);
  await sendMail(to, `Pembayaran #${data.orderId} berhasil — jualdanbeli`, html);
}
