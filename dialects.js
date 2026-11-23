// Each entry links an attested local spelling to a specific sense in the glossary.
// Regional examples are not mechanical spelling rules.
const dialects = {
  dl:['Delčevski','Делчевски',{надвор:'вонка',куќа:'кашча',шпорет:'кофтор',врапче:'џингар',тоа:'това',зборувам:'думам'}],
  ku:['Kumanovski','Кумановски',{трева:'трава',рака:'рука',пат:'пут',волк:'вук',каде:'куде',торби:'торбе'}],
  te:['Tetovski','Тетовски',{јаболко:'јабука',трева:'трава',орев:'орав',пат:'пут',јаже:'јуже',многу:'млогу'}],
  pb:['Prilepsko-bitolski','Прилепско-битолски',{рака:'рака',фустан:'вустан',внатре:'натре',многу:'ногу'}],
  oh:['Ohridski','Охридски',{братучед:'брачед',пат:'път',врба:'върба',прсти:'пърсти',дрво:'дърво',волна:'вълна',жолто:'жълто',солза:'сълза',цвет:'цут'}],
  st:['Struški','Струшки',{цвет:'цут',сега:'сеа',луѓе:'луџе',јас:'јаска',чевли:'кондури',лубеница:'карпуз',диња:'пипун',пат:'път',врба:'върба',прсти:'пърсти',дрво:'дърво',волна:'вълна',жолто:'жълто',солза:'сълза'}],
  go:['Gostivarski','Гостиварски',{куќа:'куча',цвет:'цут',цена:'цена',пат:'път',врба:'върба',прсти:'пърсти',дрво:'дърво',волна:'вълна',жолто:'жълто',солза:'сълза','тој пишува':'тој пишуват'}],
  db:['Debarski','Дебарски',{рака:'рока',крв:'корв',пат:'път',врба:'върба',прсти:'пърсти',дрво:'дърво',волна:'вълна',жолто:'жълто',солза:'сълза'}],
  sv:['Skopsko-veleški','Скопско-велешки',{страв:'страв',човек:'човек',куќа:'куќа',рака:'ръка',во:'у',тие:'тија'}],
  re:['Gornoprespanski (Resen)','Горнопреспански (Ресен)',{знаеме:'знеме',пат:'път',врба:'върба',прсти:'пърсти',дрво:'дърво',волна:'вълна',жолто:'жълто',солза:'сълза',рака:'ръка'}]
};
const dialectGlosses = {
  надвор:['draußen','outside','fuori','dehors'],куќа:['Haus','house','casa','maison'],
  шпорет:['Küchenherd','cooking stove','cucina a fornelli','cuisinière'],врапче:['Spatz','sparrow','passero','moineau'],
  тоа:['das da','that','quello','cela'],зборувам:['ich spreche','I speak','io parlo','je parle'],
  трева:['Gras','grass','erba','herbe'],рака:['Hand','hand','mano','main'],пат:['Weg','road','strada','chemin'],
  волк:['Wolf','wolf','lupo','loup'],каде:['wo','where','dove','où'],торби:['Taschen','bags','borse','sacs'],
  јаболко:['Apfel','apple','mela','pomme'],орев:['Walnuss','walnut','noce','noix'],јаже:['Seil','rope','corda','corde'],
  многу:['viel','a lot','molto','beaucoup'],фустан:['Kleid','dress','vestito','robe'],внатре:['drinnen','inside','dentro','à l’intérieur'],
  братучед:['Cousin','male cousin','cugino','cousin'],цвет:['Blume','flower','fiore','fleur'],сега:['jetzt','now','adesso','maintenant'],
  луѓе:['Menschen','people','persone','gens'],јас:['ich','I','io','je'],чевли:['Schuhe','shoes','scarpe','chaussures'],
  лубеница:['Wassermelone','watermelon','anguria','pastèque'],диња:['Zuckermelone','muskmelon','melone','melon'],
  цена:['Preis','price','prezzo','prix'],'тој пишува':['er schreibt','he writes','lui scrive','il écrit'],
  крв:['Blut','blood','sangue','sang'],страв:['Angst','fear','paura','peur'],човек:['Mensch','human being','essere umano','être humain'],
  во:['in','in','in','dans'],тие:['jene','those','quelli','ceux-là'],врба:['Weide (Baum)','willow','salice','saule'],прсти:['Finger (Mehrzahl)','fingers','dita','doigts'],дрво:['Baum','tree','albero','arbre'],волна:['Wolle','wool','lana','laine'],жолто:['gelb','yellow','giallo','jaune'],солза:['Träne','tear','lacrima','larme'],знаеме:['wir wissen','we know','noi sappiamo','nous savons']
};
const dialectUI = {
  title:['Macedonian dialects','Македонски дијалекти','Mazedonische Dialekte','Dialetti macedoni','Dialectes macédoniens'],
  standard:['Standard Macedonian','Стандарден македонски','Standardmazedonisch','Macedone standard','Macédonien standard'],
  partner:['Learn with','Учи со','Lernen mit','Impara con','Apprendre avec'],
  forms:['Documented forms','Забележани форми','Belegte Formen','Forme documentate','Formes attestées'],
  diff:['Practise dialect differences','Вежбај ги дијалектните разлики','Dialektunterschiede üben','Esercita le differenze dialettali','Travailler les différences dialectales'],
  full:['Full vocabulary','Цел речник','Gesamter Wortschatz','Tutto il vocabolario','Tout le vocabulaire'],
  missing:['Standard form · regional form unverified','Стандардна форма · дијалектната не е потврдена','Standardform · Dialektform ungeprüft','Forma standard · forma locale da verificare','Forme standard · forme locale à vérifier'],
  same:['Same written form','Иста пишана форма','Gleiche Schreibweise','Stessa grafia','Même orthographe'],
  filter:['Vocabulary','Речник','Wortschatz','Vocabolario','Vocabulaire']
};
function dialectText(key){return dialectUI[key][localeIndex]}
function dialectName(id){return dialects[id][menuLocale==='mk'?1:0]}
function progressKey(word){return word.progressKey || word[0]}
function dialectNote(word){
  if(!dialectId || !word.status)return '';
  return ' · '+dialectText({fallback:'missing',same:'same',different:'forms'}[word.status]);
}
function buildDialectDeck(){
  const local=dialects[dialectId][2], mkSide=codes.indexOf('mk'), counts=new Set();
  const foreignColumn=targets.indexOf(partner);
  function project(row){
    const standard=row[mkSide], key=catalogKey(standard), foreign=row[1-mkSide];
    const known=Object.hasOwn(local,key) && (partner==='mk' || catalogKey(foreign)===catalogKey(dialectGlosses[key][foreignColumn]));
    const word=[partner==='mk'?standard:foreign,known?local[key]:standard,row[2]];
    word.progressKey='base:'+row[0];
    word.status=known?(local[key]===key?'same':'different'):'fallback';
    if(known)counts.add(key);
    return word;
  }
  ALL=ALL.map(project);
  for(const [category,deck] of categoryDecks)categoryDecks.set(category,deck.map(project));
  for(const [key,form] of Object.entries(local)){
    if(counts.has(key))continue;
    const word=[partner==='mk'?key:dialectGlosses[key][foreignColumn],form,'Grundwortschatz'];
    word.status=key===form?'same':'different';
    word.progressKey='form:'+key;
    ALL.push(word);categoryDecks.get(word[2]).push(word);
  }
}
function setupDialectMenu(){
  const variant=$('dialectList'),course=$('pairList'),scope=$('dialectScope');
  $('dialectLabel').textContent=dialectText('title');
  variant.add(new Option(dialectText('standard'),'mk'));
  for(const id of Object.keys(dialects).sort((a,b)=>alphabetSort(dialectName(a),dialectName(b))))variant.add(new Option(dialectName(id),id));
  variant.value=dialectId||'mk';
  variant.onchange=()=>switchPair(variant.value==='mk'?pairList[Math.max(0,targets.indexOf(partner||target))]:(partner||target)+'-'+variant.value);
  if(!dialectId)return;
  $('dialectMenu').open=true;
  $('dialectLabel').textContent+=' · '+dialectName(dialectId);
  document.querySelector('label[for="pairList"]').textContent=dialectText('partner');
  course.replaceChildren();
  for(const code of [...targets,'mk'])course.add(new Option(code==='mk'?dialectText('standard'):languageName(code),code+'-'+dialectId));
  course.value=pairId;
  $('dialectOptions').hidden=false;
  $('dialectScopeLabel').textContent=dialectText('filter');
  for(const [value,label] of [['different','diff'],['verified','forms'],['all','full']]){
    const count=ALL.filter(w=>value==='all'||(value==='verified'?w.status!=='fallback':w.status==='different')).length;
    scope.add(new Option(dialectText(label)+' ('+count+')',value));
  }
  scope.value=dialectScope;
  scope.onchange=()=>{if(save('vt_dialect_scope',scope.value))location.reload()};
}
