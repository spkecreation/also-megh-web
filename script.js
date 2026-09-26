(() => {
 const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x)},range=(t,a,b)=>smooth((t-a)/(b-a));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let motion=true;try{const s=localStorage.getItem('rishabh-grid-motion-v4');if(s)motion=s==='on'}catch{}
 const root=document.documentElement,stage=document.querySelector('.stage'),journey=document.querySelector('#journey'),cells=[...document.querySelectorAll('.cell')],origin=document.querySelector('.origin'),toggle=document.querySelector('#motion-toggle'),videos=[...document.querySelectorAll('.video-area video')];
 const heroFilm=document.querySelector('#hero-film');let backgroundPlaying=false;
 const mobileMedia=matchMedia('(max-width: 700px)');
 function selectHeroFilm(){const next=mobileMedia.matches?heroFilm.dataset.mobileSrc:heroFilm.dataset.desktopSrc;if(heroFilm.getAttribute('src')!==next){heroFilm.src=next;heroFilm.load();backgroundPlaying=false;}}
 selectHeroFilm();mobileMedia.addEventListener('change',()=>{selectHeroFilm();schedule()});
 const desktopTiming=[[0,0],[.28,.35],[.65,.85],[1.12,1.5],[1.45,2],[1.8,2.5],[2.4,3.55],[3,4.8],[3.3,5.2],[3.9,6.25],[4.5,7.6],[5.3,8.7],[6.1,10],[6.9,11.3],[7.7,12.65],[8,13]];
 const mobileTiming=[[0,0],[.3,.35],[.7,.85],[1.15,1.5],[1.5,2],[2.2,2.5],[3,3.55],[4,4.8],[4.3,5.2],[5.2,6.25],[6.6,7.6],[7.2,8.5],[9,9.1],[9.8,9.8],[11.6,10.4],[12.3,11.1],[14.1,11.7],[14.8,12.4],[16.8,13]];
 function totalTime(){return mobileMedia.matches?16.8:8}
 function mapTime(value,inverse=false){const timing=mobileMedia.matches?mobileTiming:desktopTiming;const a=inverse?1:0,b=1-a;for(let i=1;i<timing.length;i++){if(value<=timing[i][a]){const prev=timing[i-1],next=timing[i];return mix(prev[b],next[b],clamp((value-prev[a])/(next[a]-prev[a])));}}return timing[timing.length-1][b];}

 const faces=cells.map(c=>[...c.querySelectorAll('.face')]);const modes=['work','about','process','play','contact'];const milestones={start:0,studies:2,work:2,john:3.55,veraine:6.25,about:8.7,process:10,play:11.3,contact:12.65};
 let width=innerWidth,height=innerHeight,ticking=false,focus=-1,lastMode='',lastPlayback='',layout=[];
 const stateAt=t=>t<7.8?{mode:0,blend:0}:t<9.1?{mode:1,blend:range(t,7.8,8.5)}:t<10.4?{mode:2,blend:range(t,9.1,9.8)}:t<11.7?{mode:3,blend:range(t,10.4,11.1)}:{mode:4,blend:range(t,11.7,12.4)};
 function proportions(mode){const small=width<700;return small?[[.5,.49],[.48,.55],[.5,.5],[.52,.52],[.57,.54]][mode]:[[.5,.55],[.43,.60],[.5,.5],[.56,.54],[.58,.60]][mode]}
 function measure(){width=innerWidth;height=stage.clientHeight;journey.style.height=(height*(totalTime()+1))+'px';render()}
 function play(v){v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;if(!v.src){v.src=v.dataset.src;v.load()}v.play().catch(()=>sync(v))}
 function sync(v){const b=v.parentElement.querySelector('button');b.textContent=v.paused?'Play':'Pause';b.setAttribute('aria-label',`${v.paused?'Play':'Pause'} ${v.getAttribute('aria-label')}`)}
 function render(){ticking=false;const physical=clamp(scrollY/(journey.offsetHeight-height))*totalTime();const raw=mapTime(physical);let t=raw;
 if(!motion&&width>=700){t=raw<2.8?2:raw<4.4?3.55:raw<5.5?4.95:raw<7.1?6.25:raw<7.8?7.6:raw<9.1?8.7:raw<10.4?10:raw<11.7?11.3:12.65}
 if(!motion&&width<700)t=Math.max(2,raw);
 stage.classList.toggle('is-idle',motion && raw<.06 && !document.hidden);
 stage.style.setProperty('--film-opacity',String((width<700?.76:.92)-((width<700?.76:.92)-.1)*range(raw,0,1.2)));
 document.querySelector('.scroll-dial').style.setProperty('--dial-angle',(raw/13*720)+'deg');
 root.classList.toggle('page-hidden',document.hidden);
 const shouldPlay=motion&&!document.hidden&&scrollY<journey.offsetHeight;if(shouldPlay!==backgroundPlaying){backgroundPlaying=shouldPlay;if(shouldPlay){heroFilm.muted=true;heroFilm.loop=true;heroFilm.playsInline=true;heroFilm.play().catch(()=>{backgroundPlaying=false})}else heroFilm.pause();}
 const state=stateAt(t),m=state.mode,b=state.blend;
 const before=proportions(Math.max(0,m-1)),after=proportions(m),px=m?mix(before[0],after[0],b):after[0],basePy=m?mix(before[1],after[1],b):after[1];
 let side=width<700?16:width*.04;const top=width<700?76:94,bottom=width<700?68:58;
 const gh=height-top-bottom;const mediaRatio=1104/718;const gw=width<700?width-32:width-side*2;side=(width-gw)/2;const workSplit=clamp((gw*.5/mediaRatio+(width<700?85:83))/gh);const py=m===0?workSplit:m===1?mix(workSplit,after[1],b):basePy;
 const opening=motion?range(t,.36,.86):1,reveal=motion?range(t,.64,.96):1;document.querySelector('.grid').style.transform='none';
 const frame=document.querySelector('.grid-skeleton');frame.style.left=side+'px';frame.style.top=(top+gh/2*(1-opening))+'px';frame.style.width=gw+'px';frame.style.height=Math.max(1,gh*opening)+'px';frame.style.opacity=motion?range(t,.28,.45)*(1-range(t,.82,1.02)):0;frame.style.setProperty('--split',py*100+'%');frame.style.setProperty('--divider',range(t,.42,.8));
 let f1=range(t,2.68,3.12)*(1-range(t,4.28,4.72)),f2=range(t,5.38,5.82)*(1-range(t,6.78,7.22));focus=f1>.01?0:f2>.01?1:-1;const expansion=Math.max(f1,f2);
 const regions=[[0,0,px,py],[px,0,1-px,py],[0,py,px,1-py],[px,py,1-px,1-py]];
 cells.forEach((cell,i)=>{
 const r=regions[i];let x=side+r[0]*gw,y=top+gh/2+(r[1]-.5)*gh*opening,w=r[2]*gw,h=Math.max(1,r[3]*gh*opening);
 if(width<700){
 const cardHeight=m===0?Math.max(gh*.64,gw/mediaRatio+98):Math.max(gh*.68,410);
 const starts=[1.95,8.5,9.8,11.1,12.4],ends=[7.75,9.08,10.38,11.68,13];
 const heights=m===0?[gw/mediaRatio+98,gw/mediaRatio+98,cardHeight,cardHeight]:[cardHeight,cardHeight,cardHeight,cardHeight];
 const shift=range(t,starts[m],ends[m])*(heights.reduce((a,b)=>a+b,0)+48-gh);
 const order=m===0?[0,1,3,2]:[0,1,2,3];
 x=16;w=gw;h=heights[i]*opening;y=top+order.slice(0,order.indexOf(i)).reduce((a,j)=>a+heights[j]+16,0)*opening-shift;
 }
 if(i===focus){x=mix(x,0,expansion);y=mix(y,0,expansion);w=mix(w,width,expansion);h=mix(h,height,expansion)}
 cell.style.left=x+'px';cell.style.top=y+'px';cell.style.width=w+'px';cell.style.height=h+'px';cell.style.zIndex=i===focus?10:1;
 cell.style.opacity=String(reveal*(focus>=0&&i!==focus?1-range(expansion,.03,.3):1));
 const visibleCell=!(focus>=0&&i!==focus&&expansion>.8)&&(width>=700||(y+h>70&&y<height-45));cell.inert=!visibleCell||reveal<.2;cell.setAttribute('aria-hidden',String(cell.inert));
 faces[i].forEach((face,k)=>{const cellReveal=motion?range(t,.65+i*.015,.92+i*.018):1;const alpha=(k===m?(m?b:1):k===m-1?1-b:0)*cellReveal;face.style.opacity=alpha;const active=alpha>.5&&visibleCell;face.classList.toggle('active',active);face.inert=!active;face.setAttribute('aria-hidden',String(!active));});
 const copy=cell.querySelector('.focus-copy');if(copy){const e=i===focus?expansion:0;copy.style.height=(e*(width<700?152:181))+'px';copy.style.paddingBottom=(e*(width<700?54:66))+'px';copy.style.opacity=range(e,.55,.95);copy.inert=e<.85;const area=cell.querySelector('.video-area');const caption=cell.querySelector('.project-caption').offsetHeight;const available=Math.max(0,h-caption-e*(width<700?152:181)-2);const ratio=videos[i].videoWidth?videos[i].videoWidth/videos[i].videoHeight:mediaRatio;const vw=Math.min(w-2,available*ratio);area.style.width=Math.max(0,vw)+'px';area.style.height=Math.max(0,vw/ratio)+'px';cell.querySelector('.expand').style.visibility=e>.5?'hidden':'visible';}
 });
 const stretch=range(t,.14,.48);origin.style.left='50%';origin.style.top=mix(height*.5,top+gh*.5,range(t,.08,.3))+'px';origin.style.width=mix(8,gw,stretch)+'px';origin.style.height=mix(8,1,stretch)+'px';origin.style.borderRadius=mix(50,0,stretch)+'%';origin.style.opacity=1-range(t,.5,.66);origin.style.transform='translate(-50%,-50%)';origin.style.setProperty('--tip-opacity',range(t,.22,.38)*(1-range(t,.52,.68)));
 const introOpacity=1-range(t,.4,.78);document.querySelector('.intro-hint').style.opacity=introOpacity;document.querySelector('.intro-hint').inert=introOpacity<.2;document.querySelector('.hero-intro').style.opacity=introOpacity;document.querySelector('.hero-intro').style.transform=`translateY(${-range(t,.32,.82)*25}px)`;document.querySelector('.hero-intro').setAttribute('aria-hidden',String(introOpacity<.2));
 const chrome=motion?range(t,.62,1):1;document.querySelector('header').style.opacity=1-range(expansion,.03,.3);document.querySelector('header').inert=expansion>.3;document.querySelector('header').classList.toggle('on-grid',raw>.72);
 document.querySelector('footer').style.opacity=motion?Math.max(.3,chrome)*(1-expansion*.15):1;
 const chapter=t<1.7?'THE BEGINNING':focus===0?'JOHN DAYON':focus===1?'VÉRAINE':['SELECTED WORK','ABOUT','PROCESS','PLAY','CONTACT'][m];document.querySelector('#chapter-name').textContent=chapter;document.querySelector('#chapter-number').textContent=String(m+1).padStart(2,'0');document.querySelector('#dial-number').textContent=String(m+1).padStart(2,'0');document.querySelector('.scroll-dial').style.opacity=String(1-expansion);document.querySelector('.progress i').style.width=(raw/13*100)+'%';
 stage.style.setProperty('--turn',(t*35)+'deg');stage.style.setProperty('--bounce',(Math.sin(t*5)*22)+'px');stage.style.setProperty('--dot-scale',String(1+range(t,12.4,13)*1.3));
 root.dataset.chapter=modes[m];root.style.setProperty('--journey-progress',raw/13);const inArchive=scrollY>journey.offsetHeight-height*.4;root.classList.toggle('in-archive',inArchive);
 const key=`${inArchive}-${m}-${focus}-${motion}-${document.hidden}-${reveal>.8}`;if(key!==lastPlayback){lastPlayback=key;videos.forEach((v,i)=>{if(!inArchive&&m===0&&reveal>.8&&!document.hidden&&(focus<0||focus===i)&&!v.dataset.userPaused)play(v);else v.pause()})}
 if(lastMode!==modes[m]){lastMode=modes[m];document.querySelectorAll('nav a').forEach(a=>{if(a.hash==='#'+lastMode)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
 }
 function schedule(){if(!ticking){ticking=true;requestAnimationFrame(render)}}
 function go(name){const beat=mobileMedia.matches?({about:8.5,process:9.8,play:11.1,contact:12.4}[name]??milestones[name]):milestones[name];if(beat===undefined)return;history.replaceState(null,'','#'+name);scrollTo({top:mapTime(beat,true)/totalTime()*(journey.offsetHeight-height),behavior:motion?'smooth':'instant'});schedule()}
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{if(milestones[a.hash.slice(1)]!==undefined){e.preventDefault();go(a.hash.slice(1))}}));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
 videos.forEach(v=>{v.addEventListener('loadedmetadata',schedule);v.addEventListener('loadeddata',()=>v.parentElement.classList.add('loaded'));['play','pause'].forEach(e=>v.addEventListener(e,()=>sync(v)));v.parentElement.querySelector('button').addEventListener('click',()=>{if(v.paused){delete v.dataset.userPaused;play(v)}else{v.dataset.userPaused='1';v.pause()}})});
 function apply(){root.classList.toggle('motion-off',!motion);toggle.textContent=motion?'Motion on · pause':'Motion off · enable';toggle.setAttribute('aria-pressed',String(motion));lastPlayback='';render()}
 toggle.addEventListener('click',()=>{motion=!motion;try{localStorage.setItem('rishabh-grid-motion-v4',motion?'on':'off')}catch{}apply()});// The explicit on/off control retains the user's choice for this animation-led edition.

 document.querySelector('#contact-button').addEventListener('click',()=>{const n=document.querySelector('#contact-note');n.hidden=false;n.setAttribute('role','status')});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);document.addEventListener('visibilitychange',()=>{lastPlayback='';render()});addEventListener('hashchange',()=>go(location.hash.slice(1)));
 addEventListener('pointerdown',()=>{lastPlayback='';schedule()},{passive:true});
 measure();apply();if(location.hash&&milestones[location.hash.slice(1)]!==undefined){requestAnimationFrame(()=>go(location.hash.slice(1)))}
})();
