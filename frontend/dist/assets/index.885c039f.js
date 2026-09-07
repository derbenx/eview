(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))l(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&l(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerpolicy&&(a.referrerPolicy=i.referrerpolicy),i.crossorigin==="use-credentials"?a.credentials="include":i.crossorigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function l(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();function ee(){return window.go.main.App.GetDrives()}function te(e){return window.go.main.App.GetDirectories(e)}function ne(e,t){return window.go.main.App.GetFilesInDirectory(e,t)}function U(e){return window.go.main.App.GetFileBase64(e)}function Y(e){return window.go.main.App.GetGIFFrames(e)}function ie(e,t){return window.go.main.App.RenameFile(e,t)}function K(){return window.go.main.App.QuitApp()}let k="",v=[],c=[],o=-1,m=new Set,D=new Map,$=new Map,E=!0,h=0,M=null,b=[],g=1,S=0,N=0,H=!1,q=0,V=0,p=!1,B=new Set,T=new Map,A=null;function le(){const e=document.getElementById("app");e.innerHTML=`
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
    `,oe(),ce()}function oe(){document.getElementById("btn-prev").onclick=()=>R(-1),document.getElementById("btn-next").onclick=()=>R(1),document.getElementById("btn-frame-back").onclick=()=>G(-1),document.getElementById("btn-frame-fwd").onclick=()=>G(1),document.getElementById("btn-animate").onclick=Z,document.getElementById("btn-fullscreen").onclick=C,document.getElementById("btn-select-all").onclick=de,document.getElementById("btn-select-none").onclick=ue;const e=document.getElementById("chk-imgs"),t=document.getElementById("chk-gif"),n=document.getElementById("chk-ico"),l=document.getElementById("chk-all");l.onchange=r=>{const s=r.target.checked;e.checked=s,t.checked=s,n.checked=s,P(k)};const i=()=>{l.checked=e.checked&&t.checked&&n.checked,P(k)};e.onchange=i,t.onchange=i,n.onchange=i,document.getElementById("drive-select").onchange=r=>{const s=r.target.value;s&&L(s)},document.getElementById("path-input").onkeydown=r=>{if(r.key==="Enter"){const s=r.target.value.trim();s&&L(s)}},window.onkeydown=ve;const a=document.getElementById("preview-viewport");a.onwheel=me,a.onmousedown=fe,window.onmousemove=ge,window.onmouseup=pe}function ae(){const e=[];return document.getElementById("chk-imgs").checked&&e.push("img"),document.getElementById("chk-gif").checked&&e.push("gif"),document.getElementById("chk-ico").checked&&e.push("ico"),e}async function ce(){try{v=await ee();const e=document.getElementById("drive-select");e.innerHTML=v.map(t=>`<option value="${y(t.path)}">${y(t.label)}</option>`).join(""),v.length>0&&L(v[0].path)}catch(e){console.error("Failed to get drives:",e)}}async function L(e){k=e,document.getElementById("path-input").value=e,B.add(e),W(),P(e)}async function W(){const e=document.getElementById("tree-root");if(v.length===0)return;let t="";for(const n of v)t+=await X(n.path,n.label,0);e.innerHTML=t,e.querySelectorAll(".tree-node-item").forEach(n=>{n.onclick=l=>{l.stopPropagation();const i=n.dataset.path;l.target.classList.contains("tree-expander")?(B.has(i)?B.delete(i):B.add(i),W()):L(i)}})}async function X(e,t,n){const l=B.has(e),i=k===e,a=n*14;let r="";if(l){if(!T.has(e))try{const I=await te(e);T.set(e,I||[])}catch{T.set(e,[])}const J=T.get(e);for(const I of J)r+=await X(I.path,I.name,n+1)}const s=l?"\u25BC":"\u25B6";return`
        <li>
            <div class="tree-node-item ${i?"active":""}" data-path="${y(e)}" style="padding-left: ${a+6}px;">
                <span class="tree-expander">${s}</span>
                <span>\u{1F4C1} ${y(t)}</span>
            </div>
            ${l?`<ul style="list-style: none;">${r}</ul>`:""}
        </li>
    `}async function P(e){if(!e)return;const t=ae();try{c=await ne(e,t)||[],o=c.length>0?0:-1,m.clear(),F(),d(),f(),u()}catch(n){console.error("Failed to list files:",n),c=[],o=-1,d(),f(),u()}}function d(){const e=document.getElementById("thumb-grid");if(c.length===0){e.innerHTML='<div style="grid-column: 1 / -1; color: #666; font-size: 13px; padding: 20px; text-align: center;">No matching files in this directory</div>';return}if(e.innerHTML=c.map((t,n)=>{const l=n===o,i=m.has(t.path);let a="\u{1F5BC}\uFE0F";return t.isGif?a="\u{1F39E}\uFE0F":t.extension==="ico"&&(a="\u{1F4A0}"),`
            <div class="thumb-card ${l?"highlighted":""} ${i?"selected":""}"
                 data-index="${n}" id="thumb-card-${n}">
                <div class="thumb-img-wrapper" id="thumb-img-wrapper-${n}">
                    <div class="thumb-icon-placeholder">${a}</div>
                </div>
                <div class="thumb-label" title="${y(t.name)}">${y(t.name)}</div>
            </div>
        `}).map((t,n)=>(re(c[n],n),t)).join(""),e.querySelectorAll(".thumb-card").forEach(t=>{t.onclick=n=>{const l=parseInt(t.dataset.index,10);if(n.ctrlKey||n.metaKey)j(l);else if(n.shiftKey&&o>=0){const i=Math.min(o,l),a=Math.max(o,l);for(let r=i;r<=a;r++)m.add(c[r].path);o=l,d(),f(),u()}else o=l,d(),f(),u()}}),o>=0){const t=document.getElementById(`thumb-card-${o}`);t&&t.scrollIntoView({block:"nearest",behavior:"smooth"})}}async function re(e,t){let n=D.get(e.path);if(!n)try{n=await U(e.path),D.set(e.path,n)}catch{return}const l=document.getElementById(`thumb-img-wrapper-${t}`);l&&(l.innerHTML=`<img src="${n}" class="thumb-img" alt="${y(e.name)}" draggable="false" />`)}async function f(){z();const e=document.getElementById("empty-preview-msg"),t=document.getElementById("preview-image"),n=document.getElementById("fullscreen-image");if(o<0||o>=c.length){e.style.display="block",t.style.display="none";return}e.style.display="none",t.style.display="block";const l=c[o];let i=D.get(l.path);if(!i)try{i=await U(l.path),D.set(l.path,i)}catch{e.textContent="Failed to load image preview",e.style.display="block",t.style.display="none";return}t.src=i,p&&(n.src=i),l.isGif&&E&&Q(l)}async function Q(e){let t=$.get(e.path);if(!t)try{t=await Y(e.path),$.set(e.path,t)}catch(n){console.error("Failed to load GIF frames:",n);return}!t||t.length===0||(b=t,h=0,se())}function se(){z(),!(!b||b.length<=1||!E)&&(M=setInterval(()=>{h=(h+1)%b.length;const e=b[h],t=document.getElementById("preview-image"),n=document.getElementById("fullscreen-image");t&&(t.src=e),p&&n&&(n.src=e)},100))}function z(){M&&(clearInterval(M),M=null)}function Z(){var t;E=!E;const e=document.getElementById("btn-animate");E?(e.classList.add("btn-active"),o>=0&&((t=c[o])==null?void 0:t.isGif)&&Q(c[o])):(e.classList.remove("btn-active"),z())}async function G(e){var i;if(o<0||!((i=c[o])!=null&&i.isGif))return;const t=c[o];let n=$.get(t.path);if(!n)try{n=await Y(t.path),$.set(t.path,n)}catch{return}if(!n||n.length===0)return;E&&Z(),b=n,h=(h+e+n.length)%n.length;const l=n[h];document.getElementById("preview-image").src=l,p&&(document.getElementById("fullscreen-image").src=l)}function R(e){if(c.length===0)return;const t=[];if(c.forEach((n,l)=>{m.has(n.path)&&t.push(l)}),t.length>0){let n=t.indexOf(o);n===-1?n=e>0?0:t.length-1:n=(n+e+t.length)%t.length,o=t[n]}else o=(o+e+c.length)%c.length;F(),d(),f(),u()}function j(e){if(e<0||e>=c.length)return;const t=c[e].path;m.has(t)?m.delete(t):m.add(t),d(),u()}function de(){c.forEach(e=>m.add(e.path)),d(),u()}function ue(){m.clear(),d(),u()}function me(e){e.preventDefault();const t=e.deltaY>0?-.1:.1;g=Math.max(.2,Math.min(5,g+t)),x()}function fe(e){e.button===0&&(H=!0,q=e.clientX-S,V=e.clientY-N)}function ge(e){!H||(S=e.clientX-q,N=e.clientY-V,x())}function pe(){H=!1}function F(){g=1,S=0,N=0,x()}function x(){const e=document.getElementById("preview-image");e&&(e.style.transform=`translate(${S}px, ${N}px) scale(${g})`)}function C(){p=!p;const e=document.getElementById("fullscreen-overlay");p?(e.style.display="flex",f(),O()):e.style.display="none"}function O(){if(o>=0&&o<c.length){const e=c[o];document.getElementById("fs-file-info").textContent=`${e.name} (${e.width}x${e.height} | ${_(e.size)})`}}function ye(){A="quit";const e=document.getElementById("modal-overlay"),t=document.getElementById("modal-card");t.innerHTML=`
        <div class="modal-title">Quit Application</div>
        <div class="modal-body">Are you sure you want to quit eview? (y/n)</div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">No (N)</button>
            <button class="btn btn-active" id="modal-confirm">Yes (Y)</button>
        </div>
    `,e.style.display="flex",document.getElementById("modal-cancel").onclick=w,document.getElementById("modal-confirm").onclick=()=>K()}function he(){if(o<0||o>=c.length)return;const e=c[o];A="rename";const t=document.getElementById("modal-overlay"),n=document.getElementById("modal-card");n.innerHTML=`
        <div class="modal-title">Rename File</div>
        <div class="modal-body">
            Enter new file name:
            <input type="text" class="modal-input" id="rename-input" value="${y(e.name)}" />
        </div>
        <div class="modal-actions">
            <button class="btn" id="modal-cancel">Cancel</button>
            <button class="btn btn-active" id="modal-confirm">Rename</button>
        </div>
    `,t.style.display="flex";const l=document.getElementById("rename-input");l.focus(),l.select();const i=async()=>{const a=l.value.trim();if(a&&a!==e.name)try{await ie(e.path,a),w(),P(k)}catch(r){alert("Rename failed: "+r)}else w()};document.getElementById("modal-cancel").onclick=w,document.getElementById("modal-confirm").onclick=i,l.onkeydown=a=>{a.key==="Enter"&&i(),a.key==="Escape"&&w()}}function w(){A=null,document.getElementById("modal-overlay").style.display="none"}function ve(e){if(!(e.target.tagName==="INPUT"&&e.target.id!=="rename-input")){if(A==="quit"){e.key==="y"||e.key==="Y"||e.key==="Enter"?K():(e.key==="n"||e.key==="N"||e.key==="Escape")&&w();return}if(!A){if(e.ctrlKey&&(e.key==="f"||e.key==="F")||e.key==="F11"){e.preventDefault(),C();return}if(e.key==="Escape"){p?C():ye();return}if(e.key==="F2"){e.preventDefault(),he();return}if(e.key===" "||e.code==="Space"){e.preventDefault(),o>=0&&j(o);return}if(e.key==="+"||e.key==="="){g=Math.min(5,g+.2),x();return}if(e.key==="-"||e.key==="_"){g=Math.max(.2,g-.2),x();return}if(e.key==="<"||e.key===","){G(-1);return}if(e.key===">"||e.key==="."){G(1);return}if(p){if(e.key==="PageUp"||e.key==="ArrowUp"||e.key==="ArrowLeft"){e.preventDefault(),R(-1),O();return}if(e.key==="PageDown"||e.key==="ArrowDown"||e.key==="ArrowRight"){e.preventDefault(),R(1),O();return}}else{if(e.key==="ArrowLeft"){e.preventDefault(),o>0&&(o--,F(),d(),f(),u());return}if(e.key==="ArrowRight"){e.preventDefault(),o<c.length-1&&(o++,F(),d(),f(),u());return}if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();const t=document.getElementById("thumb-grid"),n=Math.max(1,Math.floor(t.clientWidth/120)),l=e.key==="ArrowDown"?n:-n,i=o+l;i>=0&&i<c.length&&(o=i,F(),d(),f(),u());return}if(e.key==="PageUp"){e.preventDefault();const t=document.getElementById("thumb-grid");t.scrollTop-=t.clientHeight;return}if(e.key==="PageDown"){e.preventDefault();const t=document.getElementById("thumb-grid");t.scrollTop+=t.clientHeight;return}}}}}function u(){if(document.getElementById("info-folder").textContent=`Folder: ${k||"-"}`,document.getElementById("info-selection").textContent=`${m.size} selected of ${c.length} files`,o>=0&&o<c.length){const e=c[o];document.getElementById("info-file").textContent=`File: ${e.name}`,document.getElementById("info-dim").textContent=`Resolution: ${e.width>0?e.width+"x"+e.height:"Unknown"}`,document.getElementById("info-size").textContent=`Size: ${_(e.size)}`}else document.getElementById("info-file").textContent="File: -",document.getElementById("info-dim").textContent="Resolution: -",document.getElementById("info-size").textContent="Size: -"}function _(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],l=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,l)).toFixed(1))+" "+n[l]}function y(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}window.addEventListener("DOMContentLoaded",le);
