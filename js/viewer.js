(function(){
  var cv=document.getElementById('gl');
  if(!window.THREE||!THREE.GLTFLoader)return;
  var renderer;try{renderer=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true})}catch(e){return}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputEncoding=THREE.sRGBEncoding;
  var V3=THREE.Vector3,clamp=function(v,a,b){return Math.min(b,Math.max(a,v))},ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(35,1,.1,100);cam.position.set(0,0,5);
  scene.add(new THREE.HemisphereLight(0xffffff,0x555555,1.0));
  var dl=new THREE.DirectionalLight(0xffffff,1.6);dl.position.set(3,4,5);scene.add(dl);
  var fl=new THREE.PointLight(0xffffff,1.2,20);fl.position.set(-4,1,3);scene.add(fl);
  var rim=new THREE.PointLight(0xff7a00,1.4,20);rim.position.set(3,2,-4);scene.add(rim);
  var pivot=new THREE.Group();scene.add(pivot);

  // Repère de l'écran dans les coordonnées du modèle : C centre, U droite, V haut, N vers l'extérieur
  var C=new V3(0.06597,0.08657,0.11411),U=new V3(0.23708,0.06385,-0.96939),V=new V3(-0.41392,0.90937,-0.04133),N=new V3(0.87890,0.41105,0.24203),SC=new V3(0.06667,0.08690,0.11430);
  var D0=C.clone().addScaledVector(U,.3342).addScaledVector(N,.0094),AR=.075; // centre du D-pad et écart des flèches

  // ---- Écran 128x64 : image d'origine + menu ----
  var ROWS=["00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","000ffff8000000000000000000000000","00ffffff000000000000000000000000","03f8000ffc0000000000000000000000","0fffe003ff0000000003ffffffffff80","1ffffe07e7c000000007ffffffffffc0","7c001fcf8fe00000000c000000000060","f00003fe3cf000000008880000380060","e00000fc71b80000000c8800007c0060","c00001fcc1dc0000000889923f660060","000001f9886e00000008fbf67fbc0060","000001f3046703ff0008fff66de60060","000003e307330ff7c0088fb62de6c060","000001e66333bc00c0088b9e25bcc060","001ffbc63183f0004008000600018060","007fffc6180fc000400c000c00000060","00ffff83187f800fc00c000000000060","01fffd8301f6003fc00c000000000060","03780ec1879c00ffc00c000000000060","06c3e360de3001ff8008000000000060","07dff9e079e003ff0008000000000060","0fbffdb0238007fc000c000000020060","0f3ffcf00e000ff8000c663331027060","0f7ffef018001ff0000c545440875060","0f7cfef070003ff0000c547220425060","0f7ffef1c0007fe0000c644110825060","0f7ffef78000ffc0000c443661037060","0f7ffefc0001ff00000c400000000060","1f3fffc00003ff00000c400000000060","1fbfffc00007fe00000c000000000060","1f9fc000000ffc00000c000000000060","1fdc0000001ff800000c000240000060","1ff80000003fff0ec00c3762194c0060","1ff0000000fffffff80c455755540060","1ff0000001e1ffff980c4552555c0060","0fe0000007c01fff180c455255500060","07e002001f8001fc180c375354cc0060","000001c0ff001fe0380c000000000060","0000007bffffff00300c000000000060","0000001fffffe0007007ffffffffffe0","0000000000000000e003ffffffffffc0","0000000000000003c001ff8000000000","000000000000000f8000000000000000","000000000000003e0000000000000000","00000000000001f80000000000000000","00000000000007e00000000000000000","0000000000003f000000000000000000","000000000001fc000000000000000000","00000000001ff0000000000000000000"];
  var INK='#2e1a0e',BG='#ffa837';
  var G5={F:'11111,10000,10000,11110,10000,10000,10000',O:'01110,10001,10001,10001,10001,10001,01110',N:'10001,11001,10101,10101,10011,10001,10001',
    C:'01110,10001,10000,10000,10000,10001,01110',T:'11111,00100,00100,00100,00100,00100,00100',I:'01110,00100,00100,00100,00100,00100,01110',
    S:'01111,10000,10000,01110,00001,00001,11110',E:'11111,10000,10000,11110,10000,10000,11111',P:'11110,10001,10001,11110,10000,10000,10000',
    A:'01110,10001,10001,11111,10001,10001,10001',G:'01111,10000,10000,10011,10001,10001,01111',M:'10001,11011,10101,10101,10001,10001,10001',V:'10001,10001,10001,10001,10001,01010,00100',R:'11110,10001,10001,11110,10100,10010,10001'};
  var PAGES=[['FONCTIONS','fonctions'],['SPECS','specs'],['CONTACT','contact']];
  var sc=document.createElement('canvas');sc.width=128;sc.height=64;var sx=sc.getContext('2d');
  var tex=new THREE.CanvasTexture(sc);tex.encoding=THREE.sRGBEncoding;tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;
  function text(s,x,y,k){for(var i=0;i<s.length;i++){if(s[i]===' '){x+=3*k;continue}var g=G5[s[i]].split(',');
    for(var r=0;r<7;r++)for(var c=0;c<5;c++)if(g[r][c]==='1')sx.fillRect(x+c*k,y+r*k,k,k);x+=6*k}}
  function drawHome(){sx.fillStyle=BG;sx.fillRect(0,0,128,64);sx.fillStyle=INK;
    for(var y=0;y<64;y++)for(var x=0;x<128;x++)if((parseInt(ROWS[y][x>>2],16)>>(3-(x&3)))&1)sx.fillRect(x,y,1,1)}
  function drawMenu(sel){sx.fillStyle=BG;sx.fillRect(0,0,128,64);
    for(var i=0;i<3;i++){var y=2+21*i;
      if(i===sel){sx.fillStyle=INK;sx.fillRect(0,y,128,18);sx.fillStyle=BG}else sx.fillStyle=INK;
      text(PAGES[i][0],8,y+2,2)}}

  // ---- Boutons du Flipper (zones cliquables projetées sur le modèle) ----
  // ---- Easter egg : le jeu du dinosaure de Chrome, avec le dauphin (5 appuis rapides sur le rond du milieu) ----
  var D3=['111,101,101,101,111','010,110,010,010,111','111,001,111,100,111','111,001,111,001,111','101,101,111,001,001','111,100,111,001,111','111,100,111,101,111','111,001,001,001,001','111,101,111,101,111','111,101,111,001,111','101,101,111,101,101','111,010,010,010,111'];
  var DOL=[["....................","........###.........","##......####........","###...#########.....",".##############.##..",".###################",".#################..","###...##########....","##......#######.....","..........##........",".........##.........","...................."],["....................","........###.........","........####........","##....#########.....","###############.##..",".###################",".#################..","##....##########....","........#######.....","..........##........",".........##.........","...................."]],GY=54,gm=null,gRaf=0,gLast=0,gAcc=0,best=0;
  function spr(S,x,y){for(var r=0;r<S.length;r++)for(var c=0;c<S[r].length;c++)if(S[r][c]==='#')sx.fillRect(x+c,y+r,1,1)}
  function g3(i,x,y){var g=D3[i].split(',');for(var r=0;r<5;r++)for(var c=0;c<3;c++)if(g[r][c]==='1')sx.fillRect(x+c,y+r,1,1)}
  function num(n,x,y){var s=('00000'+n).slice(-5);for(var i=0;i<5;i++)g3(+s[i],x+i*4,y)}
  function gInit(){gm={y:0,vy:0,air:false,fast:false,o:[],sp:1.8,d:0,t:0,over:false,next:70,b:[]};
    for(var i=0;i<8;i++)gm.b.push({x:Math.random()*128,w:1+(Math.random()*3|0),dy:Math.random()*4|0})}
  function gStep(){
    var m=gm,i;if(m.over)return;
    m.t++;m.sp=Math.min(4.2,1.8+m.d/2200);m.d+=m.sp;
    if(m.air){m.vy-=m.fast?.95:.32;m.y+=m.vy;if(m.y<=0){m.y=0;m.vy=0;m.air=false;m.fast=false}}
    for(i=0;i<m.b.length;i++){m.b[i].x-=m.sp;if(m.b[i].x<-4)m.b[i].x=128+Math.random()*30}
    for(i=m.o.length-1;i>=0;i--){m.o[i].x-=m.sp;if(m.o[i].x+m.o[i].w<-2)m.o.splice(i,1)}
    m.next-=m.sp;
    if(m.next<=0){var n=1+(Math.random()*(m.d>600?3:2)|0),hh=Math.random()<.4?15:11;m.o.push({x:130,n:n,h:hh,w:n*7});m.next=m.sp*(38+Math.random()*34)+n*7}
    var top=GY-10-Math.round(m.y);
    for(i=0;i<m.o.length;i++){var o=m.o[i];if(o.x+1<24&&o.x+o.w-1>11&&top+8>GY+1-o.h)m.over=true}
    if(m.over&&Math.floor(m.d/6)>best)best=Math.floor(m.d/6);
  }
  function gDraw(){
    var m=gm,i;sx.fillStyle=BG;sx.fillRect(0,0,128,64);sx.fillStyle=INK;
    sx.fillRect(0,GY+1,128,1);
    for(i=0;i<m.b.length;i++)sx.fillRect(Math.round(m.b[i].x),GY+3+m.b[i].dy,m.b[i].w,1);
    for(i=0;i<m.o.length;i++){var o=m.o[i],x=Math.round(o.x),b=GY+1;
      for(var k=0;k<o.n;k++){var cx=x+k*7;sx.fillRect(cx+2,b-o.h,3,o.h);sx.fillRect(cx,b-o.h+3,1,4);sx.fillRect(cx,b-o.h+6,3,1);sx.fillRect(cx+6,b-o.h+2,1,4);sx.fillRect(cx+4,b-o.h+5,3,1)}}
    spr(DOL[m.air?0:((m.t/6|0)&1)],8,GY-10-Math.round(m.y));
    num(Math.floor(m.d/6),104,3);
    if(best){g3(10,58,3);g3(11,62,3);num(best,68,3)}
    if(m.over){sx.fillStyle=BG;sx.fillRect(24,16,80,28);sx.fillStyle=INK;
      sx.fillRect(24,16,80,1);sx.fillRect(24,43,80,1);sx.fillRect(24,16,1,28);sx.fillRect(103,16,1,28);
      text('GAME OVER',39,20,1);num(Math.floor(m.d/6),54,32)}
  }
  function gLoop(ts){
    if(!inGame)return;
    gAcc+=Math.min(50,ts-(gLast||ts));gLast=ts;
    while(gAcc>=16.667){gStep();gAcc-=16.667}
    gDraw();tex.needsUpdate=true;renderer.render(scene,cam);
    gRaf=requestAnimationFrame(gLoop);
  }
  function startGame(){inGame=true;menuOpen=false;gInit();gLast=0;gAcc=0;redraw(false);gRaf=requestAnimationFrame(gLoop)}
  function stopGame(){inGame=false;cancelAnimationFrame(gRaf)}
  function gameKey(k){
    if(k==='left'){stopGame();menuOpen=true;redraw(true);return}          // retour au choix de la page
    if(gm.over){if(k==='ok'||k==='up')gInit();return}
    if(k==='up'||k==='ok'){if(!gm.air){gm.air=true;gm.vy=4.6}}             // sauter
    else if(k==='down'&&gm.air)gm.fast=true;                              // redescendre plus vite
  }

  // ---- Boutons du Flipper (zones cliquables projetées sur le modèle) ----
  var pad=document.getElementById('pad'),cap=document.getElementById('cap'),keys={},menuOpen=false,sel=0,dwell=false,ready=false,anch=null,inGame=false,okT=[],navT=0;
  function redraw(now){
    if(!inGame){if(menuOpen)drawMenu(sel);else drawHome();tex.needsUpdate=true}
    pad.dataset.m=inGame?'game':menuOpen?'open':'closed';
    cap.textContent=inGame?'Haut ou rond : sauter · Bas : descendre vite · Gauche : retour':menuOpen?'Haut / bas pour choisir, rond du milieu pour ouvrir':'Touchez la flèche droite du Flipper';
    if(now&&ready)renderer.render(scene,cam)}
  function setDwell(on){dwell=on;pad.classList.toggle('on',on);cap.classList.toggle('on',on);if(!on){menuOpen=false;sel=0;stopGame();clearTimeout(navT)}redraw()}
  function press(k){
    if(!dwell)return;
    if(inGame){gameKey(k);return}
    if(k==='ok'){
      var n=Date.now();okT=okT.filter(function(t){return n-t<1600});okT.push(n);clearTimeout(navT);
      if(okT.length>=5){okT=[];startGame();return}
      if(menuOpen&&window.__go){var pg=PAGES[sel][1];navT=setTimeout(function(){if(dwell&&!inGame)window.__go(pg)},320)}  // laisse le temps de spammer
      return;
    }
    clearTimeout(navT);
    if(k==='right'){if(!menuOpen){menuOpen=true;sel=0}}
    else if(k==='left'){menuOpen=false}
    else if(k==='up'&&menuOpen)sel=(sel+2)%3;
    else if(k==='down'&&menuOpen)sel=(sel+1)%3;
    redraw(true);
  }
  [].forEach.call(pad.querySelectorAll('button'),function(b){keys[b.dataset.k]=b;b.addEventListener('click',function(){press(b.dataset.k)})});
  addEventListener('keydown',function(e){
    if(!dwell||/^(INPUT|TEXTAREA)$/.test(e.target.tagName))return;
    var m={ArrowRight:'right',ArrowLeft:'left',ArrowUp:'up',ArrowDown:'down'}[e.key];
    if(m){if((m==='up'||m==='down')&&!menuOpen&&!inGame)return;e.preventDefault();press(m)}
    else if(e.key===' '&&inGame){e.preventDefault();press('ok')}
    else if(e.key==='Enter'&&!/^(BUTTON|A)$/.test(e.target.tagName)){e.preventDefault();if(!e.repeat)press('ok')}
  });
  var tmp=new V3();
  function pj(o){o.getWorldPosition(tmp);tmp.project(cam);return[(tmp.x*.5+.5)*cv.clientWidth,(-tmp.y*.5+.5)*cv.clientHeight]}
  function placePad(){
    var a=pj(anch.ok),b=pj(anch.right),r=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(var k in anch){var q=pj(anch[k]),sz=k==='ok'?Math.max(44,r*.9):Math.max(44,r*1.25),el=keys[k];
      el.style.width=el.style.height=sz+'px';el.style.transform='translate3d('+(q[0]-sz/2)+'px,'+(q[1]-sz/2)+'px,0)'}
  }

  // ---- Chorégraphie : rotation (0 à .58), pause face caméra (.58 à .92), zoom dans l'écran (.92 à 1) ----
  var qS=new THREE.Quaternion().setFromEuler(new THREE.Euler(.9,-.6,0)),qF=new THREE.Quaternion(),qT=new THREE.Quaternion(),qY=new THREE.Quaternion(),AY=new V3(0,1,0);
  var P=0,Rm=.6,ctr0=new V3(),roi=new V3(),s0=1,sD=2,stX=0,stY=0,off=new V3();
  function layout(){
    var w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
    var hh=cam.position.z*Math.tan(cam.fov*Math.PI/360),hw=hh*cam.aspect,wide=cam.aspect>1.15,port=cam.aspect<1;
    s0=Math.min(hh*(wide?.74:.46),hw*(wide?.46:.8));
    stX=wide?hw*.42:0;stY=wide?0:-hh*.24;
    // taille pendant la pause : l'appareil entier sur ordinateur, écran + D-pad en gros plan sur téléphone
    var rf=Math.min(hw*.9/(.3075/Rm),hh*.62/(.15/Rm)),df=hw*.95/(.525/Rm);
    sD=port?rf:Math.min(rf,df);
    roi.copy(C).addScaledVector(U,port?.14:.067).sub(ctr0).divideScalar(Rm);
    apply(P);
  }
  function apply(p){
    P=p;
    var e=ease(clamp(p/.58,0,1)),z=ease(clamp((p-.92)/.08,0,1))*6;
    qT.copy(qS).slerp(qF,e);qY.setFromAxisAngle(AY,(1-e)*Math.PI*2);
    pivot.quaternion.copy(qY).multiply(qT);
    var s=(s0+(sD-s0)*e)*(1+z);
    pivot.scale.setScalar(s);
    off.copy(roi).applyQuaternion(pivot.quaternion).multiplyScalar(-s*e);
    pivot.position.set(stX*(1-e)+off.x,stY*(1-e)+off.y,off.z);
    var on=ready&&p>.62&&p<.88;
    if(on!==dwell)setDwell(on);
    renderer.render(scene,cam);
    if(dwell)placePad();
  }
  window.__flip=apply;window.__glResize=layout;window.__padOff=function(){if(dwell)setDwell(false)};
  redraw();

  function loadModel(){try{
    var bin=atob(MODEL_B64),buf=new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++)buf[i]=bin.charCodeAt(i);
    new THREE.GLTFLoader().parse(buf.buffer,'',function(g){
      var m=g.scene,sp=new THREE.Box3().setFromObject(m).getBoundingSphere(new THREE.Sphere());
      m.position.sub(sp.center);ctr0.copy(sp.center);Rm=sp.radius;
      var wrap=new THREE.Group();wrap.add(m);wrap.scale.setScalar(1/sp.radius);
      var sm=null;m.traverse(function(o){if(o.isMesh&&o.material&&o.material.name==='Flipper_Screen')sm=o});
      if(sm){
        var pl=new THREE.Mesh(new THREE.PlaneGeometry(0.32742,0.17510),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));
        pl.position.copy(SC);pl.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(U,V,N));
        sm.parent.add(pl);
        var mk=function(v){var o=new THREE.Object3D();o.position.copy(v);sm.parent.add(o);return o};
        anch={ok:mk(D0),right:mk(D0.clone().addScaledVector(U,AR)),left:mk(D0.clone().addScaledVector(U,-AR)),
              up:mk(D0.clone().addScaledVector(V,AR)),down:mk(D0.clone().addScaledVector(V,-AR))};
        ready=true;
      }
      qF.setFromRotationMatrix(new THREE.Matrix4().makeBasis(U,V,N)).invert(); // écran face caméra, texte à l'endroit
      pivot.add(wrap);layout();
    },function(e){console.error('GLB',e)});
  }catch(e){console.error(e)}}
  setTimeout(loadModel,60);
  window.addEventListener('resize',layout);layout();
})();
