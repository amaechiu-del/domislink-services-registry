export const lifecycles = ['planned', 'discovery', 'development', 'migration', 'ready', 'retired'];

const serviceFields = 'id, name, category, lifecycle, repository, base_url, environment, owner, updated_at';

export async function listServices(db, params) {
  const query = (params.get('q') ?? '').trim();
  const category = params.get('category');
  const lifecycle = params.get('lifecycle');
  const environment = params.get('environment');
  const limit = Number(params.get('limit') ?? 250);
  const cursor = params.get('cursor');
  if (query.length > 120 || category?.length > 64 || environment?.length > 64 ||
      (lifecycle !== null && !lifecycles.includes(lifecycle)) ||
      !Number.isInteger(limit) || limit < 1 || limit > 250 || cursor?.length > 64) {
    return null;
  }

  const conditions = [];
  const values = [];
  if (query) {
    conditions.push(`(instr(lower(id), lower(?)) OR instr(lower(name), lower(?))
      OR instr(lower(repository), lower(?)))`);
    values.push(query, query, query);
  }
  for (const [column, value] of Object.entries({ category, lifecycle, environment })) {
    if (value !== null) {
      conditions.push(`${column} = ?`);
      values.push(value);
    }
  }
  if (cursor !== null) {
    const anchor = await db.prepare('SELECT name FROM services WHERE id = ?').bind(cursor).first();
    if (!anchor) return null;
    conditions.push('(name, id) > (?, ?)');
    values.push(anchor.name, cursor);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { results } = await db.prepare(`
    SELECT ${serviceFields} FROM services ${where} ORDER BY name, id LIMIT ?
  `).bind(...values, limit + 1).all();
  const services = results.slice(0, limit);
  return { services, nextCursor: results.length > limit ? services.at(-1).id : null };
}

export async function getService(db, id) {
  const [service, dependencies, health] = await db.batch([
    db.prepare('SELECT * FROM services WHERE id = ?').bind(id),
    db.prepare(`
      SELECT s.id, s.name, s.lifecycle FROM service_dependencies AS d
      JOIN services AS s ON s.id = d.dependency_id
      WHERE d.service_id = ? ORDER BY s.name, s.id
    `).bind(id),
    db.prepare(`
      SELECT status, checked_at FROM health_observations
      WHERE service_id = ? ORDER BY checked_at DESC, id DESC LIMIT 1
    `).bind(id)
  ]);
  if (!service.results.length) return null;
  return {
    service: service.results[0],
    dependencies: dependencies.results,
    health: health.results[0] ?? null
  };
}
