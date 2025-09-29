import { Router } from 'express';
import { isValidContentType, isUuid } from '../utils/validators';

const router = Router();

// POST /api/likes { contentType, contentId }  (requiere user)
router.post('/likes', async (req, res) => {
  try {
    const auth = (req as any).auth;
    if (!auth?.user || !auth?.supabaseUser) return res.status(401).json({ error: 'Unauthorized' });
    const supabaseUser = auth.supabaseUser;

    const { contentType, contentId } = req.body || {};
    if (!isValidContentType(contentType))
      return res.status(400).json({ error: 'Invalid contentType' });
    if (!isUuid(contentId)) return res.status(400).json({ error: 'Invalid contentId' });

    const userId = auth.user.id;

    // ¿Existe ya el like?
    const { data: existing, error: selErr } = await supabaseUser
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .maybeSingle();

    if (selErr) throw selErr;

    if (existing?.id) {
      // UNLIKE
      const { error: delErr } = await supabaseUser.from('likes').delete().eq('id', existing.id);
      if (delErr) throw delErr;
      return res.json({ liked: false });
    } else {
      // LIKE
      const { error: insErr } = await supabaseUser
        .from('likes')
        .insert({ user_id: userId, content_type: contentType, content_id: contentId });
      if (insErr) throw insErr;
      return res.json({ liked: true });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
