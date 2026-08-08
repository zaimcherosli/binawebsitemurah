document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

let adminToken = '';

// ============================================================
// CLOUDFLARE D1 API CONFIG
// ============================================================
const API_BASE = 'https://api-qt.zaimrosli.my';

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
    if (gateway) gateway.style.setProperty('display', 'none', 'important');
    loadSubmissions();
    renderQuotationHistory();
    updateHistoryCountBadge();
  }

  // Pengesahan Passcode
  if (passcodeForm) {
    passcodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputVal = passcodeInput ? passcodeInput.value.trim() : '';
      
      adminToken = inputVal || 'kwikezee2026';
      localStorage.setItem('kwikezee_admin_token', adminToken);
      if (gateway) gateway.style.setProperty('display', 'none', 'important');
      
      loadSubmissions();
      renderQuotationHistory();
      updateHistoryCountBadge();
    });
  }

  // Log keluar (desktop + mobile)
  const logoutAction = () => {
    localStorage.removeItem('kwikezee_admin_token');
    adminToken = '';
    gateway.style.display = 'flex';
    document.getElementById('submissions-list').innerHTML = '';
  };
  btnLogout.addEventListener('click', logoutAction);
  const btnLogoutM = document.getElementById('btn-logout-m');
  if (btnLogoutM) btnLogoutM.addEventListener('click', logoutAction);

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
   MUAT TURUN DAN PAPAR SENARAI SUBMISSIONS (CLOUDFLARE D1)
   ========================================================================== */
let _submissionsCache = [];

function loadSubmissions(callback) {
  const container = document.getElementById('submissions-list');
  const loader = document.getElementById('admin-loader');

  if (loader) loader.style.display = 'block';

  fetch(`${API_BASE}/api/submissions`)
  .then(res => res.json())
  .then(json => {
    if (json.success) {
      _submissionsCache = json.data || [];
      renderSubmissions(_submissionsCache);
      if (callback) callback(true);
    } else {
      throw new Error(json.message || 'Gagal memuat permohonan');
    }
  })
  .catch(err => {
    console.error(err);
    if (container) {
      container.innerHTML = `
        <div class="no-submissions" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 20px; min-height: 320px; width: 100%; box-sizing: border-box; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="1.5" style="margin: 0 auto 16px auto; display: block;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <h3 style="color: #0F172A !important; font-size: 19px; font-weight: 800; margin: 0 0 8px 0; text-align: center;">Tiada Permohonan Klien Lagi</h3>
          <p style="color: #64748B !important; font-size: 14px; font-weight: 600; margin: 0; text-align: center; max-width: 440px; line-height: 1.5;">Borang permohonan baru dari klien di brief.html akan dipaparkan di sini secara automatik.</p>
        </div>
      `;
    }
  });
}

function renderSubmissions(submissions) {
  const container = document.getElementById('submissions-list');
  if (!container) return;
  container.innerHTML = '';

  if (!submissions || submissions.length === 0) {
    container.innerHTML = `
      <div class="no-submissions" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 20px; min-height: 320px; width: 100%; box-sizing: border-box; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="1.5" style="margin: 0 auto 16px auto; display: block;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <h3 style="color: #0F172A !important; font-size: 19px; font-weight: 800; margin: 0 0 8px 0; text-align: center;">Tiada Permohonan Klien Lagi</h3>
        <p style="color: #64748B !important; font-size: 14px; font-weight: 600; margin: 0; text-align: center; max-width: 440px; line-height: 1.5;">Borang permohonan baru dari klien di brief.html akan dipaparkan di sini secara automatik.</p>
      </div>
    `;
    return;
  }

  submissions.forEach(sub => {
    const formattedDate = new Date(sub.created_at || Date.now()).toLocaleString('ms-MY', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const item = document.createElement('div');
    item.className = 'submission-item';
    item.style.cssText = 'background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);';
    item.id = `sub-${sub.id}`;

    const waNumber = (sub.phone || '').replace(/\D/g, '');
    const waUrl = `https://wa.me/${waNumber.startsWith('0') ? '60' + waNumber.slice(1) : waNumber}`;

    item.innerHTML = `
      <div class="submission-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
        <div class="sub-client-info">
          <h3 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 800; color: #0f172a;">${escapeHtml(sub.company_name || 'Klien Baru')}</h3>
          <span class="sub-date" style="font-size: 12.5px; color: #64748b; font-weight: 600;">📅 Dihantar pada: ${formattedDate}</span>
        </div>
        <div class="submission-actions" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <button type="button" class="btn-create-qt-from-sub" onclick="convertSubToQt(${sub.id})" style="background: #FEF3C7; border: 1.5px solid #F59E0B; color: #92400E; font-weight: 800; font-size: 12.5px; padding: 6px 14px; border-radius: 20px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            ⚡ Bina Sebut Harga
          </button>
          <a href="${waUrl}" target="_blank" class="action-btn wa-btn" style="background: #25D366; color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 12.5px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
            📱 WhatsApp
          </a>
          <button class="action-btn delete-btn" onclick="deleteSubmission(${sub.id})" style="background: #fee2e2; border: 1px solid #fca5a5; color: #dc2626; padding: 6px 12px; border-radius: 20px; font-size: 12.5px; font-weight: 700; cursor: pointer;">
            🗑️ Padam
          </button>
        </div>
      </div>
      <div class="submission-body">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <div>
            <div style="margin-bottom: 10px;"><strong>Nama Individu:</strong> ${escapeHtml(sub.person_in_charge || '-')}</div>
            <div style="margin-bottom: 10px;"><strong>No. WhatsApp:</strong> ${escapeHtml(sub.phone || '-')}</div>
            <div style="margin-bottom: 10px;"><strong>Alamat Emel:</strong> ${escapeHtml(sub.email || '-')}</div>
            <div style="margin-bottom: 10px;"><strong>Jenis Perniagaan:</strong> ${escapeHtml(sub.business_type || '-')}</div>
            <div style="margin-bottom: 10px;"><strong>Pilihan Pakej:</strong> ${escapeHtml(sub.package_choice || '-')}</div>
          </div>
          <div>
            <div style="margin-bottom: 10px;"><strong>Anggaran Bajet:</strong> ${escapeHtml(sub.budget || '-')}</div>
            <div style="margin-bottom: 10px;"><strong>Objektif Website:</strong> ${escapeHtml(sub.website_goal || '-')}</div>
            <div style="margin-bottom: 10px;"><strong>Rujukan Website:</strong> ${escapeHtml(sub.reference_web || '-')}</div>
            <div style="margin-bottom: 10px;"><strong>Warna Tema Pilihan:</strong> ${escapeHtml(sub.color_theme || '-')}</div>
            <div style="margin-bottom: 10px;"><strong>Fungsi Pilihan:</strong> ${(sub.features || []).join(', ') || '-'}</div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

window.convertSubToQt = function(id) {
  const sub = (_submissionsCache || []).find(s => s.id == id);
  if (!sub) return;

  document.getElementById('qt-client-name').value = sub.company_name || sub.person_in_charge || '';
  document.getElementById('qt-project-title').value = `Pakej Website — ${sub.company_name || sub.business_type || 'Custom'}`;
  document.getElementById('qt-client-phone').value = sub.phone || '';
  document.getElementById('qt-client-email').value = sub.email || '';

  generateNextQtNo();
  switchAdminTab('quotation');
};

window.deleteSubmission = async function(id) {
  if (!confirm('Adakah anda pasti ingin memadam permohonan ini?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/submissions/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      loadSubmissions();
    } else {
      alert(json.message || 'Gagal memadam');
    }
  } catch (e) { console.error(e); }
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

window.loadAbgWanPreset = function() {
  const today = new Date();
  const validUntil = new Date();
  validUntil.setDate(today.getDate() + 7); // 7 Hari dari hari ini

  const qtNoEl = document.getElementById('qt-no');
  if (qtNoEl && !qtNoEl.value.trim()) {
    autoGenerateQtNo();
  }

  const clientNameEl = document.getElementById('qt-client-name');
  const projectTitleEl = document.getElementById('qt-project-title');
  const phoneEl = document.getElementById('qt-client-phone');
  const dateEl = document.getElementById('qt-date');
  const validEl = document.getElementById('qt-valid-until');
  const durationEl = document.getElementById('qt-duration');
  const discountEl = document.getElementById('qt-discount');

  if (clientNameEl) clientNameEl.value = "Abg Wan (Ejen Hartanah)";
  if (projectTitleEl) projectTitleEl.value = "Website Ejen Hartanah — Listing Komersial & Industrial";
  if (phoneEl && !phoneEl.value) phoneEl.value = "019-XXXXXXX";
  if (dateEl) dateEl.value = today.toISOString().split('T')[0];
  if (validEl) validEl.value = validUntil.toISOString().split('T')[0];
  if (durationEl) durationEl.value = "5 - 7 Hari Bekerja";
  if (discountEl) discountEl.value = "0";

  // Kosongkan senarai skop lama
  const itemsContainer = document.getElementById('quotation-items-list');
  if (itemsContainer) itemsContainer.innerHTML = '';
  qbItemCounter = 0;

  // Tambah Skop Hartanah Abg Wan
  addQuotationScopeItem(
    "Reka Bentuk Laman Web Ejen Hartanah (Custom UI/UX)",
    "Pembangunan 5 Halaman Laman Web bertema profesional mewah khas untuk pameran hartanah Komersial (Lot Kedai/Pejabat) & Industrial (Kilang/Gudang/Tanah).",
    490
  );
  addQuotationScopeItem(
    "Sistem Listing Hartanah Komersial & Industrial",
    "Modul carian & penapis hartanah mengikut jenis (Komersial / Industrial), kawasan liputan, saiz keluasan (sqft), & julat harga.",
    250
  );
  addQuotationScopeItem(
    "Portal Log Masuk & Panel Pengurusan Kendiri Ejen",
    "Portal login khas ejen untuk Abg Wan menambah, mengemas kini, edit, atau memadam listing hartanah secara kendiri tanpa perlukan pereka web.",
    300
  );
  addQuotationScopeItem(
    "Borang Pertanyaan & Integrasi WhatsApp Direct",
    "Pautan pantas WhatsApp direct pada setiap listing hartanah & borang pertanyaan prospek terus ke telefon bimbit Abg Wan.",
    150
  );
  addQuotationScopeItem(
    "Penyediaan Domain .my / .com & Web Hosting 1 Tahun",
    "Pendaftaran domain rasmi dan penyediaan cloud hosting berprestasi tinggi selama 1 tahun (Percuma Tahun Pertama).",
    0
  );

  updateQtFormTotals();
  alert('Templat Sebut Harga Abg Wan (Ejen Hartanah) telah diisi secara automatik!');
};

window.loadEnFarisPreset = function() {
  generateNextQtNo();
  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 14);

  const dateInput = document.getElementById('qt-date');
  const validUntilInput = document.getElementById('qt-valid-until');
  if (dateInput) dateInput.value = today.toISOString().split('T')[0];
  if (validUntilInput) validUntilInput.value = validUntil.toISOString().split('T')[0];

  document.getElementById('qt-client-name').value = 'En Faris';
  document.getElementById('qt-project-title').value = 'Social Media Management Package (1 Month)';
  document.getElementById('qt-client-phone').value = '0102030990';
  document.getElementById('qt-client-email').value = 'kwikezeeresources@gmail.com';

  const itemsContainer = document.getElementById('quotation-items-list');
  if (itemsContainer) itemsContainer.innerHTML = '';
  qbItemCounter = 0;

  addQuotationScopeItem(
    "Social Media Management Package (1 Month)",
    "• Management of Facebook, Instagram & Threads accounts\n• 3 posts daily for each platform (Facebook, Instagram & Threads)\n• Content creation & post scheduling\n• Additional graphic/picture creation\n• Sample AI video production",
    1000
  );

  const discountEl = document.getElementById('qt-discount');
  const payModeEl = document.getElementById('qt-pay-mode');
  const durationEl = document.getElementById('qt-duration');
  const notesEl = document.getElementById('qt-notes');

  if (discountEl) discountEl.value = '0';
  if (payModeEl) payModeEl.value = 'full';
  if (durationEl) durationEl.value = '1 Bulan (Bulanan)';
  if (notesEl) notesEl.value =
    "1. Pakej pengurusan akaun merangkumi platform Facebook, Instagram & Threads.\n" +
    "2. 3 siaran (posts) harian disiarkan bagi setiap platform.\n" +
    "3. Reka bentuk grafik & hasil video AI disediakan sepanjang tempoh 1 bulan.";

  updateQtFormTotals();
  alert('⚡ Sebut Harga En Faris (Social Media Management - RM 1,000) telah diisi secara automatik!');
};

window.generateNextQtNo = function(customPrefix) {
  const docTypeEl = document.getElementById('doc-type');
  const docType = docTypeEl ? docTypeEl.value : 'QT';
  
  let prefix = 'KZ-QT';
  if (customPrefix) {
    prefix = customPrefix;
  } else if (docType === 'INV') {
    prefix = 'KZ-INV';
  }

  const currentYear = new Date().getFullYear();
  let list = _qtHistoryCache || [];
  if (!list.length) {
    try {
      list = JSON.parse(localStorage.getItem('kwikezee_qt_history') || '[]');
    } catch (e) { list = []; }
  }

  const matching = list.filter(q => (q.qt_no || q.qtNo || '').startsWith(prefix));
  const nextNum = matching.length + 1;
  const newNo = `${prefix}-${currentYear}-${String(nextNum).padStart(3, '0')}`;

  const qtNoEl = document.getElementById('qt-no');
  if (qtNoEl) {
    qtNoEl.value = newNo;
  }
  return newNo;
};

window.handleDocTypeChange = function() {
  const docTypeEl = document.getElementById('doc-type');
  const docType = docTypeEl ? docTypeEl.value : 'QT';
  const lbl = document.getElementById('lbl-doc-no');
  const input = document.getElementById('qt-no');
  const btnSubmit = document.getElementById('btn-submit-generate');

  if (docType === 'INV') {
    if (lbl) lbl.innerText = 'No. Invois';
    if (input) input.placeholder = 'KZ-INV-2026-001';
    if (btnSubmit) btnSubmit.innerHTML = '✨ Jana Pratonton Invois Rasmi (Invoice)';
    generateNextQtNo('KZ-INV');
  } else {
    if (lbl) lbl.innerText = 'No. Sebut Harga';
    if (input) input.placeholder = 'KZ-QT-2026-001';
    if (btnSubmit) btnSubmit.innerHTML = '✨ Jana Pratonton Sebut Harga (Quotation)';
    generateNextQtNo('KZ-QT');
  }
};

window.autoGenerateQtNo = window.generateNextQtNo;

window.makeDocRevision = function() {
  const qtNoEl = document.getElementById('qt-no');
  if (!qtNoEl || !qtNoEl.value.trim()) return;

  let currentNo = qtNoEl.value.trim();
  
  const revMatch = currentNo.match(/^(.*?)-R(\d+)$/i);
  if (revMatch) {
    const base = revMatch[1];
    const revNum = parseInt(revMatch[2], 10) + 1;
    qtNoEl.value = `${base}-R${revNum}`;
  } else {
    qtNoEl.value = `${currentNo}-R1`;
  }

  qtNoEl.style.background = '#FFFBEB';
  qtNoEl.style.borderColor = '#FCD34D';
  qtNoEl.style.fontWeight = '800';
  qtNoEl.style.color = '#B45309';
};

window.convertQtToInvoice = function(idxOrNo) {
  let qt = null;
  if (typeof idxOrNo === 'number') {
    qt = _qtHistoryCache[idxOrNo];
  } else {
    qt = (_qtHistoryCache || []).find(q => (q.qt_no || q.qtNo) === idxOrNo);
  }

  if (!qt && typeof idxOrNo === 'string') {
    const local = JSON.parse(localStorage.getItem('kwikezee_qt_history') || '[]');
    qt = local.find(q => (q.qt_no || q.qtNo) === idxOrNo);
  }

  if (!qt) {
    alert('Sebut harga tidak dijumpai.');
    return;
  }

  // Gard: Jangan buat INV daripada dokumen yang dah jadi INV
  const existingNo = qt.qt_no || qt.qtNo || '';
  if (existingNo.startsWith('KZ-INV')) {
    alert('❌ Dokumen ini sudah pun Invois Rasmi (' + existingNo + ').\n\nHanya Sebut Harga (QT) boleh ditukar ke Invois.');
    return;
  }

  const qtData = normalizeQtFromApi(qt);
  const originalQtNo = qt.qt_no || qt.qtNo || qtData.qtNo || '';

  // Switch docType to INV & update form UI
  const docTypeEl = document.getElementById('doc-type');
  if (docTypeEl) docTypeEl.value = 'INV';
  
  handleDocTypeChange(); // Sets label, placeholder, submit button text AND generates KZ-INV-2026-xxx

  const newInvNo = document.getElementById('qt-no') ? document.getElementById('qt-no').value : 'KZ-INV-2026-001';

  // Automatik salin No. Sebut Harga asal masuk ke petak No. Rujukan QT
  const qtRefInput = document.getElementById('qt-ref-no');
  if (qtRefInput) {
    qtRefInput.value = originalQtNo;
    qtRefInput.style.background = '#ECFDF5';
    qtRefInput.style.borderColor = '#A7F3D0';
    qtRefInput.style.fontWeight = '800';
    qtRefInput.style.color = '#047857';
  }

  const clientNameEl = document.getElementById('qt-client-name');
  const projectTitleEl = document.getElementById('qt-project-title');
  const phoneEl = document.getElementById('qt-client-phone');
  const emailEl = document.getElementById('qt-client-email');

  if (clientNameEl) clientNameEl.value = qtData.clientName || '';
  if (projectTitleEl) projectTitleEl.value = qtData.projectTitle || '';
  if (phoneEl) phoneEl.value = qtData.clientPhone || '';
  if (emailEl) emailEl.value = qtData.clientEmail || '';

  const itemsContainer = document.getElementById('quotation-items-list');
  if (itemsContainer) itemsContainer.innerHTML = '';
  qbItemCounter = 0;

  const items = qtData.items || [];
  if (items.length > 0) {
    items.forEach(it => {
      addQuotationScopeItem(it.title || it.name || '', it.desc || '', it.price || 0);
    });
  } else {
    addQuotationScopeItem('Skop Kerja Utama', '', 0);
  }

  const discountEl = document.getElementById('qt-discount');
  const payModeEl = document.getElementById('qt-pay-mode');
  const durationEl = document.getElementById('qt-duration');
  const notesEl = document.getElementById('qt-notes');

  if (discountEl) discountEl.value = qtData.discount || 0;
  if (payModeEl) payModeEl.value = 'full';
  if (durationEl) durationEl.value = qtData.duration || 'Serta-merta / Upon Receipt';
  if (notesEl) notesEl.value =
    "1. Pembayaran hendaklah dibuat secara penuh mengikut invois ini.\n" +
    "2. Sila kemukakan resit pembayaran melalui WhatsApp / Emel.";

  updateQtFormTotals();
  switchAdminTab('quotation');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  alert(`⚡ Sebut Harga (${originalQtNo}) telah sedia ditukar ke Invois Rasmi (${newInvNo})!\n\nNo. Rujukan QT (${originalQtNo}) telah disalin secara automatik.\nTekan 'Jana Pratonton Invois Rasmi' di bawah untuk simpan dokumen ini.`);
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
  const balance = total - deposit;

  const subtotalEl = document.getElementById('qb-summary-subtotal');
  const totalEl = document.getElementById('qb-summary-total');
  const depositEl = document.getElementById('qb-summary-deposit');
  const balanceEl = document.getElementById('qb-summary-balance');

  if (subtotalEl) subtotalEl.innerText = `RM ${subtotal.toLocaleString()}`;
  if (totalEl) totalEl.innerText = `RM ${total.toLocaleString()}`;
  if (depositEl) depositEl.innerText = `RM ${deposit.toLocaleString()}`;
  if (balanceEl) balanceEl.innerText = `RM ${balance.toLocaleString()}`;
};

window.generateQuotationDocument = async function(event) {
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

  const docTypeEl = document.getElementById('doc-type');
  const docType = docTypeEl ? docTypeEl.value : (qtNo.includes('INV') ? 'INV' : 'QT');
  const refNoInput = document.getElementById('qt-ref-no');
  const refNo = refNoInput ? refNoInput.value.trim() : '';

  currentQtData = {
    id: 'QT-' + Date.now(),
    docType,
    qtNo,
    refNo,
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
  await saveQuotationToHistory(currentQtData);
  updateHistoryCountBadge();

  // Papar Modal Preview Dokumen
  const wrapper = document.getElementById('quotation-preview-wrapper');
  if (wrapper) {
    wrapper.style.display = 'block';
    wrapper.style.zIndex = '999999';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function renderQuotationDocument(qtData) {
  if (!qtData) return;

  const setSafeText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val !== undefined && val !== null ? val : '-';
  };

  const isInvoice = qtData.docType === 'INV' || (qtData.qtNo || '').includes('INV');
  setSafeText('a4-no-label', isInvoice ? 'No. Invois:' : 'No. Quotation:');
  setSafeText('a4-no', qtData.qtNo);

  const refRow = document.getElementById('a4-ref-no-row');
  if (refRow) {
    if (qtData.refNo) {
      setSafeText('a4-ref-no', qtData.refNo);
      refRow.style.display = 'table-row';
    } else {
      refRow.style.display = 'none';
    }
  }

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  setSafeText('a4-date', formatDateStr(qtData.qtDate));
  setSafeText('a4-valid-until', formatDateStr(qtData.qtValid));
  setSafeText('a4-client-name', qtData.clientName);
  setSafeText('a4-project-title', qtData.projectTitle);
  setSafeText('a4-client-phone', qtData.clientPhone);
  setSafeText('a4-client-email', qtData.clientEmail);
  setSafeText('a4-sig-client', qtData.clientName);

  // Render Table Items
  const tbody = document.getElementById('a4-items-tbody');
  if (tbody) {
    tbody.innerHTML = '';
    const items = qtData.items || [];
    items.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center; vertical-align: top; font-weight: 700; color: #555; padding-top: 8px;">${index + 1}</td>
        <td style="vertical-align: top; padding-top: 8px;"><strong style="color: #000; font-size: 11.5px; line-height: 1.35; display: block;">${escapeHtml(item.title || '')}</strong></td>
        <td style="font-size: 10.5px; color: #334155; line-height: 1.6; vertical-align: top; white-space: pre-line !important; padding-top: 8px;">${escapeHtml(item.desc || '')}</td>
        <td style="text-align: center; vertical-align: top; font-weight: 800; color: #000; white-space: nowrap; padding-top: 8px;">RM ${(item.price || 0).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Render Totals
  const subtotal = qtData.subtotal || 0;
  const discount = qtData.discount || 0;
  const total = qtData.total || Math.max(0, subtotal - discount);
  const deposit = qtData.deposit || Math.round(total / 2);
  const balance = qtData.balance !== undefined ? qtData.balance : (total - deposit);

  setSafeText('a4-subtotal', `RM ${subtotal.toLocaleString()}`);

  const discountRow = document.getElementById('a4-discount-row');
  if (discountRow) {
    if (discount > 0) {
      discountRow.style.display = 'flex';
      setSafeText('a4-discount', `-RM ${discount.toLocaleString()}`);
    } else {
      discountRow.style.display = 'none';
    }
  }

  setSafeText('a4-grand-total', `RM ${total.toLocaleString()}`);

  if (qtData.payMode === 'full') {
    setSafeText('a4-deposit-label', 'JUMLAH BAYARAN PENUH (100%):');
    setSafeText('a4-deposit-amount', `RM ${total.toLocaleString()}`);
    setSafeText('a4-balance-amount', `RM 0`);
  } else {
    setSafeText('a4-deposit-label', 'DEPOSIT 50% (BAYAR SEKARANG):');
    setSafeText('a4-deposit-amount', `RM ${deposit.toLocaleString()}`);
    setSafeText('a4-balance-amount', `RM ${balance.toLocaleString()}`);
  }

  setSafeText('a4-duration', qtData.duration || '5 - 7 Hari Bekerja');
  setSafeText('a4-sig-client', qtData.clientName || 'Tandatangan Klien');

  const clientSigImg = document.getElementById('client-sig-img');
  const esigStatus = document.getElementById('esig-client-status');

  if (qtData.status === 'SIGNED' && (qtData.signedAt || qtData.signature_image || qtData.signatureImage)) {
    let dateStr = qtData.signedAt || qtData.signed_at || 'Disahkan';
    // Shorten long date strings e.g. "31 Jul 2026, 04:45 PTG" -> "31 Jul 2026"
    if (dateStr.includes(',')) dateStr = dateStr.split(',')[0].trim();
    setSafeText('a4-sig-date', dateStr);

    const sigSrc = qtData.signature_image || qtData.signatureImage;
    if (sigSrc && clientSigImg) {
      clientSigImg.src = sigSrc;
      clientSigImg.style.display = 'block';
    }
    if (esigStatus) {
      esigStatus.style.display = 'inline-flex';
    }
  } else {
    setSafeText('a4-sig-date', '_______________');
    if (clientSigImg) clientSigImg.style.display = 'none';
    if (esigStatus) esigStatus.style.display = 'none';
  }

  // Terms list
  const termsList = document.getElementById('a4-terms-list');
  if (termsList) {
    termsList.innerHTML = `
      <li>Tempoh Siap Projek: <strong>${escapeHtml(qtData.duration || '5 - 7 Hari Bekerja')}</strong>.</li>
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
  }

  // Show Preview Wrapper forcefully
  const wrapper = document.getElementById('quotation-preview-wrapper');
  if (wrapper) {
    wrapper.style.display = 'block';
    wrapper.style.zIndex = '999999';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

window.closeQuotationPreview = function() {
  const wrapper = document.getElementById('quotation-preview-wrapper');
  if (wrapper) wrapper.style.display = 'none';
};

window.sendQtToWhatsapp = function() {
  if (!currentQtData) return;
  let phone = (currentQtData.clientPhone || '').replace(/\D/g, '');

  if (!phone) {
    const entered = prompt(
      `📱 No. WhatsApp klien tiada dalam rekod.\n\nSila masukkan no. WhatsApp klien (contoh: 0123456789):`,
      ''
    );
    if (!entered) return;
    phone = entered.replace(/\D/g, '');
    if (!phone) {
      alert('No. WhatsApp tidak sah. Sila masukkan nombor yang betul.');
      return;
    }
  }

  if (phone.startsWith('0')) phone = '60' + phone.slice(1);

  const isInvoice = (currentQtData.docType === 'INV') || (currentQtData.qtNo || '').includes('INV');
  const isFullPayment = currentQtData.payMode === 'full';
  const docTypeName = isInvoice ? 'Invois Rasmi (Invoice)' : 'Sebut Harga Rasmi (Quotation)';
  const docNoLabel = isInvoice ? 'No. Invois' : 'No. Quotation';
  
  const portalUrl = isInvoice ? 
    `https://binawebsitemurah-by.zaimrosli.my/invoice.html?inv=${encodeURIComponent(currentQtData.qtNo || '001')}` :
    `https://binawebsitemurah-by.zaimrosli.my/quotation.html?qt=${encodeURIComponent(currentQtData.qtNo || '001')}`;
  
  const actionText = isInvoice ? 'Semak & Bayar Invois Rasmi' : 'Semak & Tandatangan Digital (E-Signature)';

  const depositVal = (currentQtData.deposit || Math.round((currentQtData.total || 0) / 2)).toLocaleString();
  const balanceVal = (currentQtData.balance !== undefined ? currentQtData.balance : ((currentQtData.total || 0) - (currentQtData.deposit || 0))).toLocaleString();

  let paymentLines = '';
  if (isFullPayment) {
    paymentLines = `💰 *Jumlah Bayaran Penuh*: RM${(currentQtData.total || 0).toLocaleString()} (100% Dibayar)\n`;
  } else {
    paymentLines = `💰 *Jumlah Skop Kerja*: RM${(currentQtData.total || 0).toLocaleString()}\n` +
                   `⚡ *Deposit 50%*: RM${depositVal}\n` +
                   `⏳ *Baki 50%*: RM${balanceVal} (Selepas Siap)\n`;
  }

  let msg = `Salam & Selamat Sejahtera *${currentQtData.clientName}* 👋,\n\n` +
            `Berikut adalah *${docTypeName}* bagi projek *${currentQtData.projectTitle}* dari Kwikezee Studio:\n\n` +
            `📄 *${docNoLabel}*: ${currentQtData.qtNo}\n` +
            `${paymentLines}` +
            `🕒 *Anggaran Siap / Tempoh*: ${currentQtData.duration}\n\n` +
            `📝 *${actionText}*:\n` +
            `${portalUrl}\n\n` +
            `Sila maklumkan sekiranya Tuan/Puan ada sebarang pertanyaan. Terima kasih!`;

  msg = msg.replace(/\uFE0F/g, '');

  const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
};


/* ==========================================================================
   QUOTATION HISTORY — CLOUDFLARE D1 API (SYNC SEMUA PERANTI)
   ========================================================================== */

// Cache senarai QT dalam memory supaya viewHistoryQt(idx) boleh rujuk
let _qtHistoryCache = [];

async function saveQuotationToHistory(qtData) {
  const todayStr = qtData.qtDate || new Date().toISOString().split('T')[0];
  const validStr = qtData.qtValid || '';

  // Save to LocalStorage as offline fallback
  try {
    let localHistory = JSON.parse(localStorage.getItem('kwikezee_qt_history') || '[]');
    const existingIdx = localHistory.findIndex(q => (q.qt_no || q.qtNo) === qtData.qtNo);
    const localItem = {
      qt_no: qtData.qtNo,
      qt_date: todayStr,
      qt_valid: validStr,
      client_name: qtData.clientName,
      project_title: qtData.projectTitle,
      client_phone: qtData.clientPhone,
      client_email: qtData.clientEmail,
      items: qtData.items || [],
      items_json: JSON.stringify(qtData.items || []),
      subtotal: qtData.subtotal || 0,
      discount: qtData.discount || 0,
      total: qtData.total || 0,
      deposit: qtData.deposit || 0,
      balance: qtData.balance || 0,
      pay_mode: qtData.payMode || 'deposit',
      duration: qtData.duration || '5 - 7 Hari Bekerja',
      notes: qtData.notes || '',
      created_at: new Date().toISOString()
    };
    if (existingIdx >= 0) {
      localHistory[existingIdx] = { ...localHistory[existingIdx], ...localItem };
    } else {
      localHistory.unshift(localItem);
    }
    localStorage.setItem('kwikezee_qt_history', JSON.stringify(localHistory));
  } catch (e) { console.error('LocalStorage save error:', e); }

  try {
    const payload = {
      qt_no:         qtData.qtNo,
      qt_date:       todayStr,
      qt_valid:      validStr,
      client_name:   qtData.clientName,
      client_phone:  qtData.clientPhone || '',
      client_email:  qtData.clientEmail || '',
      project_title: qtData.projectTitle || '',
      items:         qtData.items || [],
      items_json:    JSON.stringify(qtData.items || []),
      subtotal:      qtData.subtotal || 0,
      discount:      qtData.discount || 0,
      total:         qtData.total || 0,
      deposit:       qtData.deposit || 0,
      balance:       qtData.balance || 0,
      pay_mode:      qtData.payMode || 'deposit',
      duration:      qtData.duration || '5 - 7 Hari Bekerja',
      notes:         qtData.notes || '',
    };

    // Cuba POST dulu — jika dah wujud (409), guna PUT untuk update
    let res = await fetch(`${API_BASE}/api/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      // Sebut harga dah wujud — update je
      res = await fetch(`${API_BASE}/api/quotations/${encodeURIComponent(qtData.qtNo)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const err = await res.json();
      console.error('Gagal simpan ke D1:', err);
    }

    await renderQuotationHistory();
    updateHistoryCountBadge();
  } catch (e) {
    console.error('API error semasa simpan QT:', e);
    await renderQuotationHistory();
    updateHistoryCountBadge();
  }
}

async function updateHistoryCountBadge() {
  try {
    const res = await fetch(`${API_BASE}/api/quotations`);
    const json = await res.json();
    const count = (json.data || []).length;
    const countEl = document.getElementById('history-count');
    const countElM = document.getElementById('history-count-m');
    if (countEl) countEl.innerText = count;
    if (countElM) countElM.innerText = count;
  } catch (e) {
    const localData = JSON.parse(localStorage.getItem('kwikezee_qt_history') || '[]');
    const count = localData.length;
    const countEl = document.getElementById('history-count');
    const countElM = document.getElementById('history-count-m');
    if (countEl) countEl.innerText = count;
    if (countElM) countElM.innerText = count;
  }
}

function renderHistoryItemsUI(history, container) {
  if (history.length === 0) {
    container.innerHTML = `
      <div class="no-submissions" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 20px; min-height: 320px; width: 100%; box-sizing: border-box; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="1.5" style="margin: 0 auto 16px auto; display: block;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <h3 style="color: #0F172A !important; font-size: 19px; font-weight: 800; margin: 0 0 8px 0; text-align: center;">Tiada Sebut Harga Disimpan</h3>
        <p style="color: #64748B !important; font-size: 14px; font-weight: 600; margin: 0; text-align: center; max-width: 440px; line-height: 1.5;">Sebut harga yang dijana akan disimpan secara automatik di sini.</p>
      </div>
    `;
    return;
  }

  let html = `<div class="history-grid">`;
  history.forEach((qt, idx) => {
    const createdDate = new Date(qt.created_at || Date.now()).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' });
    const totVal = (qt.total || 0).toLocaleString();
    const isFullPayment = (qt.pay_mode || qt.payMode || '') === 'full';
    const depVal = isFullPayment
      ? (qt.total || 0).toLocaleString()
      : (qt.deposit || Math.round((qt.total || 0) / 2)).toLocaleString();
    const isSigned = qt.status === 'SIGNED';
    const isInvoice = (qt.qt_no || '').startsWith('KZ-INV');
    const isPaid = qt.status === 'DIBAYAR' || qt.status === 'DIBAYAR (PAID)';

    html += `
      <div class="history-item-card" style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div>
          <!-- Header Row: Badges & Date grouped cleanly on left -->
          <div class="hic-header" style="display: flex; align-items: center; justify-content: flex-start; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
            <span class="hic-badge" style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; white-space: nowrap;">${qt.qt_no}</span>
            ${isPaid ? `<span style="font-size: 10.5px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 6px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> DIBAYAR</span>` : isSigned ? `<span style="font-size: 10.5px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 6px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> DITANDATANGANI</span>` : isInvoice ? `<span style="font-size: 10.5px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 3px 8px; border-radius: 6px; font-weight: 800; white-space: nowrap;">INVOIS</span>` : `<span style="font-size: 10.5px; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">DRAFT</span>`}
            <span class="hic-date" style="font-size: 11px; color: #64748b; font-weight: 600; white-space: nowrap; margin-left: 2px;">${createdDate}</span>
          </div>

          <h3 class="hic-title" style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">${escapeHtml(qt.client_name || 'Klien')}</h3>
          <p class="hic-sub" style="font-size: 12.5px; font-weight: 600; color: #475569; margin: 0 0 12px 0; line-height: 1.4;">${escapeHtml(qt.project_title || 'Projek Web')}</p>

          <div class="hic-price-row" style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; font-weight: 700; color: #0f172a;">
            <span>Jumlah: <strong style="color: #000000; font-weight: 900; font-size: 13px;">RM ${totVal}</strong></span>
            <span>${isFullPayment ? 'Bayaran Penuh' : 'Deposit 50%'}: <strong style="color: ${isFullPayment ? '#1d4ed8' : '#047857'}; font-weight: 900; font-size: 13px;">RM ${depVal}</strong></span>
          </div>
        </div>

        <div class="hic-actions" style="display: flex; gap: 0px; align-items: center; justify-content: flex-start; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
          <button class="btn-history-icon" onclick="viewHistoryQt(${idx})" title="Lihat Dokumen" style="width:32px!important;height:32px!important;min-width:32px!important;padding:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:8px!important;background:#FFFFFF!important;border:1.5px solid #CBD5E1!important;color:#000!important;cursor:pointer!important;flex-shrink:0!important;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button class="btn-history-icon" onclick="editHistoryQt(${idx})" title="Edit / Kemaskini" style="width:32px!important;height:32px!important;min-width:32px!important;padding:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:8px!important;background:#FFFFFF!important;border:1.5px solid #CBD5E1!important;color:#000!important;cursor:pointer!important;flex-shrink:0!important;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path><path d="M15 5l4 4"></path></svg>
          </button>
          <button class="btn-history-icon" onclick="duplicateHistoryQt(${idx})" title="Duplikasi Sebut Harga (Salin & Cipta Baru)" style="width:32px!important;height:32px!important;min-width:32px!important;padding:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:8px!important;background:#FFFFFF!important;border:1.5px solid #CBD5E1!important;color:#0F172A!important;cursor:pointer!important;flex-shrink:0!important;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="8" y="8" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
              <line x1="14.5" y1="11.5" x2="14.5" y2="17.5"></line>
              <line x1="11.5" y1="14.5" x2="17.5" y2="14.5"></line>
            </svg>
          </button>
          ${isInvoice
            ? `<a href="resit.html?rec=${encodeURIComponent(qt.qt_no)}&name=${encodeURIComponent(qt.client_name || '')}&amount=${qt.total || 0}&title=${encodeURIComponent(qt.project_title || '')}" target="_blank" class="btn-history-icon" title="Lihat Resit Rasmi" style="width:32px!important;height:32px!important;min-width:32px!important;padding:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:8px!important;background:#EFF6FF!important;border:1.5px solid #BFDBFE!important;color:#1D4ED8!important;cursor:pointer!important;flex-shrink:0!important;text-decoration:none!important;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="12" y1="17" x2="12" y2="11"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
              </a>`
            : `<button class="btn-history-icon" onclick="convertQtToInvoice(${idx})" title="Tukar Ke Invois Rasmi" style="width:32px!important;height:32px!important;min-width:32px!important;padding:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:8px!important;background:#ECFDF5!important;border:1.5px solid #A7F3D0!important;color:#047857!important;cursor:pointer!important;flex-shrink:0!important;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              </button>`
          }
          <button class="btn-history-icon" onclick="waHistoryQt(${idx})" title="Kongsi Ke WhatsApp" style="width:32px!important;height:32px!important;min-width:32px!important;padding:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:8px!important;background:#FFFFFF!important;border:1.5px solid #CBD5E1!important;cursor:pointer!important;flex-shrink:0!important;">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M16 2a13.9 13.9 0 0 0-11.8 21.2L2.3 29.7l6.7-1.8A13.9 13.9 0 1 0 16 2z" fill="#25D366"/><path d="M12.1 9.7c-.3-.7-.6-.7-.9-.7h-.7c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.3 3.3 1.4 3.5c.2.2 2.5 3.8 6.1 5.4.9.4 1.5.6 2 .8.9.3 1.7.2 2.3.1.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.1-.3-.2-.7-.4s-2.2-1.1-2.5-1.2c-.3-.2-.5-.2-.7.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.8 0s-1.7-.6-3.2-2c-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.4.6-.7.2-.2.2-.4.1-.7s-.6-1.5-.9-2.1z" fill="#FFF"/></svg>
          </button>
          <button class="btn-history-icon" onclick="deleteHistoryQt('${qt.qt_no}')" title="Padam" style="width:32px!important;height:32px!important;min-width:32px!important;padding:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:8px!important;background:#FFFFFF!important;border:1.5px solid #CBD5E1!important;color:#DC2626!important;cursor:pointer!important;flex-shrink:0!important;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

async function renderQuotationHistory() {
  const container = document.getElementById('quotation-history-list');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding: 40px; color: #A1A1AA;">⏳ Memuatkan arkib dari cloud...</div>`;

  let history = [];
  try {
    const res = await fetch(`${API_BASE}/api/quotations`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length >= 0) {
      history = json.data;
      _qtHistoryCache = history;
      try { localStorage.setItem('kwikezee_qt_history', JSON.stringify(history)); } catch (e) {}
    } else {
      throw new Error('API invalid response');
    }
  } catch (e) {
    console.warn('Gagal hubung cloud, menggunakan simpanan tempatan LocalStorage:', e);
    try {
      history = JSON.parse(localStorage.getItem('kwikezee_qt_history') || '[]');
    } catch (err) { history = []; }
    _qtHistoryCache = history;
  }

  renderHistoryItemsUI(history, container);
}

window.viewHistoryQt = async function(index) {
  let qt = _qtHistoryCache[index];
  if (!qt) return;

  // Ambil data penuh (termasuk items_json) dari API
  try {
    const res = await fetch(`${API_BASE}/api/quotations/${encodeURIComponent(qt.qt_no)}`);
    const json = await res.json();
    if (json.success) qt = json.data;
  } catch (e) { /* guna cache */ }

  // Normalize field names dari D1 (snake_case) ke format currentQtData (camelCase)
  currentQtData = normalizeQtFromApi(qt);
  renderQuotationDocument(currentQtData);

  // Papar Modal Preview Dokumen secara paksa
  const wrapper = document.getElementById('quotation-preview-wrapper');
  if (wrapper) {
    wrapper.style.display = 'block';
    wrapper.style.zIndex = '999999';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

window.editHistoryQt = async function(index) {
  let qt = _qtHistoryCache[index];
  if (!qt) return;

  try {
    const res = await fetch(`${API_BASE}/api/quotations/${encodeURIComponent(qt.qt_no)}`);
    const json = await res.json();
    if (json.success) qt = json.data;
  } catch (e) { /* guna cache */ }

  const qtData = normalizeQtFromApi(qt);

  switchAdminTab('quotation');

  // Set doc-type dropdown betul ikut jenis dokumen
  const docTypeEl = document.getElementById('doc-type');
  const isInv = (qtData.qtNo || '').startsWith('KZ-INV');
  if (docTypeEl) {
    docTypeEl.value = isInv ? 'INV' : 'QT';
    handleDocTypeChange();
  }

  if (document.getElementById('qt-no')) document.getElementById('qt-no').value = qtData.qtNo || '';
  if (document.getElementById('qt-date')) document.getElementById('qt-date').value = qtData.qtDate || '';
  if (document.getElementById('qt-valid-until')) document.getElementById('qt-valid-until').value = qtData.qtValid || '';
  if (document.getElementById('qt-client-name')) document.getElementById('qt-client-name').value = qtData.clientName || '';
  if (document.getElementById('qt-project-title')) document.getElementById('qt-project-title').value = qtData.projectTitle || '';
  if (document.getElementById('qt-client-phone')) document.getElementById('qt-client-phone').value = qtData.clientPhone || '';
  if (document.getElementById('qt-client-email')) document.getElementById('qt-client-email').value = qtData.clientEmail || '';
  if (document.getElementById('qt-duration')) document.getElementById('qt-duration').value = qtData.duration || '5 - 7 Hari Bekerja';
  if (document.getElementById('qt-discount')) document.getElementById('qt-discount').value = qtData.discount || 0;
  if (document.getElementById('qt-pay-mode')) document.getElementById('qt-pay-mode').value = qtData.payMode || 'deposit';
  if (document.getElementById('qt-notes')) document.getElementById('qt-notes').value = qtData.notes || '';

  const itemsContainer = document.getElementById('quotation-items-list');
  if (itemsContainer) itemsContainer.innerHTML = '';
  qbItemCounter = 0;

  const items = qtData.items || [];
  if (items.length > 0) {
    items.forEach(item => addQuotationScopeItem(item.title, item.desc, item.price));
  } else {
    addQuotationScopeItem('Skop Kerja Utama', '', 0);
  }

  updateQtFormTotals();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const docLabel = (qtData.qtNo || '').startsWith('KZ-INV') ? 'Invois Rasmi' : 'Sebut Harga';
  alert(`${docLabel} (${qtData.qtNo}) telah dimuatkan ke dalam borang. Anda boleh kemaskini & jana semula PDF!`);
};

window.duplicateHistoryQt = async function(index) {
  let qt = _qtHistoryCache[index];
  if (!qt) return;

  try {
    const res = await fetch(`${API_BASE}/api/quotations/${encodeURIComponent(qt.qt_no)}`);
    const json = await res.json();
    if (json.success) qt = json.data;
  } catch (e) { /* guna cache */ }

  const qtData = normalizeQtFromApi(qt);

  // Jana nombor quotation baru
  const currentYear = new Date().getFullYear();
  let nextNum = 1;
  try {
    const res = await fetch(`${API_BASE}/api/quotations`);
    const json = await res.json();
    const list = json.data || [];
    nextNum = list.length + 1;
  } catch (e) {
    const local = JSON.parse(localStorage.getItem('kwikezee_qt_history') || '[]');
    nextNum = local.length + 1;
  }
  const newQtNo = `KZ-QT-${currentYear}-${String(nextNum).padStart(3, '0')}`;

  const todayStr = new Date().toISOString().split('T')[0];
  const validDate = new Date();
  validDate.setDate(validDate.getDate() + 14);
  const validStr = validDate.toISOString().split('T')[0];

  // Bina objek sebut harga duplikasi baharu
  const duplicatedRecord = {
    qtNo: newQtNo,
    qtDate: todayStr,
    qtValid: validStr,
    clientName: qtData.clientName || '',
    projectTitle: qtData.projectTitle || '',
    clientPhone: qtData.clientPhone || '',
    clientEmail: qtData.clientEmail || '',
    duration: qtData.duration || '5 - 7 Hari Bekerja',
    discount: qtData.discount || 0,
    payMode: qtData.payMode || 'deposit',
    notes: qtData.notes || '',
    items: qtData.items || [],
    subtotal: qtData.subtotal || 0,
    total: qtData.total || 0,
    deposit: qtData.deposit || 0,
    balance: qtData.balance || 0,
    status: 'DRAFT',
    clientSignature: null,
    signedAt: null
  };

  // SIMPAN SECARA TERUS KE CLOUDFLARE D1 & LOCALSTORAGE
  await saveQtToD1(duplicatedRecord);
  updateHistoryCountBadge();

  // Switch ke Generator tab & isi borang
  switchAdminTab('quotation');

  if (document.getElementById('qt-no')) document.getElementById('qt-no').value = newQtNo;
  if (document.getElementById('qt-date')) document.getElementById('qt-date').value = todayStr;
  if (document.getElementById('qt-valid-until')) document.getElementById('qt-valid-until').value = validStr;

  if (document.getElementById('qt-client-name')) document.getElementById('qt-client-name').value = qtData.clientName || '';
  if (document.getElementById('qt-project-title')) document.getElementById('qt-project-title').value = qtData.projectTitle || '';
  if (document.getElementById('qt-client-phone')) document.getElementById('qt-client-phone').value = qtData.clientPhone || '';
  if (document.getElementById('qt-client-email')) document.getElementById('qt-client-email').value = qtData.clientEmail || '';
  if (document.getElementById('qt-duration')) document.getElementById('qt-duration').value = qtData.duration || '5 - 7 Hari Bekerja';
  if (document.getElementById('qt-discount')) document.getElementById('qt-discount').value = qtData.discount || 0;
  if (document.getElementById('qt-pay-mode')) document.getElementById('qt-pay-mode').value = qtData.payMode || 'deposit';
  if (document.getElementById('qt-notes')) document.getElementById('qt-notes').value = qtData.notes || '';

  const itemsContainer = document.getElementById('quotation-items-list');
  if (itemsContainer) itemsContainer.innerHTML = '';
  qbItemCounter = 0;

  const items = qtData.items || [];
  if (items.length > 0) {
    items.forEach(item => addQuotationScopeItem(item.title, item.desc, item.price));
  } else {
    addQuotationScopeItem('Skop Kerja Utama', '', 0);
  }

  updateQtFormTotals();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  alert(`✅ Sebut Harga baharu (${newQtNo}) telah berjaya diduplikasi & disimpan secara automatik ke Arkib Cloud!`);
};


window.waHistoryQt = async function(index) {
  let qt = _qtHistoryCache[index];
  if (!qt) return;
  currentQtData = normalizeQtFromApi(qt);
  sendQtToWhatsapp();
};

window.deleteHistoryQt = async function(qtNo) {
  if (!confirm('Adakah anda pasti untuk memadam sebut harga ini dari arkib?')) return;
  
  // Padam dari LocalStorage dulu
  try {
    let localHistory = JSON.parse(localStorage.getItem('kwikezee_qt_history') || '[]');
    localHistory = localHistory.filter(q => (q.qt_no || q.qtNo) !== qtNo);
    localStorage.setItem('kwikezee_qt_history', JSON.stringify(localHistory));
  } catch (e) {}

  try {
    await fetch(`${API_BASE}/api/quotations/${encodeURIComponent(qtNo)}`, { method: 'DELETE' });
  } catch (e) { console.warn('Cloud delete failed, local item deleted'); }

  renderQuotationHistory();
  updateHistoryCountBadge();
};

window.clearAllQuotationsHistory = async function() {
  if (!confirm('Adakah anda pasti untuk memadam SEMUA arkib sebut harga?')) return;
  
  try { localStorage.removeItem('kwikezee_qt_history'); } catch (e) {}

  try {
    const res = await fetch(`${API_BASE}/api/quotations`);
    const json = await res.json();
    const all = json.data || [];
    await Promise.all(all.map(q =>
      fetch(`${API_BASE}/api/quotations/${encodeURIComponent(q.qt_no)}`, { method: 'DELETE' })
    ));
  } catch (e) { console.warn('Cloud clear all failed, local items cleared'); }

  renderQuotationHistory();
  updateHistoryCountBadge();
};

// Helper: normalize D1 snake_case fields → camelCase untuk renderQuotationDocument()
function normalizeQtFromApi(qt) {
  let items = qt.items || [];
  if (typeof qt.items_json === 'string') {
    try { items = JSON.parse(qt.items_json); } catch { items = []; }
  }
  return {
    qtNo:         qt.qt_no         || qt.qtNo         || '',
    docType:      qt.doc_type      || qt.docType      || ((qt.qt_no || qt.qtNo || '').includes('INV') ? 'INV' : 'QT'),
    refNo:        qt.ref_no        || qt.refNo        || '',
    qtDate:       qt.qt_date       || qt.qtDate       || '',
    qtValid:      qt.qt_valid      || qt.qtValid      || '',
    clientName:   qt.client_name   || qt.clientName   || '',
    clientPhone:  qt.client_phone  || qt.clientPhone  || '',
    clientEmail:  qt.client_email  || qt.clientEmail  || '',
    projectTitle: qt.project_title || qt.projectTitle || '',
    items,
    subtotal:     qt.subtotal  || 0,
    discount:     qt.discount  || 0,
    total:        qt.total     || 0,
    deposit:      qt.deposit   || 0,
    balance:      qt.balance   || 0,
    payMode:      qt.pay_mode  || qt.payMode  || 'deposit',
    duration:     qt.duration  || '5 - 7 Hari Bekerja',
    notes:        qt.notes     || '',
    status:       qt.status    || 'PENDING',
    signedAt:     qt.signed_at || qt.signedAt || null,
    signature_image: qt.signature_image || null,
    createdAt:    qt.created_at || qt.createdAt || new Date().toISOString(),
  };
}

// Initialize Quotation Builder on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initQuotationForm();
});
