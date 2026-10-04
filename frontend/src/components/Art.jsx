/* Sticker-style clip-art. All drawn on a 64x64 grid with the same outline. */

const S = {
  stroke: "#0d1226",
  strokeWidth: 2.5,
  strokeLinejoin: "round",
  strokeLinecap: "round",
};

const ART = {
  pizza: (
    <>
      <g {...S}>
        <path d="M9 21 L32 59 L55 21 Q32 11 9 21 Z" fill="#ffc857" />
        <path d="M9 21 Q32 11 55 21 L53 27 Q32 17 11 27 Z" fill="#e8923a" />
        <circle cx="25" cy="36" r="4.5" fill="#ef4d5a" />
        <circle cx="38" cy="33" r="4.5" fill="#ef4d5a" />
        <circle cx="31" cy="47" r="3.8" fill="#ef4d5a" />
      </g>
      <circle cx="33" cy="40" r="1.4" fill="#4caf50" />
      <circle cx="22" cy="43" r="1.2" fill="#4caf50" />
      <circle cx="41" cy="42" r="1.2" fill="#4caf50" />
    </>
  ),

  burger: (
    <>
      <g {...S}>
        <path d="M10 30 Q10 12 32 12 Q54 12 54 30 Z" fill="#f0a04b" />
        <path d="M8 32 Q14 28 20 32 T32 32 T44 32 T56 32 L56 37 L8 37 Z" fill="#6cc04a" />
        <rect x="9" y="37" width="46" height="8" rx="4" fill="#7a4a2b" />
        <path d="M12 45 H52 L47 50 L41 45" fill="#ffd23f" />
        <path d="M10 49 H54 Q54 57 46 57 H18 Q10 57 10 49 Z" fill="#f0a04b" />
      </g>
      <ellipse cx="22" cy="21" rx="2.4" ry="1.3" fill="#fff4d6" />
      <ellipse cx="32" cy="18" rx="2.4" ry="1.3" fill="#fff4d6" />
      <ellipse cx="42" cy="22" rx="2.4" ry="1.3" fill="#fff4d6" />
    </>
  ),

  coffee: (
    <>
      <g fill="none" stroke="#cbd5ff" strokeWidth="2.5" strokeLinecap="round">
        <path d="M22 18 Q18 14 22 10 T22 4" />
        <path d="M32 18 Q28 14 32 10 T32 4" opacity=".7" />
        <path d="M42 18 Q38 14 42 10 T42 4" />
      </g>
      <g {...S}>
        <ellipse cx="32" cy="57" rx="23" ry="4" fill="#a78bfa" />
        <path d="M14 26 H50 V40 Q50 54 32 54 Q14 54 14 40 Z" fill="#f5f0ff" />
        <path d="M50 30 H53 Q59 30 59 36 Q59 43 50 43" fill="none" />
        <ellipse cx="32" cy="26" rx="18" ry="4.5" fill="#8b5a3c" />
      </g>
      <path d="M26 25 Q32 28 38 25" stroke="#d9a77b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  ),

  cocktail: (
    <>
      <g {...S}>
        <path d="M10 16 H54 L32 40 Z" fill="#9be8ff" fillOpacity=".55" />
        <path d="M16 21 H48 L32 38 Z" fill="#ff6b9d" stroke="none" />
        <path d="M32 40 V56" />
        <path d="M21 57 H43" strokeWidth="3.5" />
        <path d="M42 5 L30 25" />
        <circle cx="30" cy="25" r="3" fill="#6cc04a" />
        <circle cx="51" cy="16" r="5.5" fill="#9be15d" />
      </g>
      <path d="M51 11 V21 M46 16 H56" stroke="#0d1226" strokeWidth="1.4" opacity=".5" />
    </>
  ),

  icecream: (
    <>
      <g {...S}>
        <path d="M20 31 L32 61 L44 31 Z" fill="#e8a35c" />
        <path d="M26 41 L38 41 M23 35 L41 35 M29 50 L35 50" strokeWidth="1.6" opacity=".6" />
        <circle cx="32" cy="28" r="12.5" fill="#ff9ecb" />
        <circle cx="32" cy="15" r="9" fill="#fff1c1" />
        <circle cx="32" cy="5.5" r="3" fill="#ef4d5a" />
      </g>
    </>
  ),

  ramen: (
    <>
      <g fill="none" stroke="#cbd5ff" strokeWidth="2.5" strokeLinecap="round">
        <path d="M20 14 Q16 10 20 6" />
        <path d="M30 14 Q26 10 30 6" opacity=".7" />
      </g>
      <g {...S}>
        <path d="M44 4 L30 30" />
        <path d="M50 6 L38 30" />
        <path d="M10 28 Q16 22 22 28 T34 28 T46 28 T54 28" fill="none" stroke="#ffd36e" />
        <path d="M6 32 H58 Q56 56 32 56 Q8 56 6 32 Z" fill="#6366f1" />
        <ellipse cx="32" cy="32" rx="26" ry="4.5" fill="#ffe7a8" />
        <circle cx="24" cy="31" r="5" fill="#fff" />
        <circle cx="24" cy="31" r="2.2" fill="#ffb454" stroke="none" />
      </g>
      <path d="M18 44 H46" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" opacity=".7" />
    </>
  ),

  cloche: (
    <>
      <g {...S}>
        <ellipse cx="32" cy="50" rx="27" ry="5.5" fill="#a78bfa" />
        <path d="M9 46 Q9 17 32 17 Q55 17 55 46 Z" fill="#e6ebff" />
        <circle cx="32" cy="12" r="3.5" fill="#ffd36e" />
      </g>
      <path d="M16 38 Q18 26 28 23" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </>
  ),

  bowling: (
    <>
      <g {...S}>
        <path
          d="M26 5 Q21 5 21 11 Q21 17 24 21 Q18 29 18 41 Q18 52 26 52 Q34 52 34 41 Q34 29 28 21 Q31 17 31 11 Q31 5 26 5 Z"
          fill="#fff"
        />
        <path d="M22 13 H30" stroke="#ef4d5a" strokeWidth="3.5" />
        <path d="M20 22 H32" stroke="#ef4d5a" strokeWidth="3.5" />
        <circle cx="46" cy="47" r="12" fill="#4f46e5" />
        <circle cx="42.5" cy="43" r="1.6" fill="#0d1226" />
        <circle cx="47.5" cy="41.5" r="1.6" fill="#0d1226" />
        <circle cx="45.5" cy="47.5" r="1.6" fill="#0d1226" />
      </g>
    </>
  ),

  clapper: (
    <>
      <g {...S}>
        <rect x="8" y="24" width="48" height="31" rx="3" fill="#1f2547" />
        <path d="M8 14 L56 7 L58 17 L10 24 Z" fill="#fff" />
        <path d="M18 22.5 L24 13 M30 20.7 L36 11.3 M42 19 L48 9.6" strokeWidth="4" stroke="#6366f1" />
        <path d="M28 33 L41 40 L28 47 Z" fill="#ffd36e" />
      </g>
    </>
  ),

  gamepad: (
    <>
      <g {...S}>
        <path
          d="M14 24 Q8 24 6 39 Q4 54 14 54 Q21 54 25 47 H39 Q43 54 50 54 Q60 54 58 39 Q56 24 50 24 Z"
          fill="#a78bfa"
        />
        <path d="M20 33 V43 M15 38 H25" strokeWidth="3.5" stroke="#0d1226" />
        <circle cx="43" cy="35" r="3.2" fill="#ffd36e" />
        <circle cx="50" cy="40" r="3.2" fill="#ff6b9d" />
      </g>
    </>
  ),

  pin: (
    <>
      <g {...S}>
        <path
          d="M32 5 Q16 5 16 22 Q16 34 32 59 Q48 34 48 22 Q48 5 32 5 Z"
          fill="#ff6b6b"
        />
        <circle cx="32" cy="22" r="7.5" fill="#fff" />
      </g>
    </>
  ),

  sparkle: (
    <g {...S}>
      <path d="M32 5 L38 26 L59 32 L38 38 L32 59 L26 38 L5 32 L26 26 Z" fill="#ffd36e" />
    </g>
  ),
};

export function Art({ name = "pin", size = 64, className = "" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`art ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {ART[name] || ART.pin}
    </svg>
  );
}
