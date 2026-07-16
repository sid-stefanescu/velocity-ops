import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { shifts } = req.body;
  if (!shifts || !Array.isArray(shifts)) {
    return res.status(400).json({ error: 'Invalid shifts data' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update active shifts
      await tx.shiftBlock.deleteMany();
      if (shifts.length > 0) {
        await tx.shiftBlock.createMany({
          data: shifts.map((s: any) => ({
            start: s.start,
            end: s.end,
            teams: s.teams,
          }))
        });
      }
      
      // 2. Add an audit log entry
      await tx.shiftLog.create({
        data: {
          schedule: JSON.stringify(shifts)
        }
      });
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
