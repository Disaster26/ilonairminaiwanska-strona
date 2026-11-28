/* Dzial Wystawy: karty z wystawy-dane.js, listwa przewijania z licznikiem, panel z pokazem zdjec */
(function(){
  var W=window.WYSTAWY,d=document,tor=d.getElementById('wys-tor');
  if(!W||!tor)return;
  function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function podpis(w){return [w.gdzie,w.kiedy].filter(Boolean).join(', ')}
  function lam(t){return esc(t).replace(/ ([wziaouWZIAOU]) /g,' $1 ')}

  // karty
  tor.innerHTML=W.map(function(w,i){var b='img/w/'+w.id+'/karta-';
    return '<button type="button" class="wk" data-i="'+i+'" aria-haspopup="dialog"><span class="wk-foto"><img src="'+b+'600.webp" srcset="'+b+'600.webp 600w, '+b+'900.webp 900w" sizes="(min-width:1180px) 23vw, (min-width:900px) 31vw, (min-width:640px) 46vw, 82vw" alt="'+esc(w.co+(w.gdzie?', '+w.gdzie:''))+'"'+(i>5?' loading="lazy"':'')+' draggable="false"></span><span class="wk-co">'+lam(w.co)+'</span>'+(podpis(w)?'<span class="wk-gdzie">'+esc(podpis(w))+'</span>':'')+'</button>'}).join('');

  var kar=tor.closest('.wys'),prev=kar.querySelector('[data-prev]'),next=kar.querySelector('[data-next]'),licz=kar.querySelector('[data-licz]'),listwa=kar.querySelector('.wys-listwa'),suwak=kar.querySelector('.wys-suwak'),ster=kar.querySelector('.wys-sterowanie');
  function karty(){return tor.children}
  function krok(){var e=karty();return e.length>1?e[1].offsetLeft-e[0].offsetLeft:tor.clientWidth}
  function widoczne(){return Math.max(1,Math.floor((tor.clientWidth+krok()*.25)/krok()))}
  function stan(){var n=karty().length,max=tor.scrollWidth-tor.clientWidth,p=max>0?Math.min(1,tor.scrollLeft/max):0,v=Math.min(n,widoczne());
    var pierwsza=Math.round(tor.scrollLeft/krok()),ost=Math.min(n,pierwsza+v);if(max>0&&tor.scrollLeft>=max-2)ost=n;
    licz.textContent=ost+' / '+n;prev.disabled=tor.scrollLeft<=2;next.disabled=tor.scrollLeft>=max-2;
    var L=listwa.clientWidth,sw=Math.max(28,L*Math.min(1,tor.clientWidth/tor.scrollWidth));suwak.style.width=sw+'px';suwak.style.transform='translateX('+((L-sw)*p)+'px)';
    ster.hidden=max<=2}
  prev.addEventListener('click',function(){tor.scrollBy({left:-krok()*widoczne(),behavior:'smooth'})});
  next.addEventListener('click',function(){tor.scrollBy({left:krok()*widoczne(),behavior:'smooth'})});
  tor.addEventListener('scroll',function(){requestAnimationFrame(stan)},{passive:true});
  tor.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();tor.scrollBy({left:krok(),behavior:'smooth'})}if(e.key==='ArrowLeft'){e.preventDefault();tor.scrollBy({left:-krok(),behavior:'smooth'})}});

  // przeciaganie mysza po kartach
  var dn=false,x0=0,s0=0,ruch=0;
  tor.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;dn=true;ruch=0;x0=e.clientX;s0=tor.scrollLeft});
  window.addEventListener('pointermove',function(e){if(!dn)return;var dx=e.clientX-x0;ruch=Math.max(ruch,Math.abs(dx));if(ruch>6)tor.classList.add('ciag');if(ruch>6)tor.scrollLeft=s0-dx});
  window.addEventListener('pointerup',function(){if(!dn)return;dn=false;if(tor.classList.contains('ciag')){tor.classList.remove('ciag');tor.scrollTo({left:Math.round(tor.scrollLeft/krok())*krok(),behavior:'smooth'})}});
  tor.addEventListener('click',function(e){if(ruch>6){e.preventDefault();e.stopPropagation();ruch=0;return}var k=e.target.closest('.wk');if(k)otworz(+k.dataset.i)});
  tor.addEventListener('dragstart',function(e){e.preventDefault()});

  // listwa przewijania: klik i przeciaganie
  var ld=false;
  function zListwy(x){var r=listwa.getBoundingClientRect(),sw=suwak.offsetWidth,p=Math.min(1,Math.max(0,(x-r.left-sw/2)/Math.max(1,r.width-sw)));tor.scrollLeft=p*(tor.scrollWidth-tor.clientWidth)}
  listwa.addEventListener('pointerdown',function(e){ld=true;try{listwa.setPointerCapture(e.pointerId)}catch(_){}tor.style.scrollSnapType='none';tor.style.scrollBehavior='auto';zListwy(e.clientX)});
  listwa.addEventListener('pointermove',function(e){if(ld)zListwy(e.clientX)});
  function lKoniec(){if(!ld)return;ld=false;tor.style.scrollSnapType='';tor.style.scrollBehavior='';tor.scrollTo({left:Math.round(tor.scrollLeft/krok())*krok(),behavior:'smooth'})}
  listwa.addEventListener('pointerup',lKoniec);listwa.addEventListener('pointercancel',lKoniec);
  window.addEventListener('resize',stan);stan();

  // panel wystawy
  var dlg=d.getElementById('wys-panel');
  var eMeta=dlg.querySelector('.wp-meta'),eCo=dlg.querySelector('.wp-co .t'),eTyt=dlg.querySelector('.wp-tytul'),eOpis=dlg.querySelector('.wp-opis'),eTxt=dlg.querySelector('.wp-tekst'),
      scena=dlg.querySelector('.wp-scena'),wLicz=dlg.querySelector('.wp-nawig .licz'),wPrev=dlg.querySelector('[data-f="-1"]'),wNext=dlg.querySelector('[data-f="1"]'),wAuto=dlg.querySelector('.wp-auto'),
      inP=dlg.querySelector('[data-w="-1"]'),inN=dlg.querySelector('[data-w="1"]');
  var cur=-1,f=0,timer=null,pauza=null,auto=true,RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IKO_PAUZA='<svg viewBox="0 0 16 16"><path d="M5 3v10M11 3v10"/></svg>',IKO_GRAJ='<svg viewBox="0 0 16 16"><path d="M5 3l8 5-8 5z"/></svg>';
  function plik(w,z){var need=Math.max(scena.clientWidth,scena.clientHeight*z.w/z.h)*(window.devicePixelRatio||1),b='img/w/'+w.id+'/'+z.n+'-';
    // wiekszy plik tylko gdy ekran go potrzebuje; zdjecie nigdy nie jest powiekszane ponad swoj rozmiar (max-width/max-height w CSS)
    return b+(z.s.length>1&&Math.min(need,scena.clientWidth*(window.devicePixelRatio||1))>z.s[0]*1.05?'1600':'1000')+'.webp'}
  function zaladuj(i){var im=scena.children[i];if(im&&!im.getAttribute('src'))im.src=plik(W[cur],W[cur].zdj[i])}
  function pokaz(i){var z=W[cur].zdj,n=z.length;f=(i+n)%n;zaladuj(f);
    Array.prototype.forEach.call(scena.children,function(im,j){im.classList.toggle('ak',j===f);im.setAttribute('aria-hidden',j===f?'false':'true')});
    wLicz.textContent=(f+1)+' / '+n;var jedno=n<2;wPrev.hidden=wNext.hidden=wAuto.hidden=jedno;
    setTimeout(function(){if(scena.children.length===n)zaladuj((f+1)%n)},600)}
  function start(){stop();if(!auto||RM||!dlg.open||W[cur].zdj.length<2)return;timer=setInterval(function(){if(!d.hidden)pokaz(f+1)},4000)}
  function stop(){clearInterval(timer);timer=null}
  function ustawAuto(a){auto=a;clearTimeout(pauza);pauza=null;wAuto.innerHTML=a?IKO_PAUZA:IKO_GRAJ;wAuto.setAttribute('aria-label',a?'Zatrzymaj pokaz':'Wznów pokaz');if(a)start();else stop()}
  // po recznej zmianie pokaz staje na 12 s, potem rusza dalej
  function recznie(i){pokaz(i);stop();clearTimeout(pauza);pauza=null;if(auto&&!RM)pauza=setTimeout(function(){pauza=null;start()},12000)}
  function otworz(i,bezHash){cur=(i+W.length)%W.length;var w=W[cur];
    eCo.textContent=w.co;eMeta.textContent=podpis(w);eMeta.hidden=!podpis(w);eTyt.textContent=w.tytul||'';eTyt.hidden=!w.tytul;
    eOpis.innerHTML=w.tekst.map(function(p){return '<p>'+lam(p).replace(/\n/g,'<br>')+'</p>'}).join('');
    scena.innerHTML=w.zdj.map(function(z,j){return '<img class="wp-f" alt="'+esc(w.co+' - zdjęcie '+(j+1)+' z '+w.zdj.length)+'" style="max-width:min(100%,'+z.w+'px);max-height:min(100%,'+z.h+'px)" draggable="false">'}).join('');
    inP.disabled=cur===0;inN.disabled=cur===W.length-1;
    if(!dlg.open){d.documentElement.classList.add('wp-otw');dlg.showModal()}
    eTxt.scrollTop=0;dlg.querySelector('.wp-in').scrollTop=0;
    pokaz(0);ustawAuto(true);
    if(!bezHash&&history.replaceState)history.replaceState(null,'','#'+w.id)}
  function zamknij(){if(dlg.open)dlg.close()}
  dlg.addEventListener('close',function(){stop();clearTimeout(pauza);pauza=null;d.documentElement.classList.remove('wp-otw');
    if(history.replaceState)history.replaceState(null,'',location.pathname+location.search);
    var k=tor.children[cur];if(k){var l=k.offsetLeft-tor.children[0].offsetLeft;if(l<tor.scrollLeft-2||l+k.offsetWidth>tor.scrollLeft+tor.clientWidth+2)tor.scrollLeft=l;k.focus({preventScroll:true})}});
  dlg.querySelector('.wp-x').addEventListener('click',zamknij);
  dlg.addEventListener('click',function(e){if(e.target===dlg)zamknij()});
  wPrev.addEventListener('click',function(){recznie(f-1)});wNext.addEventListener('click',function(){recznie(f+1)});
  wAuto.addEventListener('click',function(){ustawAuto(!auto)});
  inP.addEventListener('click',function(){otworz(cur-1)});inN.addEventListener('click',function(){otworz(cur+1)});
  dlg.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();recznie(f+1)}if(e.key==='ArrowLeft'){e.preventDefault();recznie(f-1)}});
  var tx=null,ty=0,przes=false;
  scena.addEventListener('click',function(){if(przes){przes=false;return}recznie(f+1)});
  scena.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY;przes=false},{passive:true});
  scena.addEventListener('touchend',function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;tx=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){przes=true;recznie(dx<0?f+1:f-1)}});
  function zHasha(){var h=location.hash.slice(1);if(!h)return;for(var i=0;i<W.length;i++)if(W[i].id===h){tor.scrollLeft=tor.children[i].offsetLeft-tor.children[0].offsetLeft;otworz(i,true);return}}
  zHasha();window.addEventListener('hashchange',zHasha);
})();
