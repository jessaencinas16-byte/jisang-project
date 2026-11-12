




function icon(name, size) {
  return `<i data-lucide="${name}" style="width:${size||'18'}px;height:${size||'18'}px"></i>`;
}

function refreshIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}


function initials(name) {
  return (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
}

function avatarHtml(name, color, size) {
  return `<div class="avatar" style="width:${size||38}px;height:${size||38}px;border-radius:12px;background:${color||'var(--coffee)'};color:#fff;display:grid;place-items:center;font-weight:700;font-size:${size?size*.35:13}px;">${initials(name)}</div>`;
}


function imgFallback(imgEl, text) {
  const parent = imgEl && imgEl.parentElement;
  if (parent) parent.innerHTML = `<span style="font-size:1.3rem">${text || '☕'}</span>`;
}

function productImageHtml(p, opts) {
  opts = opts || {};
  const size = opts.size || 44;
  const emojiSize = opts.emojiSize || Math.round((typeof size === 'number' ? size : 44) * 0.55);
  const radius = opts.radius || 12;
  const sizeVal = typeof size === 'string' ? size : `${size}px`; 
  const style = `width:${sizeVal};height:${sizeVal};border-radius:${radius}px;flex-shrink:0`;
  if (p && p.img) {
    return `<div class="pimg" style="${style}"><img src="${p.img}" alt="${p.name || 'product'}" onerror="imgFallback(this,'${String(p.emoji || '☕').replace(/"/g, '')}')" /></div>`;
  }
  return `<div class="pimg" style="${style};display:grid;place-items:center;background:var(--primary-soft);font-size:${emojiSize}px">${(p && p.emoji) || '☕'}</div>`;
}


function skeletonCards(count) {
  let h = '';
  for (let i=0;i<count;i++) {
    h += `<div class="card card-pad" style="min-height:120px">
      <div class="skeleton" style="width:42px;height:42px;border-radius:12px;margin-bottom:12px"></div>
      <div class="skeleton" style="width:60%;height:12px;margin-bottom:8px"></div>
      <div class="skeleton" style="width:80%;height:24px"></div>
      <div class="skeleton" style="width:40%;height:10px;margin-top:10px"></div>
    </div>`;
  }
  return `<div class="stat-grid">${h}</div>`;
}

function skeletonRows(n) {
  let h = '';
  for (let i=0;i<n;i++) h += `<div class="skeleton" style="height:56px;border-radius:12px;margin-bottom:10px;width:100%"></div>`;
  return h;
}


function toast(title, msg, type) {
  const root = document.getElementById('toast-root');
  const icons = { success:'check-circle-2', error:'alert-circle', warning:'alert-triangle', info:'info' };
  const el = document.createElement('div');
  el.className = `toast toast-${type||'info'}`;
  el.innerHTML = `
    <div class="toast-icon">${icon(icons[type||'info']||'info', 20)}</div>
    <div style="flex:1">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg||''}</div>
    </div>
  `;
  root.appendChild(el);
  refreshIcons();
  setTimeout(() => { el.classList.add('out'); setTimeout(()=>el.remove(), 320); }, 3500);
}


function confirmDialog({ title, message, confirmText='Delete', danger=true, onConfirm }) {
  const root = document.getElementById('confirm-root');
  root.innerHTML = `
    <div class="confirm-overlay">
      <div class="confirm-box">
        <div class="confirm-icon">${icon('trash-2', 26)}</div>
        <h3 style="margin-bottom:8px">${title}</h3>
        <p class="muted" style="font-size:.9rem;margin-bottom:20px">${message}</p>
        <div style="display:flex;gap:10px">
          <button class="btn btn-ghost" style="flex:1" id="cf-cancel">Cancel</button>
          <button class="btn ${danger?'btn-danger':'btn-success'}" style="flex:1;font-weight:800;color:#fff;${danger?'background:var(--error);':'background:var(--success);'}" id="cf-ok">${confirmText}</button>
        </div>
      </div>
    </div>
  `;
  root.querySelector('#cf-cancel').onclick = () => root.innerHTML = '';
  root.querySelector('#cf-ok').onclick = () => { root.innerHTML = ''; onConfirm && onConfirm(); };
  root.querySelector('.confirm-overlay').onclick = (e) => { if (e.target === e.currentTarget) root.innerHTML=''; };
}


let modalCloseHandler = null;

function openModal(html, opts) {
  opts = opts || {};
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal ${opts.lg?'modal-lg':''}" style="${opts.width?'max-width:'+opts.width+';':''}">
        ${html}
      </div>
    </div>
  `;
  refreshIcons();
  modalCloseHandler = (e) => {
    if (e.target.id === 'modal-overlay' || e.target.closest('.modal-close')) closeModal();
  };
  root.querySelector('#modal-overlay').addEventListener('click', modalCloseHandler);
  document.addEventListener('keydown', escHandler);
}

function closeModal() {
  const root = document.getElementById('modal-root');
  root.innerHTML = '';
  document.removeEventListener('keydown', escHandler);
  
  try { if (window.App) window.App.currentProductId = null; } catch(e) {}
  modalCloseHandler = null;
}

function escHandler(e) { if (e.key === 'Escape') closeModal(); }


function openDrawer() {
  const root = document.getElementById('drawer-root');
  const sidebar = document.getElementById('app-sidebar');
  root.innerHTML = `
    <div class="drawer-overlay" id="drawer-overlay"></div>
    <div class="drawer" id="drawer">${sidebar ? sidebar.innerHTML : ''}</div>
  `;
  root.querySelector('.drawer-overlay').onclick = closeDrawer;
  const drawer = document.getElementById('drawer');
  drawer.querySelectorAll('.nav-item[data-route]').forEach(el => {
    el.onclick = () => { closeDrawer(); App.navigate(el.dataset.route); };
  });
  refreshIcons();
}
function closeDrawer() { document.getElementById('drawer-root').innerHTML = ''; }




function renderBarChart(canvas, opts) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 400;
  const cssH = opts.height || 260;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssW, cssH);

  const labels = opts.labels || [];
  const values = opts.values || [];
  const color = opts.color || getComputedStyle(document.documentElement).getPropertyValue('--coffee').trim() || '#6F4E37';
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,.08)' : 'rgba(60,40,25,.08)';
  const textColor = isDark ? 'rgba(244,237,230,.6)' : 'rgba(107,93,79,.8)';

  const padL = 46, padR = 12, padT = 18, padB = 30;
  const w = cssW - padL - padR, h = cssH - padT - padB;
  const max = Math.max(...values) * 1.15 || 1;
  const step = Math.ceil(max / 4 / 10) * 10;

  
  ctx.strokeStyle = gridColor; ctx.fillStyle = textColor; ctx.font = '11px Inter';
  ctx.lineWidth = 1;
  for (let i=0;i<=4;i++) {
    const y = padT + h - (h * (i/4));
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(cssW-padR, y); ctx.stroke();
    ctx.textAlign='right'; ctx.fillText('₱'+(step*i).toLocaleString(), padL-8, y+4);
  }

  const bw = (w / labels.length) * 0.55;
  const barGap = (w / labels.length);
  labels.forEach((lb, i) => {
    const v = values[i];
    const bh = (v/max)*h;
    const x = padL + (barGap * i) + (barGap - bw)/2;
    const y = padT + h - bh;
    const grad = ctx.createLinearGradient(0, y, 0, padT+h);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + (isDark ? '55' : '66'));
    if (opts.type === 'line') {
      
      ctx.beginPath(); ctx.arc(x+bw/2, y, 5, 0, Math.PI*2); ctx.fillStyle = color; ctx.fill();
    } else {
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(x, padT+h);
      ctx.lineTo(x, y+r);
      ctx.quadraticCurveTo(x, y, x+r, y);
      ctx.lineTo(x+bw-r, y);
      ctx.quadraticCurveTo(x+bw, y, x+bw, y+r);
      ctx.lineTo(x+bw, padT+h);
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.fillStyle = textColor; ctx.textAlign='center';
    ctx.fillText(lb, x+bw/2, padT+h+18);
  });

  
  if (opts.type === 'line') {
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = padL + (barGap * i) + barGap/2;
      const y = padT + h - (v/max)*h;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
    const areaGrad = ctx.createLinearGradient(0, padT, 0, padT+h);
    areaGrad.addColorStop(0, color+'44'); areaGrad.addColorStop(1, color+'00');
    ctx.lineTo(padL + barGap*(values.length-1) + barGap/2, padT+h);
    ctx.lineTo(padL + barGap/2, padT+h);
    ctx.closePath(); ctx.fillStyle = areaGrad; ctx.fill();
  }
}


function renderDoughnut(canvas, opts) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 200;
  const cssH = opts.height || 200;
  canvas.width = cssW * dpr; canvas.height = cssH * dpr;
  ctx.scale(dpr, dpr); ctx.clearRect(0,0,cssW,cssH);

  const data = opts.data || [];
  const colors = opts.colors || ['#6F4E37','#D2B48C','#22C55E','#F59E0B','#8B5E34','#EF4444','#3B82F6','#A855F7'];
  const total = data.reduce((a,b)=>a+b,0);
  let start = -Math.PI/2;
  const cx = cssW/2, cy = cssH/2, r = Math.min(cssW, cssH)/2 - 14;
  data.forEach((v, i) => {
    if (!v) return;
    const ang = (v/total) * Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start+ang);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    start += ang;
  });
  
  ctx.beginPath(); ctx.arc(cx, cy, r*0.62, 0, Math.PI*2); ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#fff'; ctx.fill();
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#241B16';
  ctx.textAlign = 'center'; ctx.font = '700 20px Poppins';
  ctx.fillText(opts.center || '', cx, cy+4);
}


function copyText(t) {
  const ta = document.createElement('textarea');
  ta.value = t; document.body.appendChild(ta); ta.select();
  document.execCommand('copy'); ta.remove();
  toast('Copied', 'Text copied to clipboard', 'success');
}


function exportCSV(filename, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast('Export Complete', `${filename} downloaded`, 'success');
}


function statusBadge(status, label) {
  const map = {
    'Active':'badge-success','Completed':'badge-success','Success':'badge-success','Preparing':'badge-warning',
    'Ready':'badge-info','Waiting':'badge-warning','Hold':'badge-neutral','Inactive':'badge-neutral',
    'Low':'badge-error','Out':'badge-error','Failed':'badge-error','Danger':'badge-error','Voided':'badge-error',
    'Gold':'badge-warning','Silver':'badge-neutral','Platinum':'badge-primary','Member':'badge-info',
  };
  return `<span class="badge ${map[status]||'badge-neutral'}">${label||status}</span>`;
}


function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}
