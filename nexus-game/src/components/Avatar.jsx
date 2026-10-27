import React from 'react';

/**
 * Expressive SVG & CSS character avatar for NEXUS
 * Reacts dynamically to Happiness, Energy, and Life Stage.
 */
export const Avatar = ({ happiness, energy, lifeStage, size = 160 }) => {
  // Determine emotion states
  const isSleepy = energy < 30;
  const isHappy = happiness >= 70;
  const isSad = happiness < 40;
  const isNeutral = !isHappy && !isSad;

  // Mood label
  let moodLabel = 'BALANCED';
  let moodColor = '#38bdf8'; // sky
  let auraGlow = 'rgba(56, 189, 248, 0.25)';

  if (isSleepy) {
    moodLabel = 'EXHAUSTED';
    moodColor = '#94a3b8'; // slate
    auraGlow = 'rgba(148, 163, 184, 0.2)';
  } else if (isHappy) {
    moodLabel = 'THRIVING';
    moodColor = '#10b981'; // emerald
    auraGlow = 'rgba(16, 185, 129, 0.35)';
  } else if (isSad) {
    moodLabel = 'DOWNCAST';
    moodColor = '#f43f5e'; // rose
    auraGlow = 'rgba(244, 63, 94, 0.3)';
  }

  // Hair color & skin tone based on lifeStage
  const skinColor = '#fed7aa'; // warm peach
  const blushColor = '#fca5a5';

  let hairColor = '#3b2f2f'; // dark chestnut
  let clothingColor = '#6366f1'; // indigo hoodie for student
  let clothingAccent = '#8b5cf6';

  if (lifeStage === 'CHILD') {
    hairColor = '#451a03';
    clothingColor = '#06b6d4'; // bright cyan tee
    clothingAccent = '#3b82f6';
  } else if (lifeStage === 'WORKING') {
    hairColor = '#1e1b4b';
    clothingColor = '#1e293b'; // formal navy blazer
    clothingAccent = '#38bdf8'; // crisp shirt collar
  } else if (lifeStage === 'RETIRED') {
    hairColor = '#cbd5e1'; // elegant silver gray
    clothingColor = '#78350f'; // cozy amber cardigan
    clothingAccent = '#d97706';
  }

  return (
    <div className="flex flex-col items-center select-none" style={{ position: 'relative' }}>
      {/* Floating ZZZ animation if sleepy */}
      {isSleepy && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            right: '10px',
            color: '#a78bfa',
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            animation: 'floatAnim 2s infinite ease-in-out',
            zIndex: 10,
            textShadow: '0 0 8px rgba(167, 139, 250, 0.8)',
            fontSize: '15px'
          }}
        >
          z<span style={{ fontSize: '18px' }}>Z</span><span style={{ fontSize: '22px' }}>Z</span>
        </div>
      )}

      {/* Outer Glowing Circle Frame */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          padding: '5px',
          background: `linear-gradient(135deg, ${moodColor} 0%, rgba(99, 102, 241, 0.4) 50%, rgba(139, 92, 246, 0.8) 100%)`,
          boxShadow: `0 0 25px ${auraGlow}`,
          position: 'relative',
          transition: 'all 0.4s ease'
        }}
      >
        <svg
          viewBox="0 0 160 160"
          width="100%"
          height="100%"
          style={{
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 40%, #1e1b4b 0%, #0a0e1c 100%)',
            overflow: 'hidden'
          }}
        >
          <defs>
            <linearGradient id="clothingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={clothingColor} />
              <stop offset="100%" stopColor={clothingAccent} />
            </linearGradient>
            <radialGradient id="eyeGleam" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#2563eb" />
            </radialGradient>
          </defs>

          {/* Background Aura */}
          <circle cx="80" cy="80" r="75" fill="none" stroke={moodColor} strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />

          {/* Clothes / Torso */}
          <ellipse cx="80" cy="165" rx="58" ry="42" fill="url(#clothingGrad)" />

          {/* Clothing Details based on lifeStage */}
          {lifeStage === 'STUDENT' && (
            <>
              {/* Hoodie collar & strings */}
              <path d="M 66 126 Q 80 142 94 126" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.6" />
              <line x1="74" y1="135" x2="74" y2="152" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <line x1="86" y1="135" x2="86" y2="152" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              {/* Headphones on neck */}
              <path d="M 50 120 C 50 140 110 140 110 120" fill="none" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
              <rect x="44" y="112" width="10" height="18" rx="5" fill="#38bdf8" />
              <rect x="106" y="112" width="10" height="18" rx="5" fill="#38bdf8" />
            </>
          )}

          {lifeStage === 'WORKING' && (
            <>
              {/* Shirt Collar & Tie */}
              <polygon points="80,126 70,136 76,146 80,142 84,146 90,136" fill="#f8fafc" />
              <polygon points="78,142 82,142 84,165 80,170 76,165" fill="#f43f5e" />
            </>
          )}

          {lifeStage === 'CHILD' && (
            <>
              {/* Playful tee graphic */}
              <circle cx="80" cy="142" r="7" fill="#facc15" />
              <polygon points="80,132 83,138 90,138 84,142 86,149 80,145 74,149 76,142 70,138 77,138" fill="#eab308" />
            </>
          )}

          {lifeStage === 'RETIRED' && (
            <>
              {/* Cardigan Collar */}
              <path d="M 68 126 L 80 146 L 92 126" fill="none" stroke="#fef3c7" strokeWidth="3" opacity="0.8" />
              <circle cx="80" cy="154" r="3" fill="#d97706" />
            </>
          )}

          {/* Neck */}
          <rect x="70" y="105" width="20" height="24" rx="4" fill="#fbcfe8" />
          <path d="M 70 112 Q 80 118 90 112" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />

          {/* Hair back layer */}
          <ellipse cx="80" cy="74" rx="42" ry="46" fill={hairColor} />

          {/* Head & Ears */}
          <circle cx="44" cy="78" r="9" fill={skinColor} />
          <circle cx="116" cy="78" r="9" fill={skinColor} />
          <ellipse cx="80" cy="76" rx="35" ry="38" fill={skinColor} />

          {/* Cheeks / Blush */}
          {(isHappy || lifeStage === 'CHILD') && (
            <>
              <circle cx="58" cy="85" r="7" fill={blushColor} opacity="0.6" />
              <circle cx="102" cy="85" r="7" fill={blushColor} opacity="0.6" />
            </>
          )}

          {/* Hair Front Styling */}
          {lifeStage === 'CHILD' ? (
            // Cap or messy tufts
            <path d="M 46 64 Q 80 32 114 64 Q 100 50 80 52 Q 60 50 46 64 Z" fill={hairColor} />
          ) : lifeStage === 'RETIRED' ? (
            // Parted silver hair
            <path d="M 45 66 Q 60 42 80 44 Q 100 42 115 66 Q 98 56 80 58 Q 62 56 45 66 Z" fill={hairColor} />
          ) : (
            // Modern textured student swoop hair
            <>
              <path d="M 46 66 C 52 40 85 36 114 54 C 104 50 90 52 82 56 C 72 48 58 52 46 66 Z" fill={hairColor} />
              <path d="M 45 66 C 45 52 64 45 74 48 C 62 55 54 62 48 72 Z" fill={hairColor} />
            </>
          )}

          {/* Spectacles for Student or Retired */}
          {(lifeStage === 'STUDENT' || lifeStage === 'RETIRED') && (
            <g opacity="0.85">
              <rect x="53" y="66" width="22" height="18" rx="6" fill="none" stroke="#e2e8f0" strokeWidth="2" />
              <rect x="85" y="66" width="22" height="18" rx="6" fill="none" stroke="#e2e8f0" strokeWidth="2" />
              <line x1="75" y1="74" x2="85" y2="74" stroke="#e2e8f0" strokeWidth="2" />
              <line x1="45" y1="73" x2="53" y2="74" stroke="#e2e8f0" strokeWidth="1.5" />
              <line x1="107" y1="74" x2="115" y2="73" stroke="#e2e8f0" strokeWidth="1.5" />
            </g>
          )}

          {/* Eyebrows */}
          {isSad ? (
            <>
              {/* Slanted sad eyebrows */}
              <path d="M 54 62 Q 64 67 72 65" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
              <path d="M 106 62 Q 96 67 88 65" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              {/* High arched joyful brows */}
              <path d="M 54 62 Q 63 56 72 60" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
              <path d="M 106 62 Q 97 56 88 60" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Calm standard brows */}
              <line x1="55" y1="63" x2="72" y2="63" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
              <line x1="88" y1="63" x2="105" y2="63" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {/* Eyes depending on Sleepy / Happy / Sad */}
          {isSleepy ? (
            // Half-shut heavy eyelids
            <>
              <path d="M 55 75 Q 64 78 72 75" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 88 75 Q 96 78 105 75" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            // Big sparkling joyful eyes or cheerful crescents
            <>
              <ellipse cx="64" cy="74" rx="6" ry="6.5" fill="#1e293b" />
              <circle cx="66" cy="72" r="2.5" fill="#ffffff" />
              <circle cx="62" cy="76" r="1.2" fill="#ffffff" />

              <ellipse cx="96" cy="74" rx="6" ry="6.5" fill="#1e293b" />
              <circle cx="98" cy="72" r="2.5" fill="#ffffff" />
              <circle cx="94" cy="76" r="1.2" fill="#ffffff" />
            </>
          ) : isSad ? (
            // Droopy sad eyes with a tiny tear drop
            <>
              <ellipse cx="64" cy="75" rx="5" ry="5.5" fill="#1e293b" />
              <circle cx="65" cy="73" r="1.8" fill="#ffffff" />

              <ellipse cx="96" cy="75" rx="5" ry="5.5" fill="#1e293b" />
              <circle cx="97" cy="73" r="1.8" fill="#ffffff" />

              {/* Tear drop */}
              <circle cx="103" cy="85" r="2.5" fill="#38bdf8" opacity="0.8" />
            </>
          ) : (
            // Neutral bright eyes
            <>
              <ellipse cx="64" cy="74" rx="5.5" ry="5.5" fill="#1e293b" />
              <circle cx="66" cy="72" r="2" fill="#ffffff" />

              <ellipse cx="96" cy="74" rx="5.5" ry="5.5" fill="#1e293b" />
              <circle cx="98" cy="72" r="2" fill="#ffffff" />
            </>
          )}

          {/* Nose */}
          <ellipse cx="80" cy="82" rx="2" ry="2.5" fill="#f97316" opacity="0.4" />

          {/* Mouth depending on Emotion */}
          {isSleepy ? (
            // Yawning circular mouth
            <ellipse cx="80" cy="94" rx="5" ry="7" fill="#7f1d1d" />
          ) : isHappy ? (
            // Wide beaming smile with teeth
            <g>
              <path d="M 68 89 Q 80 105 92 89 Z" fill="#991b1b" />
              <path d="M 70 89 Q 80 94 90 89" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
            </g>
          ) : isSad ? (
            // Down-turned frown
            <path d="M 70 96 Q 80 89 90 96" fill="none" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          ) : (
            // Gentle neutral smile
            <path d="M 72 91 Q 80 97 88 91" fill="none" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" />
          )}
        </svg>
      </div>

      {/* Dynamic Status / Mood Badge */}
      <div
        className="mt-2 text-center"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 12px',
          borderRadius: '9999px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: `1px solid ${moodColor}40`,
          color: moodColor,
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginTop: '10px'
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: moodColor,
            boxShadow: `0 0 8px ${moodColor}`
          }}
        />
        {moodLabel}
      </div>
    </div>
  );
};
