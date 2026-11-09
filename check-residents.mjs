import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createResident,poseResident} from './dist/residents.js';
let poses=0,meshCount=0;
for(const [name,opts] of [['Riya',{sari:true}],['Maa',{sari:true}],['Dadu',{elder:true}],['Bunty',{child:true}],['Abheek',{cards:true,seatHeight:.5}]]){
 const p=createResident(name,'#9b805f',opts);p.name=name;
 for(const mode of ['idle','walk','run','rangoli','seated','clean','lights','decorate','instruct','prayer','visitor'])for(let i=0;i<12;i++){
  poseResident(p,i*.37,mode);p.g.updateMatrixWorld(true);poses++;
  p.g.traverse(o=>{assert(o.matrixWorld.elements.every(Number.isFinite),`${name}/${mode} has a finite transform`);if(o.isSkinnedMesh){const a=o.geometry.attributes.position,w=o.geometry.attributes.skinWeight;for(let j=0;j<a.count;j+=19){assert(Math.abs(w.getX(j)+w.getY(j)+w.getZ(j)+w.getW(j)-1)<.00001,'skin weights sum to one');const pt=new THREE.Vector3().fromBufferAttribute(a,j);o.boneTransform(j,pt);assert([pt.x,pt.y,pt.z].every(Number.isFinite),'deformed vertex stays finite');assert(pt.length()<3,'skin remains near its resident');}}});
  for(const a of p.arms){const shoulder=a.getWorldPosition(new THREE.Vector3()),elbow=a.userData.elbow.getWorldPosition(new THREE.Vector3()),wrist=a.userData.hand.getWorldPosition(new THREE.Vector3());const scale=p.g.scale.x;
   assert(Math.abs(shoulder.distanceTo(elbow)/scale-.29)<.007,'upper arm stays connected');assert(Math.abs(elbow.distanceTo(wrist)/scale-.26)<.007,'forearm stays connected');
  }
  assert.equal(p.crossed.visible,mode==='rangoli');assert.equal(p.sitting.visible,mode==='seated');
 }
 p.g.traverse(o=>{if(o.isMesh){meshCount++;assert([...o.geometry.attributes.position.array].every(Number.isFinite));}});
}
assert(meshCount<400,'joint-level batching keeps five residents under 400 draw calls');
console.log(`Passed: ${poses} character poses, connected limb lengths, finite geometry, posture-specific clothing and ${meshCount} batched meshes.`);

for(const name of ['Eeshita','Abheek','Anshu','Yash','Aayush','Ekansh']){
 const p=createResident(name,'#bfae79',{sari:name==='Eeshita',cards:true,seatHeight:.5});
 for(let t=0;t<9;t+=.5){poseResident(p,t,'seated');p.g.updateMatrixWorld(true);
  for(const leg of p.legs){const knee=leg.userData.knee.getWorldPosition(new THREE.Vector3()),ankle=leg.userData.ankle.getWorldPosition(new THREE.Vector3());
   assert(knee.z>.3&&knee.y>.4&&knee.y<.48,'seated knees extend in front of the chair');
   assert(ankle.y>.06&&ankle.y<.08,'sandals remain at floor height');assert(leg.userData.trouser.visible,'seated legs are rendered');
  }
  assert(Math.abs(p.body.position.y)<=.0081,'breathing has no laughing bounce');
 }
}
console.log('Passed: six poker residents keep visible bent legs and grounded feet, with calm breathing.');


// Poker wrists settle gently toward the felt, with connected articulated fingers.
const guest=createResident('Yash','#707b96',{cards:true,seatHeight:.5});
for(let i=0;i<=120;i++){
 guest.pokerReach=Math.sin(i/120*Math.PI);guest.pokerTarget=new THREE.Vector3(.1,.29,.49);
 poseResident(guest,i/60,'seated',1/60);
 const a=guest.arms[1],rotation=a.quaternion.clone().multiply(a.userData.elbow.quaternion).multiply(a.userData.hand.quaternion);
 const palmDirection=new THREE.Vector3(0,-1,0).applyQuaternion(rotation);
 if(i>20)assert(palmDirection.angleTo(new THREE.Vector3(0,0,1))<.35,'palm remains relaxed above table without twisting');
 assert.equal(a.userData.hand.userData.soft.fingers.length,4);assert.equal(a.userData.hand.userData.soft.mesh.skeleton.bones.length,6);
 guest.g.updateMatrixWorld(true);assert(guest.arms.every(a=>a.userData.hand.matrixWorld.elements.every(Number.isFinite)));
}
console.log('Passed: relaxed poker wrists and five articulated digits through a complete reach and withdrawal.');

for(const name of ['Eeshita','Abheek','Anshu','Yash','Aayush','Ekansh']){
 const resident=createResident(name,'#b78365',{cards:true,seatHeight:.5,sari:name==='Eeshita'});resident.g.position.y=.05;
 for(let i=0;i<60;i++)poseResident(resident,i/60,'seated',1/60);resident.g.updateMatrixWorld(true);
 for(const arm of resident.arms){const wrist=arm.userData.hand.getWorldPosition(new THREE.Vector3());assert(wrist.y>.88&&wrist.y<.93,`${name}'s wrist rests above the felt`);}
}
console.log('Passed: all six players rest their hands above the tabletop.');
