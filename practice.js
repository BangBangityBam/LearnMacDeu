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
function updateReportPlaceholder(){
  $('reportText').placeholder=ui($('reportKind').value==='correction'?'correctionHint':'ideaHint');
}
function openWordReport(card) {
  const report=$('reportText');
  $('reportKind').value=card?'correction':'idea';
  updateReportPlaceholder();
  $('reportHelp').textContent=ui('reportHelp',feedbackAddress);
  report.value='';
  if(card){
    const source=card.forward?0:1;
    report.value='Zbornik · '+languageName(codes[source])+' → '+languageName(codes[1-source])+'\n'+card.q+' → '+card.a+'\n'+categoryName(card.cat)+'\n\n'+ui('correction')+' ';
  }
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
  reportHelp:["Your email app will open a draft addressed to {0}. You can review and send it there.", "Ќе се отвори нацрт до {0} во твојата апликација за е-пошта. Таму можеш да го провериш и да го испратиш.", "Dein Mailprogramm öffnet einen Entwurf an {0}. Dort kannst du ihn prüfen und selbst absenden.", "La tua app di posta aprirà una bozza per {0}. Potrai controllarla e inviarla.", "Votre messagerie ouvrira un brouillon destiné à {0}. Vous pourrez le relire et l’envoyer."],
  reportDownload:['Download report','Преземи пријава','Bericht herunterladen','Scarica segnalazione','Télécharger le signalement'],
  saveFailed:['Some changes are only in this tab. Retry saving before leaving.','Некои промени се само во ова јазиче. Обиди се повторно да ги зачуваш пред да излезеш.','Einige Änderungen sind nur in diesem Tab. Versuche vor dem Schließen erneut zu speichern.','Alcune modifiche sono solo in questa scheda. Riprova a salvarle prima di uscire.','Certaines modifications sont uniquement dans cet onglet. Réessayez de les enregistrer avant de quitter.'],
  retry:['Retry saving','Зачувај повторно','Erneut speichern','Riprova a salvare','Réessayer'],
  restoreError:['Restore failed. Your previous data is still available.','Враќањето не успеа. Претходните податоци се зачувани.','Wiederherstellung fehlgeschlagen. Die bisherigen Daten sind weiterhin verfügbar.','Ripristino non riuscito. I dati precedenti sono ancora disponibili.','La restauration a échoué. Vos données précédentes restent disponibles.']
});
