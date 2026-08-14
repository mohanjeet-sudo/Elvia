import 'dotenv/config';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1';

// Google's Places API (New) caps this at ~5 "most relevant" reviews per
// listing, with no pagination — a hard limit, not something we control.
export async function fetchCompetitorReviews(placeId) {
  const res = await fetch(`${BASE_URL}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Places API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  const reviews = (data.reviews || []).map((r) => ({
    external_review_id: r.name,
    author: r.authorAttribution?.displayName || null,
    rating: r.rating ?? null,
    review_date: r.publishTime ? r.publishTime.slice(0, 10) : null,
    text: r.text?.text || r.originalText?.text || null,
  }));

  return { rating: data.rating ?? null, userRatingCount: data.userRatingCount ?? null, reviews };
}
