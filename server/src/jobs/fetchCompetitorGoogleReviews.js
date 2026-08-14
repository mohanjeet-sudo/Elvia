import 'dotenv/config';
import { pool } from '../db/pool.js';
import { fetchCompetitorReviews } from '../services/googlePlaces.js';

const UPSERT_SQL = `
  insert into reviews (competitor_id, platform, external_review_id, author, rating, review_date, text)
  values ($1, 'google', $2, $3, $4, $5, $6)
  on conflict (platform, external_review_id)
  do update set author = excluded.author, rating = excluded.rating,
    review_date = excluded.review_date, text = excluded.text
`;

export async function fetchAllCompetitorGoogleReviews() {
  const { rows: competitors } = await pool.query(
    'select id, name, google_place_id from competitors where google_place_id is not null'
  );

  const summary = [];
  for (const competitor of competitors) {
    const { rating, userRatingCount, reviews } = await fetchCompetitorReviews(competitor.google_place_id);

    for (const r of reviews) {
      await pool.query(UPSERT_SQL, [
        competitor.id,
        r.external_review_id,
        r.author,
        r.rating,
        r.review_date,
        r.text,
      ]);
    }

    summary.push({ competitor: competitor.name, rating, userRatingCount, reviewsFetched: reviews.length });
  }

  return summary;
}

// Allows running this job standalone: node src/jobs/fetchCompetitorGoogleReviews.js
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAllCompetitorGoogleReviews()
    .then((summary) => {
      console.log(JSON.stringify(summary, null, 2));
      return pool.end();
    })
    .catch((err) => {
      console.error('Fetch failed:', err.message);
      process.exit(1);
    });
}
