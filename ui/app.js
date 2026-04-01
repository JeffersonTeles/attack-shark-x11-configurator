const MAX_DPI = 22000;
const PRESETS = {
  jogos:    {dpiValues:[800,1600,3200,6400,12800,22000],activeStage:3,pollingRate:'eSports',lightMode:'Neon',rgb:[255,0,128],ledSpeed:5,sleepTime:10,deepSleep:30,keyResponse:4},
  trabalho: {dpiValues:[400,800,1200,1600,2400,3200],activeStage:1,pollingRate:'office',lightMode:'Off',rgb:[255,255,255],ledSpeed:1,sleepTime:2,deepSleep:5,keyResponse:8},
};
const state = {dpiValues:[800,1600,2400,3200,5000,22000],activeStage:2,pollingRate:'eSports',lightMode:'Neon',rgb:[255,255,255],ledSpeed:3,sleepTime:5,deepSleep:10,keyResponse:4};

// TABS
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.content').forEach(x => x.classList.add('hidden'));
  t.classList.add('active');
  document.getElementById('tab-'+t.dataset.tab).classList.remove('hidden');
  if (t.dataset.tab === 'perfis') refreshProfiles();
}));

// BATTERY
async function refreshBattery() {
  try {
    const r = await window.pywebview.api.get_battery();
    if (!r.ok) return;
    document.getElementById('bat-pct').textContent = r.value + '%';
    const b = document.getElementById('bat-badge');
    b.className = 'bat-badge' + (r.value > 50 ? '' : r.value > 20 ? ' yellow' : ' red');
    if (r.value <= 20) window.pywebview.api.notify_low_battery(r.value);
  } catch(e){}
}
document.getElementById('bat-badge').addEventListener('click', refreshBattery);
window.addEventListener('pywebviewready', () => { refreshBattery(); setInterval(refreshBattery, 300000); });

// DPI
function renderDpi() {
  const list = document.getElementById('dpi-list');
  list.innerHTML = '';
  state.dpiValues.forEach((val, i) => {
    const row = document.createElement('div');
    row.className = 'dpi-row';
    row.innerHTML = `<div class="dpi-label">Estágio ${i+1}</div>
      <div class="dpi-track" data-idx="${i}"><div class="dpi-fill" style="width:${val/MAX_DPI*100}%"></div></div>
      <div class="dpi-val" id="dpi-val-${i}">${val}</div>`;
    list.appendChild(row);
  });
  list.querySelectorAll('.dpi-track').forEach(t => t.addEventListener('click', () => openPopup(+t.dataset.idx)));
}

let activeIdx = -1;
const popup = document.getElementById('dpi-popup');
const popupSlider = document.getElementById('dpi-popup-slider');
const popupVal = document.getElementById('dpi-popup-val');

function openPopup(idx) {
  activeIdx = idx;
  document.getElementById('dpi-popup-label').textContent = 'Estágio ' + (idx+1);
  popupSlider.value = state.dpiValues[idx];
  popupVal.textContent = state.dpiValues[idx];
  popup.classList.remove('hidden');
}
popupSlider.addEventListener('input', () => {
  const v = +popupSlider.value;
  popupVal.textContent = v;
  state.dpiValues[activeIdx] = v;
  const fill = document.querySelector(`.dpi-track[data-idx="${activeIdx}"] .dpi-fill`);
  if (fill) fill.style.width = (v/MAX_DPI*100)+'%';
  document.getElementById('dpi-val-'+activeIdx).textContent = v;
});
document.getElementById('dpi-popup-close').addEventListener('click', () => popup.classList.add('hidden'));

// STAGES
function renderStages() {
  const wrap = document.getElementById('stage-btns');
  wrap.innerHTML = '';
  for (let i=0;i<6;i++) {
    const b = document.createElement('div');
    b.className = 'stage-btn'+(i===state.activeStage?' active':'');
    b.textContent = i+1;
    b.addEventListener('click', () => { state.activeStage=i; renderStages(); });
    wrap.appendChild(b);
  }
}

// POLLING
document.querySelectorAll('.rate-btn').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.rate-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active'); state.pollingRate = b.dataset.val;
}));

// PROFILE QUICK
document.querySelectorAll('.profile-btn').forEach(b => b.addEventListener('click', async () => {
  document.querySelectorAll('.profile-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  const name = b.dataset.profile;
  if (PRESETS[name]) { loadStateData(PRESETS[name]); return; }
  const r = await window.pywebview.api.load_profile(name);
  if (r.ok) loadStateData(r.data);
}));

// LIGHT
document.querySelectorAll('.light-btn').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.light-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active'); state.lightMode = b.dataset.val;
}));

// RGB
const cp = document.getElementById('color-picker');
cp.addEventListener('input', () => {
  const hex = cp.value;
  document.getElementById('rgb-preview').style.background = hex;
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  state.rgb=[r,g,b];
  document.getElementById('rgb-label').textContent = `RGB: ${r}, ${g}, ${b}`;
});

// SPEED
document.querySelectorAll('.speed-btn').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.speed-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active'); state.ledSpeed = +b.dataset.val;
}));

// ENERGY SLIDERS
[['sleep-slider','sleep-val','sleepTime',false],['deep-slider','deep-val','deepSleep',true],['key-slider','key-val','keyResponse',true]].forEach(([sid,vid,key,int]) => {
  document.getElementById(sid).addEventListener('input', e => {
    const v = int ? parseInt(e.target.value) : parseFloat(e.target.value);
    state[key]=v; document.getElementById(vid).textContent=v;
  });
});

// APPLY / RESET
function setStatus(id, msg, color='var(--green)') {
  const el = document.getElementById(id);
  el.textContent=msg; el.style.color=color;
  setTimeout(()=>el.textContent='', 4000);
}

document.getElementById('btn-apply').addEventListener('click', async () => {
  const btn = document.getElementById('btn-apply');
  btn.textContent='⏳ Aplicando...';
  try {
    const r = await window.pywebview.api.apply({...state});
    btn.textContent='✅ Aplicar Configurações';
    setStatus('status-main', r.ok?'✅ Configurações aplicadas!':'❌ Erro: '+(r.error||''), r.ok?'var(--green)':'var(--red)');
  } catch(e) { btn.textContent='✅ Aplicar Configurações'; setStatus('status-main','❌ Erro','var(--red)'); }
});

document.getElementById('btn-reset').addEventListener('click', async () => {
  if (!confirm('Resetar o mouse?')) return;
  await window.pywebview.api.reset();
  setStatus('status-main','✅ Mouse resetado!');
});

// PROFILES
async function refreshProfiles() {
  const list = document.getElementById('profiles-list');
  try {
    const profiles = await window.pywebview.api.list_profiles();
    if (!profiles.length) { list.innerHTML='<div style="color:var(--subtle);font-size:13px">Nenhum perfil salvo ainda.</div>'; return; }
    list.innerHTML = profiles.map(n => `<div class="profile-item">
      <div class="profile-item-name">📁 ${n}</div>
      <div class="profile-item-btns">
        <div class="mini-btn" onclick="loadSaved('${n}')">▶ Carregar</div>
        <div class="mini-btn danger" onclick="delProfile('${n}')">🗑</div>
      </div></div>`).join('');
  } catch(e) { list.innerHTML='<div style="color:var(--red);font-size:13px">Erro ao carregar perfis.</div>'; }
}

async function loadSaved(name) {
  const r = await window.pywebview.api.load_profile(name);
  if (r.ok) { loadStateData(r.data); setStatus('status-profiles',`✅ Perfil "${name}" carregado!`); }
}
async function delProfile(name) {
  if (!confirm(`Deletar "${name}"?`)) return;
  await window.pywebview.api.delete_profile(name); refreshProfiles();
}

document.getElementById('btn-save-profile').addEventListener('click', async () => {
  const name = document.getElementById('profile-name').value.trim();
  if (!name) { setStatus('status-profiles','❌ Digite um nome!','var(--red)'); return; }
  const r = await window.pywebview.api.save_profile(name, {...state});
  if (r.ok) { setStatus('status-profiles',`✅ "${name}" salvo!`); document.getElementById('profile-name').value=''; refreshProfiles(); }
});

document.getElementById('preset-games').addEventListener('click', () => { loadStateData(PRESETS.jogos); setStatus('status-profiles','✅ Perfil Jogos carregado!'); });
document.getElementById('preset-work').addEventListener('click', () => { loadStateData(PRESETS.trabalho); setStatus('status-profiles','✅ Perfil Trabalho carregado!'); });

function loadStateData(data) {
  Object.assign(state, data);
  renderDpi(); renderStages();
  document.querySelectorAll('.rate-btn').forEach(b => b.classList.toggle('active', b.dataset.val===state.pollingRate));
  document.querySelectorAll('.light-btn').forEach(b => b.classList.toggle('active', b.dataset.val===state.lightMode));
  const hex = '#'+state.rgb.map(c=>c.toString(16).padStart(2,'0')).join('');
  cp.value=hex; document.getElementById('rgb-preview').style.background=hex;
  document.getElementById('rgb-label').textContent=`RGB: ${state.rgb.join(', ')}`;
  document.querySelectorAll('.speed-btn').forEach(b => b.classList.toggle('active', +b.dataset.val===state.ledSpeed));
  document.getElementById('sleep-slider').value=state.sleepTime; document.getElementById('sleep-val').textContent=state.sleepTime;
  document.getElementById('deep-slider').value=state.deepSleep; document.getElementById('deep-val').textContent=state.deepSleep;
  document.getElementById('key-slider').value=state.keyResponse; document.getElementById('key-val').textContent=state.keyResponse;
}

renderDpi(); renderStages();
