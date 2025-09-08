
// app logic: offline-friendly, device-local storage, 8-hour target indication
let records = JSON.parse(localStorage.getItem('records')||'[]');
let currentIdx = null;
let timer = null;
const TARGET_SECONDS = 8*3600; // 8 hours

function normalizeTime(val){
  if(!val) return '';
  const parts = val.split(':');
  if(parts.length ===2) return parts[0].padStart(2,'0')+':'+parts[1].padStart(2,'0')+':00';
  if(parts.length===3) return parts[0].padStart(2,'0')+':'+parts[1].padStart(2,'0')+':'+parts[2].padStart(2,'0');
  return '';
}
function parseTimeToSeconds(timeStr){
  if(!timeStr) return null;
  const parts = timeStr.split(':').map(x=>Number(x));
  if(parts.length<2 || parts.some(isNaN)) return null;
  const [h,m,s] = [parts[0]||0,parts[1]||0,parts[2]||0];
  return h*3600 + m*60 + s;
}
function formatSeconds(sec){
  if(isNaN(sec)||sec<0) sec=0;
  sec = Math.floor(sec);
  const h = String(Math.floor(sec/3600)).padStart(2,'0');
  const m = String(Math.floor((sec%3600)/60)).padStart(2,'0');
  const s = String(sec%60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}
function save(){
  localStorage.setItem('records', JSON.stringify(records));
  renderTable();
  refreshState();
}
function initCurrent(){
  currentIdx = null;
  for(let i=records.length-1;i>=0;i--){
    if(records[i].punchIn && (!records[i].punchOut || records[i].punchOut.trim()==='')){ currentIdx = i; break; }
  }
}
function punchIn(){
  initCurrent();
  if(currentIdx!==null){ alert('Already punched in. Please punch out first.'); return; }
  const now = new Date();
  const rec = { date: now.toISOString().split('T')[0], punchIn: normalizeTime(now.toTimeString().substring(0,8)), punchOut: '' };
  records.push(rec); save();
}
function punchOut(){
  initCurrent();
  if(currentIdx===null){ alert('Not punched in.'); return; }
  const now = new Date();
  records[currentIdx].punchOut = normalizeTime(now.toTimeString().substring(0,8));
  currentIdx = null; save();
}
function updateRecord(i, field, rawVal){
  const val = normalizeTime(rawVal);
  records[i][field] = val;
  if(val==='') records[i][field]='';
  save();
}
function calculateTotalSeconds(){
  let total = 0;
  const now = new Date();
  const nowSecs = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
  for(const r of records){
    if(!r.punchIn) continue;
    const inSecs = parseTimeToSeconds(r.punchIn); if(inSecs===null) continue;
    let outSecs = null;
    if(r.punchOut && r.punchOut.trim()!=='') outSecs = parseTimeToSeconds(r.punchOut); else outSecs = nowSecs;
    if(outSecs===null) continue;
    if(outSecs < inSecs) outSecs += 24*3600;
    const diff = outSecs - inSecs;
    if(diff>0) total += diff;
  }
  return total;
}
function renderTable(){
  const tbody = document.querySelector('#recordsTable tbody');
  tbody.innerHTML='';
  records.forEach((r,i)=>{
    const tr = document.createElement('tr');
    const inVal = r.punchIn||''; const outVal = r.punchOut||'';
    tr.innerHTML = `<td><input type="time" step="1" value="${inVal}" onchange="updateRecord(${i}, 'punchIn', this.value)"></td>
                    <td><input type="time" step="1" value="${outVal}" onchange="updateRecord(${i}, 'punchOut', this.value)"></td>`;
    tbody.appendChild(tr);
  });
}
function refreshState(){
  initCurrent();
  const totalSecs = calculateTotalSeconds();
  const totalEl = document.getElementById('totalTime');
  totalEl.textContent = formatSeconds(totalSecs);
  const statusText = document.getElementById('statusText');
  const dot = document.getElementById('statusDot');
  const inBtn = document.getElementById('punchInBtn'), outBtn = document.getElementById('punchOutBtn');
  if(currentIdx!==null){
    dot.classList.remove('muted'); dot.classList.add('in');
    statusText.textContent = 'Punched In at ' + (records[currentIdx].punchIn||'');
    startTimer();
  } else {
    dot.classList.remove('in'); dot.classList.add('muted');
    statusText.textContent = 'Not Punched In';
    stopTimer();
  }
  // show target reached visually
  if(totalSecs >= TARGET_SECONDS){
    totalEl.textContent = formatSeconds(TARGET_SECONDS) + ' ✓'; // clamp and show check
    totalEl.style.boxShadow = '0 6px 18px rgba(16,185,129,0.18)';
    totalEl.style.background = 'linear-gradient(90deg,#ecfdf5,#f0fdf4)';
    // optionally stop live increment beyond 8h but keep records intact
    stopTimer();
  } else {
    totalEl.style.boxShadow = '';
    totalEl.style.background = '';
  }
  inBtn.style.display = currentIdx===null ? 'inline-flex' : 'none';
  outBtn.style.display = currentIdx!==null ? 'inline-flex' : 'none';
}
function startTimer(){ if(timer) return; timer = setInterval(()=>{ document.getElementById('totalTime').textContent = formatSeconds(calculateTotalSeconds()); if(calculateTotalSeconds()>=TARGET_SECONDS) refreshState(); },1000); }
function stopTimer(){ if(timer){ clearInterval(timer); timer=null; } }
function resetRecords(){ if(!confirm('Reset all records? This cannot be undone.')) return; records=[]; currentIdx=null; save(); }
function exportCSV(){
  let csv = 'punch_in,punch_out\\n'; records.forEach(r => { csv += `"${r.punchIn || ''}","${r.punchOut || ''}"\\n`; });
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'punch_records.csv'; a.click(); URL.revokeObjectURL(url);
}
window.punchIn=punchIn; window.punchOut=punchOut; window.updateRecord=updateRecord; window.resetRecords=resetRecords; window.exportCSV=exportCSV;
renderTable(); refreshState();
