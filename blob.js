(() => {
 const button=document.querySelector('#blob-guide'),canvas=document.querySelector('#blob-canvas'),label=document.querySelector('#blob-label'),root=document.documentElement;
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:'low-power'});
 let program,uTime,uProgress,uEnergy,uPointer,frame=0,last=0,elapsed=0;
 const vertex='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
 const fragment=`precision mediump float;uniform float time;uniform float progress;uniform float energy;uniform vec2 pointer;
 float shape(vec3 p){float t=time*.6+progress*9.;p.xy-=pointer*.035; p.x*=1.-energy*.13;p.y*=1.+energy*.12;float warp=sin(p.x*3.8+t)*sin(p.y*3.1-t*.7)*sin(p.z*3.5+t*.6);float lobe=sin(p.x*2.+p.z*2.+t)*.06;return length(p)-(.70+(.14+energy*.13)*warp+lobe+.065*sin(p.y*5.+t*1.5)*sin(progress*14.+t*.4));}
 vec3 norm(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(shape(p+e.xyy)-shape(p-e.xyy),shape(p+e.yxy)-shape(p-e.yxy),shape(p+e.yyx)-shape(p-e.yyx)));}
 void main(){vec2 uv=(gl_FragCoord.xy/200.-.5)*2.5;vec3 ro=vec3(uv,2.6),rd=vec3(0.,0.,-1.);float d=0.;bool hit=false;vec3 p;
 for(int i=0;i<48;i++){p=ro+rd*d;float h=shape(p);if(h<.0015){hit=true;break;}d+=h*.8;if(d>4.8)break;}
 if(!hit){gl_FragColor=vec4(0.);return;}vec3 n=norm(p),light=normalize(vec3(-.6,.8,1.));float diff=max(dot(n,light),0.);float spec=pow(max(dot(reflect(-light,n),-rd),0.),36.);float rim=pow(1.-max(dot(n,-rd),0.),2.);vec3 base=mix(vec3(.39,.31,.65),vec3(.83,.79,.97),diff);base+=spec*.65+rim*vec3(.2,.3,.37);base*=.88+.12*n.y;gl_FragColor=vec4(base,1.);}`;
 function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s}
 if(gl){try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('program');gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);uTime=gl.getUniformLocation(program,'time');uProgress=gl.getUniformLocation(program,'progress');uEnergy=gl.getUniformLocation(program,'energy');uPointer=gl.getUniformLocation(program,'pointer');gl.viewport(0,0,200,200);}catch{program=null;button.classList.add('no-webgl')}}else button.classList.add('no-webgl');
 let x=innerWidth*.74,y=innerHeight*.55,vx=0,vy=0,scrollEnergy=0,previousScroll=scrollY;
 let pointer={x:innerWidth/2,y:innerHeight/2,active:false},hovered=null,anchor=null,anchorAt=0,energy=0;
 const limit=(n,a,b)=>Math.max(a,Math.min(b,n));
 const prefersQuiet=matchMedia('(prefers-reduced-motion: reduce)');
 function destination(now){
  const mobile=innerWidth<700,w=button.offsetWidth,h=button.offsetHeight;
  if(scrollY<innerHeight*.6)return {x:innerWidth*(mobile?.78:.78)-w/2+Math.sin(elapsed*.32)*(mobile?16:75),y:innerHeight*(mobile?.69:.48)+Math.cos(elapsed*.43)*(mobile?20:55)};
  if(now-anchorAt>220){anchorAt=now;
   const inArchive=root.classList.contains('in-archive');
   const candidates=[...document.querySelectorAll(inArchive?'.archive-video-frame,.graphic-window,.still-piece':'.cell')];
   anchor=candidates.filter(e=>!e.inert).map(e=>({e,r:e.getBoundingClientRect()})).filter(({r})=>r.bottom>innerHeight*.25&&r.top<innerHeight*.7&&r.width>30).sort((a,b)=>Math.abs(a.r.top+a.r.height/2-innerHeight*.5)-Math.abs(b.r.top+b.r.height/2-innerHeight*.5))[0]?.e;
  }
  if(anchor){const r=anchor.getBoundingClientRect();return {x:mobile?innerWidth-w-4:innerWidth-w*.48,y:limit(r.top+Math.min(r.height*.27,130)-h*.5,90,innerHeight-h-55)}}
  return {x:innerWidth-w-12,y:innerHeight*.58};
 }
 function paint(now){frame=0;const moving=!root.classList.contains('motion-off');
  if(now-last>32){const dt=Math.min(50,now-last||33);last=now;if(moving)elapsed+=dt*.001;
   const [id,text]=next();label.textContent=text;button.setAttribute('aria-label',`Go to ${id==='start'?'the beginning':id}`);
   const target=destination(now),w=button.offsetWidth,h=button.offsetHeight;
   let tx=target.x,ty=target.y;
   if(moving&&pointer.active&&innerWidth>=700){const dx=pointer.x-(x+w/2),dy=pointer.y-(y+h/2),d=Math.hypot(dx,dy);const interest=Math.max(0,1-d/420);tx+=dx*interest*.3;ty+=dy*interest*.3;
    if(hovered&&hovered!==button){const r=hovered.getBoundingClientRect();if(r.width<500&&r.top>65&&r.bottom<innerHeight-35){tx=r.right+3;ty=r.top-h*.4}}
   }
   if(moving){tx+=Math.sin(elapsed*1.2)*5;ty+=Math.cos(elapsed*.95)*8;vx=(vx+(tx-x)*.055)*.73;vy=(vy+(ty-y)*.055)*.73;x+=vx;y+=vy;}else{x=innerWidth-w-12;y=innerHeight-h-65;vx=vy=0;}
   const edgeDock=scrollY>=innerHeight*.6&&innerWidth>=700;
   x=limit(x,6,innerWidth-(edgeDock?w*.52:w)-6);y=limit(y,76,innerHeight-h-44);
   scrollEnergy*=.89;energy+=(Math.min(1,scrollEnergy+Math.hypot(vx,vy)*.018+(hovered===button?.35:0))-energy)*.13;
   const progress=parseFloat(root.style.getPropertyValue('--journey-progress'))||0;
   if(program){gl.uniform1f(uTime,elapsed);gl.uniform1f(uProgress,progress);gl.uniform1f(uEnergy,moving?energy:0);gl.uniform2f(uPointer,limit((pointer.x-x-w/2)/250,-1,1),limit((y+h/2-pointer.y)/250,-1,1));gl.drawArrays(gl.TRIANGLES,0,6)}
   button.style.transform=`translate3d(${x}px,${y}px,0)`;canvas.style.transform=`rotate(${moving?limit(vx*1.1,-16,16):0}deg) scale(${1+energy*.07})`;
  }if(!document.hidden&&moving)frame=requestAnimationFrame(paint)
 }
 addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer={x:e.clientX,y:e.clientY,active:true};hovered=e.target.closest('a,button');resume()},{passive:true});
 document.addEventListener('pointerleave',()=>{pointer.active=false;hovered=null});
 addEventListener('scroll',()=>{scrollEnergy=Math.min(1,scrollEnergy+Math.abs(scrollY-previousScroll)/350);previousScroll=scrollY;resume()},{passive:true});
 addEventListener('resize',()=>{anchor=null;resume()});prefersQuiet.addEventListener('change',resume);
 function resume(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint)}
 const targets={work:['about','About ↓'],about:['process','Process ↓'],process:['play','Play ↓'],play:['contact','Contact ↓'],contact:['archive','Archive ↓']};
 function next(){if(root.classList.contains('in-archive'))return ['start','Back to top ↑'];if(scrollY<innerHeight)return ['work','Explore ↓'];return targets[root.dataset.chapter]||['work','Explore ↓']}
 button.addEventListener('click',()=>{const [id]=next();const a=document.querySelector(`a[href="#${id}"]`);if(a)a.click()});
 addEventListener('scroll',()=>{const [id,text]=next();label.textContent=text;button.setAttribute('aria-label',`Go to ${id==='start'?'the beginning':id}`);resume()},{passive:true});document.addEventListener('visibilitychange',resume);new MutationObserver(resume).observe(root,{attributes:true,attributeFilter:['class']});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();program=null;button.classList.add('no-webgl')});resume();
})();
