document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

let adminToken = '';

function initAdminDashboard() {
  const gateway = document.getElementById('passcode-gateway');
  const passcodeForm = document.getElementById('passcode-form');
  const passcodeInput = document.getElementById('passcode-input');
  const btnLogout = document.getElementById('btn-logout');

  const ALLOWED_PASSCODES = ['kwikezee2026', 'admin123', 'kwikezee', 'admin'];

  // Periksa jika token disimpan dalam localStorage
  const savedToken = localStorage.getItem('kwikezee_admin_token');
  if (savedToken) {
    adminToken = savedToken;
    gateway.style.display = 'none';
    loadSubmissions();
  }

  // Pengesahan Passcode
  passcodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputVal = passcodeInput.value.trim();
    if (!inputVal) return;

    if (ALLOWED_PASSCODES.includes(inputVal.toLowerCase()) || inputVal.length >= 6) {
      adminToken = inputVal;
      localStorage.setItem('kwikezee_admin_token', adminToken);
      gateway.style.display = 'none';
      loadSubmissions();
    } else {
      alert('Kata laluan salah. Sila cuba lagi.');
      passcodeInput.value = '';
      passcodeInput.focus();
    }
  });

  // Log keluar
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('kwikezee_admin_token');
    adminToken = '';
    gateway.style.display = 'flex';
    document.getElementById('submissions-list').innerHTML = '';
  });

  // Setup Lightbox
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxClose) {
      lightbox.classList.remove('active');
    }
  });

  window.openLightbox = function(imgUrl) {
    lightboxImg.src = imgUrl;
    lightbox.classList.add('active');
  };
}

/* ==========================================================================
   MUAT TURUN DAN PAPAR SENARAI SUBMISSIONS
   ========================================================================== */
function loadSubmissions(callback) {
  const container = document.getElementById('submissions-list');
  const loader = document.getElementById('admin-loader');

  if (loader) loader.style.display = 'block';

  fetch('/api/admin', {
    method: 'GET',
    headers: {
      'X-Admin-Token': adminToken
    }
  })
  .then(res => {
    if (res.status === 401) {
      if (callback) callback(false);
      return null;
    }
    if (!res.ok) {
      throw new Error('Gagal memuat turun data');
    }
    if (callback) callback(true);
    return res.json();
  })
  .then(data => {
    if (!data) return;
    renderSubmissions(data);
  })
  .catch(err => {
    console.error(err);
    container.innerHTML = `
      <div class="no-submissions">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3 style="color:#FFFFFF;">Ralat Sistem</h3>
        <p style="color:#A1A1AA;">Gagal memuat turun data projek. Sila hubungi pembangun atau cuba lagi.</p>
      </div>
    `;
  });
}

function renderSubmissions(submissions) {
  const container = document.getElementById('submissions-list');
  container.innerHTML = '';

  if (submissions.length === 0) {
    container.innerHTML = `
      <div class="no-submissions">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <h3 style="color:#FFFFFF;">Tiada Data Projek</h3>
        <p style="color:#A1A1AA;">Sistem belum menerima sebarang penghantaran borang maklumat daripada klien.</p>
      </div>
    `;
    return;
  }

  submissions.forEach(sub => {
    const formattedDate = new Date(sub.timestamp).toLocaleString('ms-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const item = document.createElement('div');
    item.className = 'submission-item';
    item.id = `sub-${sub.id}`;

    // Helper untuk menjana url proxy fail R2
    const getFileUrl = (key) => `/api/admin?file=${encodeURIComponent(key)}&token=${encodeURIComponent(adminToken)}`;

    // Generate previews logo
    let logoHtml = '<p style="color:var(--text-muted); font-style:italic;">Tiada Logo Dihantar</p>';
    if (sub.files && sub.files.logo) {
      const url = getFileUrl(sub.files.logo);
      logoHtml = `
        <div class="admin-files-grid">
          <div class="admin-file-card" onclick="window.openLightbox('${url}')">
            <img src="${url}" alt="Logo">
            <div class="file-overlay-name">Logo</div>
          </div>
        </div>
      `;
    }

    // Generate previews portfolio images
    let portfolioHtml = '<p style="color:var(--text-muted); font-style:italic;">Tiada Gambar Dihantar</p>';
    if (sub.files && sub.files.portfolio && sub.files.portfolio.length > 0) {
      portfolioHtml = `<div class="admin-files-grid">`;
      sub.files.portfolio.forEach((fileKey, idx) => {
        const url = getFileUrl(fileKey);
        portfolioHtml += `
          <div class="admin-file-card" onclick="window.openLightbox('${url}')">
            <img src="${url}" alt="Portfolio ${idx+1}">
            <div class="file-overlay-name">Gambar ${idx+1}</div>
          </div>
        `;
      });
      portfolioHtml += `</div>`;
    }

    // Generate previews documents
    let docsHtml = '<p style="color:var(--text-muted); font-style:italic;">Tiada Sijil Dihantar</p>';
    if (sub.files && sub.files.docs && sub.files.docs.length > 0) {
      docsHtml = `<div class="admin-files-grid">`;
      sub.files.docs.forEach((fileKey) => {
        const url = getFileUrl(fileKey);
        const fileName = fileKey.split('/').pop();
        const isPdf = fileName.toLowerCase().endsWith('.pdf');

        if (isPdf) {
          docsHtml += `
            <a href="${url}" target="_blank" class="admin-file-card">
              <div class="pdf-card">PDF</div>
              <div class="file-overlay-name">${fileName}</div>
            </a>
          `;
        } else {
          docsHtml += `
            <div class="admin-file-card" onclick="window.openLightbox('${url}')">
              <img src="${url}" alt="Sijil">
              <div class="file-overlay-name">${fileName}</div>
            </div>
          `;
        }
      });
      docsHtml += `</div>`;
    }

    const waNumber = sub.whatsapp.replace(/\D/g, '');
    const waUrl = `https://wa.me/${waNumber}`;

    item.innerHTML = `
      <div class="submission-header">
        <div class="sub-client-info">
          <h3>${escapeHtml(sub.companyName)}</h3>
          <span class="sub-date">📅 Dihantar pada: ${formattedDate}</span>
        </div>
        <div class="submission-actions">
          <a href="${waUrl}" target="_blank" class="action-btn wa-btn" title="WhatsApp Klien" aria-label="WhatsApp Klien">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </a>
          <button class="action-btn delete-btn" onclick="deleteSubmission('${sub.id}')" title="Padam Projek" aria-label="Padam Projek">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>
      <div class="submission-body">
        <div class="sub-section-grid">
          
          <!-- Lajur 1: Informasi Projek -->
          <div>
            <div class="detail-block">
              <h4>Slogan / Tagline</h4>
              <p>${sub.tagline ? escapeHtml(sub.tagline) : '-'}</p>
            </div>
            <div class="detail-block">
              <h4>Kawasan Liputan Servis</h4>
              <p>${escapeHtml(sub.coverageArea)}</p>
            </div>
            <div class="detail-block">
              <h4>Warna Tema Pilihan</h4>
              <p>${sub.brandColors ? escapeHtml(sub.brandColors) : '-'}</p>
            </div>
            <div class="detail-block">
              <h4>Senarai Servis Utama</h4>
              <p>${escapeHtml(sub.services)}</p>
            </div>
            <div class="detail-block">
              <h4>Kelebihan Utama (USP)</h4>
              <p>${escapeHtml(sub.usp)}</p>
            </div>
            <div class="detail-block">
              <h4>Proses Kerja Klien</h4>
              <p>${sub.workflow ? escapeHtml(sub.workflow) : '-'}</p>
            </div>
            <div class="detail-block">
              <h4>Testimoni / Ulasan Pelanggan</h4>
              <p>${sub.testimonials ? escapeHtml(sub.testimonials) : '-'}</p>
            </div>
            <div class="detail-block">
              <h4>Maklumat Perhubungan Lain</h4>
              <p>
                <strong>E-mel:</strong> ${sub.email ? escapeHtml(sub.email) : '-'}<br>
                <strong>Alamat:</strong> ${sub.address ? escapeHtml(sub.address) : '-'}<br>
                <strong>Media Sosial:</strong> ${sub.socialMedia ? escapeHtml(sub.socialMedia) : '-'}
              </p>
            </div>
          </div>

          <!-- Lajur 2: Fail Diupload (R2) -->
          <div>
            <div class="detail-block" style="margin-bottom: 25px;">
              <h4>Logo Syarikat</h4>
              ${logoHtml}
            </div>
            <div class="detail-block" style="margin-bottom: 25px;">
              <h4>Galeri Portfolio</h4>
              ${portfolioHtml}
            </div>
            <div class="detail-block">
              <h4>Sijil Pendaftaran (SSM/CIDB)</h4>
              ${docsHtml}
            </div>
          </div>

        </div>
      </div>
    `;

    container.appendChild(item);
  });
}

/* ==========================================================================
   FUNGSI HAPUS DATA KLIEN (R2 ACTION)
   ========================================================================== */
window.deleteSubmission = function(submissionId) {
  if (!confirm('Adakah anda pasti untuk memadam semua data maklumat projek klien ini?\nTindakan ini akan memadam fail R2 secara kekal dan tidak boleh dikembalikan.')) {
    return;
  }

  const itemEl = document.getElementById(`sub-${submissionId}`);
  if (itemEl) {
    itemEl.style.opacity = '0.5';
    itemEl.style.pointerEvents = 'none';
  }

  fetch(`/api/admin?id=${encodeURIComponent(submissionId)}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Token': adminToken
    }
  })
  .then(res => {
    if (!res.ok) throw new Error('Gagal memadam data');
    return res.json();
  })
  .then(res => {
    alert('Data projek telah berjaya dipadam dari R2.');
    if (itemEl) {
      itemEl.remove();
    }
    // Semak jika semua kad sudah dipadam untuk paparkan empty state
    const container = document.getElementById('submissions-list');
    const remainingItems = container.querySelectorAll('.submission-item');
    if (remainingItems.length === 0) {
      container.innerHTML = `
        <div class="no-submissions">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <h3 style="color:#FFFFFF;">Tiada Data Projek</h3>
          <p style="color:#A1A1AA;">Sistem belum menerima sebarang penghantaran borang maklumat daripada klien.</p>
        </div>
      `;
    }
  })
  .catch(err => {
    console.error(err);
    alert('Ralat semasa memadam data.');
    if (itemEl) {
      itemEl.style.opacity = '1';
      itemEl.style.pointerEvents = 'auto';
    }
  });
};

/* ==========================================================================
   UTILITY HELPER
   ========================================================================== */
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================================
   ADMIN TAB SWITCHING
   ========================================================================== */
window.switchAdminTab = function(tabName) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));

  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  const activeContent = document.getElementById(`admin-tab-${tabName}`);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeContent) activeContent.classList.add('active');

  if (tabName === 'history') {
    renderQuotationHistory();
  }
};

/* ==========================================================================
   QUOTATION BUILDER & GENERATOR LOGIC
   ========================================================================== */
let qbItemCounter = 0;
let currentQtData = null;

// Initialize Quotation Form Defaults
function initQuotationForm() {
  autoGenerateQtNo();
  
  // Set default dates
  const today = new Date();
  const validUntil = new Date();
  validUntil.setDate(today.getDate() + 14);

  const qtDateEl = document.getElementById('qt-date');
  const qtValidEl = document.getElementById('qt-valid-until');
  
  if (qtDateEl) qtDateEl.value = today.toISOString().split('T')[0];
  if (qtValidEl) qtValidEl.value = validUntil.toISOString().split('T')[0];

  // Add default starter scope items if empty
  const itemsContainer = document.getElementById('quotation-items-list');
  if (itemsContainer && itemsContainer.children.length === 0) {
    addQuotationScopeItem(
      "Reka Bentuk Laman Web Premium (Custom UI/UX)",
      "Pembangunan 5 Halaman Laman Web bertema gelap mewah, copywriting berkonversi tinggi & animasi halus.",
      490
    );
    addQuotationScopeItem(
      "Integrasi Gateway Pembayaran & DuitNow QR",
      "Penyediaan modul DuitNow QR automatik & direct bank transfer bersama sistem muat turun resit.",
      200
    );
    addQuotationScopeItem(
      "PWA Mobile App (Progressive Web App)",
      "Kebolehan aplikasi dipasang terus ke skrin utama telefon bimbit klien (iOS & Android).",
      200
    );
    addQuotationScopeItem(
      "Borang Tempahan & Integrasi Telegram / Emel",
      "Notifikasi serta-merta ke Telegram Bot & emel apabila pelanggan membuat tempahan.",
      150
    );
    addQuotationScopeItem(
      "Domain .my / .com & Web Hosting 1 Tahun",
      "Pendaftaran domain rasmi dan penyediaan pelayan cloud hosting kelajuan tinggi (Percuma Tahun Pertama).",
      0
    );
  }

  updateQtFormTotals();
  updateHistoryCountBadge();
}

window.autoGenerateQtNo = function() {
  const randomNum = Math.floor(100 + Math.random() * 900);
  const year = new Date().getFullYear();
  const qtNoEl = document.getElementById('qt-no');
  if (qtNoEl) {
    qtNoEl.value = `KZ-QT-${year}-${randomNum}`;
  }
};

window.addQuotationScopeItem = function(title = '', desc = '', price = 0) {
  qbItemCounter++;
  const container = document.getElementById('quotation-items-list');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'qb-item-row';
  row.id = `qb-item-${qbItemCounter}`;

  row.innerHTML = `
    <div class="qb-item-header">
      <span class="qb-item-num">#${container.children.length + 1}</span>
      <button type="button" class="btn-remove-row" onclick="removeQuotationScopeItem(${qbItemCounter})" title="Padam Skop Ini">&times;</button>
    </div>
    <div class="qb-item-body">
      <div class="form-group-pay">
        <label>Skop / Nama Fungsi</label>
        <input type="text" class="qb-input-title" value="${escapeHtml(title)}" placeholder="Contoh: Pembangunan 5 Halaman Landing Page" required oninput="updateQtFormTotals()">
      </div>
      <div class="form-group-pay">
        <label>Penerangan Terperinci</label>
        <textarea class="qb-input-desc" rows="2" placeholder="Contoh: Reka bentuk moden tema gelap, animasi halus, responsif peranti..." oninput="updateQtFormTotals()">${escapeHtml(desc)}</textarea>
      </div>
      <div class="form-group-pay">
        <label>Harga Skop (RM)</label>
        <input type="number" class="qb-input-price" value="${price}" min="0" placeholder="0" required oninput="updateQtFormTotals()">
      </div>
    </div>
  `;

  container.appendChild(row);
  reindexQbItemNumbers();
  updateQtFormTotals();
};

window.removeQuotationScopeItem = function(id) {
  const row = document.getElementById(`qb-item-${id}`);
  if (row) {
    row.remove();
    reindexQbItemNumbers();
    updateQtFormTotals();
  }
};

function reindexQbItemNumbers() {
  const container = document.getElementById('quotation-items-list');
  if (!container) return;
  const rows = container.querySelectorAll('.qb-item-row');
  rows.forEach((row, idx) => {
    const numEl = row.querySelector('.qb-item-num');
    if (numEl) numEl.innerText = `#${idx + 1}`;
  });
}

window.updateQtFormTotals = function() {
  const container = document.getElementById('quotation-items-list');
  if (!container) return;

  let subtotal = 0;
  const priceInputs = container.querySelectorAll('.qb-input-price');
  priceInputs.forEach(input => {
    const val = parseFloat(input.value) || 0;
    subtotal += val;
  });

  const discountEl = document.getElementById('qt-discount');
  const discount = parseFloat(discountEl ? discountEl.value : 0) || 0;
  const total = Math.max(0, subtotal - discount);
  const deposit = Math.round(total / 2);

  const subtotalEl = document.getElementById('qb-summary-subtotal');
  const discountSummaryEl = document.getElementById('qb-summary-discount');
  const totalEl = document.getElementById('qb-summary-total');
  const depositEl = document.getElementById('qb-summary-deposit');

  if (subtotalEl) subtotalEl.innerText = `RM${subtotal.toLocaleString()}`;
  if (discountSummaryEl) discountSummaryEl.innerText = `-RM${discount.toLocaleString()}`;
  if (totalEl) totalEl.innerText = `RM${total.toLocaleString()}`;
  if (depositEl) depositEl.innerText = `RM${deposit.toLocaleString()}`;
};

window.generateQuotationDocument = function(event) {
  event.preventDefault();

  const qtNo = document.getElementById('qt-no').value.trim();
  const qtDate = document.getElementById('qt-date').value;
  const qtValid = document.getElementById('qt-valid-until').value;
  const clientName = document.getElementById('qt-client-name').value.trim();
  const projectTitle = document.getElementById('qt-project-title').value.trim();
  const clientPhone = document.getElementById('qt-client-phone').value.trim();
  const clientEmail = document.getElementById('qt-client-email').value.trim();
  const discount = parseFloat(document.getElementById('qt-discount').value) || 0;
  const payMode = document.getElementById('qt-pay-mode').value;
  const duration = document.getElementById('qt-duration').value.trim();
  const notes = document.getElementById('qt-notes').value.trim();

  // Extract items
  const itemsContainer = document.getElementById('quotation-items-list');
  const rows = itemsContainer.querySelectorAll('.qb-item-row');
  const items = [];

  rows.forEach(row => {
    const title = row.querySelector('.qb-input-title').value.trim();
    const desc = row.querySelector('.qb-input-desc').value.trim();
    const price = parseFloat(row.querySelector('.qb-input-price').value) || 0;
    if (title) {
      items.push({ title, desc, price });
    }
  });

  if (items.length === 0) {
    alert('Sila tambah sekurang-kurangnya 1 skop kerja / fungsi laman web.');
    return;
  }

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = Math.max(0, subtotal - discount);
  const deposit = Math.round(total / 2);
  const balance = total - deposit;

  currentQtData = {
    id: 'QT-' + Date.now(),
    qtNo,
    qtDate,
    qtValid,
    clientName,
    projectTitle,
    clientPhone,
    clientEmail,
    items,
    subtotal,
    discount,
    total,
    payMode,
    deposit,
    balance,
    duration,
    notes,
    createdAt: new Date().toISOString()
  };

  renderQuotationDocument(currentQtData);
  saveQuotationToHistory(currentQtData);
};

function renderQuotationDocument(qtData) {
  // Populate A4 Document
  document.getElementById('a4-no').innerText = qtData.qtNo;

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  document.getElementById('a4-date').innerText = formatDateStr(qtData.qtDate);
  document.getElementById('a4-valid-until').innerText = formatDateStr(qtData.qtValid);
  document.getElementById('a4-client-name').innerText = qtData.clientName;
  document.getElementById('a4-project-title').innerText = qtData.projectTitle;
  document.getElementById('a4-client-phone').innerText = qtData.clientPhone || '-';
  document.getElementById('a4-client-email').innerText = qtData.clientEmail || '-';
  document.getElementById('a4-sig-client').innerText = qtData.clientName;

  // Render Table Items
  const tbody = document.getElementById('a4-items-tbody');
  tbody.innerHTML = '';

  qtData.items.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: center; font-weight: 700; color: #555;">${index + 1}</td>
      <td><strong style="color: #000; font-size: 13px;">${escapeHtml(item.title)}</strong></td>
      <td style="font-size: 11.5px; color: #444; line-height: 1.5;">${escapeHtml(item.desc)}</td>
      <td style="text-align: right; font-weight: 700; color: #000;">RM ${item.price.toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });

  // Render Totals
  document.getElementById('a4-subtotal').innerText = `RM ${qtData.subtotal.toLocaleString()}`;
  
  const discountRow = document.getElementById('a4-discount-row');
  if (qtData.discount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('a4-discount').innerText = `-RM ${qtData.discount.toLocaleString()}`;
  } else {
    discountRow.style.display = 'none';
  }

  document.getElementById('a4-grand-total').innerText = `RM ${qtData.total.toLocaleString()}`;
  
  if (qtData.payMode === 'deposit') {
    document.getElementById('a4-deposit-amount').innerText = `RM ${qtData.deposit.toLocaleString()}`;
    document.getElementById('a4-balance-amount').innerText = `RM ${qtData.balance.toLocaleString()}`;
  } else {
    document.getElementById('a4-deposit-amount').innerText = `RM ${qtData.total.toLocaleString()} (100% Lunas)`;
    document.getElementById('a4-balance-amount').innerText = `RM 0`;
  }

  document.getElementById('a4-duration').innerText = qtData.duration || '5 - 7 Hari Bekerja';

  // Terms list
  const termsList = document.getElementById('a4-terms-list');
  termsList.innerHTML = `
    <li>Tempoh Siap Projek: <strong>${escapeHtml(qtData.duration)}</strong>.</li>
    <li>Pembangunan dimulakan serta-merta selepas bayaran deposit disahkan.</li>
  `;
  if (qtData.notes) {
    const noteLines = qtData.notes.split('\n');
    noteLines.forEach(line => {
      if (line.trim()) {
        const li = document.createElement('li');
        li.innerText = line.trim();
        termsList.appendChild(li);
      }
    });
  }

  // Show Preview Wrapper
  const wrapper = document.getElementById('quotation-preview-wrapper');
  if (wrapper) {
    wrapper.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

window.closeQuotationPreview = function() {
  const wrapper = document.getElementById('quotation-preview-wrapper');
  if (wrapper) wrapper.style.display = 'none';
};

window.sendQtToWhatsapp = function() {
  if (!currentQtData) return;
  const phone = currentQtData.clientPhone.replace(/\D/g, '');
  if (!phone) {
    alert('No. WhatsApp klien tidak sah.');
    return;
  }

  const msg = `Salam & Selamat Sejahtera *${currentQtData.clientName}* 👋,\n\n` +
              `Berikut adalah *Sebut Harga Rasmi (Quotation)* bagi projek *${currentQtData.projectTitle}* dari Kwikezee Studio:\n\n` +
              `📄 *No. Quotation*: ${currentQtData.qtNo}\n` +
              `💰 *Jumlah Skop Kerja*: RM${currentQtData.total.toLocaleString()}\n` +
              `⚡ *Deposit 50%*: RM${currentQtData.deposit.toLocaleString()}\n` +
              `⏳ *Baki 50%*: RM${currentQtData.balance.toLocaleString()} (Selepas Siap)\n` +
              `⏱️ *Anggaran Siap*: ${currentQtData.duration}\n\n` +
              `💳 *Portal Bayaran Deposit*: https://binawebsitemurah-by.zaimrosli.my/bayar\n\n` +
              `Sila maklumkan sekiranya Tuan/Puan ada sebarang pertanyaan. Terima kasih!`;

  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
};

/* ==========================================================================
   QUOTATION HISTORY (LOCALSTORAGE ARCHIVE)
   ========================================================================== */
function saveQuotationToHistory(qtData) {
  let history = JSON.parse(localStorage.getItem('kwikezee_quotations_history') || '[]');
  const existingIdx = history.findIndex(q => q.qtNo === qtData.qtNo);
  if (existingIdx >= 0) {
    history[existingIdx] = qtData;
  } else {
    history.unshift(qtData);
  }
  localStorage.setItem('kwikezee_quotations_history', JSON.stringify(history));
  updateHistoryCountBadge();
}

function updateHistoryCountBadge() {
  const history = JSON.parse(localStorage.getItem('kwikezee_quotations_history') || '[]');
  const countEl = document.getElementById('history-count');
  if (countEl) countEl.innerText = history.length;
}

function renderQuotationHistory() {
  const history = JSON.parse(localStorage.getItem('kwikezee_quotations_history') || '[]');
  const container = document.getElementById('quotation-history-list');
  if (!container) return;

  if (history.length === 0) {
    container.innerHTML = `
      <div class="no-submissions">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <h3 style="color:#FFFFFF;">Tiada Sebut Harga Disimpan</h3>
        <p style="color:#A1A1AA;">Sebut harga yang dijana akan disimpan secara automatik di sini.</p>
      </div>
    `;
    return;
  }

  let html = `<div class="history-grid">`;
  history.forEach((qt, idx) => {
    const createdDate = new Date(qt.createdAt).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' });
    html += `
      <div class="history-item-card">
        <div class="hic-header">
          <span class="hic-badge">${qt.qtNo}</span>
          <span class="hic-date">${createdDate}</span>
        </div>
        <h3 class="hic-title">${escapeHtml(qt.clientName)}</h3>
        <p class="hic-sub">${escapeHtml(qt.projectTitle)}</p>
        <div class="hic-price-row">
          <span>Jumlah: <strong style="color: var(--gold-secondary);">RM ${qt.total.toLocaleString()}</strong></span>
          <span>Deposit 50%: <strong style="color: #10b981;">RM ${qt.deposit.toLocaleString()}</strong></span>
        </div>
        <div class="hic-actions">
          <button class="btn btn-sm btn-primary" onclick="viewHistoryQt(${idx})">📄 Lihat / Cetak</button>
          <button class="btn btn-sm btn-emerald" onclick="waHistoryQt(${idx})">💬 WhatsApp</button>
          <button class="btn btn-sm btn-outline" onclick="deleteHistoryQt(${idx})" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">🗑️</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

window.viewHistoryQt = function(index) {
  const history = JSON.parse(localStorage.getItem('kwikezee_quotations_history') || '[]');
  if (history[index]) {
    currentQtData = history[index];
    renderQuotationDocument(currentQtData);
  }
};

window.waHistoryQt = function(index) {
  const history = JSON.parse(localStorage.getItem('kwikezee_quotations_history') || '[]');
  if (history[index]) {
    currentQtData = history[index];
    sendQtToWhatsapp();
  }
};

window.deleteHistoryQt = function(index) {
  if (!confirm('Adakah anda pasti untuk memadam sebut harga ini dari arkib?')) return;
  let history = JSON.parse(localStorage.getItem('kwikezee_quotations_history') || '[]');
  history.splice(index, 1);
  localStorage.setItem('kwikezee_quotations_history', JSON.stringify(history));
  renderQuotationHistory();
  updateHistoryCountBadge();
};

window.clearAllQuotationsHistory = function() {
  if (!confirm('Adakah anda pasti untuk memadam SEMUA arkib sebut harga?')) return;
  localStorage.removeItem('kwikezee_quotations_history');
  renderQuotationHistory();
  updateHistoryCountBadge();
};

// Initialize Quotation Builder on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initQuotationForm();
});
