/**
 * PayMart — Fintech & Shopping Marketplace
 * js/app.js — Logika aplikasi: State, localStorage, validasi, modal, ringkasan, dan grafik.
 */

'use strict';

/* =========================================================================
   1. IN-MEMORY STATE & DATA AWAL
   ========================================================================= */

/** @type {Array<Object>} */
let transactions = [];

/** @type {Array<Object>} */
let products = [];

/** @type {Array<Object>} */
let cart = [];

/** @type {Object} */
let userProfile = {
  name: '',
  email: '',
  phone: '',
  monthlyBudget: 0
};

let currentCategoryFilter = 'Semua';
let chartInstance = null;
let selectedProductForBuy = null;

// Sample Produk Bawaan
const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Nasi Goreng Spesial', price: 25000, category: 'Makanan', store: 'Warung Makan Lekker', img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', badge: 'Hot' },
  { id: 'p2', name: 'Voucher Ojek Online', price: 50000, category: 'Transport', store: 'PayMart Transport', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400', badge: 'Promo' },
  { id: 'p3', name: 'Wireless Earbuds', price: 250000, category: 'Elektronik', store: 'Gadget Mall', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', badge: 'Baru' },
  { id: 'p4', name: 'Kaos Polos Cotton', price: 75000, category: 'Fashion', store: 'Apparel Studio', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400' },
  { id: 'p5', name: 'Voucher Game Pass', price: 100000, category: 'Hiburan', store: 'Game Center', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400', badge: 'Promo' }
];

/* =========================================================================
   2. BROWSER COMPATIBILITY GUARDS
   ========================================================================= */

function isLocalStorageAvailable() {
  try {
    localStorage.setItem('__test', '1');
    localStorage.removeItem('__test');
    return true;
  } catch (e) {
    return false;
  }
}

function isCanvasAvailable() {
  return !!document.createElement('canvas').getContext;
}

function checkBrowserCompatibility() {
  const missing = [];
  if (!isLocalStorageAvailable()) missing.push('Local Storage');
  if (!isCanvasAvailable()) missing.push('Canvas API');

  if (missing.length > 0) {
    const banner = document.createElement('div');
    banner.id = 'unsupported-banner';
    banner.textContent = `Fitur tidak didukung: ${missing.join(', ')}. Harap perbarui browser Anda.`;
    document.body.insertBefore(banner, document.body.firstChild);
    return false;
  }
  return true;
}

/* =========================================================================
   3. HELPER & FORMATTER
   ========================================================================= */

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

function generateId() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

/* =========================================================================
   4. STORAGE MANAGEMENT
   ========================================================================= */

function loadAppData() {
  try {
    const storedTx = localStorage.getItem('paymart_transactions');
    transactions = storedTx ? JSON.parse(storedTx) : [];

    const storedProd = localStorage.getItem('paymart_products');
    products = storedProd ? JSON.parse(storedProd) : DEFAULT_PRODUCTS;

    const storedCart = localStorage.getItem('paymart_cart');
    cart = storedCart ? JSON.parse(storedCart) : [];

    const storedProfile = localStorage.getItem('paymart_profile');
    userProfile = storedProfile ? JSON.parse(storedProfile) : { name: '', email: '', phone: '', monthlyBudget: 0 };
  } catch (err) {
    console.error('Gagal memuat data dari LocalStorage:', err);
  }
}

function saveData() {
  try {
    localStorage.setItem('paymart_transactions', JSON.stringify(transactions));
    localStorage.setItem('paymart_products', JSON.stringify(products));
    localStorage.setItem('paymart_cart', JSON.stringify(cart));
    localStorage.setItem('paymart_profile', JSON.stringify(userProfile));
  } catch (err) {
    console.error('Gagal menyimpan data:', err);
  }
}

/* =========================================================================
   5. CALCULATIONS & BALANCE
   ========================================================================= */

function getBalance() {
  return transactions.reduce((acc, tx) => {
    return tx.type === 'income' || tx.type === 'topup' ? acc + tx.amount : acc - tx.amount;
  }, 0);
}

function getTotalIncome() {
  return transactions
    .filter(tx => tx.type === 'income' || tx.type === 'topup')
    .reduce((acc, tx) => acc + tx.amount, 0);
}

function getTotalExpense() {
  return transactions
    .filter(tx => tx.type === 'expense' || tx.type === 'transfer' || tx.type === 'purchase')
    .reduce((acc, tx) => acc + tx.amount, 0);
}

/* =========================================================================
   6. UI RENDERING & CHARTS
   ========================================================================= */

function renderAll() {
  renderProfile();
  renderWallet();
  renderStats();
  renderProducts();
  renderCart();
  renderTransactions();
  renderBudgetSummary();
  renderChart();
  saveData();
}

function renderProfile() {
  const nameDisplay = document.getElementById('wallet-user-name');
  const avatarInitials = document.getElementById('avatar-initials');
  const avatarBig = document.getElementById('profile-avatar-big');

  if (userProfile.name) {
    if (nameDisplay) nameDisplay.textContent = userProfile.name;
    const initial = userProfile.name.charAt(0).toUpperCase();
    if (avatarInitials) avatarInitials.textContent = initial;
    if (avatarBig) avatarBig.textContent = initial;
  } else {
    if (nameDisplay) nameDisplay.textContent = 'Belum ada profil';
    if (avatarInitials) avatarInitials.textContent = '?';
    if (avatarBig) avatarBig.textContent = '?';
  }
}

function renderWallet() {
  const balanceEl = document.getElementById('balance-amount');
  if (balanceEl) balanceEl.textContent = formatCurrency(getBalance());
}

function renderStats() {
  const incomeEl = document.getElementById('stat-income');
  const expenseEl = document.getElementById('stat-expense');
  const countEl = document.getElementById('stat-count');
  const prodCountEl = document.getElementById('stat-products');

  if (incomeEl) incomeEl.textContent = formatCurrency(getTotalIncome());
  if (expenseEl) expenseEl.textContent = formatCurrency(getTotalExpense());
  if (countEl) countEl.textContent = transactions.length;

  const totalPurchasedQty = transactions
    .filter(tx => tx.type === 'purchase' && tx.qty)
    .reduce((sum, tx) => sum + tx.qty, 0);
  if (prodCountEl) prodCountEl.textContent = totalPurchasedQty;
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  const emptyState = document.getElementById('product-empty-state');
  if (!grid) return;

  grid.innerHTML = '';

  const searchVal = document.getElementById('search-input')?.value.toLowerCase() || '';

  const filtered = products.filter(p => {
    const matchesCat = currentCategoryFilter === 'Semua' || p.category === currentCategoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  filtered.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrap">
        <img class="product-img" src="${prod.img || 'https://via.placeholder.com/200'}" alt="${prod.name}" />
        ${prod.badge ? `<span class="product-badge badge-hot">${prod.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${prod.name}</div>
        <div class="product-store">🏪 ${prod.store || 'PayMart Store'}</div>
        <div class="product-price-row">
          <span class="product-price">${formatCurrency(prod.price)}</span>
        </div>
        <button class="buy-btn" data-id="${prod.id}">🛒 Beli Sekarang</button>
      </div>
    `;

    card.querySelector('.buy-btn').addEventListener('click', () => openBuyModal(prod));
    grid.appendChild(card);
  });
}

function renderCart() {
  const cartList = document.getElementById('cart-list');
  const cartEmpty = document.getElementById('cart-empty');
  const cartFooter = document.getElementById('cart-footer');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  if (cartCount) cartCount.textContent = totalItems;

  if (!cartList) return;
  cartList.innerHTML = '';

  if (cart.length === 0) {
    if (cartEmpty) cartEmpty.hidden = false;
    if (cartFooter) cartFooter.hidden = true;
    return;
  }

  if (cartEmpty) cartEmpty.hidden = true;
  if (cartFooter) cartFooter.hidden = false;

  let grandTotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    grandTotal += itemTotal;

    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <div class="history-item-body">
        <div class="history-item-name">${item.name}</div>
        <div class="history-item-meta">${formatCurrency(item.price)} x ${item.qty}</div>
      </div>
      <div class="history-item-amount">${formatCurrency(itemTotal)}</div>
      <button class="history-item-delete" data-id="${item.id}">✕</button>
    `;

    li.querySelector('.history-item-delete').addEventListener('click', () => {
      cart = cart.filter(c => c.id !== item.id);
      renderCart();
      saveData();
    });

    cartList.appendChild(li);
  });

  if (cartTotal) cartTotal.textContent = formatCurrency(grandTotal);
}

function renderTransactions() {
  const list = document.getElementById('transaction-list');
  const emptyState = document.getElementById('list-empty-state');
  const filterType = document.getElementById('history-filter-type')?.value || 'all';
  const filterCat = document.getElementById('history-filter-cat')?.value || 'all';

  if (!list) return;
  list.innerHTML = '';

  const filtered = transactions.filter(tx => {
    const matchType = filterType === 'all' || tx.type === filterType;
    const matchCat = filterCat === 'all' || tx.category === filterCat;
    return matchType && matchCat;
  });

  if (filtered.length === 0) {
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  filtered.slice().reverse().forEach(tx => {
    const isPositive = tx.type === 'income' || tx.type === 'topup';
    const li = document.createElement('li');
    li.className = 'history-item';

    const iconClass = isPositive ? 'income' : 'expense';
    const amountClass = isPositive ? 'income' : 'expense';
    const sign = isPositive ? '+' : '-';

    li.innerHTML = `
      <div class="history-item-icon ${iconClass}">${isPositive ? '📥' : '📤'}</div>
      <div class="history-item-body">
        <div class="history-item-name">${tx.title}</div>
        <div class="history-item-meta">${tx.category || 'Umum'} • ${tx.date}</div>
      </div>
      <div class="history-item-amount ${amountClass}">${sign} ${formatCurrency(tx.amount)}</div>
      <button class="history-item-delete" data-id="${tx.id}">🗑</button>
    `;

    li.querySelector('.history-item-delete').addEventListener('click', () => deleteTransaction(tx.id));
    list.appendChild(li);
  });
}

function renderBudgetSummary() {
  const summaryEl = document.getElementById('budget-summary');
  const categoryGrid = document.getElementById('budget-category-grid');
  const catEmpty = document.getElementById('budget-cat-empty');

  const totals = {};
  transactions
    .filter(tx => tx.type === 'expense' || tx.type === 'purchase' || tx.type === 'transfer')
    .forEach(tx => {
      const cat = tx.category || 'Lainnya';
      totals[cat] = (totals[cat] || 0) + tx.amount;
    });

  const keys = Object.keys(totals);

  if (summaryEl) {
    if (keys.length === 0) {
      summaryEl.innerHTML = `<p class="empty-hint">Catat pengeluaran untuk melihat ringkasan.</p>`;
    } else {
      let html = '<ul style="list-style:none; padding:0; font-size:0.85rem; line-height:1.6;">';
      for (const cat in totals) {
        html += `<li><strong>${cat}:</strong> ${formatCurrency(totals[cat])}</li>`;
      }
      html += '</ul>';
      summaryEl.innerHTML = html;
    }
  }

  if (categoryGrid) {
    categoryGrid.innerHTML = '';
    if (keys.length === 0) {
      if (catEmpty) catEmpty.hidden = false;
    } else {
      if (catEmpty) catEmpty.hidden = true;
      for (const cat in totals) {
        const item = document.createElement('div');
        item.style.cssText = 'background:#f8f9ff; padding:0.75rem; border-radius:10px; font-size:0.85rem;';
        item.innerHTML = `<div><strong>${cat}</strong></div><div>${formatCurrency(totals[cat])}</div>`;
        categoryGrid.appendChild(item);
      }
    }
  }

  // Update budget progress bar di profil
  const progressWrap = document.getElementById('budget-progress-wrap');
  const progressText = document.getElementById('budget-progress-text');
  const progressBar = document.getElementById('budget-bar-fill');

  if (userProfile.monthlyBudget > 0 && progressWrap) {
    progressWrap.hidden = false;
    const totalSpent = getTotalExpense();
    const percent = Math.min(Math.round((totalSpent / userProfile.monthlyBudget) * 100), 100);

    if (progressText) progressText.textContent = `${formatCurrency(totalSpent)} / ${formatCurrency(userProfile.monthlyBudget)}`;
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
      progressBar.style.backgroundColor = percent >= 90 ? '#e53935' : '#6c63ff';
    }
  } else if (progressWrap) {
    progressWrap.hidden = true;
  }
}

function renderChart() {
  const canvas = document.getElementById('spending-chart');
  const emptyChart = document.getElementById('chart-empty-state');
  if (!canvas) return;

  const categories = ['Makanan', 'Transport', 'Elektronik', 'Fashion', 'Hiburan', 'Lainnya'];
  const totals = categories.map(cat => {
    return transactions
      .filter(tx => (tx.type === 'expense' || tx.type === 'purchase') && tx.category === cat)
      .reduce((sum, tx) => sum + tx.amount, 0);
  });

  const hasData = totals.some(v => v > 0);

  if (!hasData) {
    canvas.style.display = 'none';
    if (emptyChart) emptyChart.style.display = 'block';
    return;
  }

  canvas.style.display = 'block';
  if (emptyChart) emptyChart.style.display = 'none';

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: totals,
        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0', '#9966ff']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
      }
    }
  });
}

/* =========================================================================
   7. MODALS HANDLER
   ========================================================================= */

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  const overlay = document.getElementById('modal-overlay');
  if (modal && overlay) {
    modal.classList.add('active');
    overlay.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  const overlay = document.getElementById('modal-overlay');
  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

function setupModalEvents() {
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      closeModal(modalId);
    });
  });

  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
      overlay.classList.remove('active');
    });
  }
}

/* =========================================================================
   8. ACTIONS & TRANSACTION LOGIC
   ========================================================================= */

function addTransaction(tx) {
  transactions.push({
    id: generateId(),
    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    ...tx
  });
  renderAll();
}

function deleteTransaction(id) {
  if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    transactions = transactions.filter(t => t.id !== id);
    showToast('Transaksi berhasil dihapus', 'success');
    renderAll();
  }
}

function openBuyModal(product) {
  selectedProductForBuy = product;

  const img = document.getElementById('buy-product-img');
  const name = document.getElementById('buy-product-name');
  const store = document.getElementById('buy-product-store');
  const price = document.getElementById('buy-product-price');
  const qtyInput = document.getElementById('buy-qty');

  if (img) img.src = product.img || '';
  if (name) name.textContent = product.name;
  if (store) store.textContent = product.store || 'PayMart Store';
  if (price) price.textContent = formatCurrency(product.price);
  if (qtyInput) qtyInput.value = 1;

  updateBuyModalTotal();
  openModal('buy-modal');
}

function updateBuyModalTotal() {
  if (!selectedProductForBuy) return;
  const qty = parseInt(document.getElementById('buy-qty')?.value || '1', 10);
  const total = selectedProductForBuy.price * qty;
  const balance = getBalance();

  const totalEl = document.getElementById('buy-total-price');
  const afterEl = document.getElementById('buy-balance-after');

  if (totalEl) totalEl.textContent = formatCurrency(total);
  if (afterEl) {
    const after = balance - total;
    afterEl.textContent = formatCurrency(after);
    afterEl.style.color = after < 0 ? '#e53935' : '#1a1a2e';
  }
}

/* =========================================================================
   9. EVENT LISTENERS
   ========================================================================= */

function setupEventListeners() {
  setupModalEvents();

  // Profile Modal
  document.getElementById('avatar-btn')?.addEventListener('click', () => {
    document.getElementById('p-name').value = userProfile.name || '';
    document.getElementById('p-email').value = userProfile.email || '';
    document.getElementById('p-phone').value = userProfile.phone || '';
    document.getElementById('p-budget').value = userProfile.monthlyBudget || '';
    openModal('profile-modal');
  });

  document.getElementById('save-profile-btn')?.addEventListener('click', () => {
    userProfile.name = document.getElementById('p-name').value.trim();
    userProfile.email = document.getElementById('p-email').value.trim();
    userProfile.phone = document.getElementById('p-phone').value.trim();
    userProfile.monthlyBudget = Number(document.getElementById('p-budget').value) || 0;

    closeModal('profile-modal');
    showToast('Profil berhasil disimpan!', 'success');
    renderAll();
  });

  // Top Up Modal
  document.getElementById('top-up-btn')?.addEventListener('click', () => {
    document.getElementById('topup-current-balance').textContent = formatCurrency(getBalance());
    openModal('topup-modal');
  });

  document.querySelectorAll('.quick-amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('topup-amount').value = btn.getAttribute('data-amount');
    });
  });

  document.getElementById('topup-confirm-btn')?.addEventListener('click', () => {
    const amount = Number(document.getElementById('topup-amount').value);
    if (!amount || amount <= 0) {
      showToast('Masukkan jumlah top up yang valid!', 'error');
      return;
    }

    addTransaction({
      title: 'Top Up Saldo',
      amount: amount,
      type: 'topup',
      category: 'Top Up'
    });

    document.getElementById('topup-amount').value = '';
    closeModal('topup-modal');
    showToast(`Berhasil Top Up ${formatCurrency(amount)}`, 'success');
  });

  // Transfer Modal
  document.getElementById('send-btn')?.addEventListener('click', () => {
    document.getElementById('transfer-current-balance').textContent = formatCurrency(getBalance());
    openModal('transfer-modal');
  });

  document.getElementById('transfer-confirm-btn')?.addEventListener('click', () => {
    const to = document.getElementById('transfer-to').value.trim();
    const amount = Number(document.getElementById('transfer-amount').value);

    if (!to) {
      showToast('Masukkan nama penerima!', 'error');
      return;
    }
    if (!amount || amount <= 0) {
      showToast('Masukkan nominal transfer yang valid!', 'error');
      return;
    }
    if (amount > getBalance()) {
      showToast('Saldo Anda tidak mencukupi!', 'error');
      return;
    }

    addTransaction({
      title: `Kirim ke ${to}`,
      amount: amount,
      type: 'transfer',
      category: 'Transfer'
    });

    document.getElementById('transfer-to').value = '';
    document.getElementById('transfer-amount').value = '';
    closeModal('transfer-modal');
    showToast(`Berhasil mentransfer ${formatCurrency(amount)} ke ${to}`, 'success');
  });

  // Buy Quantity Control
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    const qty = document.getElementById('buy-qty');
    if (qty && parseInt(qty.value) > 1) {
      qty.value = parseInt(qty.value) - 1;
      updateBuyModalTotal();
    }
  });

  document.getElementById('qty-plus')?.addEventListener('click', () => {
    const qty = document.getElementById('buy-qty');
    if (qty && parseInt(qty.value) < 99) {
      qty.value = parseInt(qty.value) + 1;
      updateBuyModalTotal();
    }
  });

  document.getElementById('buy-qty')?.addEventListener('input', updateBuyModalTotal);

  document.getElementById('buy-confirm-btn')?.addEventListener('click', () => {
    if (!selectedProductForBuy) return;
    const qty = parseInt(document.getElementById('buy-qty').value || '1', 10);
    const total = selectedProductForBuy.price * qty;

    if (total > getBalance()) {
      showToast('Saldo Anda tidak mencukupi!', 'error');
      return;
    }

    addTransaction({
      title: `Beli: ${selectedProductForBuy.name}`,
      amount: total,
      type: 'purchase',
      category: selectedProductForBuy.category,
      qty: qty
    });

    closeModal('buy-modal');
    showToast(`Pembelian ${selectedProductForBuy.name} berhasil!`, 'success');
  });

  // Cart Modal & Checkout
  document.getElementById('cart-btn')?.addEventListener('click', () => openModal('cart-modal'));

  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    if (total > getBalance()) {
      showToast('Saldo Anda tidak mencukupi untuk checkout!', 'error');
      return;
    }

    cart.forEach(item => {
      addTransaction({
        title: `Beli: ${item.name}`,
        amount: item.price * item.qty,
        type: 'purchase',
        category: item.category,
        qty: item.qty
      });
    });

    cart = [];
    renderCart();
    closeModal('cart-modal');
    showToast('Berhasil membeli semua produk di keranjang!', 'success');
  });

  // Add Product Modal
  document.getElementById('open-add-product-btn')?.addEventListener('click', () => openModal('add-product-modal'));

  document.getElementById('add-product-confirm-btn')?.addEventListener('click', () => {
    const name = document.getElementById('new-prod-name').value.trim();
    const price = Number(document.getElementById('new-prod-price').value);
    const category = document.getElementById('new-prod-category').value;
    const store = document.getElementById('new-prod-store').value.trim();
    const img = document.getElementById('new-prod-img').value.trim();

    if (!name || !price || price <= 0) {
      showToast('Lengkapi nama dan harga produk secara valid!', 'error');
      return;
    }

    products.push({
      id: generateId(),
      name,
      price,
      category,
      store: store || 'PayMart Store',
      img: img || 'https://via.placeholder.com/200',
      badge: 'Baru'
    });

    closeModal('add-product-modal');
    showToast('Produk baru berhasil ditambahkan!', 'success');
    renderProducts();
    saveData();
  });

  // Manual Transaction Form
  document.getElementById('transaction-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('item-name').value.trim();
    const amount = Number(document.getElementById('amount').value);
    const type = document.getElementById('tx-type').value;
    const category = document.getElementById('category').value;

    if (!name || !amount || amount <= 0 || !category) {
      showToast('Mohon isi formulir transaksi dengan benar!', 'error');
      return;
    }

    addTransaction({
      title: name,
      amount: amount,
      type: type,
      category: category
    });

    e.target.reset();
    showToast('Transaksi manual berhasil dicatat!', 'success');
  });

  // Filters & Search
  document.getElementById('category-filter-row')?.addEventListener('click', e => {
    if (e.target.classList.contains('category-chip')) {
      document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      currentCategoryFilter = e.target.getAttribute('data-cat') || 'Semua';
      renderProducts();
    }
  });

  document.getElementById('search-input')?.addEventListener('input', renderProducts);

  document.getElementById('history-filter-type')?.addEventListener('change', renderTransactions);
  document.getElementById('history-filter-cat')?.addEventListener('change', renderTransactions);

  document.getElementById('clear-history-btn')?.addEventListener('click', () => {
    if (confirm('Hapus semua riwayat transaksi? Sisa saldo akan menjadi Nol.')) {
      transactions = [];
      showToast('Riwayat transaksi berhasil dibersihkan', 'warning');
      renderAll();
    }
  });

  document.getElementById('history-scroll-btn')?.addEventListener('click', () => {
    document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('hero-cta-btn')?.addEventListener('click', () => {
    document.getElementById('product-section-title')?.scrollIntoView({ behavior: 'smooth' });
  });
}

/* =========================================================================
   10. INITIALIZATION
   ========================================================================= */

function initApp() {
  if (!checkBrowserCompatibility()) return;

  loadAppData();
  setupEventListeners();
  renderAll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}