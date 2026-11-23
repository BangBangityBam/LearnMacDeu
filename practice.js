// Alternatives are bound to both sides of a card so homonyms keep their meaning.
var answerAlternatives = {
  en: [
    ['стан','flat','apartment'], ['стан за одмор','holiday flat','holiday apartment','vacation apartment'],
    ['изнајмување стан','renting a flat','renting an apartment'], ['автомобил','automobile','car'],
    ['велосипед','bicycle','bike'], ['мобилен телефон','mobile phone','cell phone','cellphone'],
    ['здраво','hello','hi'], ['благодарам','thank you','thanks'],
    ['есен','autumn','fall'], ['фрижидер','refrigerator','fridge'], ['продавница','shop','store']
  ],
  de: [
    ['јануари','Januar','Jänner'],
    ['автомобил','Auto','Automobil','Wagen'], ['велосипед','Fahrrad','Rad'],
    ['мобилен телефон','Handy','Mobiltelefon'], ['компјутер','Computer','Rechner'],
    ['продавница','Geschäft','Laden'], ['благодарам','Danke','Danke schön']
  ],
  it: [
    ['автомобил','auto','automobile','macchina'], ['велосипед','bicicletta','bici'],
    ['мобилен телефон','telefono cellulare','cellulare','telefonino'], ['фрижидер','frigorifero','frigo']
  ],
  fr: [
    ['автомобил','voiture','automobile','auto'], ['велосипед','vélo','bicyclette'],
    ['мобилен телефон','téléphone portable','portable','téléphone mobile'], ['фрижидер','réfrigérateur','frigo']
  ]
};
var mkVariants=[['автомобил','кола'],['благодарам','фала'],['велосипед','точак']];
// Only a single spelling edit qualifies. A different answer already in the deck stays wrong.
function spellingHint(card,input){
  const clean=s=>Array.from(s.trim().normalize('NFC').toLowerCase());
  const a=clean(card.a), b=clean(input);
  if(Math.max(a.length,b.length)<4 || !b.length || Math.abs(a.length-b.length)>1)return '';
  let i=0;
  while(i<a.length && i<b.length && a[i]===b[i])i++;
  const tail=(chars,start)=>chars.slice(start).join('');
  let hint='';
  if(a.length===b.length){
    if(i+1<a.length && a[i]===b[i+1] && a[i+1]===b[i] && tail(a,i+2)===tail(b,i+2))hint='typoSwap';
    else if(i<a.length && tail(a,i+1)===tail(b,i+1))hint='typoOne';
  }else if(a.length>b.length && tail(a,i+1)===tail(b,i))hint='typoMissing';
  else if(b.length>a.length && tail(b,i+1)===tail(a,i))hint='typoExtra';
  if(!hint)return '';
  const col=card.forward?1:0, candidate=norm(input);
  return pool('*').some(w=>norm(w[col])===candidate)?'':hint;
}
function acceptedAnswers(card) {
  const simple=s=>norm(s.normalize('NFC'));
  const answer=simple(card.a), plain=simple(card.a.replace(/\s*\([^)]*\)/g,''));
  const answers=new Set([answer,plain]);
  const mkFirst=codes[0]==='mk', mk=simple(card.w[mkFirst?0:1]), foreign=simple(card.w[mkFirst?1:0]);
  if(codes[card.forward?1:0]==='mk'){
    const group=mkVariants.find(row=>row.includes(mk));
    if(group) group.forEach(word=>answers.add(simple(word)));
  }else{
    const group=answerAlternatives[target].find(row=>simple(row[0])===mk && row.slice(1).some(w=>simple(w)===foreign));
    if(group) group.slice(1).forEach(word=>answers.add(simple(word)));
  }
  answers.delete('');return answers;
}
var feedbackAddress='zbornik@ik.me';
var feedbackDraftKey='', feedbackPending=false;
function saveFeedbackDraft(){
  const draft={kind:$('reportKind').value,text:$('reportText').value};
  try{
    if(draft.text.trim())localStorage.setItem(feedbackDraftKey,JSON.stringify(draft));
    else localStorage.removeItem(feedbackDraftKey);
  }catch(e){} // The text area remains usable if browser storage is unavailable.
}
async function sendFeedback(){
  if(feedbackPending)return;
  const text=$('reportText'), reply=$('reportReply'), status=$('reportStatus');
  if(!text.value.trim() || !text.reportValidity()){text.focus();text.reportValidity();return}
  if(!reply.reportValidity())return;
  saveFeedbackDraft();
  if(navigator.onLine===false){status.textContent=ui('feedbackOffline');return}
  const payload={
    access_key:'8b24181a-bd15-423c-8957-2f16bcf586f1',
    subject:'Učenje jazici - Учење јазици · '+ui($('reportKind').value==='correction'?'correction':'feedbackIdea'),
    message:text.value.trim()
  };
  if(reply.value.trim())payload.email=reply.value.trim();
  const controls=[text,reply,$('reportSend'),$('reportKind'),$('reportEmail')];
  feedbackPending=true;
  controls.forEach(el=>el.disabled=true);
  status.textContent=ui('feedbackSending');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),20000);
  try{
    const response=await fetch('https://api.web3forms.com/submit',{
      method:'POST',credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(payload),signal:controller.signal
    });
    if(!response.ok || (await response.json()).success!==true)throw Error('Unconfirmed');
    text.value='';reply.value='';saveFeedbackDraft();
    status.textContent=ui('feedbackAccepted');
  }catch(e){status.textContent=ui('feedbackError')}
  finally{
    clearTimeout(timeout);
    feedbackPending=false;
    controls.forEach(el=>el.disabled=false);
  }
}
function updateReportPlaceholder(){
  $('reportText').placeholder=ui($('reportKind').value==='correction'?'correctionHint':'ideaHint');
}
function openWordReport(card) {
  if(feedbackPending){show('wordReport');return}
  const report=$('reportText');
  feedbackDraftKey='zbornik.feedback.'+JSON.stringify(card?[pairId,card.q,card.a]:['menu']);
  $('reportReply').value='';$('reportStatus').textContent='';
  $('reportKind').value=card?'correction':'idea';
  updateReportPlaceholder();
  $('reportHelp').textContent=ui('reportHelp',feedbackAddress);
  report.value='';
  if(card){
    const source=card.forward?0:1;
    report.value='Učenje jazici - Учење јазици · '+languageName(codes[source])+' → '+languageName(codes[1-source])+'\n'+card.q+' → '+card.a+'\n'+categoryName(card.cat)+'\n\n'+ui('correction')+' ';
  }
  try{
    const draft=JSON.parse(localStorage.getItem(feedbackDraftKey));
    if(draft && typeof draft.text==='string' && ['idea','correction'].includes(draft.kind)){
      report.value=draft.text;$('reportKind').value=draft.kind;updateReportPlaceholder();
    }
  }catch(e){}
  show('wordReport');
  if(card)report.focus();else $('reportKind').focus();
}
Object.assign(uiMessages,{
  report:['Report this word','Пријави го зборот','Wort melden','Segnala la parola','Signaler ce mot'],
  correction:['Suggested correction','Предложена исправка','Korrekturvorschlag','Correzione proposta','Correction proposée'],
  feedback:["Suggest an improvement", "Предложи подобрување", "Verbesserung vorschlagen", "Suggerisci un miglioramento", "Proposer une amélioration"],
  feedbackTopic:["Topic", "Тема", "Thema", "Argomento", "Sujet"],
  feedbackIdea:["App idea", "Идеја за апликацијата", "Idee zur App", "Idea per l’app", "Idée pour l’application"],
  feedbackMessage:["Your message", "Твојата порака", "Deine Nachricht", "Il tuo messaggio", "Votre message"],
  ideaHint:["What would make learning easier for you?", "Што би ти го олеснило учењето?", "Was würde dir das Lernen erleichtern?", "Cosa ti aiuterebbe a imparare?", "Qu’est-ce qui faciliterait votre apprentissage ?"],
  correctionHint:["Which language and word? Include the current translation and your suggestion.", "За кој јазик и збор станува збор? Напиши го сегашниот превод и твојот предлог.", "Um welche Sprache und welches Wort geht es? Nenne die bisherige Übersetzung und deinen Vorschlag.", "Di quale lingua e parola si tratta? Scrivi la traduzione attuale e la tua proposta.", "De quelle langue et de quel mot s’agit-il ? Indiquez la traduction actuelle et votre proposition."],
  prepareEmail:["Prepare email", "Подготви е-пошта", "E-Mail vorbereiten", "Prepara e-mail", "Préparer un e-mail"],
  feedbackReply:["Your email (only if you want a reply)", "Твојата е-пошта (само ако сакаш одговор)", "Deine E-Mail-Adresse (nur wenn du eine Antwort möchtest)", "La tua e-mail (solo se desideri una risposta)", "Votre e-mail (uniquement si vous souhaitez une réponse)"],
  feedbackSend:["Send suggestion", "Испрати предлог", "Vorschlag senden", "Invia suggerimento", "Envoyer la suggestion"],
  reportHelp:["Web3Forms will forward your message and any reply address you enter to {0}.", "Web3Forms ќе ги препрати твојата порака и адресата за одговор, ако ја внесеш, до {0}.", "Web3Forms leitet deine Nachricht an {0} weiter. Wenn du eine Antwortadresse angibst, wird sie mitgeschickt.", "Web3Forms inoltrerà il messaggio a {0} insieme all’indirizzo e-mail, se lo inserisci.", "Web3Forms transmettra votre message à {0}, avec votre adresse e-mail si vous la renseignez."],
  feedbackOffline:["You are offline. Try again when connected.", "Нема интернет. Обиди се повторно кога ќе се поврзеш.", "Du bist offline. Sende deinen Entwurf, sobald du wieder Internet hast.", "Sei offline. Riprova quando hai una connessione.", "Vous êtes hors ligne. Réessayez une fois connecté."],
  feedbackSending:["Sending…", "Се испраќа…", "Wird gesendet …", "Invio in corso…", "Envoi en cours…"],
  feedbackAccepted:["Thank you! Web3Forms accepted your suggestion.", "Ти благодариме! Web3Forms го прими твојот предлог.", "Danke! Web3Forms hat deinen Vorschlag angenommen.", "Grazie! Web3Forms ha ricevuto il tuo suggerimento.", "Merci ! Web3Forms a reçu votre suggestion."],
  feedbackError:["Delivery was not confirmed. Your text is still here. Try again later or prepare an email.", "Испраќањето не е потврдено. Текстот е сè уште тука. Обиди се подоцна или подготви е-пошта.", "Der Versand wurde nicht bestätigt. Dein Text ist noch da. Versuche es später erneut oder wähle „E-Mail vorbereiten“.", "Invio non confermato. Il testo è ancora qui. Riprova più tardi o prepara un’e-mail.", "Envoi non confirmé. Votre texte est toujours là. Réessayez plus tard ou préparez un e-mail."],
  feedbackPrivacy:["Feedback drafts are stored on this device. Sending shares your message and optional reply address with Web3Forms for delivery. Web3Forms may store submissions and use the IP address and supplied email for spam checks.", "Нацртите на предлозите се чуваат на овој уред. При испраќање Web3Forms ги добива пораката и адресата за одговор ако е внесена. Web3Forms може да ги чува пораките и да ги користи IP-адресата и внесената е-пошта за проверка на спам.", "Dein Feedbackentwurf wird auf diesem Gerät gespeichert. Beim Senden erhält Web3Forms deine Nachricht und die freiwillig angegebene Antwortadresse zur Weiterleitung. Web3Forms kann Einsendungen speichern und die IP-Adresse sowie die angegebene E-Mail-Adresse zur Spamprüfung verwenden.", "Le bozze dei suggerimenti sono salvate sul dispositivo. Quando invii, Web3Forms riceve il messaggio e l’eventuale e-mail per inoltrarli. Può conservare gli invii e usare l’indirizzo IP e l’e-mail fornita per i controlli antispam.", "Les brouillons sont conservés sur cet appareil. Lors de l’envoi, Web3Forms reçoit votre message et votre éventuelle adresse e-mail pour les transmettre. Le service peut conserver les envois et utiliser l’adresse IP et l’e-mail fourni pour le filtrage du spam."],
  feedbackPolicy:["Web3Forms privacy policy", "Политика за приватност на Web3Forms", "Datenschutzerklärung von Web3Forms", "Informativa sulla privacy di Web3Forms", "Politique de confidentialité de Web3Forms"],
  reportDownload:['Download report','Преземи пријава','Bericht herunterladen','Scarica segnalazione','Télécharger le signalement'],
  saveFailed:['Some changes are only in this tab. Retry saving before leaving.','Некои промени се само во ова јазиче. Обиди се повторно да ги зачуваш пред да излезеш.','Einige Änderungen sind nur in diesem Tab. Versuche vor dem Schließen erneut zu speichern.','Alcune modifiche sono solo in questa scheda. Riprova a salvarle prima di uscire.','Certaines modifications sont uniquement dans cet onglet. Réessayez de les enregistrer avant de quitter.'],
  retry:['Retry saving','Зачувај повторно','Erneut speichern','Riprova a salvare','Réessayer'],
  restoreError:['Restore failed. Your previous data is still available.','Враќањето не успеа. Претходните податоци се зачувани.','Wiederherstellung fehlgeschlagen. Die bisherigen Daten sind weiterhin verfügbar.','Ripristino non riuscito. I dati precedenti sono ancora disponibili.','La restauration a échoué. Vos données précédentes restent disponibles.']
});

Object.assign(uiMessages,{
  "typoSwap": [
    "Almost right – two letters are swapped.",
    "Речиси точно – две букви се заменети по редослед.",
    "Fast richtig – zwei Buchstaben sind vertauscht.",
    "Quasi giusto – due lettere sono invertite.",
    "Presque – deux lettres sont inversées."
  ],
  "typoOne": [
    "Almost right – one character differs.",
    "Речиси точно – еден знак се разликува.",
    "Fast richtig – ein Zeichen ist anders.",
    "Quasi giusto – un carattere è diverso.",
    "Presque – un caractère est différent."
  ],
  "typoMissing": [
    "Almost right – one character is missing.",
    "Речиси точно – недостига еден знак.",
    "Fast richtig – ein Zeichen fehlt.",
    "Quasi giusto – manca un carattere.",
    "Presque – il manque un caractère."
  ],
  "typoExtra": [
    "Almost right – one extra character.",
    "Речиси точно – има еден знак повеќе.",
    "Fast richtig – ein Zeichen ist zu viel.",
    "Quasi giusto – c’è un carattere in più.",
    "Presque – il y a un caractère en trop."
  ],
  "practicedCount": [
    "{0} of {1} categories practised",
    "Вежбани категории: {0} од {1}",
    "{0} von {1} Kategorien geübt",
    "Categorie esercitate: {0} su {1}",
    "Catégories travaillées : {0} sur {1}"
  ],
  "noPracticed": [
    "No categories practised yet",
    "Сè уште нема вежбани категории",
    "Noch keine Kategorie geübt",
    "Nessuna categoria ancora esercitata",
    "Aucune catégorie travaillée pour le moment"
  ]
});
