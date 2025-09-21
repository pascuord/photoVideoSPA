import { Router } from 'express';
import { supabase } from '../db/supabase';
import mime from 'mime-types';


const router = Router();
const BUCKET = 'media';
const TTL = 900; // 15 min

// GET /api/media?type=image|video&limit=...
router.get('/media', async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;

    // 1) Carga media básico
    let query = supabase
      .from('media_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (type === 'image' || type === 'video') {
      query = query.eq('type', String(type));
    }

    const { data, error } = await query.limit(Number(limit));
    if (error) throw error;

    // 2) Firma URLs
    const signed = await Promise.all(
      (data ?? []).map(async (m: any) => {
        const { data: file } = await supabase
          .storage.from('media')
          .createSignedUrl(m.storage_path, 900);

        let thumbUrl: string | undefined;
        if (m.thumbnail_path) {
          const { data: t } = await supabase
            .storage.from('media')
            .createSignedUrl(m.thumbnail_path, 900);
          thumbUrl = t?.signedUrl;
        }

        return { ...m, url: file?.signedUrl, thumbnailUrl: thumbUrl };
      })
    );

    // 3) Enlaza post (si existe) por linked_media_id o linked_media_slug
    const ids = signed.map((m) => m.id).filter(Boolean);
    const slugs = signed.map((m) => m.slug).filter(Boolean);

    const [byId, bySlug] = await Promise.all([
      supabase
        .from('blog_posts')
        .select('slug, linked_media_id')
        .in('linked_media_id', ids),
      supabase
        .from('blog_posts')
        .select('slug, linked_media_slug')
        .in('linked_media_slug', slugs),
    ]);

    if (byId.error) throw byId.error;
    if (bySlug.error) throw bySlug.error;

    const postSlugByMediaId = new Map<string, string>(
      (byId.data ?? []).map((p: any) => [p.linked_media_id, p.slug])
    );
    const postSlugByMediaSlug = new Map<string, string>(
      (bySlug.data ?? []).map((p: any) => [p.linked_media_slug, p.slug])
    );

    const enriched = signed.map((m) => ({
      ...m,
      postSlug: postSlugByMediaId.get(m.id) ?? postSlugByMediaSlug.get(m.slug) ?? null,
    }));

    res.json(enriched);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/media/file', async (req, res) => {
  try {
    const path = String(req.query.path || '');
    if (!path) return res.status(400).json({ error: 'Missing path' });

    const { data, error } = await supabase.storage.from('media').download(path);
    if (error || !data) return res.status(404).end();

    const buf = Buffer.from(await data.arrayBuffer());
    res.setHeader('Content-Type', mime.lookup(path) || 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, max-age=60'); // ajusta si quieres
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noimageindex, noarchive');
    return res.send(buf);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

async function sign(path?: string) {
  if (!path) return undefined;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, TTL);
  return data?.signedUrl;
}

// GET /api/media/:slugOrId  (acepta slug O id)
router.get('/media/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slugOrId);
    const field = isUuid ? 'id' : 'slug';

    const { data: m, error } = await supabase
      .from('media_items')
      .select('*')
      .eq(field, slugOrId)
      .maybeSingle(); // <- no lanza si no hay fila

    if (error) {
      console.error('[media/:slugOrId] DB error:', error);
      return res.status(500).json({ error: 'DB error', detail: error.message });
    }
    if (!m) {
      return res.status(404).json({ error: 'Media not found', where: `${field}=${slugOrId}` });
    }

    const url = await sign(m.storage_path);
    const thumb = await sign(m.thumbnail_path || m.storage_path);

    return res.json({ ...m, url, thumbnailUrl: thumb });
  } catch (e: any) {
    console.error('[media/:slugOrId] Handler error:', e);
    return res.status(500).json({ error: e.message });
  }
});


export default router;
