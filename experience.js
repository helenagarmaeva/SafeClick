/* Loading reflects the actual hero GLB download. Errors and timeouts never lock the page. */
const loader=document.querySelector('.page-loader'),loaderBar=loader.querySelector('span'),heroModel=document.querySelector('#model');
document.body.classList.add('is-loading');
let ready=false,progress=0;
function showProgress(value){progress=Math.max(progress,Math.min(1,value));loaderBar.style.transform=`scaleX(${progress})`;loader.setAttribute('aria-valuenow',Math.round(progress*100))}
function finishLoading(){if(ready)return;ready=true;showProgress(1);setTimeout(()=>{loader.classList.add('is-done');document.body.classList.remove('is-loading');document.dispatchEvent(new Event('site-ready'))},250)}
heroModel.addEventListener('progress',e=>showProgress(e.detail.totalProgress));heroModel.addEventListener('load',finishLoading,{once:true});heroModel.addEventListener('error',finishLoading,{once:true});if(heroModel.loaded)finishLoading();setTimeout(finishLoading,15000);

/* One persistent product: hero → enlarged story → reverse. */
const story=document.querySelector('.story'),cards=[...document.querySelectorAll('.glass-card')],slot=document.querySelector('.product'),heading=document.querySelector('.heading'),heroCopy=document.querySelector('.copy'),title=document.querySelector('h1'),brand=document.querySelector('.header-brand');
const workflow=document.querySelector('.workflow'),stepPanels=[...document.querySelectorAll('.workflow-panel')];
function workflowTop(){return workflow.getBoundingClientRect().top+scrollY}
const layer=document.createElement('div');layer.className='shared-product';layer.append(heroModel);document.body.append(layer);
const morph=document.createElement('div');morph.className='brand-morph';morph.textContent='SafeClick';morph.setAttribute('aria-hidden','true');morph.hidden=true;document.body.append(morph);
heroModel.removeAttribute('camera-controls');heroModel.setAttribute('disable-zoom','');heroModel.setAttribute('disable-pan','');heroModel.setAttribute('tabindex','-1');
heroModel.addEventListener('load',()=>{heroModel.animationName='Device workflow';heroModel.pause();heroModel.currentTime=0});
let phase=0,angle=0,touchY=null,frameState=0,targetState=0,raf=0,lastFrame=0,lastWrite=0,mouseX=0,mouseY=0,mouseTargetX=0,mouseTargetY=0,mouseRaf=0;
const motionReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

function storyTop(){return story.getBoundingClientRect().top+scrollY}
function interpolate(a,b,t){return a+(b-a)*t}
function paint(state){
 frameState=state;const t=Math.max(0,Math.min(1,state)),rect=slot.getBoundingClientRect(),vh=innerHeight,vw=innerWidth;
 const heroY=rect.top+scrollY;const mobile=vw<=760;
 const operation=smooth(3,4,state);
 const end={left:mobile?vw*.025:vw*.12,top:mobile?interpolate(vh*.09,vh*.2,operation):interpolate(vh*.12,vh*.16,operation),width:mobile?vw*.95:vw*.76,height:mobile?vh*.43:vh*.76};
 // The hero rectangle is in document coordinates so that it does not jump with scroll.
 layer.style.left=`${interpolate(rect.left,end.left,t)}px`;layer.style.top=`${interpolate(heroY,end.top,t)}px`;
 layer.style.width=`${interpolate(rect.width,end.width,t)}px`;layer.style.height=`${interpolate(rect.height,end.height,t)}px`;
 layer.style.opacity=(scrollY>workflowTop()+vh*.65)?'0':'1';
 const spin=Math.max(0,Math.min(2,state-1)),fraction=spin%1;
 angle=interpolate(interpolate(0,-8,t)-35*Math.sin(spin*Math.PI),0,operation);
 const pointerGain=state>=1?1:0;
 const tilt=interpolate(interpolate(85,82,t)-16*Math.sin(spin*Math.PI*2),85,operation)+mouseY*2*pointerGain;
 const roll=interpolate(interpolate(40,-12,t)+180*spin,360,operation);
 heroModel.orientation=`${-roll}deg ${28*Math.sin(spin*Math.PI)*(1-operation)}deg 0deg`;
 heroModel.shadowIntensity=0;
 if(heroModel.loaded){heroModel.currentTime=Math.max(0,Math.min(2,state-4));}
 const radius=interpolate(90,mobile?145:130,t);heroModel.cameraOrbit=`${angle+mouseX*3*pointerGain}deg ${tilt}deg ${radius}%`;heroModel.style.transform=`translate(${mouseX*6*pointerGain}px,${mouseY*4*pointerGain}px) rotate(0deg)`;if(heroModel.jumpCameraToGoal)heroModel.jumpCameraToGoal();
 const titleRect=title.getBoundingClientRect(),target=brand.getBoundingClientRect();const size=parseFloat(getComputedStyle(title).fontSize),brandSize=parseFloat(getComputedStyle(brand).fontSize);
 morph.style.left=`${interpolate(titleRect.left,target.left,t)}px`;morph.style.top=`${interpolate(titleRect.top+scrollY,target.top,t)}px`;morph.style.fontSize=`${interpolate(size,brandSize,t)}px`;morph.style.letterSpacing=`${interpolate(-.065*size,-1.2,t)}px`;
 morph.hidden=state===0;title.style.opacity=state===0?'1':'0';heading.querySelector('.eyebrow').style.opacity=String(1-t);
 heroCopy.style.opacity=String(1-smooth(.02,.85,t));
 // Entry masks never animate during exit: fade the complete paragraph block.
 heroCopy.querySelectorAll('.line-text').forEach(line=>{if(t>.001)line.getAnimations().forEach(animation=>animation.cancel());line.style.opacity='1';line.style.transform='none'});
 updateCards(state);
 updateSteps(state);
 brand.style.pointerEvents=t===1?'auto':'none';
 if(scrollY>workflowTop()+vh*.7)morph.hidden=true;
}
function smooth(a,b,value){const x=Math.max(0,Math.min(1,(value-a)/(b-a)));return x*x*(3-2*x)}
function updateCards(state){
 const weights=[smooth(.32,1,state)*(1-smooth(1.15,2,state)),smooth(1.15,2,state)*(1-smooth(2.15,3,state)),smooth(2.15,3,state)];
 cards.forEach((card,i)=>{const opacity=weights[i]*(1-smooth(3,4,state)),entered=state>=i+1,offset=entered?-55*(1-opacity):55*(1-opacity);card.style.opacity=String(opacity);card.style.transform=`translateY(calc(-50% + ${offset}px))`;card.style.visibility=opacity>.001?'visible':'hidden';card.inert=opacity<.5;card.setAttribute('aria-hidden',String(opacity<.5));card.style.pointerEvents=opacity>=.5?'auto':'none'});
 phase=Math.round(state);story.dataset.slide=state<.3?'hero':String(Math.max(0,Math.round(state)-1));document.body.dataset.phase=phase;
}
function updateSteps(state){
 const weights=[smooth(3.25,4,state)*(1-smooth(4.15,5,state)),smooth(4.15,5,state)*(1-smooth(5.15,6,state)),smooth(5.15,6,state)];
 stepPanels.forEach((panel,i)=>{const opacity=weights[i];panel.style.opacity=String(opacity);panel.style.visibility=opacity>.001?'visible':'hidden';panel.inert=opacity<.5;panel.setAttribute('aria-hidden',String(opacity<.5))});
 workflow.dataset.step=String(Math.max(0,Math.min(2,Math.round(state-4))));
}
function sceneScroll(state){return storyTop()*Math.min(1,state)+(workflowTop()-storyTop())*smooth(3,4,state)}
function tick(now){
 const dt=lastFrame?Math.min(40,now-lastFrame):16;lastFrame=now;
 const distance=targetState-frameState;
 const step=motionReduced?distance:Math.sign(distance)*Math.min(Math.abs(distance)*(1-Math.exp(-dt/160)),.022*dt/16);
 const state=Math.abs(distance)<.001?targetState:frameState+step;
 lastWrite=performance.now();window.scrollTo({top:sceneScroll(state),behavior:'instant'});paint(state);
 if(Math.abs(targetState-frameState)>.0001)raf=requestAnimationFrame(tick);else{raf=0;lastFrame=0}
}
function goTo(value){targetState=Math.max(0,Math.min(6,value));if(!raf)raf=requestAnimationFrame(tick)}
paint(0);
function consume(delta){
 const end=workflowTop(),y=scrollY;
 if(y>end+innerHeight*.7)return false;
 if(y>end+25){if(delta<0){goTo(6);return true}return false}
 if((targetState<=0&&delta<0)||(targetState>=6&&frameState>=5.999&&delta>0))return false;
 goTo(targetState+Math.max(-.14,Math.min(.14,delta/900)));return true;
}
window.addEventListener('wheel',e=>{if(e.ctrlKey||!e.deltaY||Math.abs(e.deltaX)>Math.abs(e.deltaY)||document.body.classList.contains('is-loading'))return;const units=e.deltaMode===1?16:e.deltaMode===2?innerHeight:1;if(consume(e.deltaY*units))e.preventDefault()},{passive:false});
window.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,button,summary'))return;const direction=['ArrowDown','PageDown',' '].includes(e.key)?1:['ArrowUp','PageUp'].includes(e.key)?-1:0;if(direction&&scrollY<=workflowTop()+25){e.preventDefault();goTo(direction>0?Math.floor(targetState+.01)+1:Math.ceil(targetState-.01)-1)}});
window.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY},{passive:true});window.addEventListener('touchmove',e=>{if(touchY===null)return;const next=e.touches[0].clientY,d=touchY-next;touchY=next;if(consume(d*2))e.preventDefault()},{passive:false});window.addEventListener('touchend',()=>{touchY=null},{passive:true});
window.addEventListener('resize',()=>paint(frameState));new ResizeObserver(()=>paint(frameState)).observe(slot);
window.addEventListener('scroll',()=>{if(raf||performance.now()-lastWrite<120)return;const base=storyTop();if(scrollY<base*.25&&frameState>0){targetState=0;paint(0)}else if(Math.abs(scrollY-workflowTop())<4&&frameState<4){goTo(4)}else if(Math.abs(scrollY-base)<4&&frameState<1){goTo(1)}else paint(frameState)},{passive:true});
brand.addEventListener('click',e=>{e.preventDefault();goTo(0)});
heroModel.addEventListener('error',()=>{document.querySelector('.story-error').hidden=false});

// A small, damped response to pointer motion; disabled for touch and reduced motion.
function drift(){
 mouseX+=(mouseTargetX-mouseX)*.075;mouseY+=(mouseTargetY-mouseY)*.075;
 if(Math.abs(mouseTargetX-mouseX)<.001&&Math.abs(mouseTargetY-mouseY)<.001){mouseX=mouseTargetX;mouseY=mouseTargetY;mouseRaf=0;paint(frameState);return}
 paint(frameState);mouseRaf=requestAnimationFrame(drift);
}
if(!motionReduced&&matchMedia('(pointer:fine)').matches){
 window.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;if(frameState<1){mouseTargetX=mouseTargetY=0;if(mouseX||mouseY){if(!mouseRaf)mouseRaf=requestAnimationFrame(drift)}return}mouseTargetX=(e.clientX/innerWidth-.5)*2;mouseTargetY=(e.clientY/innerHeight-.5)*2;if(!mouseRaf)mouseRaf=requestAnimationFrame(drift)});
 document.documentElement.addEventListener('pointerleave',()=>{mouseTargetX=mouseTargetY=0;if(!mouseRaf)mouseRaf=requestAnimationFrame(drift)});
}
// Duplicate visual lettering only; controls retain one accessible label.
document.querySelectorAll('a:not(.header-brand),button,summary').forEach(control=>{
 const label=control.textContent.trim();if(!label)return;
 if(!control.hasAttribute('aria-label'))control.setAttribute('aria-label',label);
 const wrap=document.createElement('span');wrap.className='roll-label';wrap.setAttribute('aria-hidden','true');
 for(const copy of [false,true]){
  const row=document.createElement('span');row.className=copy?'roll-row roll-copy':'roll-row roll-original';
  [...label].forEach((letter,index)=>{const char=document.createElement('span');char.className='roll-char';char.style.setProperty('--delay',`${Math.min(index*.012,.12)}s`);char.textContent=letter===' '?'\u00a0':letter;row.append(char)});
  wrap.append(row);
 }
 control.replaceChildren(wrap);control.classList.add('roll-control');
});
