const hasEllipsis=text=>/…|\.{3}/u.test(text);
const isQuestion=text=>/[?？]/u.test(text);
function choiceFilter(card){
  const question=isQuestion(card.a)||isQuestion(card.q);
  const ellipsis=hasEllipsis(card.a)||hasEllipsis(card.q);
  return text=>question===isQuestion(text)&&ellipsis===hasEllipsis(text);
}

// The built-in courses have only two questions with an ellipsis.
// These answer-language examples fill the remaining slots where needed.
const extraGapQuestions={
  mk:['Кога почнува …?','Колку чини …?','Кој го нарача …?','Колку долго трае …?','Каде можам да купам …?'],
  de:['Wann beginnt …?','Was kostet …?','Wer hat … bestellt?','Wie lange dauert …?','Wo kann ich … kaufen?'],
  en:['When does … start?','How much is …?','Who ordered …?','How long does … take?','Where can I buy …?'],
  it:['Quando inizia …?','Quanto costa …?','Chi ha ordinato …?','Quanto dura …?','Dove posso comprare …?'],
  fr:['Quand commence … ?','Combien coûte … ?','Qui a commandé … ?','Combien de temps dure … ?','Où puis-je acheter … ?']
};
// Match alternatives in the answer language. Never offer another translation
// of the same prompt, including an explicitly accepted synonym, as a mistake.
function matchingOptions(card){
  const source=card.forward?0:1, dest=1-source, all=pool('*');
  const matches=choiceFilter(card);
  const gapCard=hasEllipsis(card.q)||hasEllipsis(card.a);
  const shape=s=>{
    const tokens=s.match(/[\p{L}\p{M}\p{N}]+(?:['’\-][\p{L}\p{M}\p{N}]+)*/gu)||[];
    return [tokens.length,(s.match(/\p{L}/gu)||[]).length];
  };
  const excluded=acceptedAnswers(card), prompt=norm(card.q);
  all.forEach(w=>{if(norm(w[source])===prompt)excluded.add(norm(w[dest]))});
  const [length,letters]=shape(card.a);
  const candidates=new Map();
  function consider(answer,category){
    if(!matches(answer))return;
    const key=norm(answer);
    if(!key||excluded.has(key))return;
    const [wc,lc]=shape(answer);
    const score=Math.abs(wc-length)*4+Math.abs(lc-letters)/Math.max(2,letters/4)+(category===card.cat&&wc===length&&Math.abs(lc-letters)<=Math.max(3,letters/3)?-5:0)+Math.random();
    if(!candidates.has(key)||score<candidates.get(key).score)candidates.set(key,{answer,score,wordGap:Math.abs(wc-length),letterGap:Math.abs(lc-letters)});
  }
  for(const w of all)consider(w[dest],w[2]);
  if(candidates.size<3 && matches('…?')){
    for(const answer of (extraGapQuestions[codes[dest]]||[]))consider(answer,null);
  }
  const result=Array.from(candidates.values()).sort((a,b)=>gapCard?(a.wordGap-b.wordGap||a.letterGap-b.letterGap||a.score-b.score):a.score-b.score).slice(0,3).map(x=>x.answer);
  result.splice(Math.floor(Math.random()*(result.length+1)),0,card.a);
  return result;
}

function rememberCard(){
  if(!session)return;
  const item=curMode==='learn'?cur:tcur;
  if(!item)return;
  if(session.order!==order){
    session.deck=words.map(progressKey);
    session.order=order;
  }
  session.pos=pos;session.forward=item.forward;
  session.revealed=curMode==='learn'&&shown;
  session.round=rnd;
  session.choices=curMode==='mc'?Array.from($('topts').children,b=>b.dataset.answer??b.textContent):[];
  save('vt_session',session);
}

function resumeStudy(){
  if(!session)return;
  curMode=session.mode;activeCategory=session.category;
  words=pool(activeCategory);
  const saved=session;
  // Older releases saved only the position. Start a new order for those rounds.
  if(!Array.isArray(saved.deck)||!Array.isArray(saved.order)||!saved.pos){
    shuffle();pos=Math.min(saved.pos||0,Math.max(0,order.length-1));rnd={n:0,ok:0,miss:[]};
    show(curMode==='learn'?'learn':'type');if(curMode==='learn')next();else nextType();
    return;
  }
  const available=new Map(unfilteredPool('*').map(w=>[progressKey(w),w]));
  words.forEach(w=>available.set(progressKey(w),w));
  const restored=saved.deck.map(k=>available.get(k));
  // Remap surviving indices if a custom word was removed between sessions.
  const indices=new Map();words=[];
  restored.forEach((w,i)=>{if(w){indices.set(i,words.length);words.push(w)}});
  const prior=saved.order.slice(0,saved.pos-1);
  pos=prior.filter(i=>indices.has(i)).length;
  order=saved.order.filter(i=>indices.has(i)).map(i=>indices.get(i));
  const sameCard=indices.has(saved.order[saved.pos-1]);
  rnd=saved.round||{n:0,ok:0,miss:[]};
  const state=sameCard?Object.assign({},saved):null;
  if(curMode==='learn'){
    show('learn');next(null,state);
    if(state&&state.revealed)tap();
  }else{
    show('type');nextType(state);
  }
}

let studyAudio;
function feedbackTone(ctx,type,pitch,endPitch,start,duration,gain,attack){
  const tone=ctx.createOscillator(),volume=ctx.createGain(),end=start+duration;
  tone.type=type;tone.frequency.setValueAtTime(pitch,start);
  tone.frequency.exponentialRampToValueAtTime(endPitch,end);
  volume.gain.setValueAtTime(0.0001,start);
  volume.gain.exponentialRampToValueAtTime(gain,start+attack);
  volume.gain.exponentialRampToValueAtTime(0.0001,end);
  tone.connect(volume);volume.connect(ctx.destination);
  tone.onended=()=>{tone.disconnect();volume.disconnect()};
  tone.start(start);tone.stop(end+0.01);
}
function playAnswerSound(ctx,ok){
  const now=ctx.currentTime;
  if(ok){
    feedbackTone(ctx,'triangle',850,915,now,0.10,0.24,0.006);
    feedbackTone(ctx,'sine',1568,1558,now+0.10,0.48,0.32,0.004);
    feedbackTone(ctx,'sine',3595,3570,now+0.10,0.21,0.105,0.004);
  }else{
    // Add the octave and fifth above each note for a mellow brass timbre.
    for(const [delay,hz,length] of [[0,247,0.20],[0.205,185,0.36]]){
      feedbackTone(ctx,'sawtooth',hz,hz*0.95,now+delay,length,0.22,0.035);
      feedbackTone(ctx,'triangle',hz*2,hz*1.9,now+delay,length,0.13,0.032);
      feedbackTone(ctx,'sine',hz*3,hz*2.85,now+delay,length,0.08,0.038);
    }
  }
}
function signalAnswer(ok){
  if(load('vt_vibration',true)&&typeof navigator.vibrate==='function'){
    try{navigator.vibrate(ok?125:[155,90,185])}catch(e){}
  }
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio||!load('vt_sound',true))return;
  try{
    studyAudio=studyAudio||new Audio();
    if(studyAudio.state==='suspended'){
      studyAudio.resume().then(()=>playAnswerSound(studyAudio,ok)).catch(()=>{});
    }else playAnswerSound(studyAudio,ok);
  }catch(e){}
}
Object.assign(uiMessages,{
  settings:['Settings','Поставки','Einstellungen','Impostazioni','Réglages'],
  sounds:['Answer sounds','Звуци за одговори','Antworttöne','Suoni delle risposte','Sons de réponse'],
  vibration:['Vibration','Вибрации','Vibration','Vibrazione','Vibration'],
  vibUnsupported:['This browser does not offer vibration.','Овој прелистувач не нуди вибрации.','Dieser Browser unterstützt keine Vibration.','Questo browser non supporta la vibrazione.','Ce navigateur ne propose pas de vibration.'],
  previewRight:['Try correct answer','Пробај точен одговор','Ausprobieren · richtige Antwort','Prova risposta corretta','Tester une bonne réponse'],
  previewWrong:['Try incorrect answer','Пробај неточен одговор','Ausprobieren · falsche Antwort','Prova risposta errata','Tester une mauvaise réponse'],
  voiceIntro:['Set up pronunciation','Постави го изговорот','Sprachausgabe einrichten','Configura la pronuncia','Configurer la prononciation'],
  voiceIntroText:['Check the voices for your course and listen to a sample.','Провери ги гласовите за курсот и слушни пример.','Prüfe die Stimmen für deinen Kurs und höre einen Beispielsatz.','Verifica le voci del corso e ascolta un esempio.','Vérifiez les voix de votre cours et écoutez un exemple.'],
  voiceNow:['Check now','Провери сега','Jetzt prüfen','Controlla ora','Vérifier maintenant'],
  voiceLater:['Later','Подоцна','Später','Più tardi','Plus tard'],
  voiceGuide:['How to add a voice','Како да додадеш глас','So fügst du eine Stimme hinzu','Come aggiungere una voce','Comment ajouter une voix'],
  voiceUnavailable:['No {0} voice is available to Učenje jazici - Учење јазици right now.','Во моментов Učenje jazici - Учење јазици нема достапен глас за {0}.','Für {0} ist in Učenje jazici - Учење јазици gerade keine Stimme verfügbar.','Al momento Učenje jazici - Учење јазици non ha una voce disponibile per {0}.','Učenje jazici - Учење јазици ne dispose actuellement d’aucune voix pour cette langue ({0}).'],
  androidGuide:['Android: In Settings, search for “Text-to-speech output”. Open the engine settings, then “Install voice data”. Choose an available language, return here to listen.','Android: Во поставките побарај „Текст во говор“. Отвори ги поставките на говорниот систем и избери да инсталираш гласовни податоци. Избери достапен јазик, врати се за да го слушнеш гласот.','Android: Suche in den Einstellungen nach „Text-in-Sprache-Ausgabe“. Öffne die Einstellungen der Sprach-Engine und wähle „Sprachdaten installieren“. Wähle eine verfügbare Sprache, kehre zurück und höre dir die Stimme an.','Android: cerca “Sintesi vocale” nelle impostazioni. Apri le impostazioni del motore e scegli di installare i dati vocali. Seleziona una lingua disponibile, torna qui per ascoltarla.','Android : recherchez la synthèse vocale dans les réglages. Dans les réglages du moteur, installez les données vocales pour une langue disponible, puis revenez écouter la voix.'],
  iosGuide:['iPhone: Open Settings → Accessibility → Read & Speak (or Spoken Content) → Voices. Choose a language and download an available voice. Return here to listen.','iPhone: Отвори Поставки → Пристапност → Читање и говор → Гласови. Избери јазик и преземи достапен глас, па врати се за да го слушнеш гласот.','iPhone: Öffne Einstellungen → Bedienungshilfen → Lesen & Sprechen (oder Gesprochene Inhalte) → Stimmen. Wähle die Sprache und lade eine verfügbare Stimme. Kehre zurück und höre dir die Stimme an.','iPhone: apri Impostazioni → Accessibilità → Lettura e voce (o Contenuto letto ad alta voce) → Voci. Scegli la lingua, scarica una voce disponibile e torna qui per ascoltarla.','iPhone : ouvrez Réglages → Accessibilité → Lire et énoncer (ou Contenu énoncé) → Voix. Choisissez la langue, téléchargez une voix disponible et revenez écouter la voix.']
});
uiCategoryNames.Reinigung=['Professional cleaning','Професионално чистење','Reinigung','Pulizie professionali','Nettoyage professionnel'];
uiCategoryNames.Metzgerei=['Butchery','Месарство','Metzgerei','Macelleria','Boucherie'];

uiMessages.resume[2]='Weiterlernen';
