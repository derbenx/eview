(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);new MutationObserver(l=>{for(const o of l)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(l){const o={};return l.integrity&&(o.integrity=l.integrity),l.referrerpolicy&&(o.referrerPolicy=l.referrerpolicy),l.crossorigin==="use-credentials"?o.credentials="include":l.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(l){if(l.ep)return;l.ep=!0;const o=n(l);fetch(l.href,o)}})();function ge(e){return window.go.main.App.GetInitialTarget(e)}function he(){return window.go.main.App.GetDrives()}function ye(e){return window.go.main.App.GetDirectories(e)}function ve(e,t){return window.go.main.App.GetFilesInDirectory(e,t)}function we(e){return window.go.main.App.GetFileBase64(e)}function Ee(e){return window.go.main.App.GetFileDetails(e)}function Z(e){return window.go.main.App.GetGIFFrames(e)}function be(e,t){return window.go.main.App.RenameFile(e,t)}function ae(){return window.go.main.App.QuitApp()}let w="",E=[],r=[],s=-1,k=new Set,G=new Map,z=new Map,L=!1,B=0,q=null,I=[],v=1,F=0,x=0,j=!1,se=0,re=0,d=!1,J="screen",O=new Set,U=new Map,N=null;function Ie(){const e=document.getElementById("app");e.innerHTML=`
        <!-- TOP TOOLBAR -->
        <div class="toolbar">
            <button class="btn" id="btn-prev" title="Previous File">Prev</button>
            <button class="btn" id="btn-next" title="Next File">Next</button>
            <div class="separator"></div>
            <button class="btn" id="btn-frame-back" title="Frame Back (<)">&lt;</button>
            <button class="btn" id="btn-frame-fwd" title="Frame Forward (>)">&gt;</button>
            <button class="btn" id="btn-animate" title="Toggle GIF Animation">Animate</button>
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
            <button class="btn" id="btn-reload-drives" title="Reload Drives List">\u{1F504}</button>
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
                <option value="ratio-asc">Ratio Asd</option>
                <option value="ratio-desc">Ratio Des</option>
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
    `,ke(),ce()}function ke(){document.getElementById("btn-prev").onclick=()=>R(-1),document.getElementById("btn-next").onclick=()=>R(1),document.getElementById("btn-frame-back").onclick=()=>Y(-1),document.getElementById("btn-frame-fwd").onclick=()=>Y(1),document.getElementById("btn-animate").onclick=xe,document.getElementById("btn-fullscreen").onclick=P,document.getElementById("btn-select-all").onclick=Ae,document.getElementById("btn-select-none").onclick=Te;const e=document.getElementById("chk-imgs"),t=document.getElementById("chk-gif"),n=document.getElementById("chk-ico"),i=document.getElementById("chk-folders"),l=()=>{ee(w)};e.onchange=l,t.onchange=l,n.onchange=l,i.onchange=l,document.getElementById("drive-select").onchange=a=>{const c=a.target.value;c&&S(c)},document.getElementById("btn-reload-drives").onclick=()=>{ce()},document.getElementById("path-input").onkeydown=a=>{if(a.key==="Enter"){const c=a.target.value.trim();c&&S(c)}},document.getElementById("sort-select").onchange=()=>{X()},document.getElementById("chk-folders-first").onchange=()=>{X()},window.onkeydown=Ge,ze(),window.addEventListener("dragover",a=>a.preventDefault()),window.addEventListener("drop",async a=>{if(a.preventDefault(),a.dataTransfer&&a.dataTransfer.files&&a.dataTransfer.files.length>0){const c=a.dataTransfer.files[0];c.path&&_(c.path)}}),window.runtime&&window.runtime.EventsOn&&window.runtime.EventsOn("file-dropped",a=>{a&&_(a)});const o=document.getElementById("fullscreen-overlay");o.onwheel=Se,o.onmousedown=Me,window.onmousemove=a=>{Le(a),He(a)},window.onmouseup=a=>{$e(),Oe()}}function Be(){const e=[];return document.getElementById("chk-imgs").checked&&e.push("img"),document.getElementById("chk-gif").checked&&e.push("gif"),document.getElementById("chk-ico").checked&&e.push("ico"),document.getElementById("chk-folders").checked&&e.push("folders"),e}async function _(e){try{const t=await ge(e||"");if(t&&t.directory){const n=t.isFile?t.fileName:null;return await S(t.directory,n),!0}}catch(t){console.error("Failed to resolve target path:",t)}return!1}async function ce(){try{E=await he();const e=document.getElementById("drive-select");e.innerHTML=E.map(n=>`<option value="${A(n.path)}">${A(n.label)}</option>`).join(""),!await _("")&&E.length>0&&(e.value=E[0].path,S(E[0].path))}catch(e){console.error("Failed to get drives:",e)}}function De(){const e=document.getElementById("drive-select");return e?e.value:E[0]?E[0].path:""}async function S(e,t=null){w=e,document.getElementById("path-input").value=e;const n=document.getElementById("drive-select");if(n&&E.length>0){const i=E.find(l=>e.toLowerCase().startsWith(l.path.toLowerCase()));i&&n.value!==i.path&&(n.value=i.path)}O.add(e),de(),await ee(e,t)}async function de(){const e=document.getElementById("tree-root"),t=De();if(!t)return;const n=E.find(l=>l.path===t)||{path:t,label:t};let i=await ue(n.path,n.label,0);e.innerHTML=i,e.querySelectorAll(".tree-node-item").forEach(l=>{l.onclick=o=>{o.stopPropagation();const a=l.dataset.path;o.target.classList.contains("tree-expander")?(O.has(a)?O.delete(a):O.add(a),de()):S(a)}})}async function ue(e,t,n){const i=O.has(e),l=w===e,o=n*14;let a="";if(i){if(!U.has(e))try{const T=await ye(e);U.set(e,T||[])}catch{U.set(e,[])}const M=U.get(e);for(const T of M)a+=await ue(T.path,T.name,n+1)}const c=i?"\u25BC":"\u25B6";return`
        <li>
            <div class="tree-node-item ${l?"active":""}" data-path="${A(e)}" style="padding-left: ${o+6}px;">
                <span class="tree-expander">${c}</span>
                <span>\u{1F4C1} ${A(t)}</span>
            </div>
            ${i?`<ul style="list-style: none;">${a}</ul>`:""}
        </li>
    `}async function ee(e,t=null){if(!e)return;const n=Be();try{r=await ve(e,n)||[],k.clear(),b(),X(t)}catch(i){console.error("Failed to list files:",i),r=[],s=-1,g(),y(),m()}}function X(e=null){var M,T,te;if(!r||r.length===0){s=-1,g(),y(),m();return}const t=((M=document.getElementById("sort-select"))==null?void 0:M.value)||"name-asc",n=(te=(T=document.getElementById("chk-folders-first"))==null?void 0:T.checked)!=null?te:!0,[i,l]=t.split("-"),o=l==="asc",a=(u,f)=>{var ne,ie;let h=(ne=u[i])!=null?ne:"",p=(ie=f[i])!=null?ie:"";return i==="name"?(h=(u.name||"").toLowerCase(),p=(f.name||"").toLowerCase()):i==="date"?(h=u.modTime||"",p=f.modTime||""):i==="size"?(h=u.size||0,p=f.size||0):i==="height"?(h=u.height||0,p=f.height||0):i==="width"?(h=u.width||0,p=f.width||0):i==="ratio"&&(h=u.height>0?u.width/u.height:0,p=f.height>0?f.width/f.height:0),h<p?o?-1:1:h>p?o?1:-1:0},c=s>=0&&r[s]?r[s].path:null;if(n){const u=r.filter(p=>p.name===".."),f=r.filter(p=>p.isDirectory&&p.name!=="..").sort(a),h=r.filter(p=>!p.isDirectory).sort(a);r=[...u,...f,...h]}else{const u=r.filter(h=>h.name===".."),f=r.filter(h=>h.name!=="..").sort(a);r=[...u,...f]}if(e){const u=r.findIndex(f=>f.name.toLowerCase()===e.toLowerCase());s=u>=0?u:r.length>0?0:-1}else if(c){const u=r.findIndex(f=>f.path===c);s=u>=0?u:r.length>0?0:-1}else s=r.length>0?0:-1;g(),y(),m()}let H=null;function g(){const e=document.getElementById("thumb-grid");if(r.length===0){e.innerHTML='<div style="grid-column: 1 / -1; color: #666; font-size: 13px; padding: 20px; text-align: center;">No matching files in this directory</div>';return}if(H&&H.disconnect(),H=new IntersectionObserver(t=>{t.forEach(n=>{if(n.isIntersecting){const i=n.target,l=parseInt(i.dataset.index,10);r[l]&&Fe(r[l],l),H.unobserve(i)}})},{root:e,rootMargin:"100px"}),e.innerHTML=r.map((t,n)=>{const i=n===s,l=k.has(t.path);let o="\u{1F5BC}\uFE0F";t.isDirectory?o="\u{1F4C1}":t.isGif?o="\u{1F39E}\uFE0F":t.extension==="ico"&&(o="\u{1F4A0}");const a=G.get(t.path),c=a&&!t.isDirectory?`<img src="${a}" class="thumb-img" alt="${A(t.name)}" draggable="false" />`:`<div class="thumb-icon-placeholder">${o}</div>`;return`
            <div class="thumb-card ${i?"highlighted":""} ${l?"selected":""}"
                 data-index="${n}" id="thumb-card-${n}">
                <div class="thumb-img-wrapper" id="thumb-img-wrapper-${n}">
                    ${c}
                </div>
                <div class="thumb-label" title="${A(t.name)}">${A(t.name)}</div>
            </div>
        `}).join(""),e.querySelectorAll(".thumb-card").forEach(t=>{const n=parseInt(t.dataset.index,10),i=r[n];i&&!G.has(i.path)&&H.observe(t),t.onclick=l=>{if(l.ctrlKey||l.metaKey)me(n);else if(l.shiftKey&&s>=0){const o=Math.min(s,n),a=Math.max(s,n);for(let c=o;c<=a;c++)k.add(r[c].path);s=n,g(),y(),m()}else s=n,g(),y(),m()},t.ondblclick=l=>{l.stopPropagation(),i&&i.isDirectory?S(i.path):(s=n,d||P())}}),s>=0){const t=document.getElementById(`thumb-card-${s}`);t&&t.scrollIntoView({block:"nearest",behavior:"smooth"})}}async function Fe(e,t){let n=null;if(e.isGif){let l=z.get(e.path);if(!l)try{l=await Z(e.path),z.set(e.path,l)}catch{}l&&l.length>0&&(n=l[0])}else if(n=G.get(e.path),!n)try{n=await we(e.path),G.set(e.path,n)}catch{return}const i=document.getElementById(`thumb-img-wrapper-${t}`);i&&n&&(i.innerHTML=`<img src="${n}" class="thumb-img" alt="${A(e.name)}" draggable="false" />`)}async function y(){K();const e=document.getElementById("empty-preview-msg"),t=document.getElementById("preview-image"),n=document.getElementById("fullscreen-image");if(s<0||s>=r.length){e.style.display="block",t.style.display="none";return}const i=r[s];if(i.isDirectory){e.textContent="Directory selected: "+i.name,e.style.display="block",t.style.display="none";return}e.style.display="none",t.style.display="block";let l=G.get(i.path);if(!l||i.width===0)try{const o=await Ee(i.path);o&&(l=o.dataUrl,i.width=o.width,i.height=o.height,G.set(i.path,l),m())}catch{e.textContent="Failed to load image preview",e.style.display="block",t.style.display="none";return}if(i.isGif){let o=z.get(i.path);if(!o)try{o=await Z(i.path),z.set(i.path,o)}catch{}if(o&&o.length>0){I=o,B>=o.length&&(B=0);const a=o[B];t.src=a,d&&(n.src=a),L?fe():V();return}}t.src=l,d&&(n.src=l)}function fe(){if(K(),!I||I.length===0)return;const e=document.getElementById("preview-image"),t=document.getElementById("fullscreen-image");q=setInterval(()=>{B=(B+1)%I.length;const n=I[B];e&&(e.src=n),d&&t&&(t.src=n),V()},100)}function K(){q&&(clearInterval(q),q=null)}function xe(){L=!L;const e=document.getElementById("btn-animate");L?(e.classList.add("btn-active"),I&&I.length>0?fe():y()):(e.classList.remove("btn-active"),K(),V())}async function Y(e){var a;if(s<0||!((a=r[s])!=null&&a.isGif))return;const t=r[s];let n=z.get(t.path);if(!n)try{n=await Z(t.path),z.set(t.path,n)}catch{return}if(!n||n.length===0)return;if(L){L=!1;const c=document.getElementById("btn-animate");c&&c.classList.remove("btn-active"),K()}I=n,B=(B+e+n.length)%n.length;const i=n[B],l=document.getElementById("preview-image"),o=document.getElementById("fullscreen-image");l&&(l.src=i),d&&o&&(o.src=i),V()}function V(){var t;const e=document.getElementById("preview-pane-title");if(!!e)if(s>=0&&((t=r[s])==null?void 0:t.isGif)&&I.length>0){const n=`Frame ${B+1}/${I.length}`,i=L?"Playing":"Paused";e.textContent=`Preview (${n} - ${i})`}else e.textContent="Preview"}function R(e){if(r.length===0)return;const t=[];if(r.forEach((n,i)=>{k.has(n.path)&&t.push(i)}),t.length>0){let n=t.indexOf(s);n===-1?n=e>0?0:t.length-1:n=(n+e+t.length)%t.length,s=t[n]}else s=(s+e+r.length)%r.length;b(),g(),y(),m()}function le(e){if(r.length===0)return;const t=[];r.forEach((n,i)=>{n.isDirectory||t.push(i)}),t.length>0?s=e==="first"?t[0]:t[t.length-1]:s=e==="first"?0:r.length-1,b(),g(),y(),m()}function oe(){const e=document.getElementById("thumb-grid");if(!e)return 10;const t=e.querySelectorAll(".thumb-card");if(t.length===0)return 10;let n=1;const i=t[0].offsetTop;for(let c=1;c<t.length;c++)if(t[c].offsetTop>i){n=c;break}const l=t[0].offsetHeight||140,o=e.clientHeight||400,a=Math.max(1,Math.floor(o/l));return Math.max(1,a*n)}function me(e){if(e<0||e>=r.length)return;const t=r[e].path;k.has(t)?k.delete(t):k.add(t),g(),m()}function Ae(){r.forEach(e=>k.add(e.path)),g(),m()}function Te(){k.clear(),g(),m()}function Se(e){if(!d)return;e.preventDefault();const t=e.deltaY>0?-.1:.1;v=Math.max(1,Math.min(5,v+t)),D()}function Me(e){!d||e.button!==0||(j=!0,se=e.clientX-F,re=e.clientY-x)}function Le(e){!d||!j||(F=e.clientX-se,x=e.clientY-re,D())}function $e(){j=!1}function b(){v=1,F=0,x=0,D()}function D(){const e=document.getElementById("fullscreen-image"),t=document.getElementById("fullscreen-overlay");if(e&&t){if(v<=1)F=0,x=0;else{const i=t.clientWidth,l=t.clientHeight,o=e.offsetWidth||i,a=e.offsetHeight||l,c=Math.max(0,(o*v-i)/2),M=Math.max(0,(a*v-l)/2);F=Math.max(-c,Math.min(c,F)),x=Math.max(-M,Math.min(M,x))}e.style.transform=`translate(${F}px, ${x}px) scale(${v})`}const n=document.getElementById("preview-image");n&&(n.style.transform="none")}function P(){d=!d;const e=document.getElementById("fullscreen-overlay");d?(J="screen",b(),e.style.display="flex",y(),Re(),pe(),document.documentElement.requestFullscreen?document.documentElement.requestFullscreen().catch(()=>{}):document.documentElement.webkitRequestFullscreen&&document.documentElement.webkitRequestFullscreen().catch(()=>{})):(e.style.display="none",document.fullscreenElement&&document.exitFullscreen?document.exitFullscreen().catch(()=>{}):document.webkitFullscreenElement&&document.webkitExitFullscreen&&document.webkitExitFullscreen().catch(()=>{}))}function W(e){J=e,b(),pe()}function pe(){const e=document.getElementById("fullscreen-image");!e||(e.classList.remove("fit-screen","fit-actual","fit-width","fit-height"),e.classList.add(`fit-${J}`))}document.addEventListener("fullscreenchange",()=>{!document.fullscreenElement&&d&&(d=!1,document.getElementById("fullscreen-overlay").style.display="none")});function Re(){if(s>=0&&s<r.length){const e=r[s];document.getElementById("fs-file-info").textContent=`${e.name} (${e.width}x${e.height} | ${Q(e.size)})`}}function Pe(){N="quit";const e=document.getElementById("modal-overlay"),t=document.getElementById("modal-card");t.innerHTML=`
        <div class="modal-title">Quit Application</div>
        <div class="modal-body">Are you sure you want to quit eview? (y/n)</div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">No (N)</button>
            <button class="btn btn-active" id="modal-confirm">Yes (Y)</button>
        </div>
    `,e.style.display="flex",document.getElementById("modal-cancel").onclick=C,document.getElementById("modal-confirm").onclick=()=>ae()}function Ce(){if(s<0||s>=r.length)return;const e=r[s];N="rename";const t=document.getElementById("modal-overlay"),n=document.getElementById("modal-card");n.innerHTML=`
        <div class="modal-title">Rename File</div>
        <div class="modal-body">
            Enter new file name:
            <input type="text" class="modal-input" id="rename-input" value="${A(e.name)}" />
        </div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">Cancel</button>
            <button class="btn btn-active" id="modal-confirm">Rename</button>
        </div>
    `,t.style.display="flex";const i=document.getElementById("rename-input");i.focus(),i.select();const l=async()=>{const o=i.value.trim();if(o&&o!==e.name)try{await be(e.path,o),C(),ee(w)}catch(a){alert("Rename failed: "+a)}else C()};document.getElementById("modal-cancel").onclick=C,document.getElementById("modal-confirm").onclick=l,i.onkeydown=o=>{o.key==="Enter"&&l(),o.key==="Escape"&&C()}}function C(){N=null,document.getElementById("modal-overlay").style.display="none"}function Ge(e){if(!(e.target.tagName==="INPUT"&&e.target.id!=="rename-input")){if(N==="quit"){e.key==="y"||e.key==="Y"||e.key==="Enter"?ae():(e.key==="n"||e.key==="N"||e.key==="Escape")&&C();return}if(!N){if(e.ctrlKey&&(e.key==="f"||e.key==="F")||e.key==="F11"){e.preventDefault(),P();return}if(e.key==="Escape"){d?P():Pe();return}if(e.key==="Enter"){if(e.preventDefault(),d){P();return}if(s>=0&&s<r.length){const t=r[s];t&&t.isDirectory?S(t.path):t&&P();return}}if(e.key==="Backspace"&&!d){if(e.preventDefault(),w){let t=w.replace(/[/\\][^/\\]+[/\\]?$/,"");t===""&&(w.startsWith("/")||w.startsWith("\\"))&&(t="/"),t&&t!==w&&S(t)}return}if(e.key==="F2"){e.preventDefault(),Ce();return}if(e.key===" "||e.code==="Space"){e.preventDefault(),s>=0&&me(s);return}if(d){if(e.key==="/"){e.preventDefault(),W("screen");return}if(e.key==="*"){e.preventDefault(),W("actual");return}if(e.key==="1"){e.preventDefault(),W("width");return}if(e.key==="3"){e.preventDefault(),W("height");return}if(e.key==="+"||e.key==="="){e.preventDefault(),v=Math.min(5,v+.2),D();return}if(e.key==="-"||e.key==="_"){e.preventDefault(),v=Math.max(.5,v-.2),D();return}if(v>1){if(e.key==="ArrowLeft"){e.preventDefault(),F+=30,D();return}if(e.key==="ArrowRight"){e.preventDefault(),F-=30,D();return}if(e.key==="ArrowUp"){e.preventDefault(),x+=30,D();return}if(e.key==="ArrowDown"){e.preventDefault(),x-=30,D();return}}}if(e.key==="Home"){e.preventDefault(),le("first");return}if(e.key==="End"){e.preventDefault(),le("last");return}if(e.key==="PageUp"||e.key==="PgUp"){if(e.preventDefault(),d)R(-1);else{const t=oe();s>=0&&r.length>0&&(s=Math.max(0,s-t),b(),g(),y(),m())}return}if(e.key==="PageDown"||e.key==="PgDn"){if(e.preventDefault(),d)R(1);else{const t=oe();s>=0&&r.length>0&&(s=Math.min(r.length-1,s+t),b(),g(),y(),m())}return}if(d){if(e.key==="ArrowUp"||e.key==="ArrowLeft"){e.preventDefault(),R(-1);return}if(e.key==="ArrowDown"||e.key==="ArrowRight"){e.preventDefault(),R(1);return}}else{if(e.key==="ArrowLeft"){e.preventDefault(),s>0&&(s--,b(),g(),y(),m());return}if(e.key==="ArrowRight"){e.preventDefault(),s<r.length-1&&(s++,b(),g(),y(),m());return}if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();const n=document.getElementById("thumb-grid").querySelectorAll(".thumb-card");let i=1;if(n.length>1){const a=n[0].offsetTop;for(let c=1;c<n.length;c++)if(n[c].offsetTop>a){i=c;break}}const l=e.key==="ArrowDown"?i:-i,o=s+l;o>=0&&o<r.length&&(s=o,b(),g(),y(),m());return}}if(e.key==="<"||e.key===","){Y(-1);return}if(e.key===">"||e.key==="."){Y(1);return}}}}function m(){if(document.getElementById("info-folder").textContent=`Folder: ${w||"-"}`,document.getElementById("info-selection").textContent=`${k.size} selected of ${r.length} files`,s>=0&&s<r.length){const e=r[s];document.getElementById("info-file").textContent=`File: ${e.name}`,e.isDirectory?(document.getElementById("info-dim").textContent="Resolution: -",document.getElementById("info-size").textContent=`Size: ${Q(e.size,!0)}`):(document.getElementById("info-dim").textContent=`Resolution: ${e.width>0?e.width+"x"+e.height:"Unknown"}`,document.getElementById("info-size").textContent=`Size: ${Q(e.size,!1)}`)}else document.getElementById("info-file").textContent="File: -",document.getElementById("info-dim").textContent="Resolution: -",document.getElementById("info-size").textContent="Size: -"}function Q(e,t=!1){if(t)return"folder";if(e===0)return"0 B";const n=1024,i=["B","KB","MB","GB"],l=Math.floor(Math.log(e)/Math.log(n));return parseFloat((e/Math.pow(n,l)).toFixed(1))+" "+i[l]}function A(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}let $=null;function ze(){const e=document.getElementById("sidebar"),t=document.getElementById("preview-pane"),n=document.getElementById("splitter-v"),i=document.getElementById("splitter-h"),l=localStorage.getItem("eview_sidebar_width");l&&e&&(e.style.width=`${l}px`);const o=localStorage.getItem("eview_preview_height");o&&t&&(t.style.height=`${o}px`),n&&(n.onmousedown=a=>{a.preventDefault(),$="vertical",n.classList.add("dragging")}),i&&(i.onmousedown=a=>{a.preventDefault(),$="horizontal",i.classList.add("dragging")})}function He(e){if(!!$){if($==="vertical"){const t=document.getElementById("workspace"),n=document.getElementById("sidebar");if(t&&n){const i=t.getBoundingClientRect(),l=Math.max(120,Math.min(i.width-200,e.clientX-i.left));n.style.width=`${l}px`,localStorage.setItem("eview_sidebar_width",l)}}else if($==="horizontal"){const t=document.getElementById("main-content"),n=document.getElementById("preview-pane");if(t&&n){const i=t.getBoundingClientRect(),l=Math.max(80,Math.min(i.height-100,i.bottom-e.clientY));n.style.height=`${l}px`,localStorage.setItem("eview_preview_height",l)}}}}function Oe(){var e,t;$&&((e=document.getElementById("splitter-v"))==null||e.classList.remove("dragging"),(t=document.getElementById("splitter-h"))==null||t.classList.remove("dragging"),$=null)}window.addEventListener("DOMContentLoaded",Ie);
