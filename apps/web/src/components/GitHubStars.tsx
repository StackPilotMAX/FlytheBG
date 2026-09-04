"use client";

import { useEffect, useState } from "react";

const REPO = "StackPilotMAX/FlytheBG";
const CACHE_KEY = "flythebg:github-stars";
const CACHE_TTL = 10 * 60 * 1000;

function formatStars(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return value.toLocaleString();
}

export function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && Date.now() - cached.time < CACHE_TTL && Number.isFinite(cached.stars)) {
        setStars(cached.stars);
      }
    } catch {}

    fetch(`https://api.github.com/repos/${REPO}`, { headers: { Accept: "application/vnd.github+json" } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("GitHub request failed")))
      .then((data) => {
        if (cancelled || !Number.isFinite(data.stargazers_count)) return;
        setStars(data.stargazers_count);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ stars: data.stargazers_count, time: Date.now() })); } catch {}
      })
      .catch(() => undefined);

    return () => { cancelled = true; };
  }, []);

  return (
    <a className="githubStars" href={`https://github.com/${REPO}`} target="_blank" rel="noreferrer" aria-label="Star FlyThe BG on GitHub">
      <span className="githubStarsGithub" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 .7a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.24c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.45 11.45 0 0 1 6-.01c2.29-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .7Z"/></svg>
      </span>
      <span className="githubStarsCopy"><strong>Open source</strong><span>FlyThe BG</span></span>
      <span className="githubStarsCount" aria-live="polite"><span aria-hidden="true">★</span>{stars === null ? "—" : formatStars(stars)}</span>
    </a>
  );
}
