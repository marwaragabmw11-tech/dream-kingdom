/* English version of the lessons in learn.js (same order).
   The Arabic text stays in learn.js and shows when Amina taps the ع button.
   pic is given only where the Arabic picture had Arabic words in it. */
window.LEARN_EN = [
/* u1 Place Value */
[
{story:'Imagine, Amina, that numbers are a family living in a building 🏢. Every floor has a name: the ground floor is <b>Ones</b>, the one above is <b>Tens</b>, then <b>Hundreds</b>… And the building is split into big flats: the Ones flat, the <b>Thousands</b> flat and the <b>Millions</b> flat. The same 7 is very rich on a high floor (700,000), and just 7 on the ground floor!',
pic:'<div class="pv" dir="ltr"><div class="pvg m"><b>Millions</b><span>H</span><span>T</span><span>O</span><i></i><i>1</i><i>3</i></div><div class="pvg t"><b>Thousands</b><span>H</span><span>T</span><span>O</span><i class="hl">7</i><i>0</i><i>5</i></div><div class="pvg o"><b>Ones</b><span>H</span><span>T</span><span>O</span><i>8</i><i>6</i><i>2</i></div></div><p class="cap">13,705,862 → the 7 lives in <b>hundred thousands</b> = 700,000</p>',
steps:['Write the number and put a comma (,) after every 3 digits from the right.','Each group of 3 digits = a flat: from the right Ones, then Thousands, then Millions.','Inside each flat: from the right O (ones), then T (tens), then H (hundreds).','Value of a digit = the digit × its place. For example, 7 in hundred thousands = 700,000.'],
trick:'Count the digits to the right of your digit: if there are 5 → put 5 zeros after it! 13,<b>7</b>05,862: there are 5 digits after the 7 → 700,000 ✨',
tryS:['2 | 485 | 103','The 4 is the first digit of the Thousands flat → hundred thousands','Its value is 400,000']},
{story:'A number is like a cake 🎂: you can serve it whole (<b>Standard form</b>: 3,452), describe it in words (<b>Word form</b>: three thousand four hundred fifty-two), or cut it into pieces (<b>Expanded form</b>: 3,000 + 400 + 50 + 2). The very same cake, served in different ways!',
steps:['Expanded: write each digit with its value (the digit plus as many zeros as there are digits to its right).','A zero gets no piece — we leave it out.','Word: read each flat on its own and say its name: million… thousand… then the rest.'],
trick:'In word form, read each flat like a normal 3-digit number, then say its name. 405,000 = four hundred five <b>thousand</b>.',
tryS:['6 → 6,000 | 0 → nothing | 7 → 70 | 5 → 5','6,000 + 70 + 5']},
{story:'Comparing is like a race 🏃‍♀️: first, who has more digits (is longer)? That one is greater. Same length? Compare digit by digit from the left — the first one to win, wins the race!',
pic:'<div class="cmp" dir="ltr"><div>7<b class="hl">4</b>,423</div><div class="sign">&gt;</div><div>7<b class="hl2">2</b>,734</div></div><p class="cap">7 is the same as 7… but 4 is greater than 2 → the first number wins 🏆</p><p class="cap">🐊 The crocodile eats the bigger number: its open mouth faces the greater number &gt;</p>',
steps:['Count the digits: the longer number is greater.','Same length: compare from the left (the biggest place), digit by digit.','The first difference decides which is greater.','Ascending = smallest to greatest ⬆ , Descending = greatest to smallest ⬇'],
trick:'Write the numbers under each other (each place under its place) and move your finger from left to right. 👆',
tryS:['5 = 5','0 < 8 → 580,137 is greater']},
{story:'Rounding is like telling your friend “it’s about 5 o’clock” instead of “4:58”. The number stands on a hill ⛰️: if it passed the middle it slides forward (rounds up); if it didn’t reach the middle it slides back (rounds down).',
pic:'<div class="nl" dir="ltr"><span>3,000</span><div class="line"><i style="left:72%" class="dot">3,720</i><i style="left:50%" class="mid">3,500</i></div><span>4,000</span></div><p class="cap">3,720 is closer to 4,000 → we round it to 4,000</p>',
steps:['Underline the place we round to (for example, the thousands).','Look only at its neighbour on the right.','5 or more → add one to that place. Less than 5 → leave it.','Everything on the right becomes zeros.'],
trick:'Magic sentence: <b>“5 and above… go up! 4 and below… stay down!”</b> 🎵',
tryS:['The thousands digit is 7','The neighbour (hundreds) = 6 → 5 or more → round up','48,000']}
],
/* u2 Addition & Subtraction */
[
{story:'Imagine you’re filling cupcake boxes 🧁, and each box holds exactly 10. If you have 13 cupcakes → one full box (10) and 3 left over. That full box is the “carry” we send to the next place 🎒.',
pic:'<div class="colx" dir="ltr"><div class="cr">1</div><div>2,4<b>5</b>8</div><div>+ 1,3<b>7</b>6</div><div class="ln">3,834</div></div><p class="cap">8 + 6 = 14 → write 4 and carry 1 🎒</p>',
steps:['Write the two numbers under each other, each place under its place.','Start from the right (Ones).','If the sum is 10 or more: write the ones and carry the 1 to the next place.','Keep going to the last place.'],
trick:'Without paper: 2,458 + 1,376 → 2,458 + 1,400 = 3,858, then take away the extra 24 = 3,834 🧠. But in the exam, write the recipe so your teacher can see how clever you are!'},
{story:'If you want to give your friend 7 cookies 🍪 and you only have 3, you go to your neighbour (the next place) and open a box of 10. Now you have 13 and can give 7. But the neighbour now has one less!',
pic:'<div class="colx" dir="ltr"><div class="cr">4 13</div><div>5,2<s>5</s><s>3</s></div><div>− 1,1 2 7</div><div class="ln">4,126</div></div><p class="cap">3 is less than 7 → regroup: 13 − 7 = 6, and the 5 becomes 4</p>',
steps:['Start from the right.','If the top digit is smaller than the bottom one → borrow 10 from the neighbour (the neighbour loses 1).','Is the neighbour zero? It borrows from the next one too (and the zero becomes 9).','Check by adding: the answer + the number we subtracted = the big number.'],
trick:'Fast mental subtraction: 5,000 − 1,236? Think 4,999 − 1,236 = 3,763, then add 1 = 3,764 ✨ (no regrouping at all!)'},
{story:'🍓+🍌 in the blender = 🍌+🍓 → the same juice! That’s <b>Commutative</b> (we swap places). If you have 3 fruits, mix any two first → same juice. That’s <b>Associative</b> (we move the brackets). And if you add “nothing” (0), the juice stays the same → <b>Additive identity</b>.',
steps:['Did the numbers swap places? → Commutative','Did the brackets move? → Associative','Is there a + 0? → Additive identity'],
trick:'Look for numbers that make 10 or 100 together and add them first: 37 + 18 + 63 = (37 + 63) + 18 = 100 + 18 = 118 🎯',
tryS:['45 + 55 = 100','100 + 27 = 127']},
{story:'Before you cook, you say “I need about a kilo of flour”, not “987 grams”. Estimating tells us the answer “roughly” before we calculate, so we can catch our mistakes.',
steps:['Round each number to the nearest thousand (or what is asked).','Add/subtract the rounded numbers.','Compare with the real answer: are they close? Then it’s fine.'],
trick:'Estimation = a “mistake detector” 🔍. If the real answer is very far from the estimate, there must be a mistake.',
tryS:['7,620 → 8,000','2,410 → 2,000','8,000 − 2,000 = 6,000']},
{story:'A <b>Bar model</b> is like a chocolate bar 🍫: the whole bar = the whole, split into pieces. If we know the whole and one piece → the other piece = whole − piece. If we know both pieces → the whole = add them. And a letter (like X or b) is just a “closed box” with a hidden number inside 📦.',
steps:['Draw a long bar = the whole.','Split it into pieces and write what you know.','Put X in place of the unknown.','Is the unknown the whole? Add. Is it a piece? Subtract.'],
trick:'One question solves everything: <b>“Am I looking for the whole or a piece?”</b> Whole → ➕ , piece → ➖'}
],
/* u3 Measurement */
[
{story:'An ant 🐜 walks in mm, we measure a pencil in cm, a room in m, and the trip to the club in km. The bigger the unit, the fewer of them we need.',
steps:['From a big unit to a small one → multiply (the number gets bigger).','From a small unit to a big one → divide (the number gets smaller).','6 m 32 cm = 600 + 32 = 632 cm'],
trick:'“The big one breaks into lots of small ones” → like one pound breaks into 100 piasters 🪙. Big → small = ×',
tryS:['5 m = 500 cm','500 + 40 = 540 cm']},
{story:'In the kitchen 👩‍🍳: a bag of flour 1 kg = 1,000 g, and a big glass of milk 1 L = 1,000 mL. So kg and L are sisters — both break into 1,000.',
steps:['kg → g: multiply by 1,000','g → kg: divide by 1,000','If there are kg and g together: change the kg to g and add.'],
trick:'The word <b>kilo</b> means “thousand” → kilogram = a thousand grams, kilometer = a thousand meters 🔑',
tryS:['3 L = 3,000 mL','3,000 + 250 = 3,250 mL']},
{story:'The cake 🎂 went into the oven at 4:35 and needs 55 minutes. When will it come out? We add the minutes, and if they pass 60 → it’s a new hour!',
pic:'<div class="tl" dir="ltr"><span>4:35</span><i>+25 min</i><span>5:00</span><i>+30 min</i><span>5:30</span></div><p class="cap">We split the 55 into 25 (to reach a whole hour) + 30</p>',
steps:['1 hour = 60 minutes','First add minutes up to the whole hour.','Then add the rest.','Elapsed time = end − start.'],
trick:'“Jump to the round hour” 🐸: from 4:35 to 5:00 = 25 minutes, and then the rest is easy.',
tryS:['2:50 + 10 = 3:00','15 left → 3:15']}
],
/* u4 Perimeter & Area */
[
{story:'If you want to build a fence around the bunny garden 🐰, the length of the whole fence is the perimeter. We walk around the shape and add all the sides.',
pic:'<div class="rect" dir="ltr"><span class="w">7 cm</span><span class="h">4 cm</span></div><p class="cap">Perimeter = 7 + 4 + 7 + 4 = 22 cm or (7 + 4) × 2</p>',
steps:['Rectangle: (length + width) × 2','Square: side × 4','A strange shape? Walk around it and add every side (find the missing sides first).'],
trick:'Put your finger on a corner and walk around 🖐️, marking every side you pass so you don’t forget any.',
tryS:['9 × 4 = 36 cm']},
{story:'Area is how much of the floor a carpet 🧶 covers. We count it in little squares (cm²). A 5 × 3 rectangle has 3 rows of 5 squares = 15.',
steps:['Rectangle: length × width','Square: side × side','The unit always has ² (cm²)'],
trick:'Perimeter = <b>fence</b> (we add) 🧱 , Area = <b>carpet</b> (we multiply) 🧶',
tryS:['8 × 6 = 48 cm²']},
{story:'A strange shape is like a sandwich cut into two pieces 🥪. Split it into rectangles, find the area of each piece, and add them.',
pic:'<div class="figw"><svg class="fig" viewBox="0 0 300 200"><polygon points="20,20 262,20 262,64 196,64 196,152 86,152 86,64 20,64" class="shape"/><line x1="86" y1="64" x2="196" y2="64" stroke-dasharray="6 5" class="cut"/><text x="141" y="45" text-anchor="middle">A</text><text x="141" y="110" text-anchor="middle">B</text></svg></div><p class="cap">Area = A + B</p>',
steps:['Draw a line that splits the shape into two rectangles.','Find the length and width of each rectangle (you may subtract to find a missing side).','Find each area and add.'],
trick:'A missing side? “long − short” 🔎',
tryS:['6 × 2 = 12','3 × 4 = 12','12 + 12 = 24 cm²']}
],
/* u5 Multiplication */
[
{story:'The cat 🐱 has 3 balls, and the dog 🐶 has “4 times as many” — 4 times what she has → 4 × 3 = 12 balls. “times” always means ✖️.',
steps:['“… times as many” → multiply.','“… is how many times …” → divide the big number by the small one.','Write the equation with a letter for the unknown: n = 4 × 3'],
trick:'“times” = ✖️ and “more than” = ➕. Watch the word! 👀',
tryS:['5 × 8 = 40']},
{story:'Just like addition: 3 rows × 5 cookies = 5 rows × 3 cookies (<b>Commutative</b>). We can multiply any two first (<b>Associative</b>). Anything × 1 = itself, and anything × 0 = zero.',
steps:['Commutative: 6 × 4 = 4 × 6','Associative: (2 × 5) × 7 = 2 × (5 × 7)','Look for 2 × 5 = 10 or 4 × 25 = 100 and multiply them first.'],
trick:'2 × 5 = 10 🤝 friends. 4 × 25 = 100 🤝 friends. Always look for them!',
tryS:['2 × 5 = 10','10 × 9 = 90']},
{story:'Zeros are like bus passengers 🚌: they get off first, we multiply the small numbers, then they all get back on!',
steps:['Take off the zeros.','Multiply the digits that are left.','Put all the zeros back at the end of the answer.'],
trick:'40 × 50 → 4 × 5 = 20, then put back two zeros = 2,000 (the zero in 20 belongs to the multiplication, it’s not a passenger!) 😉',
tryS:['7 × 8 = 56','Put back two zeros → 5,600']}
],
/* u6 Factors & Multiples */
[
{story:'Factors are the numbers we multiply together to make the number. Just like 12 chocolate pieces can be arranged 1×12, 2×6 or 3×4. We join each pair with an arc 🌈!',
steps:['Start with 1 and the number itself.','Try 2, 3, 4… does it divide with no remainder? Write it and its partner.','When the partners meet in the middle → you’re done!'],
trick:'Is the number even? Then 2 is surely a factor. Does it end in 0 or 5? Then 5 is a factor ✋',
tryS:['1 × 18 , 2 × 9 , 3 × 6','1, 2, 3, 6, 9, 18']},
{story:'A <b>Prime</b> number is like a lonely cat 🐈 with only two friends: 1 and itself (like 7). A <b>Composite</b> number has lots of friends (like 12).',
steps:['Write the factors of the number.','Only two factors → Prime.','More than two factors → Composite.','1 is neither prime nor composite!'],
trick:'2 is the only even prime number 🦄',
tryS:['15 = 3 × 5 → factors: 1, 3, 5, 15','More than 2 → Composite']},
{story:'Multiples are the times table itself! Multiples of 4: 4, 8, 12, 16… like a cat that hops 4 steps each time 🐈. A common multiple = a spot where the cat and the rabbit 🐇 both land.',
steps:['Write the times table of the first number.','Write the times table of the second number.','Find the numbers that are in both.','“between 5 and 40” means greater than 5 and less than 40.'],
trick:'If the big number is in the small number’s table (like 8 and 4), then all multiples of the big one are common! 🎁',
tryS:['10, 20, 30']}
],
/* u7 Multiply & Divide */
[
{story:'Want to multiply 36 × 7? Cut 36 into 30 and 6 (like cutting a pizza 🍕). Multiply each piece by 7 and add.',
steps:['Break the big number apart (30 + 6).','Draw a rectangle split into pieces.','Multiply each piece.','Add the pieces.'],
trick:'That’s exactly what your brain does on its own! The model just lets your teacher see how your brain thinks 🧠✨'},
{story:'The same pizza idea, but written on one line (<b>Distributive</b>): 246 × 2 = (200 × 2) + (40 × 2) + (6 × 2). Or under each other (<b>Partial products</b>).',
steps:['Break the number apart by place value.','Multiply each piece (zeros are bus passengers 🚌).','Add.'],
trick:'Quick estimate first: 375 × 4 ≈ 400 × 4 = 1,600 → the answer must be close to it 🔍'},
{story:'Before we buy 6 toys at 275 pounds each 🧸, we quickly say: about 6 × 300 = 1,800. “Using the first digit on the left”: 275 → 200, so 6 × 200 = 1,200.',
pic:'<div class="three" dir="ltr"><div>673 × 4</div><div>600 × 4</div><div>= 2,400</div></div><p class="cap">“first digit on the left” → keep the first digit and make the rest zeros</p>',
steps:['Keep the first digit on the left and turn the rest into zeros.','Multiply.','This is an estimate, not the real answer.'],
trick:'Notice: the book asks for the “first digit”, not normal rounding. 875 → 800 (not 900!) ⚠️',
tryS:['528 → 500','500 × 7 = 3,500']},
{story:'You have 784 sweets 🍬 and want to share them equally into 7 boxes. Start with an easy piece: 700 ÷ 7 = 100 in each box, then the rest 84 ÷ 7 = 12. So each box gets 112!',
steps:['Break the number into easy pieces that divide by the divisor (700 + 84).','Divide each piece.','Add the answers.','Check by multiplying: 112 × 7 = 784 ✔'],
trick:'Look for a “round” piece from the times table: to divide by 6 → 600, 360, 180, 60… 🎯',
tryS:['600 ÷ 3 = 200','90 ÷ 3 = 30','6 ÷ 3 = 2','232']},
{story:'17 cookies for 5 children 🍪: each child gets 3 (= 15) and 2 are left. Those 2 are the <b>Remainder</b>. And the remainder must always be smaller than the number of children!',
steps:['Find the biggest number in the divisor’s table that is less than or equal to the number.','The difference is the remainder.','In story problems: if people are left who need a car → add one more car!'],
trick:'“The remainder is smaller than the divisor” — always. If it’s bigger, you can divide again 🔁',
tryS:['4 × 7 = 28','29 − 28 = 1 → 7 R 1']}
],
/* u8 Order of Operations */
[
{story:'In a recipe 👩‍🍳 we add the eggs before the oven, not the other way round! Maths has an order too: <b>( )</b> first, then <b>× ÷</b> (left to right), and last <b>+ −</b> (left to right).',
pic:'<div class="order"><div>1️⃣ ( ) brackets</div><div>2️⃣ × ÷ multiply and divide</div><div>3️⃣ + − add and subtract</div></div><p class="cap" dir="ltr">2 + 4 × 6 = 2 + 24 = 26 (not 36!)</p>',
steps:['Find the brackets and solve them.','Circle every × and ÷ and solve them from left to right.','Then do + and − from left to right.'],
trick:'Colour × and ÷ red 🔴 and + and − blue 🔵. Red is always solved first!',
tryS:['3 × 4 = 12','20 − 12 = 8']},
{story:'A story problem is like a detective puzzle 🕵️‍♀️: we read, pick out the “clues” (the numbers), find what is “wanted”, and decide which operation each step needs.',
pic:'<div class="order"><div>🔍 Read the problem twice</div><div>✏️ Colour the numbers and the question</div><div>🧠 Step 1, step 2…</div><div>✅ Does the answer make sense?</div></div>',
steps:['“each / equally” → divide or multiply.','“left / remaining” → subtract.','“in all / total” → add or multiply.','Write each step on its own, then the answer with its unit.'],
trick:'Draw the problem! A little drawing makes the puzzle very clear 🎨',
tryS:['50 − 2 = 48','48 ÷ 6 = 8']}
]
];
