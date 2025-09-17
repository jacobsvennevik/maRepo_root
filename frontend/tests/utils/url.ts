export function joinUrl(base: string, path: string): string {
  if (!base) return path || '';
  if (!path) return base;
  const trimmedBase = base.replace(/\/+$/, '');
  const trimmedPath = path.replace(/^\/+/, '');
  return `${trimmedBase}/${trimmedPath}`;
}

export function hasDoubleSlash(url: string): boolean {
  const withoutProtocol = url.replace(/^[a-z]+:\/\//i, '');
  return /\/\//.test(withoutProtocol);
}

export function ensureTrailingSlash(url: string): string {
  if (!url) return '/';
  return url.endsWith('/') ? url : `${url}/`;
}

export default { joinUrl, hasDoubleSlash, ensureTrailingSlash };
