/*
  PixelPure JavaScript Controller
  Handles theme toggles, FAQ accordions, scroll reveals, data serialization,
  interactive OOUI workspace card lists, preset sliders, and simulated conversions.
*/

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  // Detect current page
  const isHomepage = !!document.getElementById('dropzone');
  const isDashboard = !!document.getElementById('files-grid');

  if (isHomepage) {
    initHomepage();
  }
  if (isDashboard) {
    initDashboard();
  }
});

/* ==========================================================================
   COMMON: THEME MANAGER
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  // Retrieve saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

/* ==========================================================================
   EXPERIENCE 01: MARKETING HOMEPAGE
   ========================================================================== */
function initHomepage() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const browseTrigger = document.getElementById('browse-trigger');

  // Browse files trigger click
  if (browseTrigger && fileInput) {
    browseTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  // File selection change
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      handleFilesSelected(e.target.files);
    });
  }

  // Drag & drop events
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFilesSelected(files);
    });
  }

  // FAQ Accordion Toggle
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.parentElement;
      const content = item.querySelector('.faq-content');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Close all other accordion items
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          const otherContent = otherItem.querySelector('.faq-content');
          otherTrigger.setAttribute('aria-expanded', 'false');
          otherContent.style.height = '0px';
          otherContent.setAttribute('aria-hidden', 'true');
        }
      });

      // Toggle active state
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
        content.style.height = '0px';
        content.setAttribute('aria-hidden', 'true');
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        item.classList.add('active');
        content.style.height = content.scrollHeight + 'px';
        content.setAttribute('aria-hidden', 'false');
      }
    });
  });

  // Scroll Reveal Animations
  const scrollElements = document.querySelectorAll('.scroll-reveal');
  const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        elementObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  scrollElements.forEach(el => {
    elementObserver.observe(el);
  });
}

// Store files in localStorage and redirect
function handleFilesSelected(filesList) {
  if (!filesList || filesList.length === 0) return;
  
  const filesArray = [];
  const limit = Math.min(filesList.length, 100);

  for (let i = 0; i < limit; i++) {
    const file = filesList[i];
    const extension = file.name.substring(file.name.lastIndexOf('.') + 1).toUpperCase();
    filesArray.push({
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      format: extension,
      status: 'ready', // ready, processing, complete, failed
      preset: 'balanced',
      progress: 0,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    });
  }

  // Write to localStorage and redirect
  localStorage.setItem('pixelpure_pending_uploads', JSON.stringify(filesArray));
  window.location.href = 'dashboard.html';
}

/* ==========================================================================
   EXPERIENCE 02: CONVERSION DASHBOARD
   ========================================================================== */
function initDashboard() {
  // Application State
  let files = [];
  let currentSettings = {
    format: 'JPEG',
    preset: 'balanced',
    quality: 92,
    metadata: 'Preserve',
    colorProfile: 'sRGB',
    saveDefaults: true
  };

  // DOM Elements
  const emptyState = document.getElementById('empty-workspace-state');
  const filesGrid = document.getElementById('files-grid');
  
  const selectAllCheckbox = document.getElementById('select-all-checkbox');
  const selectAllLabel = document.getElementById('select-all-label');
  const selectionIndicator = document.getElementById('selection-indicator');
  
  const toolbarDownloadBtn = document.getElementById('toolbar-download-btn');
  const ratioBadge = document.getElementById('conversion-ratio-badge');
  
  const dbDropzone = document.getElementById('dashboard-dropzone');
  const dbFileInput = document.getElementById('dashboard-file-input');
  const dbBrowseTrigger = document.getElementById('dashboard-browse-trigger');
  
  const qualitySlider = document.getElementById('quality-slider');
  const qualitySliderTitle = document.getElementById('slider-label-title');
  const qualitySliderGroup = document.getElementById('jpeg-slider-group');
  const sliderFillBar = document.querySelector('.slider-fill-bar');
  
  const formatButtons = document.querySelectorAll('.format-segmented-control .segmented-btn');
  const presetCards = document.querySelectorAll('.preset-card');
  const metadataButtons = document.querySelectorAll('.metadata-segmented-control .segmented-btn');
  const profileButtons = document.querySelectorAll('.color-segmented-control .segmented-btn');
  const saveDefaultsCheckbox = document.getElementById('save-defaults-checkbox');
  
  const convertPhotosCTA = document.getElementById('convert-photos-cta');
  const progressBox = document.getElementById('conversion-progress-box');
  const progressMessage = document.getElementById('progress-message-text');
  const progressPercentLabel = document.getElementById('progress-percentage-label');
  const progressBarFill = document.getElementById('progress-bar-fill');
  
  const downloadBox = document.getElementById('conversion-download-box');
  const downloadCount = document.getElementById('download-files-count');
  const downloadZipSize = document.getElementById('download-zip-size');
  const downloadZipCTA = document.getElementById('download-zip-cta');
  
  const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  const layoutContainer = document.querySelector('.dashboard-layout');

  // Load Saved Settings Defaults if exists
  loadDefaultSettings();

  // Load files from homepage transfer
  const pendingUploadsRaw = localStorage.getItem('pixelpure_pending_uploads');
  if (pendingUploadsRaw) {
    try {
      const parsed = JSON.parse(pendingUploadsRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        files = parsed;
      }
    } catch (e) {
      console.error("Failed to parse transfers", e);
    }
    // Clean storage so page reload behaves cleanly
    localStorage.removeItem('pixelpure_pending_uploads');
  } else {
    // Pre-populate with beautiful demo files for immediate visualization
    files = [
      { id: 'demo_1', name: 'IMG_4821_PORTRAIT.CR3', size: 45718290, format: 'CR3', status: 'ready', progress: 0 },
      { id: 'demo_2', name: 'DSC_0940_LANDSCAPE.NEF', size: 38241902, format: 'NEF', status: 'ready', progress: 0 },
      { id: 'demo_3', name: 'RAW_8842_WILDLIFE.ARW', size: 50851234, format: 'ARW', status: 'ready', progress: 0 },
      { id: 'demo_4', name: 'FUJI_3910_STREET.RAF', size: 33554432, format: 'RAF', status: 'ready', progress: 0 },
      { id: 'demo_5', name: 'UNIVERSAL_2104_MACRO.DNG', size: 26843545, format: 'DNG', status: 'ready', progress: 0 }
    ];
  }
  updateWorkspace();

  // --- MOBILE SIDEBAR DRAWER TOGGLE ---
  if (mobileSidebarToggle && sidebar && layoutContainer) {
    mobileSidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('drawer-open');
      layoutContainer.classList.toggle('sidebar-drawer-active');
    });

    // Close sidebar when clicking outside on overlay
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && sidebar.classList.contains('drawer-open')) {
        if (!sidebar.contains(e.target) && e.target !== mobileSidebarToggle) {
          sidebar.classList.remove('drawer-open');
          layoutContainer.classList.remove('sidebar-drawer-active');
        }
      }
    });
  }

  // --- BROWSE FILES TRIGGERS ---
  if (dbBrowseTrigger && dbFileInput) {
    dbBrowseTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dbFileInput.click();
    });
  }

  if (dbFileInput) {
    dbFileInput.addEventListener('change', (e) => {
      appendSelectedFiles(e.target.files);
    });
  }

  // Dashboard Drag/Drop
  if (dbDropzone) {
    dbDropzone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dbDropzone.classList.add('dragover');
    });
    dbDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dbDropzone.classList.add('dragover');
    });
    dbDropzone.addEventListener('dragleave', () => {
      dbDropzone.classList.remove('dragover');
    });
    dbDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dbDropzone.classList.remove('dragover');
      appendSelectedFiles(e.dataTransfer.files);
    });
  }

  // --- SIDEBAR SETTINGS HANDLERS ---

  // Format Toggles (JPEG, PNG, WEBP, TIFF)
  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      formatButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      currentSettings.format = btn.getAttribute('data-value');
      
      // JPEG Quality slider display logic
      if (currentSettings.format === 'JPEG' || currentSettings.format === 'WEBP') {
        qualitySliderGroup.classList.remove('hidden');
        updateSliderHeader();
      } else {
        qualitySliderGroup.classList.add('hidden');
      }

      saveSettings();
    });
  });

  // Preset Cards clicks
  presetCards.forEach(card => {
    card.addEventListener('click', () => {
      presetCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentSettings.preset = card.getAttribute('data-preset');
      
      // Update slider based on preset
      if (currentSettings.preset === 'max') {
        currentSettings.quality = 100;
      } else if (currentSettings.preset === 'balanced') {
        currentSettings.quality = 92;
      } else if (currentSettings.preset === 'small') {
        currentSettings.quality = 80;
      }
      
      if (qualitySlider) {
        qualitySlider.value = currentSettings.quality;
        updateSliderFillWidth();
      }
      updateSliderHeader();
      saveSettings();
    });
  });

  // Quality Slider Input
  if (qualitySlider) {
    qualitySlider.addEventListener('input', (e) => {
      currentSettings.quality = parseInt(e.target.value);
      updateSliderHeader();
      updateSliderFillWidth();
      
      // Custom presets sync (optional highlight sync)
      presetCards.forEach(c => c.classList.remove('active'));
      if (currentSettings.quality === 100) {
        document.querySelector('[data-preset="max"]')?.classList.add('active');
        currentSettings.preset = 'max';
      } else if (currentSettings.quality === 92) {
        document.querySelector('[data-preset="balanced"]')?.classList.add('active');
        currentSettings.preset = 'balanced';
      } else if (currentSettings.quality === 80) {
        document.querySelector('[data-preset="small"]')?.classList.add('active');
        currentSettings.preset = 'small';
      } else {
        currentSettings.preset = 'custom';
      }
      saveSettings();
    });
  }

  function updateSliderHeader() {
    if (qualitySliderTitle) {
      qualitySliderTitle.textContent = `${currentSettings.format} Quality — ${currentSettings.quality}%`;
    }
  }

  function updateSliderFillWidth() {
    if (qualitySlider && sliderFillBar) {
      const min = parseInt(qualitySlider.min) || 80;
      const max = parseInt(qualitySlider.max) || 100;
      const val = parseInt(qualitySlider.value);
      const percentage = ((val - min) / (max - min)) * 100;
      sliderFillBar.style.width = percentage + '%';
    }
  }

  // Metadata preservation toggles
  metadataButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      metadataButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      currentSettings.metadata = btn.getAttribute('data-value');
      saveSettings();
    });
  });

  // Color Profile toggles
  profileButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      profileButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      currentSettings.colorProfile = btn.getAttribute('data-value');
      saveSettings();
    });
  });

  // Save Defaults checkbox
  if (saveDefaultsCheckbox) {
    saveDefaultsCheckbox.addEventListener('change', () => {
      currentSettings.saveDefaults = saveDefaultsCheckbox.checked;
      saveSettings();
    });
  }

  // --- WORKSPACE FUNCTIONALITY & OOUI ---

  function appendSelectedFiles(filesList) {
    if (!filesList || filesList.length === 0) return;
    
    // Max 100 files check
    if (files.length >= 100) {
      alert("Workspace batch limit of 100 files reached.");
      return;
    }

    const availableSlots = 100 - files.length;
    const limit = Math.min(filesList.length, availableSlots);

    for (let i = 0; i < limit; i++) {
      const file = filesList[i];
      const extension = file.name.substring(file.name.lastIndexOf('.') + 1).toUpperCase();
      files.push({
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        format: extension,
        status: 'ready',
        preset: 'balanced',
        progress: 0,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      });
    }

    updateWorkspace();
  }

  // Updates card lists, labels, and states in dashboard
  function updateWorkspace() {
    const totalFiles = files.length;

    if (totalFiles === 0) {
      emptyState.classList.remove('hidden');
      filesGrid.classList.add('hidden');
      selectAllCheckbox.checked = false;
      selectAllCheckbox.disabled = true;
    } else {
      emptyState.classList.add('hidden');
      filesGrid.classList.remove('hidden');
      selectAllCheckbox.disabled = false;
    }

    // Render Cards in Grid
    renderFileGrid();
    
    // Recalculate selection details
    updateSelectionState();
  }

  // Render file objects into DOM grid
  function renderFileGrid() {
    filesGrid.innerHTML = '';
    
    files.forEach(file => {
      const card = document.createElement('div');
      card.className = `file-card ${file.selected ? 'selected' : ''}`;
      card.setAttribute('data-id', file.id);

      // Unique custom colors representing raw extensions
      const sizeFormatted = formatBytes(file.size);
      
      // Determine status dot class
      let statusClass = 'status-ready';
      let statusText = 'Ready';
      if (file.status === 'processing') {
        statusClass = 'status-processing';
        statusText = 'Converting...';
      } else if (file.status === 'complete') {
        statusClass = 'status-complete';
        statusText = 'Complete';
      } else if (file.status === 'failed') {
        statusClass = 'status-failed';
        statusText = 'Failed';
      }

      // Generate a beautiful, realistic photography thumbnail consistently
      const previewUrl = file.url || getMockPhotoUrl(file.name);
      const thumbImgHTML = `<img src="${previewUrl}" alt="${file.name}" onerror="this.src='https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=300&q=80'">`;

      card.innerHTML = `
        <!-- Selection Checkbox -->
        <div class="file-checkbox-wrapper">
          <label class="custom-checkbox-container">
            <input type="checkbox" class="file-checkbox" ${file.selected ? 'checked' : ''}>
            <span class="custom-checkbox"></span>
          </label>
        </div>

        <!-- Thumbnail Aspect Wrapper -->
        <div class="file-thumbnail-container">
          ${thumbImgHTML}
        </div>

        <!-- Details Info -->
        <div class="file-info-container">
          <div class="file-details">
            <span class="file-name" title="${file.name}">${file.name}</span>
            <div class="file-meta">
              <span class="file-size-badge">${sizeFormatted}</span>
              <span class="file-type-badge">${file.format}</span>
            </div>
          </div>
          <div class="file-status-badge ${statusClass}">
            <span class="status-dot"></span>
            <span class="status-label">${statusText}</span>
          </div>
        </div>
      `;

      // Handle card selections
      const checkbox = card.querySelector('.file-checkbox');
      
      // Clicking anywhere on the card selects it (unless clicking checkout/checkbox itself directly)
      card.addEventListener('click', (e) => {
        if (e.target !== checkbox && !checkbox.contains(e.target) && e.target.type !== 'checkbox') {
          file.selected = !file.selected;
          checkbox.checked = file.selected;
          card.classList.toggle('selected', file.selected);
          updateSelectionState();
        }
      });

      checkbox.addEventListener('change', () => {
        file.selected = checkbox.checked;
        card.classList.toggle('selected', file.selected);
        updateSelectionState();
      });

      filesGrid.appendChild(card);
    });
  }

  // Update selection ratios, buttons state
  function updateSelectionState() {
    const totalFiles = files.length;
    const selectedFiles = files.filter(f => f.selected);
    const selectedCount = selectedFiles.length;
    
    // Select All state check
    if (totalFiles > 0 && selectedCount === totalFiles) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
      selectAllLabel.textContent = 'Deselect All';
    } else if (selectedCount > 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
      selectAllLabel.textContent = 'Select All';
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
      selectAllLabel.textContent = 'Select All';
    }

    // Indicators Update
    selectionIndicator.textContent = `${selectedCount} of ${totalFiles} selected`;
    
    // Converted badge
    const convertedCount = files.filter(f => f.status === 'complete').length;
    ratioBadge.textContent = `${convertedCount}/${totalFiles} converted`;

    // Button states
    const hasSelections = selectedCount > 0;
    const hasFiles = totalFiles > 0;
    
    // Convert Selected button sidebar (uses primary brand color)
    convertPhotosCTA.disabled = !hasSelections;
    if (hasSelections) {
      if (selectedCount === totalFiles) {
        convertPhotosCTA.innerHTML = `<span class="material-symbols-outlined">auto_fix_high</span><span>Convert All Photos</span>`;
      } else {
        convertPhotosCTA.innerHTML = `<span class="material-symbols-outlined">auto_fix_high</span><span>Convert ${selectedCount} Selected</span>`;
      }
    } else {
      convertPhotosCTA.innerHTML = `<span class="material-symbols-outlined">auto_fix_high</span><span>Convert Selected</span>`;
    }
    
    // ZIP Download buttons enable if at least one file is complete
    const hasConverted = convertedCount > 0;
    toolbarDownloadBtn.disabled = !hasConverted;

    // Save as default display slider fill widths
    updateSliderFillWidth();
  }

  // Toolbar Select All listener
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      const targetChecked = selectAllCheckbox.checked;
      files.forEach(f => f.selected = targetChecked);
      updateWorkspace();
    });
  }

  // --- SIMULATED CONVERSION ENGINE ---

  // Triggered by clicking "Convert Photos" in sidebar
  if (convertPhotosCTA) {
    convertPhotosCTA.addEventListener('click', () => {
      runSimulatedConversion(true); // only convert selected
    });
  }

  function runSimulatedConversion(onlySelected = false) {
    // Determine target files
    let targets = [];
    if (onlySelected) {
      targets = files.filter(f => f.selected);
    } else {
      // If nothing selected, convert everything in batch
      const selected = files.filter(f => f.selected);
      targets = selected.length > 0 ? selected : files;
    }

    if (targets.length === 0) return;

    // Reset status on targets to ready/processing
    targets.forEach(t => {
      t.status = 'ready';
      t.progress = 0;
    });
    
    // Refresh workspace layout
    renderFileGrid();
    updateSelectionState();

    // Disable workspace buttons during conversion
    toggleWorkspaceInteraction(false);

    // Hide Convert CTA, Show Progress bar panel
    convertPhotosCTA.classList.add('hidden');
    downloadBox.classList.add('hidden');
    progressBox.classList.remove('hidden');

    let processedCount = 0;
    const totalTargets = targets.length;

    // Simulate batch chunk queue
    let queueIndex = 0;
    const concurrentLimit = 3;

    function processNext() {
      if (queueIndex >= totalTargets) {
        // All processing cycles complete
        setTimeout(finalizeConversion, 500);
        return;
      }

      // Launch concurrent files
      const currentBatch = [];
      for (let i = 0; i < concurrentLimit && queueIndex < totalTargets; i++) {
        currentBatch.push(targets[queueIndex]);
        queueIndex++;
      }

      let batchPromises = currentBatch.map(file => {
        return new Promise(resolve => {
          file.status = 'processing';
          updateFileCardUI(file);

          let currentProg = 0;
          const interval = setInterval(() => {
            currentProg += Math.floor(Math.random() * 20) + 10;
            if (currentProg >= 100) {
              currentProg = 100;
              clearInterval(interval);
              
              // 98% success rate, tiny simulated failure for realism
              file.status = Math.random() > 0.02 ? 'complete' : 'failed';
              file.progress = 100;
              processedCount++;
              
              // Update progress bar
              updateOverallProgress(processedCount, totalTargets);
              updateFileCardUI(file);
              resolve();
            } else {
              file.progress = currentProg;
            }
          }, 200 + Math.random() * 300);
        });
      });

      Promise.all(batchPromises).then(() => {
        processNext();
      });
    }

    // Launch process
    processNext();
  }

  function toggleWorkspaceInteraction(enable) {
    dbFileInput.disabled = !enable;
    selectAllCheckbox.disabled = !enable;
    document.querySelectorAll('.file-checkbox').forEach(cb => cb.disabled = !enable);
    
    // Preset changes / sidebar items disable during active converting
    formatButtons.forEach(b => b.disabled = !enable);
    presetCards.forEach(c => c.style.pointerEvents = enable ? 'auto' : 'none');
    if (qualitySlider) qualitySlider.disabled = !enable;
    metadataButtons.forEach(b => b.disabled = !enable);
    profileButtons.forEach(b => b.disabled = !enable);
    saveDefaultsCheckbox.disabled = !enable;
  }

  // Update cards live in grid without full redraw for fluid animation
  function updateFileCardUI(file) {
    const card = document.querySelector(`.file-card[data-id="${file.id}"]`);
    if (!card) return;

    const badge = card.querySelector('.file-status-badge');
    if (!badge) return;

    badge.className = 'file-status-badge';
    const dot = badge.querySelector('.status-dot');
    const label = badge.querySelector('.status-label');

    if (file.status === 'processing') {
      badge.classList.add('status-processing');
      label.textContent = `Converting...`;
    } else if (file.status === 'complete') {
      badge.classList.add('status-complete');
      label.textContent = 'Complete';
      
      // Update format text to converted format representation if successful
      const extBadge = card.querySelector('.file-type-badge');
      if (extBadge) {
        extBadge.textContent = currentSettings.format;
        extBadge.style.backgroundColor = 'rgba(6, 191, 146, 0.1)';
        extBadge.style.color = 'var(--primary-green)';
      }
    } else if (file.status === 'failed') {
      badge.classList.add('status-failed');
      label.textContent = 'Failed';
    }
    
    updateSelectionState();
  }

  function updateOverallProgress(current, total) {
    const percentage = Math.round((current / total) * 100);
    progressMessage.textContent = `Converting ${current} of ${total} files`;
    progressPercentLabel.textContent = `${percentage}%`;
    progressBarFill.style.width = `${percentage}%`;
  }

  function finalizeConversion() {
    progressBox.classList.add('hidden');
    downloadBox.classList.remove('hidden');

    const totalConverted = files.filter(f => f.status === 'complete').length;
    downloadCount.textContent = totalConverted;

    // Calculate simulated output size (JPEG usually ~15-20% of RAW size depending on preset)
    let ratio = 0.15; // balanced
    if (currentSettings.preset === 'max') ratio = 0.25;
    if (currentSettings.preset === 'small') ratio = 0.08;

    const totalRawSize = files.filter(f => f.status === 'complete').reduce((sum, f) => sum + f.size, 0);
    const simulatedZipBytes = totalRawSize * ratio;
    downloadZipSize.textContent = formatBytes(simulatedZipBytes);

    // Enable workspace interaction
    toggleWorkspaceInteraction(true);
  }

  // --- DOWNLOAD ZIP CLICK HANDLER ---
  if (downloadZipCTA) {
    downloadZipCTA.addEventListener('click', () => {
      // Get all complete files
      const completeFiles = files.filter(f => f.status === 'complete');
      if (completeFiles.length === 0) return;

      // Make a real downloadable text blob containing download list summary
      let txtContent = `PixelPure Converted Batch Log\n`;
      txtContent += `===================================\n`;
      txtContent += `Format: ${currentSettings.format}\n`;
      txtContent += `Preset Quality: ${currentSettings.preset}\n`;
      txtContent += `Color Profile: ${currentSettings.colorProfile}\n`;
      txtContent += `Metadata Preserved: ${currentSettings.metadata === 'Preserve' ? 'Yes' : 'No'}\n`;
      txtContent += `===================================\n\n`;
      txtContent += `Files Converted:\n`;
      
      completeFiles.forEach(f => {
        txtContent += `- ${f.name.substring(0, f.name.lastIndexOf('.'))}.${currentSettings.format.toLowerCase()} (${formatBytes(f.size * 0.15)})\n`;
      });

      const blob = new Blob([txtContent], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixelpure-converted-photos.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // --- LOCAL STORAGE SETTINGS PERSISTENCE ---
  function saveSettings() {
    if (currentSettings.saveDefaults) {
      localStorage.setItem('pixelpure_defaults', JSON.stringify(currentSettings));
    } else {
      localStorage.removeItem('pixelpure_defaults');
    }
  }

  function loadDefaultSettings() {
    const saved = localStorage.getItem('pixelpure_defaults');
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      currentSettings = { ...currentSettings, ...parsed };
      
      // Update UI elements based on loaded settings
      
      // Format
      formatButtons.forEach(btn => {
        const val = btn.getAttribute('data-value');
        if (val === currentSettings.format) {
          btn.click();
        }
      });

      // Preset card selection
      presetCards.forEach(card => {
        const val = card.getAttribute('data-preset');
        if (val === currentSettings.preset) {
          presetCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        }
      });

      // Slider
      if (qualitySlider) {
        qualitySlider.value = currentSettings.quality;
        updateSliderFillWidth();
        updateSliderHeader();
      }

      // Metadata
      metadataButtons.forEach(btn => {
        const val = btn.getAttribute('data-value');
        if (val === currentSettings.metadata) {
          btn.click();
        }
      });

      // Color Profile
      profileButtons.forEach(btn => {
        const val = btn.getAttribute('data-value');
        if (val === currentSettings.colorProfile) {
          btn.click();
        }
      });

      // Save defaults switch
      if (saveDefaultsCheckbox) {
        saveDefaultsCheckbox.checked = currentSettings.saveDefaults;
      }
      
    } catch(e) {
      console.error("Failed to load settings defaults", e);
    }
  }
}

/* ==========================================================================
   UTILITY HELPER FUNCTIONS
   ========================================================================== */
function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Generate premium mock photography gradients
function getPlaceholderGradient(filename) {
  const code = filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color1 = `hsl(${code % 360}, 55%, 35%)`;
  const color2 = `hsl(${(code + 120) % 360}, 65%, 45%)`;
  const angle = (code % 4) * 45;
  return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
}

// Generate premium mock photography placeholders
function getMockPhotoUrl(name) {
  const lowercase = name.toLowerCase();
  
  if (lowercase.includes('portrait') || lowercase.includes('face') || lowercase.includes('girl')) {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  } else if (lowercase.includes('landscape') || lowercase.includes('mountain') || lowercase.includes('nature')) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80';
  } else if (lowercase.includes('wildlife') || lowercase.includes('animal') || lowercase.includes('bird')) {
    return 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=300&q=80';
  } else if (lowercase.includes('street') || lowercase.includes('city') || lowercase.includes('urban')) {
    return 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=300&q=80';
  } else if (lowercase.includes('macro') || lowercase.includes('flower') || lowercase.includes('detail')) {
    return 'https://images.unsplash.com/photo-1500627869374-13cd993b1115?auto=format&fit=crop&w=300&q=80';
  }
  
  const photos = [
    'https://images.unsplash.com/photo-1472214222541-d510753a8707?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=300&q=80'
  ];
  const code = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return photos[code % photos.length];
}
