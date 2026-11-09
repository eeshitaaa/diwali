import assert from 'node:assert/strict';
import {Holdem} from './dist/holdem.js';
import {pokerSnapshot,pokerSequence} from './dist/poker-motion.js';
let seed=516;const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
let moves=0,hands=0,payouts=0;
for(let run=0;run<25;run++){
 const g=new Holdem(random);let before=null;
 for(let hand=0;hand<8;hand++){
  if(!g.start())break;hands++;let after=pokerSnapshot(g),events=pokerSequence(before,after);
  const deals=events.filter(e=>e.type==='deal');assert.equal(deals.length,g.players.filter(p=>p.cards.length).length*2);
  assert(deals.slice(0,deals.length/2).every(e=>e.round===0),'everyone gets one card before anyone gets a second');
  const active=g.players.map((p,i)=>p.cards.length?i:-1).filter(i=>i>=0);const order=Array.from({length:g.players.length},(_,n)=>(g.dealer+n+1)%g.players.length).filter(i=>active.includes(i));assert.deepEqual(deals.slice(0,order.length).map(e=>e.seat),order);
  assert.equal(events.filter(e=>e.type==='bet').reduce((n,e)=>n+e.amount,0),after.pot,'blinds enter bowl');
  while(g.stage!=='showdown'){
   before=pokerSnapshot(g);const l=g.legal();g.act(l.canRaise&&random()<.23?'raise':l.canCheck?'check':random()<.15?'fold':'call');after=pokerSnapshot(g);events=pokerSequence(before,after);moves++;
   let bowl=before.pot,stacks=before.players.map(p=>p.stack),board=before.board.length;
   for(const e of events){assert(e.duration>0);if(e.type==='bet'){stacks[e.seat]-=e.amount;bowl+=e.amount;}if(e.type==='award'){stacks[e.seat]+=e.amount;bowl-=e.amount;payouts++;}if(e.type==='board')board++;assert(bowl>=0);assert(stacks.every(n=>n>=0));assert.equal(stacks.reduce((a,b)=>a+b,0)+bowl,g.players.length*300,'presentation conserves chips at every arrival');}
   assert.equal(board,after.board.length);assert.deepEqual(stacks,after.players.map(p=>p.stack));assert.equal(bowl,after.stage==='showdown'?0:after.pot);
  }
  before=pokerSnapshot(g);
 }
}
const tiny=new Holdem();tiny.players.forEach((p,i)=>p.stack=i<2?1:0);tiny.start();const last=pokerSequence(null,pokerSnapshot(tiny));assert.equal(last.filter(e=>e.type==='award').reduce((n,e)=>n+e.amount,0),2,'all-in blind hand awards bowl');
console.log(`Passed: ${hands} animated hands, ${moves} action transitions, ${payouts} payouts, clockwise dealing and chip conservation through each movement.`);

const {pokerGesture}=await import('./dist/poker-motion.js');
assert.equal(pokerGesture(0).reach,0);assert.equal(pokerGesture(1).reach,0);
assert.equal(pokerGesture(.22).slide,0);assert.equal(pokerGesture(.22).reach,1,'hand reaches before object slides');
let previous=0;for(let i=0;i<=100;i++){const g=pokerGesture(i/100);assert(g.slide>=previous&&g.slide<=1);assert(g.reach>=0&&g.reach<=1);previous=g.slide;}
assert.equal(previous,1,'object arrives before move ends');
console.log('Passed: reach precedes the slide; objects move forward and hands return to rest.');
