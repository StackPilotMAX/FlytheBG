"use client";
import { useEffect, useState } from "react";

const REPO_URL = "https://github.com/StackPilotMAX/FlytheBG";
const API_URL = "https://api.github.com/repos/StackPilotMAX/FlytheBG";

export function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = window.sessionStorage.getItem("flythebg:github-stars");
    if (cached) {
      const n = Number(cached);
      if (Number.isFinite(n)) setStars(n);
    }

    fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("GitHub unavailable"))))
      .then((data) => {
        if (cancelled || !Number.isFinite(data?.stargazers_count)) return;
        const n = Number(data.stargazers_count);
        setStars(n);
        window.sessionStorage.setItem("flythebg:github-stars", String(n));
      })
      .catch(() => undefined);

    return () => { cancelled = true; };
  }, []);

  return (
    <a className="githubStars" href={REPO_URL} target="_blank" rel="noreferrer" aria-label="FLYTHEBG on GitHub">
      <span className="githubStarsIcon" aria-hidden="true">★</span>
      <span>GitHub</span>
      <strong>{stars === null ? "—" : stars}</strong>
      <span className="githubStarsLabel">stars</span>
    </a>
  );
}
