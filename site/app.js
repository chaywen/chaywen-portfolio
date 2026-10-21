const projects = {
  averis: {label:'AVERIS × MONASH HACKATHON · 2026',title:'ShipSync',role:'My role · Backend developer / API integrations & deployment',intro:'A team-built shipping document verification prototype that connects incoming emails with document processing and human review workflows.',problem:'Shipping documents arrive by email. Bringing account authorization, message retrieval and response sending into one backend gives a review system the connections it needs.',contributions:['Implemented Gmail and Outlook account authorization and email retrieval using Python and FastAPI.','Added Gmail-based response sending.','Deployed the team’s backend prototype on Render.'],implementation:'The integrations use Google OAuth and the Gmail API, plus Microsoft OAuth and Microsoft Graph for Outlook inbox access. The backend exposes API routes for the application to use.',note:'Prototype scope: Outlook integration covers authorization and reading; sending is implemented through Gmail. My contribution was backend integration and deployment. Document verification logic was team work.',stack:['Python','FastAPI','OAuth','Gmail API','Microsoft Graph','Render'],url:'https://github.com/chaywen/averis-hackathon-2026'},
  lexi: {label:'GEMINI LIVE AGENT CHALLENGE · FEB–MAR 2026',title:'Lexi-Lens',role:'My role · Front-end contributor',intro:'An AI reading companion developed as a team project, pairing a split-screen reading interface with Gemini Live and vision capabilities.',problem:'Designed with dyslexic readers in mind, the interface lets readers adjust text presentation and use optional reading aids while keeping the original content available.',contributions:['Built the split-screen reading interface with HTML, CSS and JavaScript.','Implemented a reading ruler, Bionic Reading text treatment and adjustable font sizes.','Collaborated on integrating the interface into the team application.'],implementation:'Reading controls run in the browser. The team application also includes a backend using Gemini Live and vision; my responsibility was the front end.',note:'The controls below are a small standalone illustration of the reading features. They are not connected to the original application or Gemini services.',stack:['HTML','CSS','JavaScript','Gemini Live · team application'],url:'https://github.com/chaywen/lexi-lens',demo:true},
  java: {label:'ACADEMIC TEAM PROJECT · JAVA',title:'Automotive Service Centre Management',role:'My role · Counter Staff / shared features / visual UI & integration',intro:'A Java Swing desktop application that brings multiple staff roles into an automotive service centre management system.',problem:'Different staff roles need their own workflows, while the application still needs to feel consistent and work as a whole.',contributions:['Developed Counter Staff functionality for customer, appointment and technician workflows.','Worked on shared functionality used across roles.','Coordinated the overall UI and integrated teammates’ modules into the application.'],implementation:'The desktop interface is built with Java Swing. Shared utilities and a common application entry point connect the role-specific dashboards and services.',note:'Academic group project. My contribution covers Counter Staff, shared features, UI coordination and integration; other role-specific modules were contributed by teammates.',stack:['Java','Swing','Desktop application','Team integration']},
  csharp: {label:'ACADEMIC TEAM PROJECT · C#',title:'Internship Management System',role:'My role · Admin / shared features / visual UI & integration',intro:'A Windows Forms application for managing internship-related records and role-based workflows, backed by SQL Server.',problem:'Administrative tasks and multiple user roles need a shared data foundation and a consistent interface.',contributions:['Developed the Admin module, including user management, company management and reports.','Implemented shared features supporting the role-based application.','Handled the visual UI and integrated teammates’ modules.'],implementation:'Built in C# with Windows Forms and SQL Server. Admin screens work with the data layer, while shared components support the wider team application.',note:'Academic group project. The Admin module, shared functionality, visual UI and integration were my responsibilities; other role modules were team contributions.',stack:['C#','Windows Forms','SQL Server','UI integration']}
};


// Later individual refinements are separate from the original team responsibilities.
projects.averis.refinement='Refined the review layout and evidence navigation, grouped settings, and added clearer draft / send states. The portfolio uses synthetic read-only records; the original backend remains separate.';
projects.lexi.refinement='Refined the reading workspace with saved typography preferences, contextual tools, a collapsible assistant and browser read-aloud controls. Live AI remains part of the configured team application.';

// The portfolio stays static: all page turns and sample interactions run locally.
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const projectKeys = ['averis', 'lexi', 'java', 'csharp'];
let activeProject = 'averis';
let activeSpread = 0;
let turning = false;
const spreads = [...document.querySelectorAll('[data-spread]')];
const stage = document.querySelector('.book-stage');

function sizeNotebook() {
  if (turning) return;
  stage.style.removeProperty('--book-height');
  if (!window.matchMedia('(min-width: 761px)').matches) return;
  const visibility = spreads.map(spread=>spread.hidden);
  const focused = document.activeElement;
  let height = 0;
  spreads.forEach(spread=>{spread.hidden=true;});
  spreads.forEach(spread=>{spread.hidden=false;height=Math.max(height,spread.getBoundingClientRect().height);spread.hidden=true;});
  spreads.forEach((spread,index)=>{spread.hidden=visibility[index];});
  stage.style.setProperty('--book-height',`${Math.ceil(height)}px`);
  if (focused && stage.contains(focused) && !focused.closest('[hidden]')) focused.focus({preventScroll:true});
}

function decoration(node, extraClass = '') {
  const copy = node.cloneNode(true);
  // Keep the original layout classes so text never changes size during a turn.
  if (extraClass) copy.classList.add(...extraClass.split(' '));
  copy.removeAttribute('id');
  copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
  return copy;
}

function paperSheet(frontPage, backPage, width, height) {
  const sheet = document.createElement('div');
  sheet.className = 'curl-sheet'; sheet.setAttribute('aria-hidden','true'); sheet.inert = true;
  sheet.style.width = `${width}px`; sheet.style.height = `${height}px`;
  const count = 24, stripWidth = width / count, segments = [];
  let parent = sheet;
  for (let i = 0; i < count; i++) {
    const strip = document.createElement('div'); strip.className = 'curl-segment';
    strip.style.width = `${stripWidth}px`; strip.style.height = `${height}px`;
    strip.style.left = `${i === 0 ? 0 : stripWidth}px`;
    const front = document.createElement('div'), back = document.createElement('div');
    front.className = 'curl-face curl-front'; back.className = 'curl-face curl-back';
    // A small bleed covers subpixel cracks without moving the reverse artwork.
    // Its rotation axis must use the physical strip width, excluding the bleed.
    front.style.width = back.style.width = `${stripWidth + 1}px`;
    back.style.transformOrigin = `${stripWidth / 2}px center`;
    for (const [face, page, offset] of [[front,frontPage,i*stripWidth],[back,backPage,width-(i+1)*stripWidth]]) {
      const content = decoration(page,'curl-content');
      content.style.width = `${width}px`; content.style.height = `${height}px`;
      content.style.left = `${-offset}px`; face.append(content);
    }
    strip.append(front,back); parent.append(strip); parent = strip; segments.push(strip);
  }
  return {sheet,segments};
}

function paperAngles(progress, count) {
  // The free edge lifts first. The motion reaches the binding slightly later,
  // rather than giving every part of the paper the same cylindrical bend.
  return Array.from({length:count},(_,index)=>{
    const along = index/(count-1);
    const delay = .10*(1-Math.pow(along,1.6));
    const phase = Math.max(0,Math.min(1,(progress-delay)/.90));
    const settled = phase*phase*phase*(phase*(phase*6-15)+10);
    return -180*settled;
  });
}

function animatePaper(sheet, segments, shadow, forward) {
  return new Promise(resolve => {
    let started;
    function frame(time) {
      started ??= time;
      const elapsed = Math.min((time-started)/1000,1);
      const progress = forward ? elapsed : 1-elapsed;
      const angles = paperAngles(progress,segments.length);
      const lift = Math.sin(Math.PI*progress);
      sheet.style.transform = `rotateY(${angles[0]}deg) translateX(var(--binding-gap))`;
      sheet.dataset.progress = progress.toFixed(3);
      let projectedEdge = 0, height = 0, maxHeight = 0;
      const stripWidth = parseFloat(sheet.style.width)/segments.length;
      segments.forEach((strip,index) => {
        const bend = index===0 ? 0 : angles[index]-angles[index-1];
        const normal = -angles[index]*Math.PI/180;
        strip.style.transform = `rotateY(${bend}deg)`;
        projectedEdge += stripWidth*Math.cos(normal);
        height += stripWidth*Math.sin(normal);
        maxHeight = Math.max(maxHeight,height);
      });
      // The cast shadow follows the paper's footprint and softens as it rises.
      shadow.style.left = `calc(50% + ${Math.min(0,projectedEdge)}px)`;
      shadow.style.width = `${Math.max(18,Math.abs(projectedEdge))}px`;
      shadow.style.opacity = String(lift*.24);
      shadow.style.filter = `blur(${2+maxHeight/parseFloat(sheet.style.width)*18}px)`;
      shadow.style.transform = projectedEdge<0 ? 'scaleX(-1)' : 'none';
      if (elapsed < 1 && !reduceMotion()) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

async function turnPage(index) {
  if (turning || index === activeSpread) return;
  turning = true;
  const current = spreads[activeSpread], next = spreads[index];
  const focusWasInside = current.contains(document.activeElement);
  const forward = index > activeSpread;
  const desktop = window.matchMedia('(min-width: 761px)').matches;
  const elements = [];
  const currentHeight = current.getBoundingClientRect().height;
  const pageWidth = current.querySelector('.page-right').getBoundingClientRect().width;
  let sheetParts, stationary, shadow;
  if (desktop && !reduceMotion()) {
    stationary = decoration(current.querySelector(forward ? '.page-left' : '.page-right'),'still-page');
    if (!forward) stationary.classList.add('still-right');
    sheetParts = paperSheet(
      forward ? current.querySelector('.page-right') : next.querySelector('.page-right'),
      forward ? next.querySelector('.page-left') : current.querySelector('.page-left'),
      pageWidth,currentHeight
    );
    // Set the first pose before mounting, avoiding a one-frame flash on return.
    sheetParts.sheet.style.setProperty('--binding-gap',`${(stage.getBoundingClientRect().width-2*pageWidth)/2}px`);
    sheetParts.sheet.style.transform = `${forward ? 'rotateY(0deg)' : 'rotateY(-180deg)'} translateX(var(--binding-gap))`;
    shadow = document.createElement('div'); shadow.className = 'paper-cast-shadow';
    elements.push(stationary,shadow,sheetParts.sheet);
  }
  current.hidden = true; next.hidden = false; activeSpread = index;
  const arrow = document.querySelector('#book-turn-arrow');
  arrow.dataset.turn = String(index === 0 ? 1 : 0);
  arrow.setAttribute('aria-label',index === 0 ? 'Next notebook spread: About me' : 'Previous notebook spread: Introduction');
  arrow.querySelector('.turn-arrow-icon').textContent = index === 0 ? '→' : '←';
  arrow.querySelector('.turn-arrow-label').textContent = index === 0 ? 'About me' : 'Back';
  document.querySelectorAll('[data-turn]').forEach(button => {
    button.disabled = true;
    if (button.closest('.book-pagination')) button.setAttribute('aria-pressed',String(Number(button.dataset.turn)===index));
  });
  try {
    if (sheetParts) {
      stage.style.minHeight = `${Math.max(currentHeight,next.getBoundingClientRect().height)}px`;
      stage.append(...elements);
      await animatePaper(sheetParts.sheet,sheetParts.segments,shadow,forward);
    } else if (!reduceMotion()) {
      // Small screens keep the same content and use a shorter, lighter transition.
      await next.animate([{opacity:.25,transform:'translateX(12px)'},{opacity:1,transform:'none'}],{duration:260,easing:'ease-out'}).finished;
    }
  } catch (_) { /* Always leave the requested spread usable after interruption. */ }
  finally {
    elements.forEach(element=>element.remove()); stage.style.minHeight=''; turning=false;
    sizeNotebook();
    document.querySelectorAll('[data-turn]').forEach(button=>{button.disabled=false;});
    document.querySelector('#book-status').textContent = `${index===0?'Introduction':'About me'} spread, page ${index+1} of 2.`;
    if (focusWasInside) {
      const heading=next.querySelector('h1,h2'); heading.tabIndex=-1; heading.focus({preventScroll:true});
    }
    if (!desktop) document.querySelector('#notebook').scrollIntoView({behavior:reduceMotion()?'instant':'smooth',block:'start'});
  }
}

document.querySelectorAll('[data-turn]').forEach(button => button.addEventListener('click', () => turnPage(Number(button.dataset.turn))));
document.querySelector('[data-open-about]').addEventListener('click', () => turnPage(1));

const panel = document.querySelector('#project-panel');
const tabs = [...document.querySelectorAll('[data-project-tab]')];
const engineeringNotes = {
  averis:'Connecting external services means coordinating authorization, API requests and deployment configuration. This project brings those pieces into one backend prototype.',
  lexi:'Reading controls need to work together without disrupting the text. This project connects interface layout, adjustable typography and a team AI application.',
  java:'A role-based desktop application needs shared conventions. This project links Counter Staff workflows with common UI and teammates’ modules.',
  csharp:'Admin screens connect interface decisions with database-backed records. This project brings shared features and several team-built roles into one Windows application.'
};
const visualCaptions = {
  averis:'Original interactive interface with synthetic examples. Real mailbox, processing and server decisions require the full backend.',
  lexi:'Refined accessible workspace in sample mode. Prepared text; no live AI connection.',
  java:'Module map based on the Counter Staff implementation. Illustration, not an app screenshot.',
  csharp:'Module map based on the Admin implementation. Illustration, not an app screenshot.'
};

function readingDemo() {
  return `<div class="reader-demo"><div class="demo-toolbar"><span>TRY THE READING CONTROLS</span><button id="font-down" aria-label="Decrease sample font size">A−</button><button id="font-up" aria-label="Increase sample font size">A+</button><button id="bionic" aria-pressed="false">Bionic</button><button id="ruler" aria-pressed="false">Reading bands</button></div><p class="demo-text">Good software makes room for different ways of thinking. Small changes in how words appear can give readers more control over their experience.</p><small>Standalone illustration of the reading features. No AI requests.</small></div>`;
}

function selectProject(key, {animate = true} = {}) {
  if (!projectKeys.includes(key)) return;
  const p = projects[key]; activeProject = key;
  if (animate) document.getElementById('project-notes').open=true;
  const index = projectKeys.indexOf(key);
  tabs.forEach(tab => {const selected = tab.dataset.projectTab === key; tab.setAttribute('aria-selected',String(selected)); tab.tabIndex = selected ? 0 : -1;});
  panel.setAttribute('aria-labelledby',`tab-${key}`);
  const livePreview = key === 'lexi' ? 'demos/lexi-lens/index.html?demo=1' : 'demos/shipsync/interface.html#sample_mismatch';
  let visual = ['averis','lexi'].includes(key)
    ? `<a class="featured-preview note-preview" href="${livePreview}" target="_blank" rel="noopener"><iframe src="${livePreview}" title="${p.title} project sample" tabindex="-1" aria-hidden="true" loading="lazy" sandbox="allow-scripts allow-same-origin"></iframe><span>Open interactive sample ↗</span></a>`
    : document.querySelector(`#visual-${key}`).innerHTML;
  panel.innerHTML = `<div class="project-spread"><div class="project-left"><p class="project-stamp">PROJECT NOTE / ${String(index+1).padStart(2,'0')}</p><figure class="project-figure">${visual}<figcaption>${visualCaptions[key]}</figcaption></figure>${key === 'averis' ? `<div class="workflow-demo"><span class="tiny-label">A SMALL WORKFLOW WALKTHROUGH</span><div class="workflow-steps"><span class="current">01 / Read</span><span>02 / Review</span><span>03 / Respond</span></div><p id="workflow-message">An authorized Gmail or Outlook account supplies the message to the backend.</p><button id="workflow-next">Next step →</button><small>Illustrative walkthrough; no account access or email is sent.</small></div>` : ''}${key === 'lexi' ? readingDemo() : ''}<div class="engineering-note"><span class="handwritten">A note on the engineering</span><p>${engineeringNotes[key]}</p></div></div><div class="project-right"><p class="eyebrow">${p.label}</p><h3>${p.title}</h3><p class="project-role">${p.role.replace('My role · ','')}</p><p class="project-summary">${p.intro}</p><div class="tags">${p.stack.map(item=>`<span>${item}</span>`).join('')}</div><h4>The problem</h4><p>${p.problem}</p><h4 class="contribution-heading">My contribution</h4><ul class="contribution-list">${p.contributions.map(item=>`<li>${item}</li>`).join('')}</ul><details><summary>How it fits together</summary><p>${p.implementation}</p></details>${p.refinement ? `<div class="individual-refinement"><h4>My later individual refinements</h4><p>${p.refinement}</p></div>` : ""}<p class="ownership-note">${p.note.replace('The controls below are a small standalone illustration of the reading features. They are not connected to the original application or Gemini services.','My responsibility was the front end. Gemini Live and vision are capabilities of the team application; this portfolio sample is not connected to Gemini.')}</p>${p.url ? `<a class="button primary repo-button" href="${p.url}" target="_blank" rel="noopener">Explore the code on GitHub ↗</a>` : `<a class="text-link" href="#contact">Ask me about this project ↗</a>`}</div></div>`;
  panel.querySelectorAll('.corner-arrow').forEach(el => el.remove());
  document.querySelector('#project-position').textContent = `${String(index+1).padStart(2,'0')} / 04`;
  document.querySelector('#previous-project').disabled = index === 0;
  document.querySelector('#next-project').disabled = index === projectKeys.length - 1;
  document.querySelector('#project-status').textContent = `Project ${index+1} of 4: ${p.title}.`;
  if (animate && !reduceMotion()) panel.animate([{opacity:.2,transform:'perspective(1200px) rotateX(-7deg) translateY(8px)'},{opacity:1,transform:'none'}],{duration:380,easing:'ease-out'});
  if (key === 'lexi') bindReadingDemo();
  if (key === 'averis') bindWorkflowDemo();
}

function bindReadingDemo() {
  const text = panel.querySelector('.demo-text'), plain = text.textContent; let size = 17;
  panel.querySelector('#font-down').onclick = () => {size = Math.max(14,size-2); text.style.fontSize=`${size}px`;};
  panel.querySelector('#font-up').onclick = () => {size = Math.min(27,size+2); text.style.fontSize=`${size}px`;};
  panel.querySelector('#bionic').onclick = event => {
    const active = event.currentTarget.getAttribute('aria-pressed') !== 'true'; event.currentTarget.setAttribute('aria-pressed',String(active));
    text.innerHTML = active ? plain.replace(/[A-Za-z]+/g,word=>`<b>${word.slice(0,Math.ceil(word.length/2))}</b>${word.slice(Math.ceil(word.length/2))}`) : plain;
  };
  panel.querySelector('#ruler').onclick = event => {event.currentTarget.setAttribute('aria-pressed',String(text.classList.toggle('ruler')));};
}
function bindWorkflowDemo() {
  let step = 0;
  const messages = [
    'An authorized Gmail or Outlook account supplies the message to the backend.',
    'The team application brings document results into a human review workflow.',
    'The Gmail integration sends a response. Outlook sending is outside this implementation.'
  ];
  const steps = panel.querySelectorAll('.workflow-steps span'), next = panel.querySelector('#workflow-next');
  next.onclick = () => {
    step = (step+1)%3;
    steps.forEach((el,index)=>el.classList.toggle('current',index===step));
    panel.querySelector('#workflow-message').textContent = messages[step];
    next.textContent = step === 2 ? 'Start again ↺' : 'Next step →';
  };
}
tabs.forEach((tab,index) => {
  tab.addEventListener('click',()=>selectProject(tab.dataset.projectTab));
  tab.addEventListener('keydown',event=>{
    let next;
    if (event.key === 'ArrowRight') next = (index+1)%tabs.length;
    if (event.key === 'ArrowLeft') next = (index+tabs.length-1)%tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length-1;
    if (next === undefined) return;
    event.preventDefault(); tabs[next].focus(); selectProject(tabs[next].dataset.projectTab);
  });
});
function jumpToProject(key) {selectProject(key);document.querySelector('#work').scrollIntoView({behavior:reduceMotion()?'instant':'smooth',block:'start'});}
document.querySelectorAll('[data-jump]').forEach(button=>button.addEventListener('click',()=>jumpToProject(button.dataset.jump)));
document.querySelector('#previous-project').onclick = () => selectProject(projectKeys[projectKeys.indexOf(activeProject)-1]);
document.querySelector('#next-project').onclick = () => selectProject(projectKeys[projectKeys.indexOf(activeProject)+1]);
selectProject('averis',{animate:false});

const channels = [
  {label:'CH. 01 / BACKEND',message:'Making connections.<br>One API at a time.',tools:'PYTHON · FASTAPI · OAUTH',icon:'✳',key:'averis',link:'See the backend project ↗'},
  {label:'CH. 02 / INTERFACES',message:'A clearer interface.<br>A little more care.',tools:'READING TOOLS / SAMPLE AVAILABLE',icon:'Aa',key:'lexi',link:'Try the reading controls ↗'},
  {label:'CH. 03 / INTEGRATION',message:'Different pieces.<br>One working system.',tools:'JAVA · C# · TEAMWORK',icon:'↔',key:'java',link:'See the Java project ↗'}
];
let channelIndex = 0;
document.querySelector('#change-channel').addEventListener('click',()=>{
  channelIndex = (channelIndex+1)%channels.length; const channel = channels[channelIndex];
  document.querySelector('.tv-channel').textContent = channel.label;
  document.querySelector('.tv-message').innerHTML = channel.message;
  document.querySelector('.tv-bottom').textContent = channel.tools;
  document.querySelector('.screen-art').innerHTML = `<span>{</span><span class="screen-spark">${channel.icon}</span><span>}</span>`;
  document.querySelector('.tv-screen').dataset.channel = String(channelIndex);
  const link = document.querySelector('.tv-project-link'); link.dataset.jump = channel.key; link.textContent = channel.link;
  document.querySelector('#change-channel').style.transform = `rotate(${channelIndex*75}deg)`;
});
document.querySelector('#copy-email').addEventListener('click',async()=>{
  const status = document.querySelector('#copy-status');
  try {await navigator.clipboard.writeText('lchaywen06@gmail.com');status.textContent='Email address copied.';}
  catch (_) {status.textContent='Please select the email address above to copy it, or use the Email key.';}
});
document.querySelector('#year').textContent = new Date().getFullYear();
sizeNotebook();
document.fonts?.ready.then(sizeNotebook);
let notebookResizeFrame;
window.addEventListener('resize',()=>{cancelAnimationFrame(notebookResizeFrame);notebookResizeFrame=requestAnimationFrame(sizeNotebook);});

document.querySelectorAll('[data-case-note]').forEach(button=>button.addEventListener('click',()=>{
  document.getElementById('project-notes').open=true;
  selectProject(button.dataset.caseNote);
  document.getElementById('project-notes').scrollIntoView({behavior:reduceMotion()?'instant':'smooth',block:'start'});
}));

// Keep live interface covers proportional to their cards at every viewport width.
if ('ResizeObserver' in window) {
  const observedPreviews=new Set();
  const fitPreview = new ResizeObserver(entries => entries.forEach(({target,contentRect}) => {
    const frame=target.querySelector('iframe');if(frame)frame.style.transform=`scale(${contentRect.width/1100})`;
  }));
  const observePreviews=()=>{
    observedPreviews.forEach(el=>{if(!el.isConnected){fitPreview.unobserve(el);observedPreviews.delete(el);}});
    document.querySelectorAll('.featured-preview').forEach(el=>{
      if(!observedPreviews.has(el)){observedPreviews.add(el);fitPreview.observe(el);}
    });
  };
  observePreviews();new MutationObserver(observePreviews).observe(panel,{childList:true,subtree:true});
}
