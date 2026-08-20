"use client";

import { useState } from "react";

type Sample = {
  name: string;
  src: string;
  source: string;
  credit: string;
  backgroundClass: string;
  objectClass?: string;
};

const samples: Sample[] = [
  {
    name: "Everyday shoe",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Worn_Shoe.png/960px-Worn_Shoe.png",
    source: "https://commons.wikimedia.org/wiki/File:Worn_Shoe.png",
    credit: "Aupajo · CC0 public-domain dedication",
    backgroundClass: "sampleBgStreet",
  },
  {
    name: "Strawberry",
    src: "https://upload.wikimedia.org/wikipedia/commons/8/86/Strawberry_%28transparent_background%29.png",
    source: "https://commons.wikimedia.org/wiki/File:Strawberry_(transparent_background).png",
    credit: "Paolo Neo / MatthewHoobin · CC0 public-domain dedication",
    backgroundClass: "sampleBgKitchen",
    objectClass: "sampleObjectTall",
  },
  {
    name: "Blue flower",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Blue_Flower_Transparent_Background.png/960px-Blue_Flower_Transparent_Background.png",
    source: "https://commons.wikimedia.org/wiki/File:Blue_Flower_Transparent_Background.png",
    credit: "JOGOS Public Assets · CC0 public-domain dedication",
    backgroundClass: "sampleBgGarden",
  },
];

function SampleCard({ sample }: { sample: Sample }) {
  const [position, setPosition] = useState(52);
  return (
    <article className="realSampleCard">
      <div className="realSampleHeader"><div><span>Real CC0 photo</span><h3>{sample.name}</h3></div><b>{position}% reveal</b></div>
      <div className="realSampleStage">
        <div className={`sampleHalf sampleBefore ${sample.backgroundClass}`}>
          <img loading="lazy" decoding="async" src={sample.src} alt={`${sample.name} shown over a sample background`} className={sample.objectClass || ""}/>
          <span>Before · with background</span>
        </div>
        <div className="sampleHalf sampleAfter" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
          <img loading="lazy" decoding="async" src={sample.src} alt={`${sample.name} on a transparent checkerboard`} className={sample.objectClass || ""}/>
          <span>After · transparent</span>
        </div>
        <div className="sampleSplit" style={{ left: `${position}%` }} aria-hidden="true"><i>↔</i></div>
        <input
          className="sampleRange"
          type="range"
          min="0"
          max="100"
          value={position}
          aria-label={`Compare before and after for ${sample.name}`}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </div>
      <div className="realSampleFooter"><p>Drag the slider to compare a background composition with the transparent CC0 cutout.</p><a href={sample.source} target="_blank" rel="noreferrer">{sample.credit} ↗</a></div>
    </article>
  );
}

export function BeforeAfterSamples() {
  return (
    <section className="section realSamplesSection" aria-labelledby="real-samples-title">
      <div className="shell">
        <div className="sectionHeading splitHeading"><div><span className="eyebrow"><i/> Real-life examples</span><h2 id="real-samples-title">Slide between background and transparency.</h2><p>These demo subjects are real photographs released under CC0/public-domain dedication on Wikimedia Commons. They demonstrate the visual difference without pretending a staged example is a guaranteed model result.</p></div></div>
        <div className="realSampleGrid">{samples.map((sample) => <SampleCard key={sample.name} sample={sample}/>)}</div>
      </div>
    </section>
  );
}
