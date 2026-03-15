import { Request, Response, NextFunction } from 'express';
import db from '../db';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const session = db
    .prepare(
      `SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')`
    )
    .get(token);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
