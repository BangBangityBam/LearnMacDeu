// Keep monotonically increasing build numbers for older installations and the worker.
const appVersion=53;
function releaseName(build){
  const sequence=build-45;
  return 'V.'+[Math.floor(sequence/10000),Math.floor(sequence/100)%100,sequence%100].map(n=>String(n).padStart(2,'0')).join('.');
}
const alphabetSort=new Intl.Collator(menuLocale,{sensitivity:'base',numeric:true}).compare;
const sections={
  basics:'Grundwortschatz|Zahlen & Zeit|Verben|Adjektive & Kleinwörter|Handlungen|Eigenschaften|Gespräche|Sprachen|Uhren|Maßeinheiten',
  home:'Familie & Berufe|Haus & Kleidung|Gefühle & Alltag|Wohnen und Nachbarschaft|Menschen und Familie|Menschen und Geschichten|Freizeit und Familie|Kleidung und Zubehör|Haus und Schule|Haushalt und Alltag',
  work:'Arbeit & Bewerbung|Berufe|Reinigung|Metzgerei|Schule und Studium|Post und Schreibwaren|Bürobedarf|Werkzeuge',
  food:'Einkaufen & Restaurant|Küche & Essen|Einkäufe und Küche|Obst und Gemüse|Speisen|Getränke|Küchengeräte',
  world:'Unterwegs & Reisen|Reiseplanung|Bauwerke und Orte|Fahrzeuge und Verkehr|Länder und Gebiete|Währungen|Zeichen und Hinweise',
  nature:'Natur & Tiere|Umwelt und Landschaft|Tierwelt|Pflanzen|Landschaften|Wetter und Weltall',
  leisure:'Orte & Sport|Kultur und Veranstaltungen|Feste und Feiern|Sport und Ausrüstung|Freizeit und Kunst|Musik und Klang|Gestaltung und Fotografie',
  health:'Körper & Arzt|Gesundheit und Pflege|Körper und Pflege|Wissenschaft und Medizin',
  tech:'Ämter & Internet|Masse & Technik|Elektronik|Digitaler Alltag'
};
const sectionFor=new Map(Object.entries(sections).flatMap(([group,list])=>list.split('|').map(name=>[name,group])));
function categoryPicker(){
  const box=$('catlist'), query=norm($('categoryQuery').value);
  box.replaceChildren();
  const entries=CATS.map(([key])=>({key,label:categoryName(key),group:customCategories.includes(key)?'personal':sectionFor.get(key)||'basics'}));
  const shortcuts=[{key:'*',label:ui('all')},{key:'♥',label:ui('fav')},{key:'Eigene Wörter',label:ui('own')}];
  const sorted=items=>items.sort((a,b)=>alphabetSort(a.label,b.label));
  function button(parent,entry){
    const rows=pool(entry.key),b=document.createElement('button'),count=document.createElement('small');
    b.type='button';b.textContent=entry.label;b.disabled=!rows.length;
    count.textContent=ui('catCount',rows.length,rows.filter(w=>(mast[w[0]]||0)>=3).length);
    b.appendChild(count);b.onclick=()=>go(entry.key);parent.appendChild(b);
  }
  if(query){
    const found=sorted(shortcuts.concat(entries).filter(e=>norm(e.label).includes(query)||(e.group&&norm(ui(e.group)).includes(query))));
    found.forEach(e=>button(box,e));if(!found.length)box.textContent=ui('noHits');
    return;
  }
  sorted(shortcuts).forEach(e=>button(box,e));
  const groups=[...new Set(entries.map(e=>e.group))].sort((a,b)=>alphabetSort(ui(a),ui(b)));
  for(const group of groups){
    const details=document.createElement('details'),heading=document.createElement('summary');
    heading.textContent=ui(group);details.appendChild(heading);
    sorted(entries.filter(e=>e.group===group)).forEach(e=>button(details,e));
    box.appendChild(details);
  }
}
const intervals=[1,3,7,14,30];
function calendarDay(now=new Date()){return Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000}
function initSchedule(){
  const prior=load('vt_schedule',null);
  if(prior)return Object.assign(Object.create(null),prior);
  const result=Object.create(null);
  // Earlier versions recorded mastery but no practice dates. Introduce known words gradually.
  [...new Set([...Object.keys(mast),...Object.keys(wrong)])].forEach((key,i)=>{
    const level=Math.max(0,Math.min(intervals.length,wrong[key]?0:(mast[key]||0)));
    result[key]=[level,calendarDay()+(level?i%intervals[level-1]:0)];
  });
  if(Object.keys(result).length)save('vt_schedule',result);
  return result;
}
function scheduleAnswer(key,ok){
  const level=ok?Math.min(intervals.length,(schedule[key]?.[0]||0)+1):0;
  schedule[key]=[level,calendarDay()+(level?intervals[level-1]:1)];
  save('vt_schedule',schedule);
}
function isDue(w,day){return !!schedule[w[0]]&&schedule[w[0]][1]<=day}
let alphabetPreferred=false;
function editAnswer(text,backspace=false){
  const input=$('tin');
  if($('alphabetKeys').hidden || !input.readOnly)return;
  let start=input.selectionStart;
  const end=input.selectionEnd;
  if(backspace && start===end && start>0){
    const before=Array.from(input.value.slice(0,start));
    start-=before[before.length-1].length;
  }
  input.setRangeText(text,start,end,'end');
  input.focus({preventScroll:true});
  saveTypedProgress();
}
function setupAlphabet(){
  const box=$('alphabetKeys');
  ['љњертѕуиопшѓ','асдфгхјклчќ','зџцвбнмж'].forEach((row,index)=>{
    Array.from(row).forEach((letter,col)=>{
      const b=document.createElement('button');b.type='button';b.textContent=letter;
      b.style.gridRow=String(index+1);b.style.gridColumn=(13-row.length+2*col)+' / span 2';
      b.onmousedown=e=>e.preventDefault();
      b.onclick=()=>editAnswer(letter);
      box.appendChild(b);
    });
  });
  $('alphabetSpace').onmousedown=$('alphabetDelete').onmousedown=e=>e.preventDefault();
  $('alphabetSpace').onclick=()=>editAnswer(' ');
  $('alphabetDelete').onclick=()=>editAnswer('',true);
  $('alphabetToggle').onclick=()=>{
    const input=$('tin'),start=input.selectionStart,end=input.selectionEnd;
    alphabetPreferred=box.hidden;
    input.blur();
    alphabetFor(true);
    if(alphabetPreferred){
      input.focus({preventScroll:true});
      input.setSelectionRange(start,end);
    }
  };
}
function alphabetFor(visible){
  const open=visible && alphabetPreferred,input=$('tin');
  input.readOnly=open;
  if(open)input.setAttribute('inputmode','none');
  else input.removeAttribute('inputmode');
  $('alphabetControls').hidden=!visible;
  $('alphabetKeys').hidden=$('alphabetActions').hidden=!open;
  $('alphabetToggle').setAttribute('aria-expanded',String(open));
}
function readyWorkerVersion(worker){
  return new Promise(resolve=>{
    if(!worker){resolve(0);return}
    const channel=new MessageChannel();
    const finish=n=>{clearTimeout(timer);channel.port1.close();resolve(n)};
    const timer=setTimeout(()=>finish(0),1500);
    channel.port1.onmessage=e=>finish(e.data?.version||0);
    worker.postMessage({type:'release-version'},[channel.port2]);
  });
}
async function checkRelease(button=$('bupdate'),msg=$('releaseStatus'),reload=$('reloadRelease')){
  button.disabled=true;reload.hidden=true;msg.textContent=ui('checking');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
    if(navigator.onLine===false)throw Error();
    const response=await fetch('./release.json',{cache:'no-store',signal:controller.signal});
    if(!response.ok)throw Error();
    const {version}=await response.json();
    if(!Number.isSafeInteger(version)||version<appVersion)throw Error();
    if(version===appVersion){msg.textContent=ui('currentRelease',releaseName(version));return}
    msg.textContent=ui('newRelease',releaseName(version));
    const reg=await navigator.serviceWorker?.getRegistration();
    if(reg){
      await reg.update();
      const end=Date.now()+20000;
      while(await readyWorkerVersion(reg.active)<version){
        if(Date.now()>end)throw Error();
        await new Promise(r=>setTimeout(r,350));
      }
    }
    reload.hidden=false;
  }catch{
    msg.textContent=ui(navigator.onLine===false?'updateOffline':'updateFailed');
  }finally{clearTimeout(timer);button.disabled=false}
}
Object.assign(uiMessages,{
  basics:['Language basics','Јазични основи','Sprache & Grundlagen','Basi della lingua','Bases de la langue'],
  home:['Home and daily life','Дом и секојдневие','Alltag & Zuhause','Casa e vita quotidiana','Maison et quotidien'],
  work:['Work and education','Работа и образование','Beruf & Arbeitswelt','Lavoro e formazione','Travail et formation'],
  food:['Food and shopping','Храна и купување','Essen & Einkaufen','Cibo e acquisti','Alimentation et achats'],
  world:['Travel and places','Патувања и места','Reisen & Orte','Viaggi e luoghi','Voyages et lieux'],
  nature:['Nature and environment','Природа и животна средина','Natur & Umwelt','Natura e ambiente','Nature et environnement'],
  leisure:['Culture and leisure','Култура и слободно време','Kultur & Freizeit','Cultura e tempo libero','Culture et loisirs'],
  health:['Health and science','Здравје и наука','Gesundheit & Wissenschaft','Salute e scienza','Santé et sciences'],
  tech:['Technology and services','Технологија и услуги','Technik & Dienstleistungen','Tecnologia e servizi','Technologie et services'],
  personal:['My categories','Мои категории','Eigene Kategorien','Le mie categorie','Mes catégories'],
  catQuery:['Search categories','Пребарај категории','Kategorie suchen','Cerca categorie','Rechercher une catégorie'],
  noHits:['No matches','Нема резултати','Keine Treffer','Nessun risultato','Aucun résultat'],
  todayReview:['Review today ({0})','Повтори денес ({0})','Heute wiederholen ({0})','Ripassa oggi ({0})','Réviser aujourd’hui ({0})'],
  noneDue:['Nothing due today.','Денес нема зборови за повторување.','Heute sind keine Wörter zur Wiederholung fällig.','Nessuna parola da ripassare oggi.','Aucun mot à réviser aujourd’hui.'],
  listen:['Listen','Слушни','Anhören','Ascolta','Écouter'],
  noVoice:['No voice available','Нема достапен глас','Keine Stimme verfügbar','Nessuna voce disponibile','Aucune voix disponible'],
  currentRelease:['You are up to date ({0}).','Ја имаш последната верзија ({0}).','Du bist auf dem neuesten Stand ({0}).','Hai la versione più recente ({0}).','Votre application est à jour ({0}).'],
  newRelease:['A new version is available ({0}).','Достапна е нова верзија ({0}).','Eine neue Version ist verfügbar ({0}).','È disponibile una nuova versione ({0}).','Une nouvelle version est disponible ({0}).'],
  updateOffline:['Cannot check for updates. No internet connection.','Не може да се провери ажурирањето. Нема интернет-врска.','Updateprüfung nicht möglich. Keine Internet Verbindung.','Impossibile verificare gli aggiornamenti. Nessuna connessione Internet.','Vérification impossible. Aucune connexion Internet.'],
  updateFailed:['Cannot check for updates. Please try again later.','Не може да се провери ажурирањето. Обиди се подоцна.','Updateprüfung nicht möglich. Bitte später erneut versuchen.','Impossibile verificare gli aggiornamenti. Riprova più tardi.','Vérification impossible. Réessayez plus tard.'],
  reloadRelease:['Reload now','Вчитај повторно','Jetzt neu laden','Ricarica ora','Recharger maintenant'],
  alphabet:['Macedonian keyboard','Македонска тастатура','Mazedonische Tastatur','Tastiera macedone','Clavier macédonien']
});

Object.assign(uiMessages,{
  dailyTitle:['Check for updates?','Да проверам дали има ажурирања?','Nach Updates suchen?','Verificare gli aggiornamenti?','Rechercher des mises à jour ?'],
  skipToday:['Skip today','Прескокни денес','Heute überspringen','Salta per oggi','Ignorer pour aujourd’hui'],
  remindLater:['Remind me later','Потсети ме подоцна','Später erinnern','Ricordamelo più tardi','Me le rappeler plus tard'],
  continueDaily:['Continue','Продолжи','Weiter','Continua','Continuer']
});
const reminderKey='ucenje.daily-update';
let reminderTime=0;
function setNextReminder(later,now=new Date()){
  const tomorrow=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
  reminderTime=later?now.getTime()+6*60*60*1000:tomorrow.getTime();
  try{localStorage.setItem(reminderKey,String(reminderTime))}catch{}
}
function maybeDailyUpdate(){
  const dialog=$('dailyUpdate');
  if(document.hidden||dialog.open||currentScreen()!=='menu'||!load('vt_welcome_seen',false)||!menuLocales.includes(savedMenuLocale))return;
  try{const saved=localStorage.getItem(reminderKey);if(saved!==null)reminderTime=Number(saved)||0}catch{}
  if(Date.now()<reminderTime)return;
  $('dailyVersion').textContent=releaseName(appVersion);
  $('dailyStatus').textContent='';
  for(const id of ['dailyCheck','dailySkip','dailyLater'])$(id).hidden=false;
  $('dailyDone').hidden=$('dailyReload').hidden=true;
  if(typeof dialog.showModal==='function'){dialog.showModal();setNextReminder(false)}
}
function setupDailyUpdate(){
  const dialog=$('dailyUpdate');
  const close=later=>{setNextReminder(later);dialog.close()};
  $('dailyLater').onclick=()=>close(true);
  $('dailySkip').onclick=()=>close(false);
  dialog.addEventListener('cancel',e=>{e.preventDefault();if(!$('dailyCheck').hidden)close(true);else dialog.close()});
  $('dailyCheck').onclick=async()=>{
    setNextReminder(false);
    for(const id of ['dailyCheck','dailySkip','dailyLater'])$(id).hidden=true;
    $('dailyDone').textContent=ui('continueDaily');$('dailyDone').hidden=false;$('dailyDone').focus();
    await checkRelease($('dailyCheck'),$('dailyStatus'),$('dailyReload'));
    if(!$('dailyReload').hidden)$('dailyDone').textContent=ui('voiceLater');
  };
  $('dailyDone').onclick=()=>dialog.close();
  $('dailyReload').onclick=()=>location.reload();
  window.addEventListener('pageshow',maybeDailyUpdate);
  document.addEventListener('visibilitychange',maybeDailyUpdate);
  maybeDailyUpdate();
}

uiMessages.spaceKey=['Space','Празно место','Leertaste','Spazio','Espace'];
uiMessages.deleteKey=['Backspace','Избриши','Löschen','Cancella','Effacer'];
