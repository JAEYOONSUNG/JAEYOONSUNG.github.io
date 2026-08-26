(() => {
  const glyphs = {
    personal: `
      <g class="glyph-depth glyph-page-back"><rect class="glyph-material" x="20" y="7" width="34" height="44" rx="12"/><path class="glyph-soft-line" d="M28 15h17M28 21h13"/></g>
      <g class="glyph-hero glyph-page-front"><path class="glyph-surface" d="M12 18c0-5 4-9 9-9h19l11 11v27c0 5-4 9-9 9H21c-5 0-9-4-9-9z"/><path class="glyph-ink" d="M40 9v12h11M20 28h22M20 35h16"/><path class="glyph-accent glyph-write" d="M20 42h12"/></g>
      <g class="glyph-motion glyph-confirm"><circle class="glyph-fill-secondary" cx="43" cy="45" r="8"/><path class="glyph-white-line" d="m39 45 2.5 2.5L47 42"/></g>`,
    study: `
      <path class="glyph-material glyph-depth" d="M7 18c8-7 17-8 25-2 8-6 17-5 25 2v34c-9-4-17-2-25 5-8-7-16-9-25-5z"/>
      <g class="glyph-hero glyph-book-left"><path class="glyph-surface" d="M8 18c8-5 16-4 24 2v32c-8-6-16-7-24-3z"/><path class="glyph-soft-line" d="M14 26c5-1 9 0 13 3M14 34c5-1 9 0 13 3"/></g>
      <g class="glyph-motion glyph-book-right"><path class="glyph-surface" d="M56 18c-8-5-16-4-24 2v32c8-6 16-7 24-3z"/><path class="glyph-accent" d="M50 26c-5-1-9 0-13 3M50 34c-5-1-9 0-13 3"/></g>
      <path class="glyph-fill-secondary glyph-bookmark" d="M29 17h6v18l-3-3-3 3z"/>
      <circle class="glyph-fill glyph-ping" cx="51" cy="13" r="3"/>`,
    creative: `
      <circle class="glyph-material glyph-depth" cx="31" cy="32" r="23"/>
      <path class="glyph-soft-fill glyph-orbit" d="M15 39c7 10 24 14 35 2 5-6 6-15 2-22-2 13-13 23-25 23-5 0-9-1-12-3z"/>
      <g class="glyph-hero glyph-spark-core"><path class="glyph-fill" d="M31 10c2 11 7 17 18 22-11 4-16 10-18 22-2-12-7-18-18-22 11-5 16-11 18-22z"/><path class="glyph-white-line" d="M31 20c1 6 4 9 9 12-5 2-8 5-9 12-1-7-4-10-9-12 5-3 8-6 9-12z"/></g>
      <g class="glyph-motion glyph-sparklets"><circle class="glyph-fill-secondary" cx="51" cy="15" r="4"/><circle class="glyph-fill" cx="11" cy="48" r="3"/><path class="glyph-accent" d="M12 15v8M8 19h8"/></g>`,
    teams: `
      <path class="glyph-material glyph-depth" d="M13 46 31 10l22 37z"/>
      <path class="glyph-accent glyph-route" d="M14 44 30 18M34 18l17 27M18 46h29"/>
      <g class="glyph-hero glyph-team-nodes"><g class="glyph-node glyph-node-a"><circle class="glyph-surface" cx="12" cy="47" r="9"/><circle class="glyph-fill" cx="12" cy="45" r="3"/><path class="glyph-ink" d="M7 52c1-3 3-4 5-4s4 1 5 4"/></g><g class="glyph-node glyph-node-b"><circle class="glyph-surface" cx="32" cy="13" r="10"/><circle class="glyph-fill-secondary" cx="32" cy="11" r="3.2"/><path class="glyph-ink" d="M26 18c1-3.5 3-5 6-5s5 1.5 6 5"/></g><g class="glyph-node glyph-node-c"><circle class="glyph-surface" cx="52" cy="47" r="9"/><circle class="glyph-fill" cx="52" cy="45" r="3"/><path class="glyph-ink" d="M47 52c1-3 3-4 5-4s4 1 5 4"/></g></g>
      <circle class="glyph-motion glyph-route-dot glyph-fill-secondary" cx="32" cy="31" r="3"/>`,
    operations: `
      <rect class="glyph-material glyph-depth" x="6" y="8" width="52" height="48" rx="17"/>
      <rect class="glyph-surface glyph-hero" x="10" y="12" width="44" height="40" rx="14"/>
      <path class="glyph-soft-line" d="M17 23h30M17 32h30M17 41h30"/>
      <g class="glyph-motion glyph-sliders"><g class="glyph-slider glyph-slider-a"><circle class="glyph-shadow-fill" cx="24" cy="25" r="6"/><circle class="glyph-fill" cx="24" cy="23" r="5"/></g><g class="glyph-slider glyph-slider-b"><circle class="glyph-shadow-fill" cx="42" cy="34" r="6"/><circle class="glyph-fill-secondary" cx="42" cy="32" r="5"/></g><g class="glyph-slider glyph-slider-c"><circle class="glyph-shadow-fill" cx="29" cy="43" r="6"/><circle class="glyph-fill" cx="29" cy="41" r="5"/></g></g>
      <path class="glyph-ink glyph-panel-mark" d="M18 17h10"/>`,
    research: `
      <circle class="glyph-material glyph-depth" cx="27" cy="28" r="22"/>
      <circle class="glyph-surface glyph-hero" cx="27" cy="27" r="17"/>
      <path class="glyph-soft-fill" d="M15 31c6 2 15 1 24-7 0 9-5 17-13 18-5 0-9-4-11-11z"/>
      <path class="glyph-ink" d="M18 32l6-8 5 5 8-11"/>
      <path class="glyph-accent glyph-scan" d="M13 27h28"/>
      <g class="glyph-motion glyph-lens-handle"><path class="glyph-surface" d="m39 39 13 13c2 2 5-1 3-3L42 36z"/><path class="glyph-accent" d="m42 40 10 10"/></g>
      <circle class="glyph-fill-secondary glyph-ping" cx="36" cy="18" r="3.5"/>`,
    notes: `
      <g class="glyph-depth glyph-note-back"><rect class="glyph-material" x="20" y="7" width="35" height="43" rx="12"/><path class="glyph-soft-line" d="M28 16h18M28 23h13"/></g>
      <g class="glyph-hero glyph-note-front"><rect class="glyph-surface" x="9" y="14" width="39" height="43" rx="12"/><path class="glyph-ink" d="M18 25h20M18 32h15M18 45h18"/><path class="glyph-accent glyph-write" d="M18 39h18"/></g>
      <g class="glyph-motion glyph-pen"><path class="glyph-fill-secondary" d="m34 41 15-18c2-2 6 1 4 4L38 45l-7 2z"/><path class="glyph-white-line" d="m45 27 4 3"/><path class="glyph-ink" d="m31 47 4-6 4 4z"/></g>`,
    collaboration: `
      <path class="glyph-material glyph-depth" d="M7 23c0-9 7-16 16-16h8c7 0 13 5 15 11h2c6 0 11 5 11 12v8c0 7-5 12-12 12H34l-9 7 1-7h-3C14 50 7 43 7 34z"/>
      <g class="glyph-hero glyph-person-a"><rect class="glyph-surface" x="8" y="14" width="27" height="28" rx="11"/><circle class="glyph-fill" cx="21.5" cy="24" r="5"/><path class="glyph-ink" d="M14 36c1-5 4-7 7.5-7s6.5 2 7.5 7"/></g>
      <g class="glyph-motion glyph-person-b"><rect class="glyph-surface" x="29" y="10" width="27" height="30" rx="11"/><circle class="glyph-fill-secondary" cx="42.5" cy="20" r="5"/><path class="glyph-ink" d="M35 33c1-5 4-7 7.5-7s6.5 2 7.5 7"/></g>
      <path class="glyph-accent glyph-bridge" d="M26 45c6 5 13 5 19 0"/><circle class="glyph-fill glyph-bridge-dot" cx="35" cy="48" r="3"/>`,
    execution: `
      <rect class="glyph-material glyph-depth" x="7" y="8" width="50" height="48" rx="17"/>
      <g class="glyph-hero glyph-task-stack"><g class="glyph-task glyph-task-a"><rect class="glyph-surface" x="11" y="14" width="39" height="12" rx="6"/><circle class="glyph-fill" cx="18" cy="20" r="4"/><path class="glyph-white-line" d="m16 20 1.5 1.5L20 18"/><path class="glyph-ink" d="M26 20h17"/></g><g class="glyph-task glyph-task-b"><rect class="glyph-surface" x="14" y="28" width="39" height="12" rx="6"/><circle class="glyph-fill-secondary" cx="21" cy="34" r="4"/><path class="glyph-white-line" d="m19 34 1.5 1.5L23 32"/><path class="glyph-ink" d="M29 34h17"/></g><g class="glyph-task glyph-task-c"><rect class="glyph-surface" x="11" y="42" width="39" height="12" rx="6"/><circle class="glyph-fill" cx="18" cy="48" r="4"/><path class="glyph-white-line" d="m16 48 1.5 1.5L20 46"/><path class="glyph-ink" d="M26 48h17"/></g></g>
      <path class="glyph-motion glyph-forward glyph-accent" d="m50 20 7 7-7 7"/>`,
    planning: `
      <rect class="glyph-material glyph-depth" x="8" y="10" width="50" height="47" rx="16"/>
      <rect class="glyph-surface glyph-hero" x="7" y="13" width="48" height="43" rx="14"/>
      <path class="glyph-ink" d="M8 26h46M18 9v10M44 9v10"/>
      <g class="glyph-calendar-dots"><circle class="glyph-soft-dot" cx="17" cy="35" r="3"/><circle class="glyph-soft-dot" cx="27" cy="35" r="3"/><circle class="glyph-soft-dot" cx="37" cy="35" r="3"/><circle class="glyph-soft-dot" cx="17" cy="46" r="3"/><circle class="glyph-soft-dot" cx="27" cy="46" r="3"/></g>
      <g class="glyph-motion glyph-day"><rect class="glyph-fill-secondary" x="34" y="40" width="14" height="13" rx="5"/><path class="glyph-white-line" d="m38 46 2 2 4-5"/></g>
      <circle class="glyph-fill" cx="18" cy="14" r="3"/><circle class="glyph-fill" cx="44" cy="14" r="3"/>`,
    records: `
      <path class="glyph-material glyph-depth" d="M32 5 54 14v17c0 14-8 23-22 29C18 54 10 45 10 31V14z"/>
      <path class="glyph-surface glyph-hero" d="M32 10 49 17v14c0 10-6 18-17 23-11-5-17-13-17-23V17z"/>
      <path class="glyph-accent glyph-shield-line" d="M32 15v35"/>
      <g class="glyph-motion glyph-lock"><path class="glyph-ink glyph-shackle" d="M25 31v-4a7 7 0 0 1 14 0v4"/><rect class="glyph-fill-secondary" x="22" y="30" width="20" height="16" rx="6"/><path class="glyph-white-line" d="m27 38 3 3 7-7"/></g>
      <circle class="glyph-fill glyph-ping" cx="48" cy="16" r="3"/>`,
    tools: `
      <rect class="glyph-material glyph-depth" x="6" y="8" width="52" height="48" rx="17"/>
      <rect class="glyph-surface glyph-hero" x="9" y="11" width="46" height="42" rx="14"/>
      <path class="glyph-ink" d="M16 20h14M16 27h9M16 46V34h31"/>
      <path class="glyph-accent glyph-graph" d="m18 43 8-7 7 4 11-14"/>
      <g class="glyph-motion glyph-tool-node"><circle class="glyph-fill-secondary" cx="44" cy="26" r="5"/><circle class="glyph-white-fill" cx="44" cy="26" r="2"/></g>
      <g class="glyph-formula"><rect class="glyph-soft-fill" x="34" y="14" width="15" height="9" rx="4"/><path class="glyph-ink" d="M38 18h7M42 15v7"/></g>
      <circle class="glyph-fill glyph-ping" cx="26" cy="36" r="3"/>`,
  };

  const makeGlyph = (name, body) => {
    const template = document.createElement("template");
    template.innerHTML = `<svg class="living-glyph living-glyph--${name}" viewBox="0 0 64 64" focusable="false">${body}</svg>`;
    return template.content.firstElementChild;
  };

  document.querySelectorAll("[data-motion-symbol]").forEach((symbol) => {
    const name = symbol.dataset.motionSymbol;
    const body = glyphs[name];
    if (!body) return;
    symbol.replaceChildren(makeGlyph(name, body));
    symbol.dataset.glyphReady = "true";
  });
})();
