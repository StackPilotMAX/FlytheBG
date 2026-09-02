"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage(){
 const [stars,setStars]=useState<number|null>(null); const [forks,setForks]=useState<number|null>(null);
 useEffect(()=>{fetch("https://api.github.com/repos/StackPilotMAX/FlytheBG").then(r=>r.ok?r.json():null).then(d=>{if(d){setStars(d.stargazers_count);setForks(d.forks_count);}}).catch(()=>{});},[]);
 return <main className="featurePage dashboardPage"><section className="pageHero compactHero"><div className="shell narrowHero"><span className="eyebrow"><i/> FlytheBG Dashboard</span><h1>Project pulse.</h1><p>A simple public-facing project dashboard for the people using and supporting FlytheBG.</p><div className="dashboardActions"><Link className="buttonPrimary" href="/donate">📖 Buy Me a Book <span>↗</span></Link><Link className="buttonSecondary" href="/features">Explore tools</Link></div><div className="infoCards"><article><span>GitHub stars</span><h2>{stars === null ? "…" : stars.toLocaleString()}</h2><p>Live count from the FlytheBG repository.</p><a className="textLink" href="https://github.com/StackPilotMAX/FlytheBG" target="_blank" rel="noreferrer">View repository ↗</a></article><article><span>Forks</span><h2>{forks === null ? "…" : forks.toLocaleString()}</h2><p>Current public repository fork count.</p></article><article><span>Tools</span><h2>3</h2><p>Background remover, passport photo maker, and AI watermark-removal workspace.</p><Link className="textLink" href="/features">Explore tools ↗</Link></article></div></div></section></main>;
}
