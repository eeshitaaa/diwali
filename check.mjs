import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {evaluate5,evaluate7,Holdem,deckOfCards} from './dist/holdem.js';
import {PLAYER_NAMES,TABLE_PLAYERS,seatAngle} from './dist/table-seats.js';
const h=(ranks,suits=[0,1,2,3,0,1,2])=>ranks.map((rank,i)=>({rank,suit:suits[i]}));
const ordered=[h([14,11,9,5,2]),h([2,2,14,8,6]),h([3,3,2,2,14]),h([2,2,2,8,6]),h([14,2,3,4,5]),h([14,11,9,5,2],[1,1,1,1,1]),h([2,2,2,3,3]),h([2,2,2,2,14]),h([10,11,12,13,14],[0,0,0,0,0])];
for(let i=1;i<ordered.length;i++)assert(evaluate5(ordered[i]).value>evaluate5(ordered[i-1]).value);
assert.equal(evaluate7(h([14,2,3,4,5,9,10])).name,'Straight');
assert.equal(evaluate7(h([14,14,14,8,8,8,2])).name,'Full house');
assert.equal(new Set(deckOfCards().map(c=>c.rank+':'+c.suit)).size,52);
let seed=9143;const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
let testedHands=0;for(let game=0;game<40;game++){const names=game%2?PLAYER_NAMES:PLAYER_NAMES.slice(0,4);const g=new Holdem(random,names);for(let hand=0;hand<12;hand++){if(!g.start())break;testedHands++;let actions=0;while(g.stage!=='showdown'&&actions++<200){assert(g.actor>=0,'live hand has an actor');const l=g.legal();if(g.actor===0)g.act(l.canRaise&&random()<.25?'raise':l.canCheck?'check':random()<.1?'fold':'call');else g.bot();assert.equal(g.players.reduce((n,p)=>n+p.stack,0)+(g.stage==='showdown'?0:g.pot),g.players.length*300,'chips are conserved');}assert.equal(g.stage,'showdown','betting rounds terminate');assert(g.players.every(p=>p.stack>=0));const all=[...g.board,...g.players.flatMap(p=>p.cards)];assert.equal(new Set(all.map(c=>c.rank+':'+c.suit)).size,all.length,'cards are unique');}}
// Short all-in wins the main pot; larger contribution levels are separate side pots.
const side=new Holdem(Math.random,PLAYER_NAMES.slice(0,4));side.board=h([2,3,7,9,11],[0,1,2,3,0]);side.players.forEach((p,i)=>{p.stack=0;p.total=[20,60,100,100][i];p.folded=i===3;p.cards=h([[14,14],[13,13],[12,12],[10,10]][i],[1,2]);});side.pot=280;side.settle();assert.deepEqual(side.players.map(p=>p.stack),[80,120,80,0]);
// A board straight is shared: unequal private cards must not break the tie.
const tie=new Holdem(Math.random,PLAYER_NAMES.slice(0,4));tie.board=h([2,3,4,5,6],[0,1,2,3,0]);tie.players.forEach((p,i)=>{p.stack=0;p.total=10;p.folded=i>1;p.cards=h(i===0?[14,13]:[12,11],[1,2]);});tie.pot=40;tie.settle();assert.deepEqual(tie.players.map(p=>p.stack),[20,20,0,0]);
const short=new Holdem(random);short.players.forEach((p,i)=>p.stack=i<2?1:0);short.start();assert.equal(short.stage,'showdown');assert.equal(short.players.reduce((n,p)=>n+p.stack,0),2);
assert.deepEqual(PLAYER_NAMES,['Eeshita','Abheek','Anshu','Yash','Aayush','Ekansh']);
assert.equal(seatAngle(1),Math.PI/3,'Abheek is in the next chair');
// Every funded chair, including seats four and five, can be dealer and act.
const six=new Holdem(random);const dealers=new Set(),actors=new Set();
for(let round=0;round<6;round++){six.players.forEach(p=>p.stack=300);six.start();dealers.add(six.dealer);let turns=0;while(six.stage!=='showdown'&&turns++<100){actors.add(six.actor);six.act(six.legal().canCheck?'check':'call');}}
assert.equal(dealers.size,6);assert.equal(actors.size,6);
// Odd chips go clockwise after the dealer, even across the six-seat wrap.
const odd=new Holdem();odd.dealer=4;odd.board=h([10,11,12,13,14],[0,0,0,0,0]);odd.players.forEach((p,i)=>{p.stack=0;p.total=i===4?0:1;p.folded=i!==0&&i!==5;p.cards=h([2,3],[1,2]);});odd.pot=5;odd.settle();assert.equal(odd.players[5].stack,3);assert.equal(odd.players[0].stack,2);
for(const f of ['table-seats.js','polish.css','index.html','style.css','game.js','residents.js','holdem.js','vendor/three.module.js'])assert(readFileSync('dist/'+f).length>0);
console.log(`Passed: ranking, best-five selection, ${testedHands} multi-round hands, chip conservation, side/split pots, all-in blinds, unique cards, and deploy assets.`);
