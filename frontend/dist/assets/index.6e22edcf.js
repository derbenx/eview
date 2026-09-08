(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);new MutationObserver(l=>{for(const a of l)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function n(l){const a={};return l.integrity&&(a.integrity=l.integrity),l.referrerpolicy&&(a.referrerPolicy=l.referrerpolicy),l.crossorigin==="use-credentials"?a.credentials="include":l.crossorigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(l){if(l.ep)return;l.ep=!0;const a=n(l);fetch(l.href,a)}})();function ee(e){return window.go.main.App.GetInitialTarget(e)}function te(){return window.go.main.App.GetDrives()}function ne(e){return window.go.main.App.GetDirectories(e)}function ie(e,t){return window.go.main.App.GetFilesInDirectory(e,t)}function le(e){return window.go.main.App.GetFileBase64(e)}function ae(e){return window.go.main.App.GetFileDetails(e)}function z(e){return window.go.main.App.GetGIFFrames(e)}function oe(e,t){return window.go.main.App.RenameFile(e,t)}function _(){return window.go.main.App.QuitApp()}let h="",y=[],s=[],r=-1,g=new Set,T=new Map,M=new Map,A=!0,N=0,m=1,w=0,b=0,U=!1,K=0,V=0,d=!1,W="screen",$=new Set,C=new Map,R=null;function re(){const e=document.getElementById("app");e.innerHTML=`
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
    `,se(),de()}function se(){document.getElementById("btn-prev").onclick=()=>F(-1),document.getElementById("btn-next").onclick=()=>F(1),document.getElementById("btn-frame-back").onclick=()=>G(-1),document.getElementById("btn-frame-fwd").onclick=()=>G(1),document.getElementById("btn-animate").onclick=me,document.getElementById("btn-fullscreen").onclick=D,document.getElementById("btn-select-all").onclick=pe,document.getElementById("btn-select-none").onclick=ge;const e=document.getElementById("chk-imgs"),t=document.getElementById("chk-gif"),n=document.getElementById("chk-ico"),i=document.getElementById("chk-folders"),l=()=>{Y(h)};e.onchange=l,t.onchange=l,n.onchange=l,i.onchange=l,document.getElementById("drive-select").onchange=o=>{const c=o.target.value;c&&I(c)},document.getElementById("path-input").onkeydown=o=>{if(o.key==="Enter"){const c=o.target.value.trim();c&&I(c)}},window.onkeydown=ke,Be(),window.addEventListener("dragover",o=>o.preventDefault()),window.addEventListener("drop",async o=>{if(o.preventDefault(),o.dataTransfer&&o.dataTransfer.files&&o.dataTransfer.files.length>0){const c=o.dataTransfer.files[0];c.path&&H(c.path)}}),window.runtime&&window.runtime.EventsOn&&window.runtime.EventsOn("file-dropped",o=>{o&&H(o)});const a=document.getElementById("fullscreen-overlay");a.onwheel=he,a.onmousedown=ye,window.onmousemove=o=>{ve(o),Fe(o)},window.onmouseup=o=>{we(),De()}}function ce(){const e=[];return document.getElementById("chk-imgs").checked&&e.push("img"),document.getElementById("chk-gif").checked&&e.push("gif"),document.getElementById("chk-ico").checked&&e.push("ico"),document.getElementById("chk-folders").checked&&e.push("folders"),e}async function H(e){try{const t=await ee(e||"");if(t&&t.directory){if(await I(t.directory),t.isFile&&t.fileName){const n=s.findIndex(i=>i.name.toLowerCase()===t.fileName.toLowerCase());n>=0&&(r=n,f(),p(),u())}return!0}}catch(t){console.error("Failed to resolve target path:",t)}return!1}async function de(){try{y=await te();const e=document.getElementById("drive-select");e.innerHTML=y.map(n=>`<option value="${E(n.path)}">${E(n.label)}</option>`).join(""),!await H("")&&y.length>0&&(e.value=y[0].path,I(y[0].path))}catch(e){console.error("Failed to get drives:",e)}}function ue(){const e=document.getElementById("drive-select");return e?e.value:y[0]?y[0].path:""}async function I(e){h=e,document.getElementById("path-input").value=e;const t=document.getElementById("drive-select");if(t&&y.length>0){const n=y.find(i=>e.toLowerCase().startsWith(i.path.toLowerCase()));n&&t.value!==n.path&&(t.value=n.path)}$.add(e),X(),Y(e)}async function X(){const e=document.getElementById("tree-root"),t=ue();if(!t)return;const n=y.find(l=>l.path===t)||{path:t,label:t};let i=await Q(n.path,n.label,0);e.innerHTML=i,e.querySelectorAll(".tree-node-item").forEach(l=>{l.onclick=a=>{a.stopPropagation();const o=l.dataset.path;a.target.classList.contains("tree-expander")?($.has(o)?$.delete(o):$.add(o),X()):I(o)}})}async function Q(e,t,n){const i=$.has(e),l=h===e,a=n*14;let o="";if(i){if(!C.has(e))try{const L=await ne(e);C.set(e,L||[])}catch{C.set(e,[])}const P=C.get(e);for(const L of P)o+=await Q(L.path,L.name,n+1)}const c=i?"\u25BC":"\u25B6";return`
        <li>
            <div class="tree-node-item ${l?"active":""}" data-path="${E(e)}" style="padding-left: ${a+6}px;">
                <span class="tree-expander">${c}</span>
                <span>\u{1F4C1} ${E(t)}</span>
            </div>
            ${i?`<ul style="list-style: none;">${o}</ul>`:""}
        </li>
    `}async function Y(e){if(!e)return;const t=ce();try{s=await ie(e,t)||[],r=s.length>0?0:-1,g.clear(),k(),f(),p(),u()}catch(n){console.error("Failed to list files:",n),s=[],r=-1,f(),p(),u()}}let S=null;function f(){const e=document.getElementById("thumb-grid");if(s.length===0){e.innerHTML='<div style="grid-column: 1 / -1; color: #666; font-size: 13px; padding: 20px; text-align: center;">No matching files in this directory</div>';return}if(S&&S.disconnect(),S=new IntersectionObserver(t=>{t.forEach(n=>{if(n.isIntersecting){const i=n.target,l=parseInt(i.dataset.index,10);s[l]&&fe(s[l],l),S.unobserve(i)}})},{root:e,rootMargin:"100px"}),e.innerHTML=s.map((t,n)=>{const i=n===r,l=g.has(t.path);let a="\u{1F5BC}\uFE0F";t.isDirectory?a="\u{1F4C1}":t.isGif?a="\u{1F39E}\uFE0F":t.extension==="ico"&&(a="\u{1F4A0}");const o=T.get(t.path),c=o&&!t.isDirectory?`<img src="${o}" class="thumb-img" alt="${E(t.name)}" draggable="false" />`:`<div class="thumb-icon-placeholder">${a}</div>`;return`
            <div class="thumb-card ${i?"highlighted":""} ${l?"selected":""}"
                 data-index="${n}" id="thumb-card-${n}">
                <div class="thumb-img-wrapper" id="thumb-img-wrapper-${n}">
                    ${c}
                </div>
                <div class="thumb-label" title="${E(t.name)}">${E(t.name)}</div>
            </div>
        `}).join(""),e.querySelectorAll(".thumb-card").forEach(t=>{const n=parseInt(t.dataset.index,10),i=s[n];i&&!T.has(i.path)&&S.observe(t),t.onclick=l=>{if(i&&i.isDirectory){I(i.path);return}if(l.ctrlKey||l.metaKey)Z(n);else if(l.shiftKey&&r>=0){const a=Math.min(r,n),o=Math.max(r,n);for(let c=a;c<=o;c++)s[c].isDirectory||g.add(s[c].path);r=n,f(),p(),u()}else r=n,f(),p(),u()},t.ondblclick=l=>{l.stopPropagation(),i&&i.isDirectory?I(i.path):(r=n,d||D())}}),r>=0){const t=document.getElementById(`thumb-card-${r}`);t&&t.scrollIntoView({block:"nearest",behavior:"smooth"})}}async function fe(e,t){let n=T.get(e.path);if(e.isGif){let l=M.get(e.path);if(!l)try{l=await z(e.path),M.set(e.path,l)}catch{}l&&l.length>0&&(n=l[0])}if(!n)try{n=await le(e.path),T.set(e.path,n)}catch{return}const i=document.getElementById(`thumb-img-wrapper-${t}`);i&&(i.innerHTML=`<img src="${n}" class="thumb-img" alt="${E(e.name)}" draggable="false" />`)}async function p(){const e=document.getElementById("empty-preview-msg"),t=document.getElementById("preview-image"),n=document.getElementById("fullscreen-image");if(r<0||r>=s.length){e.style.display="block",t.style.display="none";return}const i=s[r];if(i.isDirectory){e.textContent="Directory selected: "+i.name,e.style.display="block",t.style.display="none";return}e.style.display="none",t.style.display="block";let l=T.get(i.path);if(!l||i.width===0)try{const a=await ae(i.path);a&&(l=a.dataUrl,i.width=a.width,i.height=a.height,T.set(i.path,l),u())}catch{e.textContent="Failed to load image preview",e.style.display="block",t.style.display="none";return}if(i.isGif&&!A){let a=M.get(i.path);if(!a)try{a=await z(i.path),M.set(i.path,a)}catch{}a&&a.length>0&&(l=a[0])}t.src=l,d&&(n.src=l)}function me(){A=!A;const e=document.getElementById("btn-animate");A?e.classList.add("btn-active"):e.classList.remove("btn-active"),p()}async function G(e){var o;if(r<0||!((o=s[r])!=null&&o.isGif))return;const t=s[r];let n=M.get(t.path);if(!n)try{n=await z(t.path),M.set(t.path,n)}catch{return}if(!n||n.length===0)return;if(A){A=!1;const c=document.getElementById("btn-animate");c&&c.classList.remove("btn-active")}N=(N+e+n.length)%n.length;const i=n[N],l=document.getElementById("preview-image"),a=document.getElementById("fullscreen-image");l&&(l.src=i),d&&a&&(a.src=i)}function F(e){if(s.length===0)return;const t=[];if(s.forEach((n,i)=>{g.has(n.path)&&t.push(i)}),t.length>0){let n=t.indexOf(r);n===-1?n=e>0?0:t.length-1:n=(n+e+t.length)%t.length,r=t[n]}else r=(r+e+s.length)%s.length;k(),f(),p(),u()}function q(e){if(s.length===0)return;const t=[];s.forEach((n,i)=>{g.has(n.path)&&t.push(i)}),t.length>0?r=e==="first"?t[0]:t[t.length-1]:r=e==="first"?0:s.length-1,k(),f(),p(),u()}function Z(e){if(e<0||e>=s.length)return;const t=s[e].path;g.has(t)?g.delete(t):g.add(t),f(),u()}function pe(){s.forEach(e=>g.add(e.path)),f(),u()}function ge(){g.clear(),f(),u()}function he(e){if(!d)return;e.preventDefault();const t=e.deltaY>0?-.1:.1;m=Math.max(1,Math.min(5,m+t)),v()}function ye(e){!d||e.button!==0||(U=!0,K=e.clientX-w,V=e.clientY-b)}function ve(e){!d||!U||(w=e.clientX-K,b=e.clientY-V,v())}function we(){U=!1}function k(){m=1,w=0,b=0,v()}function v(){const e=document.getElementById("fullscreen-image"),t=document.getElementById("fullscreen-overlay");if(e&&t){if(m<=1)w=0,b=0;else{const i=t.clientWidth,l=t.clientHeight,a=e.offsetWidth||i,o=e.offsetHeight||l,c=Math.max(0,(a*m-i)/2),P=Math.max(0,(o*m-l)/2);w=Math.max(-c,Math.min(c,w)),b=Math.max(-P,Math.min(P,b))}e.style.transform=`translate(${w}px, ${b}px) scale(${m})`}const n=document.getElementById("preview-image");n&&(n.style.transform="none")}function D(){d=!d;const e=document.getElementById("fullscreen-overlay");d?(W="screen",k(),e.style.display="flex",p(),be(),j(),document.documentElement.requestFullscreen?document.documentElement.requestFullscreen().catch(()=>{}):document.documentElement.webkitRequestFullscreen&&document.documentElement.webkitRequestFullscreen().catch(()=>{})):(e.style.display="none",document.fullscreenElement&&document.exitFullscreen?document.exitFullscreen().catch(()=>{}):document.webkitFullscreenElement&&document.webkitExitFullscreen&&document.webkitExitFullscreen().catch(()=>{}))}function O(e){W=e,k(),j()}function j(){const e=document.getElementById("fullscreen-image");!e||(e.classList.remove("fit-screen","fit-actual","fit-width","fit-height"),e.classList.add(`fit-${W}`))}document.addEventListener("fullscreenchange",()=>{!document.fullscreenElement&&d&&(d=!1,document.getElementById("fullscreen-overlay").style.display="none")});function be(){if(r>=0&&r<s.length){const e=s[r];document.getElementById("fs-file-info").textContent=`${e.name} (${e.width}x${e.height} | ${J(e.size)})`}}function Ee(){R="quit";const e=document.getElementById("modal-overlay"),t=document.getElementById("modal-card");t.innerHTML=`
        <div class="modal-title">Quit Application</div>
        <div class="modal-body">Are you sure you want to quit eview? (y/n)</div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">No (N)</button>
            <button class="btn btn-active" id="modal-confirm">Yes (Y)</button>
        </div>
    `,e.style.display="flex",document.getElementById("modal-cancel").onclick=x,document.getElementById("modal-confirm").onclick=()=>_()}function Ie(){if(r<0||r>=s.length)return;const e=s[r];R="rename";const t=document.getElementById("modal-overlay"),n=document.getElementById("modal-card");n.innerHTML=`
        <div class="modal-title">Rename File</div>
        <div class="modal-body">
            Enter new file name:
            <input type="text" class="modal-input" id="rename-input" value="${E(e.name)}" />
        </div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">Cancel</button>
            <button class="btn btn-active" id="modal-confirm">Rename</button>
        </div>
    `,t.style.display="flex";const i=document.getElementById("rename-input");i.focus(),i.select();const l=async()=>{const a=i.value.trim();if(a&&a!==e.name)try{await oe(e.path,a),x(),Y(h)}catch(o){alert("Rename failed: "+o)}else x()};document.getElementById("modal-cancel").onclick=x,document.getElementById("modal-confirm").onclick=l,i.onkeydown=a=>{a.key==="Enter"&&l(),a.key==="Escape"&&x()}}function x(){R=null,document.getElementById("modal-overlay").style.display="none"}function ke(e){if(!(e.target.tagName==="INPUT"&&e.target.id!=="rename-input")){if(R==="quit"){e.key==="y"||e.key==="Y"||e.key==="Enter"?_():(e.key==="n"||e.key==="N"||e.key==="Escape")&&x();return}if(!R){if(e.ctrlKey&&(e.key==="f"||e.key==="F")||e.key==="F11"){e.preventDefault(),D();return}if(e.key==="Escape"){d?D():Ee();return}if(e.key==="Enter"){if(e.preventDefault(),d){D();return}if(r>=0&&r<s.length){const t=s[r];t&&t.isDirectory?I(t.path):t&&D();return}}if(e.key==="Backspace"&&!d){if(e.preventDefault(),h){let t=h.replace(/[/\\][^/\\]+[/\\]?$/,"");t===""&&(h.startsWith("/")||h.startsWith("\\"))&&(t="/"),t&&t!==h&&I(t)}return}if(e.key==="F2"){e.preventDefault(),Ie();return}if(e.key===" "||e.code==="Space"){e.preventDefault(),r>=0&&Z(r);return}if(d){if(e.key==="/"){e.preventDefault(),O("screen");return}if(e.key==="*"){e.preventDefault(),O("actual");return}if(e.key==="1"){e.preventDefault(),O("width");return}if(e.key==="3"){e.preventDefault(),O("height");return}if(e.key==="+"||e.key==="="){e.preventDefault(),m=Math.min(5,m+.2),v();return}if(e.key==="-"||e.key==="_"){e.preventDefault(),m=Math.max(.5,m-.2),v();return}if(m>1){if(e.key==="ArrowLeft"){e.preventDefault(),w+=30,v();return}if(e.key==="ArrowRight"){e.preventDefault(),w-=30,v();return}if(e.key==="ArrowUp"){e.preventDefault(),b+=30,v();return}if(e.key==="ArrowDown"){e.preventDefault(),b-=30,v();return}}}if(e.key==="Home"){e.preventDefault(),q("first");return}if(e.key==="End"){e.preventDefault(),q("last");return}if(e.key==="PageUp"||e.key==="PgUp"){e.preventDefault(),F(-1);return}if(e.key==="PageDown"||e.key==="PgDn"){e.preventDefault(),F(1);return}if(d){if(e.key==="ArrowUp"||e.key==="ArrowLeft"){e.preventDefault(),F(-1);return}if(e.key==="ArrowDown"||e.key==="ArrowRight"){e.preventDefault(),F(1);return}}else{if(e.key==="ArrowLeft"){e.preventDefault(),r>0&&(r--,k(),f(),p(),u());return}if(e.key==="ArrowRight"){e.preventDefault(),r<s.length-1&&(r++,k(),f(),p(),u());return}if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();const n=document.getElementById("thumb-grid").querySelectorAll(".thumb-card");let i=1;if(n.length>1){const o=n[0].offsetTop;for(let c=1;c<n.length;c++)if(n[c].offsetTop>o){i=c;break}}const l=e.key==="ArrowDown"?i:-i,a=r+l;a>=0&&a<s.length&&(r=a,k(),f(),p(),u());return}}if(e.key==="<"||e.key===","){G(-1);return}if(e.key===">"||e.key==="."){G(1);return}}}}function u(){if(document.getElementById("info-folder").textContent=`Folder: ${h||"-"}`,document.getElementById("info-selection").textContent=`${g.size} selected of ${s.length} files`,r>=0&&r<s.length){const e=s[r];document.getElementById("info-file").textContent=`File: ${e.name}`,document.getElementById("info-dim").textContent=`Resolution: ${e.width>0?e.width+"x"+e.height:"Unknown"}`,document.getElementById("info-size").textContent=`Size: ${J(e.size)}`}else document.getElementById("info-file").textContent="File: -",document.getElementById("info-dim").textContent="Resolution: -",document.getElementById("info-size").textContent="Size: -"}function J(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],i=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,i)).toFixed(1))+" "+n[i]}function E(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}let B=null;function Be(){const e=document.getElementById("sidebar"),t=document.getElementById("preview-pane"),n=document.getElementById("splitter-v"),i=document.getElementById("splitter-h"),l=localStorage.getItem("eview_sidebar_width");l&&e&&(e.style.width=`${l}px`);const a=localStorage.getItem("eview_preview_height");a&&t&&(t.style.height=`${a}px`),n&&(n.onmousedown=o=>{o.preventDefault(),B="vertical",n.classList.add("dragging")}),i&&(i.onmousedown=o=>{o.preventDefault(),B="horizontal",i.classList.add("dragging")})}function Fe(e){if(!!B){if(B==="vertical"){const t=document.getElementById("workspace"),n=document.getElementById("sidebar");if(t&&n){const i=t.getBoundingClientRect(),l=Math.max(120,Math.min(i.width-200,e.clientX-i.left));n.style.width=`${l}px`,localStorage.setItem("eview_sidebar_width",l)}}else if(B==="horizontal"){const t=document.getElementById("main-content"),n=document.getElementById("preview-pane");if(t&&n){const i=t.getBoundingClientRect(),l=Math.max(80,Math.min(i.height-100,i.bottom-e.clientY));n.style.height=`${l}px`,localStorage.setItem("eview_preview_height",l)}}}}function De(){var e,t;B&&((e=document.getElementById("splitter-v"))==null||e.classList.remove("dragging"),(t=document.getElementById("splitter-h"))==null||t.classList.remove("dragging"),B=null)}window.addEventListener("DOMContentLoaded",re);
