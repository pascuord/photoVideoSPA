// src/routes/stats.ts
import { Router } from 'express';
import { supabase } from '../db/supabase'; // <- tu cliente admin (SERVICE_KEY)
import { isValidContentType, isUuid } from '../utils/validators';

const router = Router();

async function getUidFromAuthHeader(req: any): Promise<string | null> {
  const auth = req.header('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const { data, error } = await supabase.auth.getUser(token); // ok con service_key
  if (error || !data?.user) return null;
  return data.user.id;
}

router.get('/stats/:contentType/:contentId', async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    if (!isValidContentType(contentType))
      return res.status(400).json({ error: 'Invalid contentType' });
    if (!isUuid(contentId)) return res.status(400).json({ error: 'Invalid contentId' });

    const uidPromise = getUidFromAuthHeader(req);

    const likesHeadPromise = supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    const commentsHeadPromise = supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    const sharesRowsPromise = supabase
      .from('share_stats')
      .select('count')
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    const [likesHead, commentsHead, sharesRows, uid] = await Promise.all([
      likesHeadPromise,
      commentsHeadPromise,
      sharesRowsPromise,
      uidPromise,
    ]);

    if (likesHead.error) throw likesHead.error;
    if (commentsHead.error) throw commentsHead.error;
    if (sharesRows.error) throw sharesRows.error;

    const likes = likesHead.count ?? 0;
    const comments = commentsHead.count ?? 0;
    const shares = (sharesRows.data ?? []).reduce(
      (acc: number, r: any) => acc + (r?.count ?? 0),
      0,
    );

    let likedByMe: boolean | undefined = undefined;
    if (uid) {
      const { data: meLike, error: meErr } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', uid)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .maybeSingle();
      if (meErr) throw meErr;
      likedByMe = !!meLike;
      res.setHeader('Vary', 'Authorization');
    }

    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    return res.json(
      likedByMe === undefined
        ? { likes, comments, shares }
        : { likes, comments, shares, likedByMe },
    );
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
