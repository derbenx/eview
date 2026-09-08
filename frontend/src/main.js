import './style.css';
import {
    GetInitialTarget,
    GetDrives,
    GetDirectories,
    GetFilesInDirectory,
    GetFileBase64,
    GetFileDetails,
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

// View Mode & Fitting Mode
let isFullScreen = false;
let fullscreenFitMode = 'screen'; // 'screen' (/), 'actual' (*), 'width' (1), 'height' (3)

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
                <label><input type="checkbox" id="chk-folders" checked> folders</label>
            </div>
        </div>

        <!-- DRIVE & PATH BAR -->
        <div class="path-bar-container">
            <select class="drive-select" id="drive-select"></select>
            <button class="btn" id="btn-reload-drives" title="Reload Drives List">🔄</button>
            <input type="text" class="path-input" id="path-input" placeholder="Enter path and press Enter..." />
            <select class="sort-select" id="sort-select" title="Sort Order">
                <option value="name-asc">Name Asd</option>
                <option value="name-desc">Name Des</option>
                <option value="date-asc">Date Asd</option>
                <option value="date-desc">Date Des</option>
                <option value="size-asc">FSize Asd</option>
                <option value="size-desc">FSize Des</option>
                <option value="height-asc">Height Asd</option>
                <option value="height-desc">Height Des</option>
                <option value="width-asc">Width Asd</option>
                <option value="width-desc">Width Des</option>
            </select>
            <label class="chk-folders-first" title="Keep folders at top of list"><input type="checkbox" id="chk-folders-first" checked> folders first</label>
        </div>

        <!-- MASTER WORKSPACE -->
        <div class="workspace" id="workspace">
            <!-- LEFT SIDEBAR: DIRECTORY TREE -->
            <div class="sidebar-resizable" id="sidebar">
                <div class="pane-title">Folders</div>
                <ul class="tree-root" id="tree-root"></ul>
            </div>

            <!-- VERTICAL SPLITTER BAR -->
            <div class="splitter-vertical" id="splitter-v" title="Drag to resize folder sidebar"></div>

            <!-- RIGHT MAIN CONTENT -->
            <div class="main-content" id="main-content">
                <!-- TOP HALF: THUMBNAIL MATRIX -->
                <div class="pane-top-split" id="pane-top">
                    <div class="pane-title" id="thumb-pane-title">Thumbnails</div>
                    <div class="thumb-grid" id="thumb-grid"></div>
                </div>

                <!-- HORIZONTAL SPLITTER BAR -->
                <div class="splitter-horizontal" id="splitter-h" title="Drag to resize preview pane"></div>

                <!-- BOTTOM HALF: PREVIEW VIEWPORT -->
                <div class="preview-pane" id="preview-pane">
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
    const chkFolders = document.getElementById('chk-folders');

    const updateFilterGroup = () => {
        loadDirectoryFiles(currentPath);
    };

    chkImgs.onchange = updateFilterGroup;
    chkGif.onchange = updateFilterGroup;
    chkIco.onchange = updateFilterGroup;
    chkFolders.onchange = updateFilterGroup;

    // Drive & Path input
    document.getElementById('drive-select').onchange = (e) => {
        const drivePath = e.target.value;
        if (drivePath) {
            navigateToFolder(drivePath);
        }
    };

    document.getElementById('btn-reload-drives').onclick = () => {
        loadDrives();
    };

    document.getElementById('path-input').onkeydown = (e) => {
        if (e.key === 'Enter') {
            const inputPath = e.target.value.trim();
            if (inputPath) {
                navigateToFolder(inputPath);
            }
        }
    };

    document.getElementById('sort-select').onchange = () => {
        sortAndRenderFiles();
    };

    document.getElementById('chk-folders-first').onchange = () => {
        sortAndRenderFiles();
    };

    // Keyboard Shortcuts
    window.onkeydown = handleGlobalKeyDown;

    // Init Splitter Dragging & Position Restoring
    initSplitters();

    // Drag and drop setup for files/folders dropped onto app window
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', async (e) => {
        e.preventDefault();
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.path) {
                handleTargetPath(droppedFile.path);
            }
        }
    });

    // Listen for Wails runtime file drop event if emitted
    if (window.runtime && window.runtime.EventsOn) {
        window.runtime.EventsOn('file-dropped', (path) => {
            if (path) handleTargetPath(path);
        });
    }

    // Mouse Zoom & Pan strictly in Full Screen Overlay
    const fsOverlay = document.getElementById('fullscreen-overlay');

    fsOverlay.onwheel = handleWheelZoom;
    fsOverlay.onmousedown = handlePanStart;

    window.onmousemove = (e) => {
        handlePanMove(e);
        handleSplitterMove(e);
    };
    window.onmouseup = (e) => {
        handlePanEnd(e);
        handleSplitterEnd(e);
    };
}

// Helper: Get Active Category Filters
function getActiveAllowedTypes() {
    const allowed = [];
    if (document.getElementById('chk-imgs').checked) allowed.push('img');
    if (document.getElementById('chk-gif').checked) allowed.push('gif');
    if (document.getElementById('chk-ico').checked) allowed.push('ico');
    if (document.getElementById('chk-folders').checked) allowed.push('folders');
    return allowed;
}

// Process CLI Target / Dropped Path
async function handleTargetPath(pathStr) {
    try {
        const target = await GetInitialTarget(pathStr || '');
        if (target && target.directory) {
            const targetFile = target.isFile ? target.fileName : null;
            await navigateToFolder(target.directory, targetFile);
            return true;
        }
    } catch (err) {
        console.error('Failed to resolve target path:', err);
    }
    return false;
}

// Drives & Initial Load
async function loadDrives() {
    try {
        drives = await GetDrives();
        const driveSelect = document.getElementById('drive-select');
        driveSelect.innerHTML = drives.map(d => `<option value="${escapeHtml(d.path)}">${escapeHtml(d.label)}</option>`).join('');

        const handled = await handleTargetPath('');
        if (!handled && drives.length > 0) {
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
async function navigateToFolder(dirPath, targetFileName = null) {
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
    await loadDirectoryFiles(dirPath, targetFileName);
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
async function loadDirectoryFiles(dirPath, targetFileName = null) {
    if (!dirPath) return;

    const allowedTypes = getActiveAllowedTypes();
    try {
        files = await GetFilesInDirectory(dirPath, allowedTypes) || [];
        selectedPaths.clear();
        resetZoom();

        sortAndRenderFiles(targetFileName);
    } catch (err) {
        console.error('Failed to list files:', err);
        files = [];
        highlightedIndex = -1;
        renderThumbnails();
        updatePreview();
        updateStatusBar();
    }
}

// Sort files according to active sort-select and chk-folders-first options
function sortAndRenderFiles(targetFileName = null) {
    if (!files || files.length === 0) {
        highlightedIndex = -1;
        renderThumbnails();
        updatePreview();
        updateStatusBar();
        return;
    }

    const sortVal = document.getElementById('sort-select')?.value || 'name-asc';
    const foldersFirst = document.getElementById('chk-folders-first')?.checked ?? true;

    const [field, direction] = sortVal.split('-');
    const isAsc = direction === 'asc';

    // Helper comparator for 2 files
    const compareFiles = (a, b) => {
        let valA = a[field] ?? '';
        let valB = b[field] ?? '';

        if (field === 'name') {
            valA = (a.name || '').toLowerCase();
            valB = (b.name || '').toLowerCase();
        } else if (field === 'date') {
            valA = a.modTime || '';
            valB = b.modTime || '';
        } else if (field === 'size') {
            valA = a.size || 0;
            valB = b.size || 0;
        } else if (field === 'height') {
            valA = a.height || 0;
            valB = b.height || 0;
        } else if (field === 'width') {
            valA = a.width || 0;
            valB = b.width || 0;
        }

        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
    };

    // Keep track of previously highlighted file path
    const prevHighlightedPath = (highlightedIndex >= 0 && files[highlightedIndex]) ? files[highlightedIndex].path : null;

    if (foldersFirst) {
        const parentDir = files.filter(f => f.name === '..');
        const directories = files.filter(f => f.isDirectory && f.name !== '..').sort(compareFiles);
        const regularFiles = files.filter(f => !f.isDirectory).sort(compareFiles);

        files = [...parentDir, ...directories, ...regularFiles];
    } else {
        const parentDir = files.filter(f => f.name === '..');
        const rest = files.filter(f => f.name !== '..').sort(compareFiles);
        files = [...parentDir, ...rest];
    }

    // Restore or set target highlightedIndex
    if (targetFileName) {
        const targetIdx = files.findIndex(f => f.name.toLowerCase() === targetFileName.toLowerCase());
        highlightedIndex = targetIdx >= 0 ? targetIdx : (files.length > 0 ? 0 : -1);
    } else if (prevHighlightedPath) {
        const newIdx = files.findIndex(f => f.path === prevHighlightedPath);
        highlightedIndex = newIdx >= 0 ? newIdx : (files.length > 0 ? 0 : -1);
    } else {
        highlightedIndex = files.length > 0 ? 0 : -1;
    }

    renderThumbnails();
    updatePreview();
    updateStatusBar();
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
        if (file.isDirectory) icon = '📁';
        else if (file.isGif) icon = '🎞️';
        else if (file.extension === 'ico') icon = '💠';

        // Check if cached image is already available
        const cachedUrl = fileDataCache.get(file.path);
        const imgContent = (cachedUrl && !file.isDirectory)
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
            if (file && file.isDirectory) {
                navigateToFolder(file.path);
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                toggleSelectionIndex(idx);
            } else if (e.shiftKey && highlightedIndex >= 0) {
                const start = Math.min(highlightedIndex, idx);
                const end = Math.max(highlightedIndex, idx);
                for (let i = start; i <= end; i++) {
                    if (!files[i].isDirectory) {
                        selectedPaths.add(files[i].path);
                    }
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
            if (file && file.isDirectory) {
                navigateToFolder(file.path);
            } else {
                highlightedIndex = idx;
                if (!isFullScreen) {
                    toggleFullScreen();
                }
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

// Asynchronously load image for thumbnail (static for GIFs)
async function loadThumbnailImage(file, idx) {
    let dataUrl = fileDataCache.get(file.path);

    if (file.isGif) {
        let frames = gifFramesCache.get(file.path);
        if (!frames) {
            try {
                frames = await GetGIFFrames(file.path);
                gifFramesCache.set(file.path, frames);
            } catch (err) {}
        }
        if (frames && frames.length > 0) {
            dataUrl = frames[0];
        }
    }

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

    const file = files[highlightedIndex];
    if (file.isDirectory) {
        emptyMsg.textContent = 'Directory selected: ' + file.name;
        emptyMsg.style.display = 'block';
        imgEl.style.display = 'none';
        return;
    }

    emptyMsg.style.display = 'none';
    imgEl.style.display = 'block';

    let dataUrl = fileDataCache.get(file.path);
    if (!dataUrl || file.width === 0) {
        try {
            const details = await GetFileDetails(file.path);
            if (details) {
                dataUrl = details.dataUrl;
                file.width = details.width;
                file.height = details.height;
                fileDataCache.set(file.path, dataUrl);
                updateStatusBar();
            }
        } catch (err) {
            emptyMsg.textContent = 'Failed to load image preview';
            emptyMsg.style.display = 'block';
            imgEl.style.display = 'none';
            return;
        }
    }

    if (file.isGif) {
        let frames = gifFramesCache.get(file.path);
        if (!frames) {
            try {
                frames = await GetGIFFrames(file.path);
                gifFramesCache.set(file.path, frames);
            } catch (err) {}
        }

        if (frames && frames.length > 0) {
            currentGifFrames = frames;
            if (currentGifFrameIndex >= frames.length) {
                currentGifFrameIndex = 0;
            }

            if (isAnimated) {
                startGifAnimation();
            } else {
                const frameData = frames[currentGifFrameIndex];
                imgEl.src = frameData;
                if (isFullScreen) fsImgEl.src = frameData;
            }
            return;
        }
    }

    imgEl.src = dataUrl;
    if (isFullScreen) {
        fsImgEl.src = dataUrl;
    }
}

function startGifAnimation() {
    stopGifAnimation();
    if (!currentGifFrames || currentGifFrames.length === 0) return;

    const imgEl = document.getElementById('preview-image');
    const fsImgEl = document.getElementById('fullscreen-image');

    gifTimer = setInterval(() => {
        currentGifFrameIndex = (currentGifFrameIndex + 1) % currentGifFrames.length;
        const frameData = currentGifFrames[currentGifFrameIndex];
        if (imgEl) imgEl.src = frameData;
        if (isFullScreen && fsImgEl) fsImgEl.src = frameData;
        updateGifFrameStatus();
    }, 100);
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
        if (currentGifFrames && currentGifFrames.length > 0) {
            startGifAnimation();
        } else {
            updatePreview();
        }
    } else {
        btn.classList.remove('btn-active');
        stopGifAnimation();
        updateGifFrameStatus();
    }
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

    // Pause animation when stepping frames
    if (isAnimated) {
        isAnimated = false;
        const btn = document.getElementById('btn-animate');
        if (btn) btn.classList.remove('btn-active');
        stopGifAnimation();
    }

    currentGifFrames = frames;
    currentGifFrameIndex = (currentGifFrameIndex + direction + frames.length) % frames.length;

    const frameData = frames[currentGifFrameIndex];
    const imgEl = document.getElementById('preview-image');
    const fsImgEl = document.getElementById('fullscreen-image');
    if (imgEl) imgEl.src = frameData;
    if (isFullScreen && fsImgEl) fsImgEl.src = frameData;
    updateGifFrameStatus();
}

function updateGifFrameStatus() {
    const titleEl = document.getElementById('preview-pane-title');
    if (!titleEl) return;

    if (highlightedIndex >= 0 && files[highlightedIndex]?.isGif && currentGifFrames.length > 0) {
        const frameStr = `Frame ${currentGifFrameIndex + 1}/${currentGifFrames.length}`;
        const stateStr = isAnimated ? 'Playing' : 'Paused';
        titleEl.textContent = `Preview (${frameStr} - ${stateStr})`;
    } else {
        titleEl.textContent = 'Preview';
    }
}

// Navigation (Next / Prev / Home / End)
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

function navigateToBoundaryFile(position) {
    if (files.length === 0) return;

    const selectedIndices = [];
    files.forEach((f, idx) => {
        if (selectedPaths.has(f.path)) {
            selectedIndices.push(idx);
        }
    });

    if (selectedIndices.length > 0) {
        highlightedIndex = (position === 'first') ? selectedIndices[0] : selectedIndices[selectedIndices.length - 1];
    } else {
        highlightedIndex = (position === 'first') ? 0 : files.length - 1;
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
        fullscreenFitMode = 'screen';
        resetZoom();
        overlay.style.display = 'flex';
        updatePreview();
        updateFsInfo();
        applyFullscreenFitMode();
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

function setFullscreenFitMode(mode) {
    fullscreenFitMode = mode;
    resetZoom();
    applyFullscreenFitMode();
}

function applyFullscreenFitMode() {
    const fsImgEl = document.getElementById('fullscreen-image');
    if (!fsImgEl) return;

    fsImgEl.classList.remove('fit-screen', 'fit-actual', 'fit-width', 'fit-height');
    fsImgEl.classList.add(`fit-${fullscreenFitMode}`);
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

    // Enter key: Toggle full screen or navigate into folder
    if (e.key === 'Enter') {
        e.preventDefault();
        if (isFullScreen) {
            toggleFullScreen();
            return;
        }
        if (highlightedIndex >= 0 && highlightedIndex < files.length) {
            const file = files[highlightedIndex];
            if (file && file.isDirectory) {
                navigateToFolder(file.path);
            } else if (file) {
                toggleFullScreen();
            }
            return;
        }
    }

    // Backspace key: navigate to parent directory (same as ..)
    if (e.key === 'Backspace' && !isFullScreen) {
        e.preventDefault();
        if (currentPath) {
            let parentDir = currentPath.replace(/[/\\][^/\\]+[/\\]?$/, '');
            if (parentDir === '' && (currentPath.startsWith('/') || currentPath.startsWith('\\'))) {
                parentDir = '/';
            }
            if (parentDir && parentDir !== currentPath) {
                navigateToFolder(parentDir);
            }
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

    // Fullscreen Mode Specific Keys: Zoom, Fit Modes (/ * 1 3), and Panning
    if (isFullScreen) {
        if (e.key === '/') {
            e.preventDefault();
            setFullscreenFitMode('screen');
            return;
        }
        if (e.key === '*') {
            e.preventDefault();
            setFullscreenFitMode('actual');
            return;
        }
        if (e.key === '1') {
            e.preventDefault();
            setFullscreenFitMode('width');
            return;
        }
        if (e.key === '3') {
            e.preventDefault();
            setFullscreenFitMode('height');
            return;
        }

        if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            zoomLevel = Math.min(5.0, zoomLevel + 0.2);
            clampAndApplyPan();
            return;
        }
        if (e.key === '-' || e.key === '_') {
            e.preventDefault();
            zoomLevel = Math.max(0.5, zoomLevel - 0.2);
            clampAndApplyPan();
            return;
        }

        // Arrow keys in Fullscreen: Pan image if zoomed in, or navigate files if zoomLevel == 1.0
        if (zoomLevel > 1.0) {
            const panStep = 30;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                panX += panStep;
                clampAndApplyPan();
                return;
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                panX -= panStep;
                clampAndApplyPan();
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                panY += panStep;
                clampAndApplyPan();
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                panY -= panStep;
                clampAndApplyPan();
                return;
            }
        }
    }

    // Home / End Keys: Move to first / last image
    if (e.key === 'Home') {
        e.preventDefault();
        navigateToBoundaryFile('first');
        return;
    }
    if (e.key === 'End') {
        e.preventDefault();
        navigateToBoundaryFile('last');
        return;
    }

    // PageUp / PageDown Keys: Always navigate next/prev file
    if (e.key === 'PageUp' || e.key === 'PgUp') {
        e.preventDefault();
        navigateFile(-1);
        return;
    }
    if (e.key === 'PageDown' || e.key === 'PgDn') {
        e.preventDefault();
        navigateFile(1);
        return;
    }

    // Full Screen mode Arrow Keys when not zoomed in
    if (isFullScreen) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            navigateFile(-1);
            return;
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            navigateFile(1);
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
            const cards = grid.querySelectorAll('.thumb-card');

            let colCount = 1;
            if (cards.length > 1) {
                const firstTop = cards[0].offsetTop;
                for (let i = 1; i < cards.length; i++) {
                    if (cards[i].offsetTop > firstTop) {
                        colCount = i;
                        break;
                    }
                }
            }

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

    // GIF Frame keys (< and >)
    if (e.key === '<' || e.key === ',') {
        stepGifFrame(-1);
        return;
    }
    if (e.key === '>' || e.key === '.') {
        stepGifFrame(1);
        return;
    }
}

// Update Status Bar Info
function updateStatusBar() {
    document.getElementById('info-folder').textContent = `Folder: ${currentPath || '-'}`;
    document.getElementById('info-selection').textContent = `${selectedPaths.size} selected of ${files.length} files`;

    if (highlightedIndex >= 0 && highlightedIndex < files.length) {
        const file = files[highlightedIndex];
        document.getElementById('info-file').textContent = `File: ${file.name}`;
        if (file.isDirectory) {
            document.getElementById('info-dim').textContent = 'Resolution: -';
            document.getElementById('info-size').textContent = `Size: ${formatFileSize(file.size, true)}`;
        } else {
            document.getElementById('info-dim').textContent = `Resolution: ${file.width > 0 ? file.width + 'x' + file.height : 'Unknown'}`;
            document.getElementById('info-size').textContent = `Size: ${formatFileSize(file.size, false)}`;
        }
    } else {
        document.getElementById('info-file').textContent = 'File: -';
        document.getElementById('info-dim').textContent = 'Resolution: -';
        document.getElementById('info-size').textContent = 'Size: -';
    }
}

// Utilities
function formatFileSize(bytes, isDir = false) {
    if (isDir) return 'folder';
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

// Splitters Drag & Persistent Position State
let activeSplitter = null; // 'vertical' or 'horizontal'

function initSplitters() {
    const sidebar = document.getElementById('sidebar');
    const previewPane = document.getElementById('preview-pane');
    const splitterV = document.getElementById('splitter-v');
    const splitterH = document.getElementById('splitter-h');

    // Restore saved positions from localStorage
    const savedSidebarWidth = localStorage.getItem('eview_sidebar_width');
    if (savedSidebarWidth && sidebar) {
        sidebar.style.width = `${savedSidebarWidth}px`;
    }

    const savedPreviewHeight = localStorage.getItem('eview_preview_height');
    if (savedPreviewHeight && previewPane) {
        previewPane.style.height = `${savedPreviewHeight}px`;
    }

    if (splitterV) {
        splitterV.onmousedown = (e) => {
            e.preventDefault();
            activeSplitter = 'vertical';
            splitterV.classList.add('dragging');
        };
    }

    if (splitterH) {
        splitterH.onmousedown = (e) => {
            e.preventDefault();
            activeSplitter = 'horizontal';
            splitterH.classList.add('dragging');
        };
    }
}

function handleSplitterMove(e) {
    if (!activeSplitter) return;

    if (activeSplitter === 'vertical') {
        const workspace = document.getElementById('workspace');
        const sidebar = document.getElementById('sidebar');
        if (workspace && sidebar) {
            const rect = workspace.getBoundingClientRect();
            const newWidth = Math.max(120, Math.min(rect.width - 200, e.clientX - rect.left));
            sidebar.style.width = `${newWidth}px`;
            localStorage.setItem('eview_sidebar_width', newWidth);
        }
    } else if (activeSplitter === 'horizontal') {
        const mainContent = document.getElementById('main-content');
        const previewPane = document.getElementById('preview-pane');
        if (mainContent && previewPane) {
            const rect = mainContent.getBoundingClientRect();
            const newHeight = Math.max(80, Math.min(rect.height - 100, rect.bottom - e.clientY));
            previewPane.style.height = `${newHeight}px`;
            localStorage.setItem('eview_preview_height', newHeight);
        }
    }
}

function handleSplitterEnd() {
    if (activeSplitter) {
        document.getElementById('splitter-v')?.classList.remove('dragging');
        document.getElementById('splitter-h')?.classList.remove('dragging');
        activeSplitter = null;
    }
}

// Start app when DOM ready
window.addEventListener('DOMContentLoaded', initUI);
