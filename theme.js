/* =========================================================
   theme.js — light / dark mode.
   ---------------------------------------------------------
   Applied before first paint (see the inline snippet in each
   page <head>) so the site never flashes the wrong theme.
   Order of preference: the visitor's saved choice, then their
   operating system setting, then dark.
   ========================================================= */

const THEME_KEY = 'ort-theme';

function ortTheme(){
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function ortSetTheme(mode, { save = true } = {}){
  document.documentElement.setAttribute('data-theme', mode);
  if(save) localStorage.setItem(THEME_KEY, mode);
  // Keep the browser UI (address bar, form controls) in step.
  document.querySelector('meta[name="color-scheme"]')
    ?.setAttribute('content', mode === 'light' ? 'light' : 'dark');
  document.querySelectorAll('[data-theme-toggle]').forEach(b=>{
    b.setAttribute('aria-pressed', String(mode === 'light'));
    b.setAttribute('title', t(mode === 'light' ? 'theme.toDark' : 'theme.toLight'));
    b.setAttribute('aria-label', t(mode === 'light' ? 'theme.toDark' : 'theme.toLight'));
  });
  document.dispatchEvent(new CustomEvent('ort:theme', { detail:{ mode } }));
}

function ortToggleTheme(){
  ortSetTheme(ortTheme() === 'light' ? 'dark' : 'light');
}

document.addEventListener('click', e=>{
  if(e.target.closest('[data-theme-toggle]')){ e.preventDefault(); ortToggleTheme(); }
});

/* If the visitor has never chosen, follow the system and keep
   following it while they haven't expressed a preference. */
if(window.matchMedia){
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener?.('change', ev=>{
    if(!localStorage.getItem(THEME_KEY)) ortSetTheme(ev.matches ? 'dark' : 'light', { save:false });
  });
}
