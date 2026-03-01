# Movie Night Web App -- Project Context

## Overview

This is a simple, mobile-friendly webpage that displays a list of movies
stored in a Google Sheet.

The Google Sheet is published as CSV and acts as the data source.

The webpage: - Fetches the CSV - Parses it - Renders each row as a
clean, responsive card - Is designed primarily for mobile use

It is currently being run locally via:

python3 -m http.server 8000

and accessed at:

http://localhost:8000

This is not yet deployed to GitHub Pages.

------------------------------------------------------------------------

## Data Source

Google Sheet (published as CSV):

https://docs.google.com/spreadsheets/d/e/2PACX-1vRqmDs0N_5ZHMIoXa6IiIrwSysl33ePjsV3hDAYo2tFLLNgyIJKXuH94ZlXbTNfuI4YWAraq01e0-J9/pub?gid=152492302&single=true&output=csv

The sheet has headers similar to:

-   Movie
-   Rotten URL
-   Trailer URL
-   Runtime
-   Genre
-   Year
-   Critics
-   Audience

Important: - URL columns contain raw URLs (not hyperlink text) - The CSV
must be parsed and mapped exactly to these headers

------------------------------------------------------------------------

## Current Behavior

-   CSV is fetched via fetch()
-   A simple CSV parser converts it to rows
-   Header row is used to map column indices
-   Each movie is rendered as a card
-   Trailer button only appears if a valid URL exists
-   Page includes a search input that filters results by:
    -   Movie
    -   Genre
    -   Year

Layout: - Single column on mobile - Two columns on wider screens - Clean
card UI - System font stack

------------------------------------------------------------------------

## Known Constraints

-   No backend
-   No database
-   No authentication
-   No frameworks
-   Pure HTML + CSS + vanilla JS
-   Must remain simple and lightweight
-   Designed for personal use

------------------------------------------------------------------------

## Goals Going Forward

Possible next steps (not yet implemented):

1.  Add sorting (by Critics score or Audience score)
2.  Add genre filter buttons
3.  Add "Random Movie" button
4.  Improve card visual polish
5.  Add Rotten Tomatoes link button in addition to Trailer
6.  Improve CSV parsing robustness if needed
7.  Prepare for GitHub Pages deployment

------------------------------------------------------------------------

## Design Philosophy

-   Minimal
-   Clean
-   Fast
-   Zero dependencies
-   No overengineering
-   Works well on mobile first

------------------------------------------------------------------------

## Important Implementation Notes

-   Do not rely on Google Sheets hyperlink metadata --- CSV only exports
    visible cell values.
-   Column names in JS must match the CSV headers exactly
    (case-insensitive).
-   Links should only render if they start with "http".
-   App must gracefully handle missing trailer or rotten URL fields.

------------------------------------------------------------------------

## What This Is Not

-   Not a full app
-   Not a React project
-   Not a framework-heavy build
-   Not a production SaaS
-   Not a database-backed system

It is intentionally small and static.
