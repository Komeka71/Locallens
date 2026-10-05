import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  Compass,
  Heart,
  Radar,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import "./App.css";

import SearchCard from "./components/SearchCard";
import Loading from "./components/Loading";
import Results from "./components/Results";
import SavedDrawer from "./components/SavedDrawer";
import {
  Compare,
  Examples,
  Explainer,
  HeroDoodles,
  HowItWorks,
  Marquee,
} from "./components/Landing";
import {
  loadRecent,
  loadSaved,
  placeKey,
  pushRecent,
  storeSaved,
} from "./utils";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [mode, setMode] = useState("guided");
  const [freeText, setFreeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(loadSaved);
  const [recent, setRecent] = useState(loadRecent);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const savedKeys = useMemo(() => new Set(saved.map(placeKey)), [saved]);

  useEffect(() => {
    storeSaved(saved);
  }, [saved]);

  const toggleSave = useCallback((item) => {
    setSaved((current) => {
      const key = placeKey(item);
      return current.some((p) => placeKey(p) === key)
        ? current.filter((p) => placeKey(p) !== key)
        : [item, ...current];
    });
  }, []);

  const createPlan = async (text) => {
    const request = text.trim();
    if (!request) return;

    setLoading(true);
    setError("");
    setResult(null);
    setFreeText(request);
    setRecent(pushRecent(request));
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const response = await axios.post(`${API_URL}/api/plan`, { request });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Something went wrong while creating your plan."
      );
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setResult(null);
    setError("");
    setFreeText("");
    setMode("guided");
    window.scrollTo({ top: 0 });
  };

  const editRequest = () => {
    setResult(null);
    setError("");
    setMode("free");
    window.scrollTo({ top: 0 });
  };

  const fillFree = (text) => {
    setFreeText(text);
    setMode("free");
    setError("");
    document
      .getElementById("planner")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const showLanding = !result && !loading;

  return (
    <div className="app">
      <div className="bg-orb orb-1" aria-hidden="true" />
      <div className="bg-orb orb-2" aria-hidden="true" />

      {/* ---------------- NAVBAR ---------------- */}
      <nav className="navbar">
        <a className="logo" href="#top" onClick={result ? startOver : undefined}>
          <span className="logo-mark">
            <Compass size={18} />
          </span>
          <span>LocalLens</span>
        </a>

        <div className="nav-links">
          {showLanding && (
            <>
              <a href="#what">What it does</a>
              <a href="#how">How it works</a>
              <a href="#why">Why LocalLens</a>
            </>
          )}
        </div>

        <button
          type="button"
          className="nav-saved"
          onClick={() => setDrawerOpen(true)}
          aria-label={`Saved places (${saved.length})`}
        >
          <Heart size={16} fill={saved.length ? "currentColor" : "none"} />
          <span>Saved</span>
          {saved.length > 0 && <b>{saved.length}</b>}
        </button>
      </nav>

      {/* ---------------- LANDING ---------------- */}
      {showLanding && (
        <>
          <header className="hero" id="top">
            <HeroDoodles />

            <div className="hero-badge">
              <Sparkles size={15} />
              Live local data + AI planning
            </div>

            <h1>
              Stop guessing where to go.
              <br />
              <span>Get a plan built on real places.</span>
            </h1>

            <p className="subtitle">
              Describe your outing — city, group, budget, mood. LocalLens
              searches current local listings and builds a plan from places
              that actually exist, with ratings, hours and directions.
            </p>

            <SearchCard
              mode={mode}
              setMode={setMode}
              freeText={freeText}
              setFreeText={setFreeText}
              onSubmit={createPlan}
              recent={recent}
              onPickRecent={fillFree}
            />

            {error && (
              <div className="error-box" role="alert">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="trust-row">
              <div className="trust">
                <Radar size={17} />
                <div>
                  <strong>Live results</strong>
                  <span>Searched fresh every time</span>
                </div>
              </div>
              <div className="trust">
                <ShieldCheck size={17} />
                <div>
                  <strong>No made-up places</strong>
                  <span>Picks must exist in the results</span>
                </div>
              </div>
              <div className="trust">
                <Wallet size={17} />
                <div>
                  <strong>Budget-aware</strong>
                  <span>Planned around your limit</span>
                </div>
              </div>
            </div>
          </header>

          <Marquee />
          <Explainer />
          <HowItWorks />
          <Compare />
          <Examples onPick={fillFree} />

          <footer className="footer">
            <div className="powered">
              <span>POWERED BY</span>
              <div className="powered-line" />
              <strong>Gemini</strong>
              <span>+</span>
              <strong>SerpApi</strong>
            </div>
            <p>LocalLens · AI-powered local discovery</p>
          </footer>
        </>
      )}

      {loading && <Loading />}

      {result && (
        <Results
          result={result}
          savedKeys={savedKeys}
          onToggleSave={toggleSave}
          onRestart={startOver}
          onEdit={editRequest}
        />
      )}

      <SavedDrawer
        open={drawerOpen}
        items={saved}
        onClose={() => setDrawerOpen(false)}
        onRemove={toggleSave}
      />
    </div>
  );
}

export default App;
