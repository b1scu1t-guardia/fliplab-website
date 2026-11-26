(function(){
  var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};
  var pages=[].slice.call(document.querySelectorAll('.page')),home=pages[0];
  var hero=document.getElementById('hero'),title=document.getElementById('title'),hint=document.getElementById('hint'),
      stage=hero.querySelector('.stage'),stats=document.getElementById('stats'),
      nums=[].slice.call(document.querySelectorAll('.n')),meters=[].slice.call(document.querySelectorAll('.meter b')),
      menu=document.getElementById('menu'),burger=document.getElementById('burger');
  var still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var easeOut=function(t){return 1-Math.pow(1-t,3)},fmt=new Intl.NumberFormat('fr-FR');

  function update(){
    if(home.hidden)return;
    var vh=window.innerHeight,r=hero.getBoundingClientRect();
    var sh=stage.clientHeight||vh,p=still?.75:clamp(-r.top/(r.height-sh),0,1);
    if(window.__flip)window.__flip(p);
    title.style.opacity=clamp(1-p*3.6,0,1);
    title.style.translate='0 '+(-p*80)+'px';
    hint.style.opacity=clamp(1-p*8,0,1);
    stage.style.opacity=p>.94?clamp(1-(p-.94)/.06,0,1):1;
    var s=stats.getBoundingClientRect();
    var q=still?1:clamp((-s.top+vh*.1)/(s.height-vh*1.1),0,1),t=easeOut(clamp(q*1.15,0,1));
    nums.forEach(function(n,i){
      n.innerHTML=fmt.format(Math.round(+n.dataset.t*t))+(n.dataset.s?'<span class="u">'+n.dataset.s+'</span>':'');
      meters[i].style.width=(t*100)+'%';
    });
  }
  var tick=false;
  function onScroll(){if(!tick){tick=true;requestAnimationFrame(function(){update();tick=false})}}
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);

  function setMenu(o){
    menu.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);
    burger.setAttribute('aria-label',o?'Fermer le menu':'Ouvrir le menu');
    document.body.style.overflow=o?'hidden':'';
  }
  burger.addEventListener('click',function(){setMenu(!menu.classList.contains('open'))});
  addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});

  function swap(k,keepHash){
    pages.forEach(function(p){p.hidden=p.id!=='p-'+k});
    document.body.classList.toggle('home',k==='accueil');
    if(k!=='accueil'&&window.__padOff)window.__padOff();
    [].forEach.call(menu.querySelectorAll('a'),function(a){a.setAttribute('aria-current',a.dataset.k===k?'page':'false')});
    if(!keepHash){try{history.replaceState(null,'','#/'+k)}catch(e){}}
    window.scrollTo(0,0);
    var pg=document.getElementById('p-'+k);
    if(!still){pg.classList.add('enter');setTimeout(function(){pg.classList.remove('enter')},1000)}
    if(k==='accueil'&&window.__glResize)window.__glResize();
    update();
  }
  function go(k,keepHash){
    if(!document.getElementById('p-'+k))k='accueil';
    var cur=pages.filter(function(p){return !p.hidden})[0];
    setMenu(false);
    if(cur&&cur.id==='p-'+k)return;
    if(still||!cur||keepHash){swap(k,keepHash);return}
    cur.classList.add('out');
    setTimeout(function(){cur.classList.remove('out');swap(k,keepHash)},190);
  }
  window.__go=go;
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-go]');if(!a)return;
    e.preventDefault();go(a.dataset.go);
  });
  go((location.hash.replace('#/','')||'accueil'),true);
})();
