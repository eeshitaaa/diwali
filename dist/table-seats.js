// Seat zero belongs to the player; the next seat is immediately to her right.
export const TABLE_PLAYERS = Object.freeze([
  {name:'Eeshita',color:'#995b6b',sari:true,skin:'#c49173'},
  {name:'Abheek',color:'#466e68',skin:'#c59373',faceVariant:1},
  {name:'Anshu',color:'#b07848',skin:'#b78365'},
  {name:'Yash',color:'#707b96',skin:'#ae795c'},
  {name:'Aayush',color:'#946d66',skin:'#c69879'},
  {name:'Ekansh',color:'#7c865e',skin:'#bc8867'}
]);
export const PLAYER_NAMES = Object.freeze(TABLE_PLAYERS.map(p=>p.name));
export const seatAngle = seat => seat * Math.PI * 2 / TABLE_PLAYERS.length;
