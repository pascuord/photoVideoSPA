export const CONTENT_TYPES = new Set(['image', 'video', 'post', 'song', 'course_module']);

export function isValidContentType(v: any): v is string {
  return typeof v === 'string' && CONTENT_TYPES.has(v);
}

export function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}
