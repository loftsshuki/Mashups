import { escapeHtml as h, inlineJson, type PublicPack } from "./core.ts"

export function renderListeningPage(pack: PublicPack): string {
  const cases = pack.cases.map((entry, index) => `
    <section class="trial" data-case="${h(entry.id)}" aria-labelledby="title-${h(entry.id)}">
      <div class="trial-heading"><span class="number">${String(index + 1).padStart(2, "0")}</span><div><h2 id="title-${h(entry.id)}">${h(entry.title)}</h2><p>${h(entry.prompt)}</p></div></div>
      <div class="play-buttons">${entry.samples.map(s => `<button type="button" class="play" data-sample="${s.id}" aria-pressed="false"><span aria-hidden="true">▶</span> Play ${s.label}</button>`).join("")}</div>
      <audio controls preload="none" aria-label="Comparison player for ${h(entry.title)}"></audio>
      <p class="listen-status" aria-live="polite">Listen to each sample to unlock your choice.</p>
      <fieldset disabled><legend>Which would you keep?</legend><div class="choices">${entry.samples.map(s => `<button type="button" class="choice" data-choice="${s.id}" aria-pressed="false">Sample ${s.label}</button>`).join("")}<button type="button" class="choice" data-choice="tie" aria-pressed="false">About equal</button><button type="button" class="choice" data-choice="neither" aria-pressed="false">Neither</button></div></fieldset>
      <label class="note-label" for="note-${h(entry.id)}">What did you hear? <span>Optional</span></label>
      <textarea id="note-${h(entry.id)}" rows="2" maxlength="1200" placeholder="Timing, tone, clarity, or anything that stood out…"></textarea>
      <p class="save-status" role="status"></p>
      <details hidden><summary>Playback measurements</summary><p>These measure the signal. Your preference measures which version you liked.</p><div class="table-wrap"><table><thead><tr><th>Sample</th><th>Loudness</th><th>True peak</th></tr></thead><tbody>${entry.samples.map(s => `<tr><th>${s.label}</th><td>${s.metrics.integratedLufs.toFixed(2)} LUFS</td><td>${s.metrics.truePeakDbtp.toFixed(2)} dBTP</td></tr>`).join("")}</tbody></table></div></details>
    </section>`).join("")
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>${h(pack.title)} · Mashups listening bench</title>
<style>
:root{color-scheme:light;--paper:#f4f1e9;--ink:#24271f;--muted:#62675c;--line:#ced0c3;--accent:#b53520;--wash:#e9edde}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Trebuchet MS","Segoe UI",sans-serif;line-height:1.55}button,textarea,select{font:inherit}button,a,audio,textarea,select,summary{-webkit-tap-highlight-color:transparent}button{cursor:pointer}button:disabled{cursor:not-allowed;opacity:.5}:focus-visible{outline:3px solid var(--accent);outline-offset:4px}header,main,footer{width:min(880px,100% - 40px);margin:auto}.masthead{display:flex;justify-content:space-between;gap:16px;padding:24px 0;border-bottom:1px solid var(--ink);font-size:.8rem;font-weight:700;letter-spacing:.1em}.masthead span:last-child{color:var(--muted);font-weight:400;letter-spacing:0}h1{font-family:"Franklin Gothic Medium","Arial Narrow",sans-serif;font-weight:800;font-size:clamp(2.8rem,8vw,5.5rem);letter-spacing:-.045em;line-height:1.02;margin:44px 0 22px;max-width:720px}header>p{max-width:680px;color:var(--muted);font-size:1.08rem;margin-bottom:28px}.method{display:flex;flex-wrap:wrap;gap:8px 24px;padding:14px 0 24px;border-bottom:1px solid var(--ink);font-size:.88rem}.method span:before{content:'✓ ';color:var(--accent);font-weight:bold}.setup{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:28px 0;border-bottom:1px solid var(--line)}select{margin-left:8px;border:1px solid var(--line);padding:9px;background:var(--paper);color:var(--ink);border-radius:0}#progress{font-size:.9rem;color:var(--muted)}.trial{padding:34px 0 38px;border-bottom:1px solid var(--ink)}.trial-heading{display:grid;grid-template-columns:45px 1fr;gap:12px}.number{font-size:1.65rem;color:var(--accent);line-height:1.3}h2{font-size:1.35rem;letter-spacing:-.02em;margin:0}p{margin-top:8px}.trial-heading p{color:var(--muted);margin-bottom:24px}.play-buttons{display:flex;gap:12px}.play{flex:1;display:flex;align-items:center;justify-content:center;gap:12px;min-height:66px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);font-size:1.3rem;font-weight:700;border-radius:3px}.play[aria-pressed=true]{background:var(--accent);border-color:var(--accent)}.play:hover{filter:brightness(1.1)}audio{display:block;width:100%;margin-top:18px;min-height:54px}.listen-status{font-size:.87rem;color:var(--muted);min-height:24px;margin:12px 0 28px}fieldset{border:0;padding:0;margin:0 0 26px;min-width:0}legend{font-weight:700;font-size:1.06rem;margin-bottom:12px}.choices{display:flex;flex-wrap:wrap;gap:8px}.choice{padding:12px 18px;border:1px solid var(--line);background:transparent;color:var(--ink);border-radius:3px;min-height:48px}.choice[aria-pressed=true]{background:var(--wash);border-color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink)}.note-label{display:block;font-size:.92rem;margin-bottom:8px}.note-label span{color:var(--muted);margin-left:8px}textarea{width:100%;resize:vertical;padding:12px;border:1px solid var(--line);background:#faf8f2;color:var(--ink);border-radius:3px;font-size:1rem}.save-status{color:var(--muted);font-size:.85rem;min-height:22px}details{margin-top:18px;font-size:.9rem}summary{cursor:pointer;font-weight:700;padding:10px 0}details p{color:var(--muted)}table{width:100%;border-collapse:collapse;font-size:.87rem}th,td{padding:10px 8px;text-align:left;border-bottom:1px solid var(--line)}.table-wrap{overflow:auto}.finish{padding:32px 0;display:flex;align-items:center;justify-content:space-between;gap:18px}.finish p{max-width:470px;color:var(--muted);font-size:.9rem;margin:0}#download{padding:13px 20px;min-height:48px;white-space:nowrap;border:1px solid var(--ink);background:var(--ink);color:var(--paper);border-radius:3px}footer{padding:10px 0 40px;font-size:.8rem;color:var(--muted)}[hidden]{display:none!important}@media(max-width:560px){header,main,footer{width:calc(100% - 32px)}.masthead{padding-top:18px}h1{margin-top:32px}.setup{align-items:flex-start;flex-direction:column;gap:10px}.trial-heading{grid-template-columns:34px 1fr;gap:8px}.play{min-height:60px;font-size:1.15rem}.choices{display:grid;grid-template-columns:1fr 1fr}.choice{padding:12px 10px}.finish{align-items:stretch;flex-direction:column}#download{width:100%}}@media(prefers-reduced-motion:no-preference){button{transition:background-color .12s ease,color .12s ease}}
</style></head><body>
<header><div class="masthead"><span>MASHUPS</span><span>LISTENING BENCH</span></div><h1>${h(pack.title)}</h1><p>${h(pack.description)}</p><div class="method"><span>Matched playback loudness</span><span>Hidden processing labels</span><span>Your ears decide</span></div></header>
<main><div class="setup"><label for="role">I listen as a <select id="role"><option value="fan">Music fan</option><option value="producer">DJ / producer</option></select></label><span id="progress" aria-live="polite">0 of ${pack.cases.length} compared</span></div>${cases}<div class="finish"><p id="storage-status">Choices stay on this device. Download your results to share them with the person running the comparison.</p><button type="button" id="download" disabled>Download results</button></div></main>
<footer>Switch samples to compare the same point in the track. Headphones help you hear small differences. No preference is sent to a server.</footer>
<script id="bench-data" type="application/json">${inlineJson(pack)}</script>
<script>
(() => {
  'use strict';
  const pack = JSON.parse(document.getElementById('bench-data').textContent);
  const storageKey = 'mashups-listening-v1:' + pack.id;
  let results = { version: 1, packId: pack.id, listenerRole: 'fan', responses: {} };
  let canStore = true;
  const role = document.getElementById('role');
  const download = document.getElementById('download');
  const storageStatus = document.getElementById('storage-status');
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && saved.version === 1 && saved.packId === pack.id && saved.responses && typeof saved.responses === 'object' && !Array.isArray(saved.responses)) {
      results.listenerRole = saved.listenerRole === 'producer' ? 'producer' : 'fan';
      for (const entry of pack.cases) {
        const response = saved.responses[entry.id];
        const validChoices = entry.samples.map(s => s.id).concat(['tie', 'neither']);
        if (response && validChoices.includes(response.choice)) {
          results.responses[entry.id] = { choice: response.choice, notes: typeof response.notes === 'string' ? response.notes.slice(0,1200) : '', savedAt: response.savedAt, heardSeconds: response.heardSeconds || {} };
        }
      }
    }
  } catch { canStore = false; }
  function updateProgress() {
    const count = pack.cases.filter(c => results.responses[c.id] && results.responses[c.id].choice).length;
    document.getElementById('progress').textContent = count + ' of ' + pack.cases.length + ' compared';
    download.disabled = count === 0;
  }
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(results)); } catch { canStore = false; }
    if (!canStore) storageStatus.textContent = 'This browser cannot save choices between visits. Download your results before closing this page.';
    updateProgress();
  }
  role.value = results.listenerRole;
  role.addEventListener('change', () => { results.listenerRole = role.value; persist(); });
  for (const [index, entry] of pack.cases.entries()) {
    const section = document.querySelectorAll('.trial')[index];
    const player = section.querySelector('audio');
    const fieldset = section.querySelector('fieldset');
    const status = section.querySelector('.listen-status');
    const savedStatus = section.querySelector('.save-status');
    const notes = section.querySelector('textarea');
    const buttons = Array.from(section.querySelectorAll('[data-sample]'));
    const choiceButtons = Array.from(section.querySelectorAll('[data-choice]'));
    const previous = results.responses[entry.id];
    const heard = Object.fromEntries(entry.samples.map(s => { const n = previous && previous.heardSeconds && previous.heardSeconds[s.id]; return [s.id, typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(3600, n)) : 0]; }));
    let selected = null;
    let switching = 0;
    let lastTime = 0;
    const requiredSeconds = sample => Math.min(3, sample.durationSeconds * .8);
    function refreshChoice() {
      const response = results.responses[entry.id];
      choiceButtons.forEach(b => b.setAttribute('aria-pressed', String(response && response.choice === b.dataset.choice)));
      section.querySelector('details').hidden = !(response && response.choice);
      if (response && response.choice) { fieldset.disabled = false; savedStatus.textContent = canStore ? 'Choice saved on this device.' : 'Choice kept for this visit. Download to save.'; }
    }
    if (previous) notes.value = previous.notes;
    refreshChoice();
    player.addEventListener('play', () => {
      document.querySelectorAll('audio').forEach(other => { if (other !== player) other.pause(); });
      lastTime = player.currentTime;
    });
    player.addEventListener('seeking', () => { lastTime = player.currentTime; });
    player.addEventListener('timeupdate', () => {
      const delta = player.currentTime - lastTime;
      if (selected && (!player.paused || player.ended) && !player.seeking && delta > 0 && delta < 1.5) heard[selected.id] += delta;
      lastTime = player.currentTime;
      const ready = entry.samples.every(s => heard[s.id] >= requiredSeconds(s));
      if (ready) { fieldset.disabled = false; status.textContent = 'You have heard every sample. Choose the one you would keep.'; }
      else if (selected) status.textContent = entry.samples.map(s => 'Sample ' + s.label + ': ' + (Math.floor(Math.min(requiredSeconds(s), heard[s.id]) * 10) / 10).toFixed(1) + ' / ' + requiredSeconds(s) + ' seconds').join(' · ');
    });
    player.addEventListener('error', () => { status.textContent = 'This audio could not load. Check your connection and try the sample again.'; });
    buttons.forEach(button => button.addEventListener('click', async () => {
      const sample = entry.samples.find(s => s.id === button.dataset.sample);
      const token = ++switching;
      const position = player.ended ? 0 : player.currentTime;
      player.pause();
      selected = sample;
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      try {
        player.src = sample.url;
        player.load();
        await new Promise((resolve, reject) => {
          function loaded() { cleanup(); resolve(); }
          function failed() { cleanup(); reject(new Error('Audio unavailable')); }
          function cleanup() { player.removeEventListener('loadedmetadata', loaded); player.removeEventListener('error', failed); clearTimeout(timer); }
          const timer = setTimeout(failed, 20000);
          player.addEventListener('loadedmetadata', loaded);
          player.addEventListener('error', failed);
        });
        if (token !== switching) return;
        player.currentTime = Math.min(position, Math.max(0, sample.durationSeconds - .1));
        lastTime = player.currentTime;
        await player.play();
      } catch {
        if (token === switching) status.textContent = 'Playback did not start. Try the player’s play control or reload the page.';
      }
    }));
    choiceButtons.forEach(button => button.addEventListener('click', () => {
      results.responses[entry.id] = { choice: button.dataset.choice, notes: notes.value, heardSeconds: { ...heard }, savedAt: new Date().toISOString() };
      persist(); refreshChoice();
    }));
    notes.addEventListener('input', () => {
      const response = results.responses[entry.id];
      if (response) { response.notes = notes.value; persist(); }
    });
  }
  download.addEventListener('click', () => {
    const payload = { ...results, exportedAt: new Date().toISOString() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'mashups-listening-' + pack.id + '.json';
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  persist();
})();
</script></body></html>`
}
