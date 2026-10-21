window.addEventListener('DOMContentLoaded',()=>{
  const $=id=>document.getElementById(id),app=$('app'),toggle=$('assistant-toggle');
  let collapsed=false;
  try{collapsed=localStorage.getItem('lexilens-help-collapsed')==='true';}catch(_){}
  function help(open){collapsed=!open;app.dataset.helpCollapsed=String(collapsed);toggle.textContent=open?'Hide help':'Show help';toggle.removeAttribute('aria-label');toggle.setAttribute('aria-expanded',String(open));try{localStorage.setItem('lexilens-help-collapsed',String(collapsed));}catch(_){} }
  function mode(value){
    if(!['read','write','form'].includes(value))return;
    window.LexiReader?.stop();cancelAiSpeech();
    app.dataset.mode=value;
    app.dataset.sample=String(DEMO_MODE);
    $('sample-guide').hidden=!DEMO_MODE||value!=='read';
    const title=document.querySelector('.panel-title');title.textContent={read:'Your reading space',write:'Your writing space',form:'Your form workspace'}[value];
    $('mode-guidance').textContent=value==='read'?'Adjust the text size, or open Reading settings for your preferred font, spacing and reading tools.':value==='write'?'Write or dictate your text. Read my writing lets you listen back; suggestions use a connected Lexi session.':DEMO_MODE?'Form uploads and screen sharing require the configured application. Your reading settings are saved.':'Upload a form or share a screen, then ask Lexi about one field at a time.';
    $('reading-tools-panel').classList.add('hidden');$('reading-tools-btn').classList.remove('active-toggle');$('reading-tools-btn').setAttribute('aria-expanded','false');
  }
  toggle.addEventListener('click',()=>{
    help(collapsed);
    if(!collapsed&&window.matchMedia?.('(max-width:760px)').matches)$('lexi-assistant').scrollIntoView({block:'start',behavior:'auto'});
  });
  $('back-to-workspace').addEventListener('click',()=>{
    document.querySelector('.right-panel').scrollIntoView({block:'start',behavior:'auto'});
    const title=document.querySelector('.panel-title');title.tabIndex=-1;title.focus({preventScroll:true});
  });
  $('explain-selection-btn').addEventListener('click',()=>help(true));
  $('write-ai-btn').addEventListener('click',()=>help(true));
  $('form-lexi-assistant').addEventListener('click',()=>help(true));
  $('explain-btn').title='A simpler explanation of the text currently in your reading space.';
  $('view-analyzed-btn').title='A summary of the whole document; the original text remains available.';
  $('reader-play').title='Read the displayed text using your browser voice. Talk to Lexi starts a separate conversation.';
  new MutationObserver(()=>{if(collapsed){toggle.textContent='Show help · new';toggle.setAttribute('aria-label','Show help, new message');}}).observe($('chat-scroll'),{childList:true,subtree:true});
  window.LexiUX={setMode:mode,showHelp:()=>help(true)};help(!collapsed);mode(currentMode);
});
