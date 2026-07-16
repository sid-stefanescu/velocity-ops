import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { shifts, anchor, target, weights, thresholds } = req.body;
  
  try {
    await prisma.$transaction(async (tx) => {
      // Upsert global settings
      await tx.settings.upsert({
        where: { id: 'global' },
        update: {
          targetTrucks: target,
          historicalAnchor: anchor,
          w1: weights.w1,
          w2: weights.w2,
          w3: weights.w3,
          wirWarning: thresholds.warning,
          wirCritical: thresholds.critical,
        },
        create: {
          id: 'global',
          targetTrucks: target,
          historicalAnchor: anchor,
          w1: weights.w1,
          w2: weights.w2,
          w3: weights.w3,
          wirWarning: thresholds.warning,
          wirCritical: thresholds.critical,
        }
      });
      // Only updating global settings now
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
