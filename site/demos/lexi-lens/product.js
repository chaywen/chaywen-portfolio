/* Progressive controls over the original application; no new AI endpoint. */
window.addEventListener('DOMContentLoaded',()=>{
  const $=id=>document.getElementById(id),text=$('reading-text');
  let prefs={font:'Arial',size:20,spacing:'1.8',paper:'#fffdfa'};
  try{const saved=JSON.parse(localStorage.getItem('lexilens-reading')||'{}');
    if(['Arial','OpenDyslexic','Verdana'].includes(saved.font))prefs.font=saved.font;
    if(Number.isFinite(saved.size))prefs.size=Math.max(14,Math.min(36,saved.size));
    if(['1.5','1.8','2.2'].includes(saved.spacing))prefs.spacing=saved.spacing;
    if(/^#[0-9a-f]{6}$/i.test(saved.paper||''))prefs.paper=saved.paper;
  }catch(_){}
  function save(){try{localStorage.setItem('lexilens-reading',JSON.stringify(prefs));}catch(_){}}
  function apply(){document.documentElement.style.setProperty('--reader-font',prefs.font+', sans-serif');document.documentElement.style.setProperty('--reader-leading',prefs.spacing);document.documentElement.style.setProperty('--reader-paper',prefs.paper);
    ['reading-text','write-textarea','write-highlight-overlay'].forEach(id=>$(id).style.fontSize=prefs.size+'px');$('reader-size').textContent=prefs.size+' px';$('reader-font').value=prefs.font;$('reader-spacing').value=prefs.spacing;}
  apply();$('reader-font').addEventListener('change',e=>{prefs.font=e.target.value;apply();save();});$('reader-spacing').addEventListener('change',e=>{prefs.spacing=e.target.value;apply();save();});
  ['font-increase','font-decrease'].forEach(id=>$(id).addEventListener('click',()=>{prefs.size=parseFloat(text.style.fontSize)||20;apply();save();}));
  document.querySelectorAll('.color-dot').forEach(b=>b.addEventListener('click',()=>{prefs.paper=b.dataset.color;apply();save();}));
  const speech=window.speechSynthesis,play=$('reader-play'),stop=$('reader-stop'),status=$('reader-audio-status');let ownSpeech=false,epoch=0;
  function idle(message='Browser voice'){ownSpeech=false;play.textContent='Read aloud';play.setAttribute('aria-pressed','false');stop.disabled=true;status.textContent=message;text.querySelectorAll('.speaking').forEach(n=>n.classList.remove('speaking'));}
  function cancel(){epoch++;if(ownSpeech)speech?.cancel();idle();}
  window.LexiReader={stop(){cancel();speech?.cancel();}};
  play.addEventListener('click',()=>{
    if(!speech||!window.SpeechSynthesisUtterance){status.textContent='Read aloud is unavailable in this browser.';return;}
    if(ownSpeech){if(speech.paused){speech.resume();play.textContent='Pause';status.textContent='Reading aloud';}else{speech.pause();play.textContent='Resume';status.textContent='Paused';}return;}
    if(currentMode!=='read'||!text.textContent.trim()||text.style.display==='none'){status.textContent='Choose a document or sample text first.';return;}
    cancelAiSpeech();speech.cancel();const ticket=++epoch,utterance=new SpeechSynthesisUtterance(text.textContent);utterance.rate=Number($('voice-speed-select').value)||1;
    ownSpeech=true;play.textContent='Pause';play.setAttribute('aria-pressed','true');stop.disabled=false;status.textContent='Reading aloud';
    utterance.onend=()=>{if(ticket===epoch)idle('Finished — read again anytime.');};utterance.onerror=e=>{if(ticket===epoch)idle(e.error==='canceled'?'Browser voice':'Voice unavailable. Try another browser voice.');};speech.speak(utterance);
  });stop.addEventListener('click',cancel);
  document.querySelectorAll('[data-workspace-mode]').forEach(button=>button.addEventListener('click',()=>{cancel();forceSwitchMode(button.dataset.workspaceMode);}));
  ['change-source-btn','read-upload-btn','read-snapshot-btn','url-submit-btn','view-original-btn','view-analyzed-btn','mic-btn'].forEach(id=>$(id).addEventListener('click',cancel));
  ['read-snapshot-btn'].forEach(id=>$(id).addEventListener('click',()=>{$('camera-preview').open=true;}));
  $('mic-btn').addEventListener('click',()=>{if(!DEMO_MODE)$('camera-preview').open=true;});
  $('explain-btn').addEventListener('click',cancel);window.addEventListener('pagehide',cancel);
  // The original ruler handler supplies y; constrain its width to the reading pane.
  document.addEventListener('mousemove',()=>{if(!isRulerActive)return;const rect=text.getBoundingClientRect();$('reading-ruler').style.left=Math.max(0,rect.left)+'px';$('reading-ruler').style.width=Math.min(rect.width,innerWidth-Math.max(0,rect.left))+'px';});
});
