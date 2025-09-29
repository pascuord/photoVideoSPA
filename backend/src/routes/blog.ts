import { Router } from 'express';
import { supabase } from '../db/supabase';

const router = Router();
const BUCKET = 'media'; // <- usa el nombre real de tu bucket
const TTL_SEC = 900; // 15 minutos

async function signed(path?: string) {
  if (!path) return undefined;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, TTL_SEC);
  if (error) return undefined;
  return data?.signedUrl;
}

router.get('/blog', async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 20);

    // 1) Lee posts (según tu esquema)
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, body, cover_image, linked_media_id, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // 2) Para cada post, firma cover y trae media vinculado si existe
    const enriched = await Promise.all(
      (posts ?? []).map(async (p) => {
        const coverUrl = await signed(p.cover_image);

        let linkedMedia: any = undefined;
        if (p.linked_media_id) {
          const { data: m } = await supabase
            .from('media_items')
            .select(
              'id, slug, type, title, storage_path, thumbnail_path, watermark_text, created_at',
            )
            .eq('id', p.linked_media_id)
            .single();

          if (m) {
            linkedMedia = {
              id: m.id,
              slug: m.slug,
              type: m.type,
              title: m.title,
              watermark_text: m.watermark_text,
              created_at: m.created_at,
              url: await signed(m.storage_path),
              thumbnailUrl: await signed(m.thumbnail_path || m.storage_path),
            };
          }
        }

        // 3) Devolvemos solo lo necesario para el listado
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          created_at: p.created_at,
          coverUrl,
          linkedMedia,
          body: p.body, // si lo quieres también en el listado
        };
      }),
    );

    res.json(enriched);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/blog/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: p, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, body, cover_image, linked_media_id, created_at')
      .eq('slug', slug)
      .single();

    if (error || !p) return res.status(404).json({ error: 'Post not found' });

    const coverUrl = await signed(p.cover_image);

    let linkedMedia: any = undefined;
    if (p.linked_media_id) {
      const { data: m } = await supabase
        .from('media_items')
        .select('id, slug, type, title, storage_path, thumbnail_path, watermark_text, created_at')
        .eq('id', p.linked_media_id)
        .single();

      if (m) {
        linkedMedia = {
          id: m.id,
          slug: m.slug,
          type: m.type,
          title: m.title,
          watermark_text: m.watermark_text,
          created_at: m.created_at,
          url: await signed(m.storage_path),
          thumbnailUrl: await signed(m.thumbnail_path || m.storage_path),
        };
      }
    }

    res.json({
      id: p.id,
      slug: p.slug,
      title: p.title,
      body: p.body,
      created_at: p.created_at,
      coverUrl,
      linkedMedia,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
