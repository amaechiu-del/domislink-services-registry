/**
 * Run on the server. The caller supplies the signed-in operator's Registry token.
 */
export function createRegistryClient({ origin, accessToken, fetchImpl = fetch }) {
  const base = new URL(origin);
  if (base.protocol !== 'https:' || base.origin !== origin) {
    throw new TypeError('Registry origin must be an HTTPS origin');
  }
  if (typeof accessToken !== 'string' || !accessToken || /\s/.test(accessToken)) {
    throw new TypeError('A Registry access token is required');
  }

  async function get(path, filters) {
    const url = new URL(path, base);
    if (filters) {
      for (const key of ['q', 'category', 'lifecycle', 'environment', 'limit', 'cursor']) {
        if (filters[key] != null) url.searchParams.set(key, filters[key]);
      }
    }
    const response = await fetchImpl(url, {
      headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) {
      const error = new Error(`Registry request failed (HTTP ${response.status})`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  return {
    listServices: filters => get('/v1/services', filters),
    getService(id) {
      if (typeof id !== 'string' || !/^[a-z][a-z0-9-]{1,63}$/.test(id)) {
        throw new TypeError('Invalid service ID');
      }
      return get(`/v1/services/${id}`);
    }
  };
}
