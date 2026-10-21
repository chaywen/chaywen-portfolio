/* Static portfolio adapter. Original UI runs; samples are read-only API recordings.
   This file is loaded only by the portfolio builder, never by the full app. */
(()=>{
  const nativeFetch=window.fetch.bind(window),base=new URL('.',document.currentScript.src);
  const samples=nativeFetch(new URL('interactive-sample-api.json',base)).then(r=>{if(!r.ok)throw Error('Sample data unavailable');return r.json();});
  const message='This action needs the full backend. No email was sent and no server record was changed.';
  function notify(text=message){const panel=document.getElementById('portfolio-action-message');if(panel){panel.textContent=text;panel.hidden=false;}}
  const reply=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
  const normalized=url=>url.pathname+'?'+[...url.searchParams].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&');
  function find(data,url){
    const exact=Object.entries(data).find(([key])=>!key.startsWith('POST ')&&normalized(new URL(key,base))===normalized(url));
    if(exact)return structuredClone(exact[1]);
    if(!url.pathname.endsWith('/version-diff')){
      const match=Object.entries(data).find(([key])=>!key.startsWith('POST ')&&new URL(key,base).pathname===url.pathname);
      if(match)return structuredClone(match[1]);
    }
    return undefined;
  }
  async function route(input,init={}){
    const url=new URL(typeof input==='string'||input instanceof URL?input:input.url,location.href);
    if(url.origin!==location.origin||!/^\/(api|shipments|issues|health)(\/|$)/.test(url.pathname))return nativeFetch(input,init);
    const method=(init.method||input.method||'GET').toUpperCase();
    const data=await samples;
    if(method!=='GET'&&method!=='HEAD'){
      let body={};try{body=JSON.parse(init.body||'{}');}catch(_){}
      if(method==='POST'&&body.dry_run===true){
        const pathname=url.pathname==='/api/gmail/return'?'/api/emails/'+url.searchParams.get('email_id')+'/return':url.pathname;
        const preview=data['POST '+pathname+'?dry_run=true'];if(preview)return reply({...preview,reply_to:preview.recipient});
      }
      notify();throw Object.assign(new Error(message),{backendRequired:true});
    }
    if(/\/(connect|oauth-callback|oauth-callback-page)$/.test(url.pathname)){notify('Connect Gmail / Outlook requires the configured backend and OAuth callback. No sign-in was started.');return reply({detail:message},503);}
    if(/^\/api\/(gmail|outlook)\/status$/.test(url.pathname))return reply({connected:false,token_configured:false,oauth_libraries_available:false,credentials_configured:false,client_id_configured:false,account:null});
    if(url.pathname==='/api/v1/gateway/email-channel/status')return reply({imap:{configured:false},smtp:{configured:false}});
    if(url.pathname.includes('/attachments/')){
      const file=attachment(url);if(file)return nativeFetch(file);
      notify('This attachment is not included in the synthetic sample. Open the full application to access it.');return reply({detail:'Sample attachment unavailable'},404);
    }
    if(url.pathname.startsWith('/shipments/by-key/')){
      const key=decodeURIComponent(url.pathname.split('/').pop()),ships=data['/shipments'].shipments;
      const ship=ships.find(s=>s.shipment_key===key);if(ship)return reply(data['/shipments/'+ship.id+'/overview']);
    }
    let value=find(data,url);
    if(value===undefined&&/^\/api\/gmail\/results\//.test(url.pathname))value=data['/api/emails/'+url.pathname.split('/').pop()];
    if(url.pathname==='/api/gmail/emails')value=data['/api/emails?limit=2000'];
    if(url.pathname==='/api/gmail/review'){
      value=structuredClone(data['/api/gmail/review?limit=500']);
      const rows=data['/api/emails?limit=2000'].items.map(row=>({...row,sender:row.from,snippet:'Synthetic example — no mailbox connected',assignment:'HOLD',dispatched:false}));
      value.items=rows.filter(r=>(!url.searchParams.get('status')||r.status===url.searchParams.get('status'))&&(!url.searchParams.get('category')||r.category===url.searchParams.get('category'))&&(!url.searchParams.get('assignment')||r.assignment===url.searchParams.get('assignment'))&&(!url.searchParams.get('q')||JSON.stringify(r).toLowerCase().includes(url.searchParams.get('q').toLowerCase())));
      value.total=value.items.length;value.kpis={total:3,processed:3,awaiting:2,mismatch:1,missing_docs:1,auto:0,ignored:0};value.counts={assignment:{AUTO:0,HOLD:3,IGNORE:0},category:{BL_COMPARISON:3},status:{OK:1,MISMATCH:1,NEEDS_REVIEW:1}};
    }
    if(url.pathname==='/api/v1/gateway/emails'&&Array.isArray(value))value=value.filter(row=>(!url.searchParams.get('source_mailbox')||url.searchParams.get('source_mailbox')==='ALL'||row.source_mailbox===url.searchParams.get('source_mailbox'))&&(!url.searchParams.get('status')||url.searchParams.get('status')==='ALL'||row.status===url.searchParams.get('status')));
    if(value!==undefined)return reply(value);
    notify('This view needs additional backend data. The original interface remains available; no live account is connected.');return reply({detail:message,backend_required:true},503);
  }
  function attachment(url){
    let path;try{path=decodeURIComponent(url.pathname);}catch(_){return null;}
    const match=path.match(/(sample_(?:match|mismatch|missing)_(?:SI|BL)\.txt)/i);
    return match?new URL('attachments/'+match[1],base).href:null;
  }
  window.fetch=route;
  window.PortfolioTransport={samples,notify,route,attachment};
  window.addEventListener('unhandledrejection',event=>{if(event.reason?.backendRequired){event.preventDefault();notify();}});
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(link){const url=new URL(link.href,location.href);if(url.origin===location.origin&&url.pathname.startsWith('/api/')&&/\/attachments?\//.test(url.pathname)){event.preventDefault();const target=attachment(url);if(target){const a=document.createElement('a');a.href=target;a.target='_blank';a.rel='noopener';if(link.hasAttribute('download'))a.download=target.split('/').pop();a.click();}else notify('This attachment is not included in the sample.');return;}}
    const button=event.target.closest('button');if(!button)return;
    if(['gmailConnect','outlookConnect','gmailSync','outlookSync','outlookConfigBtn','cmpSend','rvSend'].includes(button.id)||/^(connectGmail|connectOutlook|syncGmail|syncOutlook|promptOutlookConfig)\(/.test(button.getAttribute('onclick')||'')){
      event.preventDefault();event.stopImmediatePropagation();notify();
    }
  },true);
})();
