export const GOODS = [
  {name:'Maple syrup',short:'Maple',color:'#ad6545',story:'A little amber sweetness from the sugarwoods.'},
  {name:'Orchard apple',short:'Apples',color:'#bd594b',story:'Crisp, bright, and picked for a slow afternoon.'},
  {name:'Farm milk',short:'Milk',color:'#6590a0',story:'A familiar favorite for the kitchen table.'},
  {name:'Vermont cheddar',short:'Cheddar',color:'#d49b42',story:'Just the thing for a picnic by the lake.'},
  {name:'Morning coffee',short:'Coffee',color:'#a5694e',story:'The first warm sip of a good little day.'},
  {name:'Blueberries',short:'Berries',color:'#727c9a',story:'A whole summer morning in a little carton.'},
  {name:'Butter croissant',short:'Croissants',color:'#c79851',story:'Flaky crumbs are part of the charm.'},
  {name:'Market flowers',short:'Flowers',color:'#9581a0',story:'A small bunch can change a whole room.'},
  {name:'Strawberry jam',short:'Jam',color:'#ba6655',story:'For toast, neighbors, and rainy-day breakfasts.'},
  {name:'Wool mitten',short:'Mittens',color:'#b85c4c',story:'One very warm reason to step outside.'},
  {name:'Local honey',short:'Honey',color:'#be9643',story:'A little thank-you from the garden.'},
  {name:'Sourdough loaf',short:'Bread',color:'#ab8259',story:'A crackly crust and a soft place to land.'},
  {name:'Harvest pumpkin',short:'Pumpkins',color:'#c6783e',story:'The front-step favorite of sweater season.'},
  {name:'Green pear',short:'Pears',color:'#89a153',story:'Patiently ripened, pleasantly imperfect.'},
  {name:'Pink lemonade',short:'Lemonade',color:'#d28585',story:'Best enjoyed with your feet up.'},
  {name:'Strawberry ice cream',short:'Ice cream',color:'#bc8291',story:'A scoop of the long way home.'},
  {name:'Evening candle',short:'Candles',color:'#8d7096',story:'A tiny light for the end of the day.'},
  {name:'Garden soap',short:'Soap',color:'#88a487',story:'Wrapped by hand, scented like a little garden.'},
  {name:'Pocket notebook',short:'Notebooks',color:'#7298ac',story:'For good ideas and little things to remember.'},
  {name:'Favorite book',short:'Books',color:'#b46257',story:'There is always time for one more page.'},
  {name:'Soft yarn',short:'Yarn',color:'#579a91',story:'A whole cozy project waiting to happen.'},
  {name:'Woodland mushroom',short:'Mushrooms',color:'#b76653',story:'A storybook treasure from the woodland shelf.'},
  {name:'Bakery pretzel',short:'Pretzels',color:'#ac754f',story:'A warm twist on the afternoon snack.'},
  {name:'Garden tea',short:'Tea',color:'#7e9980',story:'Let it steep. Everything else can wait.'},
];
export const THEMES = {
  market:{name:'The corner shop',short:'Corner shop',sign:'LOCALLY LOVED. LOVINGLY SORTED.',color:'#355b4c',wood:'#ddb385',palette:[0,1,2,3,6,7,5,8,10,4,11,9]},
  bakery:{name:'The morning bakery',short:'Morning bakery',sign:'WARM FROM THE OVEN. ALL YOURS.',color:'#88573f',wood:'#e2b582',palette:[4,6,11,22,8,2,10,0,15,1,23,5]},
  lakeside:{name:'The lakeside stand',short:'Lakeside stand',sign:'A LAKE BREEZE & A LITTLE EASE.',color:'#396878',wood:'#c6c4a4',palette:[5,14,15,1,3,0,13,7,22,4,10,2]},
  orchard:{name:'The orchard pantry',short:'Orchard pantry',sign:'A LITTLE HARVEST. A LOT OF HEART.',color:'#8a643e',wood:'#d4b17b',palette:[12,1,13,8,0,10,21,5,11,14,3,23]},
  workshop:{name:'The makers’ nook',short:'Makers’ nook',sign:'MADE SLOWLY. MADE WITH LOVE.',color:'#78627f',wood:'#c7b6a5',palette:[20,19,18,9,16,17,7,23,4,10,0,13]},
  garden:{name:'The garden room',short:'Garden room',sign:'ROOM TO GROW. TIME TO BLOOM.',color:'#577750',wood:'#b9c6a1',palette:[7,23,17,21,10,16,13,5,14,8,20,1]},
};
export const MECHANICS = {
  classic:{name:'Open shelves',icon:'☀',description:'Tap three of a kind. Empty a front row to reveal the goods behind it.'},
  locked:{name:'Ribbon shelves',icon:'⌑',description:'Ribbon-wrapped shelves open after the number of matches shown. Sort the open shelves first.'},
  frosted:{name:'Frosted stock',icon:'❄',description:'The next row is hidden by frosted glass. Clear the front row to discover it.'},
  conveyor:{name:'Conveyor shelves',icon:'⇄',description:'Marked shelves trade their front rows after every match. Watch what comes around.'},
};
export const CHAPTERS = [
  {name:'Hello, neighbor',place:'THE CORNER SHOP',theme:'market',line:'Every lovely thing starts with a little room.',mechanics:[],icon:'☀'},
  {name:'Before the town wakes',place:'THE MORNING BAKERY',theme:'bakery',line:'Warm loaves, fresh coffee, and a new little rhythm.',mechanics:['locked'],icon:'☕'},
  {name:'The long way to the lake',place:'THE LAKESIDE STAND',theme:'lakeside',line:'Take the scenic route. The shelves can wait.',mechanics:['conveyor'],icon:'≋'},
  {name:'Sweater weather',place:'THE ORCHARD PANTRY',theme:'orchard',line:'A crisp morning and a pocket full of autumn.',mechanics:['frosted'],icon:'❋'},
  {name:'Made by hand',place:'THE MAKERS’ NOOK',theme:'workshop',line:'Little projects. Lovely possibilities.',mechanics:['locked','conveyor'],icon:'✂'},
  {name:'Room to bloom',place:'THE GARDEN ROOM',theme:'garden',line:'Let a little more color into the day.',mechanics:['frosted','locked'],icon:'✿'},
  {name:'Saturday on Church Street',place:'THE CORNER SHOP',theme:'market',line:'A familiar place, with a few new surprises.',mechanics:['conveyor','locked'],icon:'⌂'},
  {name:'One more pastry',place:'THE MORNING BAKERY',theme:'bakery',line:'The good kind of an extra helping.',mechanics:['frosted','conveyor'],icon:'☕'},
  {name:'A Champlain afternoon',place:'THE LAKESIDE STAND',theme:'lakeside',line:'Blue water. Long afternoons. A little perspective.',mechanics:['locked','frosted','conveyor'],icon:'≋'},
  {name:'The harvest gathering',place:'THE ORCHARD PANTRY',theme:'orchard',line:'There is always room for one more at the table.',mechanics:['locked','conveyor'],icon:'❋'},
  {name:'Windows full of light',place:'THE MAKERS’ NOOK',theme:'workshop',line:'Something small and beautiful, just because.',mechanics:['frosted','locked','conveyor'],icon:'✧'},
  {name:'The neighborhood in bloom',place:'THE GARDEN ROOM',theme:'garden',line:'Look at all the lovely things you made room for.',mechanics:['frosted','conveyor','locked'],icon:'✿'},
];
export const LEVEL_COUNT=600;
const TITLES=['A fresh delivery','A little breathing room','The familiar favorites','Something tucked away','An afternoon errand','Good things in threes','A thoughtful little turn','The scenic route','A place for everything','The big Saturday sort'];
export function levelSpec(id){
  id=Math.min(LEVEL_COUNT,Math.max(1,Math.trunc(Number(id)||1)));
  const chapterIndex=Math.floor((id-1)/50),chapter=CHAPTERS[chapterIndex],local=(id-1)%50+1;
  const milestone=local%10===0,types=Math.min(12,4+Math.floor(local/9)+Math.floor(chapterIndex/3));
  const matches=id<=3?6:id<=8?9:milestone?24:12+3*Math.floor(Math.min(local-1,40)/15);
  const mechanics=chapter.mechanics.filter((_,i)=>local>=1+i*8);
  return {id,chapterIndex,local,name:TITLES[(local-1)%10],theme:chapter.theme,types,matches,shelfCount:6,mechanics,
    locks:mechanics.includes('locked')?(local>25?2:1):0,lockMatches:local>35?3:2,
    conveyor:mechanics.includes('conveyor')?2+(local>30?2:0):0,
    frost:mechanics.includes('frosted')?2+(local>25?2:0):0,
    chainGoal:Math.min(8,Math.max(3,Math.floor(matches/3))),order:local%5===0,milestone};
}
export const ACHIEVEMENTS = [
  {id:'first',name:'A fresh start',icon:'☀',description:'Finish your first delivery.',stat:'completed',goal:1},
  {id:'neighbor',name:'Hello, neighbor',icon:'⌂',description:'Finish 10 deliveries.',stat:'completed',goal:10},
  {id:'regular',name:'A familiar face',icon:'♡',description:'Finish 50 deliveries.',stat:'completed',goal:50},
  {id:'local',name:'A true local',icon:'✿',description:'Finish 100 deliveries.',stat:'completed',goal:100},
  {id:'century',name:'The little things',icon:'✳',description:'Make 100 matches.',stat:'totalMatches',goal:100},
  {id:'thousand',name:'Room for a thousand',icon:'✧',description:'Make 1,000 matches.',stat:'totalMatches',goal:1000},
  {id:'many',name:'Beautifully sorted',icon:'❋',description:'Make 5,000 matches.',stat:'totalMatches',goal:5000},
  {id:'chain3',name:'Finding a rhythm',icon:'♫',description:'Make a chain of 3.',stat:'bestCombo',goal:3},
  {id:'chain8',name:'In the lovely zone',icon:'♬',description:'Make a chain of 8.',stat:'bestCombo',goal:8},
  {id:'chain15',name:'A perfect little flow',icon:'∞',description:'Make a chain of 15.',stat:'bestCombo',goal:15},
  {id:'perfect',name:'All on your own',icon:'☆',description:'Clear a delivery without assists.',stat:'perfect',goal:1},
  {id:'perfect10',name:'A thoughtful touch',icon:'★',description:'Make 10 unassisted clears.',stat:'perfect',goal:10},
  {id:'daily1',name:'A daily little ritual',icon:'☀',description:'Complete a Daily sort.',stat:'dailyDays',goal:1},
  {id:'daily7',name:'Seven little mornings',icon:'☀',description:'Complete Daily sorts on 7 dates.',stat:'dailyDays',goal:7},
  {id:'rush',name:'A little hustle',icon:'ϟ',description:'Finish a timed Rush.',stat:'rushWins',goal:1},
  {id:'rush10',name:'Quick and cozy',icon:'ϟ',description:'Finish 10 timed Rush deliveries.',stat:'rushWins',goal:10},
  {id:'pantry',name:'The big tidy',icon:'▦',description:'Clear a 144-good Grand Pantry.',stat:'pantryWins',goal:1},
  {id:'trail10',name:'Around the block',icon:'↗',description:'Clear 10 different Trail levels.',stat:'trailWins',goal:10},
  {id:'trail50',name:'Part of the neighborhood',icon:'⌂',description:'Clear 50 different Trail levels.',stat:'trailWins',goal:50},
  {id:'trail200',name:'The scenic route',icon:'≋',description:'Clear 200 different Trail levels.',stat:'trailWins',goal:200},
  {id:'trail600',name:'Every corner, a memory',icon:'♔',description:'Clear all 600 Trail levels.',stat:'trailWins',goal:600},
  {id:'orders',name:'A thoughtful neighbor',icon:'♡',description:'Fulfill 10 optional customer orders.',stat:'orders',goal:10},
  {id:'collector',name:'A little of everything',icon:'❋',description:'Sort all 24 kinds of goods.',stat:'uniqueGoods',goal:24},
  {id:'stars',name:'A sky full of little stars',icon:'★',description:'Earn 100 Trail stars.',stat:'trailStars',goal:100},
];
export const DECOR = [
  {id:'home',name:'A sunny morning',description:'A familiar little place to begin.',requirement:0,icon:'☀'},
  {id:'rain',name:'Rain on the windows',description:'A soft rainy-day mood, earned after 3 deliveries.',requirement:3,icon:'☂'},
  {id:'golden',name:'The golden hour',description:'Amber afternoon light, earned after 8 deliveries.',requirement:8,icon:'✧'},
  {id:'evening',name:'One more chapter',description:'A warm evening palette, earned after 15 deliveries.',requirement:15,icon:'☾'},
];
export function achievementProgress(profile,a){const value=Number(profile[a.stat]||0);return {value:Math.min(value,a.goal),earned:value>=a.goal,percent:Math.min(100,value/a.goal*100)};}
