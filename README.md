# Movie Night

Static mobile-friendly page showing movies from a Google Sheet. Each movie card can now include links to a trailer and the corresponding Rotten Tomatoes page.

## Deploying to GitHub Pages

1. Create a new repository on GitHub (e.g. `movie-night`).
1. In your local folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin git@github.com:baconandgames/movie-night.git
   git branch -M main
   git push -u origin main
   ```
2. In the repository Settings > Pages, set the source to **main branch** and root (not `/docs`).
3. Save; GitHub will publish at `https://<your-username>.github.io/movie-night/`.

(Optional) Add a `.nojekyll` file if you want to disable Jekyll processing:
```bash
touch .nojekyll
```

Local testing notes
-------------------

You can test the site locally by placing a CSV file named `movies.csv` next to `index.html` (a sample `movies.csv` is included). The page will try to load `./movies.csv` first; if it doesn't exist it will fall back to the published Google Sheet URL used in production.

Run a simple local server from the project folder and open the site in your browser:

```bash
cd /Users/sjm/Sites/movie-night
python3 -m http.server 8000
open http://localhost:8000/
```

When you're ready to deploy, remove or ignore `movies.csv` and the site will fetch the live sheet.