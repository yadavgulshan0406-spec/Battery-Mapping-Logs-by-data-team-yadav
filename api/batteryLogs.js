export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.LECTRIX_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Missing API token" });
  }

  const { buids, page = 1, pageSize = 100, count = 2 } = req.body;
  if (!Array.isArray(buids) || buids.length === 0) {
    return res.status(400).json({ error: "No BUIDs provided" });
  }

  let allResults = [];

  for (const buid of buids) {
    const payload = { buid: [buid], page, pageSize };
    const response = await fetch(
      "https://bss-webadmin-api.lectrixev.com/batteriesMaster/batteryMappingLogs",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "authorization": token
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();
    if (data?.data?.data?.length) {
      const latest = data.data.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, Math.min(count, 5)); // limit to max 5
      allResults.push(...latest);
    }
  }

  res.status(200).json(allResults);
}
