/* Chapter 1 lessons: scenes, narration (English + Arabic) and activities. Content from Science Primary 4, Term 1, pages 6–25. */
(function(){
const {U,tag,sun,moon,cloud,stars,sandDots,tufts,desert,split,fullNile,garden,night,pyramids}=ART;
const {dewy,title,board,pol,chalk,notebook,ending,sum,leaf}=H;
const L=[];

/* ---------------- 1-1 ---------------- */
L.push({id:'1-1',title:"Let's Find Living Organisms",ar:'هيا نبحث عن الكائنات الحية',pages:'6–7, 10–11',scenes:[
{t:'Start',svg:()=>`${garden()}${U('tree',590,50,180,222)}${U('dove',640,98,80,60)}${U('sunflower',40,170,60,130)}${U('flowers',100,250,96,106)}<g class="fly">${U('butterfly',300,70,70,58,'#ffd23f')}</g>${U('dog',560,280,110,110)}<g class="hop">${U('frog',300,360,90,77)}</g>${U('grasshopper',100,380,120,61)}${U('ant',460,410,56,31)}
${title("Let's Find",'Living Organisms',430,500,110)}${dewy(20,40,1.3)}`,
L:[["Hello again! I'm Dewy. Today we are going on a hunt for living organisms!","أهلاً تاني! أنا ديوي. النهارده هنعمل رحلة بحث عن الكائنات الحية!"],
["Animals and plants are both living organisms.","الحيوانات والنباتات الاتنين كائنات حية."]]},

{t:'Living or not?',svg:()=>`<rect width="800" height="450" fill="#f4fbef"/><rect x="520" width="280" height="450" fill="#eef2f6"/><path d="M520 0V450" stroke="#cfd8e3" stroke-width="4" stroke-dasharray="10 10"/>
<g data-r="1">${tag(260,40,'Living organisms',250,'#3f9a3a','#fff')}${U('tree',14,90,150,190)}<g class="growup">${U('sunflower',176,150,60,130)}</g>${U('dog',250,170,110,110)}<g class="breathe">${U('frog',380,200,110,94)}</g>${U('grasshopper',30,320,130,66)}<g class="fly">${U('butterfly',190,320,90,76,'#ffd23f')}</g>${U('bee',360,330,80,64)}</g>
<g data-r="2">${tag(260,424,'They eat, breathe and grow',350,'#1d3557','#fff',20)}</g>
<g data-r="3">${tag(660,40,'Non-living things',240,'#5b6b7c','#fff')}${U('stone',590,100,140,82)}${U('water',600,200,120,93)}${U('air',586,310,150,90)}</g>
<g data-r="4">${tag(660,424,'They do not eat, breathe or grow',270,'#5b6b7c','#fff',15)}</g>`,
L:[["Living organisms, like humans, animals and plants, are different from non-living things.","الكائنات الحية زي الإنسان والحيوانات والنباتات مختلفة عن الأشياء غير الحية."],
["Living organisms eat, breathe and grow.","الكائنات الحية بتاكل وبتتنفس وبتكبر."],
["Rocks, water and air are non-living things.","الصخور والمية والهوا أشياء غير حية."],
["They do not eat, breathe or grow.","دي مش بتاكل ولا بتتنفس ولا بتكبر."]]},

{t:'Sort it',stars:8,svg:()=>`<rect width="800" height="450" fill="#fbf5e8"/><rect x="20" y="70" width="370" height="364" rx="26" fill="#e6f6dd" stroke="#3f9a3a" stroke-width="4" stroke-dasharray="14 10"/><rect x="410" y="70" width="370" height="364" rx="26" fill="#e9eef3" stroke="#5b6b7c" stroke-width="4" stroke-dasharray="14 10"/>
${tag(205,40,'Living',170,'#3f9a3a','#fff')}${tag(595,40,'Non-living',200,'#5b6b7c','#fff')}<g id="bin-L"></g><g id="bin-N"></g>`,
L:[["Your turn! Is it a living organism or a non-living thing?","دورك! ده كائن حي ولا شيء غير حي؟"],["Tap the right button for each one.","دوسي على الزرار الصح لكل واحد."]],
act:(el,K)=>K.bins(el,{title:'Living or non-living?',ar:'كائن حي ولا شيء غير حي؟',key:'sort',bins:[{k:'L',label:'Living',x:40,y:96,cols:2},{k:'N',label:'Non-living',x:430,y:96,cols:2}],
items:[{n:'Ant',id:'ant',k:'L'},{n:'Rock',id:'rockS',k:'N'},{n:'Cactus',id:'cactus',k:'L'},{n:'Water',id:'water',k:'N'},{n:'Dove',id:'dove',k:'L'},{n:'Air',id:'air',k:'N'},{n:'Lotus',id:'lotus',k:'L'},{n:'Stone',id:'stone',k:'N'}],
hint:it=>`Ask: does a ${it.n.toLowerCase()} eat, breathe and grow?`})},

{t:'Grass & trees',svg:()=>`${garden()}${U('tree',500,20,260,322)}<g class="peck">${U('dove',600,120,90,68)}</g>${U('flowers',380,270,100,110)}<g class="fly">${U('bee',420,210,60,48)}</g>
${U('grasshopper',120,352,150,76)}${[...Array(9)].map((_,i)=>U('grass',i*42-10,370+(i%3)*14,80,40)).join('')}${U('grass',150,392,90,45)}
<g data-r="1">${tag(400,40,'Near grass or trees',300)}</g>
<g data-r="2">${tag(640,96,'food',110,'#e63973','#fff')}</g>
<g data-r="3"><ellipse class="ring" cx="196" cy="392" rx="100" ry="46" fill="none" stroke="#e63973" stroke-width="5" stroke-dasharray="14 10"/>${tag(196,318,'easy to hide',190,'#e63973','#fff')}</g>`,
L:[["Many living organisms live in places around us, like a school yard.","كائنات حية كتير عايشة في أماكن حوالينا، زي حوش المدرسة."],
["Near grass or trees, there is food to eat.","جنب الحشيش والشجر فيه أكل."],
["And there are places that are easy to hide. Can you see the grasshopper?","وفيه أماكن سهل الاستخباء فيها. شايفة الجرادة؟"]]},

{t:'Under stones',svg:()=>`<rect width="800" height="230" fill="url(#gSkyDay)"/>${sun(100,70,.8)}<g stroke="#ffd84a" stroke-width="4" opacity=".55" stroke-linecap="round"><path d="M150 120L300 230M170 100L470 230M160 130L210 230"/></g>
<rect y="226" width="800" height="224" fill="url(#gSoilD)"/><rect y="222" width="800" height="12" fill="url(#gGrass)"/>${tufts([[0,200,60],[330,204,50],[760,204,44]])}
<ellipse cx="210" cy="330" rx="120" ry="44" fill="url(#gSoilM)"/>${[0,1,2,3,4].map(i=>U('drop',130+i*36,312+(i%2)*18,12,17)).join('')}${U('ant',150,320,56,31)}${U('ant',230,340,50,28)}${U('beetle',240,296,60,48)}
<g class="lift" data-a="2">${U('stone',80,250,260,152)}</g>
<path d="M500 340L760 330L800 420H470Z" fill="#000" opacity=".22"/>${U('rockS',430,190,260,162)}${U('lizard',640,350,130,49,'#b08a5a')}${U('scorpion',520,372,110,71)}
<g data-r="1">${tag(450,40,'Under stones and in the shade of rocks',500)}</g>
<g data-r="2">${tag(210,420,'damp = a little wet',230,'#e63973','#fff',20)}</g>
<g data-r="3">${tag(640,300,'cool shade',170,'#1d6fa5','#fff')}</g>`,
L:[["Now let's look under stones and in the shade of rocks.","يلا نبص تحت الحجارة وفي ضل الصخور."],
["Under a stone, the soil is damp. Damp means a little wet. Ants and beetles like it here.","تحت الحجر التربة رطبة، يعني مبلولة شوية. النمل والخنافس بيحبوا المكان ده."],
["In the shade of a rock it is cool, away from the sun's rays.","وفي ضل الصخرة الجو بارد، بعيد عن أشعة الشمس."]]},

{t:'Deserts',svg:()=>`${desert(0,800)}<rect y="330" width="800" height="120" fill="#b9783a"/><path d="M0 330H800" stroke="#8a5a2a" stroke-width="3"/>${sandDots(0,340,800,110,40,5)}
<path d="M470 330Q480 360 520 372Q560 384 580 400" stroke="#6b4423" stroke-width="22" fill="none" stroke-linecap="round"/><ellipse cx="612" cy="404" rx="64" ry="30" fill="#6b4423"/>
<path d="M120 318L0 330V318Z" fill="#000" opacity=".1"/><path d="M150 322H10L40 290Z" fill="#000" opacity=".18"/>${U('rockS',110,190,240,150)}
<g data-r="2">${U('lizard',20,292,120,45,'#c99a5a')}${tag(200,170,'shade of rocks',200,'#1d6fa5','#fff')}</g>
<g data-r="3">${U('jerboa',572,374,80,61)}${tag(620,300,'under the ground',230,'#1d6fa5','#fff')}</g>
<g data-r="1">${tag(400,40,'Even in hot, dry deserts!',340)}</g>
<g data-r="4">${tag(400,110,'Living organisms live where they match the place',600,'#1d3557','#fff',20)}</g>`,
L:[["Even in hot and dry places like deserts, living organisms can live.","حتى في الأماكن الحارة والجافة زي الصحرا، الكائنات الحية تقدر تعيش."],
["They stay in the shade of rocks...","بيقعدوا في ضل الصخور..."],
["...or under the ground, where it is cooler.","...أو تحت الأرض، لأنها أبرد."],
["Living organisms live in places that match the environment.","الكائنات الحية بتعيش في أماكن مناسبة للبيئة."]]},

{t:'Explorer',stars:5,svg:()=>`${board()}${pol(40,30,'beetle','Dung beetle','#f3dcb0',-4,'#e63973','',1)}${pol(310,24,'scorpion','Scorpion','#f6e2b8',3,'#3f9a3a','',1)}${pol(580,30,'lizard','Lizard','#e8e2d6',-2,'#1d6fa5','#b08a5a',1)}${pol(170,238,'dove','Dove','#dff1fb',2,'#f2a900','',1)}${pol(450,236,'spider','Spider','#efe6da',-3,'#a875ff','',1)}
<g data-r="2">${tag(400,438,'Guess  →  Search  →  Note the place',430,'#1d3557','#fff',20)}</g>`,
L:[["Be an explorer! Look at these living organisms. Where might they be found?","خليكي مستكشفة! بصي على الكائنات دي. ممكن نلاقيها فين؟"],
["First guess. Then search outside, and watch it quietly and carefully.","الأول خمّني، بعدين دوّري برّه، واتفرجي عليها بهدوء وبانتباه."],
["Write down its name, and also what kind of place you found it in.","اكتبي اسمها، واكتبي كمان نوع المكان اللي لقيتيها فيه."]],
act:(el,K)=>K.guess(el,{key:'guess',items:[
{n:'Dung beetle',id:'beetle',opts:[['On sandy ground',1],['Deep in the Nile water',0],['In farmland soil',1]],fact:'Dung beetles live in deserts, grasslands and farmlands.'},
{n:'Scorpion',id:'scorpion',opts:[['In gaps in rocks',1],['On a floating lotus',0],['Under stones',1]],fact:'Scorpions like cool, hidden places away from the sun.'},
{n:'Lizard',id:'lizard',c:'#b08a5a',opts:[['On sunny rocks',1],['In the shade of rocks',1],['Inside a fish tank',0]],fact:'Lizards are sometimes seen on sunny rocks.'},
{n:'Dove',id:'dove',opts:[['In a tree',1],['Under a stone',0],['On a roof',1]],fact:'Near trees, birds find food and places to hide.'},
{n:'Spider',id:'spider',opts:[['In the middle of hot sand at noon',0],['In gaps in rocks',1],['Near the roots of a big tree',1]],fact:'Many spiders hide in gaps and corners.'}]})},

{t:'Quiz',stars:7,svg:()=>chalk('Try (1) and Exercise (1) — pages 10–11'),L:[["Quiz time! Read each question carefully.","وقت الأسئلة! اقري كل سؤال كويس."]],
act:(el,K)=>K.quiz(el,'q',[
{type:'blanks',src:'Try 1 (1)',q:'Where do these living organisms often live? Choose the correct words.',ar:'الكائنات دي بتعيش فين غالباً؟ اختاري الكلمة الصح.',bank:['damp','rocks','grass'],items:[['Grasshoppers are often in the','grass','.'],['Ants are often in','damp','places like under stones.'],['Lizards are sometimes seen on sunny','rocks','.']]},
{type:'mcq',src:'Exercise 1 (1)',q:'Where is it easy to find living organisms in a hot, dry place like Egypt? Choose all correct answers.',ar:'فين سهل نلاقي كائنات حية في مكان حار وجاف زي مصر؟ اختاري كل الإجابات الصحيحة.',o:['A: In the middle of the hot sand, under the sun rays.','B: In cold places in the shadow of rocks or big stones.','C: At the roots, where a little bit of grass grows.'],a:[1,2],multi:1,why:'Living organisms like cool, shady places with a little water: B and C.'},
{type:'blanks',src:'Exercise 1 (2)',q:'Where are living organisms found? Fill in the blanks.',ar:'الكائنات الحية بتتواجد فين؟ كمّلي الفراغات.',bank:['food','hide','dampness (water)'],items:[['Near grass or trees: places with','food','.'],['Near grass or trees: places easy to','hide','.'],['Under stones or shadows of rocks: places with','dampness (water)','or cool places away from the sun.']]}])},

{t:'On paper',stars:2,svg:()=>notebook('Explorer mission: find one living organism','near your home. Write its name and what','kind of place you found it in.',U('ant',600,300,110,61)),
L:[["Here is a mission for your notebook. Find one living organism near your home.","دي مهمة للكراسة. دوّري على كائن حي جنب البيت."],["Write its name, and what kind of place you found it in.","اكتبي اسمه، ونوع المكان اللي لقيتيه فيه."]],
act:(el,K)=>K.paper(el,{key:'paper',src:'Warm Up ③',q:'Find one living organism near your home. Write its name and what kind of place you found it in.',ar:'دوّري على كائن حي جنب البيت، واكتبي اسمه ونوع المكان اللي لقيتيه فيه.',model:'Example: <b>Ant.</b> I found it under a flower pot, where the soil is damp and cool.',modelAr:'مثال: نملة. لقيتها تحت أصيص الزرع، التربة هناك رطبة وباردة.',checks:['the <b>name</b> of the living organism?','what <b>kind of place</b> it was (damp, cool, near grass, under a stone...)?']})},

{t:'The end',svg:()=>ending(garden()+U('tree',600,40,180,222)+U('flowers',60,250,100,110)+U('dog',560,290,110,110),'You found living organisms!'),
L:[["Great job! Living organisms eat, breathe and grow.","برافو! الكائنات الحية بتاكل وبتتنفس وبتكبر."],["They live in places that fit them: near grass and trees, under stones, and in the shade of rocks.","وبتعيش في أماكن مناسبة ليها: جنب الحشيش والشجر، وتحت الحجارة، وفي ضل الصخور."]],
act:el=>sum(el,['<b>Living organisms</b> eat, breathe and grow. Rocks, water and air do not.','<b>Near grass or trees:</b> food and places to hide.','<b>Under stones / shade of rocks:</b> damp and cool, away from the sun.','<b>Deserts:</b> in the shade of rocks or under the ground.'])}
]});

/* ---------------- 1-2 ---------------- */
L.push({id:'1-2',title:'How to Observe?',ar:'كيف نلاحظ؟',pages:'8–11',scenes:[
{t:'Start',svg:()=>`${garden()}${U('flowers',520,240,130,143)}${U('tree',620,40,170,210)}<g class="fly">${U('butterfly',470,150,64,54,'#ff9f43')}</g>${U('beetle',420,380,70,56)}
${title('How to Observe?','',330,440,40)}<g class="bob">${U('dewy',110,190,150,200)}${U('lens',220,230,130,130)}</g>`,
L:[["Scientists look very closely. Let's learn how to observe!","العلماء بيبصوا على الحاجات بتركيز شديد. يلا نتعلم إزاي نلاحظ!"],
["Let's check the shape and body of the living organisms we found, closely.","يلا نبص عن قرب على شكل وجسم الكائنات الحية اللي لقيناها."]]},

{t:'Shape, color, size',svg:()=>`<rect width="800" height="450" fill="#fbf7ee"/><g opacity=".5">${[...Array(21)].map((_,i)=>`<path d="M${i*40} 0V450" stroke="#e7dcc6"/>`).join('')}${[...Array(12)].map((_,i)=>`<path d="M0 ${i*40}H800" stroke="#e7dcc6"/>`).join('')}</g>
${U('grasshopper',20,150,420,213)}
<g data-r="2"><rect x="480" y="34" width="300" height="118" rx="20" fill="#fff" stroke="#e63973" stroke-width="3"/><text x="504" y="80" font-size="30" font-weight="800" fill="#e63973">Shape</text><text x="504" y="120" font-size="20" font-weight="700" fill="#1d3557">long body, long back legs</text></g>
<g data-r="3"><rect x="480" y="166" width="300" height="118" rx="20" fill="#fff" stroke="#3f9a3a" stroke-width="3"/><text x="504" y="212" font-size="30" font-weight="800" fill="#3f9a3a">Color</text>${['#c6ef8a','#7fbf3f','#4b8a2a'].map((c,i)=>`<circle cx="${520+i*40}" cy="246" r="15" fill="${c}" stroke="#2f6b2c"/>`).join('')}<text x="650" y="252" font-size="20" font-weight="700" fill="#1d3557">green</text></g>
<g data-r="4"><rect x="480" y="298" width="300" height="118" rx="20" fill="#fff" stroke="#1d6fa5" stroke-width="3"/><text x="504" y="344" font-size="30" font-weight="800" fill="#1d6fa5">Size</text><rect x="504" y="362" width="250" height="34" rx="4" fill="#ffe08a" stroke="#c99a2e"/>${[...Array(11)].map((_,i)=>`<path d="M${514+i*23} 362v${i%5?12:20}" stroke="#7a5a10" stroke-width="2"/>`).join('')}</g>
<g data-r="1">${tag(230,46,'Look closely!',210,'#1d3557','#fff')}</g>`,
L:[["When you look closely at living organisms, pay attention to three things.","لما تبصي عن قرب على الكائنات الحية، ركّزي على ٣ حاجات."],["Shape.","الشكل."],["Color.","اللون."],["And size.","والحجم."]]},

{t:'Can move it',svg:()=>`<rect width="800" height="450" fill="#eaf6ff"/><path d="M0 380H800V450H0Z" fill="#d9eef9"/><defs><clipPath id="vc"><circle cx="620" cy="225" r="140"/></clipPath></defs>
${U('dewy',20,120,150,200)}${U('lens',150,150,120,120)}
<g class="backforth">${U('beetle',300,190,96,77)}</g><path d="M300 300H420" stroke="#1d6fa5" stroke-width="4" marker-start="url(#arr)" marker-end="url(#arr)"/><path d="M296 300l12-8v16ZM424 300l-12-8v16Z" fill="#1d6fa5"/>
<circle cx="620" cy="225" r="150" fill="#2c3a4a"/><circle cx="620" cy="225" r="140" fill="#fffaf0"/><g clip-path="url(#vc)"><g filter="url(#blurry)">${U('beetle',480,90,280,224)}</g><g data-r="3">${U('beetle',480,90,280,224)}</g></g><path d="M528 150Q556 112 604 100" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".6"/>
${tag(620,40,'What you see',190,'#2c3a4a','#fff')}
<g data-r="2">${tag(210,110,'glass close to your eye',270,'#e63973','#fff',19)}</g>
<g data-r="3">${tag(360,350,'move the object',200,'#1d6fa5','#fff',19)}${tag(620,420,'clear image!',170,'#3f9a3a','#fff')}</g>`,
L:[["How do we use a magnifying glass?","بنستخدم العدسة المكبرة إزاي؟"],
["If you CAN move the object, hold the glass close to your eye.","لو تقدري تحركي الشيء، امسكي العدسة قريب من عينك."],
["Then move the object back and forth until you get a clear image.","وبعدين حركي الشيء لقدّام ولورا لحد ما الصورة تبقى واضحة."]]},

{t:"Can't move it",svg:()=>`<rect width="800" height="450" fill="url(#gSkyDay)"/>${cloud(420,60,.7)}<path d="M0 340Q400 320 800 344V450H0Z" fill="url(#gGrass)"/>${U('tree',540,30,240,300)}
<g class="backforth2">${U('dewy',40,170,130,173)}${U('lens',150,190,110,110)}</g>
<defs><clipPath id="vc2"><circle cx="400" cy="150" r="96"/></clipPath></defs><circle cx="400" cy="150" r="104" fill="#2c3a4a"/><circle cx="400" cy="150" r="96" fill="#effbe6"/><g clip-path="url(#vc2)">${leaf(400,150,1.3,true)}<g data-r="2">${leaf(400,150,1.3,false)}</g></g>
<g data-r="1">${tag(660,40,'a big tree cannot move',290,'#3f9a3a','#fff',19)}</g>
<g data-r="2">${tag(190,410,'move your face with the glass',340,'#e63973','#fff',19)}</g>`,
L:[["If you CANNOT move the object, like a big tree...","لو مش تقدري تحركي الشيء، زي شجرة كبيرة..."],
["...hold the glass close to your eye, and move your face with the glass back and forth until you get a clear image.","...امسكي العدسة قريب من عينك، وحركي وشّك مع العدسة لقدّام ولورا لحد ما الصورة تبقى واضحة."]]},

{t:'Stay safe',svg:()=>`<rect width="400" height="450" fill="#fff1dc"/><rect x="400" width="400" height="450" fill="#e9f5ff"/>${sun(150,170,1.1)}${U('lens',190,180,150,150)}
<g data-r="1"><circle cx="200" cy="220" r="150" fill="none" stroke="#d64545" stroke-width="22"/><path d="M95 115L305 325" stroke="#d64545" stroke-width="22" stroke-linecap="round"/>${tag(200,420,'Never look at the sun!',300,'#d64545','#fff')}</g>
${U('glove',520,90,170,204)}<g fill="#8a6a45" opacity=".5"><circle cx="500" cy="330" r="5"/><circle cx="730" cy="320" r="4"/><circle cx="560" cy="340" r="3"/></g>
<g data-r="2">${tag(600,420,'Wear gloves',190,'#1d6fa5','#fff')}</g>`,
L:[["Caution! Never look directly at the sun with a magnifying glass.","تحذير! أوعي تبصي على الشمس بالعدسة المكبرة أبداً."],
["Wear gloves to protect your hands from dirt and germs.","البسي جوانتي علشان تحمي إيديكي من التلوث."]]},

{t:'Record card',svg:()=>`<rect width="800" height="450" fill="#f2ebdc"/><rect x="36" y="22" width="470" height="414" rx="10" fill="#000" opacity=".12"/><rect x="30" y="16" width="470" height="414" rx="10" fill="#fff" stroke="#c9b48a" stroke-width="2"/>
<g data-r="1"><text x="265" y="62" text-anchor="middle" font-size="30" font-weight="800" fill="#1d3557">Topic: Dung beetle</text><path d="M60 76H470" stroke="#c9b48a" stroke-width="2"/></g>
<g data-r="2"><text x="56" y="106" font-size="19" font-weight="700" fill="#5b6676">Date: ________   Name: ____________</text></g>
<g data-r="3"><rect x="50" y="122" width="190" height="186" fill="#fbfaf6" stroke="#c9b48a" stroke-width="2"/><g stroke="#333" stroke-width="2.2" fill="none" stroke-linecap="round"><ellipse class="draw" cx="145" cy="228" rx="46" ry="56"/><ellipse class="draw" cx="145" cy="160" rx="26" ry="16"/><path class="draw" d="M145 176V282M100 210l-30-14M100 236l-34 8M106 262l-22 26M190 210l30-14M190 236l34 8M184 262l22 26"/></g><path d="M74 140v56M68 146l6-6l6 6M68 190l6 6l6-6" stroke="#1d6fa5" stroke-width="2" fill="none"/><text x="60" y="296" font-size="14" fill="#1d6fa5">about 2 cm</text>
<g font-size="18" font-weight="700" fill="#1d3557"><text x="256" y="148">Size: about 2 cm</text><text x="256" y="186">Color: blackish</text><text x="256" y="224">Shape: oval, long</text><text x="256" y="246">back legs</text><text x="256" y="284">Place: on the ground</text><text x="256" y="306">near the Nile River</text></g></g>
<g data-r="5"><path d="M50 330H480" stroke="#c9b48a" stroke-width="2"/><text x="56" y="364" font-size="18" font-weight="700" fill="#e63973">I learned:</text><text x="56" y="392" font-size="17" font-weight="600" fill="#1d3557">It rolled a round ball of dung backward</text><text x="56" y="416" font-size="17" font-weight="600" fill="#1d3557">while standing on its head!</text></g>
<g data-r="4"><rect x="530" y="30" width="240" height="190" rx="16" fill="#fff" stroke="#3f9a3a" stroke-width="3"/><g stroke="#333" stroke-width="2" fill="none"><path d="M650 200V110"/><path d="M650 150q-24-6-30-22q22 0 30 22ZM650 168q22-8 28-22q-22 0-28 22Z"/>${[0,1,2,3,4].map(k=>`<ellipse cx="${650+Math.cos(k*1.257)*16}" cy="${92+Math.sin(k*1.257)*16}" rx="12" ry="8" transform="rotate(${k*72} ${650+Math.cos(k*1.257)*16} ${92+Math.sin(k*1.257)*16})"/>`).join('')}<circle cx="650" cy="92" r="7"/></g>${tag(650,40,'✓ thin, clear lines',220,'#3f9a3a','#fff',18)}
<rect x="530" y="240" width="240" height="190" rx="16" fill="#fff" stroke="#d64545" stroke-width="3"/><g><path d="M650 410V320" stroke="#222" stroke-width="5"/><path d="M650 360q-24-6-30-22q22 0 30 22ZM650 378q22-8 28-22q-22 0-28 22Z" fill="#333"/><circle cx="650" cy="302" r="30" fill="#4a1d2a"/>${[...Array(14)].map((_,i)=>`<path d="M${626+i*4} 280l10 44" stroke="#111" stroke-width="2" opacity=".5"/>`).join('')}</g>${tag(650,250,'✗ shaded',140,'#d64545','#fff',18)}</g>`,
L:[["Let's write a record card. First, write the topic.","يلا نكتب بطاقة تسجيل. الأول اكتبي الموضوع."],
["Next, write the date and your name.","بعدين اكتبي التاريخ واسمك."],
["Then write what you found, with a sketch and sentences. Write about the place, size, shape and color.","بعدين اكتبي اللي لقيتيه برسم وجمل: المكان والحجم والشكل واللون."],
["Draw with thin, clear lines. Don't shade it in!","ارسمي بخطوط رفيعة وواضحة، ومن غير تظليل!"],
["Finally, write what you learned, or what you wondered.","وفي الآخر اكتبي اللي اتعلمتيه أو اللي استغربتيه."]]},

{t:'Quiz',stars:9,svg:()=>chalk('Try and Exercise — pages 10–11'),L:[["Quiz time! Read each question carefully.","وقت الأسئلة! اقري كل سؤال كويس."]],
act:(el,K)=>K.quiz(el,'q',[
{type:'tf',src:'Try 2 (1)',q:'Mark ✓ for correct and ✗ for incorrect: how to use a magnifying glass.',ar:'علّمي ✓ للصح و ✗ للغلط عن استخدام العدسة المكبرة.',items:[['Hold the glass far from the eye and look through it.',0],['When observing a tree, move your own face until you get a clear image.',1],['Look at the sun through the magnifying glass.',0]]},
{type:'mcq',src:'Try 2 (2)',q:'Choose the correct way to sketch for science.',ar:'اختاري الطريقة الصح للرسم العلمي.',o:['A: Add shadows to make it look nice.','B: Draw the shape exactly as you see it, with thin, clear lines.',"C: If you can't see a part well, imagine it and draw it."],a:[1],why:'A science sketch shows exactly what you see, with thin, clear lines.'},
{type:'tf',src:'Exercise 2 (1)',q:'Mark ✓ for correct and ✗ for incorrect.',ar:'علّمي ✓ للصح و ✗ للغلط.',items:[['Held the glass close to the eye and looked at the sun.',0],['To look at a leaf in my hand, I held the glass to my eye and moved the leaf back and forth.',1],["The object couldn't move, so I held the glass far from my eye and stretched my arms out.",0]]},
{type:'mcq',src:'Exercise 2 (2)',q:'What is important to write on a record card besides the sketch? Choose 3 correct answers.',ar:'إيه المهم نكتبه في بطاقة التسجيل غير الرسم؟ اختاري ٣ إجابات.',o:['A: Date','B: Location found','C: Color and shape of the living organism','D: What you ate for dinner yesterday','E: Your favorite colors and shapes'],a:[0,1,2],multi:1,why:'Date, location, and the color and shape of the living organism: A, B and C.'},
{type:'blanks',src:'Try 1 (2)',q:'Fill in the blank about observation.',ar:'كمّلي الفراغ.',bank:['places','gloves','the sun'],items:[['Living organisms live in','places','that fit them. So, the kinds of living organisms you find are different depending on the location.']]}])},

{t:'On paper',stars:4,svg:()=>notebook('Make your own record card!','Observe a leaf, an ant or a flower,','then fill in a card in your notebook.',U('lens',600,290,100,100)),
L:[["Now make your own record card in your notebook.","دلوقتي اعملي بطاقة تسجيل بنفسك في الكراسة."],["Observe a leaf, an ant or a flower closely, then fill in your card.","لاحظي ورقة شجر أو نملة أو وردة عن قرب، وبعدين املي البطاقة."]],
act:(el,K)=>K.paper(el,{key:'paper',src:'Warm Up ②',q:'Make a record card for one living organism you observe.',ar:'اعملي بطاقة تسجيل لكائن حي بتلاحظيه.',model:'Your card should have: the <b>topic</b>, the <b>date and your name</b>, a <b>sketch</b> with thin, clear lines, <b>sentences</b> about the place, size, shape and color, and <b>what you learned</b>.',modelAr:'البطاقة فيها: الموضوع، التاريخ واسمك، رسم بخطوط رفيعة وواضحة، جمل عن المكان والحجم والشكل واللون، واللي اتعلمتيه.',checks:['the <b>topic</b>, the <b>date</b> and my <b>name</b>?','a <b>sketch</b> with thin, clear lines (no shading)?','sentences about the <b>place, size, shape and color</b>?','<b>what I learned</b> or wondered?']})},

{t:'The end',svg:()=>ending(garden()+U('tree',600,40,180,222)+U('flowers',60,250,100,110),'You can observe like a scientist!'),
L:[["Great job! Now you can observe like a scientist.","برافو! دلوقتي تقدري تلاحظي زي العلماء."]],
act:el=>sum(el,['Look at <b>shape, color and size</b>.','<b>Can move it:</b> glass close to your eye, move the object.','<b>Can\'t move it:</b> glass close to your eye, move your face with the glass.','<b>Never</b> look at the sun with a magnifying glass. Wear gloves.','<b>Record card:</b> topic, date and name, sketch (thin lines), sentences, what you learned.'])}
]});

/* ---------------- 1-3 ---------------- */
const grid8=[['grasshopper','Grasshopper',''],['lizard','Lizard','#b08a5a'],['butterfly','Butterfly','#ffd23f'],['lantana','Lantana',''],['vulture','Vulture',''],['papyrus','Papyrus',''],['spider','Spider',''],['lotus','Lotus','']];
L.push({id:'1-3',title:'Colors and Shapes of Living Organisms',ar:'ألوان وأشكال الكائنات الحية',pages:'12–15',scenes:[
{t:'Start',svg:()=>`${fullNile()}${U('bougain',600,300,190,146)}<g class="sniff">${U('goose',430,300,100,104)}</g>${U('bird',140,200,70,87,'#fff')}${U('bird',220,214,60,75,'#fff')}${U('grasshopper',40,390,110,56)}<g class="fly">${U('butterfly',600,120,70,58,'#ffd23f')}</g>
${title('Colors and Shapes','of Living Organisms',400,520,40)}`,
L:[["Look at all the living organisms we found by the Nile!","بصي على كل الكائنات الحية اللي لقيناها جنب النيل!"],["Let's group the living organisms we found.","يلا نقسم الكائنات الحية اللي لقيناها لمجموعات."]]},

{t:'How to group',svg:()=>`<rect width="800" height="450" fill="#fbf7ee"/>${grid8.map((g,i)=>{const x=300+(i%4)*124,y=i<4?30:240;return `<g><rect x="${x+3}" y="${y+5}" width="116" height="180" rx="16" fill="#000" opacity=".1"/><rect x="${x}" y="${y}" width="116" height="180" rx="16" fill="#fff"/>${U(g[0],x+8,y+16,100,110,g[2])}<text x="${x+58}" y="${y+160}" text-anchor="middle" font-size="17" font-weight="800" fill="#1d3557">${g[1]}</text></g>`}).join('')}
<g data-r="2"><rect x="298" y="28" width="120" height="184" rx="18" fill="none" stroke="#3f9a3a" stroke-width="5"/><rect x="546" y="28" width="120" height="184" rx="18" fill="none" stroke="#3f9a3a" stroke-width="5"/></g>
<g data-r="3"><rect x="298" y="238" width="120" height="184" rx="18" fill="none" stroke="#e07a2f" stroke-width="5"/><rect x="546" y="238" width="120" height="184" rx="18" fill="none" stroke="#e07a2f" stroke-width="5"/></g>
<g data-r="4"><rect x="670" y="28" width="120" height="184" rx="18" fill="none" stroke="#1d6fa5" stroke-width="5"/><rect x="422" y="238" width="120" height="184" rx="18" fill="none" stroke="#1d6fa5" stroke-width="5"/><rect x="670" y="238" width="120" height="184" rx="18" fill="none" stroke="#1d6fa5" stroke-width="5"/></g>
<g data-r="1"><text x="20" y="64" font-size="26" font-weight="800" fill="#1d3557">Group by</text><text x="20" y="98" font-size="26" font-weight="800" fill="#e63973">color and shape</text></g>
<g data-r="2"><rect x="14" y="130" width="270" height="80" rx="18" fill="#3f9a3a"/><text x="30" y="164" font-size="21" font-weight="800" fill="#fff">1. Common points</text><text x="30" y="194" font-size="17" font-weight="700" fill="#e6f6dd">both have 6 legs</text></g>
<g data-r="3"><rect x="14" y="226" width="270" height="80" rx="18" fill="#e07a2f"/><text x="30" y="260" font-size="21" font-weight="800" fill="#fff">2. Differences</text><text x="30" y="290" font-size="17" font-weight="700" fill="#fff0d9">shape and size are different</text></g>
<g data-r="4"><rect x="14" y="322" width="270" height="80" rx="18" fill="#1d6fa5"/><text x="30" y="356" font-size="21" font-weight="800" fill="#fff">3. Classify</text><text x="30" y="386" font-size="17" font-weight="700" fill="#dff1fb">plants go in one group</text></g>`,
L:[["You can group living organisms by looking at their color and shape.","تقدري تقسمي الكائنات الحية لمجموعات لما تبصي على لونها وشكلها."],
["Find common points: things that are the same, like 'has legs', 'has wings' or 'colors are similar'.","دوّري على نقط التشابه: حاجات زي بعض، زي 'ليه رجلين' أو 'ليه جناحات' أو 'ألوانهم شبه بعض'."],
["Find differences: things that are not the same, like 'shape is different' or 'size is different'.","دوّري على الاختلافات: زي 'الشكل مختلف' أو 'الحجم مختلف'."],
["Classify: collect living organisms with similar features and put them in groups.","صنّفي: اجمعي الكائنات اللي صفاتها شبه بعض في مجموعات."]]},

{t:'Make groups',stars:13,svg:()=>`<rect width="800" height="450" fill="#fbf5e8"/><rect x="20" y="70" width="370" height="364" rx="26" fill="#e6f6dd" stroke="#3f9a3a" stroke-width="4" stroke-dasharray="14 10"/><rect x="410" y="70" width="370" height="364" rx="26" fill="#fde9d6" stroke="#e07a2f" stroke-width="4" stroke-dasharray="14 10"/>
<g id="lblA">${tag(205,40,'Animals',170,'#3f9a3a','#fff')}</g><g id="lblB">${tag(595,40,'Plants',170,'#e07a2f','#fff')}</g><g id="bin-A"></g><g id="bin-B"></g>`,
L:[["Let's make groups! First, sort them into animals and plants.","يلا نعمل مجموعات! الأول قسميهم حيوانات ونباتات."],["Then sort the animals again: which ones have 6 legs?","بعدين قسمي الحيوانات تاني: مين ليه ٦ رجلين؟"]],
act:(el,K)=>{const items=[{n:'Grasshopper',id:'grasshopper'},{n:'Lizard',id:'lizard',c:'#b08a5a'},{n:'Butterfly',id:'butterfly',c:'#ffd23f'},{n:'Lantana',id:'lantana'},{n:'Vulture',id:'vulture'},{n:'Papyrus',id:'papyrus'},{n:'Spider',id:'spider'},{n:'Lotus',id:'lotus'}];
const plants=['lantana','papyrus','lotus'];
K.bins(el,{title:'Round 1: animal or plant?',ar:'الجولة ١: حيوان ولا نبات؟',key:'r1',bins:[{k:'A',label:'Animal',x:40,y:92,cols:3,cw:115,ch:82},{k:'B',label:'Plant',x:430,y:92,cols:3,cw:115,ch:82}],items:items.map(i=>({...i,k:plants.includes(i.id)?'B':'A'})),hint:it=>`Does a ${it.n.toLowerCase()} move and eat like an animal, or grow in one place like a plant?`,
done:()=>{const b=document.createElement('button');b.className='btn blue';b.type='button';b.textContent='Round 2 ▶';b.onclick=()=>{const s=K.$('#lblA'),t=K.$('#lblB');if(s)s.innerHTML=ART.tag(205,40,'6 legs',150,'#3f9a3a','#fff');if(t)t.innerHTML=ART.tag(595,40,'Not 6 legs',190,'#e07a2f','#fff');K.$('#bin-A').innerHTML='';K.$('#bin-B').innerHTML='';
K.bins(el,{title:'Round 2: 6 legs or not?',ar:'الجولة ٢: ليه ٦ رجلين ولا لأ؟',key:'r2',bins:[{k:'A',label:'6 legs',x:40,y:110,cols:2,cw:170,ch:110},{k:'B',label:'Not 6 legs',x:430,y:110,cols:2,cw:170,ch:110}],items:items.filter(i=>!plants.includes(i.id)).map(i=>({...i,k:['grasshopper','butterfly'].includes(i.id)?'A':'B'})),hint:it=>`Count the legs of the ${it.n.toLowerCase()}. Insects have 6 legs.`})};el.appendChild(b)}})}},

{t:'More animals',svg:()=>`${board()}${pol(40,24,'hoopoe','Hoopoe','#dff1fb',-3,'#3f9a3a','','2')}${pol(310,20,'sandcat','Sand Cat','#f6e2b8',2,'#e63973','','2')}${pol(580,26,'bird','Cattle Egret','#cfeec0',-2,'#a875ff','#fff','3')}${pol(40,238,'butterfly','Plain Tiger','#eaf4ff',3,'#e07a2f','#ff9a3c','3')}${pol(310,236,'beetle','Dung Beetle','#f3dcb0',-2,'#f2a900','','4')}${pol(580,240,'cobra','Cobra','#efe1c6',2,'#1d6fa5','','4')}`,
L:[["Let's meet more living organisms in Egypt, and where they live.","يلا نتعرف على كائنات حية تانية في مصر، وعايشة فين."],
["The hoopoe lives in gardens and farmlands. The sand cat lives in deserts east of the Nile River.","الهدهد عايش في الجناين والأراضي الزراعية. وقط الرمال عايش في الصحاري اللي شرق النيل."],
["The cattle egret lives in the Nile River basin, farmlands and green areas. The plain tiger butterfly lives in the Nile Delta, valleys and city parks.","أبو قردان عايش في حوض النيل والأراضي الزراعية والأماكن الخضرا. وفراشة النمر العادي عايشة في الدلتا والوديان وحدائق المدن."],
["The dung beetle lives in deserts, grasslands and farmlands. The cobra lives in dry semi-deserts, savannas and woodlands.","الجعران عايش في الصحاري والمراعي والأراضي الزراعية. والكوبرا عايشة في أشباه الصحاري الجافة والسافانا والغابات."]]},

{t:'More plants',svg:()=>`${board()}${pol(40,24,'palm','Palm','#ffe6b8',-3,'#3f9a3a','','2')}${pol(310,20,'lotus','Lotus flower','#cfe9f7',2,'#e63973','','2')}${pol(580,26,'colocynth','Colocynth','#f3dcb0',-2,'#a875ff','','3')}${pol(40,238,'papyrus','Papyrus','#cfe9f7',3,'#e07a2f','','3')}${pol(310,236,'acacia','Acacia','#ffe6b8',-2,'#f2a900','','4')}${pol(580,240,'clover','Egyptian Clover','#d9f0c8',2,'#1d6fa5','','4')}`,
L:[["Plants have their own habitats too.","النباتات كمان ليها مواطنها."],
["The palm lives in deserts, oases and the Nile River basin. The lotus flower lives in wetlands and swamps of the Nile River.","النخلة عايشة في الصحاري والواحات وحوض النيل. وزهرة اللوتس عايشة في الأراضي الرطبة والمستنقعات بتاعة النيل."],
["Colocynth lives in dry deserts near the Mediterranean Sea. Papyrus lives in swamps and watersides of the Nile Delta.","الحنظل عايش في الصحاري الجافة جنب البحر المتوسط. والبردي عايش في مستنقعات وشطوط دلتا النيل."],
["The acacia lives in dry areas, deserts and around oases. Egyptian clover grows in the rich lands of the Nile Delta and Upper Egypt.","السنط عايش في الأماكن الجافة والصحاري وحوالين الواحات. والبرسيم المصري بيطلع في الأراضي الخصبة في الدلتا والصعيد."]]},

{t:'Habitat match',stars:4,svg:()=>chalk("Let's Expand — pages 14–15"),L:[["Do you remember where they live? Let's check!","فاكرة عايشين فين؟ يلا نشوف!"]],
act:(el,K)=>K.quiz(el,'q',[
{type:'mcq',src:"Let's Expand",q:'Where does the sand cat live?',ar:'قط الرمال عايش فين؟',o:['In swamps of the Nile Delta','In deserts east of the Nile River','In city parks'],a:[1],why:'The sand cat lives in deserts east of the Nile River.'},
{type:'mcq',src:"Let's Expand",q:'Which plant lives in wetlands and swamps of the Nile River?',ar:'أنهي نبات عايش في الأراضي الرطبة ومستنقعات النيل؟',o:['Lotus flower','Colocynth','Acacia'],a:[0],why:'The lotus flower lives in wetlands and swamps of the Nile.'},
{type:'mcq',src:"Let's Expand",q:'Where does the hoopoe live?',ar:'الهدهد عايش فين؟',o:['In dry semi-deserts','In gardens and farmlands','Under stones'],a:[1],why:'The hoopoe lives in gardens and farmlands.'},
{type:'mcq',src:"Let's Expand",q:'Which plant lives in dry deserts near the Mediterranean Sea?',ar:'أنهي نبات عايش في الصحاري الجافة جنب البحر المتوسط؟',o:['Papyrus','Egyptian clover','Colocynth'],a:[2],why:'Colocynth lives in dry deserts near the Mediterranean Sea.'}])},

{t:'On paper',stars:2,svg:()=>notebook('Choose 6 living organisms you know.','Group them by color, then group them','again by shape. Write the groups.',U('butterfly',600,300,110,92,'#ffd23f')),
L:[["Now try it in your notebook. Choose six living organisms you know.","جربي في الكراسة. اختاري ٦ كائنات حية تعرفيها."],["Group them by color. Then group them again by shape.","قسميهم حسب اللون، وبعدين قسميهم تاني حسب الشكل."]],
act:(el,K)=>K.paper(el,{key:'paper',src:'Warm Up',q:'Choose 6 living organisms. Group them by color, then by shape.',ar:'اختاري ٦ كائنات حية، وقسميهم حسب اللون، وبعدين حسب الشكل.',model:'Example: <b>By color</b> — green group: grasshopper, papyrus, lotus leaf. Brown group: lizard, spider, vulture. <b>By shape</b> — group with 6 legs: grasshopper, butterfly. Group with no legs: papyrus, lotus.',modelAr:'مثال: حسب اللون: مجموعة خضرا ومجموعة بني. حسب الشكل: مجموعة ليها ٦ رجلين ومجموعة مالهاش رجلين.',checks:['groups <b>by color</b>?','groups <b>by shape</b> (legs, wings...)?']})},

{t:'The end',svg:()=>ending(fullNile()+U('bougain',600,300,190,146),'You can classify living organisms!'),
L:[["Great job! You can find common points and differences, and put living organisms into groups.","برافو! بقيتي تعرفي تلاقي التشابه والاختلاف، وتقسمي الكائنات الحية لمجموعات."]],
act:el=>sum(el,['Group living organisms by <b>color</b> and <b>shape</b> (and size).','<b>Common points:</b> has legs, has wings, similar colors.','<b>Differences:</b> shape or size is different.','<b>Classify:</b> put similar living organisms in groups.'])}
]});

/* ---------------- 1-4 ---------------- */
const nileLife=()=>`${U('lotus',56,266,86,50)}${U('lotus',236,300,72,42)}<g class="fly">${U('bee',120,120,60,48)}</g>${U('bird',300,108,80,100,'#fff')}<g class="hop">${U('frog',248,356,84,72)}</g>`;
const desertLife=()=>`${U('acacia',560,90,200,173)}<g class="sniff">${U('fox',420,300,140,112)}</g><g class="hop">${U('jerboa',640,340,96,74)}</g>${U('lizard',560,404,110,41,'#c99a5a')}`;
L.push({id:'1-4',title:'Different Places, Different Living Organisms',ar:'أماكن مختلفة وكائنات حية مختلفة',pages:'16–19',scenes:[
{t:'Start',svg:()=>`${split()}<g opacity=".95">${nileLife()}${desertLife()}</g>${title('Different Places,','Different Living Organisms',470,590)}${dewy(40,120,1.6)}`,
L:[["Hello! I'm Dewy, a little drop of water.","أهلاً! أنا ديوي، نقطة مية صغيرة."],["Today we will visit two very different places in Egypt.","النهارده هنزور مكانين مختلفين جداً في مصر."],["Let's find out why different places have different living organisms!","يلا نعرف ليه كل مكان فيه كائنات حية مختلفة!"]]},
{t:'Two places',svg:()=>`${split()}<g data-r="1">${tag(200,40,'Along the Nile River',280)}</g><g data-r="2">${nileLife()}</g><g data-r="3">${tag(560,40,'The Desert',200)}</g><g data-r="4">${desertLife()}</g>`,
L:[["This is the land along the Nile River. It has plenty of water.","ده المكان اللي على ضفاف نهر النيل. فيه مية كتير."],["Frogs, bees and water birds live here. Lotus flowers float on the water.","الضفادع والنحل وطيور المية عايشين هنا، وزهرة اللوتس طافية على المية."],["And this is the desert. It has very little water and a lot of hot sun.","ودي الصحراء. فيها مية قليلة جداً وشمس حارة كتير."],["The fennec fox, the jerboa and the lizard live here.","ثعلب الفنك والجربوع والسحلية عايشين هنا."]]},
{t:'Habitat',svg:()=>`${split()}<g class="hop">${U('frog',236,356,84,72)}</g>${U('acacia',600,90,190,164)}<g class="sniff">${U('fox',520,300,140,112)}</g>
<g data-r="1"><rect x="279" y="20" width="250" height="66" rx="33" fill="#000" opacity=".15"/><rect x="275" y="14" width="250" height="66" rx="33" fill="#fff"/><text x="400" y="60" text-anchor="middle" font-size="40" font-weight="800" fill="#e63973">habitat</text></g>
<g data-r="2"><ellipse class="ring" cx="200" cy="335" rx="185" ry="100" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 10"/>${tag(200,222,"Frog's habitat",210,'#3f9a3a','#fff')}</g>
<g data-r="3"><ellipse class="ring" cx="600" cy="345" rx="185" ry="95" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 10"/>${tag(600,240,"Fennec fox's habitat",270,'#e07a2f','#fff')}</g>
<g data-r="4"><rect x="70" y="96" width="660" height="52" rx="26" fill="#1d3557"/><text x="400" y="131" text-anchor="middle" font-size="24" font-weight="700" fill="#fff">habitat = the place where a living organism lives</text></g>`,
L:[["The place where a living organism lives is called its habitat.","المكان اللي بيعيش فيه الكائن الحي اسمه موطنه (habitat)."],["The land along the Nile River is the habitat of the frog.","ضفاف نهر النيل هي موطن الضفدع."],["The desert is the habitat of the fennec fox.","والصحراء هي موطن ثعلب الفنك."],["Remember the new word: habitat!","افتكري الكلمة الجديدة: habitat يعني الموطن!"]]},
{t:'Water & soil',svg:()=>{const col=(x0,water,sunL,moist,wTxt,sTxt,r)=>`<g data-r="${r}"><text x="${x0}" y="128" font-size="26" font-weight="800" fill="#1d3557">Water</text><rect x="${x0+110}" y="104" width="230" height="32" rx="16" fill="#fff" stroke="#cfd8e3" stroke-width="2"/><rect class="grow" x="${x0+110}" y="104" width="${230*water}" height="32" rx="16" fill="url(#gRiver)"/><text x="${x0+110}" y="164" font-size="21" font-weight="700" fill="#1d6fa5">${wTxt}</text>
<text x="${x0}" y="246" font-size="26" font-weight="800" fill="#1d3557">Soil</text><rect x="${x0+110}" y="196" width="230" height="74" rx="16" fill="${moist?'url(#gSoilM)':'url(#gSoilD)'}"/>${moist?[0,1,2,3,4].map(i=>U('drop',x0+130+i*42,212+(i%2)*22,14,20)).join(''):`<path d="M${x0+130} 210l30 22l-10 20M${x0+200} 200l12 30l40 10M${x0+290} 214l-22 30l18 18" stroke="#a8763f" stroke-width="3" fill="none"/>`}<text x="${x0+110}" y="300" font-size="22" font-weight="800" fill="#e63973">${sTxt}</text></g>
<g data-r="4"><text x="${x0}" y="372" font-size="26" font-weight="800" fill="#1d3557">Sunlight</text><rect x="${x0+110}" y="348" width="230" height="32" rx="16" fill="#fff" stroke="#cfd8e3" stroke-width="2"/><rect class="grow" x="${x0+110}" y="348" width="${230*sunL}" height="32" rx="16" fill="#ffb703"/><text x="${x0+110}" y="410" font-size="21" font-weight="700" fill="#b06a00">${sunL>.8?'A lot: strong and hot':'Less, with some shade'}</text></g>`;
return `<rect width="400" height="450" fill="#dff3fb"/><rect x="400" width="400" height="450" fill="#fff1d6"/><g data-r="1">${tag(200,40,'Along the Nile River',280,'#1d6fa5','#fff')}${tag(600,40,'Desert',150,'#e07a2f','#fff')}</g>${col(30,.92,.55,true,'Plenty of water','moist soil',2)}${col(430,.12,.95,false,'Very little water','dry soil',3)}`},
L:[["Let's compare the two environments.","يلا نقارن بين البيئتين."],["Along the Nile there is plenty of water, and the soil is moist. Moist means a little wet.","على النيل فيه مية كتير، والتربة رطبة. رطبة يعني مبلولة شوية."],["In the desert there is very little water, and the soil is dry.","في الصحراء المية قليلة جداً، والتربة جافة."],["The desert also gets a lot of strong, hot sunlight.","وكمان الصحراء بتاخد شمس قوية وحارة كتير."]]},
{t:'Who lives where?',svg:()=>{const cell=(x,y,w,h,f)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${f}"/>`;
const ico=(cx,id,lab,c,w=84,h=74,y=180,ly=286)=>`${U(id,cx-w/2,y,w,h,c)}<text x="${cx}" y="${ly}" text-anchor="middle" font-size="${ly>300?19:21}" font-weight="700" fill="#1d3557">${lab}</text>`;
const lab=(y,h,t)=>`${cell(10,y,158,h,'#1d3557')}<text x="89" y="${y+h/2+8}" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">${t}</text>`;
return `<rect width="800" height="450" fill="#fffaf0"/><g data-r="1">${cell(176,12,306,52,'#1d6fa5')}<text x="329" y="46" text-anchor="middle" font-size="24" font-weight="800" fill="#fff">Along the Nile River</text>${cell(490,12,300,52,'#e07a2f')}<text x="640" y="46" text-anchor="middle" font-size="24" font-weight="800" fill="#fff">Desert</text>
${lab(72,92,'Environment')}${cell(176,72,306,92,'#e3f4fb')}${cell(490,72,300,92,'#fff0d9')}<text x="329" y="112" text-anchor="middle" font-size="23" font-weight="700" fill="#1d3557">Plenty of water</text><text x="329" y="145" text-anchor="middle" font-size="23" font-weight="800" fill="#e63973">moist soil</text><text x="640" y="112" text-anchor="middle" font-size="23" font-weight="700" fill="#1d3557">Very little water</text><text x="640" y="145" text-anchor="middle" font-size="23" font-weight="800" fill="#e63973">dry soil</text></g>
<g data-r="2">${lab(172,128,'Plants')}${cell(176,172,306,128,'#e3f4fb')}${ico(228,'luffa','Luffa')}${ico(329,'orange','Orange')}${ico(430,'lotus','Lotus','',90,56,196)}</g>
<g data-r="3">${cell(490,172,300,128,'#fff0d9')}${ico(565,'acacia','Acacia','',110,90,176)}${ico(715,'colocynth','Colocynth','',100,56,198)}</g>
<g data-r="4">${lab(308,134,'Animals')}${cell(176,308,306,134,'#e3f4fb')}${cell(490,308,300,134,'#fff0d9')}${ico(228,'frog','Frog','',80,68,318,420)}${ico(329,'bee','Bee','',76,60,324,420)}${ico(430,'bird','Water bird','#fff',70,86,310,420)}${ico(548,'fox','Fennec fox','',96,77,316,420)}${ico(646,'jerboa','Jerboa','',80,62,326,420)}${ico(740,'lizard','Lizard','#c99a5a',90,34,350,420)}</g>`},
L:[["Each habitat has its own plants and animals.","كل موطن ليه نباتاته وحيواناته."],["Along the Nile we find the luffa, orange trees and the lotus.","على النيل بنلاقي اللوف والبرتقال واللوتس."],["In the desert we find the acacia tree and the colocynth.","وفي الصحراء بنلاقي شجرة السنط (الأكاسيا) والحنظل."],["Frogs, bees and water birds live along the Nile. Fennec foxes, jerboas and lizards live in the desert.","الضفادع والنحل وطيور المية على النيل، وثعلب الفنك والجربوع والسحلية في الصحراء."]]},
{t:'The acacia',svg:()=>`<rect width="800" height="232" fill="url(#gSkyDes)"/>${sun(740,60,.6)}<rect y="230" width="800" height="82" fill="url(#gDune1)"/><rect y="310" width="800" height="62" fill="url(#gDune2)"/><rect y="370" width="800" height="80" fill="url(#gDune3)"/>${sandDots(0,236,800,160,60,9)}
<rect y="408" width="800" height="42" fill="url(#gRiver)"/><path d="M0 410q20 -6 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0" stroke="#bfe9ff" stroke-width="3" fill="none"/><text x="30" y="440" font-size="21" font-weight="800" fill="#fff">water deep underground</text>
${U('acacia',460,46,240,207)}<g data-r="1">${tag(580,26,'Acacia tree',180,'#5f8f3a','#fff')}</g>
<g data-r="2"><circle cx="115" cy="125" r="88" fill="#fff" stroke="#c9d7b8" stroke-width="4"/><path d="M55 165Q62 78 172 86Q168 184 55 165Z" fill="url(#gLeaf)"/><path d="M58 163L168 90" stroke="#2e7b33" stroke-width="3"/>${[0,1,2,3].map(i=>`<g class="rise" style="animation-delay:${i*.55}s">${U('drop',84+i*22,92+(i%2)*26,14,20)}</g>`).join('')}<text x="115" y="246" text-anchor="middle" font-size="21" font-weight="800" fill="#7a3d12">big leaf</text><text x="115" y="272" text-anchor="middle" font-size="18" font-weight="700" fill="#7a3d12">loses a lot of water</text>
<circle cx="325" cy="125" r="88" fill="#fff" stroke="#c9d7b8" stroke-width="4"/><path d="M268 172L382 82" stroke="#5f8f3a" stroke-width="3"/>${[0,1,2,3,4,5,6].map(i=>{const x=276+i*15,y=165-i*11.8;return `<ellipse cx="${x-6}" cy="${y-8}" rx="6" ry="3" fill="#77a94a" transform="rotate(-40 ${x-6} ${y-8})"/><ellipse cx="${x+7}" cy="${y+6}" rx="6" ry="3" fill="#77a94a" transform="rotate(-40 ${x+7} ${y+6})"/>`}).join('')}<g class="rise" style="animation-duration:4s">${U('drop',318,100,12,17)}</g><text x="325" y="246" text-anchor="middle" font-size="21" font-weight="800" fill="#7a3d12">small leaves</text><text x="325" y="272" text-anchor="middle" font-size="18" font-weight="700" fill="#7a3d12">lose less water</text></g>
<g data-r="3" stroke="#6b4a2b" fill="none" stroke-linecap="round"><path class="draw" d="M580 250Q570 310 592 345Q604 382 586 414" stroke-width="7"/><path class="draw" d="M578 254Q540 290 522 334Q506 372 516 412" stroke-width="5"/><path class="draw" d="M584 254Q630 290 650 326Q670 364 660 412" stroke-width="5"/><path class="draw" d="M590 306Q620 316 640 306" stroke-width="3"/><path class="draw" d="M562 300Q532 308 516 298" stroke-width="3"/></g>
<g data-r="4">${tag(250,344,'small leaves + deep roots = it survives!',470,'#1d3557','#fff',21)}</g>`,
L:[["Look at the acacia tree. It lives in the desert.","بصّي على شجرة السنط (الأكاسيا). هي عايشة في الصحراء."],["Its leaves are small. Small leaves reduce the loss of water.","أوراقها صغيرة. الأوراق الصغيرة بتقلل فقدان المية."],["Its roots grow deep underground to reach water.","وجذورها بتنزل عميق تحت الأرض علشان توصل للمية."],["Small leaves and deep roots help the acacia survive in the desert.","الأوراق الصغيرة والجذور العميقة بتساعد السنط يعيش في الصحراء."]]},
{t:'Adaptation',stars:1,svg:()=>`<rect width="800" height="450" fill="url(#gSand)"/>${sandDots(0,0,800,450,160,4)}<ellipse cx="200" cy="330" rx="40" ry="18" fill="#c99862"/><ellipse cx="660" cy="300" rx="30" ry="14" fill="#c99862"/><ellipse cx="330" cy="400" rx="22" ry="10" fill="#c99862"/>${U('grass',90,250,70,35)}
<g id="liz">${U('lizard',470,250,160,60,'#d9ae72')}<rect x="460" y="240" width="180" height="80" fill="transparent"/></g>
<g id="found" style="opacity:0;transition:opacity .6s"><ellipse class="ring" cx="550" cy="279" rx="110" ry="52" fill="none" stroke="#e63973" stroke-width="5" stroke-dasharray="14 10"/>${tag(550,372,'Its sandy color helps it hide!',380,'#e63973','#fff')}</g>
<g data-r="1"><rect x="44" y="24" width="720" height="100" rx="24" fill="#000" opacity=".12"/><rect x="40" y="18" width="720" height="100" rx="24" fill="#fff"/><text x="400" y="62" text-anchor="middle" font-size="36" font-weight="800" fill="#e63973">adaptation</text><text x="400" y="100" text-anchor="middle" font-size="23" font-weight="700" fill="#1d3557">changing body parts or behaviors to survive in a place</text></g>
<g data-r="2">${tag(400,420,'Can you find the lizard? Tap it!',400,'#1d3557','#fff')}</g>`,
L:[["Changing body parts or behaviors to survive in a place is called adaptation.","لما الكائن الحي يغيّر أجزاء جسمه أو سلوكه علشان يعيش في مكان، ده اسمه تكيّف (adaptation)."],["Color and shape are adaptations too. Can you find the lizard on the sand? Tap it!","اللون والشكل كمان تكيّف. تقدري تلاقي السحلية على الرمل؟ دوسي عليها!"],["Its sandy color helps it hide in the desert. That is an adaptation!","لونها شبه الرمل فبيساعدها تستخبى في الصحراء. ده تكيّف!"]],
enter:K=>{const l=K.$('#liz');if(l)l.onclick=()=>{K.$('#found').style.opacity=1;K.star('lizard')}}},
{t:'Predict',stars:1,svg:()=>`${split()}${U('acacia',600,90,190,164)}${U('lizard',650,404,110,41,'#c99a5a')}
<g transform="translate(250 356)"><g id="mover" class="mover"><g class="hop"><use id="frogUse" href="#frog" width="84" height="72"/></g></g></g>
<g id="hot" style="opacity:0;transition:opacity .8s">${[0,1,2].map(i=>`<g class="rise" style="animation-delay:${i*.6}s">${U('drop',590+i*18,290,12,17)}</g>`).join('')}${tag(620,250,'Too dry! Too hot!',240,'#d64545','#fff')}</g>
<g data-r="1">${tag(400,40,'What would happen to the frog?',420,'#fff')}</g>${dewy(320,130,.9)}`,
L:[["Let's predict! What would happen if we took a frog from the Nile River to the desert?","يلا نتوقع! إيه اللي هيحصل لو أخدنا ضفدع من نهر النيل للصحراء؟"],["Tap the button below and watch the frog.","دوسي على الزرار اللي تحت واتفرجي على الضفدع."]],
act:(el,K)=>{el.innerHTML=`<h2>Predict</h2><p class="q">Move the frog from the Nile to the desert.</p><button class="btn" id="goFrog" type="button">Take the frog to the desert</button><div id="pq"></div>`;
K.$('#goFrog').onclick=()=>{const m=K.$('#mover');if(!m)return;m.classList.add('go');K.$('#goFrog').disabled=true;setTimeout(()=>{const f=K.$('#frogUse');if(f)f.setAttribute('filter','url(#dry)');const h=K.$('#mover .hop');if(h)h.style.animation='none';const t=K.$('#hot');if(t)t.style.opacity=1;
K.mcq(K.$('#pq'),{q:'What would happen to the frog?',ar:'إيه اللي هيحصل للضفدع؟',o:['It would be happy and grow bigger.','It could not survive, because the desert is very dry.','It would turn into a lizard.'],a:[1],why:'The desert has very little water and dry soil. A frog needs a habitat with plenty of water and moist soil.'},first=>{if(first)K.star('predict')})},2700)}}},
{t:'Sort it',stars:6,svg:()=>`${split()}${tag(200,40,'B: along the river',260,'#1d6fa5','#fff')}${tag(600,40,'A: desert',170,'#e07a2f','#fff')}<g id="bin-B"></g><g id="bin-A"></g>${dewy(372,370,.8)}`,
L:[["Now it's your turn! Write A for living organisms found in the desert, and B for those found along the river.","دورك! اكتبي A للكائنات اللي في الصحراء، وB للي على النهر."],["Tap A or B for each one.","دوسي A أو B لكل واحد."]],
act:(el,K)=>K.bins(el,{title:'Sort it',src:'Try (2)',ar:'A = الصحراء · B = على النهر',key:'sort',bins:[{k:'A',label:'A',x:420,y:100,cols:3,cw:120,ch:120},{k:'B',label:'B',x:20,y:100,cols:3,cw:120,ch:120}],
items:[{n:'Egyptian sand lizard',id:'lizard',c:'#c99a5a',k:'A'},{n:'Lotus',id:'lotus',k:'B'},{n:'Fennec fox',id:'fox',k:'A'},{n:'Papyrus',id:'papyrus',k:'B'},{n:'Jerboa',id:'jerboa',k:'A'},{n:'Egyptian goose',id:'goose',k:'B'}],
hint:it=>`Does a ${it.n.toLowerCase()} need plenty of water, or can it live with very little?`})},
{t:'Quiz',stars:5,svg:()=>chalk('Try (1), (3) and Exercise (1), (2), (4)'),L:[["Quiz time! Read each question and choose the correct answer.","وقت الأسئلة! اقري كل سؤال واختاري الإجابة الصحيحة."]],
act:(el,K)=>K.quiz(el,'q',[
{type:'mcq',src:'Try (1)',q:'What do you call the place where a living organism lives?',ar:'بنسمي المكان اللي بيعيش فيه الكائن الحي إيه؟',o:['adaptation','habitat','observation'],a:[1],why:'The place where a living organism lives is called its habitat.'},
{type:'mcq',src:'Try (3)',q:'What are the physical features of desert plants that help them to keep water? Choose all correct answers.',ar:'إيه صفات نباتات الصحراء اللي بتساعدها تحافظ على المية؟ اختاري كل الإجابات الصحيحة.',o:['A: The leaves are very big.','B: The leaves are small.','C: The roots grow shallowly underground.','D: The roots grow deep underground.'],a:[1,3],multi:1,why:'Small leaves lose less water, and deep roots reach water underground: B and D.'},
{type:'mcq',src:'Exercise (1)',q:'Choose the correct answer about the color and shape of living organisms.',ar:'اختاري الإجابة الصحيحة عن لون وشكل الكائنات الحية.',o:['A: They are decided by how much they exercise.','B: They are adaptations to survive in their habitat.','C: They are caused by the differences in what they eat.'],a:[1],why:"Color and shape are adaptations, like the lizard's sandy color."},
{type:'mcq',src:'Exercise (2)',q:"Choose the correct answer about a plant's shape and its habitat.",ar:'اختاري الإجابة الصحيحة عن شكل النبات وموطنه.',o:["A: Desert plants have small leaves so they don't lose water.",'B: Desert plants have very big leaves to absorb a lot of water.','C: Desert plants have very big leaves to share water with animals.'],a:[0],why:'Small leaves help desert plants keep their water.'},
{type:'mcq',src:'Exercise (4)',q:'What is it called when a living organism changes its body parts or behaviors to survive in a place?',ar:'بنسمي إيه لما الكائن الحي يغيّر أجزاء جسمه أو سلوكه علشان يعيش في مكان؟',o:['habitat','adaptation','environment'],a:[1],why:'This is called adaptation.'}])},
{t:'On paper',stars:2,svg:()=>notebook('(3) What would happen if you took a frog living','in the Nile River to the desert?','Answer with your reason.',U('frog',620,290,110,94)),
L:[["Here is a question for your notebook. Write your answer on paper, with your reason.","ده سؤال للكراسة. اكتبي إجابتك على الورق ومعاها السبب."],["When you finish, tap the button to check your answer.","لما تخلصي، دوسي على الزرار علشان تراجعي إجابتك."]],
act:(el,K)=>K.paper(el,{key:'paper',src:'Exercise (3)',q:'What would happen if you took a frog living in the Nile River to the desert? Answer with your reason.',ar:'إيه اللي هيحصل لو أخدتي ضفدع عايش في نهر النيل للصحراء؟ جاوبي ومعاكي السبب.',model:'The frog could not survive (it would die), because the desert has very little water and dry soil. A frog needs a habitat with plenty of water and moist soil.',modelAr:'الضفدع مش هيقدر يعيش (هيموت)، لأن الصحراء فيها مية قليلة جداً وتربة جافة، والضفدع محتاج موطن فيه مية كتير وتربة رطبة.',checks:['that the frog <b>could not survive</b>?','a <b>reason</b>: very little water, dry soil?']})},
{t:'The end',svg:()=>ending(split()+nileLife()+desertLife(),'habitat · adaptation'),
L:[["Great job! Today you learned two new words: habitat and adaptation.","برافو! النهارده اتعلمتي كلمتين جداد: habitat يعني الموطن، وadaptation يعني التكيّف."],["Living organisms need adaptations that suit their environment to live there.","الكائنات الحية محتاجة تكيّف مناسب لبيئتها علشان تعيش فيها."]],
act:el=>sum(el,['<b>habitat</b>: the place where a living organism lives.','<b>adaptation</b>: changing body parts or behaviors to survive in a place.','<b>Nile</b>: plenty of water, moist soil. <b>Desert</b>: very little water, dry soil.','<b>Acacia</b>: small leaves keep water; deep roots reach water.'])}
]});

/* ---------------- 1-5 ---------------- */
L.push({id:'1-5',title:'Desert Living Organisms',ar:'الكائنات الحية في الصحراء',pages:'20–23',scenes:[
{t:'Start',svg:()=>`<rect width="800" height="450" fill="url(#gSkySet)"/>${sun(560,300,1.1)}${pyramids(60,330,1.35)}<path d="M0 320Q300 286 520 316T800 306V450H0Z" fill="url(#gDune2)"/><path d="M0 380Q400 350 800 384V450H0Z" fill="url(#gDune3)"/>
<g class="walk">${U('camel',120,250,110,97)}${U('camel',240,258,100,88)}${U('camel',350,264,92,81)}</g>
<rect x="150" y="26" width="500" height="92" rx="26" fill="#fff" opacity=".95"/><text x="400" y="86" text-anchor="middle" font-size="40" font-weight="800" fill="#c2561f">Desert Living Organisms</text>`,
L:[["Welcome to the hot desert of Egypt!","أهلاً بيكي في صحراء مصر الحارة!"],["How do living organisms live in the hot desert, where there is little water?","إزاي الكائنات الحية بتعيش في الصحراء الحارة اللي فيها مية قليلة؟"],["There are many animals in the desert that live in clever ways!","فيه حيوانات كتير في الصحراء بتعيش بطرق ذكية!"]]},
{t:'Big ears',svg:()=>`${desert(0,800)}<g class="sniff">${U('fox',200,110,330,264)}</g>
<g data-r="3">${[[398,124,0],[436,100,.5],[470,118,1]].map(p=>`<g class="rise" style="animation-delay:${p[2]}s"><path d="M${p[0]} ${p[1]}q-8 -12 0 -24t0 -24" stroke="#ff5a3c" stroke-width="5" fill="none" stroke-linecap="round"/></g>`).join('')}</g>
<g data-r="2"><ellipse class="ring" cx="432" cy="150" rx="74" ry="72" fill="none" stroke="#e63973" stroke-width="5" stroke-dasharray="14 10"/>${tag(640,150,'big ears',150,'#e63973','#fff')}</g>
<g data-r="3">${tag(640,200,'let heat out',180,'#d64545','#fff')}</g>
<g data-r="4"><rect x="20" y="250" width="200" height="180" rx="20" fill="#e9f5df" stroke="#3f8f3a" stroke-width="3"/>${U('redfox',34,290,170,136)}${tag(120,262,'forest fox',150,'#3f8f3a','#fff',18)}</g>
<g data-r="1">${tag(300,40,'Fennec fox',200,'#1d3557','#fff')}</g>`,
L:[["In the deserts of Egypt, living organisms have special body shapes and ways of living.","في صحاري مصر، الكائنات الحية ليها أشكال جسم وطرق عيشة مميزة."],["Look at the fennec fox's big ears.","بصي على ودان ثعلب الفنك الكبيرة."],["Big ears help cool its body by releasing extra heat.","الودان الكبيرة بتساعد على تبريد جسمه، لأنها بتطلّع الحرارة الزيادة."],["A fox from the forest has smaller ears. The desert is much hotter!","الثعلب اللي عايش في الغابة ودانه أصغر، لأن الصحراء أحرّ بكتير!"]]},
{t:'Furry feet',svg:()=>`<rect width="800" height="450" fill="url(#gSkyDes)"/>${sun(690,70,.8)}<rect y="280" width="800" height="170" fill="url(#gDune2)"/>${sandDots(0,286,800,160,70,3)}
${[0,1,2,3,4,5].map(i=>`<g class="rise" style="animation-delay:${i*.35}s"><path d="M${120+i*110} 420q-8-12 0-24t0-24" stroke="#ff5a3c" stroke-width="4" fill="none" opacity=".8" stroke-linecap="round"/></g>`).join('')}
${U('fox',20,170,150,120)}${U('paw',300,20,250,250)}
<g data-r="1">${tag(640,200,'thick fur',150,'#e63973','#fff')}<path d="M570 210L520 256" stroke="#e63973" stroke-width="4"/></g>
<g data-r="2">${tag(430,420,'protects its feet from the hot sand',420,'#d64545','#fff',19)}</g>`,
L:[["The fennec fox has thick fur on the soles of its feet.","ثعلب الفنك عنده فرو تقيل تحت رجليه."],["The fur protects its feet from the heat of the hot sand when it walks.","الفرو ده بيحمي رجليه من سخونة الرمل وهو ماشي عليه."]]},
{t:'Long legs',svg:()=>`${desert(0,800)}${[0,1,2,3,4].map(i=>`<ellipse class="flash" cx="${130+i*130}" cy="404" rx="16" ry="5" fill="#ff5a3c" style="animation-delay:${i*1}s"/>`).join('')}
<g class="hopacross">${U('jerboa',40,316,120,92)}</g>
<g data-r="1">${tag(300,40,'Jerboa',140,'#1d3557','#fff')}</g><g data-r="2">${tag(420,110,'long back legs',200,'#e63973','#fff')}</g><g data-r="3">${tag(420,170,'touches the hot ground for a short time',440,'#d64545','#fff',18)}</g>`,
L:[["This is the jerboa. It has long back legs.","ده الجربوع. عنده رجلين ورا طوال."],["It jumps like a kangaroo to move quickly.","بينط زي الكنغر علشان يتحرك بسرعة."],["This keeps the time it touches the hot ground short.","وكده الوقت اللي بيلمس فيه الأرض السخنة بيبقى قصير."]]},
{t:'Day & night',svg:()=>`${desert(0,800)}<rect y="320" width="800" height="130" fill="#b9783a"/><path d="M0 320H800" stroke="#8a5a2a" stroke-width="3"/>
<path d="M170 320Q176 350 150 372" stroke="#6b4423" stroke-width="20" fill="none" stroke-linecap="round"/><ellipse cx="160" cy="394" rx="84" ry="36" fill="#6b4423"/>${U('fox',104,350,110,88)}
<path d="M600 320Q610 350 580 372" stroke="#6b4423" stroke-width="18" fill="none" stroke-linecap="round"/><ellipse cx="600" cy="396" rx="70" ry="32" fill="#6b4423"/>${U('jerboa',560,362,80,61)}
<g data-r="2">${tag(160,300,'cool hole',150,'#1d6fa5','#fff')}${tag(600,300,'cool hole',150,'#1d6fa5','#fff')}</g>
<g data-r="1" id="dayTag">${tag(330,40,'Day: very hot!',220,'#d64545','#fff')}</g><g id="nightL" data-r="3"><rect width="800" height="320" fill="url(#gSkyNight)"/>${stars(50,800,240)}${moon(650,80,.9)}<path d="M0 260Q300 220 560 256T800 246V322H0Z" fill="url(#gNDune)"/><rect y="320" width="800" height="130" fill="#000" opacity=".45"/><ellipse cx="160" cy="394" rx="84" ry="36" fill="#3b2614"/><ellipse cx="600" cy="396" rx="70" ry="32" fill="#3b2614"/>
<g class="sniff">${U('fox',260,206,140,112)}</g><g class="hop">${U('jerboa',480,236,96,74)}</g>${tag(400,40,'Night: cooler, animals come out',400,'#fff','#1d2563')}</g>
`,
L:[["Desert animals have clever ways of living.","حيوانات الصحراء ليها طرق ذكية في العيشة."],["During the day, they spend time in cool holes under the ground.","بالنهار، بيقعدوا في جحور باردة تحت الأرض."],["Many animals are active at night, when the temperature goes down.","وحيوانات كتير بتنشط بالليل، لما الحرارة بتقل."]],
act:(el,K)=>{el.innerHTML=`<h2>Day or night?</h2><p>Switch between day and night and watch where the animals go.</p><button class="btn blue" type="button" id="dn">Switch day / night</button>`;K.$('#dn').onclick=()=>{const n=K.$('#nightL');if(n)n.classList.toggle('shown')}}},
{t:'Drinking water',svg:()=>`${desert(0,800)}<ellipse cx="250" cy="390" rx="170" ry="38" fill="url(#gRiver)"/><ellipse cx="250" cy="382" rx="150" ry="26" fill="#7fd0ff" opacity=".35"/>${U('palm',40,220,90,150)}${U('palm',380,230,80,136)}${tufts([[90,360,50],[330,364,44]])}
${U('camel',150,190,200,176)}
<g data-r="2">${[0,1,2,3].map(i=>`<g class="sip" style="animation-delay:${i*.5}s">${U('drop',300,350,16,22)}</g>`).join('')}${tag(250,120,'drinks a lot at once',250,'#1d6fa5','#fff',19)}${tag(250,170,'and stores it in its body',290,'#1d6fa5','#fff',19)}</g>
<g data-r="3"><circle cx="640" cy="300" r="110" fill="#fff" opacity=".9"/>${U('jerboa',560,280,110,84)}${U('colocynth',640,320,80,41)}${U('drop',690,260,20,28)}${tag(640,170,'water from food',210,'#3f9a3a','#fff',19)}</g>
<g data-r="1">${tag(400,40,'How do desert animals drink?',380)}</g>`,
L:[["How do desert animals drink water?","حيوانات الصحراء بتشرب مية إزاي؟"],["Camels drink a lot of water at once and store it inside their bodies.","الجمل بيشرب مية كتير مرة واحدة ويخزنها جوه جسمه."],["Some desert animals drink almost no water. They live only on the water found in their food.","وفيه حيوانات صحراوية تقريباً مش بتشرب مية خالص، وبتعيش على المية اللي في أكلها."]]},
{t:'Quiz',stars:5,svg:()=>chalk('Try (1), (2) and Exercise (1), (2) — page 23'),L:[["Quiz time! Read each question carefully.","وقت الأسئلة! اقري كل سؤال كويس."]],
act:(el,K)=>K.quiz(el,'q',[
{type:'mcq',src:'Try (1)',q:"Why are the fennec fox's ears so big?",ar:'ليه ودان ثعلب الفنك كبيرة كده؟',o:['A: To hear small sounds from far away well.','B: To let heat inside the body escape to the outside and keep the body cool.','C: To move the big ears like wings and fly in the sky.'],a:[1],why:'Big ears release extra heat and keep the fox cool: B.'},
{type:'blanks',src:'Try (2)',q:'Why are desert animals not very active during the day? Fill in the blanks.',ar:'ليه حيوانات الصحراء مش نشيطة قوي بالنهار؟ كمّلي الفراغات.',bank:['hot','holes','cold'],items:[['Because the sunlight is strong and it is very','hot','during the day in the desert,'],['animals often rest in cool','holes','in the ground or in the shade of rocks.']]},
{type:'mcq',src:'Exercise (1)',q:'Which of the following is NOT true about desert living organisms?',ar:'أنهي جملة مش صحيحة عن كائنات الصحراء؟',o:['A: Fennec foxes have fur on the soles of their feet to protect them from hot sand.','B: Mice in the desert often move around at night to avoid the heat.',"C: Desert plants spread many big, thin leaves so they don't lose water."],a:[2],why:'Desert plants have SMALL leaves to keep water, so C is not true.'},
{type:'blanks',src:'Exercise (2)',q:'Fill in the blank about the body feature of the jerboa.',ar:'كمّلي الفراغ عن جسم الجربوع.',bank:['big ears','back legs','thick fur'],items:[['The jerboa uses its long','back legs','to jump and move quickly, avoiding the hot ground.']]}])},
{t:'On paper',stars:2,svg:()=>notebook('Choose one desert animal. Write two ways','its body or its way of living helps it','survive in the hot desert.',U('jerboa',600,300,130,100)),
L:[["Here is a question for your notebook.","ده سؤال للكراسة."],["Choose one desert animal, and write two ways its body or its way of living helps it survive.","اختاري حيوان صحراوي، واكتبي حاجتين في جسمه أو طريقة عيشته بيساعدوه يعيش."]],
act:(el,K)=>K.paper(el,{key:'paper',src:'Point',q:'Choose one desert animal. Write two ways its body or its way of living helps it survive in the desert.',ar:'اختاري حيوان صحراوي واكتبي حاجتين بيساعدوه يعيش في الصحراء.',model:'Example: <b>Fennec fox.</b> 1) Its big ears release extra heat to keep it cool. 2) Thick fur on the soles of its feet protects them from the hot sand. (It is also active at night and rests in cool holes in the day.)',modelAr:'مثال: ثعلب الفنك: ودانه الكبيرة بتطلّع الحرارة، والفرو اللي تحت رجليه بيحميه من الرمل السخن.',checks:['the <b>name</b> of a desert animal?','<b>two</b> ways it survives (body or way of living)?']})},
{t:'The end',svg:()=>ending(desert(0,800)+U('fox',40,300,140,112)+U('jerboa',640,330,100,77),'Clever desert animals!'),
L:[["Great job! Desert animals have special bodies and clever ways of living.","برافو! حيوانات الصحراء ليها أجسام مميزة وطرق عيشة ذكية."]],
act:el=>sum(el,['<b>Fennec fox:</b> big ears release heat; thick fur on the soles protects from hot sand.','<b>Jerboa:</b> long back legs to jump quickly, touching the hot ground for a short time.','<b>Clever ways:</b> active at night; rest in cool holes in the day.','<b>Water:</b> camels drink a lot at once and store it; some animals get water from food.'])}
]});

/* ---------------- Enrichment ---------------- */
L.push({id:'1-E',title:'Enrichment: The Desert Cleaner',ar:'ركن الإثراء: منظّف الصحراء',pages:'24–25',scenes:[
{t:'Start',svg:()=>`${desert(0,800)}<path d="M40 404H760" stroke="#8a5a2a" stroke-width="2" stroke-dasharray="8 10" opacity=".5"/><g class="rollacross"><g transform="translate(96 330)"><g class="spinball">${U('dungball',0,0,80,80)}</g></g><g transform="translate(34 352) rotate(-115 35 28)">${U('beetle',0,0,70,56)}</g></g>
${title('The Desert Cleaner','the Scarab',400,460,40)}`,
L:[["In the history of Egypt, the most famous insect is the scarab, a dung beetle.","في تاريخ مصر، أشهر حشرة هي الجعران، وهو خنفساء الروث."],["Ancient Egyptian people treated this beetle with great care.","المصريين القدماء كانوا بيهتموا بالخنفساء دي جداً."],["But science shows it has an even more amazing job!","بس العلم بيقول إن ليه دور أروع كمان!"]]},
{t:'Guardian',svg:()=>`<rect width="800" height="230" fill="url(#gSkyDes)"/>${sun(700,70,.7)}<rect y="226" width="800" height="224" fill="url(#gSoilD)"/><rect y="226" width="800" height="10" fill="#c99a5a"/>${sandDots(0,240,800,200,50,8)}
<g data-r="1"><g transform="translate(150 150)">${U('dungball',0,0,80,80)}</g><g transform="translate(88 172) rotate(-115 35 28)">${U('beetle',0,0,70,56)}</g></g>
<g data-r="2"><path d="M400 236V300" stroke="#8a5a2a" stroke-width="4" stroke-dasharray="8 6"/><path d="M392 292l8 14l8-14Z" fill="#8a5a2a"/>${U('dungball',360,310,80,80)}${tag(400,420,'buried ball = plant food',300,'#8a5a2a','#fff',19)}</g>
<g data-r="3"><g class="sprout">${U('grass',320,192,90,45)}${U('sunflower',372,108,56,120)}${U('grass',436,198,70,35)}</g></g>
<g data-r="4">${tag(400,40,'Guardians of the environment!',380,'#3f9a3a','#fff')}</g>`,
L:[["Scarabs roll animal dung into balls, carry them, and bury them in the soil.","الجعران بيكوّر روث الحيوانات على شكل كور، ويشيلها ويدفنها في التربة."],["This gives the soil plant food, so plants can grow.","وده بيدّي التربة غذا للنبات، فالنباتات تكبر."],["It also helps prevent sickness, because less dung is left on the ground.","وكمان بيقلل الأمراض، لأن الروث مش بيفضل على الأرض."],["Scarabs are guardians of the environment!","الجعارين حُرّاس البيئة!"]]},
{t:'Star guide',svg:()=>`${night(0,800)}<g opacity=".55" filter="url(#glow)"><ellipse cx="400" cy="120" rx="460" ry="46" transform="rotate(-18 400 120)" fill="#c7c2ff"/></g>${stars(80,800,250,9)}${moon(120,70,.6)}${pyramids(420,300,1.1,'#3a3466','#2a2550')}<path d="M0 300Q400 270 800 304V450H0Z" fill="url(#gNDune)"/>
<path d="M40 400H760" stroke="#ffd166" stroke-width="3" stroke-dasharray="10 10" opacity=".7"/><g class="rollacross slow"><g transform="translate(96 330)"><g class="spinball">${U('dungball',0,0,80,80)}</g></g><g transform="translate(34 352) rotate(-115 35 28)">${U('beetle',0,0,70,56)}</g></g>
<g data-r="2">${tag(400,190,'the Milky Way shows the way',340,'#fff','#1d2563')}</g><g data-r="3">${tag(400,250,'a straight line!',200,'#ffd166','#1d2563')}</g>`,
L:[["Scientists found something amazing about scarabs.","العلماء اكتشفوا حاجة مدهشة عن الجعارين."],["At night, scarabs look at the light of the Milky Way to find their direction.","بالليل، الجعارين بتبص على نور درب التبانة علشان تعرف اتجاهها."],["So they can roll their balls in a straight line, to where they want to go!","وكده بتزق الكورة في خط مستقيم للمكان اللي عايزاه!"]]},
{t:'Quick check',stars:2,svg:()=>chalk('Enrichment corner — pages 24–25'),L:[["Two quick questions about the scarab.","سؤالين سريعين عن الجعران."]],
act:(el,K)=>K.quiz(el,'q',[
{type:'mcq',src:'Enrichment',q:'Why are scarabs called "guardians of the environment"?',ar:'ليه الجعارين اسمها حُرّاس البيئة؟',o:['They bury dung, which makes soil richer and keeps places clean.','They eat all the plants in the desert.','They sting other animals.'],a:[0],why:'Burying dung gives the soil plant food and helps prevent sickness.'},
{type:'mcq',src:'Enrichment',q:'What do scarabs use at night to find their direction?',ar:'الجعارين بتستخدم إيه بالليل علشان تعرف اتجاهها؟',o:['The sound of the wind','The light of the Milky Way','The smell of the river'],a:[1],why:'They use the light of the Milky Way, like a natural compass.'}])},
{t:'The end',svg:()=>ending(night(0,800)+moon(680,70,.6),'The scarab: a tiny guardian'),
L:[["Great job! If you find a scarab in the desert, watch it without getting in its way.","برافو! لو لقيتي جعران في الصحرا، اتفرجي عليه من غير ما تعطّليه."]],
act:el=>sum(el,['<b>Scarabs</b> roll dung into balls and bury them.','This makes the <b>soil richer</b> and helps <b>prevent sickness</b>.','At night they use the <b>Milky Way</b> to roll in a straight line.'])}
]});

(window.CHAPTERS=window.CHAPTERS||[]).push({n:1,title:'Nature in Our Surroundings',ar:'الطبيعة من حولنا',color:'#2e9d55',lessons:L});
})();
