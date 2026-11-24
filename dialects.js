// Each entry links an attested local spelling to a specific sense in the glossary.
// Regional examples are not mechanical spelling rules.
const dialects = {
  sm:['Strumički','Струмички',{јас:'јазе',ти:'тизе',зарем:'мер',летна:'фркна',домати:'френки',пиперки:'чушки',стомак:'курем',трошка:'ронка',надвор:'вонка',грав:'фасуљ',саксија:'цреп'}],
  be:['Berovski','Беровски',{виљушка:'бунела',јаглен:'ваглен',длабок:'дебок',тој:'он',сум:'сам'}],
  kp:['Krivopalanečki','Кривопаланечки',{јас:'ја',тој:'он',таа:'она',рака:'рука',пат:'пут',трева:'трава',во:'у',зборува:'зборуе',мравка:'брабинок',мравјалник:'брабинарник',скакулец:'скачка',стапица:'клуса',мисирка:'курка',мачор:'марок',раскрсница:'раскрсница'}],
  dl:['Delčevski','Делчевски',{надвор:'вонка',куќа:'кашча',шпорет:'кофтор',врапче:'џингар',нели:'еле',свеќи:'свешча',влегувам:'флазам',тоа:'това',зборувам:'думам'}],
  ku:['Kumanovski','Кумановски',{трева:'трава',рака:'рука',пат:'пут',волк:'вук',каде:'куде',торби:'торбе',тој:'он',јас:'ја',кога:'к’т',сега:'с’к',со:'сас',никогаш:'никад'}],
  te:['Tetovski','Тетовски',{јаболко:'јабука',трева:'трава',орев:'орав',пат:'пут',јаже:'јуже',многу:'млогу'}],
  pb:['Prilepsko-bitolski','Прилепско-битолски',{рака:'рака',фустан:'вустан',внатре:'натре',многу:'ногу'}],
  oh:['Ohridski','Охридски',{братучед:'брачед',пат:'п’т',врба:'в’рба',прсти:'п’рсти',дрво:'д’рво',волна:'в’лна',жолто:'ж’лто',солза:'с’лза',цвет:'цут'}],
  st:['Struški','Струшки',{цвет:'цут',сега:'сеа',луѓе:'луџе',јас:'јаска',чевли:'кондури',лубеница:'карпуз',диња:'пипун',пат:'п’т',врба:'в’рба',прсти:'п’рсти',дрво:'д’рво',волна:'в’лна',жолто:'ж’лто',солза:'с’лза'}],
  go:['Gostivarski','Гостиварски',{куќа:'куча',цвет:'цут',цена:'цена',пат:'п’т',врба:'в’рба',прсти:'п’рсти',дрво:'д’рво',волна:'в’лна',жолто:'ж’лто',солза:'с’лза','тој пишува':'тој пишуват'}],
  db:['Debarski','Дебарски',{рака:'рока',крв:'корв',пат:'п’т',врба:'в’рба',прсти:'п’рсти',дрво:'д’рво',волна:'в’лна',жолто:'ж’лто',солза:'с’лза'}],
  sv:['Skopsko-veleški','Скопско-велешки',{страв:'страв',човек:'човек',куќа:'куќа',рака:'р’ка',во:'у',тие:'тија'}],
  re:['Gornoprespanski (Resen)','Горнопреспански (Ресен)',{знаеме:'знеме',пат:'п’т',врба:'в’рба',прсти:'п’рсти',дрво:'д’рво',волна:'в’лна',жолто:'ж’лто',солза:'с’лза',рака:'р’ка'}]
};
const dialectGlosses = {
  мравка:['Ameise','ant','formica','fourmi'],
  мравјалник:['Ameisenhaufen','anthill','formicaio','fourmilière'],скакулец:['Heuschrecke','grasshopper','cavalletta','sauterelle'],
  стапица:['Falle','trap','trappola','piège'],мисирка:['Truthenne','turkey hen','tacchina','dinde'],
  мачор:['Kater','tomcat','gatto maschio','chat mâle'],раскрсница:['Kreuzung','crossroads','incrocio','carrefour'],
  домати:['Tomaten','tomatoes','pomodori','tomates'],пиперки:['Paprikaschoten','peppers','peperoni','poivrons'],
  стомак:['Bauch','belly','pancia','ventre'],трошка:['Krümel','crumb','briciola','miette'],грав:['Bohnen','beans','fagioli','haricots'],
  саксија:['Blumentopf','flowerpot','vaso da fiori','pot de fleurs'],нели:['nicht wahr','isn’t that so','non è vero','n’est-ce pas'],
  свеќи:['Kerzen','candles','candele','bougies'],влегувам:['ich trete ein','I enter','io entro','j’entre'],
  кога:['wann','when','quando','quand'],со:['mit','with','con','avec'],никогаш:['niemals','never','mai','jamais'],
  ти:['du','you (singular)','tu','tu'],зарем:['etwa (in einer Frage)','really (in a question)','forse (in una domanda)','vraiment (dans une question)'],
  летна:['flog los','flew off','prese il volo','prit son envol'],виљушка:['Gabel','fork','forchetta','fourchette'],
  јаглен:['Kohle','coal','carbone','charbon'],длабок:['tief','deep','profondo','profond'],
  тој:['er','he','lui','il'],таа:['sie (Einzahl)','she','lei','elle'],сум:['ich bin','I am','io sono','je suis'],
  зборува:['spricht','speaks','parla','parle'],
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
  return ' · '+dialectText({fallback:'missing',same:'same',different:'forms'}[word.status])+(word.site?' · '+word.site:'');
}
const atlasSites={go:'Вруток',te:'Теарце',sv:'Ракотинци',oh:'Пештани',pb:'Дихово',be:'Берово'};
function buildDialectDeck(){
  const local={...dialects[dialectId][2]}, glosses={...dialectGlosses};
  const fromAtlas=new Set();
  for(const [standard,translations,sites] of atlasVocabulary){
    if(!Object.hasOwn(sites,dialectId) || Object.hasOwn(local,standard))continue;
    local[standard]=sites[dialectId];glosses[standard]=translations;fromAtlas.add(standard);
  }
  const mkSide=codes.indexOf('mk'), counts=new Set();
  const foreignColumn=targets.indexOf(partner);
  function project(row){
    const standard=row[mkSide], key=catalogKey(standard), foreign=row[1-mkSide];
    const known=Object.hasOwn(local,key) && (partner==='mk' || catalogKey(foreign)===catalogKey(glosses[key][foreignColumn]));
    const word=[partner==='mk'?standard:foreign,known?local[key]:standard,row[2]];
    word.progressKey='base:'+row[0];
    word.standard=standard;word.partnerGloss=foreign;
    word.status=known?(local[key]===key?'same':'different'):'fallback';
    if(known){counts.add(key);if(fromAtlas.has(key))word.site=atlasSites[dialectId]}
    return word;
  }
  ALL=ALL.map(project);
  for(const [category,deck] of categoryDecks)categoryDecks.set(category,deck.map(project));
  for(const [key,form] of Object.entries(local)){
    if(counts.has(key))continue;
    const word=[partner==='mk'?key:glosses[key][foreignColumn],form,'Grundwortschatz'];
    word.status=key===form?'same':'different';
    word.progressKey='form:'+key;
    word.standard=key;word.partnerGloss=glosses[key][partner==='mk'?1:foreignColumn];
    if(fromAtlas.has(key))word.site=atlasSites[dialectId];
    ALL.push(word);categoryDecks.get(word[2]).push(word);
  }
}
function addLocalReadings(){
  const column=partner==='mk'?1:targets.indexOf(partner);
  const entries=new Map(localityVocabulary.filter(row=>row[2][dialectId]).map(([key,translations,sites])=>[key,{
    translation:translations[column], readings:sites[dialectId], cards:new Map(), answers:new Set()
  }]));
  function bind(word,global){
    const entry=entries.get(catalogKey(word.standard));
    if(!entry || catalogKey(word.partnerGloss)!==catalogKey(entry.translation))return;
    if(global)entry.cards.set(progressKey(word),word);
    const primary=entry.readings[0];
    if(word.status==='fallback'){
      word[1]=primary[0];word.site=primary[1];
      word.status=catalogKey(primary[0])===catalogKey(word.standard)?'same':'different';
    }
    entry.answers.add(word[1]);
    word.dialectAnswers=entry.answers;
  }
  ALL.forEach(word=>bind(word,true));
  for(const deck of categoryDecks.values())deck.forEach(word=>bind(word,false));
  for(const [standard,entry] of entries){
    const represented=new Set(Array.from(entry.cards.values(),card=>catalogKey(card[1])));
    const exemplar=entry.cards.values().next().value;
    const category=exemplar?exemplar[2]:'Grundwortschatz';
    for(const [form,site] of entry.readings){
      entry.answers.add(form);
      if(catalogKey(form)===standard || represented.has(catalogKey(form)))continue;
      represented.add(catalogKey(form));
      const word=[partner==='mk'?standard:entry.translation,form,category];
      word.progressKey='local:'+standard+':'+form;
      word.standard=standard;word.partnerGloss=entry.translation;
      word.site=site;word.status='different';word.dialectAnswers=entry.answers;
      ALL.push(word);categoryDecks.get(category).push(word);
    }
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
