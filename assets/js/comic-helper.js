/* NOOO original playful site-guide; no external services or AGPL sources. */
(() => {
  'use strict';
  if(window.NOOO_COMIC_HELPER_ENABLED===false || document.getElementById('nooo-friend')) return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const labels=()=>document.documentElement.lang.toLowerCase().startsWith('ar') ? {
    title:'صديق NOOO',tag:'وين نروح؟',line:'اضغط على وجهّي أو اسحبني، وخلّني أوريك الممتع.',
    newest:'جديد الساعة',meme:'الميمز',games:'الألعاب',sounds:'الأصوات',
    shout:'قول لا!',phrase:'جملة رفض عشوائية',close:'إغلاق',hide:'إخفاء',show:'إظهار صديق NOOO',
    move:'اسحب أو استخدم الأسهم لتحريك الصديق'
  }:{
    title:'NOOO buddy',tag:'NEED A NO?',line:'Tap me for fun shortcuts, or drag me around.',
    newest:'New this hour',meme:'Memes',games:'Games',sounds:'Sound lab',
    shout:'Shout NOOO!',phrase:'Random refusal',close:'Close',hide:'Minimize',show:'Show NOOO buddy',
    move:'Drag me or use arrow keys'
  };
  const speech={
    ar:['لاااا! مو هالمرة!','عندي موعد مع الراحة: لا!','أعتذر، عندي لا جاهزة!','لا شكرًا، الجواب محسوم!','أحب راحة البال: لا!'],
    en:['NOOO! Not today!','My calendar says NO.','No thanks, I choose peace.','That is a solid nope.','I have plans: say NO!']
  };
  const size=60, clamp=(n,lo,hi)=>Math.min(Math.max(lo,n),Math.max(lo,hi));
  let x=clamp(innerWidth-size-18,12,innerWidth-size-12),y=clamp(innerHeight-size-116,12,innerHeight-size-12);
  let drag=null,moved=false,hidden=false,open=false,raf=0,phraseTimeout;
  const host=document.createElement('aside');host.id='nooo-friend';
  const face=document.createElement('button');face.type='button';face.className='nooo-friend-face';
  face.innerHTML='<span class="nooo-friend-eyes" aria-hidden="true"><i><b></b></i><i><b></b></i></span><span class="nooo-friend-mouth" aria-hidden="true"></span>';
  const badge=document.createElement('span');badge.className='nooo-friend-badge';badge.setAttribute('aria-hidden','true');
  const bubble=document.createElement('span');bubble.className='nooo-friend-says';bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');
  const panel=document.createElement('section');panel.className='nooo-friend-panel';panel.id='nooo-friend-panel';panel.hidden=true;
  const title=document.createElement('strong');const intro=document.createElement('p');
  const actionBox=document.createElement('div');actionBox.className='nooo-friend-actions';
  const controls=document.createElement('div');controls.className='nooo-friend-controls';
  const actions={};
  const addAction=(id,cb)=>{const b=document.createElement('button');b.type='button';b.addEventListener('click',cb);actionBox.append(b);actions[id]=b;};
  const jump=id=>{const el=document.getElementById(id);if(!el)return;open=false;render();el.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});};
  addAction('newest',()=>jump('new'));
  addAction('meme',()=>jump('memes'));
  addAction('games',()=>jump('games'));
  addAction('sounds',()=>jump('sound'));
  addAction('shout',()=>{open=false;render();document.getElementById('nooo-btn')?.click()});
  const say=()=>{
    if(hidden)return;
    const arr=document.documentElement.lang.toLowerCase().startsWith('ar')?speech.ar:speech.en;
    bubble.textContent=arr[Math.floor(Math.random()*arr.length)];
    host.classList.add('is-reacting');clearTimeout(phraseTimeout);
    phraseTimeout=setTimeout(()=>{bubble.textContent='';host.classList.remove('is-reacting')},reduced.matches?1700:3000);
  };
  addAction('phrase',()=>{open=false;render();say()});
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='nooo-friend-hide';
  dismiss.textContent='×';dismiss.setAttribute('aria-label',labels().hide);
  const restore=document.createElement('button');restore.type='button';restore.className='nooo-friend-restore';restore.textContent='✦';restore.hidden=true;
  const close=document.createElement('button');close.type='button';close.className='nooo-friend-close';
  controls.append(close);panel.append(title,intro,actionBox,controls);
  host.append(face,badge,bubble,dismiss,restore,panel);document.body.append(host);
  const refresh=()=>{
    const l=labels();
    title.textContent=l.title;intro.textContent=l.line;badge.textContent=l.tag;
    face.setAttribute('aria-label',l.title+'. '+l.move);face.setAttribute('aria-expanded',String(open));
    face.setAttribute('aria-controls',panel.id);
    panel.setAttribute('aria-label',l.title);
    Object.keys(actions).forEach(k=>{actions[k].textContent=l[k]});
    dismiss.setAttribute('aria-label',l.hide);restore.setAttribute('aria-label',l.show);close.textContent=l.close;
  };
  const render=()=>{
    x=clamp(x,12,innerWidth-size-12);y=clamp(y,12,innerHeight-size-12);
    host.style.left=x+'px';host.style.top=y+'px';
    face.hidden=hidden;badge.hidden=hidden;dismiss.hidden=hidden;restore.hidden=!hidden;
    panel.hidden=!open||hidden;
    refresh();
    if(!panel.hidden){
      const w=Math.min(314,innerWidth-24),h=Math.min(panel.scrollHeight,innerHeight-24);
      panel.style.width=w+'px';
      panel.style.left=clamp(x+size/2-w/2,12,innerWidth-w-12)+'px';
      panel.style.top=clamp(y+size+9+h>innerHeight-12?y-h-9:y+size+9,12,innerHeight-h-12)+'px';
    }
    if(hidden)bubble.textContent='';
  };
  face.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,px:e.clientX,py:e.clientY,x,y};moved=false;face.setPointerCapture(e.pointerId)});
  face.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.px,dy=e.clientY-drag.py;if(Math.abs(dx)+Math.abs(dy)>7)moved=true;if(moved){x=drag.x+dx;y=drag.y+dy;render()}});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])face.addEventListener(type,()=>{drag=null});
  face.addEventListener('click',()=>{if(moved){moved=false;return}open=!open;if(open)bubble.textContent='';render()});
  face.addEventListener('keydown',e=>{const d={ArrowUp:[0,-24],ArrowDown:[0,24],ArrowLeft:[-24,0],ArrowRight:[24,0]}[e.key];if(d){e.preventDefault();x+=d[0];y+=d[1];render()}else if(e.key==='Escape'){open=false;render()}});
  close.addEventListener('click',()=>{open=false;render();face.focus()});
  dismiss.addEventListener('click',()=>{hidden=true;open=false;render();restore.focus()});
  restore.addEventListener('click',()=>{hidden=false;render();face.focus()});
  document.getElementById('nooo-btn')?.addEventListener('click',()=>{if(!hidden)say()});
  window.addEventListener('resize',render,{passive:true});
  // Eye pupils follow pointer only on precise pointing devices; no pointer data is retained.
  let px=0,py=0;
  const look=e=>{
    if(hidden||reduced.matches||!fine.matches||e.pointerType!=='mouse')return;
    px=e.clientX;py=e.clientY;
    if(raf)return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      const r=face.getBoundingClientRect(),dx=px-r.left-r.width/2,dy=py-r.top-r.height/2;
      const distance=Math.hypot(dx,dy)||1,extent=Math.min(3,distance/35);
      face.style.setProperty('--look-x',(dx/distance*extent).toFixed(2)+'px');
      face.style.setProperty('--look-y',(dy/distance*extent).toFixed(2)+'px');
    });
  };
  const reset=()=>{if(raf)cancelAnimationFrame(raf);raf=0;face.style.removeProperty('--look-x');face.style.removeProperty('--look-y')};
  addEventListener('pointermove',look,{passive:true});addEventListener('blur',reset);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
  reduced.addEventListener('change',reset);
  render();
})();