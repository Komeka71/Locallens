import {
  ArrowRight,
  Ban,
  Check,
  Clock3,
  MessageSquareText,
  Radar,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { Art } from "./Art";

/* ---------------- floating clip-art around the hero ---------------- */

export function HeroDoodles() {
  const items = [
    ["pizza", 70, "doodle d-a"],
    ["coffee", 58, "doodle d-b"],
    ["bowling", 64, "doodle d-c"],
    ["cocktail", 60, "doodle d-d"],
    ["clapper", 56, "doodle d-e"],
    ["icecream", 54, "doodle d-f"],
  ];

  return (
    <div className="doodles" aria-hidden="true">
      {items.map(([name, size, cls]) => (
        <Art key={name} name={name} size={size} className={cls} />
      ))}
    </div>
  );
}

/* ---------------- scrolling strip of things you can plan ---------------- */

const STRIP = [
  ["pizza", "Dinner"],
  ["coffee", "Cafes"],
  ["bowling", "Bowling"],
  ["clapper", "Movies"],
  ["cocktail", "Lounges"],
  ["gamepad", "Arcades"],
  ["icecream", "Dessert"],
  ["ramen", "Street food"],
  ["burger", "Burgers"],
  ["pin", "Hidden spots"],
];

export function Marquee() {
  const row = (hidden) =>
    STRIP.map(([art, label]) => (
      <span className="marquee-item" key={`${hidden ? "b" : "a"}-${label}`} aria-hidden={hidden}>
        <Art name={art} size={30} />
        {label}
      </span>
    ));

  return (
    <div className="marquee" aria-label="Things LocalLens can plan">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/* ---------------- what is LocalLens ---------------- */

export function Explainer() {
  const flow = [
    { art: "sparkle", title: "Your words", text: "“₹2000, 4 friends, Saturday”" },
    { art: "pin", title: "Live search", text: "Real places from Google Maps data" },
    { art: "cloche", title: "AI picks", text: "Only from what was found" },
    { art: "clapper", title: "Your plan", text: "Dinner + activity, ready to go" },
  ];

  return (
    <section className="section" id="what">
      <div className="section-head">
        <span className="eyebrow">WHAT IS LOCALLENS</span>
        <h2>An outing planner that checks the real world first.</h2>
        <p>
          Tell LocalLens where you are, who’s coming and what you can spend. It
          searches current local listings, then an AI picks a sensible
          combination — a place to eat, a thing to do — from those real results
          only. You get a plan with ratings, hours, price info and one-tap
          directions, not a paragraph of guesses.
        </p>
      </div>

      <div className="flow">
        {flow.map((step, i) => (
          <div className="flow-node-wrap" key={step.title}>
            <div className="flow-node">
              <div className="flow-art">
                <Art name={step.art} size={52} />
              </div>
              <strong>{step.title}</strong>
              <span>{step.text}</span>
            </div>
            {i < flow.length - 1 && (
              <ArrowRight size={20} className="flow-arrow" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- how it works ---------------- */

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      art: "gamepad",
      title: "Describe your outing",
      text: "Use the guided form or just type it naturally — city, group size, budget, mood.",
    },
    {
      n: "02",
      art: "ramen",
      title: "We search live listings",
      text: "Restaurants, cafes and activities near you are fetched fresh for every request.",
    },
    {
      n: "03",
      art: "bowling",
      title: "Get a plan you can follow",
      text: "A recommended combo, plus more options. Save favourites, share on WhatsApp, open directions.",
    },
  ];

  return (
    <section className="section" id="how">
      <div className="section-head">
        <span className="eyebrow">HOW IT WORKS</span>
        <h2>From “what should we do?” to a plan in seconds.</h2>
      </div>

      <div className="steps-grid">
        {steps.map((s) => (
          <div className="step-card" key={s.n}>
            <div className="step-top">
              <span className="step-num">{s.n}</span>
              <Art name={s.art} size={58} />
            </div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- LocalLens vs a plain chatbot ---------------- */

const ROWS = [
  {
    icon: Radar,
    label: "Where places come from",
    llm: "Recalled from training data — can name places that closed or never existed.",
    ll: "Pulled from live local search. A pick that isn’t in the results is rejected.",
  },
  {
    icon: Clock3,
    label: "Opening hours",
    llm: "Guessed, or out of date.",
    ll: "Shows the listing’s hours and flags when they were actually found.",
  },
  {
    icon: Wallet,
    label: "Prices & budget",
    llm: "Confident-sounding numbers with no source.",
    ll: "Uses price data from the listing only; otherwise says “unavailable”.",
  },
  {
    icon: ShieldCheck,
    label: "Ratings",
    llm: "Remembered impressions.",
    ll: "Current rating and review count from the listing.",
  },
  {
    icon: MessageSquareText,
    label: "What you get back",
    llm: "A wall of text to copy into Maps yourself.",
    ll: "Plan cards with directions, website, save and share.",
  },
];

export function Compare() {
  return (
    <section className="section" id="why">
      <div className="section-head">
        <span className="eyebrow">WHY NOT JUST ASK A CHATBOT?</span>
        <h2>Same question. Very different answer.</h2>
        <p>
          A general chatbot answers from memory. LocalLens answers from what’s
          out there right now.
        </p>
      </div>

      <div className="compare">
        <div className="compare-head">
          <span />
          <span className="col-llm">
            <Ban size={14} /> A plain chatbot
          </span>
          <span className="col-ll">
            <Check size={14} /> LocalLens
          </span>
        </div>

        {ROWS.map(({ icon: Icon, label, llm, ll }) => (
          <div className="compare-row" key={label}>
            <div className="compare-label">
              <Icon size={16} />
              {label}
            </div>
            <div className="compare-cell llm">
              <X size={15} className="mark" aria-label="Weak" />
              <span>{llm}</span>
            </div>
            <div className="compare-cell ll">
              <Check size={15} className="mark" aria-label="Strong" />
              <span>{ll}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- one-click starter prompts ---------------- */

const EXAMPLES = [
  {
    art: "cocktail",
    title: "Date night",
    text: "I'm in Ahmedabad. I have ₹3000 for 2 people. A romantic dinner on Friday night followed by something relaxing.",
  },
  {
    art: "bowling",
    title: "Friends' Saturday",
    text: "I'm in Ahmedabad. I have ₹2000 for 4 people. I want a fun Saturday evening with dinner and an activity.",
  },
  {
    art: "burger",
    title: "Family Sunday",
    text: "I'm in Ahmedabad. I have ₹4000 for 5 people including 2 kids. Sunday lunch plus a kid-friendly activity.",
  },
  {
    art: "coffee",
    title: "Quiet cafe",
    text: "I'm in Ahmedabad. I have ₹600 for 2 people. A calm cafe with good coffee where we can talk.",
  },
];

export function Examples({ onPick }) {
  return (
    <section className="section" id="examples">
      <div className="section-head">
        <span className="eyebrow">NEED AN IDEA?</span>
        <h2>Start from an example.</h2>
        <p>Tap one to drop it into the planner, then edit it however you like.</p>
      </div>

      <div className="example-grid">
        {EXAMPLES.map((ex) => (
          <button type="button" className="example-card" key={ex.title} onClick={() => onPick(ex.text)}>
            <Art name={ex.art} size={54} />
            <strong>{ex.title}</strong>
            <span>{ex.text}</span>
            <em>
              Use this <ArrowRight size={14} />
            </em>
          </button>
        ))}
      </div>
    </section>
  );
}
