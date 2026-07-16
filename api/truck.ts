import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { wing, type, timestamp } = req.body;
  try {
    const log = await prisma.truckLog.create({
      data: {
        wing,
        type,
        timestamp: timestamp ? new Date(timestamp) : undefined,
      }
    });
    
    res.status(201).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
