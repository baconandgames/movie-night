# Movie Night

Small static microsite for browsing a movie list published from Google Sheets.

## Current Setup

- App entrypoint: `index.html`
- Static assets: `images/`
- Data source: published Google Sheets CSV
- Production site: `https://baconandgames.github.io/movie-night/`

The page renders mobile-friendly movie cards with:

- poster
- title and year
- genre and runtime
- critics and audience scores
- expandable synopsis
- Rotten Tomatoes and trailer links
- text search
- year and genre filter chips

## Data Shape

The site expects the sheet/CSV in this order:

1. `Title`
2. `Rotten Tomatoes URL`
3. `Trailer URL`
4. `Runtime`
5. `Genre`
6. `Year`
7. `Critics`
8. `Audience`
9. `Synopsis`
10. `Poster URL`

The parser prefers matching by header name, but also falls back to these column positions.

## Local Testing

For local testing, place a `movies.csv` file next to `index.html`. If `movies.csv` is not present, the page falls back to the published Google Sheets CSV.

```bash
cd /Users/sjm/Sites/movie-night
python3 -m http.server 8000
open http://localhost:8000/
```

## Deployment

This repo is deployed with GitHub Pages from `main` at the repository root.

## Version Note

The footer version on the page is the easiest way to confirm whether GitHub Pages has picked up the latest deploy.

### Credits
Favicon design by: <a href="https://www.flaticon.com/free-icons/popcorn" title="popcorn icons">Popcorn icons created by Mihimihi - Flaticon</a>
