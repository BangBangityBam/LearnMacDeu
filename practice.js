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
function openWordReport(card) {
  if(!card)return;
  const report=document.getElementById('reportText');
  report.value='Zbornik · '+pairId+'\n'+card.q+' → '+card.a+'\n'+categoryName(card.cat)+'\n\n'+ui('correction')+' ';
  show('wordReport');report.focus();
}
Object.assign(uiMessages,{
  report:['Report this word','Пријави го зборот','Wort melden','Segnala la parola','Signaler ce mot'],
  correction:['Suggested correction','Предложена исправка','Korrekturvorschlag','Correzione proposta','Correction proposée'],
  reportHelp:['Add your correction, then download the report to share with a reviewer.','Додај исправка и преземи ја пријавата за да ја споделиш со рецензент.','Ergänze die Korrektur und lade den Bericht zum Weitergeben herunter.','Aggiungi la correzione e scarica la segnalazione per condividerla.','Ajoutez la correction et téléchargez le signalement pour le partager.'],
  reportDownload:['Download report','Преземи пријава','Bericht herunterladen','Scarica segnalazione','Télécharger le signalement'],
  saveFailed:['Some changes are only in this tab. Retry saving before leaving.','Некои промени се само во ова јазиче. Обиди се повторно да ги зачуваш пред да излезеш.','Einige Änderungen sind nur in diesem Tab. Versuche vor dem Schließen erneut zu speichern.','Alcune modifiche sono solo in questa scheda. Riprova a salvarle prima di uscire.','Certaines modifications sont uniquement dans cet onglet. Réessayez de les enregistrer avant de quitter.'],
  retry:['Retry saving','Зачувај повторно','Erneut speichern','Riprova a salvare','Réessayer'],
  restoreError:['Restore failed. Your previous data is still available.','Враќањето не успеа. Претходните податоци се зачувани.','Wiederherstellung fehlgeschlagen. Die bisherigen Daten sind weiterhin verfügbar.','Ripristino non riuscito. I dati precedenti sono ancora disponibili.','La restauration a échoué. Vos données précédentes restent disponibles.']
});
