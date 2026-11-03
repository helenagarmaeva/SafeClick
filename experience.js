/* Loading reflects the actual hero GLB download. Errors and timeouts never lock the page. */
const loader=document.querySelector('.page-loader'),loaderBar=loader.querySelector('span'),heroModel=document.querySelector('#model');
document.body.classList.add('is-loading');
let ready=false,progress=0;
function showProgress(value){progress=Math.max(progress,Math.min(1,value));loaderBar.style.transform=`scaleX(${progress})`;loader.setAttribute('aria-valuenow',Math.round(progress*100))}
function finishLoading(){if(ready)return;ready=true;showProgress(1);setTimeout(()=>{loader.classList.add('is-done');document.body.classList.remove('is-loading');document.dispatchEvent(new Event('site-ready'))},250)}
heroModel.addEventListener('progress',e=>showProgress(e.detail.totalProgress));heroModel.addEventListener('load',finishLoading,{once:true});heroModel.addEventListener('error',finishLoading,{once:true});if(heroModel.loaded)finishLoading();setTimeout(finishLoading,15000);

/* One persistent product: hero → enlarged story → reverse. */
const story=document.querySelector('.story'),cards=[...document.querySelectorAll('.glass-card')],slot=document.querySelector('.product'),heading=document.querySelector('.heading'),heroCopy=document.querySelector('.copy'),title=document.querySelector('h1'),brand=document.querySelector('.header-brand');
const layer=document.createElement('div');layer.className='shared-product';layer.append(heroModel);document.body.append(layer);
const morph=document.createElement('div');morph.className='brand-morph';morph.textContent='SafeClick';morph.setAttribute('aria-hidden','true');morph.hidden=true;document.body.append(morph);
heroModel.removeAttribute('camera-controls');heroModel.setAttribute('disable-zoom','');heroModel.setAttribute('disable-pan','');heroModel.setAttribute('tabindex','-1');
let phase=0,busy=false,angle=0,lastWheel=0,touchY=null,frameState=0;
const motionReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration=motionReduced?0:900,easing='cubic-bezier(.22,1,.36,1)';
function storyTop(){return story.getBoundingClientRect().top+scrollY}
function interpolate(a,b,t){return a+(b-a)*t}
function paint(state){
 frameState=state;const t=Math.max(0,Math.min(1,state)),rect=slot.getBoundingClientRect(),vh=innerHeight,vw=innerWidth;
 const heroY=rect.top+scrollY;const mobile=vw<=760;
 const end={left:mobile?vw*.025:vw*.12,top:mobile?vh*.09:vh*.12,width:mobile?vw*.95:vw*.76,height:mobile?vh*.43:vh*.76};
 // The hero rectangle is in document coordinates so that it does not jump with scroll.
 layer.style.left=`${interpolate(rect.left,end.left,t)}px`;layer.style.top=`${interpolate(heroY,end.top,t)}px`;
 layer.style.width=`${interpolate(rect.width,end.width,t)}px`;layer.style.height=`${interpolate(rect.height,end.height,t)}px`;
 layer.style.opacity=(scrollY>storyTop()+vh*.5)?'0':'1';
 const radius=interpolate(90,mobile?125:105,t);heroModel.cameraOrbit=`${angle}deg 85deg ${radius}%`;if(heroModel.jumpCameraToGoal)heroModel.jumpCameraToGoal();
 const titleRect=title.getBoundingClientRect(),target=brand.getBoundingClientRect();const size=parseFloat(getComputedStyle(title).fontSize),brandSize=parseFloat(getComputedStyle(brand).fontSize);
 morph.style.left=`${interpolate(titleRect.left,target.left,t)}px`;morph.style.top=`${interpolate(titleRect.top+scrollY,target.top,t)}px`;morph.style.fontSize=`${interpolate(size,brandSize,t)}px`;morph.style.letterSpacing=`${interpolate(-.065*size,-1.2,t)}px`;
 morph.hidden=state===0;title.style.opacity=state===0?'1':'0';heading.querySelector('.eyebrow').style.opacity=String(1-t);heroCopy.style.opacity=String(1-t);
 brand.style.pointerEvents=t===1?'auto':'none';
 if(scrollY>storyTop()+vh*.7)morph.hidden=true;
}
function currentCard(){return phase>0?phase-1:-1}
function markPhase(){story.dataset.slide=phase?String(phase-1):'hero';document.body.dataset.phase=phase}
markPhase();paint(0);
async function goTo(target){
 if(busy||target<0||target>3)return;
 const dest=target===0?0:storyTop();if(target===phase&&Math.abs(scrollY-dest)<3)return;
 busy=true;const fromPhase=frameState,fromAngle=angle,fromY=scrollY,toAngle=-180*Math.max(0,target-1),direction=target>=phase?1:-1;
 const old=currentCard()>=0?cards[currentCard()]:null,incoming=target?cards[target-1]:null,animations=[];
 if(old&&old!==incoming){old.inert=true;old.setAttribute('aria-hidden','true');animations.push(old.animate([{opacity:1,transform:'translateY(-50%)'},{opacity:0,transform:`translateY(calc(-50% - ${direction*60}px))`}],{duration:duration*.65,easing,fill:'forwards'}))}
 if(incoming&&incoming!==old){incoming.classList.add('is-active');incoming.inert=false;incoming.removeAttribute('aria-hidden');animations.push(incoming.animate([{opacity:0,transform:`translateY(calc(-50% + ${direction*60}px))`},{opacity:1,transform:'translateY(-50%)'}],{duration,delay:target===1&&phase===0?duration*.12:0,easing,fill:'backwards'}))}
 const movement=new Promise(resolve=>{const start=performance.now();function tick(now){const u=duration?Math.min(1,(now-start)/duration):1,k=1-Math.pow(1-u,3);angle=interpolate(fromAngle,toAngle,k);window.scrollTo({top:interpolate(fromY,dest,k),behavior:'instant'});paint(interpolate(fromPhase,target,k));if(u<1)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});
 await Promise.all([movement,...animations.map(a=>a.finished)]);if(old&&old!==incoming)old.classList.remove('is-active');animations.forEach(a=>a.cancel());phase=target;frameState=target;angle=toAngle;markPhase();paint(target);busy=false;
}
function handleDirection(direction){
 if(busy)return true;
 const y=scrollY,base=storyTop(),vh=innerHeight;
 if(y>base+vh*.7)return false;
 if(y>base+25){if(direction<0){goTo(3);return true}return false}
 if(direction>0&&phase<3){goTo(phase+1);return true}
 if(direction<0&&phase>0){goTo(phase-1);return true}
 return false;
}
window.addEventListener('wheel',e=>{if(e.ctrlKey||Math.abs(e.deltaY)<3||Math.abs(e.deltaX)>Math.abs(e.deltaY)||document.body.classList.contains('is-loading'))return;const now=performance.now(),quiet=now-lastWheel>180;lastWheel=now;if(busy){e.preventDefault();return}if(!quiet){if(scrollY<=storyTop()+25&&!(phase===3&&e.deltaY>0)&&!(phase===0&&e.deltaY<0))e.preventDefault();return}if(handleDirection(Math.sign(e.deltaY)))e.preventDefault()},{passive:false});
window.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,button,summary'))return;const direction=['ArrowDown','PageDown',' '].includes(e.key)?1:['ArrowUp','PageUp'].includes(e.key)?-1:0;if(direction&&handleDirection(direction))e.preventDefault()});
window.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY},{passive:true});window.addEventListener('touchmove',e=>{if(touchY===null)return;const d=touchY-e.touches[0].clientY;if(Math.abs(d)<28)return;if(busy||handleDirection(Math.sign(d))){e.preventDefault();touchY=null}},{passive:false});window.addEventListener('touchend',()=>{touchY=null},{passive:true});
window.addEventListener('resize',()=>{if(!busy)paint(phase)});new ResizeObserver(()=>{if(!busy)paint(phase)}).observe(slot);
// Scrollbar, browser navigation, and anchor links also produce the correct scene.
window.addEventListener('scroll',()=>{if(busy)return;const base=storyTop();if(scrollY<base*.25&&phase!==0){cards.forEach(c=>{c.classList.remove('is-active');c.inert=true;c.setAttribute('aria-hidden','true')});phase=0;angle=0;markPhase()}else if(Math.abs(scrollY-base)<4&&phase===0){goTo(1)}paint(phase)},{passive:true});
brand.addEventListener('click',e=>{e.preventDefault();goTo(0)});
heroModel.addEventListener('error',()=>{document.querySelector('.story-error').hidden=false});
