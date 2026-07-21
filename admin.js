document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

let adminToken = '';

function initAdminDashboard() {
  const gateway = document.getElementById('passcode-gateway');
  const passcodeForm = document.getElementById('passcode-form');
  const passcodeInput = document.getElementById('passcode-input');
  const btnLogout = document.getElementById('btn-logout');

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

    adminToken = inputVal;
    // Cuba muat turun data untuk sahkan passcode betul
    loadSubmissions((success) => {
      if (success) {
        localStorage.setItem('kwikezee_admin_token', adminToken);
        gateway.style.display = 'none';
      } else {
        alert('Kata laluan salah. Sila cuba lagi.');
        passcodeInput.value = '';
        passcodeInput.focus();
        adminToken = '';
      }
    });
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
    loadSubmissions(); // Muat semula senarai
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
