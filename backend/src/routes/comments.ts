import { Router } from 'express';
import { supabase } from '../db/supabase'; // cliente admin (SERVICE KEY)
import { isValidContentType, isUuid } from '../utils/validators';
import { requireUser } from '../middleware/auth';

const router = Router();

// GET /api/comments?contentType=&contentId=&limit=&cursor=
router.get('/comments', async (req, res) => {
  try {
    const contentType = String(req.query.contentType || '');
    const contentId = String(req.query.contentId || '');
    const limitNum = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const cursorB64 = req.query.cursor ? String(req.query.cursor) : null;

    if (!isValidContentType(contentType))
      return res.status(400).json({ error: 'Invalid contentType' });
    if (!isUuid(contentId)) return res.status(400).json({ error: 'Invalid contentId' });

    let createdBefore: string | null = null;
    if (cursorB64) {
      try {
        createdBefore = Buffer.from(cursorB64, 'base64').toString('utf8');
        if (!/\d{4}-\d{2}-\d{2}T/.test(createdBefore)) createdBefore = null;
      } catch {
        /* ignore */
      }
    }

    let q = supabase
      .from('comments')
      .select('id,user_id,content_type,content_id,body,created_at', { count: 'exact' })
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .order('created_at', { ascending: false })
      .limit(limitNum + 1);

    if (createdBefore) q = q.lt('created_at', createdBefore);

    const { data, error } = await q;
    if (error) throw error;

    const rows = data ?? [];
    const hasMore = rows.length > limitNum;
    const items = hasMore ? rows.slice(0, limitNum) : rows;
    // después (seguro ante arrays vacíos y con tipado estricto)
    const lastItem = items.length ? items[items.length - 1] : undefined;

    // Si created_at viene como Date o string ISO, lo normalizamos a string
    const lastCreatedAt =
      lastItem?.created_at instanceof Date
        ? lastItem.created_at.toISOString()
        : (lastItem?.created_at ?? null);

    const nextCursor = lastCreatedAt ? Buffer.from(lastCreatedAt).toString('base64') : null;

    res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
    return res.json({ items, nextCursor });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /api/comments (PROTEGIDO)
router.post('/comments', requireUser, async (req, res) => {
  try {
    const auth = (req as any).auth;
    if (!auth?.user || !auth?.supabaseUser) return res.status(401).json({ error: 'Unauthorized' });
    const supabaseUser = auth.supabaseUser;

    const { contentType, contentId, body } = req.body || {};
    if (!isValidContentType(contentType))
      return res.status(400).json({ error: 'Invalid contentType' });
    if (!isUuid(contentId)) return res.status(400).json({ error: 'Invalid contentId' });
    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return res.status(400).json({ error: 'Empty comment' });
    }

    const { data, error } = await supabaseUser
      .from('comments')
      .insert({
        user_id: auth.user.id,
        content_type: contentType,
        content_id: contentId,
        body: String(body).trim().slice(0, 2000),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/comments/:id (PROTEGIDO)
router.delete('/comments/:id', requireUser, async (req, res) => {
  try {
    const auth = (req as any).auth;
    if (!auth?.user || !auth?.supabaseUser) return res.status(401).json({ error: 'Unauthorized' });
    const supabaseUser = auth.supabaseUser;

    const id = String(req.params.id || '');
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid comment id' });

    const { error } = await supabaseUser.from('comments').delete().eq('id', id);
    if (error) return res.status(403).json({ error: error.message });

    return res.status(204).end();
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
