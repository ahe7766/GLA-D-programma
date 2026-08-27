const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const KEY='glad_test_v3';
const OLD_KEY='glad_test_v2';
const EXERCISES=[
 {id:'1A',name:'Bekken liften',page:5,desc:[
  'Ga op uw rug liggen met de onderbenen op de oefenbal. Til de heupen van de grond en laat gecontroleerd terugzakken.',
  'Zoals niveau 1, maar met een langere lastarm: alleen de hakken rusten op de bal. Houd de knieën licht gebogen.',
  'Bekken liften met één been. Houd de heupen recht en voer de oefening voor beide benen uit.',
  'Bekken liften met de armen gekruist over de borst. Dit kan met één of twee benen op de bal.'
 ]},
 {id:'1B',name:'Sit-ups',page:6,desc:[
  'Lig op de rug met de onderbenen op de bal en de armen recht vooruit. Til de schouderbladen van de grond en zak terug.',
  'Zoals niveau 1, maar met de armen gekruist over de borstkas.',
  'Zoals niveau 1, maar met de armen achter het hoofd.',
  'Zoals voorgaande niveaus, maar met een gewicht in beide handen terwijl de schouderbladen van de grond komen.'
 ]},
 {id:'2A',name:'Achterwaarts glijden & lunges',page:7,desc:[
  'Sta op één been met het andere been op een handdoek of glijvlak. Schuif achterwaarts terwijl u de knie van het standbeen buigt. Houd heup, knie en enkel goed uitgelijnd.',
  'Zoals niveau 1, maar het gewichtdragende been staat op een oneffen ondergrond. Gebruik steun voor balans indien nodig.',
  'Maak een grote stap voor- of achterwaarts en buig de knie van het uitstapbeen. Houd heup, knie en enkel in één lijn.',
  'Zoals niveau 3, maar met gewichten in de handen.'
 ]},
 {id:'2B',name:'Zijwaarts glijden & lunges',page:8,desc:[
  'Sta op één been en schuif het andere been zijwaarts over een handdoek of glijvlak terwijl u het standbeen buigt.',
  'Zoals niveau 1, maar het gewichtdragende been staat op een oneffen ondergrond.',
  'Neem een grote stap opzij, buig de knie van het uitstapbeen en duw uzelf terug naar de uitgangspositie.',
  'Zoals niveau 3, maar met een weerstandsband om de enkels.'
 ]},
 {id:'3A',name:'Heup abductoren',page:9,desc:[
  'Sta met een lichte weerstandsband om het onderbeen. Til het buitenbeen zijwaarts op en houd romp en standbeen stabiel.',
  'Zoals niveau 1, maar met een gemiddelde of zware weerstandsband.',
  'Zoals niveau 1 en 2, maar staand op een oneffen ondergrond.',
  'Sta met een weerstandsband rond de enkels en til het vrije been zo ver mogelijk zijwaarts. Verzwaren kan door op een kussen te staan.'
 ]},
 {id:'3B',name:'Heup adductoren',page:10,desc:[
  'Sta met een lichte weerstandsband om het onderbeen en trek het been richting het standbeen. Houd romp en standbeen stabiel.',
  'Zoals niveau 1, maar met een gemiddelde of zware weerstandsband.',
  'Zoals niveau 1 en 2, maar staand op een oneffen ondergrond.',
  'Lig op de zij met het bovenste been ondersteund. Til het onderste been omhoog richting de stoel en laat gecontroleerd zakken.'
 ]},
 {id:'3C',name:'Knie buigers',page:11,desc:[
  'Zit voor op de stoel met een lichte weerstandsband rond de enkel. Trek het been naar achteren en buig de knie tegen de weerstand in.',
  'Zoals niveau 1, maar met een middelzware weerstandsband.',
  'Zoals niveau 1 en 2, maar met een zware weerstandsband.',
  'Zoals voorgaande niveaus, maar met een extra zware weerstandsband.'
 ]},
 {id:'3D',name:'Knie strekkers',page:12,desc:[
  'Zit met een weerstandsband onder het midden van de voet en houd beide uiteinden vast. Buig en strek de knie tegen de weerstand in.',
  'Zittend met een lichte weerstandsband om één voet. Duw naar voren door de knie te strekken.',
  'Zoals niveau 2, maar met een middelzware weerstandsband.',
  'Zoals niveau 2 en 3, maar met een zware weerstandsband.'
 ]},
 {id:'4A',name:'Opstaan uit de stoel',page:13,desc:[
  'Begin zittend met de voeten parallel en op schouderbreedte. Sta op met lichte handsteun en houd heup, knie en enkel goed uitgelijnd.',
  'Zoals niveau 1, maar zonder steun van de handen.',
  'Plaats de ene voet voor de andere en leg de nadruk op het achterste been tijdens het opstaan.',
  'Voer de oefening uit terwijl u gewichten vasthoudt met de ellebogen ongeveer 90 graden gebogen.'
 ]},
 {id:'4B',name:'Steps',page:14,desc:[
  'Stap op een lage step of trede, eventueel met steun voor balans. Stap achteruit terug en let op de uitlijning van heup, knie en enkel.',
  'Zoals niveau 1, maar met een middelhoge step.',
  'Zoals niveau 1 en 2, maar met een hoge step.',
  'Stap met één been op de step en beweeg met het andere been over de step en weer terug.'
 ]}
];
const STEPS=[{type:'warmup',name:'Opwarmen'},...EXERCISES.map(x=>({type:'exercise',id:x.id,name:x.name})),{type:'finish',name:'Afronden'}];
let state=loadState(); let activeDate=todayISO(); let stepIndex=0; let unlocked=false; let toastTimer;
function defaults(){return {profile:null,pinHash:null,sessions:{},levels:{},lastSaved:null}}
function loadState(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v)return {...defaults(),...v}; const old=JSON.parse(localStorage.getItem(OLD_KEY)||'null'); if(old){const n=defaults();n.profile=old.profile;n.pinHash=old.pinHash;n.sessions=old.sessions||{};Object.values(n.sessions).forEach(s=>Object.entries(s.exercises||{}).forEach(([id,e])=>{if(e.level)n.levels[id]=Number(e.level)}));return n}return defaults()}catch{return defaults()}}
function persist(msg=true){state.lastSaved=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));if(msg)flashSaved()}
function flashSaved(){const el=$('#saveIndicator'); if(!el)return;el.textContent='✓ Opgeslagen';el.classList.add('pulse');setTimeout(()=>el.classList.remove('pulse'),350)}
async function hash(v){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function todayISO(){return new Date().toISOString().slice(0,10)}
function fmtDate(s){return new Date(s+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'})}
function validPin(v){return /^\d{4,8}$/.test(v)}
function zone(n){n=Number(n);if(n<=2)return {key:'safe',face:'🙂',label:'Veilig'};if(n<=5)return {key:'accept',face:'😐',label:'Acceptabel'};return {key:'avoid',face:'☹️',label:'Vermijd'}}
function emptySession(date){return {date,status:'in_progress',step:0,painBefore:'',warmup:{minutes:10,effort:'Enigszins zwaar'},exercises:{},painAfter:'',painLater:'',painNextDay:'',pain24h:false,note:'',completedAt:null}}
function session(date=activeDate){return state.sessions[date]??=(emptySession(date))}
function exData(id){const s=session();return s.exercises[id]??=( {level:state.levels[id]||1,sets:2,reps:10,pain:''})}
function showView(id,title){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$('#pageTitle').textContent=title||({homeView:'Vandaag',statsView:'Statistiek',exportView:'Export',settingsView:'Instellingen'}[id]||'GLA:D');if(id==='homeView')renderHome();if(id==='statsView')renderStats();if(id==='exportView')renderExport();if(id==='historyView')renderHistory()}
function painButtons(container,value,onChange){container.innerHTML=Array.from({length:11},(_,i)=>{const z=zone(i);return `<button type="button" class="pain-btn ${String(i)===String(value)?'selected '+z.key:''}" data-v="${i}" aria-label="Pijn ${i}, ${z.label}">${i}</button>`}).join('');container.querySelectorAll('.pain-btn').forEach(b=>b.onclick=()=>onChange(Number(b.dataset.v)))}
function renderHome(){activeDate=todayISO();const s=session(activeDate);$('#todayLabel').textContent=new Date().toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'});const done=stepCompletionCount(s);$('#progressBadge').textContent=`${done}/${STEPS.length}`;$('#sessionSummary').textContent=s.status==='complete'?`Training afgerond • pijn na training ${s.painAfter||'–'}`:done?`Training gestart • ${done} van ${STEPS.length} onderdelen ingevuld`:'Nog geen training gestart.';$('#startResumeBtn').textContent=s.status==='complete'?'Training bekijken':done?'Training hervatten':'Start training';painButtons($('#homePainButtons'),s.painBefore,v=>{s.painBefore=v;persist();renderHome()});renderRecent();renderFollowup()}
function stepCompletionCount(s){let c=0;if(s.warmup?.minutes)c++;EXERCISES.forEach(e=>{const x=s.exercises?.[e.id];if(x&&(x.level||x.pain!==''))c++});if(s.status==='complete')c++;return c}
function renderRecent(){const arr=Object.values(state.sessions).filter(x=>x.status==='complete').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);$('#recentSessions').innerHTML=arr.length?arr.map(s=>`<div class="recent-row"><div><strong>${fmtDate(s.date)}</strong><small>Pijn vóór ${s.painBefore||'–'} • na ${s.painAfter||'–'} • volgende dag ${s.painNextDay||'–'}</small></div><div>${s.pain24h?'⚠️':'✓'}</div></div>`).join(''):'<p class="muted">Nog geen afgeronde trainingen.</p>'}
function renderFollowup(){const due=Object.values(state.sessions).filter(s=>s.status==='complete'&&s.date<todayISO()&&s.painNextDay==='').sort((a,b)=>b.date.localeCompare(a.date))[0];const box=$('#followupCard');if(!due){box.innerHTML='';return}box.innerHTML=`<div class="card followup-card"><div class="kicker">24-uurscontrole</div><h2>Hoe reageerde je heup op ${fmtDate(due.date)}?</h2><p class="muted">Vul de reactie van de volgende dag in.</p><div id="followPain" class="pain-scale"></div><label class="check-row"><input id="follow24" type="checkbox"> Verhoogde pijn hield langer dan 24 uur aan</label><button id="saveFollow" class="btn primary full">Opslaan</button></div>`;painButtons($('#followPain'),due.painNextDay,v=>{due.painNextDay=v});$('#follow24').checked=!!due.pain24h;$('#saveFollow').onclick=()=>{due.pain24h=$('#follow24').checked;persist();toast('24-uursreactie opgeslagen');renderHome()}}
function openTraining(){const s=session();stepIndex=Math.min(Number(s.step)||0,STEPS.length-1);showView('trainingView','Training');renderStep()}
function renderStep(){const s=session(),st=STEPS[stepIndex];s.step=stepIndex;persist(false);$('#stepText').textContent=`Stap ${stepIndex+1} van ${STEPS.length}`;$('#progressFill').style.width=`${((stepIndex+1)/STEPS.length)*100}%`;$('#prevStep').disabled=stepIndex===0;$('#nextStep').textContent=stepIndex===STEPS.length-1?'Afronden':'Volgende';if(st.type==='warmup')renderWarmup();else if(st.type==='exercise')renderExercise(st.id);else renderFinish()}
function renderWarmup(){const s=session();$('#stepContainer').innerHTML=`<div class="step-card"><div class="kicker">Opwarmen</div><h2>10 minuten hometrainer</h2><img class="step-image" src="assets/warmup.png" alt="Opwarmen op de hometrainer uit het GLA:D-handboek"><div class="instruction">Fiets 10 minuten op de hometrainer. Stel de weerstand individueel in en verhoog zo nodig richting een waargenomen inspanning van <strong>“enigszins zwaar”</strong>. Stel het zadel zo in dat de knie niet volledig gestrekt wordt.</div><div class="warmup-info"><label>Minuten<select id="warmMin"><option>5</option><option selected>10</option><option>15</option></select></label><label>Waargenomen inspanning<select id="warmEff"><option>Licht</option><option>Enigszins zwaar</option><option>Zwaar</option></select></label></div><div class="tip">Doel volgens het handboek: pijn en stijfheid verminderen en spieren en gewrichten voorbereiden op de oefeningen.</div></div>`;$('#warmMin').value=String(s.warmup?.minutes||10);$('#warmEff').value=s.warmup?.effort||'Enigszins zwaar';['warmMin','warmEff'].forEach(id=>$('#'+id).onchange=()=>{s.warmup={minutes:Number($('#warmMin').value),effort:$('#warmEff').value};persist()})}
function renderExercise(id){const e=EXERCISES.find(x=>x.id===id),x=exData(id),lvl=Number(x.level||1);$('#stepContainer').innerHTML=`<div class="step-card"><div class="kicker">Oefening ${e.id} • pagina ${e.page}</div><h2>${e.name}</h2><div class="level-tabs">${[1,2,3,4].map(n=>`<button class="level-tab ${n===lvl?'active':''}" data-lvl="${n}">Niveau ${n}</button>`).join('')}</div><img class="step-image" src="assets/p${String(e.page).padStart(2,'0')}-l${lvl}.png" alt="${e.id} ${e.name}, niveau ${lvl} uit het GLA:D-handboek"><div class="instruction">${e.desc[lvl-1]}</div><div class="field-grid"><label>Sets<select id="sets"><option>2</option><option>3</option></select></label><label>Herhalingen per set<select id="reps">${[10,11,12,13,14,15].map(n=>`<option>${n}</option>`).join('')}</select></label></div><div class="pain-panel"><div class="section-label">Pijn tijdens/deze oefening</div><div id="exPain" class="pain-scale"></div><div id="painResult"></div><div id="painWarning"></div></div></div>`;$('#sets').value=String(x.sets||2);$('#reps').value=String(x.reps||10);$$('.level-tab').forEach(b=>b.onclick=()=>{x.level=Number(b.dataset.lvl);state.levels[id]=x.level;persist();renderExercise(id)});$('#sets').onchange=()=>{x.sets=Number($('#sets').value);persist()};$('#reps').onchange=()=>{x.reps=Number($('#reps').value);persist()};painButtons($('#exPain'),x.pain,v=>{x.pain=v;persist();renderExercise(id)});renderPainFeedback(x.pain)}
function renderPainFeedback(v){const r=$('#painResult'),w=$('#painWarning');if(!r)return;if(v===''){r.innerHTML='';w.innerHTML='';return}const z=zone(v);r.innerHTML=`<span class="pain-result ${z.key}">${z.face} ${v} • ${z.label}</span>`;w.innerHTML=Number(v)>5?'<div class="warning-box"><strong>Pijn boven 5.</strong><br>Volgens het GLA:D-handboek is dan vaak aanpassing van de oefening in overleg met de fysiotherapeut nodig.</div>':''}
function renderFinish(){const s=session();$('#stepContainer').innerHTML=`<div class="step-card finish-card"><div class="finish-icon">✓</div><div class="kicker">Einde training</div><h2>Reactie direct na de training</h2><div id="afterPain" class="pain-scale"></div><div id="afterFeedback"></div><label>Opmerking<textarea id="note" placeholder="Bijv. stijfheid, napijn, lopen, slapen…"></textarea></label><p class="muted">De reactie later op de dag en de volgende dag kun je daarna apart registreren.</p></div>`;$('#note').value=s.note||'';painButtons($('#afterPain'),s.painAfter,v=>{s.painAfter=v;persist();renderFinish()});$('#note').oninput=()=>{s.note=$('#note').value;persist(false)};if(s.painAfter!==''){const z=zone(s.painAfter);$('#afterFeedback').innerHTML=`<span class="pain-result ${z.key}">${z.face} ${s.painAfter} • ${z.label}</span>`}}
function moveStep(delta){if(delta>0&&stepIndex===STEPS.length-1){const s=session();s.status='complete';s.completedAt=new Date().toISOString();s.step=0;persist();toast('Training opgeslagen');showView('homeView','Vandaag');return}stepIndex=Math.max(0,Math.min(STEPS.length-1,stepIndex+delta));session().step=stepIndex;persist(false);renderStep();window.scrollTo({top:0,behavior:'smooth'})}
function renderStats(){const arr=Object.values(state.sessions).filter(s=>s.status==='complete').sort((a,b)=>a.date.localeCompare(b.date));$('#statSessions').textContent=arr.length;const pains=arr.map(s=>Number(s.painAfter)).filter(Number.isFinite);$('#statPain').textContent=pains.length?(pains.reduce((a,b)=>a+b,0)/pains.length).toFixed(1):'–';$('#stat24h').textContent=arr.filter(s=>s.pain24h).length;$('#painBars').innerHTML=arr.length?arr.slice(-8).map(s=>`<div class="bar-row"><small>${fmtDate(s.date)}</small><div class="bar-track"><div class="bar-fill" style="width:${(Number(s.painAfter||0)/10)*100}%"></div></div><strong>${s.painAfter||'–'}</strong></div>`).join(''):'<p class="muted">Nog geen gegevens.</p>';$('#levelList').innerHTML=EXERCISES.map(e=>`<div class="level-row"><span>${e.id} ${e.name}</span><strong>Niveau ${state.levels[e.id]||1}</strong></div>`).join('')}
function weekStart(ds){const d=new Date(ds+'T12:00:00'),x=new Date(d);x.setDate(d.getDate()-((d.getDay()+6)%7));return x}function weekSessions(ds){const st=weekStart(ds),en=new Date(st);en.setDate(st.getDate()+6);return Object.values(state.sessions).filter(s=>s.status==='complete').filter(s=>{const d=new Date(s.date+'T12:00:00');return d>=st&&d<=en}).sort((a,b)=>a.date.localeCompare(b.date))}
function csv(){const rows=[['Datum','Pijn voor','Pijn na','Pijn volgende dag','Pijn >24u','Oefening','Niveau','Sets','Herhalingen','Pijn oefening','Opmerking']];weekSessions($('#exportWeek').value||todayISO()).forEach(s=>EXERCISES.forEach(e=>{const x=s.exercises?.[e.id];if(x)rows.push([s.date,s.painBefore,s.painAfter,s.painNextDay,s.pain24h?'Ja':'Nee',`${e.id} ${e.name}`,x.level,x.sets,x.reps,x.pain,s.note||''])}));return rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\n')}
function renderExport(){$('#exportWeek').value=$('#exportWeek').value||todayISO();$('#exportPreview').textContent=csv().split('\n').slice(0,14).join('\n')}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},400)}
function renderHistory(){const arr=Object.values(state.sessions).filter(s=>s.status==='complete').sort((a,b)=>b.date.localeCompare(a.date));$('#historyList').innerHTML=arr.length?arr.map(s=>`<div class="history-card"><div class="row"><strong>${fmtDate(s.date)}</strong><span>${s.pain24h?'⚠️ >24u':'✓'}</span></div><small>Pijn vóór ${s.painBefore||'–'} • na ${s.painAfter||'–'} • volgende dag ${s.painNextDay||'–'}</small></div>`).join(''):'<p class="muted">Nog geen trainingshistorie.</p>'}
function toast(t){clearTimeout(toastTimer);$('#toast').textContent=t;$('#toast').classList.remove('hidden');toastTimer=setTimeout(()=>$('#toast').classList.add('hidden'),2200)}
function init(){if(!state.profile||!state.pinHash){$('#setup').classList.remove('hidden');return}$('#lock').classList.remove('hidden')}
function enterApp(){unlocked=true;$('#setup').classList.add('hidden');$('#lock').classList.add('hidden');$('#app').classList.remove('hidden');$('#profileName').value=state.profile?.name||'';$('#profileDob').value=state.profile?.dob||'';showView('homeView','Vandaag')}
$('#finishSetup').onclick=async()=>{const name=$('#setupName').value.trim(),dob=$('#setupDob').value,pin=$('#setupPin').value;if(!name||!dob||!validPin(pin)){ $('#setupError').textContent='Vul naam, geboortedatum en een pincode van 4–8 cijfers in.';return}state.profile={name,dob};state.pinHash=await hash(pin);persist(false);enterApp()};
$('#unlock').onclick=async()=>{if(await hash($('#loginPin').value)===state.pinHash){$('#loginError').textContent='';enterApp()}else $('#loginError').textContent='Onjuiste pincode.'};$('#loginPin').addEventListener('keydown',e=>{if(e.key==='Enter')$('#unlock').click()});
$('#startResumeBtn').onclick=openTraining;$('#backHome').onclick=()=>showView('homeView','Vandaag');$('#prevStep').onclick=()=>moveStep(-1);$('#nextStep').onclick=()=>moveStep(1);$('#openHistory').onclick=()=>showView('historyView','Historie');$('#historyBack').onclick=()=>showView('homeView','Vandaag');
$$('.nav-btn').forEach(b=>b.onclick=()=>showView(b.dataset.view));
$('#exportWeek').onchange=renderExport;$('#downloadReport').onclick=()=>downloadBlob(new Blob(['\ufeff'+csv()],{type:'text/csv;charset=utf-8'}),'GLAD-weekrapport-'+($('#exportWeek').value||todayISO())+'.csv');$('#shareReport').onclick=async()=>{const f=new File(['\ufeff'+csv()],'GLAD-weekrapport.csv',{type:'text/csv'});if(navigator.share&&navigator.canShare?.({files:[f]}))await navigator.share({title:'GLA:D weekrapport',files:[f]});else downloadBlob(f,'GLAD-weekrapport.csv')};$('#backupBtn').onclick=()=>downloadBlob(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),'GLAD-backup-'+todayISO()+'.json');$('#restoreFile').onchange=async e=>{try{const x=JSON.parse(await e.target.files[0].text());if(!x.profile||!x.sessions)throw 0;state={...defaults(),...x};persist();enterApp();toast('Back-up hersteld')}catch{alert('Geen geldige GLA:D-back-up.')}};
$('#saveProfile').onclick=()=>{state.profile={name:$('#profileName').value.trim(),dob:$('#profileDob').value};persist();toast('Profiel opgeslagen')};$('#changePin').onclick=async()=>{const p=$('#newPin').value;if(!validPin(p))return alert('Gebruik 4–8 cijfers.');state.pinHash=await hash(p);$('#newPin').value='';persist();toast('Pincode gewijzigd')};$('#lockNow').onclick=()=>{persist(false);unlocked=false;$('#app').classList.add('hidden');$('#lock').classList.remove('hidden');$('#loginPin').value=''};
window.addEventListener('beforeunload',()=>{if(unlocked)localStorage.setItem(KEY,JSON.stringify(state))});if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});init();
