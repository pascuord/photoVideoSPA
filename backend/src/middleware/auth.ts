import type { NextFunction, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Missing Bearer token' });

    // Cliente “de usuario” (respeta RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });

    (req as any).auth = { user: data.user, supabaseUser: supabase };
    next();
  } catch (e: any) {
    res.status(401).json({ error: 'Auth error', detail: e?.message });
  }
}
