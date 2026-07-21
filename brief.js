document.addEventListener('DOMContentLoaded', () => {
  initMultiStepForm();
  initDragAndDrop();
});

// State untuk menyimpan fail yang dimuat naik dalam memori
const formState = {
  logo: null,
  portfolio: [],
  docs: []
};

let formSubmitted = false;

/* ==========================================================================
   WIZARD DAN NAVIGASI BORANG (MULTI-STEP)
   ========================================================================== */
function initMultiStepForm() {
  const steps = document.querySelectorAll('.form-step');
  const indicators = document.querySelectorAll('.step-indicator');
  const progressFill = document.getElementById('progress-fill');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnSubmit = document.getElementById('btn-submit');
  const form = document.getElementById('brief-form');

  let currentStep = 1;
  const totalSteps = steps.length;

  function updateSteps() {
    // Kemas kini paparan seksyen
    steps.forEach(step => {
      const stepNum = parseInt(step.getAttribute('data-step'));
      if (stepNum === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // Kemas kini indikator stepper
    indicators.forEach(ind => {
      const stepNum = parseInt(ind.getAttribute('data-step'));
      if (stepNum === currentStep) {
        ind.classList.add('active');
        ind.classList.remove('completed');
      } else if (stepNum < currentStep) {
        ind.classList.remove('active');
        ind.classList.add('completed');
      } else {
        ind.classList.remove('active', 'completed');
      }
    });

    // Kemas kini bar kemajuan (progress bar)
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = `${percentage}%`;

    // Sembunyikan/Tunjukkan butang
    if (currentStep === 1) {
      btnPrev.style.display = 'none';
    } else {
      btnPrev.style.display = 'inline-block';
    }

    if (currentStep === totalSteps) {
      btnNext.style.display = 'none';
      btnSubmit.style.display = 'inline-block';
    } else {
      btnNext.style.display = 'inline-block';
      btnSubmit.style.display = 'none';
    }

    // Scroll ke atas borang secara lancar
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Pengesahan input sebelum ke langkah seterusnya
  function validateCurrentStep() {
    const activeStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = activeStepEl.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
      const formGroup = input.closest('.form-group');
      if (input.type === 'checkbox') {
        if (!input.checked) {
          formGroup.classList.add('has-error');
          isValid = false;
        } else {
          formGroup.classList.remove('has-error');
        }
      } else {
        if (!input.value.trim()) {
          formGroup.classList.add('has-error');
          isValid = false;
        } else {
          formGroup.classList.remove('has-error');
        }
      }

      // Live validation on change
      input.addEventListener('input', () => {
        if (input.type === 'checkbox') {
          if (input.checked) formGroup.classList.remove('has-error');
        } else {
          if (input.value.trim()) formGroup.classList.remove('has-error');
        }
      }, { once: true });
    });

    return isValid;
  }

  // Set default history state for Step 1
  history.replaceState({ step: 1 }, '');

  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.step) {
      currentStep = e.state.step;
      updateSteps();
    }
  });

  btnNext.addEventListener('click', () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        currentStep++;
        history.pushState({ step: currentStep }, '');
        updateSteps();
      }
    }
  });

  btnPrev.addEventListener('click', () => {
    if (currentStep > 1) {
      history.back(); // Panggil back history pelayar (popstate akan decrement secara natural)
    }
  });

  // Uruskan penghantaran borang
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    submitFormViaAjax(form);
  });
}

/* ==========================================================================
   PENGURUSAN MUAT NAIK FAIL (DRAG & DROP)
   ========================================================================== */
function initDragAndDrop() {
  setupZone('logo-dropzone', 'logo', 'logo-preview-container', false);
  setupZone('portfolio-dropzone', 'portfolio', 'portfolio-preview-container', true);
  setupZone('docs-dropzone', 'docs', 'docs-preview-container', true);

  function setupZone(zoneId, stateKey, previewContainerId, isMultiple) {
    const zone = document.getElementById(zoneId);
    const input = zone.querySelector('.file-input');
    const container = document.getElementById(previewContainerId);

    // Mencegah tingkah laku lalai pelayar
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    // Kesan hover dragover
    ['dragenter', 'dragover'].forEach(eventName => {
      zone.addEventListener(eventName, () => zone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, () => zone.classList.remove('dragover'), false);
    });

    // Apabila fail dilepaskan (dropped)
    zone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    });

    // Apabila fail dipilih melalui butang layari (browsed)
    input.addEventListener('change', () => {
      handleFiles(input.files);
    });

    function handleFiles(files) {
      if (!files.length) return;

      const fileList = Array.from(files);

      if (!isMultiple) {
        // Had fail tunggal (Logo)
        const file = fileList[0];
        if (validateFile(file)) {
          formState[stateKey] = file;
          renderPreviews();
        }
      } else {
        // Had berbilang fail
        const maxFiles = stateKey === 'portfolio' ? 5 : 2;
        const currentCount = formState[stateKey].length;
        const slotsLeft = maxFiles - currentCount;

        if (slotsLeft <= 0) {
          alert(`Anda hanya boleh memuat naik maksimum ${maxFiles} fail sahaja.`);
          return;
        }

        const filesToAdd = fileList.slice(0, slotsLeft);
        filesToAdd.forEach(file => {
          if (validateFile(file)) {
            formState[stateKey].push(file);
          }
        });
        renderPreviews();
      }
    }

    function validateFile(file) {
      // Had saiz fail (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`Fail "${file.name}" melebihi had saiz 5MB.`);
        return false;
      }
      return true;
    }

    function renderPreviews() {
      container.innerHTML = '';
      const data = formState[stateKey];

      if (!data) return;

      if (!isMultiple) {
        // Render logo preview
        createPreviewElement(data, -1);
      } else {
        // Render portfolio / doc previews
        data.forEach((file, index) => {
          createPreviewElement(file, index);
        });
      }
    }

    function createPreviewElement(file, index) {
      const item = document.createElement('div');
      item.className = 'preview-item';

      const btnRemove = document.createElement('button');
      btnRemove.type = 'button';
      btnRemove.className = 'btn-remove-file';
      btnRemove.innerHTML = '&times;';
      btnRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFile(index);
      });
      item.appendChild(btnRemove);

      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        item.appendChild(img);
      } else {
        // File non-image (contoh PDF)
        const docDiv = document.createElement('div');
        docDiv.className = 'file-icon';
        const fileExt = file.name.split('.').pop().toUpperCase();
        docDiv.innerHTML = `<span>${fileExt}</span><span style="font-size:0.6rem; font-weight:400; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%">${file.name}</span>`;
        item.appendChild(docDiv);
      }

      container.appendChild(item);
    }

    function removeFile(index) {
      if (!isMultiple) {
        formState[stateKey] = null;
      } else {
        formState[stateKey].splice(index, 1);
      }
      renderPreviews();
    }
  }
}

/* ==========================================================================
   HANTAR BORANG DENGAN AJAX & PROGRESS BAR
   ========================================================================== */
function submitFormViaAjax(formElement) {
  const overlay = document.getElementById('upload-overlay');
  const progressFill = document.getElementById('upload-progress-fill');
  const percentageEl = document.getElementById('upload-percentage');
  const successScreen = document.getElementById('success-screen');

  // Papar progress overlay
  overlay.classList.add('active');

  const formData = new FormData(formElement);

  // Buang fail lalai input kerana kita urus fail secara manual dari formState
  formData.delete('logo');
  formData.delete('portfolio');
  formData.delete('docs');

  // Tambah fail dari state memori ke FormData
  if (formState.logo) {
    formData.append('logo', formState.logo);
  }

  formState.portfolio.forEach(file => {
    formData.append('portfolio', file);
  });

  formState.docs.forEach(file => {
    formData.append('docs', file);
  });

  // Hantar menggunakan XMLHttpRequest untuk progress tracking
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/submit', true);

  // Jejaki progress muat naik
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressFill.style.width = `${percent}%`;
      percentageEl.innerText = `${percent}%`;
    }
  });

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      overlay.classList.remove('active');
      if (xhr.status >= 200 && xhr.status < 300) {
        // Berjaya
        formSubmitted = true; // Langkau prompt beforeunload
        successScreen.classList.add('active');
        // Panggil state baru supaya user tak boleh back ke form editing selepas sukses
        history.pushState(null, '', window.location.pathname);
      } else {
        // Gagal
        let errMsg = 'Terdapat ralat semasa menghantar maklumat anda. Sila cuba lagi.';
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.message) errMsg = res.message;
        } catch(e) {}
        alert(errMsg);
      }
    }
  };

  xhr.send(formData);
}

// Amaran jika meninggalkan halaman sebelum menghantar borang
window.addEventListener('beforeunload', (e) => {
  const companyName = document.getElementById('companyName') ? document.getElementById('companyName').value.trim() : '';
  if (companyName && !formSubmitted) {
    e.preventDefault();
    e.returnValue = ''; // Tunjuk dialog amaran pelayar
  }
});
