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
  if(lb){d.getElementById('lb-x').addEventListener('click',function(){lb.close()});lb.addEventListener('click',function(e){if(e.target!==lbi&&!e.target.closest('.lb-nav'))lb.close()});}
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
    // podpis lamie sie tylko po kropce konczacej slowo ("Kin 241 IMIX." / "22. 08. 2011"), nigdy wewnatrz daty czy wymiarow
    function lam(t){return String(t||'').replace(/ /g,' ').replace(/(\p{L}{2,})\. /gu,'$1. ')}
    // Prapamiec: kilka szerokosci WebP (800/1200/oryginal), przegladarka bierze najmniejsza ostra
    var ROZM='(min-width:900px) 62vw, 100vw';
    function zestaw(o){if(!o.v)return '';var b='img/o/'+o.f.replace(/\.webp$/,'');return (o.s||[800,1200]).map(function(s){return b+'-'+s+'.webp '+s+'w, '}).join('')+'img/o/'+o.f+' '+o.w+'w'}
    function rysuj(){
      var c=C[cur],o=c.obr[i];
      img.classList.add('laduje');
      var src='img/o/'+o.f,set=zestaw(o),n=new Image();if(set){n.sizes=ROZM;n.srcset=set}
      n.onload=n.onerror=function(){if(set){img.sizes=ROZM;img.srcset=set}else{img.removeAttribute('srcset')}img.src=src;img.width=o.w;img.height=o.h;img.classList.remove('laduje');dopasuj()};n.src=src;
      img.alt=(o.t?o.t+', ':'')+'obraz z cyklu '+c.n;
      img.dataset.full='img/o/'+o.f;
      ot.textContent=o.t?lam(o.t):'Tytuł obrazu - do uzupełnienia';ot.classList.toggle('brak',!o.t);
      ox.textContent=lam(o.x||c.x);
      licz.textContent=(i+1)+' / '+c.obr.length;
      pr.disabled=i===0;nx.disabled=i===c.obr.length-1;
      mini.querySelectorAll('button').forEach(function(b,j){b.setAttribute('aria-current',j===i?'true':'false')});
      var akt=mini.children[i];
      if(akt){var l=akt.offsetLeft-mini.offsetLeft,r=l+akt.offsetWidth;if(l<mini.scrollLeft||r>mini.scrollLeft+mini.clientWidth)mini.scrollTo({left:Math.max(0,l-8),behavior:'smooth'})}
      dopasuj();
    }
    // uklad wg uwag 12.11 wieczor (komputer): gorna krawedz obrazu na wysokosci kreski pod logo,
    // dolna na wysokosci dolnej krawedzi belki "Rysunki", podpis stoi linia pisma na dolnej krawedzi obrazu.
    // Obraz tylko skalowany proporcjonalnie (bez kadrowania i bez zmiany proporcji).
    var kreska=d.querySelector('.rule'),kol=scena.parentNode,podp=null;
    function wyczysc(){scena.classList.remove('dopas');kol.style.marginTop='';box.style.height='';box.style.width='';img.style.width='';img.style.height='';img.style.maxHeight='';opisO.style.marginBottom=''}
    function dopasuj(){
      if(!cur)return;var c=C[cur],o=c.obr[i];
      if(window.innerWidth<900||!o||!kreska){wyczysc();return}
      var cyki=d.querySelectorAll('.cyk[data-c]'),ost=cyki[cyki.length-1];
      scena.classList.add('dopas');kol.style.marginTop='0px';opisO.style.marginBottom='0px';
      var gora=kreska.getBoundingClientRect().top,dol=ost.getBoundingClientRect().bottom,H=Math.round(dol-gora);
      if(H<200){wyczysc();return}
      var gap=parseFloat(getComputedStyle(scena).columnGap)||0,maxW=scena.clientWidth-gap-130;
      var kolW=Math.round(Math.min(maxW,H*1.42)),r=o.w/o.h,w=H*r,h=H;if(w>kolW){w=kolW;h=w/r}
      w=Math.round(w);h=Math.round(w/r);
      box.style.width=kolW+'px';box.style.height=H+'px';
      img.style.maxHeight='none';img.style.width=w+'px';img.style.height=h+'px';
      kol.style.marginTop=Math.round(gora-box.getBoundingClientRect().top)+'px';
      if(!podp){podp=d.createElement('span');podp.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';podp.setAttribute('aria-hidden','true')}
      ox.appendChild(podp);
      var linia=podp.getBoundingClientRect().bottom,dolO=opisO.getBoundingClientRect().bottom;
      opisO.style.marginBottom=(linia-dolO).toFixed(1)+'px';
    }
    var tr;window.addEventListener('resize',function(){clearTimeout(tr);tr=setTimeout(dopasuj,60)});
    if(d.fonts&&d.fonts.ready)d.fonts.ready.then(dopasuj);
    window.addEventListener('load',dopasuj);
    function wybierz(k,bezHash){
      if(!C[k])k='prapamiec';cur=k;i=0;var c=C[k];
      d.querySelectorAll('.cyk[data-c]').forEach(function(b){b.setAttribute('aria-selected',b.dataset.c===k?'true':'false')});
      scena.setAttribute('aria-labelledby','tab-'+k);
      opis.innerHTML=c.o.map(function(p){return '<p>'+p+'</p>'}).join('');
      nawO.hidden=c.obr.length<2;
      if(!c.obr.length){box.hidden=true;opisO.hidden=true;mini.innerHTML='';if(!pusty.parentNode)scena.appendChild(pusty);wyczysc();}
      else{
        box.hidden=false;opisO.hidden=false;if(pusty.parentNode)pusty.remove();
        mini.innerHTML=c.obr.length>1?c.obr.map(function(o,j){return '<button type="button" aria-label="Obraz '+(j+1)+(o.t?', '+o.t:'')+'"><img src="img/o/m/'+o.f+'" alt="" loading="lazy"'+(o.v?' style="aspect-ratio:'+o.w+'/'+o.h+'"':'')+'></button>'}).join(''):'';
        mini.querySelectorAll('button').forEach(function(b,j){b.addEventListener('click',function(){i=j;rysuj()})});
        rysuj();
      }
      if(!bezHash&&history.replaceState)history.replaceState(null,'','#'+k);
    }
    d.querySelectorAll('.cyk[data-c]').forEach(function(b){b.addEventListener('click',function(){wybierz(b.dataset.c);
      if(window.innerWidth<900){var y=scena.getBoundingClientRect().top+window.scrollY-90;window.scrollTo({top:y,behavior:'smooth'})}})});
    pr.addEventListener('click',function(){if(i>0){i--;rysuj()}});
    nx.addEventListener('click',function(){if(i<C[cur].obr.length-1){i++;rysuj()}});
    d.addEventListener('keydown',function(e){if(lb&&lb.open){if(lb.dataset.gal){if(e.key==='ArrowRight'){e.preventDefault();lbKrok(1)}if(e.key==='ArrowLeft'){e.preventDefault();lbKrok(-1)}}return;}if(e.target.closest('input,textarea,select'))return;if(e.key==='ArrowRight')nx.click();if(e.key==='ArrowLeft')pr.click()});
    // lightbox galerii: strzalki i licznik w stalym miejscu na dole ekranu (16.11)
    var lbNav=null,lbL=null;
    if(lb){
      lbNav=d.createElement('div');lbNav.className='lb-nav';lbNav.hidden=true;
      lbNav.innerHTML='<button type="button" data-k="-1" aria-label="Poprzedni obraz"><svg viewBox="0 0 16 16"><path d="M10.5 2.5L5 8l5.5 5.5"/></svg></button><span class="licz"></span><button type="button" data-k="1" aria-label="Następny obraz"><svg viewBox="0 0 16 16"><path d="M5.5 2.5L11 8l-5.5 5.5"/></svg></button>';
      lb.querySelector('.lb-in').appendChild(lbNav);lbL=lbNav.querySelector('.licz');
      lbNav.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){lbKrok(+b.dataset.k)})});
      lb.addEventListener('close',function(){delete lb.dataset.gal;lbNav.hidden=true});
    }
    function lbStan(){var c=C[cur],o=c.obr[i];lbi.src='img/o/'+o.f;lbi.alt=img.alt;lbL.textContent=(i+1)+' / '+c.obr.length;
      lbNav.querySelector('[data-k="-1"]').disabled=i===0;lbNav.querySelector('[data-k="1"]').disabled=i===c.obr.length-1}
    function lbKrok(k){var n=i+k;if(n<0||n>=C[cur].obr.length)return;i=n;rysuj();lbStan()}
    img.addEventListener('click',function(){if(!lb||C[cur].obr.length<2)return;setTimeout(function(){if(!lb.open)return;lb.dataset.gal='1';lbNav.hidden=false;lbStan()},0)});
    var lx=null;
    if(lb){lbi.addEventListener('touchstart',function(e){lx=e.touches[0].clientX},{passive:true});
      lbi.addEventListener('touchend',function(e){if(lx===null||!lb.dataset.gal)return;var dx=e.changedTouches[0].clientX-lx;lx=null;if(Math.abs(dx)>40)lbKrok(dx<0?1:-1)});}
    var tx=null;
    img.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
    img.addEventListener('touchend',function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>40){(dx<0?nx:pr).click()}});
    wybierz((location.hash||'').slice(1),true);
    window.addEventListener('hashchange',function(){wybierz(location.hash.slice(1),true)});
  }

  // Prapamiec (14.11 wieczor): wyrownania planszy z miniaturkami i zdjeciem z Janowca
  var prA=d.querySelector('.prapa'),pg=d.querySelector('.prapa-g');
  if(prA&&pg){
    var h1=pg.querySelector('.tytul'),pas=prA.querySelector('.pasek'),lewa=prA.querySelector('.prapa-lewa'),jan=prA.querySelector('.janowiec img'),
        tek=prA.querySelector('.prapa-tekst'),cyt=tek.querySelector('.cytat-s'),tz=tek.querySelector('.tzolkin'),tzi=tz&&tz.querySelector('img'),
        cv=d.createElement('canvas').getContext('2d');
    var uklad=function(){
      h1.style.fontSize='';cyt.style.marginTop='';tek.style.paddingBottom='';if(tzi){tzi.style.height='';tzi.style.width=''}
      if(window.innerWidth<900)return;
      // 1. prawa krawedz tytulu = prawa krawedz miniaturek
      var rg=d.createRange();rg.selectNodeContents(h1);
      for(var k=0;k<4;k++){var r=rg.getBoundingClientRect(),cel=pas.getBoundingClientRect().right-r.left;if(Math.abs(cel-r.width)<.3)break;
        h1.style.fontSize=(parseFloat(getComputedStyle(h1).fontSize)*cel/r.width)+'px'}
      // 2. gora liter pierwszego tekstu = gora miniaturek
      var cs=getComputedStyle(cyt);cv.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
      var m=cv.measureText('P'),lh=parseFloat(cs.lineHeight);
      if(m.fontBoundingBoxAscent){var cap=(lh-(m.fontBoundingBoxAscent+m.fontBoundingBoxDescent))/2+m.fontBoundingBoxAscent-m.actualBoundingBoxAscent;
        cyt.style.marginTop=(pas.getBoundingClientRect().top-cyt.getBoundingClientRect().top-cap)+'px'}
      // 3. dol Tzolkina = dol zdjecia z Janowca
      if(tzi&&jan){
        tek.style.paddingBottom=Math.max(0,lewa.getBoundingClientRect().bottom-jan.getBoundingClientRect().bottom)+'px';
        tzi.style.height='0px';
        var wys=tz.getBoundingClientRect().height,szer=tz.clientWidth,prop=tzi.getAttribute('width')/tzi.getAttribute('height');
        if(wys<160){tzi.style.height='';return}
        var hh=Math.min(wys,szer/prop);tzi.style.height=hh+'px';tzi.style.width=(hh*prop)+'px';
      }
    };
    var tm=null,plan=function(){clearTimeout(tm);tm=setTimeout(uklad,60)};
    uklad();
    if(d.fonts&&d.fonts.ready)d.fonts.ready.then(uklad);
    window.addEventListener('load',uklad);
    window.addEventListener('resize',plan);
  }

  // formularz pokazowy
  var f=d.getElementById('formularz');
  if(f)f.addEventListener('submit',function(e){e.preventDefault();d.getElementById('info').textContent='To wersja testowa strony - na gotowej stronie wiadomość trafi na adres iii@ilonairminaiwanska.pl.'});

  // cookies
  var ck=d.getElementById('cookies'),zg=null;
  try{zg=localStorage.getItem('zgoda')}catch(e){}
  if(ck&&!zg&&d.querySelector('.mapa')){ck.classList.add('pokaz');ck.querySelectorAll('[data-zgoda]').forEach(function(b){b.addEventListener('click',function(){try{localStorage.setItem('zgoda',b.dataset.zgoda)}catch(e){}ck.classList.remove('pokaz')})})}
})();
