(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))l(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&l(c)}).observe(document,{childList:!0,subtree:!0});function n(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerpolicy&&(o.referrerPolicy=i.referrerpolicy),i.crossorigin==="use-credentials"?o.credentials="include":i.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function l(i){if(i.ep)return;i.ep=!0;const o=n(i);fetch(i.href,o)}})();function X(){return window.go.main.App.GetDrives()}function Q(e){return window.go.main.App.GetDirectories(e)}function Z(e,t){return window.go.main.App.GetFilesInDirectory(e,t)}function j(e){return window.go.main.App.GetFileBase64(e)}function J(e){return window.go.main.App.GetFileDetails(e)}function H(e){return window.go.main.App.GetGIFFrames(e)}function ee(e,t){return window.go.main.App.RenameFile(e,t)}function U(){return window.go.main.App.QuitApp()}let p="",g=[],s=[],a=-1,h=new Set,F=new Map,A=new Map,D=!0,G=0,u=1,b=0,w=0,N=!1,W=0,Y=0,d=!1,S=new Set,P=new Map,$=null;function te(){const e=document.getElementById("app");e.innerHTML=`
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
            <input type="text" class="path-input" id="path-input" placeholder="Enter path and press Enter..." />
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
    `,ne(),le()}function ne(){document.getElementById("btn-prev").onclick=()=>B(-1),document.getElementById("btn-next").onclick=()=>B(1),document.getElementById("btn-frame-back").onclick=()=>C(-1),document.getElementById("btn-frame-fwd").onclick=()=>C(1),document.getElementById("btn-animate").onclick=ce,document.getElementById("btn-fullscreen").onclick=O,document.getElementById("btn-select-all").onclick=se,document.getElementById("btn-select-none").onclick=re;const e=document.getElementById("chk-imgs"),t=document.getElementById("chk-gif"),n=document.getElementById("chk-ico"),l=document.getElementById("chk-folders"),i=()=>{z(p)};e.onchange=i,t.onchange=i,n.onchange=i,l.onchange=i,document.getElementById("drive-select").onchange=c=>{const r=c.target.value;r&&I(r)},document.getElementById("path-input").onkeydown=c=>{if(c.key==="Enter"){const r=c.target.value.trim();r&&I(r)}},window.onkeydown=ye,ve();const o=document.getElementById("fullscreen-overlay");o.onwheel=de,o.onmousedown=ue,window.onmousemove=c=>{me(c),be(c)},window.onmouseup=c=>{fe(),we()}}function ie(){const e=[];return document.getElementById("chk-imgs").checked&&e.push("img"),document.getElementById("chk-gif").checked&&e.push("gif"),document.getElementById("chk-ico").checked&&e.push("ico"),document.getElementById("chk-folders").checked&&e.push("folders"),e}async function le(){try{g=await X();const e=document.getElementById("drive-select");e.innerHTML=g.map(t=>`<option value="${E(t.path)}">${E(t.label)}</option>`).join(""),g.length>0&&(e.value=g[0].path,I(g[0].path))}catch(e){console.error("Failed to get drives:",e)}}function oe(){const e=document.getElementById("drive-select");return e?e.value:g[0]?g[0].path:""}async function I(e){p=e,document.getElementById("path-input").value=e;const t=document.getElementById("drive-select");if(t&&g.length>0){const n=g.find(l=>e.toLowerCase().startsWith(l.path.toLowerCase()));n&&t.value!==n.path&&(t.value=n.path)}S.add(e),q(),z(e)}async function q(){const e=document.getElementById("tree-root"),t=oe();if(!t)return;const n=g.find(i=>i.path===t)||{path:t,label:t};let l=await _(n.path,n.label,0);e.innerHTML=l,e.querySelectorAll(".tree-node-item").forEach(i=>{i.onclick=o=>{o.stopPropagation();const c=i.dataset.path;o.target.classList.contains("tree-expander")?(S.has(c)?S.delete(c):S.add(c),q()):I(c)}})}async function _(e,t,n){const l=S.has(e),i=p===e,o=n*14;let c="";if(l){if(!P.has(e))try{const M=await Q(e);P.set(e,M||[])}catch{P.set(e,[])}const R=P.get(e);for(const M of R)c+=await _(M.path,M.name,n+1)}const r=l?"\u25BC":"\u25B6";return`
        <li>
            <div class="tree-node-item ${i?"active":""}" data-path="${E(e)}" style="padding-left: ${o+6}px;">
                <span class="tree-expander">${r}</span>
                <span>\u{1F4C1} ${E(t)}</span>
            </div>
            ${l?`<ul style="list-style: none;">${c}</ul>`:""}
        </li>
    `}async function z(e){if(!e)return;const t=ie();try{s=await Z(e,t)||[],a=s.length>0?0:-1,h.clear(),L(),f(),y(),m()}catch(n){console.error("Failed to list files:",n),s=[],a=-1,f(),y(),m()}}let T=null;function f(){const e=document.getElementById("thumb-grid");if(s.length===0){e.innerHTML='<div style="grid-column: 1 / -1; color: #666; font-size: 13px; padding: 20px; text-align: center;">No matching files in this directory</div>';return}if(T&&T.disconnect(),T=new IntersectionObserver(t=>{t.forEach(n=>{if(n.isIntersecting){const l=n.target,i=parseInt(l.dataset.index,10);s[i]&&ae(s[i],i),T.unobserve(l)}})},{root:e,rootMargin:"100px"}),e.innerHTML=s.map((t,n)=>{const l=n===a,i=h.has(t.path);let o="\u{1F5BC}\uFE0F";t.isDirectory?o="\u{1F4C1}":t.isGif?o="\u{1F39E}\uFE0F":t.extension==="ico"&&(o="\u{1F4A0}");const c=F.get(t.path),r=c&&!t.isDirectory?`<img src="${c}" class="thumb-img" alt="${E(t.name)}" draggable="false" />`:`<div class="thumb-icon-placeholder">${o}</div>`;return`
            <div class="thumb-card ${l?"highlighted":""} ${i?"selected":""}"
                 data-index="${n}" id="thumb-card-${n}">
                <div class="thumb-img-wrapper" id="thumb-img-wrapper-${n}">
                    ${r}
                </div>
                <div class="thumb-label" title="${E(t.name)}">${E(t.name)}</div>
            </div>
        `}).join(""),e.querySelectorAll(".thumb-card").forEach(t=>{const n=parseInt(t.dataset.index,10),l=s[n];l&&!F.has(l.path)&&T.observe(t),t.onclick=i=>{if(l&&l.isDirectory){I(l.path);return}if(i.ctrlKey||i.metaKey)K(n);else if(i.shiftKey&&a>=0){const o=Math.min(a,n),c=Math.max(a,n);for(let r=o;r<=c;r++)s[r].isDirectory||h.add(s[r].path);a=n,f(),y(),m()}else a=n,f(),y(),m()},t.ondblclick=i=>{i.stopPropagation(),l&&l.isDirectory?I(l.path):(a=n,d||O())}}),a>=0){const t=document.getElementById(`thumb-card-${a}`);t&&t.scrollIntoView({block:"nearest",behavior:"smooth"})}}async function ae(e,t){let n=F.get(e.path);if(e.isGif){let i=A.get(e.path);if(!i)try{i=await H(e.path),A.set(e.path,i)}catch{}i&&i.length>0&&(n=i[0])}if(!n)try{n=await j(e.path),F.set(e.path,n)}catch{return}const l=document.getElementById(`thumb-img-wrapper-${t}`);l&&(l.innerHTML=`<img src="${n}" class="thumb-img" alt="${E(e.name)}" draggable="false" />`)}async function y(){const e=document.getElementById("empty-preview-msg"),t=document.getElementById("preview-image"),n=document.getElementById("fullscreen-image");if(a<0||a>=s.length){e.style.display="block",t.style.display="none";return}const l=s[a];if(l.isDirectory){e.textContent="Directory selected: "+l.name,e.style.display="block",t.style.display="none";return}e.style.display="none",t.style.display="block";let i=F.get(l.path);if(!i||l.width===0)try{const o=await J(l.path);o&&(i=o.dataUrl,l.width=o.width,l.height=o.height,F.set(l.path,i),m())}catch{e.textContent="Failed to load image preview",e.style.display="block",t.style.display="none";return}if(l.isGif&&!D){let o=A.get(l.path);if(!o)try{o=await H(l.path),A.set(l.path,o)}catch{}o&&o.length>0&&(i=o[0])}t.src=i,d&&(n.src=i)}function ce(){D=!D;const e=document.getElementById("btn-animate");D?e.classList.add("btn-active"):e.classList.remove("btn-active"),y()}async function C(e){var c;if(a<0||!((c=s[a])!=null&&c.isGif))return;const t=s[a];let n=A.get(t.path);if(!n)try{n=await H(t.path),A.set(t.path,n)}catch{return}if(!n||n.length===0)return;if(D){D=!1;const r=document.getElementById("btn-animate");r&&r.classList.remove("btn-active")}G=(G+e+n.length)%n.length;const l=n[G],i=document.getElementById("preview-image"),o=document.getElementById("fullscreen-image");i&&(i.src=l),d&&o&&(o.src=l)}function B(e){if(s.length===0)return;const t=[];if(s.forEach((n,l)=>{h.has(n.path)&&t.push(l)}),t.length>0){let n=t.indexOf(a);n===-1?n=e>0?0:t.length-1:n=(n+e+t.length)%t.length,a=t[n]}else a=(a+e+s.length)%s.length;L(),f(),y(),m()}function K(e){if(e<0||e>=s.length)return;const t=s[e].path;h.has(t)?h.delete(t):h.add(t),f(),m()}function se(){s.forEach(e=>h.add(e.path)),f(),m()}function re(){h.clear(),f(),m()}function de(e){if(!d)return;e.preventDefault();const t=e.deltaY>0?-.1:.1;u=Math.max(1,Math.min(5,u+t)),v()}function ue(e){!d||e.button!==0||(N=!0,W=e.clientX-b,Y=e.clientY-w)}function me(e){!d||!N||(b=e.clientX-W,w=e.clientY-Y,v())}function fe(){N=!1}function L(){u=1,b=0,w=0,v()}function v(){const e=document.getElementById("fullscreen-image"),t=document.getElementById("fullscreen-overlay");if(e&&t){if(u<=1)b=0,w=0;else{const l=t.clientWidth,i=t.clientHeight,o=e.offsetWidth||l,c=e.offsetHeight||i,r=Math.max(0,(o*u-l)/2),R=Math.max(0,(c*u-i)/2);b=Math.max(-r,Math.min(r,b)),w=Math.max(-R,Math.min(R,w))}e.style.transform=`translate(${b}px, ${w}px) scale(${u})`}const n=document.getElementById("preview-image");n&&(n.style.transform="none")}function O(){d=!d;const e=document.getElementById("fullscreen-overlay");d?(e.style.display="flex",y(),pe(),document.documentElement.requestFullscreen?document.documentElement.requestFullscreen().catch(()=>{}):document.documentElement.webkitRequestFullscreen&&document.documentElement.webkitRequestFullscreen().catch(()=>{})):(e.style.display="none",document.fullscreenElement&&document.exitFullscreen?document.exitFullscreen().catch(()=>{}):document.webkitFullscreenElement&&document.webkitExitFullscreen&&document.webkitExitFullscreen().catch(()=>{}))}document.addEventListener("fullscreenchange",()=>{!document.fullscreenElement&&d&&(d=!1,document.getElementById("fullscreen-overlay").style.display="none")});function pe(){if(a>=0&&a<s.length){const e=s[a];document.getElementById("fs-file-info").textContent=`${e.name} (${e.width}x${e.height} | ${V(e.size)})`}}function ge(){$="quit";const e=document.getElementById("modal-overlay"),t=document.getElementById("modal-card");t.innerHTML=`
        <div class="modal-title">Quit Application</div>
        <div class="modal-body">Are you sure you want to quit eview? (y/n)</div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">No (N)</button>
            <button class="btn btn-active" id="modal-confirm">Yes (Y)</button>
        </div>
    `,e.style.display="flex",document.getElementById("modal-cancel").onclick=x,document.getElementById("modal-confirm").onclick=()=>U()}function he(){if(a<0||a>=s.length)return;const e=s[a];$="rename";const t=document.getElementById("modal-overlay"),n=document.getElementById("modal-card");n.innerHTML=`
        <div class="modal-title">Rename File</div>
        <div class="modal-body">
            Enter new file name:
            <input type="text" class="modal-input" id="rename-input" value="${E(e.name)}" />
        </div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">Cancel</button>
            <button class="btn btn-active" id="modal-confirm">Rename</button>
        </div>
    `,t.style.display="flex";const l=document.getElementById("rename-input");l.focus(),l.select();const i=async()=>{const o=l.value.trim();if(o&&o!==e.name)try{await ee(e.path,o),x(),z(p)}catch(c){alert("Rename failed: "+c)}else x()};document.getElementById("modal-cancel").onclick=x,document.getElementById("modal-confirm").onclick=i,l.onkeydown=o=>{o.key==="Enter"&&i(),o.key==="Escape"&&x()}}function x(){$=null,document.getElementById("modal-overlay").style.display="none"}function ye(e){if(!(e.target.tagName==="INPUT"&&e.target.id!=="rename-input")){if($==="quit"){e.key==="y"||e.key==="Y"||e.key==="Enter"?U():(e.key==="n"||e.key==="N"||e.key==="Escape")&&x();return}if(!$){if(e.ctrlKey&&(e.key==="f"||e.key==="F")||e.key==="F11"){e.preventDefault(),O();return}if(e.key==="Escape"){d?O():ge();return}if(e.key==="Enter"&&!d&&a>=0&&a<s.length){const t=s[a];if(t&&t.isDirectory){e.preventDefault(),I(t.path);return}}if(e.key==="Backspace"&&!d){if(e.preventDefault(),p){let t=p.replace(/[/\\][^/\\]+[/\\]?$/,"");t===""&&(p.startsWith("/")||p.startsWith("\\"))&&(t="/"),t&&t!==p&&I(t)}return}if(e.key==="F2"){e.preventDefault(),he();return}if(e.key===" "||e.code==="Space"){e.preventDefault(),a>=0&&K(a);return}if(d){if(e.key==="+"||e.key==="="){e.preventDefault(),u=Math.min(5,u+.2),v();return}if(e.key==="-"||e.key==="_"){e.preventDefault(),u=Math.max(1,u-.2),v();return}if(u>1){if(e.key==="ArrowLeft"){e.preventDefault(),b+=30,v();return}if(e.key==="ArrowRight"){e.preventDefault(),b-=30,v();return}if(e.key==="ArrowUp"){e.preventDefault(),w+=30,v();return}if(e.key==="ArrowDown"){e.preventDefault(),w-=30,v();return}}}if(e.key==="PageUp"||e.key==="PgUp"){e.preventDefault(),B(-1);return}if(e.key==="PageDown"||e.key==="PgDn"){e.preventDefault(),B(1);return}if(d){if(e.key==="ArrowUp"||e.key==="ArrowLeft"){e.preventDefault(),B(-1);return}if(e.key==="ArrowDown"||e.key==="ArrowRight"){e.preventDefault(),B(1);return}}else{if(e.key==="ArrowLeft"){e.preventDefault(),a>0&&(a--,L(),f(),y(),m());return}if(e.key==="ArrowRight"){e.preventDefault(),a<s.length-1&&(a++,L(),f(),y(),m());return}if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();const n=document.getElementById("thumb-grid").querySelectorAll(".thumb-card");let l=1;if(n.length>1){const c=n[0].offsetTop;for(let r=1;r<n.length;r++)if(n[r].offsetTop>c){l=r;break}}const i=e.key==="ArrowDown"?l:-l,o=a+i;o>=0&&o<s.length&&(a=o,L(),f(),y(),m());return}}if(e.key==="<"||e.key===","){C(-1);return}if(e.key===">"||e.key==="."){C(1);return}}}}function m(){if(document.getElementById("info-folder").textContent=`Folder: ${p||"-"}`,document.getElementById("info-selection").textContent=`${h.size} selected of ${s.length} files`,a>=0&&a<s.length){const e=s[a];document.getElementById("info-file").textContent=`File: ${e.name}`,document.getElementById("info-dim").textContent=`Resolution: ${e.width>0?e.width+"x"+e.height:"Unknown"}`,document.getElementById("info-size").textContent=`Size: ${V(e.size)}`}else document.getElementById("info-file").textContent="File: -",document.getElementById("info-dim").textContent="Resolution: -",document.getElementById("info-size").textContent="Size: -"}function V(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],l=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,l)).toFixed(1))+" "+n[l]}function E(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}let k=null;function ve(){const e=document.getElementById("sidebar"),t=document.getElementById("preview-pane"),n=document.getElementById("splitter-v"),l=document.getElementById("splitter-h"),i=localStorage.getItem("eview_sidebar_width");i&&e&&(e.style.width=`${i}px`);const o=localStorage.getItem("eview_preview_height");o&&t&&(t.style.height=`${o}px`),n&&(n.onmousedown=c=>{c.preventDefault(),k="vertical",n.classList.add("dragging")}),l&&(l.onmousedown=c=>{c.preventDefault(),k="horizontal",l.classList.add("dragging")})}function be(e){if(!!k){if(k==="vertical"){const t=document.getElementById("workspace"),n=document.getElementById("sidebar");if(t&&n){const l=t.getBoundingClientRect(),i=Math.max(120,Math.min(l.width-200,e.clientX-l.left));n.style.width=`${i}px`,localStorage.setItem("eview_sidebar_width",i)}}else if(k==="horizontal"){const t=document.getElementById("main-content"),n=document.getElementById("preview-pane");if(t&&n){const l=t.getBoundingClientRect(),i=Math.max(80,Math.min(l.height-100,l.bottom-e.clientY));n.style.height=`${i}px`,localStorage.setItem("eview_preview_height",i)}}}}function we(){var e,t;k&&((e=document.getElementById("splitter-v"))==null||e.classList.remove("dragging"),(t=document.getElementById("splitter-h"))==null||t.classList.remove("dragging"),k=null)}window.addEventListener("DOMContentLoaded",te);
