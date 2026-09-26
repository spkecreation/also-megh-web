(() => {
 const root=document.documentElement,section=document.querySelector('#archive'),track=document.querySelector('.graphic-track'),loopButton=document.querySelector('#archive-motion'),viewer=document.querySelector('#image-viewer');
 const slider=document.querySelector('.graphic-window');
 let loop=true,hover=false,focused=false,visible=false,offset=0,last=0,frame=0,manualUntil=0,gesture=null,suppressClick=false;
 [...track.children].forEach(item=>{const clone=item.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.tabIndex=-1;track.append(clone)});
 slider.style.touchAction='pan-y';
 function draw(){const span=(track.scrollWidth+20)/2;if(span){offset=((offset%span)+span)%span;track.style.transform=`translate3d(${-offset}px,0,0)`}}
 function animate(now){frame=0;const dt=Math.min(40,now-last||16);last=now;if(loop&&!hover&&!focused&&!gesture&&now>manualUntil&&!root.classList.contains('motion-off')&&!document.hidden)offset+=dt*.018;draw();if(visible&&!document.hidden)frame=requestAnimationFrame(animate)}
 function start(){if(!frame){last=performance.now();frame=requestAnimationFrame(animate)}}
 slider.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')hover=true});slider.addEventListener('pointerleave',()=>hover=false);
 slider.addEventListener('focusin',()=>focused=true);slider.addEventListener('focusout',e=>{focused=slider.contains(e.relatedTarget)});
 function move(delta){offset+=delta;manualUntil=performance.now()+1000;draw();start()}
 slider.addEventListener('wheel',e=>{const horizontal=Math.abs(e.deltaX)>Math.abs(e.deltaY);if(!horizontal&&!e.shiftKey)return;const delta=horizontal?e.deltaX:e.deltaY;if(!delta)return;e.preventDefault();move(delta*(e.deltaMode===1?16:e.deltaMode===2?slider.clientWidth:1))},{passive:false});
 slider.addEventListener('pointerdown',e=>{if(e.button!==0)return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,last:e.clientX,drag:false};suppressClick=false});
 slider.addEventListener('pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(!gesture.drag){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){gesture=null;return}if(Math.abs(dx)<8)return;gesture.drag=true;slider.setPointerCapture(e.pointerId)}move(gesture.last-e.clientX);gesture.last=e.clientX;suppressClick=true});
 function endGesture(e){if(gesture?.id!==e.pointerId)return;if(slider.hasPointerCapture(e.pointerId))slider.releasePointerCapture(e.pointerId);gesture=null;manualUntil=performance.now()+1000;start()}
 slider.addEventListener('pointerup',endGesture);slider.addEventListener('pointercancel',endGesture);
 slider.addEventListener('dragstart',e=>e.preventDefault());
 slider.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false}},true);
 slider.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move((e.key==='ArrowRight'?1:-1)*240)}});
 loopButton.addEventListener('click',()=>{loop=!loop;loopButton.textContent=loop?'Pause the loop':'Resume the loop';loopButton.setAttribute('aria-pressed',String(loop))});
 const windows=new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)start()},{rootMargin:'150px'});windows.observe(document.querySelector('.graphic-window'));
 section.addEventListener('click',e=>{const button=e.target.closest('[data-image]');if(!button)return;viewer.querySelector('img').src=button.dataset.image;viewer.querySelector('img').alt=button.getAttribute('aria-label').replace('Enlarge','');viewer.showModal()});
 viewer.querySelector('button').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
 const films=[...section.querySelectorAll('video')];const active=new Set();
 function load(v){if(!v.src){v.src=v.dataset.archiveSrc;v.muted=true;v.loop=true;v.playsInline=true;v.load()}}
 function update(v){const b=v.parentElement.querySelector('button');b.textContent=v.paused?'Play film ↗':'Pause film';b.setAttribute('aria-label',`${v.paused?'Play':'Pause'} ${v.getAttribute('aria-label')}`)}
 function play(v){load(v);v.play().catch(()=>update(v))}
 const io=new IntersectionObserver(entries=>entries.forEach(({target:v,isIntersecting})=>{if(isIntersecting){active.add(v);if(!root.classList.contains('motion-off')&&!document.hidden&&!v.dataset.manualPause)play(v)}else{active.delete(v);v.pause()}}),{threshold:.45});
 films.forEach(v=>{io.observe(v);['play','pause'].forEach(e=>v.addEventListener(e,()=>update(v)));v.parentElement.querySelector('button').addEventListener('click',()=>{if(v.paused){delete v.dataset.manualPause;play(v)}else{v.dataset.manualPause='1';v.pause()}})});
 const cards=[...document.querySelectorAll('.archive-video')];
 function reveal(){cards.forEach((card,i)=>{const y=card.getBoundingClientRect().top;const p=Math.min(1,Math.max(0,(innerHeight-y)/(innerHeight*.55)));card.style.transform=root.classList.contains('motion-off')?'none':`translateY(${(1-p)*(i%2?70:35)}px) scale(${.94+p*.06})`;card.style.opacity=.3+.7*p})}
 addEventListener('scroll',reveal,{passive:true});addEventListener('resize',reveal);reveal();
 document.addEventListener('visibilitychange',()=>{if(document.hidden)films.forEach(v=>v.pause());else{if(visible)start();active.forEach(v=>{if(!v.dataset.manualPause&&!root.classList.contains('motion-off'))play(v)})}});
 new MutationObserver(()=>{if(root.classList.contains('motion-off'))films.forEach(v=>v.pause());else active.forEach(v=>{if(!v.dataset.manualPause&&!document.hidden)play(v)})}).observe(root,{attributes:true,attributeFilter:['class']});
})();
