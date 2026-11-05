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
const heroPicker=document.querySelector('.hero-color-picker');
const colorSection=document.querySelector('.color-stage'),colorHeading=document.querySelector('.color-heading'),colorPicker=document.querySelector('.color-picker'),colorShadow=document.querySelector('.color-shadow');
function colorsTop(){return colorSection.getBoundingClientRect().top+scrollY}
const lifestyle=document.querySelector('.lifestyle-stage'),lifestylePhoto=lifestyle.querySelector('.lifestyle-photo');
const photoReady=lifestyle.querySelector('img').hasAttribute('src');lifestyle.hidden=!photoReady;
function lifestyleTop(){return lifestyle.getBoundingClientRect().top+scrollY}
function colorStart(){return photoReady?7:6}
function sceneEnd(){return colorStart()+1}
const layer=document.createElement('div');layer.className='shared-product';layer.append(heroModel);document.body.append(layer);
const morph=document.createElement('div');morph.className='brand-morph';morph.textContent='SafeClick';morph.setAttribute('aria-hidden','true');morph.hidden=true;document.body.append(morph);
heroModel.removeAttribute('camera-controls');heroModel.setAttribute('disable-zoom','');heroModel.setAttribute('disable-pan','');heroModel.setAttribute('tabindex','-1');
heroModel.interpolationDecay=0;
heroModel.setAttribute('min-camera-orbit','auto auto 0.01m');heroModel.setAttribute('max-camera-orbit','auto auto 1m');
heroModel.addEventListener('load',()=>{heroModel.animationName='Device workflow';heroModel.pause();heroModel.currentTime=0});
let phase=0,angle=0,touchY=null,frameState=0,targetState=0,raf=0,lastFrame=0,lastWrite=0,mouseX=0,mouseY=0,mouseTargetX=0,mouseTargetY=0,needsPaint=true,lastSceneScroll=null;
const motionReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

function sceneHeight(){return document.querySelector('.screen').clientHeight}
function storyTop(){return story.getBoundingClientRect().top+scrollY}
function interpolate(a,b,t){return a+(b-a)*t}
function paint(state){
 frameState=state;const t=Math.max(0,Math.min(1,state)),rect=slot.getBoundingClientRect(),vh=sceneHeight(),vw=document.documentElement.clientWidth;
 const heroY=rect.top+scrollY;const mobile=vw<=760;
 const operation=smooth(3,4,state),colorProgress=smooth(colorStart(),sceneEnd(),state);
 const workflowExit=photoReady&&state>6?Math.min(0,workflowTop()-scrollY):0;
 const end={left:mobile?vw*.025:vw*.12,top:mobile?interpolate(vh*.09,vh*.2,operation):interpolate(vh*.12,vh*.16,operation),width:mobile?vw*.95:vw*.76,height:mobile?vh*.43:vh*.76};
 // Keep the WebGL viewport constant during scrolling. Only the compositor layer moves/scales.
 const visualHeight=interpolate(Math.max(80,rect.height-86)*1.09,end.height,t);
 const centerX=interpolate(rect.left+rect.width/2,end.left+end.width/2,t);
 const centerY=interpolate(heroY+Math.max(80,rect.height-86)/2,end.top+end.height/2,t)+workflowExit;
 const scale=visualHeight/end.height;
 layer.style.left='0px';layer.style.top='0px';
 layer.style.width=`${end.width}px`;layer.style.height=`${end.height}px`;
 layer.style.transform=`translate3d(${centerX-end.width/2}px,${centerY-end.height/2}px,0) scale(${scale})`;
 layer.style.opacity=(photoReady&&state>6&&workflow.getBoundingClientRect().bottom<=0)||scrollY>colorsTop()+vh*.65?'0':'1';
 const spin=Math.max(0,Math.min(2,state-1));
 angle=interpolate(interpolate(0,-8,t)-35*Math.sin(spin*Math.PI),0,operation);
 const pointerGain=smooth(.9,1,state)*(photoReady?1-smooth(5.8,6,state):1);
 const tilt=interpolate(interpolate(85,82,t)-16*Math.sin(spin*Math.PI*2),85,operation)+mouseY*2*pointerGain;
 const roll=interpolate(interpolate(40,-12,t)+180*spin,360,operation);
 heroModel.orientation=`${-roll}deg ${28*Math.sin(spin*Math.PI)*(1-operation)}deg 0deg`;
 heroModel.shadowIntensity=0;
 if(heroModel.loaded){const time=photoReady&&state>=6?3:Math.max(0,Math.min(4,state-3));if(Math.abs(heroModel.currentTime-time)>.00001)heroModel.currentTime=time;}
 // Neutral-model fit in meters preserves the previous size without auto-framing each pose.
 const radius=.179346594*interpolate(.75,1.05,t);heroModel.cameraOrbit=`${angle+mouseX*3*pointerGain}deg ${tilt}deg ${radius}m`;heroModel.style.transform=`translate(${mouseX*6*pointerGain}px,${mouseY*4*pointerGain}px) rotate(0deg)`;
 const titleRect=title.getBoundingClientRect(),target=brand.getBoundingClientRect();const size=parseFloat(getComputedStyle(title).fontSize),brandSize=parseFloat(getComputedStyle(brand).fontSize);
 morph.style.left=`${interpolate(titleRect.left,target.left,t)}px`;morph.style.top=`${interpolate(titleRect.top+scrollY,target.top,t)}px`;morph.style.fontSize=`${interpolate(size,brandSize,t)}px`;morph.style.letterSpacing=`${interpolate(-.065*size,-1.2,t)}px`;
 morph.hidden=state===0;title.style.opacity=state===0?'1':'0';heading.querySelector('.eyebrow').style.opacity=String(1-t);
 heroCopy.style.opacity=String(1-smooth(.02,.85,t));
 // Entry masks never animate during exit: fade the complete paragraph block.
 heroCopy.querySelectorAll('.line-text').forEach(line=>{if(t>.001)line.getAnimations().forEach(animation=>animation.cancel());line.style.opacity='1';line.style.transform='none'});
 heroPicker.style.opacity=String(1-smooth(.01,.4,state));heroPicker.inert=state>.15;
 if(photoReady){const reveal=smooth(6,7,state);lifestylePhoto.style.transform=`scale(${interpolate(mobile?.55:.32,1,reveal)})`;lifestylePhoto.style.visibility=reveal>0&&scrollY<=colorsTop()?'visible':'hidden';lifestylePhoto.style.opacity=String(smooth(6,6.12,state)*(1-colorProgress))}
 updateCards(state);
 updateSteps(state);
 colorHeading.style.opacity=String(colorProgress);colorPicker.style.opacity=String(colorProgress);colorPicker.inert=colorProgress<.9;colorHeading.style.visibility=colorPicker.style.visibility=colorProgress>.001?'visible':'hidden';colorShadow.style.opacity=String(colorProgress);
 brand.style.pointerEvents=t===1?'auto':'none';
 if(scrollY>colorsTop()+vh*.7)morph.hidden=true;
}
function smooth(a,b,value){const x=Math.max(0,Math.min(1,(value-a)/(b-a)));return x*x*(3-2*x)}
function updateCards(state){
 const weights=[smooth(.32,1,state)*(1-smooth(1.15,2,state)),smooth(1.15,2,state)*(1-smooth(2.15,3,state)),smooth(2.15,3,state)];
 cards.forEach((card,i)=>{const opacity=weights[i]*(1-smooth(3,4,state)),entered=state>=i+1,offset=entered?-55*(1-opacity):55*(1-opacity);card.style.opacity=String(opacity);card.style.transform=`translateY(calc(-50% + ${offset}px))`;card.style.visibility=opacity>.001?'visible':'hidden';card.inert=opacity<.5;card.setAttribute('aria-hidden',String(opacity<.5));card.style.pointerEvents=opacity>=.5?'auto':'none'});
 phase=Math.round(state);story.dataset.slide=state<.3?'hero':String(Math.max(0,Math.round(state)-1));document.body.dataset.phase=phase;
}
function updateSteps(state){
 const weights=[smooth(3.25,4,state)*(1-smooth(4.15,5,state)),smooth(4.15,5,state)*(1-smooth(5.15,6,state)),smooth(5.15,6,state)];
 stepPanels.forEach((panel,i)=>{const opacity=weights[i]*(1-smooth(6,7,state));panel.style.opacity=String(opacity);[...panel.children].forEach(child=>{child.style.opacity=String(opacity)});panel.style.visibility=opacity>.001?'visible':'hidden';panel.inert=opacity<.5;panel.setAttribute('aria-hidden',String(opacity<.5))});
 const selectedStep=Math.max(0,Math.min(2,Math.round(state-4)));
 workflow.dataset.step=String(selectedStep);
 document.querySelectorAll('[data-goto-step]').forEach(button=>{const active=Number(button.dataset.gotoStep)===selectedStep;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
}
function sceneScroll(state){const before=storyTop()*Math.min(1,state)+(workflowTop()-storyTop())*smooth(3,4,state);return before+(photoReady?(lifestyleTop()-workflowTop())*smooth(6,7,state)+(colorsTop()-lifestyleTop())*smooth(7,8,state):(colorsTop()-workflowTop())*smooth(6,7,state))}
let menuTransition=null;
function schedulePaint(){needsPaint=true;if(!raf)raf=requestAnimationFrame(tick)}
function tick(now){
 const dt=lastFrame?Math.min(40,now-lastFrame):16;lastFrame=now;
 const distance=targetState-frameState;
 const step=motionReduced?distance:Math.sign(distance)*Math.min(Math.abs(distance)*(1-Math.exp(-dt/160)),.022*dt/16);
 let state=Math.abs(distance)<.001?targetState:frameState+step;
 if(menuTransition){
  const progress=motionReduced?1:Math.max(0,Math.min(1,(now-menuTransition.start)/650));
  const ease=progress*progress*(3-2*progress);
  state=interpolate(menuTransition.from,targetState,ease);
  if(progress===1){state=targetState;menuTransition=null}
 }
 const sceneChanged=state!==frameState;
 const dx=mouseTargetX-mouseX,dy=mouseTargetY-mouseY;
 const pointerChanged=Math.abs(dx)>.001||Math.abs(dy)>.001;
 const follow=1-Math.exp(-dt/110);
 mouseX=pointerChanged?mouseX+dx*follow:mouseTargetX;mouseY=pointerChanged?mouseY+dy*follow:mouseTargetY;
 if(sceneChanged){const top=sceneScroll(state);lastSceneScroll=top;lastWrite=now;if(Math.abs(scrollY-top)>.5)window.scrollTo({top,behavior:'instant'})}
 if(sceneChanged||pointerChanged||needsPaint){needsPaint=false;paint(state)}
 if(menuTransition||Math.abs(targetState-frameState)>.0001||Math.abs(mouseTargetX-mouseX)>.001||Math.abs(mouseTargetY-mouseY)>.001||needsPaint)raf=requestAnimationFrame(tick);
 else{raf=0;lastFrame=0}
}
function goTo(value){menuTransition=null;targetState=Math.max(0,Math.min(sceneEnd(),value));schedulePaint()}
function navigateTo(value){goTo(value);menuTransition={from:frameState,start:performance.now()}}
paint(0);
function consume(delta){
 const end=colorsTop(),y=scrollY;
 if(y>end+innerHeight*.7)return false;
 if(y>end+25){if(delta<0){goTo(sceneEnd());return true}return false}
 if((targetState===0&&frameState===0&&delta<0)||(targetState===sceneEnd()&&frameState===sceneEnd()&&delta>0))return false;
 goTo(targetState+Math.max(-.14,Math.min(.14,delta/900)));return true;
}
window.addEventListener('wheel',e=>{if(e.ctrlKey||!e.deltaY||Math.abs(e.deltaX)>Math.abs(e.deltaY)||document.body.classList.contains('is-loading'))return;const units=e.deltaMode===1?16:e.deltaMode===2?innerHeight:1;if(consume(e.deltaY*units))e.preventDefault()},{passive:false});
window.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,button,summary'))return;const direction=['ArrowDown','PageDown',' '].includes(e.key)?1:['ArrowUp','PageUp'].includes(e.key)?-1:0;if(direction&&scrollY<=colorsTop()+25){e.preventDefault();goTo(direction>0?Math.floor(targetState+.01)+1:Math.ceil(targetState-.01)-1)}});
window.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY},{passive:true});window.addEventListener('touchmove',e=>{if(touchY===null)return;const next=e.touches[0].clientY,d=touchY-next;touchY=next;if(consume(d*2))e.preventDefault()},{passive:false});window.addEventListener('touchend',()=>{touchY=null},{passive:true});
let sceneEndBeforeResize=colorsTop(),layoutWidth=innerWidth,layoutHeight=sceneHeight();
window.addEventListener('resize',()=>{
 const width=document.documentElement.clientWidth,height=sceneHeight();
 if(width===layoutWidth&&Math.abs(height-layoutHeight)<2)return;
 layoutWidth=width;layoutHeight=height;
 const inScene=scrollY<=sceneEndBeforeResize+32;sceneEndBeforeResize=colorsTop();
 if(inScene){const top=sceneScroll(frameState);lastSceneScroll=top;lastWrite=performance.now();window.scrollTo({top,behavior:'instant'})}
 schedulePaint();
});new ResizeObserver(schedulePaint).observe(slot);
window.addEventListener('scroll',()=>{
 if(lastSceneScroll!==null&&Math.abs(scrollY-lastSceneScroll)<2)return;
 if(Math.abs(targetState-frameState)>.0001||performance.now()-lastWrite<120)return;
 const base=storyTop();
 if(scrollY<base*.25&&frameState>0)goTo(0);
 else if(Math.abs(scrollY-colorsTop())<4&&frameState<sceneEnd())goTo(sceneEnd());
 else if(Math.abs(scrollY-workflowTop())<4&&frameState<4)goTo(4);
 else if(Math.abs(scrollY-base)<4&&frameState<1)goTo(1);
 else schedulePaint();
},{passive:true});
brand.addEventListener('click',e=>{e.preventDefault();navigateTo(0)});
document.querySelectorAll('[data-scene-target]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();navigateTo(Number(link.dataset.sceneTarget))}));
heroModel.addEventListener('error',()=>{document.querySelector('.story-error').hidden=false});

// A small, damped response to pointer motion; disabled for touch and reduced motion.
if(!motionReduced&&matchMedia('(pointer:fine)').matches){
 window.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;
  mouseTargetX=frameState>=1?(e.clientX/innerWidth-.5)*2:0;
  mouseTargetY=frameState>=1?(e.clientY/innerHeight-.5)*2:0;
  schedulePaint();
 });
 document.documentElement.addEventListener('pointerleave',()=>{mouseTargetX=mouseTargetY=0;schedulePaint()});
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

const finishes={black:{name:'Schwarz',hex:'#3c3e40',metallic:.75,roughness:.58},rose:{name:'Rosé',hex:'#d3a198',metallic:.78,roughness:.52},silver:{name:'Silber',hex:null},blue:{name:'Stahlblau',hex:'#8fb8ce',metallic:.7,roughness:.55}};
let selectedFinish='silver',originalFinishes=[],lockHighlightTexture=null,lockHighlightPromise=null;
function applyFinish(){
 const finish=finishes[selectedFinish];
 for(const {material,color,metallic,roughness} of originalFinishes){const pbr=material.pbrMetallicRoughness;pbr.setBaseColorFactor(finish.hex||color);pbr.setMetallicFactor(finish.hex?(material.name.includes('textile')?0:finish.metallic):metallic);pbr.setRoughnessFactor(finish.hex?(material.name.includes('textile')?.86:finish.roughness):roughness)}
 const locks=heroModel.model?.materials.find(material=>material.name==='Aluminum with printed lock symbols');
 if(locks){const highlight=(selectedFinish==='black'||selectedFinish==='blue')&&lockHighlightTexture;locks.emissiveTexture.setTexture(highlight||null);locks.setEmissiveFactor(highlight?[.32,.36,.40]:[0,0,0])}
 document.querySelectorAll('.color-swatch').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.color===selectedFinish)));
 document.querySelectorAll('.color-name').forEach(label=>{label.textContent=finish.name});
}
function rememberFinishes(){originalFinishes=heroModel.model.materials.filter(material=>material.name!=='Recessed dark hardware').map(material=>({material,color:[...material.pbrMetallicRoughness.baseColorFactor],metallic:material.pbrMetallicRoughness.metallicFactor,roughness:material.pbrMetallicRoughness.roughnessFactor}));applyFinish();prepareLockHighlight().catch(error=>console.error('Lock highlights failed',error))}
heroModel.addEventListener('load',rememberFinishes,{once:true});if(heroModel.loaded)rememberFinishes();
document.querySelectorAll('.color-swatch').forEach(button=>button.addEventListener('click',()=>{selectedFinish=button.dataset.color;applyFinish()}));

// Only the printed glyph pixels receive a light gray contribution on dark finishes.
function prepareLockHighlight(){
 if(lockHighlightPromise)return lockHighlightPromise;
 lockHighlightPromise=(async()=>{
  const image=new Image();image.src='./assets/collar-locks-source.png';await image.decode();
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
  const pixels=context.getImageData(0,0,canvas.width,canvas.height);
  for(let i=0;i<pixels.data.length;i+=4){const value=Math.round(255*Math.max(0,Math.min(1,(155-pixels.data[i])/45)));pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;pixels.data[i+3]=255}
  context.putImageData(pixels,0,0);lockHighlightTexture=await heroModel.createTexture(canvas.toDataURL('image/png'));applyFinish();
 })();return lockHighlightPromise;
}

document.querySelectorAll('[data-goto-step]').forEach(button=>button.addEventListener('click',()=>goTo(4+Number(button.dataset.gotoStep))));
