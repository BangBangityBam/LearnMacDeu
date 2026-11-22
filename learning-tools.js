const appVersion=45;
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
function setupAlphabet(){
  const box=$('alphabetKeys'),letters='абвгдѓежзѕијклљмнњопрстќуфхцчџш';
  for(const letter of letters){
    const b=document.createElement('button');b.type='button';b.textContent=letter;
    b.onmousedown=e=>e.preventDefault();
    b.onclick=()=>{const input=$('tin');input.setRangeText(letter,input.selectionStart,input.selectionEnd,'end');input.focus();saveTypedProgress()};
    box.appendChild(b);
  }
  $('alphabetToggle').onclick=()=>{
    box.hidden=!box.hidden;$('alphabetToggle').setAttribute('aria-expanded',String(!box.hidden));
  };
}
function alphabetFor(visible){
  $('alphabetControls').hidden=!visible;$('alphabetKeys').hidden=true;
  $('alphabetToggle').setAttribute('aria-expanded','false');
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
async function checkRelease(){
  const button=$('bupdate'),msg=$('releaseStatus'),reload=$('reloadRelease');
  button.disabled=true;reload.hidden=true;msg.textContent=ui('checking');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
    if(navigator.onLine===false)throw Error();
    const response=await fetch('./release.json',{cache:'no-store',signal:controller.signal});
    if(!response.ok)throw Error();
    const {version}=await response.json();
    if(!Number.isSafeInteger(version)||version<appVersion)throw Error();
    if(version===appVersion){msg.textContent=ui('currentRelease',version);return}
    msg.textContent=ui('newRelease',version);
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
  recheck:['Check voices again','Провери ги гласовите повторно','Stimmen erneut prüfen','Ricontrolla le voci','Vérifier à nouveau les voix'],
  currentRelease:['You are up to date (v{0}).','Ја имаш последната верзија (v{0}).','Du bist auf dem neuesten Stand (v{0}).','Hai la versione più recente (v{0}).','Votre application est à jour (v{0}).'],
  newRelease:['A new version is available (v{0}).','Достапна е нова верзија (v{0}).','Eine neue Version ist verfügbar (v{0}).','È disponibile una nuova versione (v{0}).','Une nouvelle version est disponible (v{0}).'],
  updateOffline:['Cannot check for updates. No internet connection.','Не може да се провери ажурирањето. Нема интернет-врска.','Updateprüfung nicht möglich. Keine Internet Verbindung.','Impossibile verificare gli aggiornamenti. Nessuna connessione Internet.','Vérification impossible. Aucune connexion Internet.'],
  updateFailed:['Cannot check for updates. Please try again later.','Не може да се провери ажурирањето. Обиди се подоцна.','Updateprüfung nicht möglich. Bitte später erneut versuchen.','Impossibile verificare gli aggiornamenti. Riprova più tardi.','Vérification impossible. Réessayez plus tard.'],
  reloadRelease:['Reload now','Вчитај повторно','Jetzt neu laden','Ricarica ora','Recharger maintenant'],
  alphabet:['Macedonian keyboard','Македонска тастатура','Mazedonische Tastatur','Tastiera macedone','Clavier macédonien']
});
