import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const logs = await prisma.truckLog.findMany({ orderBy: { timestamp: 'asc' } });
    const shifts = await prisma.shiftBlock.findMany();
    const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    
    res.status(200).json({ logs, shifts, settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
