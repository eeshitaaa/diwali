// Presentation events are separate from the rules engine: no action can overtake a deal.
export const pokerSnapshot = game => structuredClone({
  awards:game.awards, hand:game.hand, dealer:game.dealer, stage:game.stage, actor:game.actor,
  players:game.players, board:game.board, pot:game.pot, result:game.result, log:game.log
});
export function pokerSequence(before,after){
  const events=[],fresh=!before||before.hand!==after.hand;
  if(fresh){
    for(let round=0;round<2;round++)for(let n=1;n<=after.players.length;n++){
      const seat=(after.dealer+n)%after.players.length;
      if(after.players[seat].cards[round])events.push({type:'deal',seat,card:after.players[seat].cards[round],round,duration:.6});
    }
  }
  after.players.forEach((p,seat)=>{
    const amount=p.total-(fresh?0:before.players[seat].total);
    if(amount>0)events.push({type:'bet',seat,amount,duration:1.05});
    if(!fresh&&p.folded&&!before.players[seat].folded)events.push({type:'fold',seat,duration:.75});
  });
  for(let index=fresh?0:before.board.length;index<after.board.length;index++){
    if([0,3,4].includes(index))events.push({type:'burn',duration:.28});
    events.push({type:'board',index,card:after.board[index],duration:.55});
  }
  if(after.stage==='showdown'&&(fresh||before.stage!=='showdown')){
    events.push({type:'reveal',duration:1.1});
    for(const award of after.awards)events.push({type:'award',...award,duration:1});
  }
  return events;
}

// Reach for the object, slide it, then withdraw; velocities ease at both ends.
export function pokerGesture(progress){
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 return {reach:smooth(progress/.22)*(1-smooth((progress-.48)/.52)),slide:smooth((progress-.22)/.78)};
}
