import {
  Activity,
  CheckCircle2,
  Clock3,
  Coffee,
  ExternalLink,
  Heart,
  MapPinned,
  Navigation,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";
import { Art } from "./Art";
import { artFor, mapsUrl, prettyType } from "../utils";

const TONE_DOODLES = {
  coral: ["sparkle", "pin"],
  amber: ["sparkle", "icecream"],
  cyan: ["sparkle", "gamepad"],
  violet: ["sparkle", "cocktail"],
};

function TypeIcon({ type }) {
  const t = (type || "").toLowerCase();
  if (t.includes("activity")) return <Activity size={13} />;
  if (t.includes("cafe") || t.includes("coffee")) return <Coffee size={13} />;
  return <Utensils size={13} />;
}

export default function PlaceCard({
  item,
  featured = false,
  step,
  saved = false,
  onToggleSave,
}) {
  const { art, tone } = artFor(item);
  const doodles = TONE_DOODLES[tone] || TONE_DOODLES.coral;
  const hasRating = item.rating !== null && item.rating !== undefined;
  const hasReviews = item.reviews !== null && item.reviews !== undefined;

  return (
    <article className={`place-card tone-${tone} ${featured ? "is-featured" : ""}`}>
      {/* illustrated banner (never depends on photo thumbnails) */}
      <div className="place-banner" aria-hidden="true">
        <Art name={doodles[0]} size={22} className="banner-doodle d1" />
        <Art name={doodles[1]} size={30} className="banner-doodle d2" />
        <Art name={art} size={84} className="banner-art" />
        {step && <span className="step-badge">{step}</span>}
      </div>

      <div className="place-body">
        <div className="place-top">
          <span className="type-badge">
            <TypeIcon type={item.type} />
            {prettyType(item.type)}
          </span>

          <div className="place-top-right">
            {featured && (
              <span className="rec-badge">
                <Sparkles size={12} /> Recommended
              </span>
            )}
            {onToggleSave && (
              <button
                type="button"
                className={`save-btn ${saved ? "on" : ""}`}
                onClick={() => onToggleSave(item)}
                aria-pressed={saved}
                aria-label={saved ? `Remove ${item.name} from saved` : `Save ${item.name}`}
              >
                <Heart size={16} fill={saved ? "currentColor" : "none"} />
              </button>
            )}
          </div>
        </div>

        <div className="place-title-row">
          <div className="place-title">
            <h3>{item.name}</h3>
            {hasReviews && (
              <span className="reviews">{item.reviews.toLocaleString()} reviews</span>
            )}
          </div>

          {hasRating && (
            <div className="rating" title="Google rating">
              <Star size={14} fill="currentColor" />
              <strong>{item.rating}</strong>
            </div>
          )}
        </div>

        <p className="reason">{item.reason}</p>

        <div className="place-info">
          {item.address && (
            <div className="info-row">
              <MapPinned size={14} />
              <span>{item.address}</span>
            </div>
          )}
          {item.hours && (
            <div className="info-row">
              <Clock3 size={14} />
              <span>{item.hours}</span>
            </div>
          )}
        </div>

        <div className="place-cost">
          <div>
            <span>COST</span>
            <strong>{item.estimated_cost}</strong>
          </div>
          <span className="source-label">{item.source}</span>
        </div>

        <div className="verify-row">
          {item.cost_verified ? (
            <span className="chip ok">
              <CheckCircle2 size={12} /> Price verified
            </span>
          ) : (
            <span className="chip">Price unavailable</span>
          )}
          {item.open_hours_verified && (
            <span className="chip ok">
              <CheckCircle2 size={12} /> Hours verified
            </span>
          )}
        </div>

        <div className="place-actions">
          <a
            className="act primary"
            href={mapsUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation size={14} /> Directions
          </a>
          {item.website && (
            <a
              className="act"
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
