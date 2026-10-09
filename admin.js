(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const base=structuredClone(window.AURA_DATA||{});
  const STORAGE_KEY='aura-digital-web-studio-v14';
  const LEGACY_STORAGE_KEYS=[];
  const DB_NAME='aura-digital-web-studio-v14';
  const DB_STORE='project';
  const DB_KEY='current';
  const DB_BACKUP_KEY='draft-before-published-startup';
  const STORAGE_BACKUP_KEY='aura-digital-web-studio-v14-draft-backup';
  const GITHUB_SESSION_KEY='aura-digital-web-studio-github-token';
  let state=null;
  let galleryService='menus';
  let activeCategory='Todas';
  let saveTimer=null;
  let previewEdit=true;
  let activePreviewPath='';
  let editingGalleryId='';
  let draggingGallery=null;

  const sectionMeta={
    hero:['Portada','La primera impresión'],services:['Servicios','Tarjetas principales'],invitationGallery:['Invitaciones','Galería por categorías'],menus:['Menús digitales','Bloque de producto'],web:['Páginas web','Bloque de producto'],galleries:['Galerías fotógrafos','Bloque de producto'],why:['Por qué Aura','Confianza'],process:['Proceso','Cómo trabajamos'],cta:['Cierre','Llamada a la acción']
  };
  const fontOptions=[
    ['Cormorant Garamond',"'Cormorant Garamond', Georgia, serif"],['Playfair Display',"'Playfair Display', Georgia, serif"],['Libre Baskerville',"'Libre Baskerville', Georgia, serif"],['Georgia',"Georgia, 'Times New Roman', serif"],['Inter',"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"],['Manrope',"Manrope, -apple-system, sans-serif"],['Montserrat',"Montserrat, Arial, sans-serif"],['DM Sans',"'DM Sans', -apple-system, sans-serif"],['Great Vibes',"'Great Vibes', 'Brush Script MT', cursive"]
  ];
  const palettes=[
    {name:'Aura Signature',group:'Claros',note:'Negro · blanco cálido · oro del logo',colors:{primary:'#151515',primarySoft:'#2d2b28',accent:'#d6ae52',accentSoft:'#ecd9a5',background:'#fefcf9',surface:'#ffffff',text:'#151515',muted:'#6f6a62',border:'#e8e0d5'},hero:'linear-gradient(135deg,#ffffff 0%,#fefcf9 58%,#f2e3bd 100%)',button:'linear-gradient(135deg,#111111 0%,#2b2824 100%)',cta:'linear-gradient(135deg,#0d0d0d 0%,#1c1b19 68%,#725a2d 150%)'},
    {name:'Blanco Aura',group:'Claros',note:'El blanco cálido del fondo del logotipo',colors:{primary:'#121212',primarySoft:'#2b2a28',accent:'#d6ae52',accentSoft:'#efe0b8',background:'#fefcf9',surface:'#fefcf9',text:'#141414',muted:'#77716a',border:'#ebe5dc'},hero:'linear-gradient(135deg,#ffffff 0%,#fefcf9 72%,#f7f0df 100%)',button:'linear-gradient(135deg,#111111,#2c2924)',cta:'linear-gradient(135deg,#111111 0%,#24221e 72%,#765e2f 150%)'},
    {name:'Aura Ivory',group:'Claros',note:'Marfil luminoso · oro cálido',colors:{primary:'#171717',primarySoft:'#34312d',accent:'#cfad63',accentSoft:'#efe0bd',background:'#fffaf1',surface:'#fffefa',text:'#171717',muted:'#766f65',border:'#eadfce'},hero:'linear-gradient(135deg,#fffefa 0%,#fff6e9 55%,#ead8b8 100%)',button:'linear-gradient(135deg,#141414,#302b24)',cta:'linear-gradient(135deg,#111111 0%,#24211d 68%,#806633 150%)'},
    {name:'Champagne Gold',group:'Claros',note:'Champagne · negro suave',colors:{primary:'#191817',primarySoft:'#3b3732',accent:'#caa35a',accentSoft:'#ead5aa',background:'#f8f3e9',surface:'#fffdf8',text:'#191817',muted:'#746d64',border:'#e3d8c8'},hero:'linear-gradient(135deg,#fffdf8 0%,#f5ecdd 56%,#dfc79e 100%)',button:'linear-gradient(135deg,#151515,#373027)',cta:'linear-gradient(135deg,#111 0%,#28231d 64%,#765926 145%)'},
    {name:'Warm Sand',group:'Claros',note:'Arena · oro · carbón',colors:{primary:'#1b1a18',primarySoft:'#403b35',accent:'#c8a565',accentSoft:'#e9d5b0',background:'#f5eee3',surface:'#fffaf3',text:'#1b1a18',muted:'#746a5f',border:'#dfd1c0'},hero:'linear-gradient(135deg,#fffaf3 0%,#f0e2d0 56%,#ddc3a1 100%)',button:'linear-gradient(135deg,#171614,#3a332b)',cta:'linear-gradient(135deg,#12110f 0%,#2f2922 65%,#795f32 145%)'},
    {name:'Noir Gallery',group:'Oscuros',note:'Negro editorial · oro Aura',colors:{primary:'#0b0b0c',primarySoft:'#3a3325',accent:'#d6ae52',accentSoft:'#7f6732',background:'#0f0f10',surface:'#171719',text:'#f6f1e8',muted:'#aaa39a',border:'#2d2b2c'},hero:'linear-gradient(135deg,#171719 0%,#101011 58%,#2a2111 100%)',button:'linear-gradient(135deg,#090909 0%,#24211a 72%,#6e5526 150%)',cta:'linear-gradient(135deg,#080808 0%,#171717 70%,#3b2d13 145%)'},
    {name:'Carbon Gold',group:'Oscuros',note:'Carbón mate · champagne',colors:{primary:'#11100f',primarySoft:'#413722',accent:'#c7a365',accentSoft:'#715d38',background:'#171615',surface:'#211f1d',text:'#f6f2eb',muted:'#aaa196',border:'#383430'},hero:'linear-gradient(135deg,#24211e 0%,#161514 62%,#302613 100%)',button:'linear-gradient(135deg,#0d0c0b,#2c251b 72%,#735b2f 150%)',cta:'linear-gradient(135deg,#11100f 0%,#201d1a 68%,#453516 145%)'},
    {name:'Espresso Night',group:'Oscuros',note:'Café oscuro · crema · oro',colors:{primary:'#100c0a',primarySoft:'#4a3520',accent:'#d0a25c',accentSoft:'#76562c',background:'#17120f',surface:'#231b17',text:'#fff7ed',muted:'#b5a79a',border:'#3d3029'},hero:'linear-gradient(135deg,#2d211a 0%,#17120f 60%,#3c2a14 100%)',button:'linear-gradient(135deg,#0e0a08,#322117 72%,#76502b 150%)',cta:'linear-gradient(135deg,#100c0a 0%,#211712 70%,#503815 150%)'},
    {name:'Black Pearl',group:'Oscuros',note:'Negro suave · perla · oro',colors:{primary:'#090a0c',primarySoft:'#393528',accent:'#d6ae52',accentSoft:'#6e5d39',background:'#111214',surface:'#1a1b1e',text:'#f8f7f3',muted:'#a7a6a1',border:'#303136'},hero:'linear-gradient(135deg,#202126 0%,#111214 64%,#2b2416 100%)',button:'linear-gradient(135deg,#090a0c,#24241f 72%,#6c5929 150%)',cta:'linear-gradient(135deg,#0b0c0e 0%,#18191c 72%,#3b3017 150%)'}
  ];

  function deepMerge(t,s){if(!s||typeof s!=='object')return t;for(const k of Object.keys(s)){if(Array.isArray(s[k]))t[k]=s[k];else if(s[k]&&typeof s[k]==='object')t[k]=deepMerge(t[k]||{},s[k]);else t[k]=s[k]}return t}
  function normalizeState(next){
    // Keep the full Aura navigation even when an older local draft only stored one link.
    const defaults=structuredClone(base.nav?.items||[]), current=Array.isArray(next.nav?.items)?next.nav.items:[];
    const byTarget=new Map(current.map(x=>[String(x?.target||''),x]));
    const merged=defaults.map(d=>Object.assign({},d,byTarget.get(String(d.target))||{}));
    current.forEach(x=>{if(x?.target&&!merged.some(y=>String(y.target)===String(x.target)))merged.push(x)});
    next.nav=next.nav||{};next.nav.items=merged;
    ['menus','web','galleries'].forEach(key=>{
      const f=next.features?.[key];if(!f)return;f.examples=Array.isArray(f.examples)?f.examples:[];
      f.examples.forEach(x=>{if(x.focusX==null)x.focusX=50;if(x.focusY==null)x.focusY=50;if(!x.id)x.id=uid(key);if(!x.cardRatio)x.cardRatio='landscape';if(x.lightboxImage==null)x.lightboxImage=''});
    });
    next.invitationGallery=next.invitationGallery||{};next.invitationGallery.items=Array.isArray(next.invitationGallery.items)?next.invitationGallery.items:[];
    next.invitationGallery.items.forEach(x=>{if(x.focusX==null)x.focusX=50;if(x.focusY==null)x.focusY=50;if(!x.id)x.id=uid('inv');if(!x.cardRatio)x.cardRatio='portrait';if(x.lightboxImage==null)x.lightboxImage=''});
    next.hero=next.hero||{};
    if(!next.hero.mobileImage)next.hero.mobileImage=next.hero.image||'assets/hero.jpg';
    if(next.hero.mobileImageFocusX==null)next.hero.mobileImageFocusX=next.hero.imageFocusX??50;
    if(next.hero.mobileImageFocusY==null)next.hero.mobileImageFocusY=next.hero.imageFocusY??50;
    if(next.hero.title==='Experiencias digitales que conectan')next.hero.title='Más que una invitación, una experiencia.';
    if(next.hero.eyebrow==='IDEAS QUE SE VIVEN EN DIGITAL')next.hero.eyebrow='EXPERIENCIAS DIGITALES';
    if(String(next.hero.text||'').startsWith('Creamos invitaciones digitales'))next.hero.text='Invitaciones digitales, menús, páginas web y galerías para momentos únicos.';
    if(next.hero.secondaryButton==='Ver servicios')next.hero.secondaryButton='Ver proyectos';
    next.meta=next.meta||{};
    if(!String(next.meta.siteUrl||'').trim())next.meta.siteUrl='https://auradigitaljal.com';
    next.version=14;
    return next;
  }
  function openDb(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)){resolve(null);return}
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE)};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    });
  }
  async function dbGet(key=DB_KEY){
    try{const db=await openDb();if(!db)return null;return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly');const req=tx.objectStore(DB_STORE).get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}catch(e){return null}
  }
  async function dbPut(value,key=DB_KEY){
    try{const db=await openDb();if(!db)return false;return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(structuredClone(value),key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error)})}catch(e){return false}
  }
  function stripLargeDataUrls(value){
    const copy=structuredClone(value);
    const walk=o=>{if(!o||typeof o!=='object')return;for(const k of Object.keys(o)){const v=o[k];if(typeof v==='string'&&v.startsWith('data:image/')&&v.length>180000)o[k]='';else if(v&&typeof v==='object')walk(v)}};walk(copy);return copy;
  }
  async function readLocalDraft(backup=false){
    let saved=await dbGet(backup?DB_BACKUP_KEY:DB_KEY);
    if(!saved){
      try{const raw=localStorage.getItem(backup?STORAGE_BACKUP_KEY:STORAGE_KEY);if(raw)saved=JSON.parse(raw)}catch(e){}
    }
    return saved;
  }
  // A copy of the previous editing session survives even if subsequent edits overwrite "current".
  async function preserveDraftBeforePublished(saved){
    if(!saved||await readLocalDraft(true))return;
    const ok=await dbPut(saved,DB_BACKUP_KEY);
    if(!ok){
      try{localStorage.setItem(STORAGE_BACKUP_KEY,JSON.stringify(saved))}
      catch(e){try{localStorage.setItem(STORAGE_BACKUP_KEY,JSON.stringify(stripLargeDataUrls(saved)))}catch(_){} }
    }
  }
  async function loadState(){
    const saved=await readLocalDraft();
    const next=saved?deepMerge(structuredClone(base),saved):structuredClone(base);
    return normalizeState(next);
  }
  function setProjectSource(message){const tag=$('#projectSource');if(tag)tag.textContent=message}
  async function restoreSavedDraft(backup=false){
    const saved=await readLocalDraft(backup);
    if(!saved){setStatus('No hay un borrador guardado para recuperar');return}
    if(!confirm('¿Abrir este borrador local en lugar de la versión publicada? No se publicará hasta que pulses Publicar cambios.'))return;
    clearTimeout(saveTimer);
    state=normalizeState(deepMerge(structuredClone(base),saved));
    renderAll();await persistState(backup?'Borrador anterior recuperado':'Borrador local recuperado');
    setProjectSource(backup?'Editando borrador anterior · sin publicar':'Editando borrador local · sin publicar');
    sendPreview();
  }
  function parts(path){return path.split('.').map(x=>/^\d+$/.test(x)?Number(x):x)}
  function get(path){return parts(path).reduce((o,k)=>o?.[k],state)}
  function set(path,val){const p=parts(path);let o=state;for(let i=0;i<p.length-1;i++){if(o[p[i]]==null)o[p[i]]=typeof p[i+1]==='number'?[]:{};o=o[p[i]]}o[p.at(-1)]=val}
  function esc(v=''){return String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
  function uid(prefix='id'){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`}
  function setStatus(msg='Cambios guardados'){const el=$('#status');if(!el)return;el.textContent=msg;clearTimeout(setStatus.t);setStatus.t=setTimeout(()=>{el.textContent='Guardado automático activo'},2400)}
  async function persistState(msg='Cambios guardados'){
    const snapshot=structuredClone(state);
    const dbOk=await dbPut(snapshot);
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(snapshot))}catch(e){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(stripLargeDataUrls(snapshot)))}catch(_){}}
    setStatus(dbOk?msg:`${msg} · respaldo ligero`);
  }
  function saveState(msg='Cambios guardados'){sendPreview();clearTimeout(saveTimer);saveTimer=setTimeout(()=>persistState(msg),120)}
  function autoSave(){saveState('Guardado automático')}
  function sendPreview(){if(!state)return;for(const id of ['siteFrame','mobileFrame']){const f=$('#'+id);try{f?.contentWindow?.postMessage({type:'AURA_PREVIEW_STATE',state:structuredClone(state),editMode:previewEdit,highlightPath:activePreviewPath},'*')}catch(e){}}}
  function hardRefreshPreview(){for(const id of ['siteFrame','mobileFrame']){const f=$('#'+id);if(!f)continue;f.src='index.html?preview=1&t='+Date.now()}}

  function fillBindings(root=document){
    $$('[data-bind]',root).forEach(el=>{const v=get(el.dataset.bind);if(el.type==='checkbox')el.checked=Boolean(v);else if(v!==undefined&&v!==null)el.value=v;const out=$(`[data-output="${CSS.escape(el.dataset.bind)}"]`,root)||$(`[data-output="${CSS.escape(el.dataset.bind)}"]`);if(out)out.textContent=v});
    $$('[data-points-bind]',root).forEach(el=>{const v=get(el.dataset.pointsBind);el.value=Array.isArray(v)?v.join('\n'):''});
    $$('[data-image-path]',root).forEach(img=>{img.src=get(img.dataset.imagePath)||''});
    $$('[data-font-bind]',root).forEach(sel=>{sel.innerHTML=fontOptions.map(([n,v])=>`<option value="${esc(v)}">${esc(n)}</option>`).join('');sel.value=get(sel.dataset.fontBind)||fontOptions[0][1]});
  }

  function displaySiteAddress(){
    const raw=String(state.meta?.siteUrl||'').trim();
    if(!raw)return {short:'Tu dominio',caps:'TU DOMINIO',address:'Vista local'};
    try{
      const url=new URL(/^https?:\/\//i.test(raw)?raw:`https://${raw}`);
      const host=(url.host||raw).replace(/^www\./i,'');
      return {short:host,caps:host.toUpperCase(),address:host};
    }catch(e){
      const clean=raw.replace(/^https?:\/\//i,'').replace(/\/.*$/,'')||'Tu dominio';
      return {short:clean,caps:clean.toUpperCase(),address:clean};
    }
  }
  function renderAdminPreviews(){
    const snippetTitle=$('[data-snippet-site-title]'),snippetDesc=$('[data-snippet-description]'),snippetBrand=$('[data-snippet-title]');
    if(snippetBrand)snippetBrand.textContent=state.brand?.name||'Aura Digital';
    if(snippetTitle)snippetTitle.textContent=state.meta?.siteTitle||state.brand?.name||'Aura Digital';
    if(snippetDesc)snippetDesc.textContent=state.meta?.siteDescription||'';
    const addr=displaySiteAddress();
    const snippetUrl=$('[data-snippet-url]'),socialUrl=$('[data-social-preview-url]'),previewAddress=$('[data-preview-address]');
    if(snippetUrl)snippetUrl.textContent=addr.short;
    if(socialUrl)socialUrl.textContent=addr.caps;
    if(previewAddress)previewAddress.textContent=addr.address;
    const socialImg=$('[data-social-preview-image]'),socialTitle=$('[data-social-preview-title]'),socialDesc=$('[data-social-preview-description]');
    if(socialImg)socialImg.src=state.meta?.ogImage||state.hero?.image||'';
    if(socialTitle)socialTitle.textContent=state.meta?.ogTitle||state.meta?.siteTitle||state.brand?.name||'Aura Digital';
    if(socialDesc)socialDesc.textContent=state.meta?.ogDescription||state.meta?.siteDescription||'';
    const cn=$('[data-contact-number]'),cm=$('[data-contact-message]'),cs=$('[data-contact-socials]');
    if(cn)cn.textContent=state.contact?.whatsapp||'Sin número';if(cm)cm.textContent=state.contact?.whatsappMessage||'Sin mensaje';
    if(cs){const rows=[['Instagram',state.contact?.instagram],['Facebook',state.contact?.facebook],['TikTok',state.contact?.tiktok]].filter(([,v])=>v&&v!=='#');cs.innerHTML=rows.length?rows.map(([n,v])=>`<span>${esc(n)}</span>`).join(''):'<span>Sin redes visibles</span>'}
  }
  function highlightPreview(path){
    if(!path)return;activePreviewPath=path;for(const id of ['siteFrame','mobileFrame']){const f=$('#'+id);try{f?.contentWindow?.postMessage({type:'AURA_HIGHLIGHT_PATH',path},'*')}catch(e){}}
  }

  function renderNavEditor(){
    $('#navEditor').innerHTML=(state.nav.items||[]).map((x,i)=>`<div class="edit-card"><div class="edit-card-head"><strong>Enlace ${i+1}</strong><label class="switch-row" style="margin:0!important"><input type="checkbox" data-bind="nav.items.${i}.visible"><span>Visible</span></label></div><div class="field-grid two"><label>Texto<input data-bind="nav.items.${i}.label"></label><label>Destino<input data-bind="nav.items.${i}.target"></label></div></div>`).join('')
  }
  function renderBenefits(){
    $('#benefitsEditor').innerHTML=(state.benefits||[]).map((x,i)=>`<div class="edit-card"><div class="edit-card-head"><strong>Beneficio ${i+1}</strong><div class="card-actions"><button type="button" class="icon-btn danger" data-action="remove-benefit" data-index="${i}">Eliminar</button></div></div><label class="switch-row"><input type="checkbox" data-bind="benefits.${i}.visible"><span>Visible</span></label><div class="field-grid two"><label>Ícono<input data-bind="benefits.${i}.icon"></label><label>Texto<input data-bind="benefits.${i}.title"></label></div></div>`).join('')
  }
  function renderServices(){
    $('#servicesEditor').innerHTML=(state.services||[]).map((x,i)=>`<div class="edit-card"><div class="edit-card-head"><strong>${esc(x.title||`Servicio ${i+1}`)}</strong><label class="switch-row" style="margin:0!important"><input type="checkbox" data-bind="services.${i}.visible"><span>Visible</span></label></div><div class="media-control" style="margin-top:9px"><div class="media-preview"><img data-image-path="services.${i}.image" alt=""></div><div class="media-copy"><strong>Imagen</strong><span>Tarjeta principal del servicio.</span><label class="file-field">Cambiar<input type="file" accept="image/*" data-image-upload="services.${i}.image"></label></div></div><label>Título<input data-bind="services.${i}.title"></label><label>Descripción<textarea rows="2" data-bind="services.${i}.text"></textarea></label><div class="field-grid two"><label>Botón<input data-bind="services.${i}.button"></label><label>Destino<input data-bind="services.${i}.target"></label></div></div>`).join('')
  }
  function renderFeatures(){
    const keys=['menus','web','galleries'];
    $('#featuresEditor').innerHTML=keys.map(key=>{const x=state.features[key];const title=key==='menus'?'Menús digitales':key==='web'?'Páginas web':'Galerías para fotógrafos';return `<div class="edit-card"><div class="edit-card-head"><strong>${title}</strong><label class="switch-row" style="margin:0!important"><input type="checkbox" data-bind="features.${key}.visible"><span>Visible</span></label></div><div class="media-control"><div class="media-preview"><img data-image-path="features.${key}.image" alt=""></div><div class="media-copy"><strong>Imagen principal</strong><span>Se usa en el bloque de producto.</span><label class="file-field">Cambiar<input type="file" accept="image/*" data-image-upload="features.${key}.image"></label></div></div><label>Etiqueta<input data-bind="features.${key}.eyebrow"></label><label>Título<textarea rows="2" data-bind="features.${key}.title"></textarea></label><label>Texto<textarea rows="3" data-bind="features.${key}.text"></textarea></label><label>Botón<input data-bind="features.${key}.button"></label><label>Puntos clave <small>Uno por línea</small><textarea rows="4" data-points-bind="features.${key}.points"></textarea></label></div>`}).join('')
  }
  function renderWhyProcess(){
    $('#whyEditor').innerHTML=(state.why.items||[]).map((x,i)=>`<div class="edit-card"><div class="edit-card-head"><strong>Razón ${i+1}</strong><label class="switch-row" style="margin:0!important"><input type="checkbox" data-bind="why.items.${i}.visible"><span>Visible</span></label></div><div class="field-grid two"><label>Ícono<input data-bind="why.items.${i}.icon"></label><label>Título<input data-bind="why.items.${i}.title"></label></div><label>Texto<textarea rows="2" data-bind="why.items.${i}.text"></textarea></label></div>`).join('');
    $('#processEditor').innerHTML=(state.process.items||[]).map((x,i)=>`<div class="edit-card"><div class="edit-card-head"><strong>Paso ${i+1}</strong></div><div class="field-grid two"><label>Número<input data-bind="process.items.${i}.number"></label><label>Título<input data-bind="process.items.${i}.title"></label></div><label>Texto<textarea rows="2" data-bind="process.items.${i}.text"></textarea></label></div>`).join('')
  }
  function renderCategories(){
    const cats=(state.invitationGallery.categories||[]).filter(Boolean);if(!cats.includes('Todas'))cats.unshift('Todas');state.invitationGallery.categories=cats;
    if(!cats.includes(activeCategory))activeCategory='Todas';
    $('#categoryEditor').innerHTML=cats.map((c,i)=>{const count=(state.invitationGallery.items||[]).filter(x=>c==='Todas'||x.category===c).length;return `<button type="button" class="category-chip ${c===activeCategory?'active':''}" data-action="select-category" data-category="${esc(c)}"><span>${esc(c)}</span><span class="count">${count}</span>${c==='Todas'?'':`<span class="remove-cat" data-action="remove-category" data-index="${i}" title="Eliminar categoría">×</span>`}</button>`}).join('');
    $('#activeCategoryLabel').textContent=activeCategory;
    $('#invUploadCategory').innerHTML=cats.filter(c=>c!=='Todas').map(c=>`<option value="${esc(c)}">Nuevas → ${esc(c)}</option>`).join('');
    if(activeCategory!=='Todas'&&cats.includes(activeCategory))$('#invUploadCategory').value=activeCategory;
  }
  function galleryCardEditor(x,kind,key,index){
    const typeLabel=kind==='invitation'?(x.category||'Sin categoría'):(key==='menus'?'Menú digital':key==='web'?'Proyecto web':'Galería fotográfica');
    const ids=visibleIds(kind,key),pos=ids.indexOf(String(x.id)),canPrev=pos>0,canNext=pos>=0&&pos<ids.length-1;
    const ratio=x.cardRatio||(kind==='invitation'?'portrait':'landscape');
    return `<article class="gallery-admin-card ${x.visible===false?'is-hidden':''}" data-gallery-drag="1" data-kind="${kind}" data-key="${key||''}" data-id="${esc(x.id)}">
      <div class="gallery-admin-image ratio-${esc(ratio)}">
        <img draggable="false" src="${esc(x.image||'')}" style="object-position:${Number(x.focusX??50)}% ${Number(x.focusY??50)}%" alt="">
        <span class="gallery-badge">${esc(typeLabel)}</span>
        <span class="publish-state ${x.visible===false?'off':''}">${x.visible===false?'Oculto':'Publicado'}</span>
      </div>
      <div class="gallery-admin-body">
        <div class="gallery-item-heading">
          <button type="button" class="drag-handle" draggable="true" title="Arrastra para cambiar el orden" aria-label="Arrastra para cambiar el orden">⋮⋮</button>
          <div class="gallery-item-title"><small>Posición ${Math.max(0,pos)+1} de ${ids.length}</small><strong>${esc(x.title||'Sin título')}</strong><span>${esc(x.subtitle||'')}</span></div>
          <div class="gallery-item-tools">
            <button type="button" class="reorder-action" ${canPrev?'':'disabled'} title="Mover antes" aria-label="Mover antes" data-action="move-item" data-kind="${kind}" data-key="${key||''}" data-id="${esc(x.id)}" data-dir="-1">←</button>
            <button type="button" class="reorder-action" ${canNext?'':'disabled'} title="Mover después" aria-label="Mover después" data-action="move-item" data-kind="${kind}" data-key="${key||''}" data-id="${esc(x.id)}" data-dir="1">→</button>
          </div>
        </div>
        <div class="gallery-quick-meta"><span>${esc(typeLabel)}</span><span>${x.lightboxImage?'Vista completa independiente':'Vista completa = miniatura'}</span>${x.url?'<span>Demo enlazado</span>':'<span>Sin enlace</span>'}</div>
        <button type="button" class="project-edit-primary" data-action="edit-item" data-kind="${kind}" data-key="${key||''}" data-id="${esc(x.id)}"><span>Editar proyecto</span><b>Texto, imágenes y enlace</b><i>→</i></button>
        <div class="gallery-admin-actions gallery-card-actions">
          <button type="button" class="quiet-action" data-action="toggle-item" data-kind="${kind}" data-key="${key||''}" data-id="${esc(x.id)}">${x.visible===false?'Publicar':'Ocultar'}</button>
          <button type="button" class="quiet-action" data-action="duplicate-item" data-kind="${kind}" data-key="${key||''}" data-id="${esc(x.id)}">Duplicar</button>
          <button type="button" class="quiet-action danger" data-action="remove-item" data-kind="${kind}" data-key="${key||''}" data-id="${esc(x.id)}">Eliminar</button>
        </div>
      </div>
    </article>`
  }

  function renderProjectDialog(kind,key,id){
    const dialog=$('#projectEditorDialog'),host=$('#projectEditorDialogContent');
    if(!dialog||!host)return;
    const {arr,index}=locate(kind,key,id);if(index<0)return;
    const x=arr[index];editingGalleryId=String(id);
    const path=kind==='invitation'?`invitationGallery.items.${index}`:`features.${key}.examples.${index}`;
    const cat=kind==='invitation'?`<label class="project-field-full">Categoría<select data-bind="${path}.category">${state.invitationGallery.categories.filter(c=>c!=='Todas').map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select></label>`:'';
    const typeLabel=kind==='invitation'?(x.category||'Invitación'):(key==='menus'?'Menú digital':key==='web'?'Página web':'Galería para fotógrafos');
    const detail=x.lightboxImage||x.image||'';
    dialog.dataset.kind=kind;dialog.dataset.key=key||'';dialog.dataset.id=String(id);
    host.innerHTML=`
      <div class="project-dialog-title"><span class="eyebrow">EDITAR PROYECTO</span><h3>${esc(x.title||'Sin título')}</h3><p>${esc(typeLabel)} · los cambios se guardan automáticamente.</p></div>
      <section class="project-editor-block project-data-block">
        <div class="project-editor-block-head"><div><strong>Información</strong><span>Lo que verá tu cliente en la galería.</span></div><span class="autosave-pill">Guardado automático</span></div>
        <div class="project-fields">
          <label>Título<input data-bind="${path}.title" placeholder="Nombre del proyecto"></label>
          <label>Subtítulo<input data-bind="${path}.subtitle" placeholder="Descripción breve"></label>
          ${cat}
          <label class="project-field-full">Enlace del proyecto <small>Opcional · demo o página real.</small><input data-bind="${path}.url" placeholder="https://..."></label>
        </div>
      </section>
      <section class="project-editor-block">
        <div class="project-editor-block-head"><div><strong>Miniatura</strong><span>Esta es la imagen que aparece dentro de la página.</span></div></div>
        <div class="project-dialog-media">
          <div class="project-dialog-preview"><img data-image-path="${path}.image" alt="Miniatura"></div>
          <div class="project-dialog-media-copy"><p>Cambia únicamente la miniatura visible en la galería.</p><label class="file-field strong">Cambiar miniatura<input type="file" accept="image/*" data-image-upload="${path}.image"></label></div>
        </div>
        <label>Formato de miniatura<select data-bind="${path}.cardRatio"><option value="landscape">Horizontal 16:10</option><option value="portrait">Vertical</option><option value="square">Cuadrado</option></select></label>
        <div class="project-focus-grid"><label>Encuadre horizontal <output data-output="${path}.focusX">${Number(x.focusX??50)}</output><input type="range" min="0" max="100" data-bind="${path}.focusX"></label><label>Encuadre vertical <output data-output="${path}.focusY">${Number(x.focusY??50)}</output><input type="range" min="0" max="100" data-bind="${path}.focusY"></label></div>
      </section>
      <section class="project-editor-block">
        <div class="project-editor-block-head"><div><strong>Vista completa al tocar</strong><span>Puede ser una captura vertical diferente. Nunca se recorta.</span></div></div>
        <div class="project-dialog-media">
          <div class="project-dialog-preview contain"><img src="${esc(detail)}" alt="Vista completa"></div>
          <div class="project-dialog-media-copy"><p>${x.lightboxImage?'Este proyecto usa una imagen independiente.':'Actualmente usa la misma imagen de la miniatura.'}</p><div class="inline-actions"><label class="file-field strong">${x.lightboxImage?'Cambiar vista completa':'Agregar vista completa'}<input type="file" accept="image/*" data-image-upload="${path}.lightboxImage"></label>${x.lightboxImage?`<button type="button" class="quiet-action" data-action="clear-lightbox-image" data-kind="${kind}" data-key="${key||''}" data-id="${esc(x.id)}">Usar miniatura</button>`:''}</div></div>
        </div>
      </section>
      <div class="project-dialog-actions">
        <button type="button" class="btn primary" data-action="save-close-item" data-kind="${kind}" data-key="${key||''}" data-id="${esc(x.id)}">Guardar y cerrar</button>
        <button type="button" class="btn" data-action="close-project-dialog">Cerrar</button>
      </div>`;
    fillBindings(dialog);
    const h=$('.project-dialog-title h3',dialog);if(h)h.textContent=x.title||'Sin título';
    if(!dialog.open)dialog.showModal();
    dialog.scrollTop=0;
    setTimeout(()=>$('.project-fields input',dialog)?.focus(),30);
  }

  function refreshProjectDialog(){
    const d=$('#projectEditorDialog');if(d?.open&&d.dataset.id)renderProjectDialog(d.dataset.kind,d.dataset.key||'',d.dataset.id);
  }

  function renderInvitationItems(){
    const arr=state.invitationGallery.items||[];arr.forEach(x=>{if(x.focusX==null)x.focusX=50;if(x.focusY==null)x.focusY=50;if(!x.id)x.id=uid('inv');if(!x.cardRatio)x.cardRatio='portrait';if(x.lightboxImage==null)x.lightboxImage=''});
    const visible=arr.map((x,i)=>({x,i})).filter(({x})=>activeCategory==='Todas'||x.category===activeCategory);
    $('#invitationItemsEditor').innerHTML=visible.length?visible.map(({x,i})=>galleryCardEditor(x,'invitation','',i)).join(''):`<div class="empty-state">No hay ejemplos en “${esc(activeCategory)}”. Selecciona la categoría arriba y usa “Subir ejemplos”.</div>`;
    bindGalleryDrag($('#invitationItemsEditor'));
  }
  function renderServiceGallery(){
    const key=galleryService,f=state.features[key];(f.examples||[]).forEach(x=>{if(x.focusX==null)x.focusX=50;if(x.focusY==null)x.focusY=50;if(!x.id)x.id=uid(key);if(!x.cardRatio)x.cardRatio='landscape';if(x.lightboxImage==null)x.lightboxImage=''});
    const names={menus:'Menús digitales',web:'Páginas web',galleries:'Galerías para fotógrafos'};
    $('#serviceGalleryEditor').innerHTML=`<div class="service-gallery-editor"><div class="service-gallery-head"><div><span class="eyebrow">BIBLIOTECA</span><h3>${esc(names[key])}</h3><p>Sube, reemplaza, edita y acomoda cada ejemplo. El orden de esta lista es el orden que verá tu cliente.</p></div><div class="library-summary"><strong>${(f.examples||[]).length}</strong><span>proyectos</span></div></div>
      <div class="service-gallery-settings"><label>Nombre visible de la galería<input data-bind="features.${key}.examplesTitle"></label><label>Composición<select data-bind="features.${key}.galleryLayout"><option value="editorial">Editorial</option><option value="grid">Cuadrícula</option><option value="carousel">Carrusel</option><option value="masonry">Mosaico</option></select></label><label class="switch-row compact"><input type="checkbox" data-bind="features.${key}.showTitles"><span>Mostrar títulos</span></label><label class="switch-row compact"><input type="checkbox" data-bind="features.${key}.showSubtitles"><span>Mostrar subtítulos</span></label></div>
      <label class="gallery-dropzone"><input type="file" accept="image/*" multiple data-multi-upload="service" data-service-key="${key}"><span class="dropzone-plus">＋</span><strong>Agregar proyectos</strong><small>Puedes seleccionar varias imágenes. Después arrástralas para ordenar o abre “Editar” para cambiar sus datos.</small></label>
      <div class="field-destination"><span>Se ve en</span><b>Debajo del bloque ${esc(names[key])} en la web pública</b></div>
      <div class="gallery-order-tip">↕ Arrastra cualquier tarjeta para moverla · también puedes usar ↑ ↓</div>
      <div class="gallery-admin-grid">${(f.examples||[]).length?(f.examples||[]).map((x,i)=>galleryCardEditor(x,'service',key,i)).join(''):'<div class="empty-state">Aún no hay ejemplos. Al subirlos aparecerán aquí y también en el preview del sitio.</div>'}</div></div>`;
    bindGalleryDrag($('#serviceGalleryEditor'));
  }
  function gradientChoices(target){
    const b=state.brand||{};
    const primary=b.primary||'#151515',deep=b.primarySoft||'#2d2b28',accent=b.accent||'#d6ae52',accentSoft=b.accentSoft||'#ecd9a5',bg=b.background||'#fefcf9',surface=b.surface||'#ffffff';
    if(target==='heroGradient')return [
      {name:'Plano',note:'Limpio y sin efecto',value:bg},
      {name:'Aura suave',note:'Blanco cálido con oro tenue',value:`linear-gradient(135deg,${surface} 0%,${bg} 62%,${accentSoft} 100%)`},
      {name:'Champagne',note:'Más presencia dorada',value:`linear-gradient(135deg,${surface} 0%,${accentSoft} 72%,${accent} 145%)`},
      {name:'Editorial',note:'Contraste muy sutil',value:`linear-gradient(135deg,${surface} 0%,${bg} 48%,${deep} 175%)`}
    ];
    if(target==='buttonGradient')return [
      {name:'Negro Aura',note:'Principal y elegante',value:`linear-gradient(135deg,${primary} 0%,${deep} 100%)`},
      {name:'Negro liso',note:'Sin brillo',value:primary},
      {name:'Oro',note:'Acento premium',value:`linear-gradient(135deg,${accent} 0%,${accentSoft} 100%)`},
      {name:'Negro + oro',note:'Oro muy discreto al final',value:`linear-gradient(135deg,${primary} 0%,${deep} 76%,${accent} 155%)`}
    ];
    return [
      {name:'Noir',note:'Cierre oscuro limpio',value:`linear-gradient(135deg,${primary} 0%,${deep} 100%)`},
      {name:'Noir + oro',note:'El look Aura',value:`linear-gradient(135deg,${primary} 0%,${deep} 70%,${accent} 150%)`},
      {name:'Oro profundo',note:'Más cálido y llamativo',value:`linear-gradient(135deg,${deep} 0%,${primary} 56%,${accent} 132%)`},
      {name:'Claro',note:'Cierre luminoso',value:`linear-gradient(135deg,${surface} 0%,${bg} 66%,${accentSoft} 120%)`}
    ];
  }
  function renderGradientEditor(){
    const host=$('#gradientEditor');if(!host)return;
    const defs=[['heroGradient','Portada','Fondo principal del inicio'],['buttonGradient','Botones principales','WhatsApp y llamadas importantes'],['ctaGradient','CTA final','Bloque de cierre de la página']];
    host.innerHTML=defs.map(([target,title,note])=>{
      const current=state.brand?.[target]||'';
      const opts=gradientChoices(target);
      return `<section class="gradient-row"><div class="gradient-row-head"><div><strong>${esc(title)}</strong><span>${esc(note)}</span></div><i class="gradient-current" style="background:${esc(current)}"></i></div><div class="gradient-options">${opts.map((o,i)=>`<button type="button" class="gradient-option ${current===o.value?'active':''}" data-action="apply-gradient" data-gradient-target="${target}" data-gradient-index="${i}"><span class="gradient-option-swatch" style="background:${esc(o.value)}"></span><strong>${esc(o.name)}</strong><small>${esc(o.note)}</small></button>`).join('')}</div></section>`;
    }).join('');
  }
  function renderPalettes(){
    const groups=['Claros','Oscuros'];
    $('#paletteGrid').innerHTML=groups.map(group=>{
      const cards=palettes.map((p,i)=>({p,i})).filter(({p})=>(p.group||'Claros')===group).map(({p,i})=>`<button type="button" class="palette-card ${state.brand.paletteName===p.name?'active':''}" data-action="apply-palette" data-palette="${i}"><span class="palette-swatch" style="display:block;background:${esc(p.hero)}"><span class="palette-dots">${[p.colors.primary,p.colors.accent,p.colors.background].map(c=>`<i style="background:${c}"></i>`).join('')}</span></span><strong>${esc(p.name)}</strong><span>${esc(p.note)}</span></button>`).join('');
      return `<section class="palette-group"><div class="palette-group-head"><strong>${group}</strong><span>${group==='Claros'?'Fondos luminosos alineados al logo':'Looks oscuros con oro Aura'}</span></div><div class="palette-grid-inner">${cards}</div></section>`;
    }).join('')
  }
  function renderSectionOrder(){
    const order=state.layout?.sectionOrder||Object.keys(sectionMeta);state.layout=state.layout||{};state.layout.sectionOrder=order;
    $('#sectionOrderEditor').innerHTML=order.map((k,i)=>{const [name,sub]=sectionMeta[k]||[k,''];const visible=sectionVisible(k);return `<div class="order-row"><span class="drag-dot">⋮⋮</span><div><strong>${esc(name)}</strong><small>${esc(sub)} · ${visible?'visible':'oculta'}</small></div><div class="order-actions"><button type="button" class="icon-btn" data-action="move-section" data-key="${k}" data-dir="-1">↑</button><button type="button" class="icon-btn" data-action="move-section" data-key="${k}" data-dir="1">↓</button><button type="button" class="icon-btn" data-action="toggle-section" data-key="${k}">${visible?'●':'○'}</button></div></div>`}).join('')
  }
  function sectionVisible(k){if(k==='hero')return state.hero.visible!==false;if(k==='invitationGallery')return state.invitationGallery.visible!==false;if(['menus','web','galleries'].includes(k))return state.features[k]?.visible!==false;if(k==='why')return state.why.visible!==false;if(k==='process')return state.process.visible!==false;if(k==='cta')return state.cta.visible!==false;return state.layout?.sectionVisibility?.[k]!==false}
  function setSectionVisible(k,v){if(k==='hero')state.hero.visible=v;else if(k==='invitationGallery')state.invitationGallery.visible=v;else if(['menus','web','galleries'].includes(k))state.features[k].visible=v;else if(k==='why')state.why.visible=v;else if(k==='process')state.process.visible=v;else if(k==='cta')state.cta.visible=v;else{state.layout.sectionVisibility=state.layout.sectionVisibility||{};state.layout.sectionVisibility[k]=v}}

  function renderAll(){renderNavEditor();renderBenefits();renderServices();renderFeatures();renderWhyProcess();renderCategories();renderInvitationItems();renderServiceGallery();renderPalettes();renderGradientEditor();renderSectionOrder();fillBindings();renderAdminPreviews();sendPreview()}

  function applyPalette(index){const p=palettes[index];if(!p)return;state.brand.paletteName=p.name;Object.assign(state.brand,p.colors,{heroGradient:p.hero,buttonGradient:p.button,ctaGradient:p.cta});renderPalettes();renderGradientEditor();fillBindings($('#secDesign'));saveState(`Paleta ${p.name} aplicada`)}
  function arrFor(kind,key){
    if(kind==='invitation')return state.invitationGallery.items||[];
    return state.features?.[key]?.examples||[];
  }
  function locate(kind,key,id){const arr=arrFor(kind,key);return {arr,index:arr.findIndex(x=>String(x.id)===String(id))}}
  function visibleIds(kind,key){
    const arr=arrFor(kind,key);
    if(kind!=='invitation'||activeCategory==='Todas')return arr.map(x=>String(x.id));
    return arr.filter(x=>x.category===activeCategory).map(x=>String(x.id));
  }
  function moveInArray(arr,id,dir,kind,key){
    const ids=visibleIds(kind,key),pos=ids.indexOf(String(id)),targetPos=pos+Number(dir);
    if(pos<0||targetPos<0||targetPos>=ids.length)return false;
    const a=arr.findIndex(x=>String(x.id)===ids[pos]),b=arr.findIndex(x=>String(x.id)===ids[targetPos]);
    if(a<0||b<0)return false;
    [arr[a],arr[b]]=[arr[b],arr[a]];
    return true;
  }
  function moveBefore(kind,key,dragId,targetId){
    if(String(dragId)===String(targetId))return false;
    const arr=arrFor(kind,key);
    const from=arr.findIndex(x=>String(x.id)===String(dragId));
    if(from<0)return false;
    const item=arr.splice(from,1)[0];
    let insert=arr.findIndex(x=>String(x.id)===String(targetId));
    if(insert<0)insert=arr.length;
    arr.splice(insert,0,item);
    return true;
  }
  function refreshGalleryEditor(kind){
    if(kind==='invitation'){renderCategories();renderInvitationItems();fillBindings($('#secInvitations'))}
    else{renderServiceGallery();fillBindings($('#secProductGalleries'))}
  }
  function bindGalleryDrag(root){
    if(!root)return;
    root.querySelectorAll('[data-gallery-drag]').forEach(card=>{
      const handle=card.querySelector('.drag-handle');
      if(handle){
        handle.addEventListener('dragstart',e=>{
          draggingGallery={kind:card.dataset.kind,key:card.dataset.key||'',id:card.dataset.id};
          card.classList.add('is-dragging');
          try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',card.dataset.id)}catch(_){}
        });
        handle.addEventListener('dragend',()=>{card.classList.remove('is-dragging');root.querySelectorAll('.drag-over').forEach(x=>x.classList.remove('drag-over'));draggingGallery=null});
      }
      card.addEventListener('dragover',e=>{
        if(!draggingGallery||draggingGallery.kind!==card.dataset.kind||String(draggingGallery.key||'')!==String(card.dataset.key||''))return;
        e.preventDefault();card.classList.add('drag-over');
      });
      card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));
      card.addEventListener('drop',e=>{
        if(!draggingGallery)return;e.preventDefault();card.classList.remove('drag-over');
        const moved=moveBefore(draggingGallery.kind,draggingGallery.key,draggingGallery.id,card.dataset.id);
        const kind=draggingGallery.kind;draggingGallery=null;
        if(moved){refreshGalleryEditor(kind);saveState('Orden de galería actualizado')}
      });
    });
  }

  async function processImage(file,{max=1900,quality=.84,preservePng=false}={}){
    if(!file)return '';
    if(preservePng&&file.type==='image/png')return await readData(file);
    return await new Promise((resolve,reject)=>{const r=new FileReader(),img=new Image();r.onload=()=>{img.onload=()=>{let w=img.width,h=img.height;const ratio=Math.min(1,max/Math.max(w,h));w=Math.max(1,Math.round(w*ratio));h=Math.max(1,Math.round(h*ratio));const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',quality))};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)})
  }
  function readData(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result));r.onerror=rej;r.readAsDataURL(file)})}
  async function multiUpload(input){const files=[...(input.files||[])];if(!files.length)return;setStatus(`Procesando ${files.length} imagen${files.length>1?'es':''}…`);const urls=[];for(const f of files)urls.push(await processImage(f,{max:1800,quality:.82}));if(input.dataset.multiUpload==='invitation'){const category=$('#invUploadCategory').value||state.invitationGallery.categories.find(c=>c!=='Todas')||'Eventos';urls.forEach((url,i)=>state.invitationGallery.items.push({id:uid('inv'),category,title:files[i].name.replace(/\.[^.]+$/,''),subtitle:'',image:url,url:'',visible:true,focusX:50,focusY:50,cardRatio:'portrait',lightboxImage:''}));activeCategory=category;renderCategories();const last=state.invitationGallery.items.at(-1);renderInvitationItems();fillBindings($('#secInvitations'));if(last)renderProjectDialog('invitation','',last.id)}else{const key=input.dataset.serviceKey;urls.forEach((url,i)=>state.features[key].examples.push({id:uid(key),title:files[i].name.replace(/\.[^.]+$/,''),subtitle:'',image:url,url:'',visible:true,focusX:50,focusY:50,cardRatio:'landscape',lightboxImage:''}));const last=state.features[key].examples.at(-1);renderServiceGallery();fillBindings($('#secProductGalleries'));if(last)renderProjectDialog('service',key,last.id)}input.value='';saveState('Imágenes agregadas')}

  function handleAction(btn){
    const a=btn.dataset.action;
    if(a==='add-benefit'){state.benefits.push({icon:'✦',title:'Nuevo beneficio',visible:true});renderBenefits();fillBindings($('#benefitsEditor'));saveState();return}
    if(a==='remove-benefit'){state.benefits.splice(Number(btn.dataset.index),1);renderBenefits();fillBindings($('#benefitsEditor'));saveState();return}
    if(a==='apply-palette'){applyPalette(Number(btn.dataset.palette));return}
    if(a==='sync-mobile-hero'){state.hero.mobileImage=state.hero.image||'';state.hero.mobileImageFocusX=state.hero.imageFocusX??50;state.hero.mobileImageFocusY=state.hero.imageFocusY??50;fillBindings($('#secHero'));saveState('Portada móvil sincronizada con web');return}
    if(a==='apply-gradient'){const target=btn.dataset.gradientTarget,idx=Number(btn.dataset.gradientIndex),choice=gradientChoices(target)[idx];if(choice){state.brand[target]=choice.value;state.brand.paletteName='Personalizado';renderGradientEditor();renderPalettes();saveState(`${choice.name} aplicado`)}return}
    if(a==='edit-item'){if(btn.dataset.kind==='service')galleryService=btn.dataset.key;renderProjectDialog(btn.dataset.kind,btn.dataset.key||'',btn.dataset.id);return}
    if(a==='save-close-item'){syncDomToState();editingGalleryId='';const d=$('#projectEditorDialog');if(d?.open)d.close();refreshGalleryEditor(btn.dataset.kind);saveState('Proyecto guardado');return}
    if(a==='close-project-dialog'){syncDomToState();editingGalleryId='';const d=$('#projectEditorDialog');if(d?.open)d.close();saveState('Cambios guardados');return}
    if(a==='select-category'){activeCategory=btn.dataset.category;renderCategories();renderInvitationItems();fillBindings($('#secInvitations'));return}
    if(a==='add-category'){const input=$('#newCategory'),v=input.value.trim();if(v&&!state.invitationGallery.categories.includes(v)){state.invitationGallery.categories.push(v);activeCategory=v;input.value='';renderCategories();renderInvitationItems();fillBindings($('#secInvitations'));saveState('Categoría agregada')}return}
    if(a==='remove-category'){const i=Number(btn.dataset.index),cat=state.invitationGallery.categories[i];if(!cat||cat==='Todas')return;const used=state.invitationGallery.items.some(x=>x.category===cat);if(used&&!confirm(`Hay ejemplos dentro de “${cat}”. Se moverán a la primera categoría disponible. ¿Continuar?`))return;const fallback=state.invitationGallery.categories.find(c=>c!=='Todas'&&c!==cat)||'Eventos';state.invitationGallery.items.forEach(x=>{if(x.category===cat)x.category=fallback});state.invitationGallery.categories.splice(i,1);activeCategory='Todas';renderCategories();renderInvitationItems();fillBindings($('#secInvitations'));saveState('Categoría eliminada');return}
    if(a==='clear-lightbox-image'){const {arr,index}=locate(btn.dataset.kind,btn.dataset.key,btn.dataset.id);if(index>=0){arr[index].lightboxImage='';refreshGalleryEditor(btn.dataset.kind);refreshProjectDialog();saveState('Vista ampliada restablecida')}return}
    if(['move-item','remove-item','duplicate-item','toggle-item'].includes(a)){const kind=btn.dataset.kind,key=btn.dataset.key,id=btn.dataset.id;const {arr,index}=locate(kind,key,id);if(index<0)return;if(a==='move-item')moveInArray(arr,id,btn.dataset.dir,kind,key);if(a==='remove-item'){if(!confirm('¿Eliminar este ejemplo?'))return;arr.splice(index,1);if(editingGalleryId===String(id))editingGalleryId=''}if(a==='duplicate-item'){const copy=structuredClone(arr[index]);copy.id=uid(kind==='invitation'?'inv':key);copy.title=(copy.title||'Ejemplo')+' copia';arr.splice(index+1,0,copy)}if(a==='toggle-item')arr[index].visible=arr[index].visible===false?true:false;refreshGalleryEditor(kind);saveState(a==='move-item'?'Orden de galería actualizado':'Galería actualizada');return}
    if(a==='move-section'){const order=state.layout.sectionOrder,i=order.indexOf(btn.dataset.key),j=i+Number(btn.dataset.dir);if(i>=0&&j>=0&&j<order.length){[order[i],order[j]]=[order[j],order[i]];renderSectionOrder();saveState('Orden actualizado')}return}
    if(a==='toggle-section'){const k=btn.dataset.key;setSectionVisible(k,!sectionVisible(k));renderSectionOrder();fillBindings();saveState('Visibilidad actualizada');return}
  }

  function bindEditor(){
    $('#editorPane').addEventListener('input',e=>{const el=e.target;if(el.matches('[data-bind]')){let v=el.type==='checkbox'?el.checked:el.value;if(el.type==='range'||el.type==='number')v=Number(v);set(el.dataset.bind,v);const out=$(`[data-output="${CSS.escape(el.dataset.bind)}"]`);if(out)out.textContent=v;renderAdminPreviews();highlightPreview(el.dataset.bind);const d=$('#projectEditorDialog');if(d?.open&&el.dataset.bind.endsWith('.title')){const h=$('.project-dialog-title h3',d);if(h)h.textContent=el.value||'Sin título'}autoSave()}if(el.matches('[data-points-bind]')){set(el.dataset.pointsBind,el.value.split('\n').map(x=>x.trim()).filter(Boolean));highlightPreview(el.dataset.pointsBind);autoSave()}if(el.matches('[data-font-bind]')){set(el.dataset.fontBind,el.value);highlightPreview(el.dataset.fontBind);autoSave()}});
    $('#editorPane').addEventListener('focusin',e=>{const el=e.target.closest('[data-bind],[data-points-bind],[data-font-bind]');if(el)highlightPreview(el.dataset.bind||el.dataset.pointsBind||el.dataset.fontBind)});
    $('#editorPane').addEventListener('change',async e=>{const el=e.target;if(el.matches('[data-image-upload]')){const f=el.files?.[0];if(!f)return;setStatus('Procesando imagen…');const preserve=el.dataset.imageUpload==='brand.logo';const url=await processImage(f,{max:2100,quality:.86,preservePng:preserve});set(el.dataset.imageUpload,url);const isProjectImage=el.dataset.imageUpload.includes('.examples.')||el.dataset.imageUpload.includes('invitationGallery.items.');if(isProjectImage){if(el.dataset.imageUpload.startsWith('invitationGallery.'))renderInvitationItems();else renderServiceGallery();refreshProjectDialog()}fillBindings(el.closest('.panel')||document);renderAdminPreviews();highlightPreview(el.dataset.imageUpload);saveState('Imagen actualizada');el.value=''}if(el.matches('[data-multi-upload]'))await multiUpload(el)});
    $('#editorPane').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b){e.preventDefault();e.stopPropagation();handleAction(b)}});
    $$('.service-gallery-tabs button').forEach(b=>b.addEventListener('click',()=>{$$('.service-gallery-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');galleryService=b.dataset.galleryService;renderServiceGallery();fillBindings($('#secProductGalleries'));renderAdminPreviews()}));
    $$('.panel').forEach(d=>d.addEventListener('toggle',()=>{if(!d.open)return;$$('.panel').forEach(other=>{if(other!==d&&other.open)other.open=false})}));
    $('#projectEditorDialog')?.addEventListener('close',()=>{editingGalleryId=''});
    $$('.quicknav [data-editor-group]').forEach(b=>b.addEventListener('click',()=>{const group=b.dataset.editorGroup;$$('.quicknav button').forEach(x=>x.classList.toggle('active',x===b));$$('.panel').forEach(p=>{p.hidden=group!=='all'&&p.dataset.group!==group});$('#editorGuideNote').textContent=group==='all'?'Ves todos los apartados. Abre solo lo que vas a trabajar.':`Mostrando únicamente: ${b.textContent}.`;const first=$$('.panel').find(p=>!p.hidden);if(first){first.open=true;first.scrollIntoView({behavior:'smooth',block:'start'})}}));
  }

  function syncDomToState(){
    $$('[data-bind]').forEach(el=>{if(!el.isConnected)return;let v=el.type==='checkbox'?el.checked:el.value;if(el.type==='range'||el.type==='number')v=Number(v);set(el.dataset.bind,v)});
    $$('[data-points-bind]').forEach(el=>set(el.dataset.pointsBind,el.value.split('\n').map(x=>x.trim()).filter(Boolean)));
    $$('[data-font-bind]').forEach(el=>set(el.dataset.fontBind,el.value));
  }
  function buildCurrentHtml(opts={}){
    syncDomToState();
    if(!window.AURA_PUBLISHER)throw new Error('No se cargó el módulo de publicación.');
    return window.AURA_PUBLISHER.build(structuredClone(state),opts);
  }
  function openCurrentView(){
    let popup=null;
    try{popup=window.open('about:blank','_blank')}catch(e){}
    try{
      // The publish template contains static sample markup before its runtime applies
      // the editor's current state. Keep ONLY this popup hidden until that pass finishes.
      // Publishing to GitHub still uses buildCurrentHtml() without either addition.
      const html=buildCurrentHtml();
      if(!html.includes('</head>')||!html.includes('</body>'))throw new Error('La vista actual no tiene un HTML completo.');
      const guard='<style id="aura-popup-load-guard">html body{visibility:hidden!important}</style>';
      const reveal='<script>requestAnimationFrame(function(){document.getElementById("aura-popup-load-guard")?.remove()})</script>';
      const popupHtml=html.replace('</head>',guard+'</head>').replace('</body>',reveal+'</body>');
      const url=URL.createObjectURL(new Blob([popupHtml],{type:'text/html'}));
      if(popup)popup.location.href=url;else window.open(url,'_blank');
      setStatus('Vista actual abierta');
      setTimeout(()=>URL.revokeObjectURL(url),60000);
    }catch(err){if(popup)popup.close();setStatus(`No se pudo abrir: ${err.message}`)}
  }

  function fitPreview(){
    const stage=$('#previewStage');if(!stage)return;
    const r=stage.getBoundingClientRect();
    const desktop=$('#browserMockup'),phone=$('#phoneMockup');
    if(desktop){
      const scale=Math.min((r.width-30)/1444,(r.height-30)/944,1);
      desktop.style.setProperty('--device-scale',String(Math.max(.25,scale)));
    }
    if(phone){
      const scale=Math.min((r.width-30)/430,(r.height-24)/914,1);
      phone.style.setProperty('--device-scale',String(Math.max(.36,scale)));
    }
  }
  function setPreviewDevice(mode){
    $$('.device-tabs button').forEach(x=>x.classList.toggle('active',x.dataset.device===mode));
    $('#previewStage').className='preview-stage '+mode;
    $('#desktopRig').hidden=mode!=='desktop';$('#mobileRig').hidden=mode!=='mobile';
    $('#previewContext').textContent=mode==='desktop'?'Web · 1440 × 900':'Móvil · 390 × 844';
    requestAnimationFrame(()=>{fitPreview();sendPreview()});
  }
  function bindPreview(){
    $$('.device-tabs button').forEach(b=>b.addEventListener('click',()=>setPreviewDevice(b.dataset.device)));
    $('#siteFrame').addEventListener('load',sendPreview);$('#mobileFrame').addEventListener('load',sendPreview);
    $('#refreshPreview').addEventListener('click',hardRefreshPreview);$('#openPreview').addEventListener('click',openCurrentView);$('#openPreviewInline')?.addEventListener('click',openCurrentView);
    $('#previewEditMode').addEventListener('change',e=>{previewEdit=e.target.checked;sendPreview()});
    window.addEventListener('message',e=>{const d=e.data;if(!d||d.type!=='AURA_EDIT_REQUEST'||!previewEdit)return;focusEditorPath(d.path)});
    window.addEventListener('resize',fitPreview);if('ResizeObserver'in window)new ResizeObserver(fitPreview).observe($('#previewStage'));
    setPreviewDevice('mobile');
  }
  function openOnly(panel){if(!panel)return;$$('.panel').forEach(p=>p.open=false);panel.hidden=false;panel.open=true;setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}),30)}
  function focusEditorPath(path){
    if(!path)return;
    if(path.startsWith('invitationGallery.items.')){const idx=Number(path.split('.')[2]),item=state.invitationGallery.items?.[idx];if(item?.category)activeCategory=item.category;renderCategories();renderInvitationItems();fillBindings($('#secInvitations'));openOnly($('#secInvitations'))}
    if(path.startsWith('features.')&&(path.includes('.examples.')||/\.(examplesTitle|galleryLayout|showTitles|showSubtitles)$/.test(path))){const key=path.split('.')[1];galleryService=key;$$('.service-gallery-tabs button').forEach(x=>x.classList.toggle('active',x.dataset.galleryService===key));renderServiceGallery();fillBindings($('#secProductGalleries'));openOnly($('#secProductGalleries'))}
    const el=$(`[data-bind="${CSS.escape(path)}"],[data-points-bind="${CSS.escape(path)}"],[data-font-bind="${CSS.escape(path)}"],[data-image-upload="${CSS.escape(path)}"]`);
    if(el){const panel=el.closest('.panel');if(panel)openOnly(panel);setTimeout(()=>{el.scrollIntoView({behavior:'smooth',block:'center'});el.focus({preventScroll:true});el.classList.add('focus-flash');setTimeout(()=>el.classList.remove('focus-flash'),1500)},90);return}
    let panel=null;
    if(path.startsWith('features.'))panel=$('#secProducts');else if(path.startsWith('benefits.'))panel=$('#secHero');else if(path.startsWith('services.'))panel=$('#secServices');else if(path.startsWith('invitationGallery.'))panel=$('#secInvitations');else if(path.startsWith('why.')||path.startsWith('process.')||path.startsWith('cta.'))panel=$('#secStory');else if(path.startsWith('brand.')||path.startsWith('nav.'))panel=$('#secIdentity');else panel=$('#secIdentity');openOnly(panel)
  }

  const githubState={token:'',user:null,connected:false};
  const GITHUB_REPO='AuraDigitalJal/AuraDigitalJal.github.io';
  const GITHUB_BRANCH='main';
  const GITHUB_PATH='index.html';
  const GITHUB_PUBLIC_URL='https://auradigitaljal.com/';

  function githubHeaders(extra={}){return Object.assign({'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},githubState.token?{'Authorization':`Bearer ${githubState.token}`}:{},extra)}
  async function githubApi(path,{method='GET',body=null,raw=false,allow404=false}={}){
    const url=String(path).startsWith('http')?path:`https://api.github.com${path}`;
    const headers=githubHeaders(raw?{'Accept':'application/vnd.github.raw+json'}:{'Content-Type':'application/json'});
    const res=await fetch(url,{method,headers,body:body==null?undefined:JSON.stringify(body)});
    if(allow404&&res.status===404)return null;if(!res.ok){let message=`GitHub respondió ${res.status}`;try{const data=await res.json();if(data?.message)message=data.message}catch(e){}throw new Error(message)}
    if(res.status===204)return null;return raw?await res.text():await res.json();
  }
  function githubTarget(){return {repo:GITHUB_REPO,branch:GITHUB_BRANCH,folder:'',path:GITHUB_PATH}}
  function githubPublicUrl(){return GITHUB_PUBLIC_URL}
  function updateGithubTargetUI(){const label=$('#githubTargetPath');if(label)label.textContent=`${GITHUB_REPO} · /${GITHUB_PATH}`;const repoLink=$('#githubRepoLink');if(repoLink)repoLink.href=`https://github.com/${GITHUB_REPO}`;const field=$('#githubPagesUrl');if(field)field.value=GITHUB_PUBLIC_URL;const live=$('#githubPagesLink');if(live)live.href=GITHUB_PUBLIC_URL}
  function setGithubStatus(msg='',type=''){const el=$('#githubPublishStatus');if(!el)return;el.textContent=msg;el.classList.remove('ok','error');if(type)el.classList.add(type)}
  function setGithubProgress(value,show=true){const wrap=$('#githubProgress'),bar=$('#githubProgressBar');if(!wrap||!bar)return;wrap.hidden=!show;bar.style.width=`${Math.max(0,Math.min(100,value))}%`}
  function renderGithubConnection(){const pill=$('#githubConnectionPill'),account=$('#githubAccount'),connect=$('#githubConnect'),disconnect=$('#githubDisconnect'),publish=$('#githubPublish'),pull=$('#githubPull');if(pill){pill.dataset.state=githubState.connected?'on':'off';pill.querySelector('b').textContent=githubState.connected?'Conectado':'Sin conectar'}if(account){const u=githubState.user;account.innerHTML=u?`${u.avatar_url?`<img src="${esc(u.avatar_url)}" alt="">`:'<span class="github-avatar-placeholder">GH</span>'}<div><small>Cuenta conectada</small><strong>${esc(u.login||u.name||'GitHub')}</strong></div>`:'<span class="github-avatar-placeholder">GH</span><div><small>Cuenta</small><strong>Sin conectar</strong></div>'}if(connect)connect.hidden=githubState.connected;if(disconnect)disconnect.hidden=!githubState.connected;if(publish)publish.disabled=!githubState.connected;if(pull)pull.disabled=false}
  function rememberGithubToken(token=''){try{if(token)sessionStorage.setItem(GITHUB_SESSION_KEY,token);else sessionStorage.removeItem(GITHUB_SESSION_KEY)}catch(e){}}
  function recalledGithubToken(){try{return sessionStorage.getItem(GITHUB_SESSION_KEY)||''}catch(e){return ''}}
  async function connectGithub(){const input=$('#githubToken'),token=(input?.value||'').trim();if(!token){setGithubStatus('Pega tu token de GitHub para conectar.','error');input?.focus();return}githubState.token=token;setGithubStatus('Comprobando acceso al sitio oficial…');try{const user=await githubApi('/user');await githubApi(`/repos/${GITHUB_REPO}`);githubState.user=user;githubState.connected=true;rememberGithubToken(token);renderGithubConnection();updateGithubTargetUI();setGithubStatus(`Conectado como ${user.login}. Destino fijo: auradigitaljal.com.`,'ok')}catch(err){githubState.token='';githubState.user=null;githubState.connected=false;rememberGithubToken('');renderGithubConnection();setGithubStatus(`No se pudo conectar: ${err.message}`,'error')}}
  function disconnectGithub(){githubState.token='';githubState.user=null;githubState.connected=false;rememberGithubToken('');if($('#githubToken'))$('#githubToken').value='';renderGithubConnection();setGithubStatus('Conexión cerrada.')}
  function encodeGithubPath(path){return String(path).split('/').map(encodeURIComponent).join('/')}
  async function githubFileSha(repo,path,branch){const file=await githubApi(`/repos/${repo}/contents/${encodeGithubPath(path)}?ref=${encodeURIComponent(branch)}`,{allow404:true});return file?.sha||null}
  async function putGithubFile(repo,path,branch,content,message){const sha=await githubFileSha(repo,path,branch),body={message,content,branch};if(sha)body.sha=sha;return githubApi(`/repos/${repo}/contents/${encodeGithubPath(path)}`,{method:'PUT',body})}
  function utf8ToBase64(text){const bytes=new TextEncoder().encode(text);let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary)}
  function extForMime(mime='image/jpeg'){if(/png/i.test(mime))return'png';if(/webp/i.test(mime))return'webp';if(/gif/i.test(mime))return'gif';return'jpg'}
  async function publishGithub(){
    if(!githubState.connected){setGithubStatus('Conecta GitHub antes de publicar.','error');return}
    if(!confirm('Publicar ahora los cambios en auradigitaljal.com?'))return;
    const target=githubTarget();syncDomToState();await persistState('Cambios guardados');setGithubProgress(8,true);setGithubStatus('Preparando la página oficial…');
    const btn=$('#githubPublish');if(btn)btn.disabled=true;
    try{
      const publicUrl=GITHUB_PUBLIC_URL;setGithubProgress(20);
      let ogPayload=window.AURA_PUBLISHER.assetPayload(state.meta?.ogImage||''),ogImageUrl=state.meta?.ogImage||'',ogPath='';
      if(ogPayload){ogPath=`og-image.${extForMime(ogPayload.mime)}`;ogImageUrl=publicUrl+ogPath}
      const html=buildCurrentHtml({publicUrl,ogImageUrl});setGithubProgress(38);setGithubStatus('Actualizando auradigitaljal.com…');
      await putGithubFile(GITHUB_REPO,GITHUB_PATH,GITHUB_BRANCH,utf8ToBase64(html),'Actualiza página oficial Aura Digital desde Web Studio v14');setGithubProgress(76);
      if(ogPayload){await putGithubFile(GITHUB_REPO,ogPath,GITHUB_BRANCH,ogPayload.base64,'Actualiza imagen social de Aura Digital');setGithubProgress(92)}
      setGithubProgress(100);updateGithubTargetUI();const live=$('#githubPagesLink');if(live)live.href=GITHUB_PUBLIC_URL+'?v='+Date.now();setGithubStatus('Publicado. “Abrir publicado” usa una URL sin caché para mostrar la versión nueva en cuanto GitHub Pages la despliegue.','ok');setTimeout(()=>setGithubProgress(0,false),1800)
    }catch(err){setGithubProgress(0,false);setGithubStatus(`No se pudo publicar: ${err.message}`,'error')}finally{renderGithubConnection()}
  }
  async function fetchGithubRaw(){return githubApi(`/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}?ref=${encodeURIComponent(GITHUB_BRANCH)}`,{raw:true})}
  // Public, read-only access; a GitHub token is never required just to open the site.
  // The raw main-branch file avoids an old CDN/page-cache snapshot.
  async function fetchLatestPublishedState(){
    const rawUrl=`https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_PATH}`;
    let lastError=null;
    for(const url of [rawUrl,GITHUB_PUBLIC_URL]){
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
      try{
        const path=url+(url.includes('?')?'&':'?')+'aura_sync='+Date.now();
        const response=await fetch(path,{cache:'no-store',credentials:'omit',signal:controller.signal});
        if(!response.ok)throw new Error(`No se pudo consultar la publicación (HTTP ${response.status})`);
        const html=await response.text(),published=extractPublishedState(html);
        if(!published||!published.brand||!published.hero||!published.features||!published.invitationGallery)
          throw new Error('La publicación no contiene un proyecto Aura completo');
        return published;
      }catch(err){lastError=err}finally{clearTimeout(timeout)}
    }
    throw lastError||new Error('No se pudo consultar la versión publicada');
  }
  function extractPublishedState(html){const key='window.AURA_DATA';let i=html.indexOf(key);if(i<0)return null;i=html.indexOf('{',i);if(i<0)return null;let depth=0,inString=false,escapeNext=false;for(let p=i;p<html.length;p++){const ch=html[p];if(inString){if(escapeNext)escapeNext=false;else if(ch==='\\')escapeNext=true;else if(ch==='"')inString=false;continue}if(ch==='"'){inString=true;continue}if(ch==='{')depth++;else if(ch==='}'){depth--;if(depth===0){try{return JSON.parse(html.slice(i,p+1))}catch(e){return null}}}}return null}
  async function pullGithub(){
    setGithubStatus('Consultando última versión publicada…');
    try{
      const remote=await fetchLatestPublishedState();
      if(!confirm('¿Abrir la versión publicada? Los cambios actuales sin publicar se conservarán como borrador local.'))return;
      clearTimeout(saveTimer);
      await persistState('Borrador local guardado');
      await preserveDraftBeforePublished(state);
      state=normalizeState(deepMerge(structuredClone(base),remote));
      renderAll();sendPreview();
      setProjectSource('Editando última versión publicada · auradigitaljal.com');
      setGithubStatus('Última versión publicada cargada. Tu borrador local sigue disponible.','ok');
    }catch(err){setGithubStatus(`No se pudo traer la versión: ${err.message}`,'error')}
  }
  async function copyGithubLink(){const value=GITHUB_PUBLIC_URL;try{await navigator.clipboard.writeText(value);setGithubStatus('Enlace copiado.','ok')}catch(e){const el=$('#githubPagesUrl');el?.select();document.execCommand('copy');setGithubStatus('Enlace copiado.','ok')}}
  function openPublishPanel(){const nav=$('.quicknav [data-editor-group="file"]');if(nav){$$('.quicknav button').forEach(x=>x.classList.toggle('active',x===nav));$$('.panel').forEach(p=>p.hidden=p.dataset.group!=='file');$('#editorGuideNote').textContent='Mostrando únicamente: Publicar.'}openOnly($('#secFile'))}
  function bindGithub(){$('#githubConnect')?.addEventListener('click',connectGithub);$('#githubDisconnect')?.addEventListener('click',disconnectGithub);$('#githubPublish')?.addEventListener('click',publishGithub);$('#githubPull')?.addEventListener('click',pullGithub);$('#githubCopyLink')?.addEventListener('click',copyGithubLink);$('#openPublish')?.addEventListener('click',openPublishPanel);updateGithubTargetUI();renderGithubConnection();const remembered=recalledGithubToken();if(remembered){githubState.token=remembered;if($('#githubToken'))$('#githubToken').value=remembered;connectGithub()}}

  function exportJson(){syncDomToState();saveState();downloadBlob(JSON.stringify(state,null,2),'aura-digital-respaldo-v14.json','application/json');setStatus('Respaldo descargado')}
  function downloadBlob(text,name,type){const blob=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();const u=a.href;a.remove();setTimeout(()=>URL.revokeObjectURL(u),800)}
  function importConfig(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=async()=>{try{let t=String(r.result).trim().replace(/^\s*window\.AURA_DATA\s*=\s*/,'').replace(/;\s*$/,'');state=normalizeState(deepMerge(structuredClone(base),JSON.parse(t)));renderAll();await persistState('Configuración importada');sendPreview()}catch(err){setStatus('No se pudo leer el archivo')}};r.readAsText(f);e.target.value=''}
  function bindFileActions(){
    $('#saveNow').addEventListener('click',async()=>{syncDomToState();await persistState('Cambios guardados');sendPreview()});
    $('#downloadJson').addEventListener('click',exportJson);
    $('#importConfig').addEventListener('change',importConfig);
    $('#resumeLocalDraft')?.addEventListener('click',()=>restoreSavedDraft(false));
    $('#restorePriorDraft')?.addEventListener('click',()=>restoreSavedDraft(true));
  }
  async function init(){
    setStatus('Consultando última versión publicada…');
    setProjectSource('Comprobando la página publicada…');
    const local=await readLocalDraft();
    let loadedFromPublic=false;
    try{
      const remote=await fetchLatestPublishedState();
      // Important: do not overwrite "current" during startup; preserve local edits.
      if(local&&JSON.stringify(local)!==JSON.stringify(remote))await preserveDraftBeforePublished(local);
      state=normalizeState(deepMerge(structuredClone(base),remote));
      loadedFromPublic=true;
    }catch(err){
      console.warn('No se pudo consultar la publicación; se conserva el proyecto local.',err);
      state=normalizeState(deepMerge(structuredClone(base),local||{}));
    }
    renderAll();bindEditor();bindPreview();bindFileActions();bindGithub();hardRefreshPreview();
    if(loadedFromPublic){
      setStatus('Última versión publicada cargada');
      setProjectSource('Origen: última versión publicada · auradigitaljal.com');
      setGithubStatus('Se abrió la última versión publicada. Los borradores locales se conservaron.','ok');
    }else{
      setStatus(local?'Sin conexión · abierto borrador local':'Sin conexión · abierto diseño integrado');
      setProjectSource(local?'Sin conexión con GitHub · mostrando borrador local':'Sin conexión con GitHub · mostrando diseño integrado');
      setGithubStatus('No se pudo consultar la publicación; se abrió el respaldo local.','error');
    }
    window.AURA_ADMIN_DEBUG={getState:()=>structuredClone(state),buildCurrentHtml:(opts={})=>buildCurrentHtml(opts),persist:()=>persistState('Guardado de prueba')};
  }
  init();
})();
