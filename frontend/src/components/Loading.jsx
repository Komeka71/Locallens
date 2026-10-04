import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Art } from "./Art";

const STEPS = [
  "Reading your request",
  "Searching live local listings",
  "Comparing ratings, prices & hours",
  "Assembling your plan",
];

const SPINNER_ART = ["pizza", "coffee", "bowling", "clapper", "cocktail", "icecream"];

export default function Loading() {
  const [step, setStep] = useState(0);
  const [artIndex, setArtIndex] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      3200
    );
    const artTimer = setInterval(
      () => setArtIndex((i) => (i + 1) % SPINNER_ART.length),
      1300
    );
    return () => {
      clearInterval(stepTimer);
      clearInterval(artTimer);
    };
  }, []);

  return (
    <main className="loading-screen" aria-live="polite">
      <div className="loader">
        <div className="loader-ring" />
        <div className="loader-ring r2" />
        <Art key={artIndex} name={SPINNER_ART[artIndex]} size={64} className="loader-art" />
      </div>

      <h2>Building your plan</h2>
      <p>Every place in your plan comes from real search results — nothing is made up.</p>

      <ol className="loading-steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`loading-step ${i < step ? "done" : ""} ${i === step ? "active" : ""}`}
          >
            <span className="dot">{i < step ? <Check size={13} /> : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
    </main>
  );
}
