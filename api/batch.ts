import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { logs } = req.body;
  if (!logs || !Array.isArray(logs)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    const data = logs.map(log => ({
      wing: log.wing,
      bay: log.bay || null,
      type: log.type,
      timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
    }));

    await prisma.truckLog.createMany({
      data
    });
    
    res.status(201).json({ success: true, count: data.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
