import{S as a,i as e,s as o,B as s,j as r,m as n,o as t,p as i,q as l,x as c,u as p,v as d,N as u,e as m,t as v,k as h,c as f,a as E,g as b,d as g,n as A,b as k,F as y,f as S,G as P,K as z}from"../../../chunks/vendor-64eebebd.js";import{P as R}from"../../../chunks/PostLayout-1d1b8b8e.js";function q(a){let e,o,s,r,n,t,i,l,c,p,d,u,R,q,D,L,O,I,x,H,M,N,j,w,T,$,C,K,J,U,X,_,F,B,G,Q,Y,V,Z,W,aa,ea,oa,sa,ra,na,ta,ia,la,ca,pa,da,ua,ma,va,ha,fa,Ea,ba,ga,Aa,ka,ya,Sa,Pa,za,Ra,qa,Da,La,Oa,Ia,xa,Ha,Ma,Na,ja,wa,Ta,$a,Ca,Ka,Ja,Ua,Xa,_a,Fa,Ba,Ga,Qa,Ya,Va,Za,Wa,ae,ee,oe,se,re,ne,te,ie,le,ce,pe,de,ue,me,ve,he,fe,Ee,be,ge,Ae,ke,ye,Se,Pe,ze,Re,qe,De,Le,Oe,Ie,xe,He,Me,Ne,je,we,Te,$e,Ce,Ke,Je,Ue,Xe,_e,Fe,Be,Ge,Qe,Ye,Ve,Ze,We,ao,eo,oo,so,ro,no,to,io,lo,co,po,uo,mo,vo,ho,fo,Eo,bo,go,Ao,ko,yo,So,Po,zo;return{c(){e=m("p"),o=v("Esta semana he comenzado un nuevo proyecto junto a un nuevo equipo en "),s=m("a"),r=v("Modus Create"),n=v(". Una nueva intersante aventura creando una nueva aplicación utilizando React pero esta vez se trata de una aplicación nativa para Android, es decir, utilizando React Native."),t=h(),i=m("h1"),l=v("¿Qué es React Native?"),c=h(),p=m("p"),d=v("React Native es, actualmente, un framework bastante popular que permite crear aplicaciones nativas utilizando Javascript, aplicaciones nativas para Android e iOS."),u=h(),R=m("p"),q=v("Fue inicialmente publicado por Facebook el 2015 y en solo unos pocos años se convirtió en una solución importante a la hora de construir aplicaciones mobiles."),D=h(),L=m("p"),O=v("Básicamente React Native utiliza el poder de React para “compilar” o más bien “transpilar” código Javascript a código nativo de cada plataforma. La principal diferencia entre React y React Native es que React Native en realidad utiliza React pero sobre una nueva plataforma y en ez de utilizar primitivas del DOM (provistas por react-dom) utiliza primitvas para apuntar a los dispositivos."),I=h(),x=m("p"),H=v("En vez de divs y spans (primitivas provistas por react-dom) se usa "),M=m("code"),N=v("<View>"),j=v(", "),w=m("code"),T=v("<Text>"),$=v(", etc"),C=h(),K=m("p"),J=v("La idea de este framework es permitir el desarrollo multiplataforma de aplicaciones, permite combinar las “mejores” partes de el desarrollo de aplicaciones nativas y el flexible uso (y conocimiento) de Javascript."),U=h(),X=m("h2"),_=v("iOS Simulator"),F=h(),B=m("p"),G=v("Para ejecutar tu app en un simulador de iOS necesitas, primero un Mac, luego instalar Xcode, la forma más simple de hacerlo es instalado desde la "),Q=m("a"),Y=v("Mac App Store"),V=v(" eso también instalar el simulador de iOS."),Z=h(),W=m("h3"),aa=v("Command Line Tools"),ea=h(),oa=m("p"),sa=v("También será necesario instalar las herramientas de linea de comando, para esto simplemente abre XCode, selecciona preferencias (CMD + ,) y en la pestaña “Locations” selecciona desde el dropdown la versión más reciente."),ra=h(),na=m("p"),ta=m("img"),la=h(),ca=m("h3"),pa=v("iOS Simulator"),da=h(),ua=m("p"),ma=v("Nuevamente en la preferencias de Xcode, selecciona la pestaña "),va=m("strong"),ha=v("Componentes"),fa=v(". Seleciona el simulador que deseas."),Ea=h(),ba=m("p"),ga=v("Finalmente es neceario instalar "),Aa=m("a"),ka=v("Cocoapods"),ya=v(", esta es una herramiente escrita en Ruby que te permitirá manejar dependencias. Por defecto tu SO ya tiene ruby instalado, por lo que solo debes abrir la consola y ejecutar"),Sa=h(),Pa=m("pre"),za=h(),Ra=m("h2"),qa=v("Android emulator"),Da=h(),La=m("p"),Oa=v("Para ejecutar tu aplicación el el simulador de Android necesitarás"),Ia=h(),xa=m("ul"),Ha=m("li"),Ma=m("p"),Na=v("node"),ja=h(),wa=m("li"),Ta=m("p"),$a=v("watchman"),Ca=h(),Ka=m("li"),Ja=m("p"),Ua=v("el JDK"),Xa=h(),_a=m("li"),Fa=m("p"),Ba=v("Android Studio"),Ga=h(),Qa=m("p"),Ya=v("Anroid Studio es necesario para poder utilizar las herramientas de compilado de Android, puedes usar el editor de tu gusto para desarrollar."),Va=h(),Za=m("p"),Wa=v("Lo primero será instalar node y watchman, lo más seguro es que puede saltarte este paso ya que probablemente ya tienes esto instalado"),ae=h(),ee=m("pre"),oe=h(),se=m("h3"),re=v("Java Development Kit"),ne=h(),te=m("p"),ie=v("El JDK provee herramientas para el desarrollo de aplicaciones Java, Android utiliza estas herramientas en el proceso de compilar y construir el paquete de la aplicación.\nSe recomienda utilizar Hoombrew para instalar."),le=h(),ce=m("pre"),pe=h(),de=m("h3"),ue=v("Android development env"),me=h(),ve=m("p"),he=v("Esta parte puede ser algo tediosa pero no es compleja."),fe=h(),Ee=m("ul"),be=m("li"),ge=v("Instala Android Studio descargandolo desde "),Ae=m("a"),ke=v("aqui"),ye=v("\nY en el wizard asegurate de que los siguiente checkbox estén activados"),Se=m("ul"),Pe=m("li"),ze=v("Android SDK"),Re=h(),qe=m("li"),De=v("Android SDK Platform"),Le=m("ul"),Oe=m("li"),Ie=v("Android Virtual Device"),xe=m("ul"),He=m("li"),Me=v("Performance (Intel HAXM)"),Ne=h(),je=m("p"),we=v("Después de que este parte finalice debes instalar el Android SDK, Android Studio instala el último SDK por defecto, pero para react-native requieres \\Android 10 (Q)\\. Asegurate que este instalada esa versión. Abre Android Studio, click en “Configurar” y selecciona "),Te=m("strong"),$e=v("SDK Manager"),Ce=v(".\nEn este ventana, seleciona las plataformas que desea, revisa que Android 10 (Q) esta seleccionado, expande este elemento de la lista y asegurate que también esten seleccionadas"),Ke=h(),Je=m("ul"),Ue=m("li"),Xe=v("Android SDK Platform 29"),_e=h(),Fe=m("li"),Be=v("Intel x86 Atom"),Ge=m("sub"),Qe=v("64"),Ye=v(" System Image or Google APIs Intel x86 Atom System Image"),Ve=h(),Ze=m("p"),We=v("Finalmente click en “Applicar”."),ao=h(),eo=m("p"),oo=v("El último paso en configurar las variables de ambiente para ANDROID"),so=m("sub"),ro=v("HOME"),no=v("\nEdita tu archivo `.bash"),to=m("sub"),io=v("profile"),lo=v("` o `.bashrc` o `.zprofile` o `.zshrc`, dependiendo de la shell que este utiliznado y agrega:"),co=h(),po=m("pre"),uo=h(),mo=m("h1"),vo=v("Crear una aplicación!"),ho=h(),fo=m("p"),Eo=v("Ya está todo listo para crear tu primera aplicación, abre una consola y ejecuta"),bo=h(),go=m("pre"),Ao=h(),ko=m("p"),yo=v("Esto crear un proyecto expo con todo lo necesario para ejecutar la app (algo así com `create-react-app` para la web) y con `npm start` iniciar el servidor de desarrollo."),So=h(),Po=m("p"),zo=v("Y ya está ahora, se abrirá una ventana en tu navegador por defecto mostrando la vista de Metro Bundler, que es el empaquetador de expo y te permitirá ejecutar tu app en el navegador, en alguno de los simuladores o utilizar el código QR para ejecutar la app en tu dispositivo móvil utilizando la app Expo."),this.h()},l(a){e=f(a,"P",{});var m=E(e);o=b(m,"Esta semana he comenzado un nuevo proyecto junto a un nuevo equipo en "),s=f(m,"A",{href:!0,rel:!0});var v=E(s);r=b(v,"Modus Create"),v.forEach(g),n=b(m,". Una nueva intersante aventura creando una nueva aplicación utilizando React pero esta vez se trata de una aplicación nativa para Android, es decir, utilizando React Native."),m.forEach(g),t=A(a),i=f(a,"H1",{id:!0});var h=E(i);l=b(h,"¿Qué es React Native?"),h.forEach(g),c=A(a),p=f(a,"P",{});var k=E(p);d=b(k,"React Native es, actualmente, un framework bastante popular que permite crear aplicaciones nativas utilizando Javascript, aplicaciones nativas para Android e iOS."),k.forEach(g),u=A(a),R=f(a,"P",{});var y=E(R);q=b(y,"Fue inicialmente publicado por Facebook el 2015 y en solo unos pocos años se convirtió en una solución importante a la hora de construir aplicaciones mobiles."),y.forEach(g),D=A(a),L=f(a,"P",{});var S=E(L);O=b(S,"Básicamente React Native utiliza el poder de React para “compilar” o más bien “transpilar” código Javascript a código nativo de cada plataforma. La principal diferencia entre React y React Native es que React Native en realidad utiliza React pero sobre una nueva plataforma y en ez de utilizar primitivas del DOM (provistas por react-dom) utiliza primitvas para apuntar a los dispositivos."),S.forEach(g),I=A(a),x=f(a,"P",{});var P=E(x);H=b(P,"En vez de divs y spans (primitivas provistas por react-dom) se usa "),M=f(P,"CODE",{});var z=E(M);N=b(z,"<View>"),z.forEach(g),j=b(P,", "),w=f(P,"CODE",{});var ia=E(w);T=b(ia,"<Text>"),ia.forEach(g),$=b(P,", etc"),P.forEach(g),C=A(a),K=f(a,"P",{});var Ro=E(K);J=b(Ro,"La idea de este framework es permitir el desarrollo multiplataforma de aplicaciones, permite combinar las “mejores” partes de el desarrollo de aplicaciones nativas y el flexible uso (y conocimiento) de Javascript."),Ro.forEach(g),U=A(a),X=f(a,"H2",{id:!0});var qo=E(X);_=b(qo,"iOS Simulator"),qo.forEach(g),F=A(a),B=f(a,"P",{});var Do=E(B);G=b(Do,"Para ejecutar tu app en un simulador de iOS necesitas, primero un Mac, luego instalar Xcode, la forma más simple de hacerlo es instalado desde la "),Q=f(Do,"A",{href:!0,rel:!0});var Lo=E(Q);Y=b(Lo,"Mac App Store"),Lo.forEach(g),V=b(Do," eso también instalar el simulador de iOS."),Do.forEach(g),Z=A(a),W=f(a,"H3",{id:!0});var Oo=E(W);aa=b(Oo,"Command Line Tools"),Oo.forEach(g),ea=A(a),oa=f(a,"P",{});var Io=E(oa);sa=b(Io,"También será necesario instalar las herramientas de linea de comando, para esto simplemente abre XCode, selecciona preferencias (CMD + ,) y en la pestaña “Locations” selecciona desde el dropdown la versión más reciente."),Io.forEach(g),ra=A(a),na=f(a,"P",{});var xo=E(na);ta=f(xo,"IMG",{src:!0,alt:!0,title:!0}),xo.forEach(g),la=A(a),ca=f(a,"H3",{id:!0});var Ho=E(ca);pa=b(Ho,"iOS Simulator"),Ho.forEach(g),da=A(a),ua=f(a,"P",{});var Mo=E(ua);ma=b(Mo,"Nuevamente en la preferencias de Xcode, selecciona la pestaña "),va=f(Mo,"STRONG",{});var No=E(va);ha=b(No,"Componentes"),No.forEach(g),fa=b(Mo,". Seleciona el simulador que deseas."),Mo.forEach(g),Ea=A(a),ba=f(a,"P",{});var jo=E(ba);ga=b(jo,"Finalmente es neceario instalar "),Aa=f(jo,"A",{href:!0,rel:!0});var wo=E(Aa);ka=b(wo,"Cocoapods"),wo.forEach(g),ya=b(jo,", esta es una herramiente escrita en Ruby que te permitirá manejar dependencias. Por defecto tu SO ya tiene ruby instalado, por lo que solo debes abrir la consola y ejecutar"),jo.forEach(g),Sa=A(a),Pa=f(a,"PRE",{class:!0}),E(Pa).forEach(g),za=A(a),Ra=f(a,"H2",{id:!0});var To=E(Ra);qa=b(To,"Android emulator"),To.forEach(g),Da=A(a),La=f(a,"P",{});var $o=E(La);Oa=b($o,"Para ejecutar tu aplicación el el simulador de Android necesitarás"),$o.forEach(g),Ia=A(a),xa=f(a,"UL",{});var Co=E(xa);Ha=f(Co,"LI",{});var Ko=E(Ha);Ma=f(Ko,"P",{});var Jo=E(Ma);Na=b(Jo,"node"),Jo.forEach(g),Ko.forEach(g),ja=A(Co),wa=f(Co,"LI",{});var Uo=E(wa);Ta=f(Uo,"P",{});var Xo=E(Ta);$a=b(Xo,"watchman"),Xo.forEach(g),Uo.forEach(g),Ca=A(Co),Ka=f(Co,"LI",{});var _o=E(Ka);Ja=f(_o,"P",{});var Fo=E(Ja);Ua=b(Fo,"el JDK"),Fo.forEach(g),_o.forEach(g),Xa=A(Co),_a=f(Co,"LI",{});var Bo=E(_a);Fa=f(Bo,"P",{});var Go=E(Fa);Ba=b(Go,"Android Studio"),Go.forEach(g),Ga=A(Bo),Qa=f(Bo,"P",{});var Qo=E(Qa);Ya=b(Qo,"Anroid Studio es necesario para poder utilizar las herramientas de compilado de Android, puedes usar el editor de tu gusto para desarrollar."),Qo.forEach(g),Va=A(Bo),Za=f(Bo,"P",{});var Yo=E(Za);Wa=b(Yo,"Lo primero será instalar node y watchman, lo más seguro es que puede saltarte este paso ya que probablemente ya tienes esto instalado"),Yo.forEach(g),Bo.forEach(g),Co.forEach(g),ae=A(a),ee=f(a,"PRE",{class:!0}),E(ee).forEach(g),oe=A(a),se=f(a,"H3",{id:!0});var Vo=E(se);re=b(Vo,"Java Development Kit"),Vo.forEach(g),ne=A(a),te=f(a,"P",{});var Zo=E(te);ie=b(Zo,"El JDK provee herramientas para el desarrollo de aplicaciones Java, Android utiliza estas herramientas en el proceso de compilar y construir el paquete de la aplicación.\nSe recomienda utilizar Hoombrew para instalar."),Zo.forEach(g),le=A(a),ce=f(a,"PRE",{class:!0}),E(ce).forEach(g),pe=A(a),de=f(a,"H3",{id:!0});var Wo=E(de);ue=b(Wo,"Android development env"),Wo.forEach(g),me=A(a),ve=f(a,"P",{});var as=E(ve);he=b(as,"Esta parte puede ser algo tediosa pero no es compleja."),as.forEach(g),fe=A(a),Ee=f(a,"UL",{});var es=E(Ee);be=f(es,"LI",{});var os=E(be);ge=b(os,"Instala Android Studio descargandolo desde "),Ae=f(os,"A",{href:!0,rel:!0});var ss=E(Ae);ke=b(ss,"aqui"),ss.forEach(g),ye=b(os,"\nY en el wizard asegurate de que los siguiente checkbox estén activados"),Se=f(os,"UL",{});var rs=E(Se);Pe=f(rs,"LI",{});var ns=E(Pe);ze=b(ns,"Android SDK"),ns.forEach(g),rs.forEach(g),os.forEach(g),Re=A(es),qe=f(es,"LI",{});var ts=E(qe);De=b(ts,"Android SDK Platform"),Le=f(ts,"UL",{});var is=E(Le);Oe=f(is,"LI",{});var ls=E(Oe);Ie=b(ls,"Android Virtual Device"),xe=f(ls,"UL",{});var cs=E(xe);He=f(cs,"LI",{});var ps=E(He);Me=b(ps,"Performance (Intel HAXM)"),ps.forEach(g),cs.forEach(g),ls.forEach(g),is.forEach(g),ts.forEach(g),es.forEach(g),Ne=A(a),je=f(a,"P",{});var ds=E(je);we=b(ds,"Después de que este parte finalice debes instalar el Android SDK, Android Studio instala el último SDK por defecto, pero para react-native requieres \\Android 10 (Q)\\. Asegurate que este instalada esa versión. Abre Android Studio, click en “Configurar” y selecciona "),Te=f(ds,"STRONG",{});var us=E(Te);$e=b(us,"SDK Manager"),us.forEach(g),Ce=b(ds,".\nEn este ventana, seleciona las plataformas que desea, revisa que Android 10 (Q) esta seleccionado, expande este elemento de la lista y asegurate que también esten seleccionadas"),ds.forEach(g),Ke=A(a),Je=f(a,"UL",{});var ms=E(Je);Ue=f(ms,"LI",{});var vs=E(Ue);Xe=b(vs,"Android SDK Platform 29"),vs.forEach(g),_e=A(ms),Fe=f(ms,"LI",{});var hs=E(Fe);Be=b(hs,"Intel x86 Atom"),Ge=f(hs,"SUB",{});var fs=E(Ge);Qe=b(fs,"64"),fs.forEach(g),Ye=b(hs," System Image or Google APIs Intel x86 Atom System Image"),hs.forEach(g),ms.forEach(g),Ve=A(a),Ze=f(a,"P",{});var Es=E(Ze);We=b(Es,"Finalmente click en “Applicar”."),Es.forEach(g),ao=A(a),eo=f(a,"P",{});var bs=E(eo);oo=b(bs,"El último paso en configurar las variables de ambiente para ANDROID"),so=f(bs,"SUB",{});var gs=E(so);ro=b(gs,"HOME"),gs.forEach(g),no=b(bs,"\nEdita tu archivo `.bash"),to=f(bs,"SUB",{});var As=E(to);io=b(As,"profile"),As.forEach(g),lo=b(bs,"` o `.bashrc` o `.zprofile` o `.zshrc`, dependiendo de la shell que este utiliznado y agrega:"),bs.forEach(g),co=A(a),po=f(a,"PRE",{class:!0}),E(po).forEach(g),uo=A(a),mo=f(a,"H1",{id:!0});var ks=E(mo);vo=b(ks,"Crear una aplicación!"),ks.forEach(g),ho=A(a),fo=f(a,"P",{});var ys=E(fo);Eo=b(ys,"Ya está todo listo para crear tu primera aplicación, abre una consola y ejecuta"),ys.forEach(g),bo=A(a),go=f(a,"PRE",{class:!0}),E(go).forEach(g),Ao=A(a),ko=f(a,"P",{});var Ss=E(ko);yo=b(Ss,"Esto crear un proyecto expo con todo lo necesario para ejecutar la app (algo así com `create-react-app` para la web) y con `npm start` iniciar el servidor de desarrollo."),Ss.forEach(g),So=A(a),Po=f(a,"P",{});var Ps=E(Po);zo=b(Ps,"Y ya está ahora, se abrirá una ventana en tu navegador por defecto mostrando la vista de Metro Bundler, que es el empaquetador de expo y te permitirá ejecutar tu app en el navegador, en alguno de los simuladores o utilizar el código QR para ejecutar la app en tu dispositivo móvil utilizando la app Expo."),Ps.forEach(g),this.h()},h(){k(s,"href","https://moduscreate.com"),k(s,"rel","nofollow"),k(i,"id","¿qué-es-react-native"),k(X,"id","ios-simulator"),k(Q,"href","https://itunes.apple.com/us/app/xcode/id497799835?mt=12"),k(Q,"rel","nofollow"),k(W,"id","command-line-tools"),y(ta.src,ia="https://reactnative.dev/docs/assets/GettingStartedXcodeCommandLineTools.png")||k(ta,"src","https://reactnative.dev/docs/assets/GettingStartedXcodeCommandLineTools.png"),k(ta,"alt","img"),k(ta,"title","Preferencias de XCode"),k(ca,"id","ios-simulator-1"),k(Aa,"href","https://cocoapods.org/"),k(Aa,"rel","nofollow"),k(Pa,"class","language-shell"),k(Ra,"id","android-emulator"),k(ee,"class","language-shell"),k(se,"id","java-development-kit"),k(ce,"class","language-shell"),k(de,"id","android-development-env"),k(Ae,"href","https://developer.android.com/studio/index.html"),k(Ae,"rel","nofollow"),k(po,"class","language-shell"),k(mo,"id","crear-una-aplicación"),k(go,"class","language-shell")},m(a,m){S(a,e,m),P(e,o),P(e,s),P(s,r),P(e,n),S(a,t,m),S(a,i,m),P(i,l),S(a,c,m),S(a,p,m),P(p,d),S(a,u,m),S(a,R,m),P(R,q),S(a,D,m),S(a,L,m),P(L,O),S(a,I,m),S(a,x,m),P(x,H),P(x,M),P(M,N),P(x,j),P(x,w),P(w,T),P(x,$),S(a,C,m),S(a,K,m),P(K,J),S(a,U,m),S(a,X,m),P(X,_),S(a,F,m),S(a,B,m),P(B,G),P(B,Q),P(Q,Y),P(B,V),S(a,Z,m),S(a,W,m),P(W,aa),S(a,ea,m),S(a,oa,m),P(oa,sa),S(a,ra,m),S(a,na,m),P(na,ta),S(a,la,m),S(a,ca,m),P(ca,pa),S(a,da,m),S(a,ua,m),P(ua,ma),P(ua,va),P(va,ha),P(ua,fa),S(a,Ea,m),S(a,ba,m),P(ba,ga),P(ba,Aa),P(Aa,ka),P(ba,ya),S(a,Sa,m),S(a,Pa,m),Pa.innerHTML='<code class="language-shell">    <span class="token function">sudo</span> gem <span class="token function">install</span> cocoapods</code>',S(a,za,m),S(a,Ra,m),P(Ra,qa),S(a,Da,m),S(a,La,m),P(La,Oa),S(a,Ia,m),S(a,xa,m),P(xa,Ha),P(Ha,Ma),P(Ma,Na),P(xa,ja),P(xa,wa),P(wa,Ta),P(Ta,$a),P(xa,Ca),P(xa,Ka),P(Ka,Ja),P(Ja,Ua),P(xa,Xa),P(xa,_a),P(_a,Fa),P(Fa,Ba),P(_a,Ga),P(_a,Qa),P(Qa,Ya),P(_a,Va),P(_a,Za),P(Za,Wa),S(a,ae,m),S(a,ee,m),ee.innerHTML='<code class="language-shell">      brew <span class="token function">install</span> node\n      brew <span class="token function">install</span> watchman</code>',S(a,oe,m),S(a,se,m),P(se,re),S(a,ne,m),S(a,te,m),P(te,ie),S(a,le,m),S(a,ce,m),ce.innerHTML='<code class="language-shell">    brew cask <span class="token function">install</span> adoptopenjdk/openjdk/adoptopenjdk8</code>',S(a,pe,m),S(a,de,m),P(de,ue),S(a,me,m),S(a,ve,m),P(ve,he),S(a,fe,m),S(a,Ee,m),P(Ee,be),P(be,ge),P(be,Ae),P(Ae,ke),P(be,ye),P(be,Se),P(Se,Pe),P(Pe,ze),P(Ee,Re),P(Ee,qe),P(qe,De),P(qe,Le),P(Le,Oe),P(Oe,Ie),P(Oe,xe),P(xe,He),P(He,Me),S(a,Ne,m),S(a,je,m),P(je,we),P(je,Te),P(Te,$e),P(je,Ce),S(a,Ke,m),S(a,Je,m),P(Je,Ue),P(Ue,Xe),P(Je,_e),P(Je,Fe),P(Fe,Be),P(Fe,Ge),P(Ge,Qe),P(Fe,Ye),S(a,Ve,m),S(a,Ze,m),P(Ze,We),S(a,ao,m),S(a,eo,m),P(eo,oo),P(eo,so),P(so,ro),P(eo,no),P(eo,to),P(to,io),P(eo,lo),S(a,co,m),S(a,po,m),po.innerHTML='<code class="language-shell">    <span class="token builtin class-name">export</span> <span class="token assign-left variable">ANDROID_HOME</span><span class="token operator">=</span><span class="token environment constant">$HOME</span>/Library/Android/sdk\n    <span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token environment constant">$PATH</span><span class="token builtin class-name">:</span><span class="token variable">$ANDROID_HOME</span>/emulator\n    <span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token environment constant">$PATH</span><span class="token builtin class-name">:</span><span class="token variable">$ANDROID_HOME</span>/tools\n    <span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token environment constant">$PATH</span><span class="token builtin class-name">:</span><span class="token variable">$ANDROID_HOME</span>/tools/bin\n    <span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token environment constant">$PATH</span><span class="token builtin class-name">:</span><span class="token variable">$ANDROID_HOME</span>/platform-tools</code>',S(a,uo,m),S(a,mo,m),P(mo,vo),S(a,ho,m),S(a,fo,m),P(fo,Eo),S(a,bo,m),S(a,go,m),go.innerHTML='<code class="language-shell">    expo init MiNuevaAppRN\n    \n    <span class="token builtin class-name">cd</span> MiNuevaAppRN\n    <span class="token function">npm</span> start</code>',S(a,Ao,m),S(a,ko,m),P(ko,yo),S(a,So,m),S(a,Po,m),P(Po,zo)},p:z,d(a){a&&g(e),a&&g(t),a&&g(i),a&&g(c),a&&g(p),a&&g(u),a&&g(R),a&&g(D),a&&g(L),a&&g(I),a&&g(x),a&&g(C),a&&g(K),a&&g(U),a&&g(X),a&&g(F),a&&g(B),a&&g(Z),a&&g(W),a&&g(ea),a&&g(oa),a&&g(ra),a&&g(na),a&&g(la),a&&g(ca),a&&g(da),a&&g(ua),a&&g(Ea),a&&g(ba),a&&g(Sa),a&&g(Pa),a&&g(za),a&&g(Ra),a&&g(Da),a&&g(La),a&&g(Ia),a&&g(xa),a&&g(ae),a&&g(ee),a&&g(oe),a&&g(se),a&&g(ne),a&&g(te),a&&g(le),a&&g(ce),a&&g(pe),a&&g(de),a&&g(me),a&&g(ve),a&&g(fe),a&&g(Ee),a&&g(Ne),a&&g(je),a&&g(Ke),a&&g(Je),a&&g(Ve),a&&g(Ze),a&&g(ao),a&&g(eo),a&&g(co),a&&g(po),a&&g(uo),a&&g(mo),a&&g(ho),a&&g(fo),a&&g(bo),a&&g(go),a&&g(Ao),a&&g(ko),a&&g(So),a&&g(Po)}}}function D(a){let e,o;const u=[a[0],L];let m={$$slots:{default:[q]},$$scope:{ctx:a}};for(let r=0;r<u.length;r+=1)m=s(m,u[r]);return e=new R({props:m}),{c(){r(e.$$.fragment)},l(a){n(e.$$.fragment,a)},m(a,s){t(e,a,s),o=!0},p(a,[o]){const s=1&o?i(u,[1&o&&l(a[0]),0&o&&l(L)]):{};2&o&&(s.$$scope={dirty:o,ctx:a}),e.$set(s)},i(a){o||(c(e.$$.fragment,a),o=!0)},o(a){p(e.$$.fragment,a),o=!1},d(a){d(e,a)}}}const L={date:"2020-10-06T14:07:42.000Z",banner:"https://res.cloudinary.com/matiasfha/image/upload/v1601993304/oskar-yildiz-gy08FXeM2L4-unsplash_v6ccmb.jpg",keywords:["React Native"," Android"," IOS"," IOS Simulator"," Android Studio"],tag:"Seed",title:"Comenzando con React Native",description:"React Native es un framework que te permite utilizar Javascript y React para desarrollar tu aplicación nativa. Para iniciar debes configurar algunas cosas primero.",bannerCredit:'<span>Photo by <a href="https://unsplash.com/@oskaryil?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Oskar Yildiz</a> on <a href="https://unsplash.com/s/photos/react-native?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'};function O(a,e,o){return a.$$set=a=>{o(0,e=s(s({},e),u(a)))},[e=u(e)]}class I extends a{constructor(a){super(),e(this,a,O,D,o,{})}}export{I as default,L as metadata};
