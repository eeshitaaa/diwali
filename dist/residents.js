import * as THREE from './vendor/three.module.js';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const DOWN=V(0,-1,0),TAU=Math.PI*2;
const palettes={Riya:['#a34c39','#d5a24c'],Maa:['#416f66','#dfb66c'],Didi:['#c19043','#7b463b'],Dadi:['#8e626b','#d7b17b'],Dadu:['#e1d5bc','#95775b'],Neha:['#587c87','#dcba7a'],Nisha:['#985866','#ddba74'],'Sharma Uncle':['#9a795d','#eee0bb'],'Joshi Uncle':['#6f7d6a','#c9af7a'],Bunty:['#d6a14a','#ecce89'],Chutki:['#b96552','#edba87']};
function seedOf(s){return [...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,17);}
function curve(points,r,color,add){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>V(...p))),16,r,6,false),color);}
// A sewn surface rather than a stack of cylinders. Rings can shift as cloth drapes.
function cloth(rings,folds=9,amount=.008){if(rings.length>2){const path=new THREE.CatmullRomCurve3(rings.map(r=>V(r[1],r[0],r[2]))),centers=new THREE.CatmullRomCurve3(rings.map(r=>V(r[3]||0,0,r[4]||0)));rings=Array.from({length:(rings.length-1)*5+1},(_,i)=>{const t=i/((rings.length-1)*5),q=path.getPoint(t),c=centers.getPoint(t);return [q.y,Math.max(.005,q.x),Math.max(.005,q.z),c.x,c.z];});}const pos=[],uv=[],indices=[],n=28;for(let j=0;j<rings.length;j++){const [y,rx,rz,cx=0,cz=0]=rings[j];for(let i=0;i<=n;i++){const a=i/n*TAU,f=1+Math.cos(a*folds)*amount;pos.push(cx+Math.sin(a)*rx*f,y,cz+Math.cos(a)*rz*f);uv.push(i/n,j/(rings.length-1));}}for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;indices.push(a,b,a+1,b,b+1,a+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;}
export function createResident(name,inputColor,opts={}){
 const seed=seedOf(name.split(' ·')[0]),female=!!opts.sari,child=!!opts.child,elder=!!opts.elder||/Dadi|Dadu|Nani/.test(name);
 const colors=palettes[name.split(' ·')[0]]||[inputColor,'#c5a16c'],color=colors[0],border=colors[1];
 const skin=opts.skin||['#b97b55','#cb936b','#9c6547','#d1a17a','#ad7554'][seed%5],hair=elder?'#9a9387':['#2d2926','#352b25','#242826'][seed%3];
 const g=new THREE.Group(),hips=new THREE.Group(),body=new THREE.Group(),head=new THREE.Group();g.add(hips);hips.add(body);body.add(head);hips.position.y=.86;head.position.set(0,.733,.018);
 const scale=child?.72:elder?.96:.97+(seed%7)*.014;g.scale.set(scale,scale*(female?.98:1),scale);
 const sphere=new THREE.SphereGeometry(1,20,14),mats=new Map();const material=c=>{if(!mats.has(c))mats.set(c,Object.assign(new THREE.MeshStandardMaterial({color:c,roughness:.85,side:THREE.DoubleSide,emissive:c,emissiveIntensity:.012}),{userData:{resident:true}}));return mats.get(c);};
 const add=(geo,c,parent=body)=>{const m=new THREE.Mesh(geo,material(c));m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const ell=(c,x,y,z,sx,sy,sz,parent=body)=>{const m=add(sphere,c,parent);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;};
 const tube=(points,r,c,parent=body)=>curve(points,r,c,(geo,col)=>add(geo,col,parent));
 const ring=(r,t,c,x,y,z,parent=body)=>{const m=add(new THREE.TorusGeometry(r,t,6,24),c,parent);m.position.set(x,y,z);return m;};
 // Waist, shoulder slope, collarbone and neck establish a human silhouette.
 add(cloth([[0,.164,.119],[.13,.164,.108],[.32,.207,.13],[.43,.215,.116],[.51,.177,.087],[.55,.079,.063]],0,0),color);
 ell(skin,0,.565,0,.062,.071,.057);
 let palluTail=null;const standing=new THREE.Group(),sitting=new THREE.Group(),crossed=new THREE.Group();hips.add(standing,sitting,crossed);
 if(female){
  add(cloth([[-.78,.245,.18],[-.74,.25,.18],[-.5,.22,.15],[-.2,.19,.13],[.03,.16,.11]],12,.025),color,standing);
  add(cloth([[-.78,.247,.182],[-.735,.252,.183]],12,.025),border,standing);
  // The pallu is a broad continuous cloth ribbon running over one shoulder.
  const points=[[-.2,.56,.055],[-.17,.49,.118],[-.08,.32,.14],[.04,.16,.12],[.16,.01,.114]];
  const pp=[],ii=[];points.forEach(([x,y,z],j)=>{pp.push(x-.085,y,z-.003,x+.085,y,z+.007);if(j<points.length-1){const k=j*2;ii.push(k,k+2,k+1,k+1,k+2,k+3);}});
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));pg.setIndex(ii);pg.computeVertexNormals();add(pg,border);
  tube(points.map(([x,y,z])=>[x-.085,y,z+.005]),.006,'#e7c98f');tube(points.map(([x,y,z])=>[x+.085,y,z+.012]),.006,'#e7c98f');
  const tail=add(cloth([[-.36,.075,.025,-.195,-.09],[.2,.09,.03,-.195,-.1],[.53,.09,.035,-.195,-.055]],6,.04),border);tail.rotation.z=-.08;palluTail=tail;tail.userData.flexCloth=true;
  // Draped seated fabric lies across knees and continues down the shins.
  add(cloth([[-.6,.205,.09,0,.39],[-.5,.22,.1,0,.39],[-.16,.235,.14,0,.35],[-.07,.23,.28,0,.2],[.04,.16,.12]],10,.03),color,sitting);
  add(cloth([[-.6,.207,.092,0,.39],[-.55,.22,.102,0,.39]],10,.03),border,sitting);
  add(cloth([[-.25,.4,.31,0,.08],[-.23,.425,.32,0,.08],[-.15,.4,.29,0,.1],[-.035,.28,.2,0,.04],[.05,.16,.12]],12,.04),color,crossed);
  add(cloth([[-.25,.402,.312,0,.08],[-.215,.428,.322,0,.08]],12,.04),border,crossed);
  tube([[-.05,.51,.11],[0,.43,.126],[.07,.47,.115]],.008,'#d6b363');
 }else{
  add(cloth([[-.35,.215,.14],[-.31,.215,.14],[-.12,.18,.12],[.04,.158,.112]],7,.015),color,standing);
  add(cloth([[-.34,.216,.141],[-.315,.216,.141]],0,0),border,standing);
  add(cloth([[-.1,.21,.24,0,.14],[.025,.16,.12]],6,.015),color,sitting);
  tube([[0,.5,.096],[0,.18,.112]],.006,border);for(let i=0;i<4;i++)ell('#d1b181',.012,.44-i*.065,.112,.009,.009,.006);
  const collar=add(cloth([[.51,.082,.065],[.565,.07,.058]],0,0),border);
 }
 // One soft head surface, with painted features instead of projecting eye/nose pieces.
 const hw=child?.147:.126+(seed%3)*.004,hh=child?.177:.17+(seed%2)*.005;
 const faceGeo=new THREE.SphereGeometry(1,32,24);const fpos=faceGeo.attributes.position;
 for(let i=0;i<fpos.count;i++){let x=fpos.getX(i)*hw,y=fpos.getY(i)*hh,z=fpos.getZ(i)*.126;const jaw=1-.21*Math.max(0,(-y-.02)/hh);x*=jaw;fpos.setXYZ(i,x,y,z);}faceGeo.computeVertexNormals();
 const face=add(faceGeo,skin,head);face.receiveShadow=false;const faceMaps=paintFace(skin,seed,female,elder);if(faceMaps){face.material=material('#ffffff').clone();face.material.userData.resident=true;face.material.map=faceMaps.smile;face.material.emissive.set(skin);face.material.emissiveIntensity=.025;face.userData.faceMaps=faceMaps;}
 const eyes=[];
 for(const side of [-1,1]){ell(skin,side*hw*.96,-.009,-.005,.023,.037,.025,head);if(female){ring(.018,.004,'#d8ae5c',side*(hw+.005),-.052,.01,head);ell('#d7a751',side*(hw+.005),-.075,.01,.01,.013,.01,head);}}
 // Hair follows a curved hairline, with a soft side part and no hard helmet rim.
 const hairGeo=new THREE.SphereGeometry(1,40,24);const hp=hairGeo.attributes.position,hu=hairGeo.attributes.uv;
 for(let i=0;i<hp.count;i++){const phi=hu.getX(i)*TAU,lat=1-hu.getY(i),maxTheta=1.04+.7*(1-Math.sin(phi))*.5+.055*Math.sin(phi*3),theta=lat*maxTheta;hp.setXYZ(i,-Math.cos(phi)*Math.sin(theta)*hw*1.035,Math.cos(theta)*hh*1.05+.006,Math.sin(phi)*Math.sin(theta)*.132-.006);}hairGeo.computeVertexNormals();add(hairGeo,hair,head);
 for(const side of [-1,1])ell(hair,side*hw*.91,.02,-.045,.023,.063,.064,head);
 if(female){ell(hair,0,-.036,-.125,.072,.064,.056,head);tube([[0,.173,-.025],[0,.143,.07],[0,.1,.105]],.0025,'#a77d5c',head);if(seed%2){for(let i=0;i<6;i++)ell(hair,Math.sin(i*2.3)*.009,-.09-i*.034,-.12,.024,.028,.024,head);ell(border,0,-.275,-.12,.024,.009,.024,head);}else for(let i=0;i<8;i++)ell('#eee1bc',Math.cos(i/8*TAU)*.069,-.036+Math.sin(i/8*TAU)*.054,-.158,.012,.013,.012,head);}
 else{for(let i=0;i<3;i++){const lock=ell(hair,-.045+i*.04,.124+i*.008,.061,.058,.031,.069,head);lock.rotation.z=-.3;}if(elder){ell('#b6afa0',-.027,-.049,.123,.028,.008,.009,head);ell('#b6afa0',.027,-.049,.123,.028,.008,.009,head);}}
 if(elder){for(const side of [-1,1]){ring(.034,.0024,'#a88b5c',side*.051,.019,.125,head);tube([[side*.083,.02,.117],[side*hw,.012,.0]],.0024,'#a88b5c',head);}tube([[-.017,.019,.129],[.017,.019,.129]],.0024,'#a88b5c',head);}
 const arms=[],legs=[],chestAnchor=new THREE.Bone();body.add(chestAnchor);
 for(const side of [-1,1]){
  const shoulder=new THREE.Bone();shoulder.position.set(side*.201,.457,0);body.add(shoulder);const elbow=new THREE.Bone();elbow.position.y=-.29;shoulder.add(elbow);const hand=new THREE.Bone();hand.position.set(0,-.26,0);elbow.add(hand);
  const armSkeleton=new THREE.Skeleton([shoulder,elbow,hand,chestAnchor]);g.updateMatrixWorld(true);
  skinnedLimb(body,shoulder,armSkeleton,.55,.29,[[0,.050],[.11,.054],[.24,.043],[.29,.040],[.37,.044],[.46,.034],[.55,.024]],material(skin));
  // The sleeve rounds into the torso and deforms from the shoulder, without a separate ball joint.
  const sleeveEnd=female?.19:.39;skinnedLimb(body,shoulder,armSkeleton,sleeveEnd,.29,female?[[-.065,.002],[-.035,.055],[0,.072],[.08,.074],[.15,.063],[.19,.059]]:[[-.065,.002],[-.035,.055],[0,.072],[.10,.075],[.20,.064],[.27,.051],[.30,.051],[.35,.057],[.39,.051]],material(color),{start:-.065,anchor:3});
  const handRig=softHand(material(skin),side);hand.add(handRig.mesh);hand.add(handRig.root);hand.userData.soft=handRig;
  if(female){ring(.034,.005,'#d6b469',0,-.233,0,elbow).rotation.x=Math.PI/2;}
  shoulder.userData={elbow,hand};arms.push(shoulder);
  const leg=new THREE.Bone();leg.position.set(side*.102,-.025,0);hips.add(leg);const knee=new THREE.Bone();knee.position.y=-.39;leg.add(knee);const ankle=new THREE.Bone();ankle.position.y=-.37;knee.add(ankle);
  const legSkeleton=new THREE.Skeleton([leg,knee,ankle]);g.updateMatrixWorld(true);const trouser=skinnedLimb(hips,leg,legSkeleton,.76,.39,[[0,.092],[.2,.084],[.39,.073],[.58,.067],[.76,.052]],material(female?color:opts.pants||'#ded1b8'));
  ell(skin,0,-.01,.016,.045,.047,.047,ankle);ell('#71503a',0,-.037,.074,.064,.031,.119,ankle);ell(skin,0,-.018,.104,.047,.018,.07,ankle);tube([[-.052,-.014,.08],[0,.002,.1],[.052,-.014,.08]],.01,'#a07950',ankle);
  leg.userData={knee,ankle,trouser};legs.push(leg);
 }
 // Task objects sit in the hands, so gestures have something tangible to do.
 if(opts.mode==='visitor'){const box=new THREE.Mesh(new THREE.BoxGeometry(.32,.12,.23),material('#b96646'));box.position.set(0,.19,.35);body.add(box);const lid=new THREE.Mesh(new THREE.BoxGeometry(.34,.025,.245),material('#e2b86a'));lid.position.set(0,.26,.35);body.add(lid);for(const z of [.26,.43])tube([[-.16,.276,z],[.16,.276,z]],.007,'#f2d9a1');}
 if(opts.mode==='decorate'){for(let i=0;i<13;i++){const x=-.15+i*.025;ell(i%2?'#e7a440':'#c77731',x,.135-.055*Math.sin(i/12*Math.PI),.405,.027,.027,.025);}}
 mergeResidentParts(g);
 const p={g,palluTail,hips,body,head,face,eyes,arms,legs,standing,sitting,crossed,seed,female,elder,child,opts};return p;
}
// Rounded palms and tapered fingers share one skinned mesh per hand.
function softHand(material,side){
 const root=new THREE.Bone(),bones=[root],fingers=[],positions=[],indices=[],skinIndex=[],skinWeight=[];
 const append=(geometry,bone,transform)=>{const offset=positions.length/3,a=geometry.attributes.position;
  for(let i=0;i<a.count;i++){const p=V().fromBufferAttribute(a,i).applyMatrix4(transform);positions.push(p.x,p.y,p.z);skinIndex.push(bone,0,0,0);skinWeight.push(1,0,0,0);}
  for(const index of geometry.index.array)indices.push(offset+index);geometry.dispose();
 };
 const oval=(center,scale,bone=0)=>append(new THREE.SphereGeometry(1,12,10),bone,new THREE.Matrix4().compose(center,new THREE.Quaternion(),scale));
 oval(V(0,-.028,.001),V(.033,.036,.017));oval(V(0,-.004,0),V(.023,.023,.018));
 const digit=(x,y,z,length,radius,spread)=>{
  const bone=new THREE.Bone();bone.position.set(x,y,z);root.add(bone);bones.push(bone);const index=bones.length-1;
  const p=[],ix=[],rows=10,sides=10;
  for(let j=0;j<=rows;j++){const u=j/rows,r=radius*Math.pow(Math.sin(Math.PI*(.06+.94*u)),.45)*(1-.18*u);
   for(let k=0;k<=sides;k++){const a=k/sides*TAU;p.push(x+Math.sin(a)*r+spread*u,y-length*u,z+Math.cos(a)*r*.86+.008*u*u);}
  }
  for(let j=0;j<rows;j++)for(let k=0;k<sides;k++){const a=j*(sides+1)+k,b=a+sides+1;ix.push(a,a+1,b,a+1,b+1,b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);append(geo,index,new THREE.Matrix4());return bone;
 };
 for(let j=0;j<4;j++)fingers.push(digit((j-1.5)*.015,-.050,.001,[.035,.046,.043,.031][side<0?j:3-j],.008,(j-1.5)*.0018));
 const thumb=digit(-side*.026,-.023,.008,.034,.011,-side*.020);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skinIndex,4));geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(skinWeight,4));geo.setIndex(indices);geo.computeVertexNormals();
 const mesh=new THREE.SkinnedMesh(geo,material),skeleton=new THREE.Skeleton(bones);root.updateMatrixWorld(true);mesh.bind(skeleton);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
 return {mesh,root,fingers,thumb};
}
function armTo(a,target,pole=V(0,-1,.7)){
 const d=target.clone().sub(a.position),length=Math.min(.548,Math.max(.03,d.length()));d.normalize();const along=(.29*.29-.26*.26+length*length)/(2*length),height=Math.sqrt(Math.max(0,.29*.29-along*along));const bend=pole.clone().addScaledVector(d,-pole.dot(d)).normalize();const mid=d.clone().multiplyScalar(along).addScaledVector(bend,height),end=d.clone().multiplyScalar(length);
 a.quaternion.setFromUnitVectors(DOWN,mid.clone().normalize());const local=end.sub(mid).applyQuaternion(a.quaternion.clone().invert()).normalize();a.userData.elbow.quaternion.setFromUnitVectors(DOWN,local);
}
export function poseResident(p,t,mode=p.mode,dt=1/60){
 const q=t+(p.seed%100)*.17,breathe=Math.sin(q*1.6)*.008,reach=(Math.sin(q*.9)+1)/2;
 const turn=q%8.5,gesture=turn<3.4?Math.sin(turn/3.4*Math.PI):0,glance=Math.sin(q*.42);
 if(p.face.userData.faceMaps){const expr=(q%4.7)>4.52?'blink':'smile';if(p.face.userData.expression!==expr){p.face.material.map=p.face.userData.faceMaps[expr];p.face.userData.expression=expr;}}
 p.hips.position.x=(mode==='idle'||mode==='instruct')?Math.sin(q*.65)*.019:0;
 if(p.palluTail){p.palluTail.visible=mode!=='rangoli';p.palluTail.rotation.z=-.08+Math.sin(q*.8)*.025;p.palluTail.rotation.x=Math.sin(q*.65)*.025;}
 p.standing.visible=mode!=='seated'&&mode!=='rangoli';p.sitting.visible=mode==='seated';p.crossed.visible=mode==='rangoli';
 p.hips.position.y=mode==='rangoli'?.32:mode==='seated'?(p.opts.seatHeight||.61)+.03:.86;
 p.body.rotation.set(mode==='rangoli'?(p.name?.startsWith('Maa')?.07+gesture*.1:.44+reach*.19):p.opts.cards?.07:p.elder?.07:.025,Math.sin(q*.55)*(p.opts.cards?.008:.045),Math.sin(q*.7)*(p.opts.cards?.008:.035));p.body.position.y=breathe;
 const ease=1-Math.exp(-dt*10);p.gaze=(p.gaze||0)+((p.lookYaw||0)-(p.gaze||0))*ease;p.head.rotation.set(mode==='rangoli'?.08+reach*.1:mode==='seated'?.04:Math.sin(q*1.8)*.055,p.opts.cards?glance*.035:p.gaze+glance*.14,Math.sin(q*.5)*(p.opts.cards?.015:.065));
 const blink=(q%4.9)>4.72?.18:1;p.eyes.forEach(e=>e.scale.y=blink);
 p.legs.forEach((l,i)=>{l.userData.trouser.visible=!(p.female&&mode==='rangoli');l.position.x=(i?1:-1)*.102-p.hips.position.x;l.rotation.set(0,0,0);l.userData.knee.rotation.set(0,0,0);if(mode==='seated'){const angle=Math.acos(Math.min(.65,Math.max(.05,(p.hips.position.y-.465)/.39)));l.rotation.x=-angle;l.rotation.z=(i?1:-1)*(p.opts.cards?.09:0);l.userData.knee.rotation.x=angle;}else if(mode==='rangoli'){l.rotation.set(-1.15,0,(i?1:-1)*1.05);l.userData.knee.rotation.x=2.1;}else if(mode==='walk'||mode==='run'){l.rotation.x=Math.sin(q*(mode==='run'?8:4)+(i*Math.PI))*(mode==='run'?.48:.28);l.userData.knee.rotation.x=Math.max(0,-l.rotation.x)*1.1;}});
 let left=V(-.24,-.035,.09),right=V(.24,-.045,.1);
 if(mode==='rangoli'){left=V(-.24,.03,.24);right=V(.1+Math.sin(q*1.5)*.07,.015,.32+reach*.045);p.arms[1].userData.hand.rotation.x=-.15;if(p.name?.startsWith('Maa')){left=V(-.1,.22,.33);right=V(.1+gesture*.08,.22+gesture*.12,.33);}}
 else if(mode==='seated'){left=V(-.14,p.opts.cards?.4:.035,p.opts.cards?.46:.41);right=V(.15,p.opts.cards?.4:.04,p.opts.cards?.46:.4);if(!p.opts.cards)right.set(.18,.055+gesture*.17,.39);else{const reach=p.pokerReach||0,thinking=p.pokerThinking?1:0;const restY=(.90-p.g.position.y)/p.g.scale.y-p.hips.position.y-p.body.position.y+Math.sin(p.body.rotation.x)*.40;left.set(-.18,restY-.003,.40);right.set(.16,restY+.003,.42);if(p.pokerTarget)right.lerp(p.pokerTarget,reach);p.head.rotation.x=.06+thinking*.08;p.body.rotation.y+=(p.seed%3-1)*.035;}}
 else if(mode==='clean'){left=V(-.13,.99,.18);right=V(.2,.88+Math.sin(q*2)*.05,.28);p.head.rotation.x=-.25;}
 else if(mode==='lights'){left=V(-.15,.93,.25);right=V(.17,.92+Math.sin(q)*.03,.26);p.head.rotation.x=-.18;}
 else if(mode==='visitor'){left=V(-.17,.19,.35);right=V(.17,.19,.35);p.head.rotation.x=-.025;}
 else if(mode==='decorate'){left=V(-.12,.12,.4);right=V(.13,.17,.38);}
 else if(mode==='instruct'){right=V(.24+gesture*.08,.04+gesture*.31,.16+gesture*.19);left=V(-.18,.035,.17);p.head.rotation.y+=-.1;}
 else if(mode==='prayer'){left=V(-.035,.31,.31);right=V(.035,.31,.31);p.head.rotation.x=.12;}
 else if(mode==='walk'||mode==='run'){const w=Math.sin(q*(mode==='run'?8:4))*.2;left.z=w;right.z=-w;left.y+=Math.abs(w)*.4;right.y+=Math.abs(w)*.4;}
 else{left.z=.1+Math.sin(q)*.025;right.set(.23,.01+gesture*.19,.13+gesture*.2);}
 // Smooth changing targets and reset wrists when switching activities.
 if(!p.handTargets)p.handTargets=[left.clone(),right.clone()];
 p.handTargets[0].lerp(left,ease);p.handTargets[1].lerp(right,ease);
 // Let the shoulder follow the reach slightly; elbows hang down beside the ribs.
 p.shoulderFollow=(p.shoulderFollow||0)+((p.opts.cards?(p.pokerReach||0):0)-(p.shoulderFollow||0))*(1-Math.exp(-dt*7));
 p.arms.forEach((a,i)=>{const follow=i===1?p.shoulderFollow:0;a.position.set((i?1:-1)*(.201-follow*.008),.457+follow*.009,follow*.022);});
 const elbowDrop=p.opts.cards&&mode==='seated';
 armTo(p.arms[0],p.handTargets[0],elbowDrop?V(-.22,-1,.04):V(-.38,-.8,.20));armTo(p.arms[1],p.handTargets[1],elbowDrop?V(.22,-1,.04):V(.38,-.8,.20));
 p.arms.forEach((a,i)=>{
  const hand=a.userData.hand,rig=hand.userData.soft,playing=p.opts.cards&&mode==='seated',action=i===1?(p.pokerReach||0):0;
  if(playing){
   // A relaxed angle follows the forearm; the palm settles toward the felt during a move.
   const desired=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2+.11*(1-action),(i?-.10:.14)*(1-action),(i?-.06:.09)*(1-action)));
   const local=a.quaternion.clone().multiply(a.userData.elbow.quaternion).invert().multiply(desired);
   hand.quaternion.slerp(local,1-Math.exp(-dt*16));
  }else hand.rotation.set(mode==='rangoli'&&i===1?-.15:0,0,(i?1:-1)*(.06+gesture*.06));
  if(rig){const holding=['visitor','decorate','lights','clean'].includes(mode);rig.fingers.forEach((finger,j)=>{const curl=holding?.50:playing?.16+.07*j-action*.12:.24+.06*j;finger.rotation.x+=(curl-finger.rotation.x)*ease;});rig.thumb.rotation.x+=((holding?.38:playing?.16+action*.12:.20)-rig.thumb.rotation.x)*ease;}
 });
}

// Merge static details within each articulated joint, preserving joint animation.
function mergeResidentParts(root){
 const nodes=[];root.traverse(o=>{if(o.isGroup||o.isBone)nodes.push(o);});for(const parent of nodes){const buckets=new Map();for(const m of parent.children){if(!m.isMesh||m.isSkinnedMesh||m.material.map||m.userData.flexCloth)continue;const key=m.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(m);}for(const list of buckets.values()){if(list.length<2)continue;const positions=[],normals=[],indices=[];let offset=0;for(const m of list){m.updateMatrix();const a=m.geometry.attributes.position,n=m.geometry.attributes.normal,normalMatrix=new THREE.Matrix3().getNormalMatrix(m.matrix);for(let i=0;i<a.count;i++){const v=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrix);positions.push(v.x,v.y,v.z);const nv=new THREE.Vector3().fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize();normals.push(nv.x,nv.y,nv.z);}if(m.geometry.index){for(const j of m.geometry.index.array)indices.push(offset+j);}else for(let j=0;j<a.count;j++)indices.push(offset+j);offset+=a.count;parent.remove(m);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setIndex(indices);const joined=new THREE.Mesh(geo,list[0].material);joined.castShadow=true;joined.receiveShadow=true;parent.add(joined);}}
}

function skinnedLimb(parent,root,skeleton,length,joint,radii,material,options={}){
 const position=[],normal=[],index=[],skinIndex=[],skinWeight=[],rings=20,sides=14,start=options.start||0;
 const radius=d=>{for(let j=1;j<radii.length;j++)if(d<=radii[j][0]){const [a,ra]=radii[j-1],[b,rb]=radii[j],t=Math.max(0,Math.min(1,(d-a)/(b-a)));return ra+(rb-ra)*t;}return radii.at(-1)[1];};
 for(let y=0;y<=rings;y++){const d=start+y/rings*(length-start),r=radius(d),t=THREE.MathUtils.smoothstep(d,joint-.065,joint+.065),anchor=options.anchor===undefined?0:1-THREE.MathUtils.smoothstep(d,-.055,.055);for(let i=0;i<=sides;i++){const a=i/sides*TAU;position.push(root.position.x+Math.cos(a)*r,root.position.y-d,root.position.z+Math.sin(a)*r*.94);normal.push(Math.cos(a),0,Math.sin(a));skinIndex.push(0,1,options.anchor||0,0);skinWeight.push((1-t)*(1-anchor),t*(1-anchor),anchor,0);}}
 for(let y=0;y<rings;y++)for(let i=0;i<sides;i++){const a=y*(sides+1)+i,b=a+sides+1;index.push(a,a+1,b,a+1,b+1,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(position,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normal,3));geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skinIndex,4));geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(skinWeight,4));geo.setIndex(index);geo.computeVertexNormals();
 const m=new THREE.SkinnedMesh(geo,material);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;parent.add(m);parent.updateWorldMatrix(true,true);m.bind(skeleton);return m;
}
function paintFace(skin,seed,female,elder){
 if(typeof document==='undefined')return null;
 const maps={};for(const expression of ['smile','blink']){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.scale(.5,.5);ctx.fillStyle=skin;ctx.fillRect(0,0,1024,512);
 const wash=(x,y,r,color)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);};
 wash(256,225,105,'rgba(255,219,172,.13)');wash(195,274,29,'rgba(178,72,54,.24)');wash(317,274,29,'rgba(178,72,54,.24)');
 ctx.lineCap='round';ctx.lineJoin='round';
 for(const side of [-1,1]){const x=256+side*46;ctx.strokeStyle='#543a2c';ctx.lineWidth=5;
  if(expression==='blink'){ctx.beginPath();ctx.moveTo(x-18,246);ctx.quadraticCurveTo(x,257,x+18,246);ctx.stroke();}
  else{ctx.fillStyle='#ead5b3';ctx.beginPath();ctx.ellipse(x,244,15,7,0,0,TAU);ctx.fill();ctx.fillStyle='#463126';ctx.beginPath();ctx.ellipse(x-side*2,244,7,8,0,0,TAU);ctx.fill();ctx.fillStyle='#f7dfb5';ctx.beginPath();ctx.arc(x-2,241,2,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(x-18,243);ctx.quadraticCurveTo(x,232,x+18,243);ctx.stroke();}
  ctx.strokeStyle=elder?'#78634a':'#694730';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-17,222);ctx.quadraticCurveTo(x,216+(side>0?2:0),x+16,222);ctx.stroke();
 }
 // Keep the storybook face flat: one short, low-contrast nose mark.
 ctx.strokeStyle='rgba(119,70,48,.24)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(254,269);ctx.quadraticCurveTo(256,270,258,269);ctx.stroke();
 ctx.strokeStyle='#864931';ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(231,291);ctx.quadraticCurveTo(256,299,281,290);ctx.stroke();

 if(female){ctx.fillStyle='#9e392f';ctx.beginPath();ctx.ellipse(256,210,4.5,6,0,0,TAU);ctx.fill();}
 if(elder){ctx.strokeStyle='#a67b56';ctx.lineWidth=1.7;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(256+side*69,250);ctx.lineTo(256+side*77,254);ctx.stroke();}}
 const map=new THREE.CanvasTexture(c);map.encoding=THREE.sRGBEncoding;map.anisotropy=2;maps[expression]=map;
 }return maps;
}
