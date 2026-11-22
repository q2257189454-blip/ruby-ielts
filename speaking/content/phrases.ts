import type {Part} from "../components/speaking/types";

interface Expression {
  phrase:string; meaning:string; example:string; translation:string;
}
interface Group {
  name:string; parts:Part[]; use:string; phrases:Expression[]; practice:[string,string,string];
}
const expression=(phrase:string,meaning:string,example:string,translation:string):Expression=>({phrase,meaning,example,translation});
export const phraseGroups:Group[]=[
  {
    name:"喜好和例外",parts:["p1","p3"],use:"先说通常喜欢什么，再给一个具体的选择或例外。",
    practice:["topic","p1-shopping","购物"],
    phrases:[
      expression("I have a soft spot for …","我特别喜欢……","I have a soft spot for second-hand bookstalls where the owner writes little notes about the books.","我特别喜欢那种卖二手书的小摊，摊主还会给书写几句小评语。"),
      expression("I'd usually go for …","我一般会选……","I'd usually go for a seat on the upper deck if the bus was crossing the river.","如果坐的那辆公交车要过河，我一般会选上层的座位。"),
      expression("The one exception is …","有一种情况例外……","I rarely write letters these days. The one exception is a close friend's birthday.","我现在很少写信了，只有一个例外，就是好朋友过生日的时候。"),
    ],
  },{
    name:"频率和日常习惯",parts:["p1","p2"],use:"交代多久做一次，再讲它怎么融进你的一天。",
    practice:["topic","p1-mornings","早晨"],
    phrases:[
      expression("Most mornings, I …","大多数早晨我会……","Most mornings, I listen to the weather forecast while I make breakfast.","大多数早晨，我会边做早饭边听天气预报。"),
      expression("Whenever I get a chance, I …","一有机会，我就……","Whenever I get a chance, I try a new snack on my way home.","一有机会，我就会在回家的路上尝一种没吃过的小吃。"),
      expression("I tend to … when …","每当……，我通常会……","I tend to wear headphones when I practise English at home.","我在家练英语时一般会戴耳机。"),
    ],
  },{
    name:"过去和现在",parts:["p1","p2","p3"],use:"把同一件事在两个时间点的样子说清楚。",
    practice:["topic","p1-work-study","学习与近况"],
    phrases:[
      expression("I used to … quite a bit.","我以前经常……","I used to write things out by hand quite a bit, especially before exams.","我以前常常动笔把东西一字一句写下来，尤其是在考试前。"),
      expression("These days, I'm more likely to …","现在我更可能……","These days, I'm more likely to type a note on my phone.","现在，我更习惯在手机上打字记点东西。"),
      expression("That changed when …","后来因为……有了变化。","That changed when I joined a gardening club and wanted to keep a note of what I'd planted each week.","后来我加入了一个园艺小组，想记下每周种过哪些东西，这个习惯就变了。"),
    ],
  },{
    name:"介绍一个人",parts:["p2"],use:"从两个人的关系说起，用一个小动作写出对方的性格。",
    practice:["p2","p2-10","小时候教我一项技能的人"],
    phrases:[
      expression("The person who comes to mind is …","我首先想到的人是……","The person who comes to mind is Ryan, a friend who showed me how to fold a paper boat when we were children.","我首先想到的是朋友 Ryan，小时候是他教我折纸船的。"),
      expression("What I remember most about him is …","说到他，我印象最深的是……","What I remember most about him is the way he unfolded his own boat so I could see which corner to start with.","我对他印象最深的是，他把自己折好的船展开，好让我看清楚应该从哪个角开始折。"),
      expression("She's the kind of person who …","她是那种会……的人。","My friend Maggie is a good example. She's the kind of person who notices when someone at the table hasn't had a turn to speak.","我的朋友 Maggie 就是个好例子。她会留意到同桌的人里还有谁一直没机会开口。"),
    ],
  },{
    name:"把经历讲下去",parts:["p2"],use:"给听众一个场景，从中挑一个有变化的时刻。",
    practice:["p2","p2-06","和朋友度过的愉快夜晚"],
    phrases:[
      expression("It all started when …","事情是从……开始的。","It all started when a few neighbours suggested selling our spare books to raise money for the community centre.","事情是从几位邻居提议把闲置书拿出来义卖、给社区中心筹点钱开始的。"),
      expression("Just as we were about to …","就在我们正要……的时候","Just as we were about to pack up the books, a child asked if she could read her favourite page aloud.","就在我们正要把书收起来时，一个孩子问能不能把自己最喜欢的那一页读给大家听。"),
      expression("By the time we …, …","等到我们……的时候，已经……","By the time we closed the doors, three more people had read a favourite passage to the group.","等我们关门时，又有三个人给大家读了自己喜欢的段落。"),
    ],
  },{
    name:"把地点讲具体",parts:["p1","p2"],use:"说清它在什么位置，再挑一处能让人想象出来的细节。",
    practice:["p2","p2-31","一座高楼"],
    phrases:[
      expression("It's a short walk from …","从……走一小段路就到了。","It's a short walk from the bus stop, so we meet there even on rainy days.","从公交站走一小段路就到，所以就算下雨，我们也会约在那里见面。"),
      expression("The first thing you notice is …","你最先会注意到……","The first thing you notice is the big clock above the entrance. You can see it from the bridge.","最先映入眼帘的是入口上方的大钟，站在桥上就能看见。"),
      expression("My favourite spot is …","我最喜欢的是……这个地方。","My favourite spot is the upstairs balcony, where you can watch the little boats turn around.","我最喜欢楼上的阳台，站在那里可以看小船掉头。"),
    ],
  },{
    name:"描述书、电影和物件",parts:["p1","p2"],use:"说一个具体细节，接着解释它为什么对你重要。",
    practice:["p2","p2-36","一部让我失望的电影"],
    phrases:[
      expression("The part that stayed with me was …","我一直记得的部分是……","The part that stayed with me was the scene where two sisters finally opened their mother's letter.","我一直记得的是姐妹俩终于拆开母亲来信的那一幕。"),
      expression("I had expected …","我原本期待……","I had expected the film to spend more time on why the older sister kept the letter a secret.","我原本以为电影会多花些时间讲清楚，姐姐为什么一直瞒着那封信的事。"),
      expression("I still use it to …","现在我还用它来……","A neighbour once gave me a pocket notebook. I still use it to write down books I want to borrow.","以前有位邻居送过我一本口袋大小的笔记本，我现在还用它来记想借的书。"),
    ],
  },{
    name:"讲困难、行动和结果",parts:["p2","p3"],use:"点明卡在哪里、具体做了什么，以及如何知道事情有了进展。",
    practice:["p2","p2-50","解决一个技术问题"],
    phrases:[
      expression("The tricky part was …","比较棘手的是……","The tricky part was printing the poster without cutting off the date at the bottom.","难的是得把海报印出来，又不能把底部的日期截掉。"),
      expression("I tried … first, then …","我先试了……，接着……","I tried a smaller print size first, then printed a draft to check that the whole date was visible.","我先试着缩小打印尺寸，再打印一份草稿，看看日期能不能完整显示。"),
      expression("I knew it had worked when …","当我看到……，我知道成功了。","I knew it had worked when I held up the print and could see a clear border on all four sides.","我举起打印出来的海报，看见四边都留出了清楚的空白，就知道办法奏效了。"),
    ],
  },{
    name:"感受与回顾",parts:["p1","p2"],use:"用一个动作或后来的改变说明感受。",
    practice:["p2","p2-53","团队合作"],
    phrases:[
      expression("I felt relieved when …","……的时候我松了一口气。","I felt relieved when the last box of donated books was in place before the doors opened.","赶在开门前放好最后一箱捐来的书，我总算松了口气。"),
      expression("Looking back, I'm glad I …","回头看，我庆幸自己……","Looking back, I'm glad I asked two volunteers to help sort the books by age group.","现在回想起来，我很庆幸当时请了两名志愿者帮忙，按适读年龄给书分类。"),
      expression("It's something I still …","直到现在，我还会……","We finished on time because everyone did one small job. It's something I still remember whenever I organise an event.","大家各自负责一件小事，所以我们按时完成了。现在每次组织活动，我都还记得这件事。"),
    ],
  },{
    name:"解释原因，给出例子",parts:["p1","p3"],use:"一个理由配一个小场景，最后说出它带来的结果。",
    practice:["p3","p3-af12c101db","为什么有些人存不下钱"],
    phrases:[
      expression("One reason is that …","其中一个原因是……","One reason is that small payments are easy to forget when you use your phone.","一个原因是，用手机付钱时，那些零零碎碎的小额支出很容易被忘掉。"),
      expression("Take …, for example.","就拿……举例。","Take lunch, for example. Ordering a drink with it every day can cost quite a bit over a month.","就拿午饭来说，如果每天都顺便点一杯饮料，一个月下来也是一笔不小的开销。"),
      expression("That makes it easier to …","这样一来，……就容易多了。","Seeing all those payments in one place makes it easier to decide what to cut back on.","把这些支出放在一起看，就更容易决定哪些地方可以少花一点。"),
    ],
  },{
    name:"比较年龄与处境",parts:["p3"],use:"比较两类人时，说出生活安排或经验上的具体差异。",
    practice:["p3","p3-b4c9606a0c","年轻人听长辈讲经历"],
    phrases:[
      expression("It often depends on their stage of life.","这常常取决于他们的人生阶段。","It often depends on their stage of life. A teenager and a new parent may have very different weekends.","这往往取决于他们处在人生的哪个阶段。一个十几岁的孩子和一个刚有了孩子的成年人，周末的安排可能很不一样。"),
      expression("Someone who … might …","一个……的人可能会……","Someone who grew up without a smartphone might prefer a call to a long group chat.","从小没用过智能手机的人，可能更愿意打个电话，而不是在群里聊上半天。"),
      expression("They may have more in common than …","他们的共同点可能比……更多。","A teenager and a retired shopkeeper may have more in common than you'd think if both enjoy watching birds.","如果一个青少年和一位退休的店主都喜欢观鸟，他们的共同点可能比你想的多。"),
    ],
  },{
    name:"孩子怎样学习",parts:["p3"],use:"把“模仿”或“练习”放进孩子每天会遇见的场景里。",
    practice:["p3","p3-b5f1c51921","孩子入学前需要什么技能"],
    phrases:[
      expression("Children pick things up by …","孩子们通过……学会东西。","Children pick things up by watching what adults actually do at home.","孩子们通过观察大人在家里具体怎么做，慢慢就能学会不少东西。"),
      expression("It gives them a chance to …","这样他们就有机会……","Setting the table gives them a chance to count things and follow simple instructions.","摆餐具让孩子有机会数数，也能练习按简单的指示做事。"),
      expression("After a while, they can … on their own.","过一段时间，他们就能独立……","After a while, they can pack their own schoolbag without an adult checking every item.","过一段时间，孩子们就能自己收拾书包，不用大人一样一样地检查了。"),
    ],
  },{
    name:"时间、金钱与选择",parts:["p1","p3"],use:"解释一个人为什么会选更快、更省钱或更方便的做法。",
    practice:["topic","p1-shopping","购物选择"],
    phrases:[
      expression("It saves me the trouble of …","它省去了我……的麻烦。","Shopping nearby saves me the trouble of carrying heavy bags onto a bus.","在家附近购物，省得我拎着沉甸甸的袋子上公交车。"),
      expression("A little at a time adds up.","一点一点积起来就多了。","A little at a time adds up. Even ten minutes of English on the bus gives me extra practice each week.","每次一点点，积累起来就不少。哪怕每次坐公交只练十分钟英语，一星期下来，我也比原先多练了一些。"),
      expression("For someone on a tight budget, …","对预算紧的人来说，……","For someone on a tight budget, borrowing a book from a library makes a lot of sense.","如果手头不宽裕，到图书馆借书就是个很划算的选择。"),
    ],
  },{
    name:"人际关系与情绪支持",parts:["p1","p3"],use:"讲清楚别人具体做了什么，以及接受帮助的人有什么感受。",
    practice:["p3","p3-82d606e52b","与朋友或家人相处"],
    phrases:[
      expression("It helps to have someone who …","身边有一个会……的人很有帮助。","It helps to have someone who will listen when a job interview hasn't gone well.","求职面试不太顺利时，身边有个人愿意听你说一说，会很有帮助。"),
      expression("They can put themselves in your shoes.","他们能设身处地地理解你。","Friends who have taken the same exam can put themselves in your shoes.","参加过同一种考试的朋友，更能设身处地地体会你的感受。"),
      expression("That takes some of the pressure off.","这样能减轻一些压力。","My friend offers to walk in with me on the first day at a new club. That takes some of the pressure off.","第一次去新社团时，朋友主动提出陪我一起进去，这让我没那么紧张了。"),
    ],
  },{
    name:"科技与注意力",parts:["p1","p3"],use:"从使用场景说起，讲一个便利和一个具体影响。",
    practice:["p3","p3-f654a5f349","用社交媒体交流"],
    phrases:[
      expression("It's handy when …","当……时，它很方便。","A voice message is handy when you want a friend to hear your tone.","想让朋友听出你的语气时，发条语音就很方便。"),
      expression("It's easy to lose track of time.","很容易忘了时间。","One short video leads to another, so it's easy to lose track of time.","短视频一个接着一个，很容易看着看着就忘了时间。"),
      expression("You can miss … on a screen.","隔着屏幕，有时会错过……","You can miss the look on someone's face on a screen, especially in a busy group chat.","隔着屏幕，你可能留意不到对方脸上的表情，在消息刷得飞快的群聊里尤其如此。"),
    ],
  },{
    name:"空地、建筑与城市生活",parts:["p2","p3"],use:"用市民的一段日常路线来解释建筑或公共空间的影响。",
    practice:["p3","p3-e4ac1eab23","将来人们还会住高楼吗"],
    phrases:[
      expression("It makes good use of limited space.","它能有效利用有限的空间。","A block of flats makes good use of limited space near a busy station.","在繁忙的车站附近，用一栋公寓楼来提供住房，可以把有限的空间充分利用起来。"),
      expression("People need somewhere to …","人们需要一个可以……的地方。","People need somewhere to sit outdoors without having to buy a coffee first.","人们需要有个能在室外坐坐的地方，不用非得先买杯咖啡。"),
      expression("It brings … within walking distance.","它让人们走路就能到……","Building a clinic near the flats brings basic care within walking distance for older residents.","把诊所建在公寓楼附近，年长的居民走几步路就能获得基本的医疗服务。"),
    ],
  },{
    name:"给出办法与权衡",parts:["p3"],use:"提出一项能做的事，说明谁来做、会帮到谁，再补一个条件。",
    practice:["p3","p3-13ce6bb0fb","线上交流会取代面谈吗"],
    phrases:[
      expression("A practical first step would be to …","可行的第一步是……","A practical first step would be to give older residents a chance to try the app with someone beside them.","可行的第一步是让年长居民有机会试用这款应用，身边还有人陪着。"),
      expression("That would work best for …","这种做法最适合……","That would work best for people who already have a phone and just need a little practice.","这种做法最适合那些已经有手机、只需要再练习一下的人。"),
      expression("I'd still leave room for …","我还是会为……留出余地。","I'd still leave room for face-to-face appointments, especially when someone has a difficult question.","我还是会保留预约当面会谈的选择，尤其是有人想问比较复杂的问题时。"),
    ],
  },{
    name:"技能迁移与成长",parts:["p2","p3"],use:"先说原来在什么情境学的，再讲换个场合怎么用。",
    practice:["p3","p3-b325ccdb75","看视频可以学什么技能"],
    phrases:[
      expression("I first learned to … when …","我最初是在……时学会……的。","I first learned to give clear directions when I helped visitors find their way around a museum.","我是在博物馆帮参观者找路的时候，学会怎样把路线说清楚的。"),
      expression("The same idea applies to …","同样的做法也适用于……","The same idea applies to speaking practice. A listener needs one clear point to follow.","同样的道理也适用于口语练习。你得给听的人一个清楚的要点，对方才跟得上。"),
      expression("You get better at it by …","通过……，你会越来越熟练。","You get better at it by trying the task yourself and checking one small thing each time.","自己动手试，每次检查一个小细节，这样你就会越来越熟练。"),
    ],
  },
];
