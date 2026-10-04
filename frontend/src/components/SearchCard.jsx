import { useState } from "react";
import {
  ArrowRight,
  History,
  MapPin,
  Minus,
  PenLine,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

const WHEN = ["Tonight", "Saturday evening", "Sunday lunch", "Weekday evening"];
const VIBES = ["Date night", "Friends hangout", "Family", "Birthday", "Chill", "Foodie"];
const INCLUDES = ["Dinner", "Cafe", "Activity", "Movie"];
const BUDGETS = [500, 1000, 2000, 5000];

function composeRequest({ city, people, budget, when, vibes, includes }) {
  const parts = [`I'm in ${city.trim()}.`];

  if (budget) {
    parts.push(
      `I have ₹${budget} for ${people} ${people === 1 ? "person" : "people"}.`
    );
  } else {
    parts.push(`There ${people === 1 ? "is 1 person" : `are ${people} of us`}.`);
  }

  parts.push(`I want ${when ? when.toLowerCase() : "a good outing"}${vibes.length ? ` (${vibes.join(", ").toLowerCase()})` : ""}.`);

  if (includes.length) {
    parts.push(`Include ${includes.join(", ").toLowerCase()}.`);
  }

  return parts.join(" ");
}

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function SearchCard({
  mode,
  setMode,
  freeText,
  setFreeText,
  onSubmit,
  recent,
  onPickRecent,
}) {
  const [city, setCity] = useState("");
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState("");
  const [when, setWhen] = useState("");
  const [vibes, setVibes] = useState([]);
  const [includes, setIncludes] = useState(["Dinner"]);

  const guidedReady = city.trim().length > 1;
  const freeReady = freeText.trim().length > 0;

  const submit = () => {
    if (mode === "guided") {
      if (!guidedReady) return;
      onSubmit(composeRequest({ city, people, budget, when, vibes, includes }));
    } else if (freeReady) {
      onSubmit(freeText.trim());
    }
  };

  return (
    <div className="search-card" id="planner">
      <div className="tabs" role="tablist" aria-label="How do you want to describe your outing?">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "guided"}
          className={mode === "guided" ? "tab on" : "tab"}
          onClick={() => setMode("guided")}
        >
          <SlidersHorizontal size={15} /> Guided
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "free"}
          className={mode === "free" ? "tab on" : "tab"}
          onClick={() => setMode("free")}
        >
          <PenLine size={15} /> Describe it freely
        </button>
      </div>

      {mode === "guided" ? (
        <div className="builder">
          <div className="field-grid">
            <label className="field">
              <span className="field-label">
                <MapPin size={14} /> City or area
              </span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Ahmedabad, Satellite"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </label>

            <div className="field">
              <span className="field-label">How many people?</span>
              <div className="stepper">
                <button
                  type="button"
                  aria-label="Fewer people"
                  onClick={() => setPeople((p) => Math.max(1, p - 1))}
                >
                  <Minus size={16} />
                </button>
                <strong aria-live="polite">{people}</strong>
                <button
                  type="button"
                  aria-label="More people"
                  onClick={() => setPeople((p) => Math.min(20, p + 1))}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <label className="field">
              <span className="field-label">Total budget (₹) — optional</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 2000"
              />
              <div className="mini-chips">
                {BUDGETS.map((b) => (
                  <button
                    type="button"
                    key={b}
                    className={String(b) === String(budget) ? "mini on" : "mini"}
                    onClick={() => setBudget(String(b))}
                  >
                    ₹{b.toLocaleString()}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <div className="chip-group">
            <span className="field-label">When?</span>
            <div className="chip-row">
              {WHEN.map((w) => (
                <button
                  type="button"
                  key={w}
                  className={when === w ? "pick on" : "pick"}
                  onClick={() => setWhen(when === w ? "" : w)}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="chip-group">
            <span className="field-label">What's the vibe?</span>
            <div className="chip-row">
              {VIBES.map((v) => (
                <button
                  type="button"
                  key={v}
                  className={vibes.includes(v) ? "pick on" : "pick"}
                  onClick={() => setVibes(toggle(vibes, v))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="chip-group">
            <span className="field-label">Plan should include</span>
            <div className="chip-row">
              {INCLUDES.map((v) => (
                <button
                  type="button"
                  key={v}
                  className={includes.includes(v) ? "pick on" : "pick"}
                  onClick={() => setIncludes(toggle(includes, v))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="free-wrap">
          <label className="field-label" htmlFor="free-text">
            <MapPin size={14} /> What are you looking for?
          </label>
          <textarea
            id="free-text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="e.g. I'm in Ahmedabad. I have ₹2000 for 4 people. Plan a fun Saturday evening with dinner and an activity."
            rows={5}
          />
        </div>
      )}

      <div className="search-bottom">
        {recent.length > 0 ? (
          <div className="recent">
            <span className="recent-label">
              <History size={13} /> Recent
            </span>
            {recent.slice(0, 2).map((text) => (
              <button
                type="button"
                key={text}
                className="recent-chip"
                title={text}
                onClick={() => onPickRecent(text)}
              >
                {text.length > 34 ? `${text.slice(0, 34)}…` : text}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}

        <button
          type="button"
          className="plan-btn"
          disabled={mode === "guided" ? !guidedReady : !freeReady}
          onClick={submit}
        >
          Plan my outing
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
