const CSV_URL_REMOTE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqmDs0N_5ZHMIoXa6IiIrwSysl33ePjsV3hDAYo2tFLLNgyIJKXuH94ZlXbTNfuI4YWAraq01e0-J9/pub?gid=152492302&single=true&output=csv";
const CSV_URL_LOCAL = "./movies.csv";
const RT_LOGO = "./images/rt-logo.png";
const YT_LOGO = "./images/yt-logo.png";
const KNOWN_GENRES = [
	"Mystery & Thriller",
	"Kids & Family",
	"War & History",
	"Drama Fantasy",
	"Sci-Fi",
	"Action",
	"Adventure",
	"Animation",
	"Biography",
	"Comedy",
	"Crime",
	"Documentary",
	"Drama",
	"Family",
	"Fantasy",
	"History",
	"Horror",
	"Music",
	"Musical",
	"Mystery",
	"Romance",
	"Romcom",
	"Sports",
	"Thriller",
	"TV Movie",
	"War",
	"Western",
	"Whodunnit"
];

let data = [];
const activeFilters = {
	year: "",
	genre: ""
};

function parseCSV(text) {
	const rows = [];
	let row = [];
	let cell = "";
	let inQuotes = false;

	for (let i = 0; i < text.length; i += 1) {
		const c = text[i];
		const n = text[i + 1];

		if (c === '"' && inQuotes && n === '"') {
			cell += '"';
			i += 1;
			continue;
		}

		if (c === '"') {
			inQuotes = !inQuotes;
			continue;
		}

		if (c === "," && !inQuotes) {
			row.push(cell);
			cell = "";
			continue;
		}

		if ((c === "\n" || c === "\r") && !inQuotes) {
			if (cell.length || row.length) {
				row.push(cell);
			}
			if (row.length) {
				rows.push(row);
			}
			row = [];
			cell = "";
			if (c === "\r" && n === "\n") {
				i += 1;
			}
			continue;
		}

		cell += c;
	}

	if (cell.length || row.length) {
		row.push(cell);
		rows.push(row);
	}

	return rows;
}

function escapeHtml(value) {
	return String(value || "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function normalizeHeader(value) {
	return String(value || "").trim().toLowerCase();
}

function buildRowObject(headers, row) {
	function pick(...names) {
		for (const name of names) {
			const index = headers.indexOf(normalizeHeader(name));
			if (index !== -1 && row[index]) {
				return String(row[index]).trim();
			}
		}
		return "";
	}

	function pickIndex(index) {
		return row[index] ? String(row[index]).trim() : "";
	}

	return {
		title: pick("title", "movie") || pickIndex(0),
		rotten: pick("rotten tomatoes url", "rotten url", "rotten", "rt url") || pickIndex(1),
		trailer: pick("trailer url", "trailer") || pickIndex(2),
		runtime: pick("runtime") || pickIndex(3),
		genre: pick("genre") || pickIndex(4),
		year: pick("year") || pickIndex(5),
		critics: pick("critics") || pickIndex(6),
		audience: pick("audience") || pickIndex(7),
		synopsis: pick("synopsis", "description", "short description", "overview") || pickIndex(8),
		poster: pick("poster url", "poster", "poster image", "image") || pickIndex(9)
	};
}

function validHttpUrl(value) {
	return /^https?:\/\//i.test(String(value || "").trim());
}

function scoreText(value) {
	const text = String(value || "").trim();
	return text || "--";
}

function sortMovies(a, b) {
	const yearDiff = Number(b.year || 0) - Number(a.year || 0);
	if (yearDiff !== 0) {
		return yearDiff;
	}
	return a.title.localeCompare(b.title);
}

function extractGenreTokens(value) {
	const source = String(value || "").trim();
	if (!source) {
		return [];
	}

	const matches = [];
	for (const genre of KNOWN_GENRES) {
		const pattern = genre
			.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
			.replace(/\s*&\s*/g, "\\s*&\\s*")
			.replace(/\s+/g, "\\s+");
		const regex = new RegExp(`(^|[^A-Za-z])(${pattern})(?=$|[^A-Za-z])`, "ig");
		if (regex.test(source)) {
			matches.push(genre);
		}
	}

	if (matches.length) {
		return matches;
	}

	return source
		.split(/[|/,]/)
		.map((part) => part.trim())
		.filter(Boolean);
}

function renderFilterRow(elementId, label, options, activeValue, type) {
	const el = document.getElementById(elementId);
	if (!el) {
		return;
	}

	const chips = options.map((option) => {
		const activeClass = option.value === activeValue ? " is-active" : "";
		return `<button class="chip${activeClass}" type="button" data-filter-type="${type}" data-filter-value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</button>`;
	}).join("");

	el.innerHTML = `<span class="filter-label">${label}</span>${chips}`;
}

function renderFilters() {
	const years = [...new Set(data.map((movie) => movie.year).filter(Boolean))]
		.sort((a, b) => Number(b) - Number(a))
		.map((year) => ({ label: year, value: year }));

	const genreCounts = new Map();
	for (const movie of data) {
		for (const genre of extractGenreTokens(movie.genre)) {
			genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
		}
	}

	const genres = [...genreCounts.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.slice(0, 8)
		.map(([genre]) => ({ label: genre, value: genre }));

	renderFilterRow("year-filters", "Year", [{ label: "All", value: "" }, ...years], activeFilters.year, "year");
	renderFilterRow("genre-filters", "Genre", [{ label: "All", value: "" }, ...genres], activeFilters.genre, "genre");
}

function makePoster(movie) {
	if (validHttpUrl(movie.poster)) {
		return `
			<div class="poster">
				<img src="${escapeHtml(movie.poster)}" alt="${escapeHtml(movie.title)} poster" loading="lazy" referrerpolicy="no-referrer" />
			</div>
		`;
	}

	return `
		<div class="poster">
			<div class="poster-fallback">${escapeHtml(movie.title)}</div>
		</div>
	`;
}

function makeLinks(movie) {
	const links = [];

	if (validHttpUrl(movie.rotten)) {
		links.push(`
			<a class="logo-link" href="${escapeHtml(movie.rotten)}" target="_blank" rel="noopener" aria-label="Open Rotten Tomatoes page for ${escapeHtml(movie.title)}">
				<img src="${RT_LOGO}" alt="Rotten Tomatoes" />
			</a>
		`);
	}

	if (validHttpUrl(movie.trailer)) {
		links.push(`
			<a class="logo-link" href="${escapeHtml(movie.trailer)}" target="_blank" rel="noopener" aria-label="Open trailer for ${escapeHtml(movie.title)}">
				<img src="${YT_LOGO}" alt="YouTube" />
			</a>
		`);
	}

	return links.join("");
}

function makeCard(movie) {
	const el = document.createElement("article");
	el.className = "card";

	const year = movie.year ? `<span class="year">(${escapeHtml(movie.year)})</span>` : "";
	const metaParts = [movie.genre, movie.runtime].filter(Boolean).map(escapeHtml);
	const metaLine = metaParts.length ? `<div class="meta-line">${metaParts.join(" | ")}</div>` : "";
	const synopsis = movie.synopsis ? `<div class="synopsis" role="button" tabindex="0" aria-expanded="false" title="Toggle full synopsis">${escapeHtml(movie.synopsis)}</div>` : "";
	const links = makeLinks(movie);

	el.innerHTML = `
		${makePoster(movie)}
		<div class="content">
			<div class="title-row">
				<h2 class="title">${escapeHtml(movie.title)}</h2>
				${year}
			</div>
			${metaLine}
			${synopsis}
			<div class="scoreboard">
				<div class="score-block">
					<span class="score-label">Critics</span>
					<span class="score-value">${escapeHtml(scoreText(movie.critics))}</span>
				</div>
				<div class="score-block">
					<span class="score-label">Audience</span>
					<span class="score-value">${escapeHtml(scoreText(movie.audience))}</span>
				</div>
			</div>
			<div class="links">${links}</div>
		</div>
	`;

	return el;
}

function render(filter = "") {
	const grid = document.getElementById("grid");
	const query = String(filter || "").trim().toLowerCase();
	const filtered = data.filter((movie) => {
		const matchesQuery = !query || [
			movie.title,
			movie.genre,
			movie.year,
			movie.runtime,
			movie.synopsis
		].some((value) => String(value || "").toLowerCase().includes(query));
		const matchesYear = !activeFilters.year || movie.year === activeFilters.year;
		const matchesGenre = !activeFilters.genre || extractGenreTokens(movie.genre).includes(activeFilters.genre);
		return matchesQuery && matchesYear && matchesGenre;
	});

	grid.innerHTML = "";

	if (!filtered.length) {
		grid.innerHTML = `<div class="empty">No movies matched that search.</div>`;
	} else {
		for (const movie of filtered) {
			grid.appendChild(makeCard(movie));
		}
	}

	const countText = `${filtered.length} movie${filtered.length === 1 ? "" : "s"}`;
	document.getElementById("status").textContent = countText;
	document.getElementById("header-summary").textContent = `Search by title, ${countText}`;
}

function applyHeaderState(expanded) {
	const topbar = document.querySelector(".topbar");
	const toggle = document.getElementById("header-toggle");
	topbar.classList.toggle("is-collapsed", !expanded);
	toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
	toggle.textContent = expanded ? "Collapse" : "Expand";
}

async function loadCsvText() {
	try {
		const localResponse = await fetch(CSV_URL_LOCAL, { cache: "no-store" });
		if (localResponse.ok) {
			return await localResponse.text();
		}
	} catch (_error) {
		// Ignore local file failures and fall back to the published sheet.
	}

	const remoteResponse = await fetch(CSV_URL_REMOTE, { cache: "no-store" });
	if (!remoteResponse.ok) {
		throw new Error(`CSV fetch failed with status ${remoteResponse.status}`);
	}
	return await remoteResponse.text();
}

async function init() {
	const mobileMedia = window.matchMedia("(max-width: 767px)");
	const text = await loadCsvText();
	const rows = parseCSV(text);
	if (!rows.length) {
		throw new Error("CSV did not contain any rows.");
	}

	const headers = rows[0].map(normalizeHeader);
	data = rows
		.slice(1)
		.filter((row) => row.some((value) => String(value || "").trim()))
		.map((row) => buildRowObject(headers, row))
		.filter((movie) => movie.title)
		.sort(sortMovies);

	renderFilters();
	render();

	document.getElementById("q").addEventListener("input", (event) => {
		render(event.target.value);
	});

	document.getElementById("grid").addEventListener("click", (event) => {
		const synopsis = event.target.closest(".synopsis");
		if (!synopsis) {
			return;
		}

		const expanded = synopsis.classList.toggle("is-expanded");
		synopsis.setAttribute("aria-expanded", expanded ? "true" : "false");
	});

	document.getElementById("grid").addEventListener("keydown", (event) => {
		const synopsis = event.target.closest(".synopsis");
		if (!synopsis) {
			return;
		}

		if (event.key !== "Enter" && event.key !== " ") {
			return;
		}

		event.preventDefault();
		const expanded = synopsis.classList.toggle("is-expanded");
		synopsis.setAttribute("aria-expanded", expanded ? "true" : "false");
	});

	document.querySelector(".filters").addEventListener("click", (event) => {
		const chip = event.target.closest(".chip");
		if (!chip) {
			return;
		}

		const type = chip.getAttribute("data-filter-type");
		const value = chip.getAttribute("data-filter-value") || "";
		activeFilters[type] = value;
		renderFilters();
		render(document.getElementById("q").value);
	});

	const toggle = document.getElementById("header-toggle");
	let headerExpanded = !mobileMedia.matches;
	applyHeaderState(headerExpanded);

	toggle.addEventListener("click", () => {
		headerExpanded = !headerExpanded;
		applyHeaderState(headerExpanded);
	});

	mobileMedia.addEventListener("change", (event) => {
		headerExpanded = !event.matches;
		applyHeaderState(headerExpanded);
	});
}

init().catch((error) => {
	console.error(error);
	document.getElementById("status").textContent = "Failed to load movies";
	document.getElementById("grid").innerHTML = `<div class="empty">The movie list could not be loaded.</div>`;
});
