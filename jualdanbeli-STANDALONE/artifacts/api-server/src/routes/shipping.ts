import { Router, type IRouter } from "express";
import { db, couriersTable } from "@workspace/db";

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY ?? "";
const RAJAONGKIR_BASE_URL = "https://api.rajaongkir.com/starter";

const router: IRouter = Router();

router.get("/shipping/couriers", async (_req, res): Promise<void> => {
  const couriers = await db.select().from(couriersTable);
  res.json(couriers);
});

async function calculateWithRajaOngkir(
  origin: string,
  destination: string,
  weight: number,
  courier: string
): Promise<any[]> {
  const response = await fetch(`${RAJAONGKIR_BASE_URL}/cost`, {
    method: "POST",
    headers: {
      key: RAJAONGKIR_API_KEY,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      origin,
      destination,
      weight: String(Math.max(1, Math.round(weight))),
      courier,
    }),
  });

  if (!response.ok) throw new Error(`RajaOngkir error: ${response.status}`);
  const data = await response.json() as any;
  const results = data?.rajaongkir?.results?.[0]?.costs ?? [];

  return results.map((c: any) => ({
    service: c.service,
    description: c.description,
    cost: c.cost?.[0]?.value ?? 0,
    estimatedDays: c.cost?.[0]?.etd ?? "3-5 hari",
  }));
}

function simulatedShipping(originCity: string, destinationCity: string, weight: number) {
  const couriers = [
    { id: "jne", name: "JNE" },
    { id: "jnt", name: "J&T Express" },
    { id: "sicepat", name: "SiCepat" },
    { id: "anteraja", name: "AnterAja" },
  ];
  const services = [
    { service: "REG", description: "Reguler", costPerKg: 1200, baseCost: 8000, etd: "2-3 hari" },
    { service: "YES", description: "Ekspres", costPerKg: 1800, baseCost: 15000, etd: "1-2 hari" },
  ];
  const sameCity = originCity?.toLowerCase() === destinationCity?.toLowerCase();
  const multiplier = sameCity ? 0.5 : 1;

  return couriers.flatMap(c =>
    services.map(s => ({
      courierId: c.id,
      courierName: c.name,
      service: s.service,
      description: s.description,
      cost: Math.round((weight * s.costPerKg + s.baseCost) * multiplier),
      estimatedDays: s.etd,
    }))
  );
}

router.post("/shipping/calculate", async (req, res): Promise<void> => {
  const { originCity, destinationCity, weight, originCityId, destinationCityId } = req.body;
  if (!originCity || !destinationCity || !weight) {
    res.status(400).json({ error: "originCity, destinationCity, dan weight diperlukan" }); return;
  }

  if (RAJAONGKIR_API_KEY && originCityId && destinationCityId) {
    try {
      const courierList = ["jne", "jnt", "sicepat"];
      const allResults = await Promise.all(
        courierList.map(c =>
          calculateWithRajaOngkir(String(originCityId), String(destinationCityId), weight, c)
            .then(results => results.map(r => ({ ...r, courierName: c.toUpperCase(), courierId: c })))
            .catch(() => [])
        )
      );
      const options = allResults.flat();
      if (options.length > 0) { res.json(options); return; }
    } catch {
      req.log.warn("RajaOngkir API failed, falling back to simulation");
    }
  }

  res.json(simulatedShipping(originCity, destinationCity, weight));
});

router.get("/shipping/cities", async (req, res): Promise<void> => {
  if (!RAJAONGKIR_API_KEY) { res.json([]); return; }
  const province = req.query.province;
  const url = province
    ? `${RAJAONGKIR_BASE_URL}/city?province=${province}`
    : `${RAJAONGKIR_BASE_URL}/city`;
  try {
    const response = await fetch(url, { headers: { key: RAJAONGKIR_API_KEY } });
    const data = await response.json() as any;
    res.json(data?.rajaongkir?.results ?? []);
  } catch (err) {
    req.log.error({ err }, "RajaOngkir cities fetch failed");
    res.json([]);
  }
});

router.get("/shipping/provinces", async (req, res): Promise<void> => {
  if (!RAJAONGKIR_API_KEY) { res.json([]); return; }
  try {
    const response = await fetch(`${RAJAONGKIR_BASE_URL}/province`, { headers: { key: RAJAONGKIR_API_KEY } });
    const data = await response.json() as any;
    res.json(data?.rajaongkir?.results ?? []);
  } catch (err) {
    req.log.error({ err }, "RajaOngkir provinces fetch failed");
    res.json([]);
  }
});

router.get("/shipping/track/:trackingNumber", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.trackingNumber) ? req.params.trackingNumber[0] : req.params.trackingNumber;
  const trackingNumber = raw;

  if (RAJAONGKIR_API_KEY) {
    const courier = (req.query.courier as string) ?? "jne";
    try {
      const response = await fetch(`${RAJAONGKIR_BASE_URL}/waybill`, {
        method: "POST",
        headers: { key: RAJAONGKIR_API_KEY, "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ waybill: trackingNumber, courier }),
      });
      const data = await response.json() as any;
      const result = data?.rajaongkir?.result;
      if (result?.delivery_status) {
        res.json({
          trackingNumber,
          courier,
          status: result.delivery_status.status,
          history: (result.manifest ?? []).map((m: any) => ({
            description: m.manifest_description,
            date: `${m.manifest_date} ${m.manifest_time}`,
            cityName: m.city_name,
          })),
          receiver: result.delivery_status.receiver_name,
          delivered: result.delivery_status.status === "DELIVERED",
        });
        return;
      }
    } catch { /* fallthrough */ }
  }

  res.json({
    trackingNumber,
    status: "IN_TRANSIT",
    history: [
      { description: "Paket diterima di gudang", date: new Date(Date.now() - 3600000 * 24).toISOString(), cityName: "Jakarta" },
      { description: "Paket dalam pengiriman", date: new Date(Date.now() - 3600000 * 12).toISOString(), cityName: "Surabaya" },
      { description: "Paket sedang diantarkan ke alamat tujuan", date: new Date().toISOString(), cityName: "Surabaya" },
    ],
    delivered: false,
  });
});

export default router;
