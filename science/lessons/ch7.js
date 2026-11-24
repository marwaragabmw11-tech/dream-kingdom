/* Chapter 7: The Force of Rubber (book pages 84–91) */
(function(){
const {U,tag,sun,cloud,tufts,desert,pyramids}=ART;
const {dewy,title,chalk,notebook,ending,sum,arrow,panel,txt,room}=H;
const L=[];
const floor=()=>`${room('#e9f0fa')}<rect x="0" y="400" width="800" height="24" fill="#ffd166"/>${[...Array(17)].map((_,i)=>`<path d="M${i*50} 400v${i%2?8:14}" stroke="#7a5a10" stroke-width="2"/>`).join('')}`;
const pad=(stretch=0,n=1)=>`<rect x="20" y="330" width="120" height="60" rx="6" fill="#7fb6d6" opacity=".8"/><rect x="44" y="300" width="10" height="60" fill="#5b6b7c"/>${[...Array(n)].map((_,i)=>`<path d="M49 ${316+i*5}L${150-stretch} ${336+i*3}" stroke="${['#e07a2f','#d64545','#a875ff'][i]}" stroke-width="4"/>`).join('')}`;
const rlab=(id='rc')=>`${floor()}<g id="padG">${pad(0,1)}</g><g id="${id}" style="transform:translateX(0)"><g transform="translate(140 300)">${U('rcar',0,0,180,80)}</g></g><g id="rmark"></g>`;
const runCar=(K,id,dist,label)=>{const c=K.$('#'+id);if(!c)return;c.style.transition='none';c.style.transform='translateX(0)';void c.getBoundingClientRect();setTimeout(()=>{c.style.transition='transform 1.8s cubic-bezier(.15,.8,.3,1)';c.style.transform=`translateX(${dist}px)`},350);setTimeout(()=>{const m=K.$('#rmark');if(m)m.innerHTML=`<path d="M${320+dist} 330V400" stroke="#e63973" stroke-width="4"/>`+ART.tag(320+dist,318,label,120,'#e63973','#fff',16)},2100)};

/* ---------- 7-1 ---------- */
L.push({id:'7-1',title:'Rubber Band-Powered Cars',ar:'سيارات تعمل بالأستيك',pages:'84–85, 88',scenes:[
{t:'Start',svg:()=>`${rlab()}${title('Rubber Band Cars','',470,420,40)}`,
L:[["How does the distance a car travels change when you change how long you stretch the rubber band?","المسافة بتتغير إزاي لما نغير قد إيه بنشد الأستيك؟"],["I feel like if I stretch the rubber band a lot, the power will be stronger!","حاسة إن لو شديت الأستيك كتير، القوة هتبقى أقوى!"]]},
{t:'Snap back',svg:()=>`<rect width="800" height="450" fill="#fbf7ee"/><circle cx="200" cy="225" r="14" fill="#5b6b7c"/><circle cx="600" cy="225" r="14" fill="#5b6b7c"/><g class="snap" style="transform-origin:400px 225px"><path d="M200 225Q400 425 600 225" stroke="#e07a2f" stroke-width="8" fill="none"/></g>
<g data-r="1">${tag(400,60,'it tries to return to its original shape',440,'#e63973','#fff',19)}</g><g data-r="2"><g transform="translate(560 320)">${U('rcar',0,0,180,80)}</g>${tag(200,350,'power to make things move',300,'#1d3557','#fff',18)}</g><g data-r="3">${tag(400,420,'longer stretch → bigger power',350,'#3f9a3a','#fff',19)}</g>`,
L:[["A rubber band has a nature: it tries to return to its original shape when it is stretched.","الأستيك من طبيعته إنه بيحاول يرجع لشكله الأصلي لما يتشد."],["You can use the power of a stretched rubber band to make things fly, or make cars run!","ممكن نستخدم قوة الأستيك المشدود علشان نخلي الحاجات تطير أو العربيات تجري!"],["The longer you stretch the rubber band, the stronger the power to return, and the bigger the power to move things.","وكل ما تشدي الأستيك أكتر، قوة الرجوع بتبقى أقوى، وقوة تحريك الأشياء أكبر."]]},
{t:'Stretch lab',stars:3,svg:()=>rlab('rc'),
L:[["Stretch the rubber band by 5 centimeters, let go, and measure the distance.","شدي الأستيك ٥ سم، وسيبيه، وقيسي المسافة."],["Then stretch it to 10 and 15 centimeters, and see how the distance changes.","وبعدين شديه ١٠ و١٥ سم، وشوفي المسافة بتتغير إزاي."]],
act:(el,K)=>{el.innerHTML=`<h2>Stretch lab <span class="tag">Warm Up</span></h2><div class="lab">${[5,10,15].map(c=>`<button class="btn ${c===15?'':'blue'}" type="button" data-c="${c}">Stretch ${c} cm</button>`).join('')}</div><table class="tbl"><tr><th>Stretch</th><th>Distance</th></tr>${[5,10,15].map(c=>`<tr><td>${c} cm</td><td id="d${c}"></td></tr>`).join('')}</table>`;
el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const c=+b.dataset.c;K.$('#padG').innerHTML=pad(c*3,1);setTimeout(()=>{const p=K.$('#padG');if(p)p.innerHTML=pad(0,1)},350);const dist=c*26+Math.round(Math.random()*16-8);runCar(K,'rc',dist,`${Math.round(dist/2)} cm`);setTimeout(()=>{const t=K.$('#d'+c);if(t)t.textContent=Math.round(dist/2)+' cm'},2100);K.star('s'+c)})}},
{t:'Make it',svg:()=>`<rect width="800" height="450" fill="#cf9f6c"/>${[0,1,2].map(i=>panel(20+i*260,30,240,380,'#fff')).join('')}
<g data-r="1"><g transform="translate(40 150)">${ART.U('car',0,40,170,80)}</g><path d="M124 120l20-40M124 80l20 40" stroke="#d64545" stroke-width="6"/>${txt(140,350,'1 take off the sail',18)}</g>
<g data-r="2"><g transform="translate(300 170)">${U('rcar',0,0,200,90)}</g><circle cx="320" cy="260" r="8" fill="none" stroke="#5b6b7c" stroke-width="4"/>${txt(400,350,'2 tape a hook under the car',18)}</g>
<g data-r="3"><g transform="translate(560 -120)">${pad(0,1)}</g>${txt(660,350,'3 launch pad: start at 0 cm',18)}</g>`,
L:[["How to make a rubber band car: take off the sail from the wind-powered car.","إزاي نعمل عربية بالأستيك: شيلي الشراع من عربية الريح."],["Attach a hook to the bottom of the car, and tape it tightly so it doesn't come off.","ركّبي خطاف تحت العربية، ولزقيه كويس علشان ميقعش."],["Make a launching pad with a plastic board. Hook the rubber band, and mark where it starts to stretch as zero centimeters.","اعملي منصة إطلاق من لوح بلاستيك. اربطي الأستيك في الخطاف، وعلّمي مكان بداية الشد على إنه صفر سم."]]},
{t:'Quiz',stars:3,svg:()=>chalk('Try 1 — page 88'),L:[["Quiz time!","وقت الأسئلة!"]],
act:(el,K)=>K.quiz(el,'q',[
{type:'blanks',src:'Try 1 (1)',q:'Fill in the blanks about rubber band-powered cars.',ar:'كمّلي الفراغات.',bank:['weaker','stronger','shorter','longer'],items:[['The longer you stretch the rubber band, the','stronger','the power to move the car becomes,'],['and the distance the car travels becomes','longer','.']]},
{type:'mcq',src:'Try 1 (2)',q:'When does a rubber band produce power?',ar:'الأستيك بيدّي قوة إمتى؟',o:['A: When the rubber band is loose and relaxed.','B: When the rubber band is stretched and trying to return to its original shape.'],a:[1],why:'When it is stretched.'}])},
{t:'The end',svg:()=>ending(rlab('rx'),'longer stretch = farther'),L:[["Great job! The longer the stretch, the farther the car goes.","برافو! كل ما الشد يزيد، العربية تروح أبعد."]],
act:el=>sum(el,['A stretched rubber band tries to <b>return to its original shape</b>.','This power can make things fly or cars run.','<b>Longer stretch</b> → stronger power → the car travels <b>farther</b>.'])}
]});

/* ---------- 7-2 ---------- */
L.push({id:'7-2',title:'Power of Rubber Bands',ar:'قوة الأستيك',pages:'86–89',scenes:[
{t:'Start',svg:()=>`${floor()}<g transform="translate(0 0)">${pad(30,3)}</g><g transform="translate(140 300)">${U('rcar',0,0,180,80)}</g>${title('Power of Rubber Bands','',470,440,40)}`,
L:[["How can I make the power of the rubber band stronger?","إزاي أخلي قوة الأستيك أقوى؟"],["Is there any other way, besides stretching it longer? What if we use 2 or 3 rubber bands?","فيه طريقة تانية غير الشد أكتر؟ طب لو استخدمنا ٢ أو ٣ أساتيك؟"]]},
{t:'More bands',svg:()=>`<rect width="800" height="450" fill="#fbf7ee"/>${panel(20,60,370,320,'#fff')}${panel(410,60,370,320,'#fff')}
<g data-r="2"><g transform="translate(40 -100)">${pad(30,1)}</g>${H.arrow(200,330,280,330,'#1d6fa5',6)}${txt(205,110,'1 band',24)}</g>
<g data-r="3"><g transform="translate(430 -100)">${pad(30,2)}</g>${H.arrow(590,330,760,330,'#e63973',10)}${txt(595,110,'2 bands',24)}</g>
<g data-r="1">${tag(400,30,'Same stretch: 10 cm',260,'#1d3557','#fff')}</g><g data-r="3">${tag(400,420,'the powers combine: stronger!',360,'#e63973','#fff',19)}</g>`,
L:[["The longer you stretch the rubber band, the stronger the power to move things becomes.","كل ما تشدي الأستيك أكتر، قوة تحريك الأشياء بتزيد."],["Now let's keep the stretch the same, 10 centimeters, and change the number of rubber bands.","يلا نخلي الشد ثابت ١٠ سم، ونغير عدد الأساتيك."],["When you increase the number of rubber bands, the power of each band combines, and the power to move the car becomes even stronger!","لما تزودي عدد الأساتيك، قوة كل واحد بتتجمع، وقوة تحريك العربية بتبقى أقوى كمان!"]]},
{t:'Band lab',stars:3,svg:()=>rlab('rb'),
L:[["Run the car with one, two, and three rubber bands, all stretched by the same 10 centimeters. Record and discuss!","شغلي العربية بأستيك واحد، واتنين، وتلاتة، وكلهم مشدودين نفس الـ ١٠ سم. سجلي وناقشي!"]],
act:(el,K)=>{el.innerHTML=`<h2>Number of rubber bands <span class="tag">Warm Up</span></h2><div class="lab">${[1,2,3].map(n=>`<button class="btn ${n===3?'':'blue'}" type="button" data-n="${n}">${n} band${n>1?'s':''}</button>`).join('')}</div><table class="tbl"><tr><th>Bands</th><th>Distance</th></tr>${[1,2,3].map(n=>`<tr><td>${n}</td><td id="n${n}"></td></tr>`).join('')}</table>`;
el.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{const n=+b.dataset.n;K.$('#padG').innerHTML=pad(30,n);setTimeout(()=>{const p=K.$('#padG');if(p)p.innerHTML=pad(0,n)},350);const dist=110+n*110+Math.round(Math.random()*16-8);runCar(K,'rb',dist,`${Math.round(dist/2)} cm`);setTimeout(()=>{const t=K.$('#n'+n);if(t)t.textContent=Math.round(dist/2)+' cm'},2100);K.star('b'+n)})}},
{t:'Quiz',stars:6,svg:()=>chalk('Try 2 and Exercise — pages 88–89'),L:[["Quiz time!","وقت الأسئلة!"]],
act:(el,K)=>K.quiz(el,'q',[
{type:'mcq',src:'Try 2 (1)',q:'We increased the number of rubber bands. What happens to the distance the car travels?',ar:'زودنا عدد الأساتيك. المسافة بيحصلها إيه؟',o:['It travels a shorter distance.','It travels a longer (farther) distance.','It does not move at all.'],a:[1],why:'More bands → more power → farther.'},
{type:'mcq',src:'Try 2 (2)',q:'We want to make the power stronger to move a car carrying a heavy load. Choose all correct answers.',ar:'عايزين قوة أكبر لعربية شايلة حاجة تقيلة. اختاري كل الإجابات الصح.',o:['A: Decrease the number of rubber bands.','B: Increase the number of rubber bands.','C: Stretch the rubber bands longer.','D: Stretch the rubber bands shorter.'],a:[1,2],multi:1,why:'B and C.'},
{type:'mcq',src:'Exercise 1 (1)',q:'Choose all correct answers about the power of rubber bands.',ar:'اختاري كل الإجابات الصح.',o:['A: No matter how long you stretch the rubber band, the distance the car travels is always the same.','B: The longer you stretch the rubber band, the faster the car starts running.','C: When the rubber band returns to its original shape, the power to move the car is gone.'],a:[1,2],multi:1,why:'B and C.'},
{type:'blanks',src:'Exercise 1 (2)',q:'Choose the correct word.',ar:'اختاري الكلمة الصح.',bank:['stronger','weaker'],items:[['From the results, we learned that making the power of the wind or rubber bands','stronger','allows us to move the car farther.']]},
{type:'mcq',src:'Exercise 2 (1)',q:'How can you make a rubber band-powered car run farther? Choose all correct answers.',ar:'إزاي العربية تجري أبعد؟',o:['A: Stretch the rubber band longer than usual.','B: Stretch the rubber band shorter than usual.','C: Increase the number of rubber bands.'],a:[0,2],multi:1,why:'A and C.'},
{type:'mcq',src:'Exercise 2 (2)',q:'When stretched to the same length of 15 cm, which has the WEAKEST power?',ar:'بنفس الشد ١٥ سم، أنهي أضعف؟',o:['A: 1 rubber band','B: 2 rubber bands','C: 3 rubber bands'],a:[0],why:'One band is the weakest.'}])},
{t:'The end',svg:()=>ending(rlab('ry'),'more bands = more power'),L:[["Great job! Stretch longer, or add more bands, for more power!","برافو! شدي أكتر أو زودي الأساتيك علشان قوة أكبر!"]],
act:el=>sum(el,['<b>Longer stretch</b> → stronger power.','<b>More rubber bands</b> → their powers combine → even stronger.','Stronger power → the car travels <b>farther</b>.'])}
]});

/* ---------- 7-E ---------- */
L.push({id:'7-E',title:'Enrichment: Wind on the Nile, Power in Rubber',ar:'ركن الإثراء: رياح النيل وقوة المطاط',pages:'90–91',scenes:[
{t:'Felucca',svg:()=>`<rect width="800" height="300" fill="url(#gSkySet)"/>${sun(620,250,.9)}<rect y="290" width="800" height="160" fill="url(#gRiver)"/>${ART.waves(0,330,'#ffd9a8',24)}${ART.U('palm',20,150,90,160)}${ART.U('palm',700,140,90,170)}<g class="sway">${U('felucca',120,110,220,220)}</g><g class="sway" style="animation-delay:-1.5s">${U('felucca',420,150,170,170)}</g>
<g data-r="2">${tag(400,40,'100% wind power!',240,'#fff','#c2561f')}</g><g data-r="3">${tag(400,90,'turn the sail to steer the push',340,'#1d3557','#fff',18)}</g>`,
L:[["In Egypt, people have used the power of the wind since ancient times.","في مصر، الناس استخدمت قوة الريح من زمان قوي."],["The felucca, the traditional sailboat on the Nile River, uses one hundred percent of the wind's power.","الفلوكة، المركب الشراعي التقليدي في النيل، بتستخدم قوة الريح مية في المية."],["By changing the direction of the sail, they adjust which way the wind pushes, so the boat goes exactly where they want. The moving power of air becomes the moving power of the boat!","بتغيير اتجاه الشراع، بيظبطوا الريح تزق في أنهي اتجاه، فالمركب تروح المكان اللي عايزينه بالظبط. قوة حركة الهوا بتتحول لقوة حركة المركب!"]]},
{t:'Snap back',svg:()=>`${desert(0,800)}${pyramids(420,330,1)}<g transform="translate(120 120)">${U('bow',0,0,200,230)}</g><g data-r="2"><g class="arrowfly">${H.arrow(330,235,420,235,'#7a4a22',5)}</g></g>
<g data-r="1">${tag(560,120,'the harder you pull, the more power is stored',500,'#1d3557','#fff',17)}</g><g data-r="2">${tag(560,300,'ancient Egyptian bow and arrow',360,'#c2561f','#fff',18)}</g>`,
L:[["The power to snap back: the harder you pull a rubber band, the more power you can store inside it.","قوة الرجوع: كل ما تشدي الأستيك أكتر، بتخزني جواه قوة أكبر."],["The ancient Egyptian bow and arrow was also a tool that used this power to snap back, as much as possible!","والقوس والسهم بتوع المصريين القدماء كانوا أداة بتستخدم قوة الرجوع دي لأقصى حد!"]]},
{t:'Zafarana',svg:()=>`<rect width="800" height="260" fill="url(#gSkyDay)"/>${cloud(200,60,.7)}<rect y="250" width="800" height="40" fill="url(#gRiver)"/><rect y="286" width="800" height="164" fill="url(#gSand)"/>${[[60,120,.7],[200,100,.8],[340,130,.65],[480,96,.85],[620,124,.7],[730,140,.6]].map((t,i)=>`<g transform="translate(${t[0]} ${t[1]}) scale(${t[2]})">${U('turbine',0,0,120,260)}</g>`).join('')}
<g data-r="2">${tag(400,40,'Zafarana: wind → electricity!',340,'#1d6fa5','#fff')}</g><g data-r="1">${tag(400,420,'Red Sea coast, Egypt',240,'#fff','#1d3557')}</g>`,
L:[["Along the coast of the Red Sea in Egypt, there are many giant wind turbines lined up. It is one of the largest wind farms in the world.","على ساحل البحر الأحمر في مصر، فيه توربينات رياح عملاقة كتير جنب بعض، ودي من أكبر مزارع الرياح في العالم."],["At the Zafarana wind power plant, the same wind that moved boats on the Nile is now turned into electricity!","في محطة رياح الزعفرانة، نفس الريح اللي كانت بتحرك المراكب في النيل بقت بتتحول لكهربا!"]]},
{t:'Quick check',stars:2,svg:()=>chalk('Enrichment corner — pages 90–91'),L:[["Two quick questions!","سؤالين سريعين!"]],
act:(el,K)=>K.quiz(el,'q',[
{type:'mcq',src:'Enrichment',q:'What moves the felucca on the Nile?',ar:'إيه اللي بيحرك الفلوكة في النيل؟',o:['An engine','The power of the wind','Rubber bands'],a:[1],why:'It uses 100% wind power.'},
{type:'mcq',src:'Enrichment',q:'What does the Zafarana wind power plant make from the wind?',ar:'محطة الزعفرانة بتعمل إيه من الريح؟',o:['Electricity','Water','Sand'],a:[0],why:'It turns wind into electricity.'}])},
{t:'The end',svg:()=>ending(`<rect width="800" height="450" fill="url(#gSkyDay)"/>`+`<g transform="translate(600 140) scale(.8)">${U('turbine',0,0,120,260)}</g>`,'wind and rubber: stored power'),L:[["Great job! Egyptians used wind and stored power, from the felucca to the wind farms!","برافو! المصريين استخدموا الريح والقوة المخزنة، من الفلوكة لمزارع الرياح!"]],
act:el=>sum(el,['The <b>felucca</b> uses wind power; turning the sail steers the push.','A stretched band or <b>bow</b> stores power to snap back.','<b>Zafarana</b> wind farm turns wind into <b>electricity</b>.'])}
]});

(window.CHAPTERS=window.CHAPTERS||[]).push({n:7,title:'The Force of Rubber',ar:'قوة المطاط',color:'#3a7bd5',lessons:L});
})();
