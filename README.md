# Movie Night

Static mobile-friendly page showing movies from a Google Sheet.

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