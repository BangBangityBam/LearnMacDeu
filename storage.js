// A restore stages a complete generation. Changing one pointer commits it atomically.
var trainingStorage = (function () {
  const pointer = 'zbornik.active', pending = new Map();
  const record = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  const count = x => Number.isSafeInteger(x) && x >= 0;
  const string = x => typeof x === 'string' && !!x.trim();
  const tally = x => Array.isArray(x) && x.length === 2 && x.every(count);
  const pair = x => typeof x === 'string' && /^[a-z]{2}-[a-z]{2}$/.test(x);
  const checks = {
    pair, pairs: x => Array.isArray(x) && x.every(pair),
    ui_language: x => ['mk','de','en','fr','it'].includes(x),
    sound: x=>typeof x==='boolean', vibration: x=>typeof x==='boolean', voice_prompt: x=>typeof x==='boolean',
    welcome_seen: x => typeof x === 'boolean', theme: x => ['dark','light',''].includes(x),
    categories: x => Array.isArray(x) && x.every(string),
    words: x => Array.isArray(x) && x.every(w => Array.isArray(w) && [2,3].includes(w.length) && w.every(string)),
    dir: x => [0,1,2].includes(x), rlen: x => [0,10,20].includes(x), ver: count,
    difficulty: x => ['easy','medium','hard'].includes(x),
    mast: x => record(x) && Object.values(x).every(count),
    stats: x => record(x) && tally(x.all) && record(x.cats) && Object.values(x.cats).every(tally),
    daily: x => record(x) && typeof x.date === 'string' && count(x.done) && count(x.goal),
    days: x => record(x) && typeof x.last === 'string' && count(x.n),
    session: x => x === null || (record(x) && string(x.category) && ['mc','type','learn'].includes(x.mode) && count(x.pos)
      && (x.deck===undefined || (Array.isArray(x.deck) && x.deck.every(string)
        && Array.isArray(x.order) && x.order.every(i=>count(i)&&i<x.deck.length)
        && x.pos<=x.order.length && typeof x.forward==='boolean'
        && Array.isArray(x.choices) && x.choices.every(string)
        && record(x.round) && count(x.round.n) && count(x.round.ok)
        && Array.isArray(x.round.miss) && x.round.miss.every(string)
        && (x.feedback===undefined || (record(x.feedback)&&typeof x.feedback.ok==='boolean'&&typeof x.feedback.input==='string')))))
  };
  checks.mine=checks.words; checks.wrong=checks.fav=checks.mast;
  function validate(data) {
    if (!record(data) || !Object.keys(data).length) throw Error('Empty backup');
    for (const [key,value] of Object.entries(data)) {
      const match = /^vt_(?:pair_[a-z]{2}-[a-z]{2}_)?([a-z_]+)$/.exec(key);
      if (!match || !Object.hasOwn(checks,match[1]) || !checks[match[1]](value)) throw Error('Invalid field');
    }
  }
  const prefix = () => localStorage.getItem(pointer) || '';
  function keys(p) {
    return Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).filter(k=>k && k.startsWith(p+'vt_'));
  }
  function snapshot() {
    const p=prefix(), data=Object.create(null);
    for(const k of keys(p)) data[k.slice(p.length)]=JSON.parse(localStorage.getItem(k));
    pending.forEach((raw,k)=>{data[k]=JSON.parse(raw)});
    return data;
  }
  function restore(data) {
    validate(data);
    const old=prefix(), fresh='zbornik.'+crypto.randomUUID()+'.';
    const staged=[];
    try {
      for(const [k,v] of Object.entries(data)) {
        localStorage.setItem(fresh+k,JSON.stringify(v)); staged.push(fresh+k);
      }
      localStorage.setItem(pointer,fresh);
    } catch(error) {
      staged.forEach(k=>localStorage.removeItem(k)); throw error;
    }
    pending.clear();
    try { keys(old).forEach(k=>localStorage.removeItem(k)); } catch(e) {}
  }
  function read(k) {
    const raw=pending.has(k)?pending.get(k):localStorage.getItem(prefix()+k);
    return raw===null?null:JSON.parse(raw);
  }
  function write(k,v) {
    const raw=JSON.stringify(v);
    try { localStorage.setItem(prefix()+k,raw); pending.delete(k); }
    catch(e) { pending.set(k,raw); }
    document.getElementById('saveNotice').hidden=!pending.size;
    return !pending.size;
  }
  function retry() {
    for(const [k,raw] of Array.from(pending)) write(k,JSON.parse(raw));
    return !pending.size;
  }
  return {read,write,retry,snapshot,validate,restore};
})();
