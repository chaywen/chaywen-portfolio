// Convenience fixes for the original interface, without replacing its layout.
window.addEventListener('DOMContentLoaded',()=>{
  const mode=document.getElementById('mode-toggle'),menu=document.getElementById('mode-dropdown');
  mode.setAttribute('aria-expanded','false');mode.setAttribute('aria-controls','mode-dropdown');
  mode.addEventListener('click',()=>mode.setAttribute('aria-expanded',String(menu.style.display==='flex')));
  menu.addEventListener('click',()=>mode.setAttribute('aria-expanded','false'));
  document.addEventListener('click',event=>{if(!event.target.closest('.mode-wrapper')){menu.style.display='none';mode.setAttribute('aria-expanded','false');}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.style.display==='flex'){menu.style.display='none';mode.setAttribute('aria-expanded','false');mode.focus();}});
  const tools=document.getElementById('reading-tools-btn');tools.setAttribute('aria-expanded','false');tools.setAttribute('aria-controls','reading-tools-panel');
  ['focus-mode-toggle','ruler-toggle','bionic-toggle'].forEach(id=>{const button=document.getElementById(id);button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>button.setAttribute('aria-pressed',String(button.classList.contains('active-toggle'))));});
  document.getElementById('url-input').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();document.getElementById('url-submit-btn').click();}});
  const reader=document.getElementById('reading-text');
  const annotate=()=>reader.querySelectorAll('.difficult-word').forEach(word=>{const meaning=window.difficultDictMap?.[word.dataset.word];if(meaning){word.tabIndex=0;word.setAttribute('aria-label',word.textContent.trim()+': '+meaning);word.title=meaning;}});
  new MutationObserver(annotate).observe(reader,{childList:true,subtree:true});annotate();
  reader.addEventListener('focusin',handleGlobalTooltip);reader.addEventListener('click',handleGlobalTooltip);
  reader.addEventListener('focusout',()=>{const tip=document.querySelector('.tooltip');if(tip)tip.style.visibility='hidden';});
  if(STATIC_PORTFOLIO){const live=document.querySelector('#demo-notice a');if(live){live.textContent='Project source ↗';live.href='https://github.com/chaywen/lexi-lens';live.target='_blank';live.rel='noopener';}}
  const privacy=document.getElementById('privacy-modal');
  if(privacy.classList.contains('show'))document.getElementById('consent-btn').focus();
  privacy.addEventListener('keydown',event=>{
    if(event.key!=='Tab'||!privacy.classList.contains('show'))return;
    const controls=[...privacy.querySelectorAll('button,a[href]')],first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
});
