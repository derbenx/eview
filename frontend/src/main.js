import './style.css';
import {
    GetDrives,
    GetDirectories,
    GetFilesInDirectory,
    GetFileBase64,
    GetGIFFrames,
    RenameFile,
    QuitApp
} from '../wailsjs/go/main/App';

// Application State
let currentPath = '';
let drives = [];
let files = []; // List of FileInfo objects in current folder
let highlightedIndex = -1; // Currently highlighted file index in `files`
let selectedPaths = new Set(); // Set of file paths selected (space bar / select buttons)
let fileDataCache = new Map(); // path -> base64 data URL
let gifFramesCache = new Map(); // path -> array of frame base64 data URLs

// GIF Animation State
let isAnimated = true;
let currentGifFrameIndex = 0;
let gifTimer = null;
let currentGifFrames = [];

// Zoom & Pan State (Full Screen Mode)
let zoomLevel = 1.0;
let panX = 0;
let panY = 0;
let isDragging = false;
let startDragX = 0;
let startDragY = 0;

// View Mode
let isFullScreen = false;

// Directory Tree State
let treeExpandedPaths = new Set();
let treeDataMap = new Map(); // path -> TreeNode[]

// Modals
let activeModal = null; // 'quit' or 'rename'

// DOM Elements Initialization
function initUI() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <!-- TOP TOOLBAR -->
        <div class="toolbar">
            <button class="btn" id="btn-prev" title="Previous File">Prev</button>
            <button class="btn" id="btn-next" title="Next File">Next</button>
            <div class="separator"></div>
            <button class="btn" id="btn-frame-back" title="Frame Back (<)">&lt;</button>
            <button class="btn" id="btn-frame-fwd" title="Frame Forward (>)">&gt;</button>
            <button class="btn btn-active" id="btn-animate" title="Toggle GIF Animation">Animate</button>
            <div class="separator"></div>
            <button class="btn" id="btn-fullscreen" title="Toggle Full Screen (Ctrl+F / F11)">Full Screen</button>
            <button class="btn" id="btn-select-all" title="Select All">Select All</button>
            <button class="btn" id="btn-select-none" title="Select None">Select None</button>
            <div class="separator"></div>
            <div class="filter-group">
                <label><input type="checkbox" id="chk-imgs" checked> imgs</label>
                <label><input type="checkbox" id="chk-gif" checked> gif</label>
                <label><input type="checkbox" id="chk-ico" checked> ico</label>
                <label><input type="checkbox" id="chk-all" checked> All</label>
            </div>
        </div>

        <!-- DRIVE & PATH BAR -->
        <div class="path-bar-container">
            <select class="drive-select" id="drive-select"></select>
            <input type="text" class="path-input" id="path-input" placeholder="Enter path and press Enter..." />
        </div>

        <!-- MASTER WORKSPACE -->
        <div class="workspace">
            <!-- LEFT SIDEBAR: DIRECTORY TREE -->
            <div class="sidebar-resizable">
                <div class="pane-title">Folders</div>
                <ul class="tree-root" id="tree-root"></ul>
            </div>

            <!-- RIGHT MAIN CONTENT -->
            <div class="main-content">
                <!-- TOP HALF: THUMBNAIL MATRIX -->
                <div class="pane-top-split">
                    <div class="pane-title" id="thumb-pane-title">Thumbnails</div>
                    <div class="thumb-grid" id="thumb-grid"></div>
                </div>

                <!-- BOTTOM HALF: PREVIEW VIEWPORT -->
                <div class="preview-pane">
                    <div class="pane-title" id="preview-pane-title">Preview</div>
                    <div class="preview-viewport" id="preview-viewport">
                        <div class="empty-preview-msg" id="empty-preview-msg">No image selected</div>
                        <img id="preview-image" class="preview-image" style="display: none;" draggable="false" />
                    </div>
                </div>
            </div>
        </div>

        <!-- BOTTOM STATUS BAR -->
        <div class="info-bar">
            <div class="info-segment" id="info-folder">Folder: -</div>
            <div class="info-segment" id="info-file">File: -</div>
            <div class="info-segment" id="info-dim">Resolution: -</div>
            <div class="info-segment" id="info-size">Size: -</div>
            <div class="info-segment" id="info-selection">0 selected of 0 files</div>
        </div>

        <!-- FULLSCREEN OVERLAY -->
        <div class="fullscreen-overlay" id="fullscreen-overlay" style="display: none;">
            <img id="fullscreen-image" draggable="false" />
            <div class="fs-info-bar">
                <span id="fs-file-info"></span>
                <span>Press Esc or Ctrl+F to exit full screen | PgUp/PgDn: Next/Prev</span>
            </div>
        </div>

        <!-- MODAL OVERLAY -->
        <div class="modal-overlay" id="modal-overlay" style="display: none;">
            <div class="modal-card" id="modal-card"></div>
        </div>
    `;

    bindEvents();
    loadDrives();
}

// Bind Event Listeners
function bindEvents() {
    // Toolbar buttons
    document.getElementById('btn-prev').onclick = () => navigateFile(-1);
    document.getElementById('btn-next').onclick = () => navigateFile(1);
    document.getElementById('btn-frame-back').onclick = () => stepGifFrame(-1);
    document.getElementById('btn-frame-fwd').onclick = () => stepGifFrame(1);
    document.getElementById('btn-animate').onclick = toggleAnimate;
    document.getElementById('btn-fullscreen').onclick = toggleFullScreen;
    document.getElementById('btn-select-all').onclick = selectAll;
    document.getElementById('btn-select-none').onclick = selectNone;

    // Filter checkboxes
    const chkImgs = document.getElementById('chk-imgs');
    const chkGif = document.getElementById('chk-gif');
    const chkIco = document.getElementById('chk-ico');
    const chkAll = document.getElementById('chk-all');

    chkAll.onchange = (e) => {
        const checked = e.target.checked;
        chkImgs.checked = checked;
        chkGif.checked = checked;
        chkIco.checked = checked;
        loadDirectoryFiles(currentPath);
    };

    const updateFilterGroup = () => {
        chkAll.checked = chkImgs.checked && chkGif.checked && chkIco.checked;
        loadDirectoryFiles(currentPath);
    };

    chkImgs.onchange = updateFilterGroup;
    chkGif.onchange = updateFilterGroup;
    chkIco.onchange = updateFilterGroup;

    // Drive & Path input
    document.getElementById('drive-select').onchange = (e) => {
        const drivePath = e.target.value;
        if (drivePath) {
            navigateToFolder(drivePath);
        }
    };

    document.getElementById('path-input').onkeydown = (e) => {
        if (e.key === 'Enter') {
            const inputPath = e.target.value.trim();
            if (inputPath) {
                navigateToFolder(inputPath);
            }
        }
    };

    // Keyboard Shortcuts
    window.onkeydown = handleGlobalKeyDown;

    // Mouse Zoom & Pan strictly in Full Screen Overlay
    const fsOverlay = document.getElementById('fullscreen-overlay');

    fsOverlay.onwheel = handleWheelZoom;
    fsOverlay.onmousedown = handlePanStart;

    window.onmousemove = handlePanMove;
    window.onmouseup = handlePanEnd;
}

// Helper: Get Active Category Filters
function getActiveAllowedTypes() {
    const allowed = [];
    if (document.getElementById('chk-imgs').checked) allowed.push('img');
    if (document.getElementById('chk-gif').checked) allowed.push('gif');
    if (document.getElementById('chk-ico').checked) allowed.push('ico');
    return allowed;
}

// Drives & Initial Load
async function loadDrives() {
    try {
        drives = await GetDrives();
        const driveSelect = document.getElementById('drive-select');
        driveSelect.innerHTML = drives.map(d => `<option value="${escapeHtml(d.path)}">${escapeHtml(d.label)}</option>`).join('');

        if (drives.length > 0) {
            driveSelect.value = drives[0].path;
            navigateToFolder(drives[0].path);
        }
    } catch (err) {
        console.error('Failed to get drives:', err);
    }
}

// Get Currently Selected Drive Object
function getSelectedDrivePath() {
    const driveSelect = document.getElementById('drive-select');
    return driveSelect ? driveSelect.value : (drives[0] ? drives[0].path : '');
}

// Directory Navigation & Tree Rendering
async function navigateToFolder(dirPath) {
    currentPath = dirPath;
    document.getElementById('path-input').value = dirPath;

    // Synchronize drive select dropdown if needed
    const driveSelect = document.getElementById('drive-select');
    if (driveSelect && drives.length > 0) {
        const matchingDrive = drives.find(d => dirPath.toLowerCase().startsWith(d.path.toLowerCase()));
        if (matchingDrive && driveSelect.value !== matchingDrive.path) {
            driveSelect.value = matchingDrive.path;
        }
    }

    // Expand tree path
    treeExpandedPaths.add(dirPath);
    renderTree();
    loadDirectoryFiles(dirPath);
}

async function renderTree() {
    const rootEl = document.getElementById('tree-root');
    const selectedDrivePath = getSelectedDrivePath();
    if (!selectedDrivePath) return;

    const drive = drives.find(d => d.path === selectedDrivePath) || { path: selectedDrivePath, label: selectedDrivePath };
    let html = await renderTreeNodeHTML(drive.path, drive.label, 0);
    rootEl.innerHTML = html;

    // Bind click events on tree nodes
    rootEl.querySelectorAll('.tree-node-item').forEach(item => {
        item.onclick = (e) => {
            e.stopPropagation();
            const nodePath = item.dataset.path;
            const isExpander = e.target.classList.contains('tree-expander');

            if (isExpander) {
                if (treeExpandedPaths.has(nodePath)) {
                    treeExpandedPaths.delete(nodePath);
                } else {
                    treeExpandedPaths.add(nodePath);
                }
                renderTree();
            } else {
                navigateToFolder(nodePath);
            }
        };
    });
}

async function renderTreeNodeHTML(path, label, depth) {
    const isExpanded = treeExpandedPaths.has(path);
    const isActive = (currentPath === path);
    const indent = depth * 14;

    let subTree = '';
    if (isExpanded) {
        if (!treeDataMap.has(path)) {
            try {
                const subs = await GetDirectories(path);
                treeDataMap.set(path, subs || []);
            } catch (err) {
                treeDataMap.set(path, []);
            }
        }

        const subs = treeDataMap.get(path);
        for (const sub of subs) {
            subTree += await renderTreeNodeHTML(sub.path, sub.name, depth + 1);
        }
    }

    const hasChildren = true; // allow expanding any directory
    const expanderIcon = isExpanded ? '▼' : '▶';

    return `
        <li>
            <div class="tree-node-item ${isActive ? 'active' : ''}" data-path="${escapeHtml(path)}" style="padding-left: ${indent + 6}px;">
                <span class="tree-expander">${expanderIcon}</span>
                <span>📁 ${escapeHtml(label)}</span>
            </div>
            ${isExpanded ? `<ul style="list-style: none;">${subTree}</ul>` : ''}
        </li>
    `;
}

// Load Files in Directory & Render Thumbnails
async function loadDirectoryFiles(dirPath) {
    if (!dirPath) return;

    const allowedTypes = getActiveAllowedTypes();
    try {
        files = await GetFilesInDirectory(dirPath, allowedTypes) || [];
        highlightedIndex = files.length > 0 ? 0 : -1;
        selectedPaths.clear();
        resetZoom();

        renderThumbnails();
        updatePreview();
        updateStatusBar();
    } catch (err) {
        console.error('Failed to list files:', err);
        files = [];
        highlightedIndex = -1;
        renderThumbnails();
        updatePreview();
        updateStatusBar();
    }
}

// Render Thumbnails Grid & Lazy Load
let thumbObserver = null;

function renderThumbnails() {
    const grid = document.getElementById('thumb-grid');
    if (files.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; color: #666; font-size: 13px; padding: 20px; text-align: center;">No matching files in this directory</div>`;
        return;
    }

    // Clean up previous IntersectionObserver
    if (thumbObserver) {
        thumbObserver.disconnect();
    }

    // Lazy Loading Observer using IntersectionObserver
    thumbObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const idx = parseInt(card.dataset.index, 10);
                if (files[idx]) {
                    loadThumbnailImage(files[idx], idx);
                }
                thumbObserver.unobserve(card);
            }
        });
    }, { root: grid, rootMargin: '100px' });

    grid.innerHTML = files.map((file, idx) => {
        const isHighlighted = (idx === highlightedIndex);
        const isSelected = selectedPaths.has(file.path);

        let icon = '🖼️';
        if (file.isGif) icon = '🎞️';
        else if (file.extension === 'ico') icon = '💠';

        // Check if cached image is already available
        const cachedUrl = fileDataCache.get(file.path);
        const imgContent = cachedUrl
            ? `<img src="${cachedUrl}" class="thumb-img" alt="${escapeHtml(file.name)}" draggable="false" />`
            : `<div class="thumb-icon-placeholder">${icon}</div>`;

        return `
            <div class="thumb-card ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}"
                 data-index="${idx}" id="thumb-card-${idx}">
                <div class="thumb-img-wrapper" id="thumb-img-wrapper-${idx}">
                    ${imgContent}
                </div>
                <div class="thumb-label" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
            </div>
        `;
    }).join('');

    // Attach IntersectionObserver and Click/DblClick events
    grid.querySelectorAll('.thumb-card').forEach(card => {
        const idx = parseInt(card.dataset.index, 10);
        const file = files[idx];

        if (file && !fileDataCache.has(file.path)) {
            thumbObserver.observe(card);
        }

        card.onclick = (e) => {
            if (e.ctrlKey || e.metaKey) {
                toggleSelectionIndex(idx);
            } else if (e.shiftKey && highlightedIndex >= 0) {
                const start = Math.min(highlightedIndex, idx);
                const end = Math.max(highlightedIndex, idx);
                for (let i = start; i <= end; i++) {
                    selectedPaths.add(files[i].path);
                }
                highlightedIndex = idx;
                renderThumbnails();
                updatePreview();
                updateStatusBar();
            } else {
                highlightedIndex = idx;
                renderThumbnails();
                updatePreview();
                updateStatusBar();
            }
        };

        card.ondblclick = (e) => {
            e.stopPropagation();
            highlightedIndex = idx;
            if (!isFullScreen) {
                toggleFullScreen();
            }
        };
    });

    // Ensure highlighted thumbnail is scrolled into view
    if (highlightedIndex >= 0) {
        const card = document.getElementById(`thumb-card-${highlightedIndex}`);
        if (card) {
            card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }
}

// Asynchronously load image for thumbnail
async function loadThumbnailImage(file, idx) {
    let dataUrl = fileDataCache.get(file.path);
    if (!dataUrl) {
        try {
            dataUrl = await GetFileBase64(file.path);
            fileDataCache.set(file.path, dataUrl);
        } catch (err) {
            return;
        }
    }

    const wrapper = document.getElementById(`thumb-img-wrapper-${idx}`);
    if (wrapper) {
        wrapper.innerHTML = `<img src="${dataUrl}" class="thumb-img" alt="${escapeHtml(file.name)}" draggable="false" />`;
    }
}

// Update Preview Viewport
async function updatePreview() {
    stopGifAnimation();

    const emptyMsg = document.getElementById('empty-preview-msg');
    const imgEl = document.getElementById('preview-image');
    const fsImgEl = document.getElementById('fullscreen-image');

    if (highlightedIndex < 0 || highlightedIndex >= files.length) {
        emptyMsg.style.display = 'block';
        imgEl.style.display = 'none';
        return;
    }

    emptyMsg.style.display = 'none';
    imgEl.style.display = 'block';

    const file = files[highlightedIndex];
    let dataUrl = fileDataCache.get(file.path);
    if (!dataUrl) {
        try {
            dataUrl = await GetFileBase64(file.path);
            fileDataCache.set(file.path, dataUrl);
        } catch (err) {
            emptyMsg.textContent = 'Failed to load image preview';
            emptyMsg.style.display = 'block';
            imgEl.style.display = 'none';
            return;
        }
    }

    imgEl.src = dataUrl;
    if (isFullScreen) {
        fsImgEl.src = dataUrl;
    }
}

function stopGifAnimation() {
    if (gifTimer) {
        clearInterval(gifTimer);
        gifTimer = null;
    }
}

function toggleAnimate() {
    isAnimated = !isAnimated;
    const btn = document.getElementById('btn-animate');
    if (isAnimated) {
        btn.classList.add('btn-active');
    } else {
        btn.classList.remove('btn-active');
        stopGifAnimation();
    }
    updatePreview();
}

async function stepGifFrame(direction) {
    if (highlightedIndex < 0 || !files[highlightedIndex]?.isGif) return;

    const file = files[highlightedIndex];
    let frames = gifFramesCache.get(file.path);
    if (!frames) {
        try {
            frames = await GetGIFFrames(file.path);
            gifFramesCache.set(file.path, frames);
        } catch (err) {
            return;
        }
    }

    if (!frames || frames.length === 0) return;

    // Pause animation when frame stepping
    if (isAnimated) {
        toggleAnimate();
    }

    currentGifFrames = frames;
    currentGifFrameIndex = (currentGifFrameIndex + direction + frames.length) % frames.length;

    const frameData = frames[currentGifFrameIndex];
    document.getElementById('preview-image').src = frameData;
    if (isFullScreen) {
        document.getElementById('fullscreen-image').src = frameData;
    }
}

// Navigation (Next / Prev)
function navigateFile(direction) {
    if (files.length === 0) return;

    // Get active list: if any files are selected in `selectedPaths`, cycle through selected files only
    const selectedIndices = [];
    files.forEach((f, idx) => {
        if (selectedPaths.has(f.path)) {
            selectedIndices.push(idx);
        }
    });

    if (selectedIndices.length > 0) {
        // Find next selected index after/before `highlightedIndex`
        let currentPos = selectedIndices.indexOf(highlightedIndex);
        if (currentPos === -1) {
            // Highlight closest selected index
            currentPos = direction > 0 ? 0 : selectedIndices.length - 1;
        } else {
            currentPos = (currentPos + direction + selectedIndices.length) % selectedIndices.length;
        }
        highlightedIndex = selectedIndices[currentPos];
    } else {
        // Cycle all visible files
        highlightedIndex = (highlightedIndex + direction + files.length) % files.length;
    }

    resetZoom();
    renderThumbnails();
    updatePreview();
    updateStatusBar();
}

// Selection Functions
function toggleSelectionIndex(idx) {
    if (idx < 0 || idx >= files.length) return;
    const path = files[idx].path;
    if (selectedPaths.has(path)) {
        selectedPaths.delete(path);
    } else {
        selectedPaths.add(path);
    }
    renderThumbnails();
    updateStatusBar();
}

function selectAll() {
    files.forEach(f => selectedPaths.add(f.path));
    renderThumbnails();
    updateStatusBar();
}

function selectNone() {
    selectedPaths.clear();
    renderThumbnails();
    updateStatusBar();
}

// Zoom & Pan Functions (Full Screen Only with Boundary Clamping)
function handleWheelZoom(e) {
    if (!isFullScreen) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoomLevel = Math.max(1.0, Math.min(5.0, zoomLevel + delta));
    clampAndApplyPan();
}

function handlePanStart(e) {
    if (!isFullScreen || e.button !== 0) return; // left click in fullscreen only
    isDragging = true;
    startDragX = e.clientX - panX;
    startDragY = e.clientY - panY;
}

function handlePanMove(e) {
    if (!isFullScreen || !isDragging) return;
    panX = e.clientX - startDragX;
    panY = e.clientY - startDragY;
    clampAndApplyPan();
}

function handlePanEnd() {
    isDragging = false;
}

function resetZoom() {
    zoomLevel = 1.0;
    panX = 0;
    panY = 0;
    clampAndApplyPan();
}

function clampAndApplyPan() {
    const fsImgEl = document.getElementById('fullscreen-image');
    const fsOverlay = document.getElementById('fullscreen-overlay');

    if (fsImgEl && fsOverlay) {
        if (zoomLevel <= 1.0) {
            panX = 0;
            panY = 0;
        } else {
            const containerWidth = fsOverlay.clientWidth;
            const containerHeight = fsOverlay.clientHeight;
            const imgWidth = fsImgEl.offsetWidth || containerWidth;
            const imgHeight = fsImgEl.offsetHeight || containerHeight;

            const maxPanX = Math.max(0, (imgWidth * zoomLevel - containerWidth) / 2);
            const maxPanY = Math.max(0, (imgHeight * zoomLevel - containerHeight) / 2);

            panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
            panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
        }
        fsImgEl.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    }

    const imgEl = document.getElementById('preview-image');
    if (imgEl) {
        imgEl.style.transform = 'none';
    }
}

// Fullscreen Mode
function toggleFullScreen() {
    isFullScreen = !isFullScreen;
    const overlay = document.getElementById('fullscreen-overlay');
    if (isFullScreen) {
        overlay.style.display = 'flex';
        updatePreview();
        updateFsInfo();
        // Request browser window / element full screen if supported
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen().catch(() => {});
        }
    } else {
        overlay.style.display = 'none';
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
            document.webkitExitFullscreen().catch(() => {});
        }
    }
}

// Listen for native escape / fullscreen change events
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isFullScreen) {
        isFullScreen = false;
        document.getElementById('fullscreen-overlay').style.display = 'none';
    }
});

function updateFsInfo() {
    if (highlightedIndex >= 0 && highlightedIndex < files.length) {
        const file = files[highlightedIndex];
        document.getElementById('fs-file-info').textContent = `${file.name} (${file.width}x${file.height} | ${formatFileSize(file.size)})`;
    }
}

// Modals
function showQuitModal() {
    activeModal = 'quit';
    const overlay = document.getElementById('modal-overlay');
    const card = document.getElementById('modal-card');
    card.innerHTML = `
        <div class="modal-title">Quit Application</div>
        <div class="modal-body">Are you sure you want to quit eview? (y/n)</div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">No (N)</button>
            <button class="btn btn-active" id="modal-confirm">Yes (Y)</button>
        </div>
    `;
    overlay.style.display = 'flex';

    document.getElementById('modal-cancel').onclick = closeModal;
    document.getElementById('modal-confirm').onclick = () => QuitApp();
}

function showRenameModal() {
    if (highlightedIndex < 0 || highlightedIndex >= files.length) return;
    const file = files[highlightedIndex];

    activeModal = 'rename';
    const overlay = document.getElementById('modal-overlay');
    const card = document.getElementById('modal-card');
    card.innerHTML = `
        <div class="modal-title">Rename File</div>
        <div class="modal-body">
            Enter new file name:
            <input type="text" class="modal-input" id="rename-input" value="${escapeHtml(file.name)}" />
        </div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">Cancel</button>
            <button class="btn btn-active" id="modal-confirm">Rename</button>
        </div>
    `;
    overlay.style.display = 'flex';

    const input = document.getElementById('rename-input');
    input.focus();
    input.select();

    const handleRename = async () => {
        const newName = input.value.trim();
        if (newName && newName !== file.name) {
            try {
                await RenameFile(file.path, newName);
                closeModal();
                loadDirectoryFiles(currentPath);
            } catch (err) {
                alert('Rename failed: ' + err);
            }
        } else {
            closeModal();
        }
    };

    document.getElementById('modal-cancel').onclick = closeModal;
    document.getElementById('modal-confirm').onclick = handleRename;
    input.onkeydown = (e) => {
        if (e.key === 'Enter') handleRename();
        if (e.key === 'Escape') closeModal();
    };
}

function closeModal() {
    activeModal = null;
    document.getElementById('modal-overlay').style.display = 'none';
}

// Global Key Down Handler
function handleGlobalKeyDown(e) {
    // Ignore keypresses if typing in input field (unless modal input)
    if (e.target.tagName === 'INPUT' && e.target.id !== 'rename-input') {
        return;
    }

    if (activeModal === 'quit') {
        if (e.key === 'y' || e.key === 'Y' || e.key === 'Enter') {
            QuitApp();
        } else if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
            closeModal();
        }
        return;
    }

    if (activeModal) return;

    // Full screen shortcuts: Ctrl+F or F11
    if ((e.ctrlKey && (e.key === 'f' || e.key === 'F')) || e.key === 'F11') {
        e.preventDefault();
        toggleFullScreen();
        return;
    }

    // Escape Key
    if (e.key === 'Escape') {
        if (isFullScreen) {
            toggleFullScreen();
        } else {
            showQuitModal();
        }
        return;
    }

    // F2 Rename
    if (e.key === 'F2') {
        e.preventDefault();
        showRenameModal();
        return;
    }

    // Space Key: Toggle Selection
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (highlightedIndex >= 0) {
            toggleSelectionIndex(highlightedIndex);
        }
        return;
    }

    // Zoom keys (+ / -)
    if (e.key === '+' || e.key === '=') {
        zoomLevel = Math.min(5.0, zoomLevel + 0.2);
        applyZoomPan();
        return;
    }
    if (e.key === '-' || e.key === '_') {
        zoomLevel = Math.max(0.2, zoomLevel - 0.2);
        applyZoomPan();
        return;
    }

    // GIF Frame keys (< and >)
    if (e.key === '<' || e.key === ',') {
        stepGifFrame(-1);
        return;
    }
    if (e.key === '>' || e.key === '.') {
        stepGifFrame(1);
        return;
    }

    // PageUp / PageDown Keys: Always navigate next/prev file in FullScreen mode, or scroll/navigate in normal mode
    if (e.key === 'PageUp' || e.key === 'PgUp') {
        e.preventDefault();
        navigateFile(-1);
        if (isFullScreen) updateFsInfo();
        return;
    }
    if (e.key === 'PageDown' || e.key === 'PgDn') {
        e.preventDefault();
        navigateFile(1);
        if (isFullScreen) updateFsInfo();
        return;
    }

    // Full Screen mode Arrow Keys: Next / Prev file
    if (isFullScreen) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            navigateFile(-1);
            updateFsInfo();
            return;
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            navigateFile(1);
            updateFsInfo();
            return;
        }
    } else {
        // Thumbnail mode Arrow Keys: Move cursor grid
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (highlightedIndex > 0) {
                highlightedIndex--;
                resetZoom();
                renderThumbnails();
                updatePreview();
                updateStatusBar();
            }
            return;
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (highlightedIndex < files.length - 1) {
                highlightedIndex++;
                resetZoom();
                renderThumbnails();
                updatePreview();
                updateStatusBar();
            }
            return;
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const grid = document.getElementById('thumb-grid');
            const colCount = Math.max(1, Math.floor(grid.clientWidth / 120));
            const delta = (e.key === 'ArrowDown') ? colCount : -colCount;
            const newIndex = highlightedIndex + delta;
            if (newIndex >= 0 && newIndex < files.length) {
                highlightedIndex = newIndex;
                resetZoom();
                renderThumbnails();
                updatePreview();
                updateStatusBar();
            }
            return;
        }
    }
}

// Update Status Bar Info
function updateStatusBar() {
    document.getElementById('info-folder').textContent = `Folder: ${currentPath || '-'}`;
    document.getElementById('info-selection').textContent = `${selectedPaths.size} selected of ${files.length} files`;

    if (highlightedIndex >= 0 && highlightedIndex < files.length) {
        const file = files[highlightedIndex];
        document.getElementById('info-file').textContent = `File: ${file.name}`;
        document.getElementById('info-dim').textContent = `Resolution: ${file.width > 0 ? file.width + 'x' + file.height : 'Unknown'}`;
        document.getElementById('info-size').textContent = `Size: ${formatFileSize(file.size)}`;
    } else {
        document.getElementById('info-file').textContent = 'File: -';
        document.getElementById('info-dim').textContent = 'Resolution: -';
        document.getElementById('info-size').textContent = 'Size: -';
    }
}

// Utilities
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

// Start app when DOM ready
window.addEventListener('DOMContentLoaded', initUI);
