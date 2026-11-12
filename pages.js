



const Pages = {

  
  dashboard() {
    const s = this.calcStats();
    const cards = [
      { label:'Today\'s Sales', value:money(s.todaySales), trend: s.todaySales>0?'Live':'No sales yet', up:true, icon:'coins', cls:'icon-bg-green' },
      { label:'Today\'s Orders', value:s.orders, trend: s.orders>0?'Live':'No orders yet', up:true, icon:'receipt', cls:'icon-bg-coffee' },
      { label:'Revenue (Month)', value:money(s.monthRev), trend:'This month', up:true, icon:'trending-up', cls:'icon-bg-blue' },
      { label:'Total Customers', value:s.customers, trend:'All time', up:true, icon:'users', cls:'icon-bg-purple' },
      { label:'Best Selling Item', value:s.bestDrink, trend:'All-time top seller', up:true, icon:'trophy', cls:'icon-bg-orange' },
      { label:'Pending Orders', value:s.pending, trend:s.pending>0?'Needs attention':'All clear', up:s.pending===0, icon:'clock', cls:'icon-bg-red' },
      { label:'Low Stock Items', value:s.lowStock, trend:s.lowStock>0?'Reorder soon':'All good', up:s.lowStock===0, icon:'alert-triangle', cls:'icon-bg-red' },
      { label:'Monthly Revenue', value:money(s.monthRev), trend:'This month', up:true, icon:'banknote', cls:'icon-bg-latte' },
    ];

    const payBreakdown = this.paymentBreakdown(s.realOrders);
    const recentOrders = [...App.orders].slice(0, 5); 
    const topItems = s.rankedItems.slice(0, 5);
    const topMax = topItems.length ? topItems[0][1] : 1;

    return `
    <div class="page-header">
      <div>
        <h1>${greeting()}, ${App.user.name.split(' ')[0]} 👋</h1>
        <p class="muted text-sm">${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>
      <button class="btn btn-primary" onclick="App.navigate('pos')">${icon('plus')} New Order</button>
    </div>

    <div class="stat-grid">
      ${cards.map(c => `
        <div class="card stat-card hoverable">
          <div class="stat-icon ${c.cls}">${icon(c.icon, 21)}</div>
          <div class="stat-label">${c.label}</div>
          <div class="stat-value">${c.value}</div>
          <span class="stat-trend" style="color:${c.up? 'var(--success)' : 'var(--error)'}">
            ${icon(c.up?'trending-up':'trending-down', 13)} ${c.trend}
          </span>
        </div>`).join('')}
    </div>

    <div class="dashboard-grid">
      <div class="card card-pad">
        <div class="flex items-center justify-between" style="margin-bottom:8px">
          <div>
            <h3 style="font-size:1.05rem">Sales Overview</h3>
            <span class="muted text-xs">${Pages.salesView==='week' ? 'Daily totals, last 7 days' : 'Hourly transactions today'}</span>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm ${Pages.salesView!=='week'?'active':''}" onclick="Pages.salesView='day';Pages.afterRender()">Today</button>
            <button class="btn btn-ghost btn-sm ${Pages.salesView==='week'?'active':''}" onclick="Pages.salesView='week';Pages.afterRender()">Week</button>
          </div>
        </div>
        <canvas class="chart-canvas" id="sales-chart" style="height:260px"></canvas>
      </div>

      <div class="card card-pad">
        <div class="flex items-center justify-between" style="margin-bottom:8px">
          <div>
            <h3 style="font-size:1.05rem">Payment Methods</h3>
            <span class="muted text-xs">Share of transactions</span>
          </div>
        </div>
        <canvas id="pay-chart" style="width:100%;height:190px"></canvas>
        <div style="margin-top:10px">
          ${payBreakdown.length ? payBreakdown.map(p => `
            <div class="flex items-center justify-between" style="font-size:.8rem;padding:4px 0">
              <span class="flex items-center gap-2"><span class="badge-dot" style="background:${p.color}"></span>${p.name}</span>
              <b>${p.pct}%</b>
            </div>`).join('') : `<div class="muted text-xs">No completed orders yet.</div>`}
        </div>
      </div>
    </div>

    <div class="dashboard-row2">
      <div class="card card-pad">
        <div class="flex items-center justify-between" style="margin-bottom:12px">
          <h3 style="font-size:1rem">Recent Transactions</h3>
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('orders')">View all</button>
        </div>
        ${recentOrders.length ? recentOrders.map(t => `
          <div class="list-row">
            <div class="list-avatar">${initials(t.customer)}</div>
            <div style="flex:1;min-width:0">
              <div class="fw-700 truncate" style="font-size:.9rem">${t.customer}</div>
              <div class="muted text-xs">${t.id} · ${t.payment||'—'}</div>
            </div>
            <div style="text-align:right">
              <div class="fw-700" style="font-size:.9rem">${money(t.total)}</div>
              <div class="text-xs">${statusBadge(t.status)}</div>
            </div>
          </div>`).join('') : `<div class="muted text-sm" style="padding:8px 0">No orders yet — they'll show up here as soon as you ring one up.</div>`}
      </div>

      <div class="card card-pad">
        <div class="flex items-center justify-between" style="margin-bottom:12px">
          <h3 style="font-size:1rem">Top Selling Items</h3>
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('reports')">Reports</button>
        </div>
        ${topItems.length ? topItems.map(([name,qty],i) => `
          <div style="margin-bottom:12px">
            <div class="flex items-center justify-between" style="font-size:.82rem;margin-bottom:4px">
              <span class="fw-600">${i+1}. ${name}</span><b>${qty} sold</b>
            </div>
            <div class="progress"><div style="width:${(qty/topMax)*100}%;background:linear-gradient(90deg,var(--coffee),var(--latte))"></div></div>
          </div>`).join('') : `<div class="muted text-sm">No sales data yet.</div>`}
      </div>

      <div class="card card-pad">
        <div class="flex items-center justify-between" style="margin-bottom:12px">
          <h3 style="font-size:1rem">Recent Customer Orders</h3>
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('customers')">View</button>
        </div>
        ${recentOrders.filter(o=>o.customer && o.customer!=='Walk-in').length ? recentOrders.filter(o=>o.customer && o.customer!=='Walk-in').map(a => `
          <div class="list-row">
            <div class="list-avatar" style="background:var(--primary-soft);color:var(--primary)">${initials(a.customer)}</div>
            <div style="flex:1;min-width:0">
              <div class="fw-700 truncate" style="font-size:.86rem">${a.customer}</div>
              <div class="muted text-xs truncate">Ordered ${money(a.total)} · ${a.id}</div>
            </div>
            <span class="muted text-xs" style="white-space:nowrap">${a.time||''}</span>
          </div>`).join('') : `<div class="muted text-sm">No named-customer orders yet.</div>`}
      </div>
    </div>`;
  },

  calcStats() {
    const lowStock = App.inventory.filter(i => i.stock < i.min).length;
    const pending = App.orders.filter(o => o.status==='Waiting' || o.status==='Preparing' || o.status==='Hold').length;

    const todayStr = new Date().toISOString().slice(0,10);
    const monthStr = todayStr.slice(0,7);
    const realOrders = App.orders.filter(o => o.status !== 'Hold' && o.status !== 'Voided');

    const todayOrders = realOrders.filter(o => o.date === todayStr);
    const todaySales = todayOrders.reduce((sum,o) => sum + (o.total||0), 0);

    const monthOrders = realOrders.filter(o => (o.date||'').startsWith(monthStr));
    const monthRev = monthOrders.reduce((sum,o) => sum + (o.total||0), 0);

    
    const itemTally = {};
    realOrders.forEach(o => (o.items||[]).forEach(it => {
      itemTally[it.name] = (itemTally[it.name]||0) + (it.qty||0);
    }));
    const rankedItems = Object.entries(itemTally).sort((a,b) => b[1]-a[1]);
    const bestDrink = rankedItems.length ? rankedItems[0][0] : '—';

    return {
      todaySales, monthRev,
      orders: todayOrders.length,
      customers: App.customers.length,
      bestDrink, pending, lowStock,
      rankedItems, realOrders,
    };
  },

  
  paymentBreakdown(orders) {
    const tally = {};
    orders.forEach(o => { const p = o.payment || 'Other'; tally[p] = (tally[p]||0) + 1; });
    const total = orders.length || 1;
    const colors = { 'Cash':'#6F4E37', 'GCash':'#22C55E', 'Credit Card':'#3B82F6', 'Debit Card':'#0EA5E9', 'Maya':'#A855F7', 'QR Code':'#F59E0B' };
    return Object.entries(tally)
      .sort((a,b) => b[1]-a[1])
      .map(([name, count]) => ({ name, pct: Math.round((count/total)*100), color: colors[name] || '#94A3B8' }));
  },

  
  salesHistory(realOrders) {
    const todayStr = new Date().toISOString().slice(0,10);
    const hourly = new Array(24).fill(0);
    realOrders.filter(o => o.date === todayStr).forEach(o => {
      const m = /(\d{1,2}):\d{2}\s*(AM|PM)/i.exec(o.time || '');
      if (!m) return;
      let h = parseInt(m[1], 10) % 12;
      if (/PM/i.test(m[2])) h += 12;
      hourly[h] += (o.total||0);
    });

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0,10));
    }
    const weekly = days.map(d => realOrders.filter(o => o.date === d).reduce((s,o) => s + (o.total||0), 0));
    const weekLabels = days.map(d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday:'short' }));

    return { hourly, weekly, weekLabels };
  },

  
  renderDashboardCharts() {
    const s = this.calcStats();
    const hist = this.salesHistory(s.realOrders);

    const canvas = document.getElementById('sales-chart');
    if (canvas) {
      const isDay = Pages.salesView !== 'week';
      if (isDay) {
        const buckets = [0,4,8,12,16,20];
        renderBarChart(canvas, {
          labels: ['12a','4a','8a','12p','4p','8p'],
          values: buckets.map(h => hist.hourly[h]),
          type:'bar', height:260,
        });
      } else {
        renderBarChart(canvas, { labels: hist.weekLabels, values: hist.weekly, type:'bar', height:260 });
      }
    }

    const payCanvas = document.getElementById('pay-chart');
    if (payCanvas) {
      const breakdown = this.paymentBreakdown(s.realOrders);
      if (breakdown.length) {
        renderDoughnut(payCanvas, {
          data: breakdown.map(p => p.pct),
          colors: breakdown.map(p => p.color),
          center: '', height:190,
        });
      }
    }
  },

  
  pos() {
    const cats = ['All', ...CATEGORIES];
    const q = (App.search||'').toLowerCase();
    const filtered = App.products.filter(p => {
      const catOk = App.activeCat==='All' || p.cat === App.activeCat;
      const qOk = !q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q);
      return catOk && qOk;
    });

    const sum = App.total(App.cart);
    const cartCount = App.cart.reduce((a,b)=>a+b.qty,0);

const cartItems = App.cart.length ? App.cart.map((it, idx) => `
      <div class="cart-item">
        ${productImageHtml(it, {size:40, radius:12, emojiSize:22})}
        <div class="ci-info">
          <div class="ci-name">${it.name}</div>
          <div class="ci-meta truncate">${it.size||''}${it.size&&it.temp?' · ':''}${it.temp||''}${it.extras&&it.extras.length?' · '+it.extras.join(', '):''}</div>
          <div class="qty-control">
            <button class="qty-btn minus" onclick="App.changeQty(${idx},-1)">−</button>
            <span class="qty-val">${it.qty}</span>
            <button class="qty-btn" onclick="App.changeQty(${idx},1)">+</button>
          </div>
        </div>
        <div style="text-align:right;display:flex;flex-direction:column;gap:4px;align-items:flex-end">
          <span class="ci-price">${money(it.lineTotal)}</span>
          <button class="icon-btn" style="width:28px;height:28px;color:var(--error)" onclick="App.removeItem(${idx})">${icon('trash-2',15)}</button>
        </div>
      </div>`).join('') : '';

    return `
    <div class="pos-layout">
      <div>
        <div class="pos-cats">
          ${cats.map(c => `<button class="category-chip ${App.activeCat===c?'active':''}" onclick="App.setCat('${c}')">${c}</button>`).join('')}
        </div>
        <div class="products-grid" id="pos-products">
${filtered.map(p => `
<div class="product-card ${p.available?'':'unavailable'}" onclick="Pages.openCustomizer('${p.id}')">
              ${(p.popular||p.new) ? `<div class="product-badge">${p.popular?'<span class="badge-pop">★ Popular</span>':''}${p.new?'<span class="badge-new">NEW</span>':''}</div>` : ''}
              <div class="product-img">${productImageHtml(p, {size:'100%', radius:0, emojiSize:52})}</div>
              <div class="product-body">
                <div class="product-name">${p.name}</div>
                <div class="muted text-xs truncate">${p.desc||p.cat}</div>
                <div class="product-price">${money(p.price)}</div>
              </div>
              <span class="product-availability ${p.available?'available':'unavailable'}">${p.available?'Available':'Unavailable'}</span>
              <button class="product-add" ${p.available?'':'disabled'} onclick="event.stopPropagation();Pages.openCustomizer('${p.id}')">${icon(p.available?'plus':'x')}</button>
            </div>`).join('')}
        </div>
        ${!filtered.length ? `<div class="empty-state">${icon('search')}<div>No products found</div></div>` : ''}
      </div>

      <aside class="cart-panel" id="cart-panel">
        <div class="cart-head">
          <div class="flex items-center justify-between">
            <h3 style="font-size:1rem">${icon('shopping-cart',18)} ${App.cart.length?'<span style="margin-left:6px">Current Order</span>':'<span style="margin-left:6px">Cart</span>'}</h3>
            <span class="badge badge-primary">${cartCount} item${cartCount!==1?'s':''}</span>
          </div>
          <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:8px;justify-content:space-between" onclick="App.chooseCustomer()">
            <span class="flex items-center gap-2">${icon('user',15)} ${App.cartCustomer}</span>
            <span class="muted">${icon('chevron-down',14)}</span>
          </button>
        </div>

        <div class="cart-items" id="cart-items">
          ${App.cart.length ? cartItems : `
            <div class="cart-empty">
              ${icon('coffee')}
              <div class="fw-600" style="font-size:.9rem">Your cart is empty</div>
              <div class="text-xs muted" style="margin-top:4px">Tap a product to start an order</div>
            </div>`}
        </div>

        <div class="cart-summary">
          <div class="sum-row"><span>Subtotal</span><span class="sum-val" id="subtotal">${money(sum.subtotal)}</span></div>
          <div class="promo-entry">
            <div class="promo-input-row">
              <select class="select" id="promo-code-input" aria-label="Select promotion" onchange="App.selectPromoCode(this.value)">
                <option value="">${App.cart.length ? 'Select promotion' : 'No promotions available'}</option>
                ${App.getApplicablePromos(App.cart).map(p => `<option value="${p.code}" ${App.promoCode === String(p.code || '').toUpperCase() ? 'selected' : ''}>${p.name} · ${p.type === 'B1G1' ? 'Buy 1 Get 1' : `${p.discount}% off`}</option>`).join('')}
              </select>
              ${sum.promo ? `<button class="btn btn-ghost btn-sm" onclick="App.clearPromoCode()">Clear</button>` : ''}
            </div>
            ${sum.promo ? `<div class="promo-applied">${icon('tag',13)} ${sum.promo.name} applied</div>` : `<div class="promo-hint">${App.cart.length ? `${App.getApplicablePromos(App.cart).length} promotion${App.getApplicablePromos(App.cart).length === 1 ? '' : 's'} available for this cart` : 'Add items to identify applicable promotions'}</div>`}
          </div>
          <div class="sum-row"><span>Discount</span><span class="sum-val" style="color:var(--success)" id="discount">−${money(sum.discount)}</span></div>
          <div class="sum-row"><span>Tax (${Math.round(STORE_INFO.taxRate*100)}%)</span><span class="sum-val" id="tax">${money(sum.tax)}</span></div>
          <div class="sum-row total"><span>Grand Total</span><span id="total">${money(sum.total)}</span></div>

          <div class="cart-actions">
            <button class="btn btn-ghost" onclick="App.holdOrder()">${icon('pause')} Hold</button>
            <button class="btn btn-ghost" onclick="App.clearCart()">${icon('trash-2')} Clear</button>
          </div>
          <button class="btn-checkout" ${App.cart.length?'':'disabled'} onclick="App.checkout()">${icon('check',18)} Checkout ${money(sum.total)}</button>
        </div>
      </aside>
    </div>

    <div class="cart-open-btn" onclick="App.toggleMobileCart()" style="display:none">${icon('shopping-cart')}<span class="count" id="cart-mobile-count2"></span></div>`;
  },

  posAfterRender() { this.updateCartBadge(); },

updateCartBadge() {
    const count = App.cart.reduce((a,b)=>a+b.qty,0);
    document.querySelectorAll('#cart-mobile-count, #cart-mobile-count2, .cart-open-btn .count').forEach(el => {
      if (el) { el.textContent = count; el.style.display = count ? 'grid' : 'none'; }
    });
    const btn = document.querySelector('.cart-open-btn');
    if (btn) btn.style.display = count ? 'grid' : 'none';
  },

  
  openCustomizer(productId) {
    const p = App.products.find(x => x.id === productId);
    if (!p) return;
    if (!p.available) { toast('Unavailable', `${p.name} is out of stock`, 'error'); return; }
const isDrink = !!p.sizePrices;
    
    const prev = Pages._custState ? Pages._custState.state : null;
    const state = prev ? {
      size: prev.size || 'M', temp: prev.temp || 'Hot', sugar: prev.sugar || '50%',
      ice: prev.ice || 'Normal', milk: prev.milk || 'Whole',
      extras: prev.extras || [], qty: prev.qty || 1, note: prev.note || ''
    } : {
      size: 'M', temp: 'Hot', sugar: '50%', ice: 'Normal', milk: 'Whole',
      extras: [], qty: 1, note: ''
    };
    const price = () => {
      let base = isDrink ? (p.sizePrices[state.size] || p.price) : p.price;
      const milk = MILK_OPTIONS.find(m => m.key === state.milk) || {price:0};
      const extras = state.extras.reduce((a, e) => a + (EXTRA_OPTIONS.find(x=>x.key===e)||{price:0}).price, 0);
      return (base + milk.price + extras) * state.qty;
    };

    const optBtn = (label, val, cb) => `
      <button class="option-pill ${state[val]===label?'active':''}" onclick="Pages._setOpt('${val}','${label}', cb)">${label}</button>`;

    const html = `
    <div class="modal-head">
<div class="flex items-center gap-3">
        ${productImageHtml(p, {size:46, radius:13, emojiSize:26})}
        <div>
          <h3>${p.name}</h3>
          <span class="muted text-xs">${p.desc||p.cat}</span>
        </div>
      </div>
      <button class="modal-close" onclick="closeModal()">${icon('x')}</button>
    </div>
    <div class="modal-body">

      ${isDrink ? `
      <div class="custom-row">
        <span class="custom-label">Size</span>
        <div class="option-grid" style="grid-template-columns:repeat(3,1fr)">
          ${SIZE_OPTIONS.map(s => `<button class="option-pill ${state.size===s.key?'active':''}" onclick="Pages._setOpt('size','${s.key}')"><span class="opt-label">${s.label}</span>${money(p.sizePrices[s.key])}</button>`).join('')}
        </div>
      </div>

      <div class="custom-row">
        <span class="custom-label">Temperature</span>
        <div class="option-grid" style="grid-template-columns:repeat(2,1fr)">
          ${TEMP_OPTIONS.map(t => `<button class="option-pill ${state.temp===t?'active':''}" onclick="Pages._setOpt('temp','${t}')">${t}</button>`).join('')}
        </div>
      </div>

      <div class="custom-row">
        <span class="custom-label">Sugar Level</span>
        <div class="option-grid">
          ${SUGAR_OPTIONS.map(s => `<button class="option-pill ${state.sugar===s?'active':''}" onclick="Pages._setOpt('sugar','${s}')">${s}</button>`).join('')}
        </div>
      </div>

      <div class="custom-row">
        <span class="custom-label">Ice Level</span>
        <div class="option-grid">
          ${ICE_OPTIONS.map(s => `<button class="option-pill ${state.ice===s?'active':''}" onclick="Pages._setOpt('ice','${s}')">${s}</button>`).join('')}
        </div>
      </div>

      <div class="custom-row">
        <span class="custom-label">Milk</span>
        <div class="option-grid" style="grid-template-columns:repeat(4,1fr)">
          ${MILK_OPTIONS.map(m => `<button class="option-pill ${state.milk===m.key?'active':''}" onclick="Pages._setOpt('milk','${m.key}')">${m.label}${m.price?`<span class="text-xs">+${money(m.price)}</span>`:''}</button>`).join('')}
        </div>
      </div>

      <div class="custom-row">
        <span class="custom-label">Extras</span>
        <div class="option-grid" style="grid-template-columns:repeat(2,1fr)">
          ${EXTRA_OPTIONS.map(e => `<button class="option-pill ${state.extras.includes(e.key)?'active':''}" onclick="Pages._toggleExtra('${e.key}')">${e.label}${e.price?`<span class="text-xs">+${money(e.price)}</span>`:''}</button>`).join('')}
        </div>
      </div>
      ` : ''}

      <div class="custom-row">
        <span class="custom-label">Special Instructions</span>
        <textarea class="textarea" rows="2" placeholder="e.g. no foam, extra hot…" oninput="Pages._setNote(this.value)">${state.note}</textarea>
      </div>

      <div class="flex items-center justify-between" style="margin-top:6px">
        <div>
          <span class="custom-label" style="display:block;margin-bottom:6px">Quantity</span>
          <div class="qty-stepper">
            <button onclick="Pages._setQty(-1)">−</button>
            <span class="val" id="cust-qty">1</span>
            <button onclick="Pages._setQty(1)">+</button>
          </div>
        </div>
        <div style="text-align:right">
          <span class="custom-label" style="display:block;margin-bottom:4px">Total</span>
          <div class="live-price" id="cust-price">${money(price())}</div>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary btn-lg" onclick="Pages._addToCart('${productId}')">${icon('plus')} Add to Order</button>
    </div>`;

    
    App.currentProductId = productId;
    openModal(html);
    Pages._custState = { state, p, price, isDrink };
    refreshIcons();

    
    const upd = () => { const el = document.getElementById('cust-price'); if (el) el.textContent = money(price()); };
    Pages._custUpd = upd;
  },

_setOpt(key, val) {
    const cs = Pages._custState; if (!cs) return;
    cs.state[key] = val;
    
    Pages.openCustomizer(cs.p.id);
  },

  _toggleExtra(key) {
    const cs = Pages._custState; if (!cs) return;
    const i = cs.state.extras.indexOf(key);
    if (i>=0) cs.state.extras.splice(i,1); else cs.state.extras.push(key);
    
    Pages.openCustomizer(cs.p.id);
  },

  _setNote(v) { const cs = Pages._custState; if (cs) cs.state.note = v; },
  _setQty(d) {
    const cs = Pages._custState; if (!cs) return;
    cs.state.qty = Math.max(1, cs.state.qty + d);
    const el = document.getElementById('cust-qty'); if (el) el.textContent = cs.state.qty;
    cs._custUpd && cs._custUpd();
  },

  _addToCart(productId) {
    try {
      const cs = Pages._custState; if (!cs) return;
      const { state, p, price } = cs;
      if (!state.qty || state.qty < 1) { toast('Invalid Qty', 'Quantity must be at least 1', 'error'); return; }
      const extras = state.extras.map(e => (EXTRA_OPTIONS.find(x=>x.key===e)||{}).label).filter(Boolean);
      const unitPrice = (() => {
        let base = p.sizePrices ? (p.sizePrices[state.size]||p.price) : p.price;
        const milk = MILK_OPTIONS.find(m=>m.key===state.milk)||{price:0};
        return base + milk.price + state.extras.reduce((a,e)=>a+((EXTRA_OPTIONS.find(x=>x.key===e)||{price:0}).price),0);
      })();
      if (unitPrice <= 0) { toast('Invalid Price', 'Item price must be greater than 0', 'error'); return; }
      const item = {
        id: p.id, name: p.name, emoji: p.emoji, img: p.img, price: unitPrice, qty: state.qty,
        size: p.sizePrices ? state.size : '', temp: p.sizePrices ? state.temp : '', sugar: p.sizePrices ? state.sugar : '',
        ice: p.sizePrices ? state.ice : '', milk: p.sizePrices ? state.milk : '', extras, note: state.note,
        lineTotal: unitPrice * state.qty
      };
      const existing = App.cart.find(x => x.id===item.id && x.size===item.size && x.temp===item.temp && x.sugar===item.sugar && x.ice===item.ice && x.milk===item.milk && JSON.stringify(x.extras)===JSON.stringify(item.extras) && x.note===item.note);
      if (existing) { existing.qty += item.qty; existing.lineTotal = existing.qty * existing.price; }
      else App.cart.push(item);
      App.saveCart();
      closeModal();
      Pages._custState = null;
      App.render();
      toast('Added to order', `${item.qty}× ${item.name}`, 'success');
    } catch(e) {
      console.error('Add to cart error:', e);
      toast('Error', 'Failed to add item to cart', 'error');
    }
  },

  
  




  
  orders() {
    const tabs = ['All','Waiting','Preparing','Ready','Completed','Hold','Voided'];
    const canVoid = ['Owner','Admin','Manager'].includes(App.user.role);
    return `
    <div class="tabs">
      ${tabs.map(t => `<button class="tab ${App.orderTab===t?'active':''}" onclick="App.orderTab='${t}';App.render()">${t}</button>`).join('')}
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${App.orders.filter(o => !App.orderTab || App.orderTab==='All' || o.status===App.orderTab).map(o => `
        <div class="card order-card hoverable">
          <div style="width:52px;height:52px;border-radius:14px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center;font-weight:800;font-family:var(--font-display)">${o.qnum.split('-')[1]}</div>
          <div style="min-width:0">
            <div class="flex items-center gap-2">
              <span class="order-id">${o.id}</span>
              ${statusBadge(o.status)}
            </div>
            <div class="muted text-sm mt-1 truncate">${o.customer} · ${o.type} · ${o.payment}</div>
            <div class="muted text-xs mt-1">${o.items.map(i=>`${i.qty}× ${i.name}`).join(', ')}</div>
          </div>
          <div style="text-align:right">
            <div class="fw-700" style="font-size:1.1rem">${money(o.total)}</div>
            <div class="muted text-xs">${o.time}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${o.status==='Waiting' ? `<button class="btn btn-success btn-sm" onclick="App.setOrderStatus('${o.id}','Preparing')">${icon('flame')} Start</button>` : ''}
            ${o.status==='Preparing' ? `<button class="btn btn-info btn-sm" onclick="App.setOrderStatus('${o.id}','Ready')">${icon('check')} Mark Ready</button>` : ''}
            ${o.status==='Ready' ? `<button class="btn btn-success btn-sm" onclick="App.setOrderStatus('${o.id}','Completed')">${icon('check')} Complete</button>` : ''}
            ${o.status==='Hold' ? `<button class="btn btn-primary btn-sm" onclick="App.resumeOrder('${o.id}')">${icon('play')} Resume</button>` : ''}
            <button class="btn btn-ghost btn-sm" onclick="App.viewOrder('${o.id}')">${icon('eye')} View</button>
            ${canVoid && o.status!=='Voided' && o.status!=='Hold' ? `<button class="btn btn-danger btn-sm" onclick="App.confirmVoidOrder('${o.id}')">${icon('rotate-ccw')} Void</button>` : ''}
          </div>
        </div>`).join('')}
      ${!App.orders.length ? `<div class="empty-state">${icon('receipt')}<div>No orders found</div></div>`:''}
    </div>`;
  },

  
  kitchen() {
    const cols = [
      { key:'Waiting', color:'#F59E0B', icon:'inbox' },
      { key:'Preparing', color:'#3B82F6', icon:'flame' },
      { key:'Ready', color:'#22C55E', icon:'check-circle-2' },
      { key:'Completed', color:'#6F4E37', icon:'check' },
    ];
    const now = Date.now();
    const started = now - 1000*60*60*2; 
    return `
    <div class="page-header">
      <div>
        <h1>Kitchen Display</h1>
        <p class="muted text-sm">Live order status board</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="badge badge-primary">${icon('activity',13)} Live</span>
        <span class="muted text-sm">${new Date().toLocaleTimeString()}</span>
      </div>
    </div>
    <div class="kitchen-cols" id="kitchen-cols">
      ${cols.map(c => `
        <div class="kanban-col" data-status="${c.key}" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="App.handleDrop(event,'${c.key}')">
          <div class="kanban-col-head" style="color:${c.color}">
            ${icon(c.icon,17)} ${c.key}
            <span class="count">${App.orders.filter(o=>o.status===c.key).length}</span>
          </div>
          ${App.orders.filter(o=>o.status===c.key).map(o => `
            <div class="kitchen-card" draggable="true" ondragstart="App.handleDrag(event,'${o.id}')" data-order="${o.id}">
              <div class="kc-row">
                <span class="kq-num" style="color:${c.color}">${o.qnum}</span>
                <span class="timer-badge ${o.status==='Waiting'?'ticking':''}" data-timer="${started}">00:00</span>
              </div>
              <div class="fw-700" style="font-size:.95rem">${o.customer}</div>
              <div class="kc-meta">${o.type} · ${o.time}</div>
              <ul>
                ${o.items.map(i => `<li><span>${i.qty}×</span> <span style="flex:1">${i.name}</span></li>${i.cust?`<li class="kc-meta" style="padding-left:18px">${i.cust}</li>`:''}`).join('')}
              </ul>
              <div class="flex gap-2" style="margin-top:8px">
                ${o.status==='Waiting' ? `<button class="btn btn-success btn-sm" style="flex:1" onclick="App.setOrderStatus('${o.id}','Preparing')">Start</button>` : ''}
                ${o.status==='Preparing' ? `<button class="btn btn-info btn-sm" style="flex:1" onclick="App.setOrderStatus('${o.id}','Ready')">Ready</button>` : ''}
                ${o.status==='Ready' ? `<button class="btn btn-success btn-sm" style="flex:1" onclick="App.setOrderStatus('${o.id}','Completed')">Done</button>` : ''}
              </div>
            </div>`).join('')}
          ${!App.orders.filter(o=>o.status===c.key).length ? `<div class="empty-state" style="padding:24px 10px">${icon('inbox',20)}<div class="text-xs">No orders</div></div>` : ''}
        </div>`).join('')}
    </div>`;
  },

  
  menu() {
    return `
    <div class="page-header">
      <div>
        <h1>Menu Management</h1>
        <p class="muted text-sm">${App.products.length} products · ${CATEGORIES.length} categories</p>
      </div>
      <button class="btn btn-primary" onclick="Pages.addProduct()">${icon('plus')} Add Product</button>
    </div>
    <div class="card table-wrap">
      <table class="table">
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Popular</th><th style="text-align:right">Actions</th></tr></thead>
        <tbody>
          ${App.products.map(p => `
            <tr>
<td><div class="flex items-center gap-3">${productImageHtml(p, {size:38, radius:11, emojiSize:20})}<div><div class="fw-700">${p.name}</div><div class="muted text-xs">${p.desc||''}</div></div></div></td>
              <td><span class="badge badge-neutral">${p.cat}</span></td>
              <td class="fw-700">${money(p.price)}</td>
              <td>${p.available?statusBadge('Active','Available'):statusBadge('Out','Out of stock')}</td>
              <td>${p.popular?'<span class="badge badge-warning">★ Popular</span>':'<span class="muted">—</span>'}</td>
              <td style="text-align:right">
                <button class="btn btn-ghost btn-sm" onclick="Pages.editProduct('${p.id}')">${icon('edit-3',14)}</button>
                <button class="btn btn-danger btn-sm" onclick="Pages.deleteProduct('${p.id}')">${icon('trash-2',14)}</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  },


  imageFieldHtml(currentImg, emoji) {
    return `
      <div class="field">
        <label>Product Image</label>
        <div class="flex items-center gap-3">
          <div class="img-upload-preview" id="p-img-preview">${currentImg ? `<img src="${currentImg}" alt="preview" />` : (emoji||'☕')}</div>
          <div style="flex:1">
            <label class="btn btn-ghost btn-sm" style="cursor:pointer">${icon('upload',15)} Upload Image
              <input type="file" id="p-img-file" accept="image/*" style="display:none" onchange="Pages.previewImage(this)" />
            </label>
            <div class="muted text-xs" style="margin-top:6px">or paste an image URL below</div>
            <input class="input" id="p-img-url" placeholder="https://…/image.jpg" oninput="Pages.previewImageUrl(this)" style="margin-top:6px" />
          </div>
        </div>
        <div class="flex gap-2" style="margin-top:8px">
          <button type="button" class="btn btn-ghost btn-sm" onclick="Pages.clearImage()">${icon('x',14)} Remove Image</button>
          <span class="muted text-xs" style="align-self:center">Falls back to emoji if no image</span>
        </div>
      </div>`;
  },

  previewImage(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      Pages._pendingImg = e.target.result;
      const prev = document.getElementById('p-img-preview');
      if (prev) prev.innerHTML = `<img src="${e.target.result}" alt="preview" />`;
      const url = document.getElementById('p-img-url'); if (url) url.value = '';
    };
    reader.readAsDataURL(file);
  },

  previewImageUrl(input) {
    const url = input.value.trim();
    if (!url) return;
    Pages._pendingImg = url;
    const prev = document.getElementById('p-img-preview');
    if (prev) prev.innerHTML = `<img src="${url}" alt="preview" onerror="this.parentElement.innerHTML='☕'" />`;
  },

  clearImage() {
    Pages._pendingImg = '';
    const prev = document.getElementById('p-img-preview');
    if (prev) prev.innerHTML = '☕';
    const url = document.getElementById('p-img-url'); if (url) url.value = '';
    const file = document.getElementById('p-img-file'); if (file) file.value = '';
  },

  addProduct() {
    Pages._pendingImg = '';
    openModal(`
      <div class="modal-head"><h3>Add Product</h3><button class="modal-close" onclick="closeModal()">${icon('x')}</button></div>
      <div class="modal-body">
        ${Pages.imageFieldHtml('', '☕')}
        <div class="field"><label>Product Name</label><input class="input" id="p-name" placeholder="e.g. Salted Caramel Latte" /></div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label>Category</label><select class="select" id="p-cat">${CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></div>
          <div class="field"><label>Price (₱)</label><input class="input" id="p-price" type="number" min="0" placeholder="0" /></div>
        </div>
        <div class="field"><label>Emoji</label><input class="input" id="p-emoji" placeholder="☕" /></div>
        <div class="field"><label>Description</label><input class="input" id="p-desc" placeholder="Short description" /></div>
        <p class="muted text-xs">All products are available by default. Prices are base prices.</p>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="Pages.saveProduct()">${icon('check')} Save Product</button>
      </div>
    `);
  },

  async saveProduct() {
    try {
      const name = (document.getElementById('p-name').value || '').trim();
      const price = Number(document.getElementById('p-price').value) || 0;
      if (!name) { toast('Validation Error','Product name is required','error'); return; }
      if (name.length < 2) { toast('Validation Error','Product name must be at least 2 characters','error'); return; }
      if (price <= 0) { toast('Validation Error','Price must be greater than 0','error'); return; }
      const payload = {
        cat: document.getElementById('p-cat').value, name, price,
        emoji: document.getElementById('p-emoji').value || '☕', desc: document.getElementById('p-desc').value,
        img: Pages._pendingImg || '', available: true, popular: false,
      };
      let created = null;
      try { created = await apiRequest('POST', 'api/products.php', payload); }
      catch (dbErr) { console.warn('Product not saved to database:', dbErr.message); }
      App.products.push(created || { id: 'p'+Date.now(), ...payload });
      Pages._pendingImg = '';
      App.saveProducts();
      closeModal(); App.render();
      toast(created ? 'Product added' : 'Saved locally only', created ? `${name} created` : `${name} added here only — database wasn't reachable.`, created ? 'success' : 'warning');
    } catch(e) {
      console.error('Save product error:', e);
      toast('Error', 'Failed to save product', 'error');
    }
  },

  editProduct(id) {
    const p = App.products.find(x=>x.id===id); if(!p) return;
    Pages._pendingImg = p.img || '';
    openModal(`
      <div class="modal-head"><h3>Edit Product</h3><button class="modal-close" onclick="closeModal()">${icon('x')}</button></div>
      <div class="modal-body">
        ${Pages.imageFieldHtml(p.img || '', p.emoji)}
        <div class="field"><label>Product Name</label><input class="input" id="p-name" value="${p.name}" /></div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label>Category</label><select class="select" id="p-cat">${CATEGORIES.map(c=>`<option ${c===p.cat?'selected':''}>${c}</option>`).join('')}</select></div>
          <div class="field"><label>Price (₱)</label><input class="input" id="p-price" type="number" value="${p.price}" /></div>
        </div>
        <div class="field"><label>Emoji</label><input class="input" id="p-emoji" value="${p.emoji}" /></div>
        <div class="field"><label>Description</label><input class="input" id="p-desc" value="${p.desc||''}" /></div>
        <div class="flex items-center gap-2">
          <label class="switch"><input type="checkbox" id="p-avail" ${p.available?'checked':''}><span class="slider"></span></label>
          <span class="text-sm">Available</span>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="Pages.updateProduct('${id}')">${icon('check')} Save Changes</button>
      </div>
    `);
  },

  async updateProduct(id) {
    try {
      const p = App.products.find(x=>x.id===id); if(!p) return;
      const name = (document.getElementById('p-name').value || '').trim();
      const price = Number(document.getElementById('p-price').value) || 0;
      if (!name) { toast('Validation Error','Product name is required','error'); return; }
      if (name.length < 2) { toast('Validation Error','Product name must be at least 2 characters','error'); return; }
      if (price <= 0) { toast('Validation Error','Price must be greater than 0','error'); return; }
      p.name = name;
      p.cat = document.getElementById('p-cat').value;
      p.price = price;
      p.emoji = document.getElementById('p-emoji').value||'☕';
      p.desc = document.getElementById('p-desc').value;
      p.available = document.getElementById('p-avail').checked;
      p.img = Pages._pendingImg || p.img;
      Pages._pendingImg = '';
      App.saveProducts();
      closeModal(); App.render(); toast('Product updated', `${p.name} saved`, 'success');
      try { await apiRequest('PUT', 'api/products.php', { id, cat: p.cat, name: p.name, price: p.price, emoji: p.emoji, desc: p.desc, img: p.img, available: p.available, popular: p.popular, new: p.new }); }
      catch (dbErr) { console.warn('Product update not saved to database:', dbErr.message); toast('Not saved to database', `${p.name} updated here only.`, 'warning'); }
    } catch(e) {
      console.error('Update product error:', e);
      toast('Error', 'Failed to update product', 'error');
    }
  },

  deleteProduct(id) {
    const p = App.products.find(x=>x.id===id);
    confirmDialog({ title:'Delete Product?', message:`This will permanently remove "${p.name}" from the menu.`, onConfirm: async ()=>{
      App.products = App.products.filter(x=>x.id!==id);
      App.saveProducts();
      App.render(); toast('Deleted', `${p.name} removed`, 'success');
      try { await apiRequest('DELETE', 'api/products.php?id=' + encodeURIComponent(id)); }
      catch (dbErr) { console.warn('Product delete not saved to database:', dbErr.message); }
    }});
  },

  
  inventory() {
    const low = App.inventory.filter(i=>i.stock<i.min);
    return `
    <div class="page-header">
      <div>
        <h1>Inventory</h1>
        <p class="muted text-sm">${App.inventory.length} ingredients · ${low.length} low stock</p>
      </div>
      <button class="btn btn-primary" onclick="Pages.addInventory()">${icon('plus')} Add Ingredient</button>
    </div>
    ${low.length ? `<div class="card card-pad" style="border-left:4px solid var(--error);margin-bottom:16px">
      <div class="flex items-center gap-2" style="color:var(--error);font-weight:700;margin-bottom:8px">${icon('alert-triangle',18)} Low Stock Alert</div>
      <div class="flex wrap gap-2">${low.map(i=>`<span class="badge badge-error">${i.name} (${i.stock} ${i.unit})</span>`).join('')}</div>
    </div>`:''}
    <div class="card table-wrap">
      <table class="table">
        <thead><tr><th>Ingredient</th><th>Category</th><th>Stock</th><th>Status</th><th>Expiry</th><th>Supplier</th><th>Cost</th><th style="text-align:right">Actions</th></tr></thead>
        <tbody>
          ${App.inventory.map(i => {
            const pct = Math.min(100, (i.stock/i.min)*100);
            const status = i.stock===0?'Out':(i.stock<i.min?'Low':'OK');
            return `<tr>
              <td class="fw-700">${i.name}</td>
              <td><span class="badge badge-neutral">${i.category}</span></td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="progress" style="width:70px"><div style="width:${pct}%;background:${status==='OK'?'var(--success)':status==='Low'?'var(--warning)':'var(--error)'}"></div></div>
                  <span class="text-sm">${i.stock} ${i.unit}</span>
                </div>
              </td>
              <td>${statusBadge(status)}</td>
              <td class="text-sm">${i.expiry}</td>
              <td class="text-sm">${i.supplier}</td>
              <td class="text-sm">${money(i.cost)}</td>
              <td style="text-align:right"><button class="btn btn-ghost btn-sm" onclick="Pages.stockIn('${i.id}')">${icon('plus',14)} Stock</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  },

  addInventory() {
    openModal(`
      <div class="modal-head"><h3>Add Ingredient</h3><button class="modal-close" onclick="closeModal()">${icon('x')}</button></div>
      <div class="modal-body">
        <div class="field"><label>Name</label><input class="input" id="i-name" placeholder="e.g. Vanilla Beans" /></div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label>Category</label><select class="select" id="i-cat"><option>Beans</option><option>Dairy</option><option>Syrups</option><option>Tea</option><option>Chocolate</option><option>Packaging</option><option>Pantry</option><option>Fruit</option></select></div>
          <div class="field"><label>Unit</label><input class="input" id="i-unit" placeholder="kg" /></div>
        </div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label>Stock</label><input class="input" id="i-stock" type="number" /></div>
          <div class="field"><label>Min Stock</label><input class="input" id="i-min" type="number" /></div>
        </div>
        <div class="field"><label>Supplier</label><input class="input" id="i-supplier" placeholder="Supplier name" /></div>
        <div class="field"><label>Cost (₱)</label><input class="input" id="i-cost" type="number" /></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="Pages.saveInventory()">${icon('check')} Save</button>
      </div>
    `);
  },
  async saveInventory() {
    try {
      const n = (document.getElementById('i-name').value || '').trim();
      const stock = Number(document.getElementById('i-stock').value) || 0;
      const min = Number(document.getElementById('i-min').value) || 0;
      if (!n) { toast('Validation Error','Ingredient name is required','error'); return; }
      if (n.length < 2) { toast('Validation Error','Name must be at least 2 characters','error'); return; }
      if (stock < 0) { toast('Validation Error','Stock cannot be negative','error'); return; }
      if (min < 0) { toast('Validation Error','Minimum stock cannot be negative','error'); return; }
      const payload = { name: n, category: document.getElementById('i-cat').value, unit: document.getElementById('i-unit').value || 'kg', stock, min, expiry: '—', supplier: document.getElementById('i-supplier').value || '—', cost: Number(document.getElementById('i-cost').value) || 0 };
      let created = null;
      try { created = await apiRequest('POST', 'api/inventory.php', payload); }
      catch (dbErr) { console.warn('Ingredient not saved to database:', dbErr.message); }
      App.inventory.push(created || { id: 'i'+Date.now(), ...payload });
      closeModal(); App.render();
      toast(created ? 'Ingredient added' : 'Saved locally only', created ? n : `${n} added here only — database wasn't reachable.`, created ? 'success' : 'warning');
    } catch(e) {
      console.error('Save inventory error:', e);
      toast('Error', 'Failed to add ingredient', 'error');
    }
  },
  stockIn(id) {
    const i = App.inventory.find(x=>x.id===id); if(!i) return;
    openModal(`
      <div class="modal-head"><h3>Stock In — ${i.name}</h3><button class="modal-close" onclick="closeModal()">${icon('x')}</button></div>
      <div class="modal-body">
        <div class="field"><label>Quantity to Add</label><input class="input" id="st-qty" type="number" min="1" value="10" /></div>
        <p class="muted text-xs">Current stock: ${i.stock} ${i.unit}</p>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="Pages.doStockIn('${id}')">${icon('package-plus')} Add Stock</button>
      </div>
    `);
  },
async doStockIn(id) {
    try {
      const i = App.inventory.find(x=>x.id===id); if(!i) return;
      const qty = Number(document.getElementById('st-qty').value) || 0;
      if (qty <= 0) { toast('Validation Error','Quantity must be greater than 0','error'); return; }
      i.stock += qty;
      closeModal(); App.render(); toast('Stock updated', `${i.name} now at ${i.stock} ${i.unit}`, 'success');
      try { await apiRequest('PUT', 'api/inventory.php', { id, stock: i.stock }); }
      catch (dbErr) { console.warn('Stock update not saved to database:', dbErr.message); toast('Not saved to database', `${i.name} updated here only.`, 'warning'); }
    } catch(e) {
      console.error('Stock in error:', e);
      toast('Error', 'Failed to update stock', 'error');
    }
  },

  
  customers() {
    const levelIcon = { Platinum:'👑', Gold:'🥇', Silver:'🥈', Member:'🤍' };
    const nextLevel = { Member:'Silver', Silver:'Gold', Gold:'Platinum', Platinum:'Platinum' };
    return `
    <div class="page-header">
      <div>
        <h1>Customers</h1>
        <p class="muted text-sm">${App.customers.length} customers · loyalty program active</p>
      </div>
      <button class="btn btn-primary" onclick="Pages.addCustomer()">${icon('user-plus')} Add Customer</button>
    </div>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
      ${App.customers.map(c => {
        const next = c.level==='Platinum' ? 0 : c.level==='Gold' ? 1000 : c.level==='Silver' ? 500 : 200;
        const pct = c.level==='Platinum' ? 100 : Math.min(100, (c.points/next)*100);
        return `
        <div class="card card-pad hoverable" style="position:relative;overflow:hidden">
          <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--coffee),var(--latte))"></div>
          <div class="flex items-center gap-3" style="margin-bottom:12px">
            ${avatarHtml(c.name, '#6F4E37', 46)}
            <div style="flex:1;min-width:0">
              <div class="fw-700 truncate">${c.name}</div>
              <div class="muted text-xs truncate">${c.email}</div>
            </div>
            <span class="badge ${c.level==='Platinum'?'badge-primary':c.level==='Gold'?'badge-warning':c.level==='Silver'?'badge-neutral':'badge-info'}">${levelIcon[c.level]} ${c.level}</span>
          </div>
          <div class="grid" style="grid-template-columns:1fr 1fr;gap:8px;font-size:.8rem;margin-bottom:12px">
            <div class="card card-pad" style="background:var(--bg-soft);padding:10px;border:none"><div class="muted text-xs">Loyalty Points</div><div class="fw-700" style="font-size:1rem">${c.points.toLocaleString()}</div></div>
            <div class="card card-pad" style="background:var(--bg-soft);padding:10px;border:none"><div class="muted text-xs">Total Spent</div><div class="fw-700" style="font-size:1rem">${money(c.spent)}</div></div>
          </div>
          <div class="flex items-center justify-between" style="font-size:.78rem;margin-bottom:4px">
            <span class="muted">Progress to ${c.level==='Platinum'?'MAX':nextLevel[c.level]}</span>
            <b>${c.level==='Platinum'?'MAX':`${c.points}/${next}`}</b>
          </div>
          <div class="progress" style="margin-bottom:12px"><div style="width:${pct}%;background:linear-gradient(90deg,var(--coffee),var(--latte))"></div></div>
          <div class="flex items-center justify-between" style="font-size:.8rem">
            <span class="muted">${icon('coffee',13)} ${c.favorite}</span>
            <span class="muted">${c.visits} visits</span>
          </div>
          <div class="flex gap-2" style="margin-top:12px">
            <button class="btn btn-ghost btn-sm" style="flex:1" onclick="Pages.viewCustomer('${c.id}')">${icon('eye',14)} View</button>
            <button class="btn btn-ghost btn-sm" onclick="Pages.editCustomer('${c.id}')">${icon('edit-3',14)}</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  addCustomer() {
    openModal(`
      <div class="modal-head"><h3>Add Customer</h3><button class="modal-close" onclick="closeModal()">${icon('x')}</button></div>
      <div class="modal-body">
        <div class="field"><label>Full Name</label><input class="input" id="c-name" placeholder="Customer name" /></div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label>Phone</label><input class="input" id="c-phone" placeholder="0917 000 0000" /></div>
          <div class="field"><label>Email</label><input class="input" id="c-email" placeholder="email@example.com" /></div>
        </div>
        <div class="field"><label>Favorite Drink</label><input class="input" id="c-fav" placeholder="e.g. Caramel Latte" /></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="Pages.saveCustomer()">${icon('check')} Save Customer</button>
      </div>
    `);
  },
  async saveCustomer() {
    try {
      const n = (document.getElementById('c-name').value || '').trim();
      const email = (document.getElementById('c-email').value || '').trim();
      if (!n) { toast('Validation Error','Customer name is required','error'); return; }
      if (n.length < 2) { toast('Validation Error','Name must be at least 2 characters','error'); return; }
      if (email && !validateEmail(email)) { toast('Validation Error','Please enter a valid email address','error'); return; }
      const payload = { name: n, phone: document.getElementById('c-phone').value, email, favorite: document.getElementById('c-fav').value || '—' };
      let created = null;
      try { created = await apiRequest('POST', 'api/customers.php', payload); }
      catch (dbErr) { console.warn('Customer not saved to database:', dbErr.message); }
      App.customers.push(created || { id: 'c'+Date.now(), ...payload, points: 0, level: 'Member', visits: 0, spent: 0 });
      closeModal(); App.render();
      toast(created ? 'Customer added' : 'Saved locally only', created ? `${n} added to records` : `${n} added here only — database wasn't reachable.`, created ? 'success' : 'warning');
    } catch(e) {
      console.error('Save customer error:', e);
      toast('Error', 'Failed to add customer', 'error');
    }
  },
  viewCustomer(id) {
    const c = App.customers.find(x=>x.id===id); if(!c) return;
    const history = [
      { id:'TXN-8841', date:'May 23, 2025', items:'Caramel Latte ×2, Croissant ×1', total:315 },
      { id:'TXN-8790', date:'May 20, 2025', items:'Classic Milk Tea ×1', total:95 },
      { id:'TXN-8721', date:'May 18, 2025', items:'Butter Croissant ×3', total:195 },
    ];
    openModal(`
      <div class="modal-head">
        <div class="flex items-center gap-3">${avatarHtml(c.name, '#6F4E37', 44)}<div><h3>${c.name}</h3><span class="muted text-xs">${c.email}${c.phone?' · '+c.phone:''}</span></div></div>
        <button class="modal-close" onclick="closeModal()">${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
          <div class="card card-pad" style="background:var(--bg-soft);padding:12px;border:none;text-align:center"><div class="muted text-xs">Points</div><div class="fw-700">${c.points}</div></div>
          <div class="card card-pad" style="background:var(--bg-soft);padding:12px;border:none;text-align:center"><div class="muted text-xs">Level</div><div class="fw-700">${c.level}</div></div>
          <div class="card card-pad" style="background:var(--bg-soft);padding:12px;border:none;text-align:center"><div class="muted text-xs">Visits</div><div class="fw-700">${c.visits}</div></div>
          <div class="card card-pad" style="background:var(--bg-soft);padding:12px;border:none;text-align:center"><div class="muted text-xs">Spent</div><div class="fw-700" style="font-size:.85rem">${money(c.spent)}</div></div>
        </div>
        <div class="flex items-center justify-between" style="margin-bottom:10px">
          <h3 style="font-size:1rem">Purchase History</h3>
          <span class="badge badge-primary">${c.favorite} fav</span>
        </div>
        ${history.map(h => `
          <div class="list-row">
            <div style="flex:1;min-width:0">
              <div class="fw-700" style="font-size:.86rem">${h.id}</div>
              <div class="muted text-xs">${h.date} · ${h.items}</div>
            </div>
            <b>${money(h.total)}</b>
          </div>`).join('')}
      </div>
    `);
  },
  editCustomer(id) {
    const c = App.customers.find(x=>x.id===id); if(!c) return;
    openModal(`
      <div class="modal-head"><h3>Edit Customer</h3><button class="modal-close" onclick="closeModal()">${icon('x')}</button></div>
      <div class="modal-body">
        <div class="field"><label>Full Name</label><input class="input" id="c-name" value="${c.name}" /></div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label>Phone</label><input class="input" id="c-phone" value="${c.phone}" /></div>
          <div class="field"><label>Email</label><input class="input" id="c-email" value="${c.email}" /></div>
        </div>
        <div class="field"><label>Favorite Drink</label><input class="input" id="c-fav" value="${c.favorite}" /></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="Pages.updateCustomer('${id}')">${icon('check')} Save</button>
      </div>
    `);
  },
  async updateCustomer(id) {
    const c = App.customers.find(x=>x.id===id); if(!c) return;
    c.name = document.getElementById('c-name').value;
    c.phone = document.getElementById('c-phone').value;
    c.email = document.getElementById('c-email').value;
    c.favorite = document.getElementById('c-fav').value;
    closeModal(); App.render(); toast('Customer updated', c.name, 'success');
    try { await apiRequest('PUT', 'api/customers.php', { id, name: c.name, phone: c.phone, email: c.email, favorite: c.favorite }); }
    catch (dbErr) { console.warn('Customer update not saved to database:', dbErr.message); toast('Not saved to database', `${c.name} updated here only.`, 'warning'); }
  },

  
  promotions() {
    const typeColors = { 'Happy Hour':'#F59E0B', 'B1G1':'#22C55E', 'Student':'#3B82F6', 'Senior':'#A855F7', 'Seasonal':'#EF4444', 'Promo Code':'#6F4E37' };
    return `
    <div class="page-header">
      <div>
        <h1>Promotions</h1>
        <p class="muted text-sm">${App.promos.filter(p=>p.status==='Active').length} active promotions</p>
      </div>
      <button class="btn btn-primary" onclick="Pages.addPromo()">${icon('plus')} New Promotion</button>
    </div>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
      ${App.promos.map(p => `
        <div class="card card-pad hoverable" style="border-top:4px solid ${typeColors[p.type]||'#6F4E37'}">
          <div class="flex items-center justify-between" style="margin-bottom:8px">
            <span class="badge" style="background:${typeColors[p.type]||'#6F4E37'}22;color:${typeColors[p.type]||'#6F4E37'}">${p.type}</span>
            ${statusBadge(p.status)}
          </div>
          <h3 style="font-size:1.05rem;margin-bottom:4px">${p.name}</h3>
          <p class="muted text-sm" style="margin-bottom:10px">${p.desc}</p>
          <div class="flex items-center gap-2" style="margin-bottom:12px">
            <span class="badge badge-primary" style="font-family:monospace;letter-spacing:.1em">${p.code}</span>
            <span class="badge badge-success">${p.discount}% off</span>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" style="flex:1" onclick="Pages.togglePromo('${p.id}')">${p.status==='Active'?'Deactivate':'Activate'}</button>
            <button class="btn btn-danger btn-sm" onclick="Pages.deletePromo('${p.id}')">${icon('trash-2',14)}</button>
          </div>
        </div>`).join('')}
    </div>`;
  },
  addPromo() {
    openModal(`
      <div class="modal-head"><h3>New Promotion</h3><button class="modal-close" onclick="closeModal()">${icon('x')}</button></div>
      <div class="modal-body">
        <div class="field"><label>Promotion Name</label><input class="input" id="pro-name" placeholder="e.g. Friday Flash Sale" /></div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label>Type</label><select class="select" id="pro-type"><option>Happy Hour</option><option>B1G1</option><option>Student</option><option>Senior</option><option>Seasonal</option><option>Promo Code</option></select></div>
          <div class="field"><label>Discount (%)</label><input class="input" id="pro-disc" type="number" min="0" max="100" /></div>
        </div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label>Promo Code</label><input class="input" id="pro-code" placeholder="FLASH20" /></div>
          <div class="field"><label>Applies To</label><select class="select" id="pro-applies"><option>all</option><option>drinks</option><option>frappes</option><option>peppermint</option><option>upgrade</option></select></div>
        </div>
        <div class="field"><label>Description</label><input class="input" id="pro-desc" placeholder="Short description" /></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="Pages.savePromo()">${icon('check')} Create</button>
      </div>
    `);
  },
  async savePromo() {
    try {
      const n = (document.getElementById('pro-name').value || '').trim();
      const discount = Number(document.getElementById('pro-disc').value) || 0;
      if (!n) { toast('Validation Error','Promotion name is required','error'); return; }
      if (n.length < 2) { toast('Validation Error','Promotion name must be at least 2 characters','error'); return; }
      if (discount <= 0 || discount > 100) { toast('Validation Error','Discount must be between 1-100%','error'); return; }
      const payload = { name: n, type: document.getElementById('pro-type').value, discount, code: document.getElementById('pro-code').value || 'PROMO', desc: document.getElementById('pro-desc').value || '', applies: document.getElementById('pro-applies').value, status: 'Active' };
      let created = null;
      try { created = await apiRequest('POST', 'api/promotions.php', payload); }
      catch (dbErr) { console.warn('Promotion not saved to database:', dbErr.message); }
      App.promos.push(created || { id: 'pr'+Date.now(), ...payload });
      closeModal(); App.render();
      toast(created ? 'Promotion created' : 'Saved locally only', created ? n : `${n} created here only — database wasn't reachable.`, created ? 'success' : 'warning');
    } catch(e) {
      console.error('Save promo error:', e);
      toast('Error', 'Failed to save promotion', 'error');
    }
  },
  async togglePromo(id) {
    const p = App.promos.find(x=>x.id===id); if(!p) return;
    p.status = p.status==='Active' ? 'Inactive' : 'Active';
    App.render(); toast('Promotion updated', `${p.name} ${p.status}`, 'success');
    try { await apiRequest('PUT', 'api/promotions.php', { id, status: p.status }); }
    catch (dbErr) { console.warn('Promotion status not saved to database:', dbErr.message); toast('Not saved to database', `${p.name} updated here only.`, 'warning'); }
  },
  deletePromo(id) {
    const p = App.promos.find(x=>x.id===id);
    confirmDialog({ title:'Delete Promotion?', message:`Remove "${p.name}"?`, onConfirm: async ()=>{
      App.promos = App.promos.filter(x=>x.id!==id); App.render(); toast('Deleted', p.name, 'success');
      try { await apiRequest('DELETE', 'api/promotions.php?id=' + encodeURIComponent(id)); }
      catch (dbErr) { console.warn('Promotion delete not saved to database:', dbErr.message); }
    }});
  },

  
  
  reportsStats() {
    const orders = App.orders.filter(o => o.status !== 'Hold' && o.status !== 'Voided');
    const totalRevenue = orders.reduce((s,o) => s + (o.total||0), 0);
    const totalOrders = orders.length;
    const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;

    const itemQty = {}, itemRevenue = {};
    orders.forEach(o => (o.items||[]).forEach(it => {
      itemQty[it.name] = (itemQty[it.name]||0) + (it.qty||0);
      itemRevenue[it.name] = (itemRevenue[it.name]||0) + (it.price||0) * (it.qty||0);
    }));
    const itemsSold = Object.values(itemQty).reduce((a,b)=>a+b, 0);
    const rankedByQty = Object.entries(itemQty).sort((a,b) => b[1]-a[1]);

    const cashierRevenue = {};
    orders.forEach(o => { const c = o.cashier || '—'; cashierRevenue[c] = (cashierRevenue[c]||0) + (o.total||0); });

    return { orders, totalRevenue, totalOrders, avgOrder, itemsSold, itemQty, itemRevenue, rankedByQty, cashierRevenue };
  },

  reports() {
    const r = this.reportsStats();
    const topByRevenue = [...r.rankedByQty].sort((a,b) => r.itemRevenue[b[0]] - r.itemRevenue[a[0]]).slice(0,4);
    return `
    <div class="page-header">
      <div>
        <h1>Reports</h1>
        <p class="muted text-sm">Business insights &amp; analytics</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost" onclick="Pages.exportReport('csv')">${icon('download')} CSV</button>
      </div>
    </div>
    <div class="tabs">
      ${['Daily Sales','Weekly Sales','Monthly Sales','Best Sellers','Worst Sellers','Employee Performance'].map(t=>`<span class="tab ${(Pages.reportTab||'Daily Sales')===t?'active':''}" onclick="Pages.reportTab='${t}';App.render()">${t}</span>`).join('')}
    </div>
    <div class="dashboard-grid">
      <div class="card card-pad">
        <h3 style="font-size:1.05rem;margin-bottom:4px">${Pages.reportTab||'Daily Sales'}</h3>
        <span class="muted text-xs">Based on all orders currently in the database</span>
        <canvas id="report-chart" style="width:100%;height:280px;margin-top:10px"></canvas>
      </div>
      <div class="card card-pad">
        <h3 style="font-size:1.05rem;margin-bottom:16px">Summary</h3>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="card card-pad" style="background:var(--bg-soft);padding:14px;border:none"><div class="muted text-xs">Total Revenue</div><div class="fw-700" style="font-size:1.2rem">${money(r.totalRevenue)}</div></div>
          <div class="card card-pad" style="background:var(--bg-soft);padding:14px;border:none"><div class="muted text-xs">Total Orders</div><div class="fw-700" style="font-size:1.2rem">${r.totalOrders.toLocaleString()}</div></div>
          <div class="card card-pad" style="background:var(--bg-soft);padding:14px;border:none"><div class="muted text-xs">Avg Order Value</div><div class="fw-700" style="font-size:1.2rem">${money(r.avgOrder)}</div></div>
          <div class="card card-pad" style="background:var(--bg-soft);padding:14px;border:none"><div class="muted text-xs">Items Sold</div><div class="fw-700" style="font-size:1.2rem">${r.itemsSold.toLocaleString()}</div></div>
        </div>
        <div style="margin-top:16px">
          <h3 style="font-size:.95rem;margin-bottom:10px">Top Products</h3>
          ${topByRevenue.length ? topByRevenue.map(([name],i)=>`
            <div class="flex items-center justify-between" style="font-size:.82rem;padding:6px 0;border-bottom:1px dashed var(--border)">
              <span>${i+1}. ${name}</span><b>${money(r.itemRevenue[name])}</b>
            </div>`).join('') : `<div class="muted text-xs">No sales yet.</div>`}
        </div>
      </div>
    </div>`;
  },
  renderReportsChart() {
    const canvas = document.getElementById('report-chart');
    if (!canvas) return;
    const r = this.reportsStats();
    const tab = Pages.reportTab || 'Daily Sales';

    if (tab === 'Daily Sales') {
      const hist = this.salesHistory(r.orders);
      const buckets = [0,4,8,12,16,20];
      renderBarChart(canvas, { labels:['12a','4a','8a','12p','4p','8p'], values: buckets.map(h=>hist.hourly[h]), type:'bar', height:280 });
    } else if (tab === 'Weekly Sales') {
      const hist = this.salesHistory(r.orders);
      renderBarChart(canvas, { labels: hist.weekLabels, values: hist.weekly, type:'line', height:280 });
    } else if (tab === 'Monthly Sales') {
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth()-i);
        months.push(d.toISOString().slice(0,7));
      }
      const labels = months.map(m => new Date(m+'-01').toLocaleDateString('en-US',{month:'short'}));
      const values = months.map(m => r.orders.filter(o=>(o.date||'').startsWith(m)).reduce((s,o)=>s+(o.total||0),0));
      renderBarChart(canvas, { labels, values, type:'line', height:280 });
    } else if (tab === 'Best Sellers') {
      const top = r.rankedByQty.slice(0,8);
      renderBarChart(canvas, { labels: top.map(([n])=>n.length>10?n.slice(0,10)+'…':n), values: top.map(([,q])=>q), type:'bar', height:280 });
    } else if (tab === 'Worst Sellers') {
      const bottom = [...r.rankedByQty].sort((a,b)=>a[1]-b[1]).slice(0,8);
      renderBarChart(canvas, { labels: bottom.map(([n])=>n.length>10?n.slice(0,10)+'…':n), values: bottom.map(([,q])=>q), type:'bar', height:280 });
    } else if (tab === 'Employee Performance') {
      const entries = Object.entries(r.cashierRevenue).sort((a,b)=>b[1]-a[1]);
      renderBarChart(canvas, { labels: entries.map(([n])=>n.split(' ')[0]), values: entries.map(([,v])=>v), type:'bar', height:280 });
    }
  },
  exportReport(type) {
    const r = this.reportsStats();
    const rows = [['Item','Qty Sold','Revenue']];
    r.rankedByQty.forEach(([name, qty]) => rows.push([name, qty, r.itemRevenue[name].toFixed(2)]));
    if (type==='csv') { exportCSV('brewpos_report.csv', rows); }
    else { toast('Export', `${type.toUpperCase()} export prepared`, 'success'); }
  },

  
  activity() {
    const rows = App.activityLog || [];
    const actionColors = {
      'Logged in':'badge-info', 'Voided order':'badge-error', 'Deleted product':'badge-error',
      'Deleted staff account':'badge-error', 'Deleted promotion':'badge-error',
      'Created product':'badge-success', 'Added ingredient':'badge-success', 'Added customer':'badge-success',
      'Created promotion':'badge-success', 'Created staff account':'badge-success', 'Stock In':'badge-success',
    };
    return `
    <div class="page-header">
      <div>
        <h1>Activity Log</h1>
        <p class="muted text-sm">Audit trail of who did what, and when — most recent first</p>
      </div>
      <button class="btn btn-ghost" onclick="App.loadActivityLog()">${icon('refresh-cw')} Refresh</button>
    </div>
    <div class="card card-pad">
      ${rows.length ? `
        <table class="table">
          <thead><tr><th>When</th><th>Staff</th><th>Role</th><th>Action</th><th>Details</th></tr></thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td class="muted text-xs" style="white-space:nowrap">${new Date(r.created_at).toLocaleString()}</td>
                <td class="fw-600">${r.user_name}</td>
                <td>${statusBadge(r.user_role, r.user_role)}</td>
                <td><span class="badge ${actionColors[r.action] || 'badge-neutral'}">${r.action}</span></td>
                <td class="muted text-sm">${r.details || '—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      ` : `<div class="empty-state">${icon('history',40)}<div style="margin-top:10px">No activity recorded yet — it fills in as staff use the system.</div></div>`}
    </div>`;
  },

  
  users() {
    const roleColors = { 'Owner':'#6F4E37', 'Admin':'#7C3AED', 'Manager':'#0EA5E9', 'Cashier':'#F59E0B', 'Barista':'#22C55E', 'Inventory Staff':'#EF4444', 'Accountant':'#0EA5A4' };
    return `
    <div class="page-header">
      <div>
        <h1>User Management</h1>
        <p class="muted text-sm">${App.users.length} team members</p>
      </div>
      <button class="btn btn-primary" onclick="Pages.addUser()">${icon('user-plus')} Add User</button>
    </div>
    <div class="card table-wrap">
      <table class="table">
        <thead><tr><th>User</th><th>Role</th><th>Email</th><th>Permissions</th><th style="text-align:right">Actions</th></tr></thead>
        <tbody>
          ${App.users.map(u => `
            <tr>
              <td><div class="flex items-center gap-3">${avatarHtml(u.name, u.color, 38)}<div><div class="fw-700">${u.name}</div><div class="muted text-xs">${u.id.toUpperCase()}</div></div></div></td>
              <td><span class="badge" style="background:${roleColors[u.role]}22;color:${roleColors[u.role]}">${u.role}</span></td>
              <td class="text-sm">${u.email}</td>
              <td><span class="badge badge-neutral">${(ROLE_PERMISSIONS[u.role]||[]).length} pages</span></td>
              <td style="text-align:right">
                <button class="btn btn-ghost btn-sm" onclick="Pages.editUser('${u.id}')">${icon('edit-3',14)}</button>
                <button class="btn btn-danger btn-sm" onclick="Pages.deleteUser('${u.id}')">${icon('trash-2',14)}</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  },
  addUser() {
    openModal(`
      <div class="modal-head"><h3>Add User</h3><button class="modal-close" onclick="closeModal()">${icon('x')}</button></div>
      <div class="modal-body">
        <div class="field"><label>Full Name</label><input class="input" id="u-name" placeholder="Team member name" /></div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label>Email</label><input class="input" id="u-email" placeholder="name@brewpos.com" /></div>
          <div class="field"><label>Password</label><input class="input" id="u-pass" placeholder="password" /></div>
        </div>
        <div class="field"><label>Role</label><select class="select" id="u-role"><option>Owner</option><option>Admin</option><option>Manager</option><option>Cashier</option><option>Barista</option><option>Inventory Staff</option><option>Accountant</option></select></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="Pages.saveUser()">${icon('check')} Save User</button>
      </div>
    `);
  },
  async saveUser() {
    const n = (document.getElementById('u-name').value || '').trim();
    const email = (document.getElementById('u-email').value || '').trim();
    const pass = document.getElementById('u-pass').value || '';
    if (!n) { toast('Validation Error','Full name is required','error'); return; }
    if (n.length < 2) { toast('Validation Error','Name must be at least 2 characters','error'); return; }
    if (!email || !validateEmail(email)) { toast('Validation Error','Please enter a valid email address','error'); return; }
    if (App.users.some(u => u.email.toLowerCase() === email.toLowerCase())) { toast('Validation Error','A staff account with that email already exists','error'); return; }
    if (pass && pass.length < 4) { toast('Validation Error','Password must be at least 4 characters','error'); return; }
    const roles = ['Owner','Admin','Manager','Cashier','Barista','Inventory Staff','Accountant'];
    const colors = ['#6F4E37','#7C3AED','#0EA5E9','#F59E0B','#22C55E','#EF4444','#0EA5A4'];
    const role = document.getElementById('u-role').value;
    const payload = { name: n, email, pass: pass || '1234', role, color: colors[roles.indexOf(role)] };
    let created = null;
    try { created = await apiRequest('POST', 'api/users.php', payload); }
    catch (dbErr) { console.warn('User not saved to database:', dbErr.message); toast('Error', dbErr.message, 'error'); return; }
    App.users.push(created || { id: 'u'+Date.now(), ...payload });
    closeModal(); App.render();
    toast(created ? 'User added' : 'Saved locally only', created ? `${n} added as ${role}` : `${n} added here only — database wasn't reachable.`, created ? 'success' : 'warning');
  },
  editUser(id) {
    const u = App.users.find(x=>x.id===id); if(!u) return;
    openModal(`
      <div class="modal-head"><h3>Edit User</h3><button class="modal-close" onclick="closeModal()">${icon('x')}</button></div>
      <div class="modal-body">
        <div class="field"><label>Full Name</label><input class="input" id="u-name" value="${u.name}" /></div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label>Email</label><input class="input" id="u-email" value="${u.email}" /></div>
          <div class="field"><label>Password</label><input class="input" id="u-pass" placeholder="Leave blank to keep current" /></div>
        </div>
        <div class="field"><label>Role</label><select class="select" id="u-role">${['Owner','Admin','Manager','Cashier','Barista','Inventory Staff','Accountant'].map(r=>`<option ${r===u.role?'selected':''}>${r}</option>`).join('')}</select></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="Pages.updateUser('${id}')">${icon('check')} Save</button>
      </div>
    `);
  },
  async updateUser(id) {
    const u = App.users.find(x=>x.id===id); if(!u) return;
    u.name = document.getElementById('u-name').value;
    u.email = document.getElementById('u-email').value;
    const newPass = document.getElementById('u-pass').value; 
    u.role = document.getElementById('u-role').value;
    closeModal(); App.render(); toast('User updated', u.name, 'success');
    try { await apiRequest('PUT', 'api/users.php', { id, name: u.name, email: u.email, pass: newPass || undefined, role: u.role }); }
    catch (dbErr) { console.warn('User update not saved to database:', dbErr.message); toast('Not saved to database', `${u.name} updated here only.`, 'warning'); }
  },
  deleteUser(id) {
    const u = App.users.find(x=>x.id===id);
    if (u.id === App.user.id) { toast('Error','You cannot delete your own account','error'); return; }
    confirmDialog({ title:'Delete User?', message:`Remove ${u.name} from the team?`, onConfirm: async ()=>{
      App.users = App.users.filter(x=>x.id!==id); App.render(); toast('Deleted', u.name, 'success');
      try { await apiRequest('DELETE', 'api/users.php?id=' + encodeURIComponent(id)); }
      catch (dbErr) { console.warn('User delete not saved to database:', dbErr.message); }
    }});
  },

  
  settings() {
    const isDark = document.documentElement.getAttribute('data-theme')==='dark';
    return `
    <div class="page-header"><div><h1>Settings</h1><p class="muted text-sm">Store configuration</p></div></div>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:16px;align-items:start">
      <div class="card card-pad">
        <h3 style="font-size:1rem;margin-bottom:16px">${icon('store',18)} Store Information</h3>
        <div class="field"><label>Store Name</label><input class="input" id="s-name" value="${STORE_INFO.name}" /></div>
        <div class="field"><label>Address</label><input class="input" id="s-address" value="${STORE_INFO.address}" /></div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label>Phone</label><input class="input" id="s-phone" value="${STORE_INFO.phone}" /></div>
          <div class="field"><label>Email</label><input class="input" id="s-email" value="${STORE_INFO.email}" /></div>
        </div>
        <div class="field"><label>TIN</label><input class="input" id="s-tin" value="${STORE_INFO.tin}" /></div>
        <button class="btn btn-primary" onclick="Pages.saveStore()">${icon('check')} Save Store Info</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card card-pad">
          <h3 style="font-size:1rem;margin-bottom:16px">${icon('tax',18)} Taxes &amp; Receipt</h3>
          <div class="field"><label>Tax Rate (%)</label><input class="input" id="s-tax" type="number" value="${STORE_INFO.taxRate*100}" step="0.1" /></div>
          <div class="field"><label>Receipt Footer</label><input class="input" id="s-footer" value="${STORE_INFO.receiptFooter}" /></div>
          <button class="btn btn-ghost" onclick="Pages.saveStore()">${icon('check')} Save</button>
        </div>

        <div class="card card-pad">
          <h3 style="font-size:1rem;margin-bottom:16px">${icon('palette',18)} Appearance</h3>
          <div class="flex items-center justify-between">
            <div>
              <div class="fw-700" style="font-size:.9rem">Dark Mode</div>
              <div class="muted text-xs">Switch color theme</div>
            </div>
            <label class="switch"><input type="checkbox" ${isDark?'checked':''} onchange="App.toggleTheme()"><span class="slider"></span></label>
          </div>
        </div>

        <div class="card card-pad">
          <h3 style="font-size:1rem;margin-bottom:16px">${icon('printer',18)} Printer</h3>
          <div class="field"><label>Receipt Printer</label><select class="select"><option>Thermal Printer (USB)</option><option>Network Printer</option><option>Bluetooth</option></select></div>
          <button class="btn btn-ghost">${icon('package-plus')} Test Print</button>
        </div>

        <div class="card card-pad">
          <h3 style="font-size:1rem;margin-bottom:16px">${icon('database',18)} Backup &amp; Restore</h3>
          <div class="flex gap-2">
            <button class="btn btn-ghost" style="flex:1" onclick="Pages.backup()">${icon('download')} Backup</button>
            <button class="btn btn-ghost" style="flex:1" onclick="Pages.restore()">${icon('upload')} Restore</button>
          </div>
        </div>

        <div class="card card-pad">
          <h3 style="font-size:1rem;margin-bottom:4px">${icon('qr-code',18)} Customer QR Code</h3>
          <p class="muted text-xs" style="margin-bottom:16px">Scan this QR code to open the customer menu. Point it at any page — your online menu, ordering link, or feedback form.</p>
          <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
            <div id="qr-code-preview" style="width:200px;height:200px;background:#fff;border-radius:14px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;padding:12px;flex-shrink:0"></div>
            <div style="flex:1;min-width:220px">
              <div class="field">
                <label>Destination URL</label>
                <input class="input" id="qr-url-input" value="${App.qrUrl}" placeholder="https://example.com/brewpos" />
              </div>
              <div class="flex gap-2" style="flex-wrap:wrap">
                <button class="btn btn-primary btn-sm" onclick="App.saveQRDestination()">${icon('refresh-cw',14)} Generate / Save</button>
                <button class="btn btn-ghost btn-sm" onclick="App.downloadQRCode()">${icon('download',14)} Download</button>
                <button class="btn btn-ghost btn-sm" onclick="App.copyQRLink()">${icon('copy',14)} Copy Link</button>
                <button class="btn btn-ghost btn-sm" onclick="App.openQRLink()">${icon('external-link',14)} Open Link</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  },
  saveStore() {
    const name = document.getElementById('s-name').value; if(name) STORE_INFO.name = name;
    STORE_INFO.address = document.getElementById('s-address').value;
    STORE_INFO.phone = document.getElementById('s-phone').value;
    STORE_INFO.email = document.getElementById('s-email').value;
    STORE_INFO.tin = document.getElementById('s-tin').value;
    const tax = document.getElementById('s-tax'); if (tax) STORE_INFO.taxRate = Number(tax.value)/100;
    const footer = document.getElementById('s-footer'); if(footer) STORE_INFO.receiptFooter = footer.value;
    toast('Settings saved','Store information updated','success');
  },
  backup() {
    const data = { products:App.products, inventory:App.inventory, customers:App.customers, orders:App.orders, promos:App.promos };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download=`brewpos-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
    toast('Backup created', a.download+' downloaded', 'success');
  },
  restore() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      let data;
      try { data = JSON.parse(await file.text()); }
      catch (err) { toast('Invalid backup file', 'That file is not valid JSON.', 'error'); return; }

      confirmDialog({
        title: 'Restore from backup?',
        message: `This will re-import products, inventory, customers, and promotions from "${file.name}" back into the database (matched by ID). Order history is not touched by restore. Continue?`,
        confirmText: 'Restore',
        danger: true,
        onConfirm: () => Pages.doRestore(data),
      });
    };
    input.click();
  },
  async doRestore(data) {
    const groups = [
      ['products',   'api/products.php'],
      ['inventory',  'api/inventory.php'],
      ['customers',  'api/customers.php'],
      ['promos',     'api/promotions.php'],
    ];
    let restored = 0, created = 0, failed = 0;
    for (const [key, url] of groups) {
      for (const item of (data[key] || [])) {
        try {
          await apiRequest('PUT', url, item); 
          restored++;
        } catch (updErr) {
          
          try { await apiRequest('POST', url, item); created++; }
          catch (createErr) { failed++; }
        }
      }
    }
    toast('Restore complete', `${restored} updated, ${created} recreated${failed?`, ${failed} failed`:''}`, failed ? 'warning' : 'success');
    await App.loadAllFromServer();
    App.render();
  },

  
  selectPayment(method, el) {
    Pages._payment = method;
    document.querySelectorAll('.pay-option').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    const isQR = method === 'QR Code';
    const isCash = method === 'Cash';
    document.getElementById('pay-qr-section').style.display = isQR ? 'block' : 'none';
    document.getElementById('pay-cash-section').style.display = isCash ? 'block' : 'none';
    if (Pages._splitEnabled) Pages.updateSplitAmounts();
    if (isCash) Pages.updateChange();
  },

  toggleSplitPayment(enabled) {
    Pages._splitEnabled = !!enabled;
    const section = document.getElementById('split-payment-section');
    if (section) section.style.display = enabled ? 'block' : 'none';
    if (enabled) Pages.updateSplitAmounts();
  },

  updateSplitAmounts() {
    const sum = App.total(App.cart);
    const section = document.getElementById('split-payment-section');
    const remainingEl = document.getElementById('split-remaining');
    if (!section || !remainingEl) return;
    const cash = Math.max(0, Number(document.getElementById('split-cash-input')?.value || 0));
    const other = Math.max(0, Number(document.getElementById('split-card-input')?.value || 0));
    const remaining = Math.max(0, sum.total - cash - other);
    remainingEl.textContent = money(remaining);
    remainingEl.style.color = remaining > 0 ? 'var(--error)' : 'var(--success)';
    if (Pages._payment === 'Cash' && other > 0) {
      document.getElementById('split-card-input').value = other;
    }
  },

  updateChange() {
    const sum = App.total(App.cart);
    const input = document.getElementById('cash-given');
    const amt = document.getElementById('change-amt');
    if (!input || !amt) return;
    const given = Number(input.value)||0;
    amt.textContent = money(Math.max(0, given - sum.total));
    amt.style.color = given >= sum.total ? 'var(--success)' : 'var(--error)';
  },

  
  afterRender() {
    if (App.route === 'dashboard') this.renderDashboardCharts();
    if (App.route === 'pos') this.posAfterRender();
    if (App.route === 'reports') this.renderReportsChart();
    if (App.route === 'settings') App.renderQRCode();
  },
};

