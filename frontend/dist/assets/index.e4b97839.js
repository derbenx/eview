(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);new MutationObserver(l=>{for(const a of l)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function n(l){const a={};return l.integrity&&(a.integrity=l.integrity),l.referrerpolicy&&(a.referrerPolicy=l.referrerpolicy),l.crossorigin==="use-credentials"?a.credentials="include":l.crossorigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(l){if(l.ep)return;l.ep=!0;const a=n(l);fetch(l.href,a)}})();function ae(e){return window.go.main.App.GetInitialTarget(e)}function oe(){return window.go.main.App.GetDrives()}function re(e){return window.go.main.App.GetDirectories(e)}function se(e,t){return window.go.main.App.GetFilesInDirectory(e,t)}function ce(e){return window.go.main.App.GetFileBase64(e)}function de(e){return window.go.main.App.GetFileDetails(e)}function Y(e){return window.go.main.App.GetGIFFrames(e)}function ue(e,t){return window.go.main.App.RenameFile(e,t)}function X(){return window.go.main.App.QuitApp()}let h="",y=[],s=[],r=-1,g=new Set,L=new Map,S=new Map,M=!0,E=0,H=null,B=[],m=1,w=0,b=0,q=!1,Q=0,Z=0,d=!1,_="screen",P=new Set,O=new Map,C=null;function fe(){const e=document.getElementById("app");e.innerHTML=`
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
            <button class="btn" id="btn-reload-drives" title="Reload Drives List">\u{1F504}</button>
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
    `,me(),j()}function me(){document.getElementById("btn-prev").onclick=()=>x(-1),document.getElementById("btn-next").onclick=()=>x(1),document.getElementById("btn-frame-back").onclick=()=>z(-1),document.getElementById("btn-frame-fwd").onclick=()=>z(1),document.getElementById("btn-animate").onclick=ye,document.getElementById("btn-fullscreen").onclick=A,document.getElementById("btn-select-all").onclick=ve,document.getElementById("btn-select-none").onclick=we;const e=document.getElementById("chk-imgs"),t=document.getElementById("chk-gif"),n=document.getElementById("chk-ico"),i=document.getElementById("chk-folders"),l=()=>{K(h)};e.onchange=l,t.onchange=l,n.onchange=l,i.onchange=l,document.getElementById("drive-select").onchange=o=>{const c=o.target.value;c&&k(c)},document.getElementById("btn-reload-drives").onclick=()=>{j()},document.getElementById("path-input").onkeydown=o=>{if(o.key==="Enter"){const c=o.target.value.trim();c&&k(c)}},window.onkeydown=xe,Ae(),window.addEventListener("dragover",o=>o.preventDefault()),window.addEventListener("drop",async o=>{if(o.preventDefault(),o.dataTransfer&&o.dataTransfer.files&&o.dataTransfer.files.length>0){const c=o.dataTransfer.files[0];c.path&&W(c.path)}}),window.runtime&&window.runtime.EventsOn&&window.runtime.EventsOn("file-dropped",o=>{o&&W(o)});const a=document.getElementById("fullscreen-overlay");a.onwheel=be,a.onmousedown=Ee,window.onmousemove=o=>{Ie(o),Te(o)},window.onmouseup=o=>{ke(),Me()}}function pe(){const e=[];return document.getElementById("chk-imgs").checked&&e.push("img"),document.getElementById("chk-gif").checked&&e.push("gif"),document.getElementById("chk-ico").checked&&e.push("ico"),document.getElementById("chk-folders").checked&&e.push("folders"),e}async function W(e){try{const t=await ae(e||"");if(t&&t.directory){if(await k(t.directory),t.isFile&&t.fileName){const n=s.findIndex(i=>i.name.toLowerCase()===t.fileName.toLowerCase());n>=0&&(r=n,f(),p(),u())}return!0}}catch(t){console.error("Failed to resolve target path:",t)}return!1}async function j(){try{y=await oe();const e=document.getElementById("drive-select");e.innerHTML=y.map(n=>`<option value="${I(n.path)}">${I(n.label)}</option>`).join(""),!await W("")&&y.length>0&&(e.value=y[0].path,k(y[0].path))}catch(e){console.error("Failed to get drives:",e)}}function ge(){const e=document.getElementById("drive-select");return e?e.value:y[0]?y[0].path:""}async function k(e){h=e,document.getElementById("path-input").value=e;const t=document.getElementById("drive-select");if(t&&y.length>0){const n=y.find(i=>e.toLowerCase().startsWith(i.path.toLowerCase()));n&&t.value!==n.path&&(t.value=n.path)}P.add(e),J(),K(e)}async function J(){const e=document.getElementById("tree-root"),t=ge();if(!t)return;const n=y.find(l=>l.path===t)||{path:t,label:t};let i=await ee(n.path,n.label,0);e.innerHTML=i,e.querySelectorAll(".tree-node-item").forEach(l=>{l.onclick=a=>{a.stopPropagation();const o=l.dataset.path;a.target.classList.contains("tree-expander")?(P.has(o)?P.delete(o):P.add(o),J()):k(o)}})}async function ee(e,t,n){const i=P.has(e),l=h===e,a=n*14;let o="";if(i){if(!O.has(e))try{const $=await re(e);O.set(e,$||[])}catch{O.set(e,[])}const G=O.get(e);for(const $ of G)o+=await ee($.path,$.name,n+1)}const c=i?"\u25BC":"\u25B6";return`
        <li>
            <div class="tree-node-item ${l?"active":""}" data-path="${I(e)}" style="padding-left: ${a+6}px;">
                <span class="tree-expander">${c}</span>
                <span>\u{1F4C1} ${I(t)}</span>
            </div>
            ${i?`<ul style="list-style: none;">${o}</ul>`:""}
        </li>
    `}async function K(e){if(!e)return;const t=pe();try{s=await se(e,t)||[],r=s.length>0?0:-1,g.clear(),D(),f(),p(),u()}catch(n){console.error("Failed to list files:",n),s=[],r=-1,f(),p(),u()}}let R=null;function f(){const e=document.getElementById("thumb-grid");if(s.length===0){e.innerHTML='<div style="grid-column: 1 / -1; color: #666; font-size: 13px; padding: 20px; text-align: center;">No matching files in this directory</div>';return}if(R&&R.disconnect(),R=new IntersectionObserver(t=>{t.forEach(n=>{if(n.isIntersecting){const i=n.target,l=parseInt(i.dataset.index,10);s[l]&&he(s[l],l),R.unobserve(i)}})},{root:e,rootMargin:"100px"}),e.innerHTML=s.map((t,n)=>{const i=n===r,l=g.has(t.path);let a="\u{1F5BC}\uFE0F";t.isDirectory?a="\u{1F4C1}":t.isGif?a="\u{1F39E}\uFE0F":t.extension==="ico"&&(a="\u{1F4A0}");const o=L.get(t.path),c=o&&!t.isDirectory?`<img src="${o}" class="thumb-img" alt="${I(t.name)}" draggable="false" />`:`<div class="thumb-icon-placeholder">${a}</div>`;return`
            <div class="thumb-card ${i?"highlighted":""} ${l?"selected":""}"
                 data-index="${n}" id="thumb-card-${n}">
                <div class="thumb-img-wrapper" id="thumb-img-wrapper-${n}">
                    ${c}
                </div>
                <div class="thumb-label" title="${I(t.name)}">${I(t.name)}</div>
            </div>
        `}).join(""),e.querySelectorAll(".thumb-card").forEach(t=>{const n=parseInt(t.dataset.index,10),i=s[n];i&&!L.has(i.path)&&R.observe(t),t.onclick=l=>{if(i&&i.isDirectory){k(i.path);return}if(l.ctrlKey||l.metaKey)ne(n);else if(l.shiftKey&&r>=0){const a=Math.min(r,n),o=Math.max(r,n);for(let c=a;c<=o;c++)s[c].isDirectory||g.add(s[c].path);r=n,f(),p(),u()}else r=n,f(),p(),u()},t.ondblclick=l=>{l.stopPropagation(),i&&i.isDirectory?k(i.path):(r=n,d||A())}}),r>=0){const t=document.getElementById(`thumb-card-${r}`);t&&t.scrollIntoView({block:"nearest",behavior:"smooth"})}}async function he(e,t){let n=L.get(e.path);if(e.isGif){let l=S.get(e.path);if(!l)try{l=await Y(e.path),S.set(e.path,l)}catch{}l&&l.length>0&&(n=l[0])}if(!n)try{n=await ce(e.path),L.set(e.path,n)}catch{return}const i=document.getElementById(`thumb-img-wrapper-${t}`);i&&(i.innerHTML=`<img src="${n}" class="thumb-img" alt="${I(e.name)}" draggable="false" />`)}async function p(){U();const e=document.getElementById("empty-preview-msg"),t=document.getElementById("preview-image"),n=document.getElementById("fullscreen-image");if(r<0||r>=s.length){e.style.display="block",t.style.display="none";return}const i=s[r];if(i.isDirectory){e.textContent="Directory selected: "+i.name,e.style.display="block",t.style.display="none";return}e.style.display="none",t.style.display="block";let l=L.get(i.path);if(!l||i.width===0)try{const a=await de(i.path);a&&(l=a.dataUrl,i.width=a.width,i.height=a.height,L.set(i.path,l),u())}catch{e.textContent="Failed to load image preview",e.style.display="block",t.style.display="none";return}if(i.isGif){let a=S.get(i.path);if(!a)try{a=await Y(i.path),S.set(i.path,a)}catch{}if(a&&a.length>0){if(B=a,E>=a.length&&(E=0),M)te();else{const o=a[E];t.src=o,d&&(n.src=o)}return}}t.src=l,d&&(n.src=l)}function te(){if(U(),!B||B.length===0)return;const e=document.getElementById("preview-image"),t=document.getElementById("fullscreen-image");H=setInterval(()=>{E=(E+1)%B.length;const n=B[E];e&&(e.src=n),d&&t&&(t.src=n)},100)}function U(){H&&(clearInterval(H),H=null)}function ye(){M=!M;const e=document.getElementById("btn-animate");M?(e.classList.add("btn-active"),B&&B.length>0?te():p()):(e.classList.remove("btn-active"),U())}async function z(e){var o;if(r<0||!((o=s[r])!=null&&o.isGif))return;const t=s[r];let n=S.get(t.path);if(!n)try{n=await Y(t.path),S.set(t.path,n)}catch{return}if(!n||n.length===0)return;if(M){M=!1;const c=document.getElementById("btn-animate");c&&c.classList.remove("btn-active"),U()}B=n,E=(E+e+n.length)%n.length;const i=n[E],l=document.getElementById("preview-image"),a=document.getElementById("fullscreen-image");l&&(l.src=i),d&&a&&(a.src=i)}function x(e){if(s.length===0)return;const t=[];if(s.forEach((n,i)=>{g.has(n.path)&&t.push(i)}),t.length>0){let n=t.indexOf(r);n===-1?n=e>0?0:t.length-1:n=(n+e+t.length)%t.length,r=t[n]}else r=(r+e+s.length)%s.length;D(),f(),p(),u()}function V(e){if(s.length===0)return;const t=[];s.forEach((n,i)=>{g.has(n.path)&&t.push(i)}),t.length>0?r=e==="first"?t[0]:t[t.length-1]:r=e==="first"?0:s.length-1,D(),f(),p(),u()}function ne(e){if(e<0||e>=s.length)return;const t=s[e].path;g.has(t)?g.delete(t):g.add(t),f(),u()}function ve(){s.forEach(e=>g.add(e.path)),f(),u()}function we(){g.clear(),f(),u()}function be(e){if(!d)return;e.preventDefault();const t=e.deltaY>0?-.1:.1;m=Math.max(1,Math.min(5,m+t)),v()}function Ee(e){!d||e.button!==0||(q=!0,Q=e.clientX-w,Z=e.clientY-b)}function Ie(e){!d||!q||(w=e.clientX-Q,b=e.clientY-Z,v())}function ke(){q=!1}function D(){m=1,w=0,b=0,v()}function v(){const e=document.getElementById("fullscreen-image"),t=document.getElementById("fullscreen-overlay");if(e&&t){if(m<=1)w=0,b=0;else{const i=t.clientWidth,l=t.clientHeight,a=e.offsetWidth||i,o=e.offsetHeight||l,c=Math.max(0,(a*m-i)/2),G=Math.max(0,(o*m-l)/2);w=Math.max(-c,Math.min(c,w)),b=Math.max(-G,Math.min(G,b))}e.style.transform=`translate(${w}px, ${b}px) scale(${m})`}const n=document.getElementById("preview-image");n&&(n.style.transform="none")}function A(){d=!d;const e=document.getElementById("fullscreen-overlay");d?(_="screen",D(),e.style.display="flex",p(),Be(),ie(),document.documentElement.requestFullscreen?document.documentElement.requestFullscreen().catch(()=>{}):document.documentElement.webkitRequestFullscreen&&document.documentElement.webkitRequestFullscreen().catch(()=>{})):(e.style.display="none",document.fullscreenElement&&document.exitFullscreen?document.exitFullscreen().catch(()=>{}):document.webkitFullscreenElement&&document.webkitExitFullscreen&&document.webkitExitFullscreen().catch(()=>{}))}function N(e){_=e,D(),ie()}function ie(){const e=document.getElementById("fullscreen-image");!e||(e.classList.remove("fit-screen","fit-actual","fit-width","fit-height"),e.classList.add(`fit-${_}`))}document.addEventListener("fullscreenchange",()=>{!document.fullscreenElement&&d&&(d=!1,document.getElementById("fullscreen-overlay").style.display="none")});function Be(){if(r>=0&&r<s.length){const e=s[r];document.getElementById("fs-file-info").textContent=`${e.name} (${e.width}x${e.height} | ${le(e.size)})`}}function De(){C="quit";const e=document.getElementById("modal-overlay"),t=document.getElementById("modal-card");t.innerHTML=`
        <div class="modal-title">Quit Application</div>
        <div class="modal-body">Are you sure you want to quit eview? (y/n)</div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">No (N)</button>
            <button class="btn btn-active" id="modal-confirm">Yes (Y)</button>
        </div>
    `,e.style.display="flex",document.getElementById("modal-cancel").onclick=T,document.getElementById("modal-confirm").onclick=()=>X()}function Fe(){if(r<0||r>=s.length)return;const e=s[r];C="rename";const t=document.getElementById("modal-overlay"),n=document.getElementById("modal-card");n.innerHTML=`
        <div class="modal-title">Rename File</div>
        <div class="modal-body">
            Enter new file name:
            <input type="text" class="modal-input" id="rename-input" value="${I(e.name)}" />
        </div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">Cancel</button>
            <button class="btn btn-active" id="modal-confirm">Rename</button>
        </div>
    `,t.style.display="flex";const i=document.getElementById("rename-input");i.focus(),i.select();const l=async()=>{const a=i.value.trim();if(a&&a!==e.name)try{await ue(e.path,a),T(),K(h)}catch(o){alert("Rename failed: "+o)}else T()};document.getElementById("modal-cancel").onclick=T,document.getElementById("modal-confirm").onclick=l,i.onkeydown=a=>{a.key==="Enter"&&l(),a.key==="Escape"&&T()}}function T(){C=null,document.getElementById("modal-overlay").style.display="none"}function xe(e){if(!(e.target.tagName==="INPUT"&&e.target.id!=="rename-input")){if(C==="quit"){e.key==="y"||e.key==="Y"||e.key==="Enter"?X():(e.key==="n"||e.key==="N"||e.key==="Escape")&&T();return}if(!C){if(e.ctrlKey&&(e.key==="f"||e.key==="F")||e.key==="F11"){e.preventDefault(),A();return}if(e.key==="Escape"){d?A():De();return}if(e.key==="Enter"){if(e.preventDefault(),d){A();return}if(r>=0&&r<s.length){const t=s[r];t&&t.isDirectory?k(t.path):t&&A();return}}if(e.key==="Backspace"&&!d){if(e.preventDefault(),h){let t=h.replace(/[/\\][^/\\]+[/\\]?$/,"");t===""&&(h.startsWith("/")||h.startsWith("\\"))&&(t="/"),t&&t!==h&&k(t)}return}if(e.key==="F2"){e.preventDefault(),Fe();return}if(e.key===" "||e.code==="Space"){e.preventDefault(),r>=0&&ne(r);return}if(d){if(e.key==="/"){e.preventDefault(),N("screen");return}if(e.key==="*"){e.preventDefault(),N("actual");return}if(e.key==="1"){e.preventDefault(),N("width");return}if(e.key==="3"){e.preventDefault(),N("height");return}if(e.key==="+"||e.key==="="){e.preventDefault(),m=Math.min(5,m+.2),v();return}if(e.key==="-"||e.key==="_"){e.preventDefault(),m=Math.max(.5,m-.2),v();return}if(m>1){if(e.key==="ArrowLeft"){e.preventDefault(),w+=30,v();return}if(e.key==="ArrowRight"){e.preventDefault(),w-=30,v();return}if(e.key==="ArrowUp"){e.preventDefault(),b+=30,v();return}if(e.key==="ArrowDown"){e.preventDefault(),b-=30,v();return}}}if(e.key==="Home"){e.preventDefault(),V("first");return}if(e.key==="End"){e.preventDefault(),V("last");return}if(e.key==="PageUp"||e.key==="PgUp"){e.preventDefault(),x(-1);return}if(e.key==="PageDown"||e.key==="PgDn"){e.preventDefault(),x(1);return}if(d){if(e.key==="ArrowUp"||e.key==="ArrowLeft"){e.preventDefault(),x(-1);return}if(e.key==="ArrowDown"||e.key==="ArrowRight"){e.preventDefault(),x(1);return}}else{if(e.key==="ArrowLeft"){e.preventDefault(),r>0&&(r--,D(),f(),p(),u());return}if(e.key==="ArrowRight"){e.preventDefault(),r<s.length-1&&(r++,D(),f(),p(),u());return}if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();const n=document.getElementById("thumb-grid").querySelectorAll(".thumb-card");let i=1;if(n.length>1){const o=n[0].offsetTop;for(let c=1;c<n.length;c++)if(n[c].offsetTop>o){i=c;break}}const l=e.key==="ArrowDown"?i:-i,a=r+l;a>=0&&a<s.length&&(r=a,D(),f(),p(),u());return}}if(e.key==="<"||e.key===","){z(-1);return}if(e.key===">"||e.key==="."){z(1);return}}}}function u(){if(document.getElementById("info-folder").textContent=`Folder: ${h||"-"}`,document.getElementById("info-selection").textContent=`${g.size} selected of ${s.length} files`,r>=0&&r<s.length){const e=s[r];document.getElementById("info-file").textContent=`File: ${e.name}`,document.getElementById("info-dim").textContent=`Resolution: ${e.width>0?e.width+"x"+e.height:"Unknown"}`,document.getElementById("info-size").textContent=`Size: ${le(e.size)}`}else document.getElementById("info-file").textContent="File: -",document.getElementById("info-dim").textContent="Resolution: -",document.getElementById("info-size").textContent="Size: -"}function le(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],i=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,i)).toFixed(1))+" "+n[i]}function I(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}let F=null;function Ae(){const e=document.getElementById("sidebar"),t=document.getElementById("preview-pane"),n=document.getElementById("splitter-v"),i=document.getElementById("splitter-h"),l=localStorage.getItem("eview_sidebar_width");l&&e&&(e.style.width=`${l}px`);const a=localStorage.getItem("eview_preview_height");a&&t&&(t.style.height=`${a}px`),n&&(n.onmousedown=o=>{o.preventDefault(),F="vertical",n.classList.add("dragging")}),i&&(i.onmousedown=o=>{o.preventDefault(),F="horizontal",i.classList.add("dragging")})}function Te(e){if(!!F){if(F==="vertical"){const t=document.getElementById("workspace"),n=document.getElementById("sidebar");if(t&&n){const i=t.getBoundingClientRect(),l=Math.max(120,Math.min(i.width-200,e.clientX-i.left));n.style.width=`${l}px`,localStorage.setItem("eview_sidebar_width",l)}}else if(F==="horizontal"){const t=document.getElementById("main-content"),n=document.getElementById("preview-pane");if(t&&n){const i=t.getBoundingClientRect(),l=Math.max(80,Math.min(i.height-100,i.bottom-e.clientY));n.style.height=`${l}px`,localStorage.setItem("eview_preview_height",l)}}}}function Me(){var e,t;F&&((e=document.getElementById("splitter-v"))==null||e.classList.remove("dragging"),(t=document.getElementById("splitter-h"))==null||t.classList.remove("dragging"),F=null)}window.addEventListener("DOMContentLoaded",fe);
