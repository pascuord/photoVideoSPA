import { Router } from 'express';
import { supabase } from '../db/supabase';
import { isValidContentType, isUuid } from '../utils/validators';

const router = Router();

// POST /api/shares { contentType, contentId, network }
router.post('/shares', async (req, res) => {
  try {
    const { contentType, contentId, network } = req.body || {};
    if (!isValidContentType(contentType))
      return res.status(400).json({ error: 'Invalid contentType' });
    if (!isUuid(contentId)) return res.status(400).json({ error: 'Invalid contentId' });
    if (!network || typeof network !== 'string')
      return res.status(400).json({ error: 'Invalid network' });

    const { error } = await supabase.rpc('increment_share', {
      p_content_type: contentType,
      p_content_id: contentId,
      p_network: network,
    });
    if (error) throw error;

    res.status(201).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
