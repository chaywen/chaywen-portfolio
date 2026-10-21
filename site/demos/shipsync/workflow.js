/* Reorganize existing controls; never process mail or submit decisions on navigation. */
(()=>{
  function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el;}
  function workspaceMenu(){
    const trigger=document.getElementById('wsTrigger'),menu=document.getElementById('wsDropdown');
    if(!trigger||!menu||menu.dataset.floatingReady)return;
    menu.dataset.floatingReady='true';
    // A scrolling sidebar clips descendants, regardless of their z-index.
    // Keep the original menu, links and hidden-state handlers; position it outside the rail.
    document.body.append(menu);menu.classList.add('ws-floating-menu');
    trigger.setAttribute('aria-controls',menu.id);
    const links=()=>[...menu.querySelectorAll('a[href],button:not([disabled])')];
    function close(){menu.hidden=true;trigger.setAttribute('aria-expanded','false');}
    function place(){
      if(menu.hidden)return;
      const margin=12,gap=8,viewport=window.visualViewport;
      const width=viewport?.width||document.documentElement.clientWidth;
      const height=viewport?.height||document.documentElement.clientHeight;
      const x=viewport?.offsetLeft||0,y=viewport?.offsetTop||0;
      const rect=trigger.getBoundingClientRect();
      if(rect.bottom<y||rect.top>y+height||rect.right<x||rect.left>x+width){close();return;}
      const menuWidth=Math.min(document.querySelector('.mail-app')?340:320,Math.max(0,width-margin*2));
      menu.style.width=menuWidth+'px';
      const below=Math.max(0,y+height-margin-rect.bottom-gap),above=Math.max(0,rect.top-y-margin-gap);
      const upward=below<Math.min(menu.scrollHeight,180)&&above>below;
      const available=upward?above:below;
      menu.style.maxHeight=available+'px';
      menu.style.left=Math.max(x+margin,Math.min(rect.left,x+width-margin-menuWidth))+'px';
      menu.style.top=(upward?rect.top-gap-Math.min(menu.scrollHeight,available):rect.bottom+gap)+'px';
    }
    new MutationObserver(place).observe(menu,{attributes:true,attributeFilter:['hidden']});
    window.addEventListener('resize',place);document.addEventListener('scroll',place,true);
    window.visualViewport?.addEventListener('resize',place);
    window.visualViewport?.addEventListener('scroll',place);
    // The original outside-click handler remains in charge of dismissing the menu.
    menu.addEventListener('click',event=>event.stopPropagation());
    trigger.addEventListener('keydown',event=>{
      if(event.key==='ArrowDown'||(event.key==='Tab'&&!event.shiftKey&&!menu.hidden)){
        event.preventDefault();menu.hidden=false;trigger.setAttribute('aria-expanded','true');place();links()[0]?.focus();
      }
    });
    document.addEventListener('keydown',event=>{
      if(menu.hidden)return;
      if(event.key==='Escape'){event.preventDefault();close();trigger.focus();return;}
      if(!menu.contains(event.target))return;
      const items=links(),index=items.indexOf(document.activeElement);
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){
        event.preventDefault();items[(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();
      }else if(event.key==='Tab'&&((event.shiftKey&&index===0)||(!event.shiftKey&&index===items.length-1))){
        close();trigger.focus();if(event.shiftKey)event.preventDefault();
      }
    });
    document.addEventListener('focusin',event=>{if(!menu.hidden&&event.target!==trigger&&!menu.contains(event.target))close();});
    place();
  }
  function dock(){
    const host=document.getElementById('detailDock'),bar=host?.querySelector('.act-bar');if(!bar||bar.dataset.workflowReady)return;
    bar.dataset.workflowReady='true';const buttons=[...bar.querySelectorAll('[data-kind]')];
    if(!buttons.length)return;
    const group=node('details','review-decision'),summary=node('summary','','Record review decision'),content=node('div','decision-options');
    group.append(summary,content);content.append(node('p','decision-help','Records the review outcome only. Preparing and sending a reply are separate steps.'));
    const names={confirm:'Accept this result',pass:'Mark as cleared',mismatch:'Mark as mismatch',back:'Needs clarification'};
    for(const button of buttons){button.textContent=names[button.dataset.kind]||button.textContent;button.title=names[button.dataset.kind]+' · does not send email';content.append(button);}
    const note=bar.querySelector('#ov-note');if(note){note.setAttribute('aria-label','Reviewer note, saved with this decision');content.append(note);}
    bar.prepend(group);
    const duplicate=[...bar.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').startsWith('openShipmentFromReview'));
    if(duplicate&&document.querySelector('#detail .verdict-line button'))duplicate.hidden=true;
  }
  function detail(){
    const host=document.getElementById('detail');if(!host?.querySelector('.detail-head'))return;
    if(!host.querySelector('.review-flow')){
      const flow=node('nav','review-flow');flow.setAttribute('aria-label','Review workflow');
      for(const [name,label] of [['original','1 Read email'],['comparison','2 Compare'],['decision','3 Record decision'],['reply','4 Prepare reply']]){const b=node('button','',label);b.type='button';b.dataset.flowAction=name;flow.append(b);}
      flow.append(node('span','flow-send-note','Send only after review'));
      host.querySelector('.detail-head').append(flow);
    }
    const record=host.querySelector('[data-flow-action=decision]');record.disabled=!document.querySelector('#detailDock .review-decision');
    const reply=host.querySelector('[data-flow-action=reply]');reply.disabled=!host.querySelector('#reviewReplyActions button.primary');
    const compare=host.querySelector('[data-flow-action=comparison]');compare.disabled=!host.querySelector('[data-review-pane=comparison]');
  }
  function gateway(){
    const engine=document.getElementById('selEngine');if(!engine||document.getElementById('gateway-settings'))return;
    const bar=engine.closest('.control-bar');if(!bar)return;
    const details=node('details','gateway-settings');details.id='gateway-settings';details.append(node('summary','','Processing & connection settings'));
    const inner=node('div','gateway-settings-content');details.append(inner);
    for(const id of ['selEngine','selMode']){const group=document.getElementById(id)?.closest('.cg-item');if(group)inner.append(group);}
    const channel=document.getElementById('imapChannelBadge')?.closest('.chan-chip')?.parentElement;if(channel)inner.append(channel);
    bar.append(details);
  }
  function mail(){
    const source=document.getElementById('gmailRow')?.closest('.rail-card');
    if(source&&!source.querySelector('.mail-connections')){const settings=node('details','mail-connections');settings.append(node('summary','','Mail connections'));const content=node('div','mail-connection-options');while(source.firstChild)content.append(source.firstChild);settings.append(content);source.append(settings);}
    const compose=document.getElementById('composeBtn');if(compose&&!document.getElementById('mailbox-tools')){
      const tools=node('details','mailbox-tools');tools.id='mailbox-tools';tools.append(node('summary','','Mailbox tools'));
      const triage=node('button','btn','Mailbox triage & assignment');triage.type='button';triage.addEventListener('click',()=>window.rvSetMode('review'));tools.append(triage);compose.after(tools);
    }
  }
  function setup(){
    workspaceMenu();
    if(document.querySelector('.mail-app')){mail();return;}
    gateway();dock();detail();
    for(const id of ['detail','detailDock']){const host=document.getElementById(id);if(host)new MutationObserver(()=>{dock();detail();}).observe(host,{childList:true,subtree:true});}
    document.addEventListener('click',event=>{
      const action=event.target.closest('[data-flow-action]');if(!action||action.disabled)return;
      const key=action.dataset.flowAction;
      if(key==='original'||key==='comparison')window.ShipSyncUI?.selectPane(document.getElementById('detail'),key);
      if(key==='decision'){const group=document.querySelector('#detailDock .review-decision');if(group){group.open=true;group.querySelector('button')?.focus();}}
      if(key==='reply')document.querySelector('#reviewReplyActions button.primary')?.click();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
