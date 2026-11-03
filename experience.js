/* Loading reflects the actual hero GLB download. Errors and timeouts never lock the page. */
const loader=document.querySelector('.page-loader'),loaderBar=loader.querySelector('span'),heroModel=document.querySelector('#model');
document.body.classList.add('is-loading');
let ready=false,progress=0;
function showProgress(value){progress=Math.max(progress,Math.min(1,value));loaderBar.style.transform=`scaleX(${progress})`;loader.setAttribute('aria-valuenow',Math.round(progress*100))}
function finishLoading(){if(ready)return;ready=true;showProgress(1);setTimeout(()=>{loader.classList.add('is-done');document.body.classList.remove('is-loading');document.dispatchEvent(new Event('site-ready'))},250)}
heroModel.addEventListener('progress',e=>showProgress(e.detail.totalProgress));heroModel.addEventListener('load',finishLoading,{once:true});heroModel.addEventListener('error',finishLoading,{once:true});if(heroModel.loaded)finishLoading();setTimeout(finishLoading,15000);

const story=document.querySelector('.story'),storyModel=document.querySelector('#story-model'),cards=[...document.querySelectorAll('.glass-card')],prev=document.querySelector('.story-prev'),next=document.querySelector('.story-next');
let slide=0,busy=false,angle=0,lastWheel=0,touchY=null;
const motionReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration=motionReduced?0:950;
const easing='cubic-bezier(.22,1,.36,1)';
const storyRadius=()=>innerWidth<=760?'125%':'105%';
function fitStoryCamera(){if(!busy)storyModel.cameraOrbit=`${angle}deg 85deg ${storyRadius()}`}
fitStoryCamera();window.addEventListener('resize',fitStoryCamera);
function syncControls(){prev.disabled=slide===0;next.disabled=slide===2;document.querySelector('.story-count').textContent=`0${slide+1} / 03`;story.dataset.slide=slide}
syncControls();
async function goTo(target){
 if(busy||target<0||target>2||target===slide)return;
 busy=true;const old=cards[slide],incoming=cards[target],direction=Math.sign(target-slide),from=angle,to=-180*target;
 old.inert=true;old.setAttribute('aria-hidden','true');incoming.inert=false;incoming.removeAttribute('aria-hidden');incoming.classList.add('is-active');
 const exit=old.animate([{opacity:1,transform:'translateY(-50%)'},{opacity:0,transform:`translateY(calc(-50% - ${direction*65}px))`}],{duration:duration*.7,easing,fill:'forwards'});
 const enter=incoming.animate([{opacity:0,transform:`translateY(calc(-50% + ${direction*65}px))`},{opacity:1,transform:'translateY(-50%)'}],{duration,easing,fill:'backwards'});
 const rotation=new Promise(resolve=>{const start=performance.now();function frame(now){const t=duration?Math.min(1,(now-start)/duration):1;const eased=1-Math.pow(1-t,3);angle=from+(to-from)*eased;storyModel.cameraOrbit=`${angle}deg 85deg ${storyRadius()}`;if(storyModel.jumpCameraToGoal)storyModel.jumpCameraToGoal();if(t<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});
 await Promise.all([exit.finished,enter.finished,rotation]);old.classList.remove('is-active');exit.cancel();enter.cancel();slide=target;syncControls();busy=false;
}
prev.addEventListener('click',()=>goTo(slide-1));next.addEventListener('click',()=>goTo(slide+1));
function visible(){const r=story.getBoundingClientRect();return r.top<=3&&r.bottom>=innerHeight-3}
function alignStory(){busy=true;story.scrollIntoView({behavior:motionReduced?'instant':'smooth',block:'start'});setTimeout(()=>{busy=false},motionReduced?50:700)}
window.addEventListener('wheel',e=>{
 if(e.ctrlKey||Math.abs(e.deltaY)<3||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
 const now=performance.now(),quiet=now-lastWheel>180;lastWheel=now;const r=story.getBoundingClientRect(),direction=Math.sign(e.deltaY);
 if(direction>0&&r.top>3&&r.top<innerHeight*.8){e.preventDefault();if(!busy)alignStory();return}
 if(!visible())return;
 if(busy){e.preventDefault();return}
 const target=slide+direction;
 if(target>=0&&target<=2){e.preventDefault();if(quiet)goTo(target)}
},{passive:false});
story.addEventListener('keydown',e=>{const direction=['ArrowDown','PageDown','ArrowRight'].includes(e.key)?1:['ArrowUp','PageUp','ArrowLeft'].includes(e.key)?-1:0;if(direction&&slide+direction>=0&&slide+direction<=2){e.preventDefault();goTo(slide+direction)}});
story.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY},{passive:true});
story.addEventListener('touchmove',e=>{if(touchY===null)return;const delta=touchY-e.touches[0].clientY;if(Math.abs(delta)<25)return;const target=slide+Math.sign(delta);if(busy||(target>=0&&target<=2)){e.preventDefault();if(!busy)goTo(target);touchY=null}},{passive:false});
story.addEventListener('touchend',()=>{touchY=null},{passive:true});
new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!story.dataset.entered){story.dataset.entered='true';if(!motionReduced)cards[0].animate([{opacity:0,transform:'translateY(calc(-50% + 50px))'},{opacity:1,transform:'translateY(-50%)'}],{duration:900,easing})}},{threshold:.65}).observe(story);
storyModel.addEventListener('error',()=>{document.querySelector('.story-error').hidden=false});
