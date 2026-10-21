"use strict";
const $ = id => document.getElementById(id);
const STATIC_DEMO = document.documentElement.dataset.staticDemo === 'true';
const labels = {shipper:'Shipper',consignee:'Consignee',notify_party:'Notify party',port_of_loading:'Loading port',port_of_discharge:'Discharge port',container_count:'Containers',gross_weight_kg:'Gross weight (kg)'};
const descriptions={mismatch:'The two documents list different container counts.',match:'All seven fields agree after normalization.',missing:'The draft bill of lading has no gross weight.'};
let generation=0,activeRequest=null,lastResult=null;
function renderRows(){
  $('fields').replaceChildren();
  const rows=lastResult?.field_results.filter(f=>!$('issues-only').checked||f.match!==true)||[];
  $('table-empty').hidden=rows.length>0;
  $('table-empty').textContent=lastResult?'No issues to show. All required fields match.':'Your comparison will appear here. Seven fields, one clear view.';
  rows.forEach(field=>{
    const row=document.createElement('tr');row.dataset.flag=String(field.match!==true);
    [labels[field.field]||field.field,field.si_value??'Missing',field.bl_value??'Missing',field.match===true?'✓ Match':field.match===false?'! Different':'? Review'].forEach(value=>{const cell=document.createElement('td');cell.textContent=String(value);row.append(cell);});
    $('fields').append(row);
  });
}
function invalidate(){
  generation++;activeRequest?.abort();activeRequest=null;lastResult=null;
  $('run').disabled=false;$('run').removeAttribute('aria-busy');
  $('review').disabled=true;$('issues-only').checked=false;$('issues-only').disabled=true;
  $('verdict').textContent='Ready to check';$('verdict').removeAttribute('data-status');
  $('summary').textContent='Compare documents to see the result for these inputs.';
  $('next-step').textContent='Run a comparison to see which action is needed.';
  $('review-state').textContent='Demo review only. No shipment or operational record is updated.';
  ['checked-count','match-count','issue-count'].forEach(id=>$(id).textContent='—');
  $('error').textContent='';$('case-hint').textContent=descriptions[$('scenario').value];
  $('bl-description').textContent='Draft · '+$('containers').value+' containers';renderRows();
}
async function run(){
  if(!$('containers').reportValidity())return;
  activeRequest?.abort();const controller=new AbortController();activeRequest=controller;const current=++generation;
  $('run').disabled=true;$('run').setAttribute('aria-busy','true');$('error').textContent='';$('review').disabled=true;
  lastResult=null;renderRows();$('verdict').removeAttribute('data-status');$('verdict').textContent='Comparing…';
  ['checked-count','match-count','issue-count'].forEach(id=>$(id).textContent='—');
  $('issues-only').disabled=true;
  $('next-step').textContent='Checking the selected document pair…';
  $('review-state').textContent='Demo review only. No shipment or operational record is updated.';
  const timeout=setTimeout(()=>controller.abort(),15000);
  try{
    let data;
    if(STATIC_DEMO){const response=await fetch('demo-results.json',{signal:controller.signal});if(!response.ok)throw Error('Unavailable');const records=await response.json();data=records[$('scenario').value];}
    else{const params=new URLSearchParams({scenario:$('scenario').value,containers:$('containers').value});const response=await fetch('/api/demo/compare?'+params,{signal:controller.signal});if(!response.ok)throw Error('Unavailable');data=await response.json();}
    if(current!==generation)return;
    lastResult=data.result;const result=lastResult;
    $('verdict').textContent=({OK:'All fields match',MISMATCH:'Difference found',NEEDS_REVIEW:'Needs review'})[result.status];$('verdict').dataset.status=result.status;
    $('summary').textContent=({OK:'All seven required fields agree after normalization.',MISMATCH:'A difference was found. Check the highlighted row before proceeding.',NEEDS_REVIEW:'Missing evidence needs a human check before a decision can be made.'})[result.status];
    const matches=result.field_results.filter(f=>f.match===true).length;
    $('checked-count').textContent=result.field_results.length;$('match-count').textContent=matches;$('issue-count').textContent=result.field_results.length-matches;
    $('issues-only').disabled=false;$('review').disabled=result.status==='OK';
    $('next-step').textContent=result.status==='OK'?'No discrepancy to review in this sample.':'Check the flagged evidence, then acknowledge this demo review.';
    renderRows();
  }catch(error){
    if(current!==generation)return;
    lastResult=null;renderRows();$('verdict').textContent='Could not compare';$('summary').textContent='No result was returned. Your sample selection is preserved.';
    $('next-step').textContent='Retry the comparison when the service is ready.';
    $('error').textContent=error.name==='AbortError'?'The request timed out. Please try again.':STATIC_DEMO?'Could not load the recorded sample. Please retry.':'Start the backend, then try Compare documents again.';
  }finally{clearTimeout(timeout);if(current===generation){$('run').disabled=false;$('run').removeAttribute('aria-busy');activeRequest=null;}}
}
$('scenario').addEventListener('change',()=>{$('containers').value=$('scenario').value==='mismatch'?4:3;invalidate();});
$('containers').addEventListener('input',invalidate);$('run').addEventListener('click',run);
$('reset').addEventListener('click',()=>{$('scenario').value='mismatch';$('containers').value=4;invalidate();});
$('issues-only').addEventListener('change',renderRows);
$('review').addEventListener('click',()=>{$('review-state').textContent='Acknowledged in this demo. Nothing is saved or sent.';$('review').disabled=true;});
if(STATIC_DEMO){$('containers').disabled=true;$('container-hint').textContent='Recorded sample. Editing container counts is available in the local backend demo.';$('scope-description').textContent='Recorded outputs from the actual engine. Sample data only; no live backend or email.';}
invalidate();

if(STATIC_DEMO && new URLSearchParams(location.search).get("preview")==="1") run();
