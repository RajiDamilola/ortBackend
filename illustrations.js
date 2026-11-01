/* =========================================================
   illustrations.js — one illustration family.
   ---------------------------------------------------------
   Every service icon is drawn on the same 48×48 grid, with the
   same 1.5 stroke weight, round caps and no fills. Mixing icon
   libraries is what makes a site look assembled rather than
   designed, so these are all drawn to the same rules.
   ========================================================= */

const ILL = (() => {
  const w = (d) => `<svg class="svc-ill" viewBox="0 0 48 48" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  return {
    /* ---- Engineering ---- */
    // Array layout on a plan
    design: w(`<rect x="5" y="9" width="38" height="26"/><path d="M5 18h38M5 27h38M18 9v26M31 9v26"/>
      <path d="M14 39h20M18 43h12"/>`),
    // Load calculation
    sizing: w(`<path d="M7 38V22M16 38V14M25 38V27M34 38V9M41 38V19"/><path d="M5 43h38"/>
      <path d="M7 22l9-8 9 13 9-18 7 10" stroke-dasharray="2 3"/>`),
    // Choosing between components
    selection: w(`<rect x="5" y="8" width="15" height="12"/><rect x="28" y="8" width="15" height="12"/>
      <rect x="16" y="28" width="16" height="13"/><path d="M12 20v4h12v4M36 20v4H24"/>
      <path d="M8 12h9M31 12h9"/>`),
    // Site assessment with sun
    study: w(`<circle cx="34" cy="13" r="5"/><path d="M34 4v2M34 20v2M25 13h2M41 13h2M28 7l1.5 1.5M38.5 17.5L40 19M28 19l1.5-1.5M38.5 8.5L40 7"/>
      <path d="M5 40l10-14 8 10 5-6 8 10z"/><path d="M4 43h40"/>`),
    // Configuration and verification
    commissioning: w(`<rect x="8" y="7" width="32" height="24" rx="1"/><path d="M8 15h32"/>
      <circle cx="12" cy="11" r="1"/><circle cx="16" cy="11" r="1"/>
      <path d="M15 22l4 4 9-10"/><path d="M18 31v6M30 31v6M13 40h22"/>`),
    // Diagnostics
    trouble: w(`<path d="M4 26h8l4-11 6 21 5-14 4 8h5"/><circle cx="36" cy="30" r="8"/>
      <path d="M42 36l4 4"/>`),
    // Inspection over time
    maintenance: w(`<circle cx="24" cy="24" r="13"/><path d="M24 16v8l6 4"/>
      <path d="M24 5v4M24 39v4M5 24h4M39 24h4"/><path d="M37 11l-2.5 2.5M13.5 34.5L11 37"/>`),
    // Person + support
    support: w(`<circle cx="18" cy="17" r="6"/><path d="M6 39c1.5-7 6.5-11 12-11s10.5 4 12 11"/>
      <path d="M32 10h12v10H38l-4 4v-4h-2z"/>`),


    /* ---- Post purchase journey ---- */
    // Equipment chosen / boxed
    equipment: w(`<rect x="6" y="16" width="36" height="24" rx="1"/><path d="M6 24h36M24 16v24"/>
      <path d="M16 16l3-8h10l3 8"/>`),
    // Engineering sign-off on a drawing
    engineering: w(`<rect x="7" y="6" width="30" height="34" rx="1"/><path d="M13 15h18M13 22h18M13 29h10"/>
      <path d="M31 34l3 3 8-9"/>`),
    // Mounting on a roof
    installation: w(`<path d="M5 26L24 11l19 15"/><path d="M10 26v15h28V26"/>
      <g transform="translate(17,28)"><rect width="14" height="9"/><path d="M0 4.5h14M7 0v9"/></g>`),
    // Switch-on / verification
    commissioning: w(`<path d="M24 6v16"/><path d="M15 11a12 12 0 1018 0"/>
      <path d="M8 40h32" stroke-dasharray="2 3"/>`),
    // Scheduled care
    servicing: w(`<circle cx="24" cy="24" r="12"/><circle cx="24" cy="24" r="4"/>
      <path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M10 38l4-4M34 14l4-4"/>`),
    // Long term support line
    aftercare: w(`<path d="M6 34V16a6 6 0 016-6h24a6 6 0 016 6v12a6 6 0 01-6 6H18l-8 8z"/>
      <path d="M17 22h1M23 22h1M29 22h1"/>`),

    /* ---- Maintenance & repair ---- */
    // Inverter with fault reading
    invDiag: w(`<rect x="11" y="5" width="26" height="38" rx="1"/><rect x="16" y="11" width="16" height="10"/>
      <path d="M18 16h3l1.5-3 2 6 1.5-3h3"/><circle cx="18" cy="29" r="2"/><circle cx="24" cy="29" r="2"/>
      <circle cx="30" cy="29" r="2"/><path d="M16 37h16"/>`),
    // Board level repair
    invRepair: w(`<rect x="6" y="12" width="24" height="24" rx="1"/><path d="M12 12v-4M20 12v-4M12 36v4M20 36v4"/>
      <rect x="13" y="19" width="10" height="10"/>
      <path d="M33 20l9 9-4 4-9-9zM31 22l4-4"/>`),
    // Capacity testing
    batAnalysis: w(`<rect x="6" y="14" width="27" height="20" rx="1"/><path d="M33 20h4v8h-4"/>
      <path d="M11 10h5M23 10h5"/><path d="M12 24h5M15 20v8" />
      <path d="M22 30l4-8 3 5 4-9" stroke-dasharray="2 2"/>`),
    // BMS board
    bms: w(`<rect x="8" y="10" width="32" height="28" rx="1"/><rect x="15" y="17" width="14" height="14"/>
      <path d="M15 24h-7M40 20h-4M40 28h-4M22 10V6M29 38v4"/><circle cx="34" cy="14" r="1.5"/>`),
    // Roof inspection
    inspection: w(`<path d="M4 32l14-12 14 12"/><path d="M8 32v9h20v-9"/>
      <circle cx="34" cy="16" r="7"/><path d="M39 21l6 6"/><path d="M2 41h34"/>`),
    // Output vs expected
    performance: w(`<path d="M5 40V10"/><path d="M5 40h38"/>
      <path d="M9 33l8-7 7 5 8-12 8 6" />
      <path d="M9 36l8-3 7 2 8-6 8 3" stroke-dasharray="3 3"/><circle cx="40" cy="19" r="2"/>`),
    // Scheduled checks
    preventive: w(`<rect x="6" y="9" width="36" height="33" rx="1"/><path d="M6 18h36M15 9V5M33 9V5"/>
      <path d="M14 27l3 3 6-7"/><path d="M27 28h9M27 34h6"/>`),
    // Engineer support
    techSupport: w(`<path d="M10 26v-3a14 14 0 0128 0v3"/><rect x="5" y="26" width="7" height="11" rx="2"/>
      <rect x="36" y="26" width="7" height="11" rx="2"/><path d="M38 37v2a5 5 0 01-5 5h-6"/>`),
  };
})();

/* =========================================================
   Stage arrow — one proper arrow, used everywhere.
   ---------------------------------------------------------
   The previous version drew arrows with CSS pseudo-elements,
   which produced thin, unevenly sized chevrons. This is a real
   SVG arrow with a tapered shaft and a solid head, so it is
   identical at every size and in both flow directions.
   ========================================================= */
function ortArrow(dir='right'){
  // Drawn once pointing right; rotated for the other directions
  // so proportions can never drift between orientations.
  const rot = { right:0, down:90, left:180, up:270 }[dir] || 0;
  return `<span class="stage-arrow" data-dir="${dir}" aria-hidden="true">
    <svg viewBox="0 0 64 24" style="transform:rotate(${rot}deg)">
      <path class="sa-shaft" d="M2 12 H44" />
      <path class="sa-head" d="M40 4 L58 12 L40 20 Z" />
    </svg>
  </span>`;
}

/* Small numbered step + arrow used by the "after you buy" journey */
const JOURNEY_ILL = ['selection','design','commissioning','maintenance','trouble','support'];
// Shows the built-in drawing if the figure is one, otherwise the uploaded photo
function ortFig(p) {
  const f = p && p.figure;
  if (!f) return '';
  if (FIG[f]) return FIG[f];
  return '<img src="/uploads/' + encodeURIComponent(f) +
         '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:contain">';
}