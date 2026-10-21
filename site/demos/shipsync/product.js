/* UI only: evidence navigation never processes mail or dispatches a reply. */
(()=>{
  function selectPane(detail,name){
    detail.querySelectorAll('[data-review-pane]').forEach(p=>p.hidden=p.dataset.reviewPane!==name);
    detail.querySelectorAll('[data-review-tab]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.reviewTab===name)));
  }
  function filterRows(detail,only){
    const rows=[...detail.querySelectorAll('.cmp-row')];
    rows.forEach(row=>row.hidden=only&&row.classList.contains('match'));
    const shown=rows.filter(r=>!r.hidden).length;
    const count=detail.querySelector('#comparison-count');if(count)count.textContent=only&&!shown?'No differing or missing fields':shown+' of '+rows.length+' fields shown';
  }
  function prepareDetail(){
    const detail=document.getElementById('detail');if(!detail)return;
    const hasComparison=!!detail.querySelector('[data-review-pane="comparison"]');
    const hasDocuments=!!detail.querySelector('[data-review-pane="documents"]');
    detail.querySelectorAll('[data-review-tab]').forEach(b=>{b.disabled=(b.dataset.reviewTab==='comparison'&&!hasComparison)||(b.dataset.reviewTab==='documents'&&!hasDocuments);});
    selectPane(detail,hasComparison?'comparison':'original');filterRows(detail,false);
  }
  document.addEventListener('click',event=>{const button=event.target.closest('[data-review-tab]');if(button&&!button.disabled)selectPane(document.getElementById('detail'),button.dataset.reviewTab);});
  document.addEventListener('change',event=>{if(event.target.id==='differences-only')filterRows(document.getElementById('detail'),event.target.checked);});
  window.ShipSyncUI={prepareDetail,selectPane,filterRows};
})();
