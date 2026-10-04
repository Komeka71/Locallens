import { useEffect } from "react";
import { Heart, Navigation, Star, Trash2, X } from "lucide-react";
import { Art } from "./Art";
import { artFor, mapsUrl, placeKey, prettyType } from "../utils";

export default function SavedDrawer({ open, items, onClose, onRemove }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Saved places"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-head">
          <h3>
            <Heart size={18} fill="currentColor" /> Saved places
          </h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close saved places">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <Art name="pin" size={72} />
            <strong>Nothing saved yet</strong>
            <span>Tap the heart on any place to keep it here for later.</span>
          </div>
        ) : (
          <ul className="drawer-list">
            {items.map((item) => {
              const { art } = artFor(item);
              return (
                <li key={placeKey(item)} className="drawer-item">
                  <Art name={art} size={40} />
                  <div className="drawer-info">
                    <strong>{item.name}</strong>
                    <span>
                      {prettyType(item.type)}
                      {item.rating != null && (
                        <>
                          {" · "}
                          <Star size={11} fill="currentColor" className="inline-star" /> {item.rating}
                        </>
                      )}
                    </span>
                  </div>
                  <a
                    className="icon-btn"
                    href={mapsUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Directions to ${item.name}`}
                  >
                    <Navigation size={16} />
                  </a>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onRemove(item)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}
