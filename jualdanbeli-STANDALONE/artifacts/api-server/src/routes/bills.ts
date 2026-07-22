import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { db } from "@workspace/db";
import { billPaymentsTable, walletsTable, transactionsTable, usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
const router = Router();

const ADMIN_FEE = 2500;

const BILL_CONFIGS: Record<string, {
  label: string;
  idLabel: string;
  idExample: string;
  generateData: (customerId: string) => { customerName: string; description: string; amount: number; period?: string };
}> = {
  pln_pascabayar: {
    label: "PLN Pascabayar",
    idLabel: "Nomor Meter / ID Pelanggan",
    idExample: "123456789012",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const amounts = [85000, 120000, 145000, 178000, 210000, 245000, 310000, 385000, 425000, 512000];
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI", "HENDRA WIJAYA", "RINA KUSUMA", "DODI PRASETYO", "YUNI ASTUTI"];
      const months = ["Agustus", "September", "Oktober"];
      return {
        customerName: names[seed % names.length],
        description: `PLN Pascabayar ${months[seed % months.length]} 2024`,
        amount: amounts[seed % amounts.length],
        period: months[seed % months.length] + " 2024",
      };
    },
  },
  pln_prepaid: {
    label: "Token Listrik (PLN Prabayar)",
    idLabel: "Nomor Meter",
    idExample: "12345678901234567890",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const amounts = [20000, 50000, 100000, 200000, 500000];
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI", "HENDRA WIJAYA"];
      return {
        customerName: names[seed % names.length],
        description: `Token Listrik ${amounts[seed % amounts.length].toLocaleString("id-ID")} kWh`,
        amount: amounts[seed % amounts.length],
      };
    },
  },
  bpjs_kesehatan: {
    label: "BPJS Kesehatan",
    idLabel: "Nomor VA / Kartu BPJS",
    idExample: "0001234567890",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const classes = [
        { kelas: "I", perOrang: 150000 },
        { kelas: "II", perOrang: 100000 },
        { kelas: "III", perOrang: 35000 },
      ];
      const cls = classes[seed % classes.length];
      const members = (seed % 4) + 1;
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI"];
      const months = ["Agustus", "September", "Oktober"];
      return {
        customerName: names[seed % names.length],
        description: `BPJS Kesehatan Kelas ${cls.kelas} – ${members} jiwa – ${months[seed % months.length]} 2024`,
        amount: cls.perOrang * members,
      };
    },
  },
  bpjs_ketenagakerjaan: {
    label: "BPJS Ketenagakerjaan",
    idLabel: "Nomor Kepesertaan",
    idExample: "13000123456789",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const amounts = [85000, 120000, 165000, 210000, 275000];
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI", "HENDRA WIJAYA"];
      const months = ["Agustus", "September", "Oktober"];
      return {
        customerName: names[seed % names.length],
        description: `BPJS Ketenagakerjaan ${months[seed % months.length]} 2024`,
        amount: amounts[seed % amounts.length],
      };
    },
  },
  pdam: {
    label: "PDAM (Air)",
    idLabel: "Nomor Pelanggan PDAM",
    idExample: "040123456",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const amounts = [35000, 52000, 78000, 95000, 120000, 145000];
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI"];
      const months = ["Agustus", "September", "Oktober"];
      return {
        customerName: names[seed % names.length],
        description: `PDAM ${months[seed % months.length]} 2024`,
        amount: amounts[seed % amounts.length],
      };
    },
  },
  telepon: {
    label: "Telepon Rumah (Telkom)",
    idLabel: "Nomor Telepon",
    idExample: "02112345678",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const amounts = [120000, 145000, 175000, 210000];
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI"];
      const months = ["Agustus", "September", "Oktober"];
      return {
        customerName: names[seed % names.length],
        description: `Tagihan Telepon Telkom ${months[seed % months.length]} 2024`,
        amount: amounts[seed % amounts.length],
      };
    },
  },
  internet: {
    label: "Internet (IndiHome / Biznet / dll)",
    idLabel: "Nomor Pelanggan",
    idExample: "INET-1234567",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const packages = [
        { name: "IndiHome 10 Mbps", price: 275000 },
        { name: "IndiHome 20 Mbps", price: 350000 },
        { name: "Biznet 50 Mbps", price: 385000 },
        { name: "Iconnet 20 Mbps", price: 250000 },
        { name: "MyRepublic 50 Mbps", price: 399000 },
      ];
      const pkg = packages[seed % packages.length];
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI"];
      const months = ["Agustus", "September", "Oktober"];
      return {
        customerName: names[seed % names.length],
        description: `${pkg.name} – ${months[seed % months.length]} 2024`,
        amount: pkg.price,
      };
    },
  },
  finance: {
    label: "Cicilan Finance (Adira / FIF / WOM / dll)",
    idLabel: "Nomor Kontrak",
    idExample: "ADIRA-1234567890",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const companies = ["Adira Finance", "FIF Group", "WOM Finance", "BAF", "Mandiri Tunas Finance", "CIMB Finance"];
      const amounts = [350000, 500000, 650000, 850000, 1200000, 1500000, 2000000];
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI", "HENDRA WIJAYA"];
      const months = ["Agustus", "September", "Oktober"];
      return {
        customerName: names[seed % names.length],
        description: `Cicilan ${companies[seed % companies.length]} – Angsuran ${(seed % 24) + 1} – ${months[seed % months.length]} 2024`,
        amount: amounts[seed % amounts.length],
      };
    },
  },
  tv_kabel: {
    label: "TV Kabel (MNC / Indovision / dll)",
    idLabel: "Nomor Pelanggan",
    idExample: "IND-12345678",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const providers = [
        { name: "Indovision Family Pack", price: 350000 },
        { name: "MNC Vision HD", price: 290000 },
        { name: "First Media Super Pack", price: 450000 },
        { name: "Transvision Sports", price: 320000 },
      ];
      const p = providers[seed % providers.length];
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI"];
      const months = ["Agustus", "September", "Oktober"];
      return {
        customerName: names[seed % names.length],
        description: `${p.name} – ${months[seed % months.length]} 2024`,
        amount: p.price,
      };
    },
  },
  pulsa: {
    label: "Pulsa Telepon",
    idLabel: "Nomor HP",
    idExample: "081234567890",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const amounts = [10000, 20000, 25000, 50000, 100000];
      const operators = ["Telkomsel", "Indosat Ooredoo", "XL Axiata", "Tri", "Smartfren"];
      return {
        customerName: id,
        description: `Pulsa ${operators[seed % operators.length]}`,
        amount: amounts[seed % amounts.length],
      };
    },
  },
  paket_data: {
    label: "Paket Data",
    idLabel: "Nomor HP",
    idExample: "081234567890",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const packages = [
        { name: "Telkomsel 10GB 30 hari", price: 55000 },
        { name: "Indosat 15GB 30 hari", price: 65000 },
        { name: "XL 20GB 30 hari", price: 75000 },
        { name: "Tri 30GB 30 hari", price: 60000 },
        { name: "Telkomsel 50GB 30 hari", price: 105000 },
      ];
      const pkg = packages[seed % packages.length];
      return {
        customerName: id,
        description: `Paket Data ${pkg.name}`,
        amount: pkg.price,
      };
    },
  },
  pbb: {
    label: "PBB (Pajak Bumi & Bangunan)",
    idLabel: "NOP / Nomor Objek Pajak",
    idExample: "3171012345678901234",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const amounts = [125000, 250000, 450000, 750000, 1200000, 2500000];
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI"];
      return {
        customerName: names[seed % names.length],
        description: `PBB Tahun Pajak 2024`,
        amount: amounts[seed % amounts.length],
      };
    },
  },
  stnk: {
    label: "Pajak Kendaraan / e-Samsat",
    idLabel: "Nomor Polisi",
    idExample: "B 1234 ABC",
    generateData: (id) => {
      const seed = id.replace(/\s/g, "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const amounts = [255000, 385000, 512000, 750000, 950000, 1200000];
      const types = ["Sepeda Motor", "Mobil Sedan", "Mobil SUV", "Mobil MPV", "Mobil Pickup"];
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI", "HENDRA WIJAYA"];
      return {
        customerName: names[seed % names.length],
        description: `Pajak Kendaraan ${types[seed % types.length]} – Tahun 2024`,
        amount: amounts[seed % amounts.length],
      };
    },
  },
  gas: {
    label: "Gas PGN / Elpiji",
    idLabel: "Nomor Pelanggan",
    idExample: "PGN-1234567",
    generateData: (id) => {
      const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const amounts = [45000, 68000, 95000, 125000, 155000];
      const names = ["BUDI SANTOSO", "SITI RAHAYU", "AHMAD FAUZI", "DEWI LESTARI"];
      const months = ["Agustus", "September", "Oktober"];
      return {
        customerName: names[seed % names.length],
        description: `Gas PGN ${months[seed % months.length]} 2024`,
        amount: amounts[seed % amounts.length],
      };
    },
  },
};

router.get("/bills/categories", (_req, res) => {
  const categories = Object.entries(BILL_CONFIGS).map(([key, cfg]) => ({
    type: key,
    label: cfg.label,
    idLabel: cfg.idLabel,
    idExample: cfg.idExample,
  }));
  res.json({ categories });
});

router.post("/bills/inquiry", requireAuth, async (req, res) => {
  const { billType, customerId } = req.body ?? {};
  if (!billType || !customerId || typeof billType !== "string" || typeof customerId !== "string" || !customerId.trim()) {
    res.status(400).json({ error: "Data tidak lengkap" });
    return;
  }
  const config = BILL_CONFIGS[billType];
  if (!config) {
    res.status(400).json({ error: "Jenis tagihan tidak valid" });
    return;
  }

  const data = config.generateData(customerId);
  const totalAmount = data.amount + ADMIN_FEE;

  res.json({
    billType,
    customerId,
    customerName: data.customerName,
    description: data.description,
    amount: data.amount,
    adminFee: ADMIN_FEE,
    totalAmount,
    period: data.period ?? null,
  });
});

router.post("/bills/pay", requireAuth, async (req, res) => {
  const { billType, customerId, amount } = req.body ?? {};
  if (!billType || !customerId || typeof billType !== "string" || typeof customerId !== "string" || typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "Data tidak valid" });
    return;
  }
  const config = BILL_CONFIGS[billType];
  if (!config) {
    res.status(400).json({ error: "Jenis tagihan tidak valid" });
    return;
  }

  const userId = (req as any).user.id;
  const data = config.generateData(customerId);
  const totalAmount = amount + ADMIN_FEE;

  const wallet = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId)).then(r => r[0]);
  if (!wallet) {
    res.status(400).json({ error: "Dompet tidak ditemukan" });
    return;
  }

  const balance = parseFloat(wallet.balance as string);
  if (balance < totalAmount) {
    res.status(400).json({ error: `Saldo tidak cukup. Saldo Anda: Rp ${balance.toLocaleString("id-ID")}, dibutuhkan: Rp ${totalAmount.toLocaleString("id-ID")}` });
    return;
  }

  const referenceNo = `JDB-BILL-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const [billPayment] = await db.insert(billPaymentsTable).values({
    userId,
    billType: billType as any,
    customerId,
    customerName: data.customerName,
    description: data.description,
    amount: String(amount),
    adminFee: String(ADMIN_FEE),
    totalAmount: String(totalAmount),
    status: "success",
    referenceNo,
    paidAt: new Date(),
  }).returning();

  // Deduct total from buyer wallet
  await db.update(walletsTable)
    .set({ balance: String(balance - totalAmount), updatedAt: new Date() })
    .where(eq(walletsTable.userId, userId));

  // Record debit transaction for buyer
  await db.insert(transactionsTable).values({
    userId,
    type: "withdrawal",
    amount: String(totalAmount),
    status: "completed",
    description: `Pembayaran ${config.label}: ${data.description} — Ref: ${referenceNo}`,
  });

  // Credit admin fee (Rp 2.500) to admin wallet
  const adminUser = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, "admin"))
    .limit(1)
    .then(r => r[0]);

  if (adminUser) {
    const adminWallet = await db
      .select()
      .from(walletsTable)
      .where(eq(walletsTable.userId, adminUser.id))
      .then(r => r[0]);

    if (adminWallet) {
      const adminBalance = parseFloat(adminWallet.balance as string);
      await db.update(walletsTable)
        .set({ balance: String(adminBalance + ADMIN_FEE), updatedAt: new Date() })
        .where(eq(walletsTable.userId, adminUser.id));

      await db.insert(transactionsTable).values({
        userId: adminUser.id,
        type: "sale",
        amount: String(ADMIN_FEE),
        status: "completed",
        description: `Fee admin tagihan ${config.label} — ${referenceNo}`,
      });
    }
  }

  res.json({
    success: true,
    referenceNo,
    billPaymentId: billPayment.id,
    customerName: data.customerName,
    description: data.description,
    amount,
    adminFee: ADMIN_FEE,
    totalAmount,
    paidAt: billPayment.paidAt,
  });
});

router.get("/bills/history", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const history = await db
    .select()
    .from(billPaymentsTable)
    .where(eq(billPaymentsTable.userId, userId))
    .orderBy(desc(billPaymentsTable.createdAt))
    .limit(50);

  const withLabels = history.map(h => ({
    ...h,
    label: BILL_CONFIGS[h.billType]?.label ?? h.billType,
  }));

  res.json({ history: withLabels });
});

export default router;
