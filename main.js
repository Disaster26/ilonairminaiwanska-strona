(function(){
  'use strict';
  var d=document;
  var rok=d.getElementById('rok'); if(rok) rok.textContent=new Date().getFullYear();

  // menu mobilne
  var bur=d.querySelector('.burger'),pan=d.getElementById('panel');
  function zamknij(){if(!pan)return;pan.classList.remove('otw');bur.setAttribute('aria-expanded','false');bur.setAttribute('aria-label','Otwórz menu');d.body.style.overflow=''}
  if(bur&&pan){
    bur.addEventListener('click',function(){var o=!pan.classList.contains('otw');pan.classList.toggle('otw',o);bur.setAttribute('aria-expanded',String(o));bur.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu');d.body.style.overflow=o?'hidden':''});
    pan.querySelectorAll('a').forEach(function(a){a.addEventListener('click',zamknij)});
    window.addEventListener('resize',function(){if(window.innerWidth>1179)zamknij()});
  }

  // lightbox
  var lb=d.getElementById('lb'),lbi=d.getElementById('lb-img');
  function pokaz(src,alt){if(!lb)return;lbi.src=src;lbi.alt=alt||'';if(lb.showModal&&!lb.open)lb.showModal();}
  d.addEventListener('click',function(e){var t=e.target.closest('[data-full]');if(!t)return;e.preventDefault();pokaz(t.getAttribute('data-full'),(t.querySelector('img')||{}).alt||t.getAttribute('aria-label'))});
  if(lb){d.getElementById('lb-x').addEventListener('click',function(){lb.close()});lb.addEventListener('click',function(e){if(e.target!==lbi)lb.close()});}
  d.addEventListener('keydown',function(e){if(e.key==='Escape')zamknij()});

  // karuzele: palec, mysz, strzalki, licznik
  function karuzela(k){
    var tor=k.querySelector('.kar-tor'),prev=k.querySelector('[data-prev]'),next=k.querySelector('[data-next]'),licz=k.querySelector('[data-licz]');
    function el(){return Array.prototype.slice.call(tor.children)}
    function krok(){var e=el();return e.length>1?e[1].offsetLeft-e[0].offsetLeft:tor.clientWidth}
    function stan(){var e=el(),max=tor.scrollWidth-tor.clientWidth-2,i=Math.round(tor.scrollLeft/krok());
      if(prev)prev.disabled=tor.scrollLeft<=2; if(next)next.disabled=tor.scrollLeft>=max;
      var widoczne=Math.max(1,Math.floor((tor.clientWidth+4)/krok()));
      if(licz)licz.textContent=Math.min(e.length,i+widoczne)+' / '+e.length;
      k.querySelector('.kar-nav').style.display=max<=2?'none':'';}
    prev&&prev.addEventListener('click',function(){tor.scrollBy({left:-krok(),behavior:'smooth'})});
    next&&next.addEventListener('click',function(){tor.scrollBy({left:krok(),behavior:'smooth'})});
    tor.addEventListener('scroll',function(){window.requestAnimationFrame(stan)},{passive:true});
    tor.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();next.click()}if(e.key==='ArrowLeft'){e.preventDefault();prev.click()}});
    var x0=0,s0=0,dn=false,ruch=0;
    tor.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;dn=true;ruch=0;x0=e.clientX;s0=tor.scrollLeft;tor.classList.add('ciag')});
    window.addEventListener('pointermove',function(e){if(!dn)return;var dx=e.clientX-x0;ruch=Math.max(ruch,Math.abs(dx));tor.scrollLeft=s0-dx});
    window.addEventListener('pointerup',function(){if(!dn)return;dn=false;tor.classList.remove('ciag');var i=Math.round(tor.scrollLeft/krok());tor.scrollTo({left:i*krok(),behavior:'smooth'})});
    tor.addEventListener('click',function(e){if(ruch>6){e.preventDefault();e.stopPropagation();ruch=0}},true);
    tor.addEventListener('dragstart',function(e){e.preventDefault()});
    window.addEventListener('resize',stan);stan();
  }
  d.querySelectorAll('[data-kar]').forEach(karuzela);

  // strona Obrazy
  var C=window.CYKLE,img=d.getElementById('obraz');
  if(C&&img){
    var opis=d.getElementById('opis'),ot=d.getElementById('o-t'),ox=d.getElementById('o-x'),licz=d.getElementById('o-licz'),pr=d.getElementById('o-prev'),nx=d.getElementById('o-next'),mini=d.getElementById('miniatury'),scena=d.getElementById('scena');
    var cur=null,i=0,box=d.querySelector('.obraz-box'),opisO=d.querySelector('.opis-obrazu'),nawO=d.getElementById('o-nawig');
    var pusty=d.createElement('p');pusty.className='puste';pusty.textContent='Reprodukcje i opis cyklu Faunofloris zostaną dodane wkrótce.';
    function rysuj(){
      var c=C[cur],o=c.obr[i];
      img.classList.add('laduje');
      var n=new Image();n.onload=n.onerror=function(){img.src=n.src;img.width=o.w;img.height=o.h;img.classList.remove('laduje')};n.src='img/o/'+o.f;
      img.alt=(o.t?o.t+', ':'')+'obraz z cyklu '+c.n;
      img.dataset.full='img/o/'+o.f;
      ot.textContent=o.t||'Tytuł obrazu - do uzupełnienia';ot.classList.toggle('brak',!o.t);
      ox.textContent=c.x;
      licz.textContent=(i+1)+' / '+c.obr.length;
      pr.disabled=i===0;nx.disabled=i===c.obr.length-1;
      mini.querySelectorAll('button').forEach(function(b,j){b.setAttribute('aria-current',j===i?'true':'false')});
      var akt=mini.children[i];
      if(akt){var l=akt.offsetLeft-mini.offsetLeft,r=l+akt.offsetWidth;if(l<mini.scrollLeft||r>mini.scrollLeft+mini.clientWidth)mini.scrollTo({left:Math.max(0,l-8),behavior:'smooth'})}
    }
    function wybierz(k,bezHash){
      if(!C[k])k='prapamiec';cur=k;i=0;var c=C[k];
      d.querySelectorAll('.cyk[data-c]').forEach(function(b){b.setAttribute('aria-selected',b.dataset.c===k?'true':'false')});
      scena.setAttribute('aria-labelledby','tab-'+k);
      opis.innerHTML=c.o.map(function(p){return '<p>'+p+'</p>'}).join('');
      nawO.hidden=c.obr.length<2;
      if(!c.obr.length){box.hidden=true;opisO.hidden=true;mini.innerHTML='';if(!pusty.parentNode)scena.appendChild(pusty);}
      else{
        box.hidden=false;opisO.hidden=false;if(pusty.parentNode)pusty.remove();
        mini.innerHTML=c.obr.length>1?c.obr.map(function(o,j){return '<button type="button" aria-label="Obraz '+(j+1)+'"><img src="img/o/m/'+o.f+'" alt="" loading="lazy"></button>'}).join(''):'';
        mini.querySelectorAll('button').forEach(function(b,j){b.addEventListener('click',function(){i=j;rysuj()})});
        rysuj();
      }
      if(!bezHash&&history.replaceState)history.replaceState(null,'','#'+k);
    }
    d.querySelectorAll('.cyk[data-c]').forEach(function(b){b.addEventListener('click',function(){wybierz(b.dataset.c);
      if(window.innerWidth<900){var y=scena.getBoundingClientRect().top+window.scrollY-90;window.scrollTo({top:y,behavior:'smooth'})}})});
    pr.addEventListener('click',function(){if(i>0){i--;rysuj()}});
    nx.addEventListener('click',function(){if(i<C[cur].obr.length-1){i++;rysuj()}});
    d.addEventListener('keydown',function(e){if(lb&&lb.open)return;if(e.target.closest('input,textarea,select'))return;if(e.key==='ArrowRight')nx.click();if(e.key==='ArrowLeft')pr.click()});
    var tx=null;
    img.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
    img.addEventListener('touchend',function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>40){(dx<0?nx:pr).click()}});
    wybierz((location.hash||'').slice(1),true);
    window.addEventListener('hashchange',function(){wybierz(location.hash.slice(1),true)});
  }

  // formularz pokazowy
  var f=d.getElementById('formularz');
  if(f)f.addEventListener('submit',function(e){e.preventDefault();d.getElementById('info').textContent='To wersja testowa strony - na gotowej stronie wiadomość trafi na adres iii@ilonairminaiwanska.pl.'});

  // cookies
  var ck=d.getElementById('cookies'),zg=null;
  try{zg=localStorage.getItem('zgoda')}catch(e){}
  if(ck&&!zg&&d.querySelector('.mapa')){ck.classList.add('pokaz');ck.querySelectorAll('[data-zgoda]').forEach(function(b){b.addEventListener('click',function(){try{localStorage.setItem('zgoda',b.dataset.zgoda)}catch(e){}ck.classList.remove('pokaz')})})}
})();
