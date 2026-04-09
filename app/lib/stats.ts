
import {redis} from './redis';

export async function trackPageView(page: String) {
    const key = `pageviews:${page}`;
    const count = await redis.incr(key);
    return count;
}

export async function getPageViews(page: String) {
    const count = await redis.get(`pageviews:${page}`);

    return parseInt(count || '0');
}

export async function trackPopularPage(page: string) {
  // ZINCRBY incrémente le score d'un membre
  await redis.zincrby('popular:pages', 1, page);
}

export async function getTopPages(limit = 10) {
  // ZREVRANGE : du score le plus élevé au plus bas
  const results = await redis.zrevrange('popular:pages', 0, limit - 1, 'WITHSCORES');

  // Reformater [page, score, page, score...] → [{page, views}]
  const pages = [];
  for (let i = 0; i < results.length; i += 2) {
    pages.push({ page: results[i], views: parseInt(results[i + 1]) });
  }
  return pages;
}