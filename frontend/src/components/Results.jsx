import { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Clock3,
  Copy,
  MapPin,
  MessageCircle,
  Pencil,
  RotateCcw,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import PlaceCard from "./PlaceCard";
import { Art } from "./Art";
import { placeKey, planToText } from "../utils";

const GROUP_LABELS = {
  restaurants: "Places to eat",
  cafes: "Cafes",
  activities: "Activities",
};

const labelFor = (key) =>
  GROUP_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);

export default function Results({
  result,
  savedKeys,
  onToggleSave,
  onRestart,
  onEdit,
}) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("default");
  const [copied, setCopied] = useState(false);

  const req = result.requirements || {};
  const recommended = result.recommended_plan?.length
    ? result.recommended_plan
    : result.plan || [];

  const groups = useMemo(
    () =>
      Object.entries(result.alternatives || {}).filter(
        ([, items]) => Array.isArray(items) && items.length > 0
      ),
    [result.alternatives]
  );

  const visibleGroups = groups
    .filter(([key]) => filter === "all" || filter === key)
    .map(([key, items]) => {
      const sorted = [...items];
      if (sort === "rating") sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      if (sort === "reviews") sorted.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
      return [key, sorted];
    });

  const perPerson =
    req.budget && req.people ? Math.round(req.budget / req.people) : null;

  const copyPlan = async () => {
    try {
      await navigator.clipboard.writeText(planToText(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(planToText(result))}`;

  return (
    <main className="results">
      {/* header */}
      <div className="results-header">
        <div className="results-intro">
          <div className="results-eyebrow">
            <Sparkles size={14} /> YOUR LOCALLENS PLAN
          </div>
          <h2>Your plan is ready.</h2>
          <p>{result.summary}</p>
        </div>

        <div className="results-actions">
          <button type="button" className="btn" onClick={copyPlan}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied" : "Copy plan"}
          </button>
          <a className="btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={15} /> WhatsApp
          </a>
          <button type="button" className="btn" onClick={onEdit}>
            <Pencil size={15} /> Edit request
          </button>
          <button type="button" className="btn ghost" onClick={onRestart}>
            <RotateCcw size={15} /> Start over
          </button>
        </div>
      </div>

      {/* what we understood */}
      <div className="req-row">
        <div className="req">
          <MapPin size={16} />
          <div>
            <span>LOCATION</span>
            <strong>{req.location || "Not specified"}</strong>
          </div>
        </div>
        <div className="req">
          <Wallet size={16} />
          <div>
            <span>BUDGET</span>
            <strong>
              {req.budget ? `₹${req.budget}` : "Not specified"}
              {perPerson ? <em> · ≈ ₹{perPerson}/person</em> : null}
            </strong>
          </div>
        </div>
        <div className="req">
          <Users size={16} />
          <div>
            <span>PEOPLE</span>
            <strong>{req.people || "Not specified"}</strong>
          </div>
        </div>
        <div className="req">
          <Clock3 size={16} />
          <div>
            <span>WHEN</span>
            <strong>{req.time || "Flexible"}</strong>
          </div>
        </div>
      </div>

      {req.preferences?.length > 0 && (
        <div className="pref-row">
          <span>Understood preferences</span>
          {req.preferences.map((p) => (
            <span className="pref-chip" key={p}>
              {p}
            </span>
          ))}
        </div>
      )}

      {/* recommended timeline */}
      <section className="result-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">AI RECOMMENDATION</span>
            <h2>Your recommended plan</h2>
            <p>Picked from live local results to fit your request, in a sensible order.</p>
          </div>
          <div className="recommendation-badge">
            <Sparkles size={14} /> Personalized
          </div>
        </div>

        <div className="timeline">
          {recommended.map((item, index) => (
            <div className="timeline-item" key={`${placeKey(item)}-${index}`}>
              <div className="timeline-rail" aria-hidden="true">
                <span>{index + 1}</span>
              </div>
              <PlaceCard
                item={item}
                featured
                step={`Step ${index + 1}`}
                saved={savedKeys.has(placeKey(item))}
                onToggleSave={onToggleSave}
              />
            </div>
          ))}
        </div>
      </section>

      {/* budget */}
      <div className="budget-note">
        <Wallet size={20} />
        <div>
          <strong>Budget check</strong>
          <p>{result.total_estimated_cost}</p>
        </div>
        <Art name="sparkle" size={36} className="budget-art" />
      </div>

      {/* alternatives */}
      {groups.length > 0 && (
        <section className="result-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">EXPLORE MORE</span>
              <h2>Other good options</h2>
              <p>More real places from the same search — swap any of them in.</p>
            </div>
          </div>

          <div className="toolbar">
            <div className="chip-row" role="group" aria-label="Filter options">
              <button
                type="button"
                className={filter === "all" ? "pick on" : "pick"}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              {groups.map(([key, items]) => (
                <button
                  type="button"
                  key={key}
                  className={filter === key ? "pick on" : "pick"}
                  onClick={() => setFilter(key)}
                >
                  {labelFor(key)} · {items.length}
                </button>
              ))}
            </div>

            <label className="sort">
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="default">Best match</option>
                <option value="rating">Top rated</option>
                <option value="reviews">Most reviewed</option>
              </select>
            </label>
          </div>

          {visibleGroups.map(([key, items]) => (
            <div className="alt-group" key={key}>
              <h3 className="alt-title">{labelFor(key)}</h3>
              <div className="places-grid">
                {items.map((item, index) => (
                  <PlaceCard
                    key={`${placeKey(item)}-${index}`}
                    item={item}
                    saved={savedKeys.has(placeKey(item))}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {result.warnings?.length > 0 && (
        <div className="warnings">
          <AlertCircle size={18} />
          <div>
            {result.warnings.map((warning, index) => (
              <p key={index}>{warning}</p>
            ))}
          </div>
        </div>
      )}

      <p className="fine-print">
        Ratings, prices and hours come from live listings and can change — confirm with
        the venue before you go.
      </p>
    </main>
  );
}
