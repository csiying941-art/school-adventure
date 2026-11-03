// =====================================================
//  小書包的校園大冒險 —— 小一新鮮人闖關挑戰
//  使用 p5.js 製作
//
//  遊戲流程：
//  標題 → 小書包說故事 → 校園地圖 → 關卡介紹 → 答題 → 解說
//       → 過關蓋章 → 走到下一站 …… → 6 關全破 → 新生護照
// =====================================================

// ==========================================
// 0. 畫布設定（固定 960×640 設計，再等比例縮放到視窗）
// ==========================================
const W = 960;
const H = 640;
let sc = 1, offX = 0, offY = 0; // 縮放比例與置中位移
let mx = 0, my = 0;             // 換算回 960×640 座標的滑鼠位置
let buttons = [];               // 這一幀畫出來、可以點的區域
let lastClickTime = 0;

const C = {
  blue: "#2660A4",
  darkBlue: "#1D497D",
  sky: "#CBEEF3",
  pink: "#EF476F",
  darkPink: "#D63B5C",
  green: "#2B9348",
  orange: "#E76F51"
};

// ==========================================
// 1. 題庫（18 題：2 題鐘聲是非題 + 16 題情境選擇題）
// ==========================================
const QUESTION_BANK = [
  // ---------- 第 1 關：校門口 ----------
  {
    type: "gate_greeting",
    story: "早上走到校門口，看到導護老師站在門口，對大家微笑。",
    question: "遇到老師的時候，你應該怎麼做？",
    options: [
      "低著頭快速走過去",
      "看著老師，有精神地說「老師早！」",
      "躲到爸爸媽媽後面不說話"
    ],
    correct: 1,
    explanation: "主動說「老師早」，老師會記住你這個有禮貌的好孩子，一整天也會從開心開始！"
  },
  {
    type: "crosswalk",
    story: "學校就在馬路對面，導護志工正拿著小旗子指揮大家過馬路。",
    question: "要過馬路進學校時，怎麼做最安全？",
    options: [
      "看到車子少就直接跑過去",
      "從停在路邊的車子中間鑽過去",
      "走斑馬線，看導護志工的指揮再過馬路"
    ],
    correct: 2,
    explanation: "走斑馬線、聽導護志工的指揮，車子才看得到你，安全最重要！"
  },
  {
    type: "goodbye_parent",
    story: "爸爸媽媽送你到校門口，準備要回家了，你有一點捨不得。",
    question: "跟爸爸媽媽分開時，怎樣做最勇敢？",
    options: [
      "抱著爸爸媽媽大哭，不肯進學校",
      "跟爸爸媽媽揮手說再見，自己走進校門",
      "偷偷跟著爸爸媽媽一起回家"
    ],
    correct: 1,
    explanation: "捨不得是很正常的！放學時爸爸媽媽就會來接你，勇敢說再見，學校有好多有趣的事等著你！"
  },

  // ---------- 第 2 關：教室 ----------
  {
    type: "bell_on",
    isTrueFalse: true,
    story: "叮咚～教室的喇叭傳來鐘聲，請仔細聽聽看。",
    question: "聽到這個鐘聲，代表「上課時間」到了，應該趕快回座位坐好嗎？",
    options: ["是 (對)", "不是 (錯)"],
    correct: 0,
    sound: "bell_on_sound",
    explanation: "上課鐘聲是「學習時間到了」的信號，聽到它就要馬上回座位準備上課喔！"
  },
  {
    type: "blackboard_answer",
    story: "老師問大家：「誰知道這張圖片裡是什麼？」你正好知道答案，覺得好興奮。",
    question: "想回答老師的問題時，怎樣才是棒棒的表現？",
    options: [
      "直接大聲喊出答案：「我知道！是我！」",
      "先舉手，靜靜等老師叫你的名字再回答",
      "拍桌子吸引老師的注意"
    ],
    correct: 1,
    explanation: "先舉手、安靜等老師叫名字，大家才能輪流說話，聽清楚彼此精彩的回答喔！"
  },
  {
    type: "stomach_hand",
    story: "上課到一半，你突然覺得肚子痛、很想上廁所，但老師正在黑板前講課。",
    question: "上課時想上廁所或不舒服，該怎麼辦？",
    options: [
      "先舉手，老師叫你時，告訴老師想去廁所",
      "忍耐不說，一直等到下課",
      "不打招呼，直接站起來走出去"
    ],
    correct: 0,
    explanation: "在學校有任何不舒服或急事，只要先舉手告訴老師，老師一定會溫柔地幫忙你！"
  },
  {
    type: "search_eraser",
    story: "上課要用橡皮擦，卻發現鉛筆盒裡找不到，抽屜裡也沒有。",
    question: "找不到文具的時候，該怎麼辦？",
    options: [
      "坐在座位上大哭，不肯上課",
      "舉手向老師求助，或禮貌地向同學借用",
      "偷偷拿隔壁同學桌上的橡皮擦來用"
    ],
    correct: 1,
    explanation: "不用著急大哭，有禮貌地請老師或同學幫忙，問題一下子就能解決了！"
  },

  // ---------- 第 3 關：下課走廊 ----------
  {
    type: "bell_off",
    isTrueFalse: true,
    story: "叮咚～又響起一段鐘聲，下課時間到了，請仔細聽聽看。",
    question: "聽到下課鐘聲，代表可以不用收拾桌面，直接衝出去奔跑玩耍嗎？",
    options: ["是 (對)", "不是 (錯)"],
    correct: 1,
    sound: "bell_off_sound",
    explanation: "下課時要先收好桌面、準備好下一節課的用品，在走廊上也要慢慢走、不奔跑喔！"
  },
  {
    type: "corridor_walk",
    story: "下課時你想去圖書館借書，走廊上有好多同學走來走去。",
    question: "在走廊上移動時，怎樣才安全？",
    options: [
      "像跑步比賽一樣用最快速度衝過去",
      "靠右邊輕聲慢慢走，不奔跑、不推擠",
      "邊走邊跳繩或踢球"
    ],
    correct: 1,
    explanation: "走廊是大家通行的地方，慢慢走、靠右行，才不會撞傷自己和別人喔！"
  },
  {
    type: "bump_pencils",
    story: "在走廊走動時，你不小心撞到同學，讓他的彩色筆掉了一地。",
    question: "不小心撞到同學時，第一時間應該怎麼做？",
    options: [
      "裝作沒看到，快速跑開",
      "說「對不起」，並主動幫忙把筆撿起來",
      "大聲怪同學：「是你自己擋路！」"
    ],
    correct: 1,
    explanation: "勇敢說聲「對不起」並幫忙撿東西，同學一定會原諒你，這就是負責任的表現！"
  },
  {
    type: "clean_desk",
    story: "下課鐘響了，大家想衝出去玩，可是你的桌上還堆滿剛剛畫畫用的彩色筆和紙。",
    question: "下課時，應該先做什麼事再出去玩？",
    options: [
      "把彩色筆留在桌上，直接跑出去玩",
      "把東西全部塞進同學的抽屜裡",
      "先收好桌面，並準備好下一節課的用品"
    ],
    correct: 2,
    explanation: "先幫文具找回自己的家，下一節課就不會手忙腳亂，下課也能玩得更開心！"
  },

  // ---------- 第 4 關：遊樂場 ----------
  {
    type: "slide_bell",
    story: "正在操場玩溜滑梯時，突然聽到「噹噹噹噹～」的上課鐘聲響起。",
    question: "聽到上課鐘聲響了，你應該怎麼做？",
    options: [
      "繼續把溜滑梯玩完再回教室",
      "馬上停止玩耍，快步走回教室坐好",
      "躲在樹後面跟同學玩捉迷藏"
    ],
    correct: 1,
    explanation: "鐘聲是提醒我們「學習時間到了」，馬上回座位坐好，就能準時開始上精彩的課喔！"
  },
  {
    type: "swing_queue",
    story: "遊樂場的鞦韆好多人想玩，前面已經有好幾個同學在排隊了。",
    question: "想玩熱門的遊樂設施時，你應該怎麼做？",
    options: [
      "悄悄插隊擠到最前面",
      "站在隊伍最後面安靜排隊，耐心等待",
      "把正在玩的人拉下來換自己玩"
    ],
    correct: 1,
    explanation: "遵守秩序、排隊輪流玩，大家都能玩得安全又開心，還能交到好朋友！"
  },
  {
    type: "fall_hurt",
    story: "在操場跑步時不小心跌倒了，膝蓋擦破皮，還有一點點流血。",
    question: "受傷的時候，你應該怎麼做？",
    options: [
      "自己忍著，不讓任何人知道",
      "趕快告訴老師，請老師帶你去健康中心",
      "用手去摸傷口、把破皮撕掉"
    ],
    correct: 1,
    explanation: "健康中心的護理師阿姨會幫你清潔、擦藥，受傷一定要馬上告訴老師喔！"
  },

  // ---------- 第 5 關：午餐時間 ----------
  {
    type: "soap_water",
    story: "中午打飯時間到了，肚子好餓，大家準備排隊領午餐。",
    question: "吃午餐前，哪一件事最重要？",
    options: [
      "先用肥皂把手洗乾淨，再回座位用餐",
      "直接拿湯匙開始吃",
      "用擦桌子的抹布擦手就開動"
    ],
    correct: 0,
    explanation: "用肥皂把手上的細菌通通洗掉，身體健健康康，飯菜吃起來也更香更美味！"
  },
  {
    type: "veggie",
    story: "今天的午餐有你不太喜歡的青菜，你看著碗裡的菜皺起眉頭。",
    question: "遇到不喜歡吃的菜時，怎麼做比較好？",
    options: [
      "偷偷把菜倒進垃圾桶",
      "把菜夾到隔壁同學的碗裡",
      "先試著吃一小口，給它一次機會"
    ],
    correct: 2,
    explanation: "每種食物都有不同的營養，勇敢試一小口，說不定會發現它其實很好吃！"
  },
  {
    type: "tray_return",
    story: "午餐吃完了，碗裡還剩下一點湯和菜渣。",
    question: "吃完午餐後，應該怎麼處理餐具？",
    options: [
      "把餐具放在桌上就跑去玩",
      "把廚餘倒進廚餘桶，餐具放回指定的地方",
      "把剩下的湯倒進洗手台"
    ],
    correct: 1,
    explanation: "廚餘分類、餐具歸位，教室乾乾淨淨，也能幫值日生省下好多力氣！"
  },

  // ---------- 第 6 關：午休放學 ----------
  {
    type: "nap_time",
    story: "吃完午餐、刷完牙後，午休鐘聲響起，教室的燈關暗了。",
    question: "午休時間到了，在教室裡應該怎麼做？",
    options: [
      "趴在桌上安靜休息，不發出聲音",
      "找隔壁同學小聲聊天",
      "跑到教室後面玩積木"
    ],
    correct: 0,
    explanation: "中午安靜趴下充充電，下午才會精神百倍，也是體貼其他想休息的同學喔！"
  },
  {
    type: "contact_book",
    story: "放學前，老師在聯絡簿上寫了明天要帶的東西。",
    question: "拿到聯絡簿後，回家應該怎麼做？",
    options: [
      "拿給爸爸媽媽看，請他們簽名",
      "一直放在書包裡，不拿出來",
      "自己在聯絡簿上亂畫"
    ],
    correct: 0,
    explanation: "聯絡簿是老師和爸爸媽媽之間的小橋樑，記得每天拿給家人看、請他們簽名喔！"
  },
  {
    type: "wait_pickup",
    story: "放學了，你在校門口等家人。一位不認識的叔叔說：「你媽媽叫我來接你。」",
    question: "這時候你應該怎麼做？",
    options: [
      "相信叔叔，跟他一起走",
      "不跟他走，馬上告訴老師或導護志工",
      "跟叔叔說好，但要他先買糖果給你"
    ],
    correct: 1,
    explanation: "不跟不認識的人走！留在學校、告訴老師，等真正的家人來接你，才是最安全的做法。"
  }
];

// 用 type 快速找到題目
const Q = {};
for (const q of QUESTION_BANK) Q[q.type] = q;

// ==========================================
// 2. 關卡設定（6 關，每關 2 題）
//    fixed：每次必出的題目　pool：隨機抽題的題庫
// ==========================================
const PER_LEVEL = 2;
const LEVELS = [
  {
    name: "校門口", icon: "🏫", color: "#F4A261", x: 140, y: 440,
    intro: "第一站是校門口！上學的路上，也有很多要注意的事喔。",
    fixed: [], pool: ["gate_greeting", "crosswalk", "goodbye_parent"]
  },
  {
    name: "教室", icon: "📚", color: "#2A9D8F", x: 330, y: 370,
    intro: "這裡是我們的教室！咦？仔細聽……鐘聲響了！",
    fixed: ["bell_on"], pool: ["blackboard_answer", "stomach_hand", "search_eraser"]
  },
  {
    name: "下課走廊", icon: "🚸", color: "#E76F51", x: 520, y: 440,
    intro: "下課囉！走廊上好多人，要怎麼做才安全呢？",
    fixed: ["bell_off"], pool: ["corridor_walk", "bump_pencils", "clean_desk"]
  },
  {
    name: "遊樂場", icon: "⚽", color: "#7B2CBF", x: 770, y: 380,
    intro: "哇，是遊樂場！玩的時候也有小規則喔。",
    fixed: [], pool: ["slide_bell", "swing_queue", "fall_hurt"]
  },
  {
    name: "午餐時間", icon: "🍱", color: "#F77F00", x: 650, y: 210,
    intro: "肚子餓了嗎？午餐時間有好多好習慣要學。",
    fixed: [], pool: ["soap_water", "veggie", "tray_return"]
  },
  {
    name: "午休放學", icon: "🌙", color: "#3A0CA3", x: 390, y: 180,
    intro: "最後一站！午休和放學，安全回家最重要。",
    fixed: [], pool: ["nap_time", "contact_book", "wait_pickup"]
  }
];
const MAX_STARS = LEVELS.length * PER_LEVEL;

// 開場故事（mood 是小書包的表情）
const STORY = [
  { text: "嗨！我是「小書包」，明天開始，就要陪你去上小學囉！", mood: "cheer" },
  { text: "小學和幼兒園有點不一樣：有上課鐘、下課鐘，還有好多新規則。", mood: "happy" },
  { text: "別擔心！我們一起走一趟校園，從校門口一路到放學，總共有 6 個關卡。", mood: "happy" },
  { text: "每關有 2 個挑戰，答對就能得到一顆星星，過關還能在「新生護照」蓋上印章！", mood: "cheer" },
  { text: "準備好了嗎？背上我，出發吧！", mood: "cheer" }
];

// ==========================================
// 3. 遊戲狀態
// ==========================================
let state = "TITLE"; // TITLE / STORY / MAP / LEVEL_INTRO / QUESTION / EXPLANATION / LEVEL_CLEAR / RESULT
let stateStart = 0;  // 進入目前畫面的時間 (毫秒)

let plan = [];        // 每一關抽好的題目
let levelIdx = 0;     // 目前在第幾關 (0~5)
let qIdx = 0;         // 目前在這關的第幾題
let levelStars = [];  // 每關得到的星星
let selected = -1;    // 玩家選的選項

let storyIdx = 0, typeStart = 0, lastTyped = 0; // 打字機效果
const TYPE_MS = 45;

let walk = null;      // 地圖走路動畫 {from, start, lastStep}
const WALK_MS = 1400;

let clouds = [];
let confetti = [];
let audioCtx = null;

function setState(s) {
  state = s;
  stateStart = millis();
  if (s === "LEVEL_CLEAR") {
    spawnConfetti(90);
    playSound("clear");
    setTimeout(() => playSound("stamp"), 380);
  } else if (s === "RESULT") {
    spawnConfetti(160);
    playSound("fanfare");
  }
}

function startGame(withStory) {
  plan = buildPlan();
  levelIdx = 0;
  qIdx = 0;
  levelStars = LEVELS.map(() => 0);
  walk = null;
  confetti = [];
  if (withStory) {
    storyIdx = 0;
    typeStart = millis();
    lastTyped = 0;
    setState("STORY");
  } else {
    setState("MAP");
  }
}

// 依照關卡設定，為每一關抽出題目
function buildPlan() {
  return LEVELS.map((lv) => {
    const fixedQs = lv.fixed.map((id) => Q[id]);
    const need = PER_LEVEL - fixedQs.length;
    const randomQs = shuffleArray(lv.pool).slice(0, need).map((id) => Q[id]);
    return [...fixedQs, ...randomQs].map(prepareQuestion);
  });
}

// 打亂選項順序（是非題不打亂），並重新記住正確答案的位置
function prepareQuestion(q) {
  if (q.isTrueFalse) return { ...q };
  const order = shuffleArray(q.options.map((_, i) => i));
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    correct: order.indexOf(q.correct)
  };
}

function curQ() {
  return plan[levelIdx][qIdx];
}

function totalStars() {
  return levelStars.reduce((a, b) => a + b, 0);
}

// ==========================================
// 4. 音效（Web Audio API 即時合成，不需要音檔）
// ==========================================
function initAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

// 播放一個音：頻率、延遲、長度、波形、音量
function tone(freq, delay, dur, type = "sine", vol = 0.25) {
  const now = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

// 學校鐘聲（每個音加一點高八度泛音，聽起來更像鐘）
function bellMelody(notes) {
  notes.forEach((f, i) => {
    tone(f, i * 0.55, 1.2, "sine", 0.28);
    tone(f * 2, i * 0.55, 0.6, "sine", 0.05);
  });
}

function playSound(type) {
  initAudio();
  if (!audioCtx) return;
  switch (type) {
    case "click":
      tone(620, 0, 0.08, "sine", 0.12);
      break;
    case "type":
      tone(900, 0, 0.03, "square", 0.025);
      break;
    case "step":
      tone(320, 0, 0.07, "triangle", 0.12);
      break;
    case "correct":
      tone(523.25, 0, 0.15);
      tone(659.25, 0.1, 0.15);
      tone(783.99, 0.2, 0.35);
      break;
    case "wrong":
      tone(220, 0, 0.22, "triangle", 0.25);
      tone(174.61, 0.16, 0.35, "triangle", 0.25);
      break;
    case "clear":
      tone(783.99, 0, 0.15, "triangle", 0.2);
      tone(987.77, 0.12, 0.15, "triangle", 0.2);
      tone(1174.66, 0.24, 0.4, "triangle", 0.2);
      break;
    case "stamp":
      tone(110, 0, 0.18, "square", 0.15);
      tone(880, 0.02, 0.25, "sine", 0.12);
      break;
    case "fanfare":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.13, 0.35, "triangle", 0.22));
      tone(1046.5, 0.55, 0.9, "sine", 0.18);
      break;
    case "bell_on_sound":   // 上課鐘：Mi Do Re Sol
      bellMelody([659.25, 523.25, 587.33, 392.0]);
      break;
    case "bell_off_sound":  // 下課鐘：Sol Re Mi Do
      bellMelody([392.0, 587.33, 659.25, 523.25]);
      break;
  }
}

// ==========================================
// 5. 小工具
// ==========================================
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 中文逐字換行（要先設定好 textSize 再呼叫）
function getWrappedLines(txt, maxWidth) {
  const chars = Array.from(txt);
  const lines = [];
  let line = "";
  for (const ch of chars) {
    const test = line + ch;
    if (textWidth(test) > maxWidth && line.length > 0) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  lines.push(line);
  return lines;
}

function drawLines(lines, x, startY, lineHeight) {
  for (let i = 0; i < lines.length; i++) text(lines[i], x, startY + i * lineHeight);
}

function isOver(x, y, w, h) {
  return mx > x && mx < x + w && my > y && my < y + h;
}

function addHit(x, y, w, h, onClick) {
  buttons.push({ x, y, w, h, onClick });
}

function easeOutBack(k) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * pow(k - 1, 3) + c1 * pow(k - 1, 2);
}

// 圓角按鈕：畫出來的同時登記點擊區域
function drawButton(label, x, y, w, h, onClick, opt = {}) {
  const over = isOver(x, y, w, h);
  const lift = over ? -3 : 0;
  push();
  noStroke();
  fill(0, 45);
  rect(x, y + 5, w, h, h / 2);
  fill(over ? (opt.hover || C.darkBlue) : (opt.color || C.blue));
  rect(x, y + lift, w, h, h / 2);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(opt.size || 22);
  text(label, x + w / 2, y + h / 2 + lift);
  pop();
  addHit(x, y, w, h, onClick);
}

// 五角星
function drawStar(x, y, r1, r2, filled) {
  push();
  translate(x, y);
  fill(filled ? "#FFC300" : "#E0E0E0");
  stroke(filled ? "#E09F00" : "#BDBDBD");
  strokeWeight(r1 * 0.12);
  strokeJoin(ROUND);
  beginShape();
  for (let i = 0; i < 10; i++) {
    const a = -HALF_PI + (i * PI) / 5;
    const r = i % 2 === 0 ? r1 : r2;
    vertex(cos(a) * r, sin(a) * r);
  }
  endShape(CLOSE);
  pop();
}

// 對話泡泡；measure 用來先用「整句話」算好高度，打字時泡泡才不會跳動
function drawBubble(x, y, w, txt, opt = {}) {
  const size = opt.size || 20;
  const lh = size * 1.5;
  push();
  textSize(size);
  textStyle(NORMAL);
  const fullLines = getWrappedLines(opt.measure || txt, w - 36);
  const lines = getWrappedLines(txt, w - 36);
  const h = fullLines.length * lh + 28;

  fill(255);
  stroke(C.blue);
  strokeWeight(2.5);
  rect(x, y, w, h, 18);

  // 泡泡尾巴（指向左邊的小書包）
  if (opt.tail !== "none") {
    const ty = y + min(h * 0.6, 60);
    noStroke();
    fill(255);
    triangle(x + 3, ty - 10, x + 3, ty + 10, x - 18, ty + 16);
    stroke(C.blue);
    line(x, ty - 10, x - 18, ty + 16);
    line(x - 18, ty + 16, x, ty + 10);
  }

  noStroke();
  fill(40);
  textAlign(LEFT, TOP);
  drawLines(lines, x + 18, y + 14, lh);
  pop();
  return h;
}

// ==========================================
// 6. 角色與場景繪製
// ==========================================

// 吉祥物「小書包」：mood = happy / cheer / oops
function drawMascot(x, y, sz, mood = "happy") {
  const s = sz / 100;
  const bob = sin(frameCount * 0.08) * 3 * s;
  push();
  translate(x, y);
  noStroke();
  fill(0, 30);
  ellipse(0, 54 * s, 76 * s, 12 * s); // 影子
  translate(0, bob);

  // 提把
  noFill();
  stroke("#B23A48");
  strokeWeight(7 * s);
  arc(0, -46 * s, 36 * s, 30 * s, PI, TWO_PI);
  noStroke();

  // 小手（開心時會揮動）
  const wave = mood === "cheer" ? sin(frameCount * 0.25) * 0.5 : 0;
  fill("#B23A48");
  push();
  translate(-42 * s, 2 * s);
  rotate(0.35 + wave);
  ellipse(-6 * s, 0, 16 * s, 26 * s);
  pop();
  push();
  translate(42 * s, 2 * s);
  rotate(-0.35 - wave);
  ellipse(6 * s, 0, 16 * s, 26 * s);
  pop();

  // 身體
  fill("#EF6F6C");
  rect(-42 * s, -46 * s, 84 * s, 98 * s, 24 * s);
  // 前口袋＋拉鍊
  fill("#F79D84");
  rect(-28 * s, 16 * s, 56 * s, 28 * s, 12 * s);
  fill("#B23A48");
  rect(-22 * s, 23 * s, 44 * s, 3 * s, 2 * s);
  fill("#FFD166");
  circle(18 * s, 24.5 * s, 6 * s);
  // 書包蓋與扣環
  fill("#F79D84");
  rect(-42 * s, -46 * s, 84 * s, 46 * s, 24 * s, 24 * s, 16 * s, 16 * s);
  fill("#FFD166");
  rect(-8 * s, -6 * s, 16 * s, 13 * s, 3 * s);

  // 眼睛（偶爾眨眼）
  const blink = frameCount % 200 < 7;
  fill("#3D2C2E");
  if (blink) {
    rect(-20 * s, -27 * s, 10 * s, 2.5 * s, 1);
    rect(10 * s, -27 * s, 10 * s, 2.5 * s, 1);
  } else {
    ellipse(-15 * s, -26 * s, 9 * s, 11 * s);
    ellipse(15 * s, -26 * s, 9 * s, 11 * s);
    fill(255);
    circle(-13 * s, -28 * s, 3 * s);
    circle(17 * s, -28 * s, 3 * s);
  }
  // 腮紅
  fill(255, 120, 140, 150);
  ellipse(-27 * s, -16 * s, 12 * s, 7 * s);
  ellipse(27 * s, -16 * s, 12 * s, 7 * s);

  // 嘴巴
  if (mood === "cheer") {
    fill("#3D2C2E");
    arc(0, -19 * s, 18 * s, 15 * s, 0, PI, CHORD);
    fill("#FF8FA3");
    ellipse(0, -14 * s, 8 * s, 4 * s);
  } else if (mood === "oops") {
    fill("#3D2C2E");
    ellipse(0, -15 * s, 8 * s, 9 * s);
  } else {
    noFill();
    stroke("#3D2C2E");
    strokeWeight(2.5 * s);
    arc(0, -19 * s, 14 * s, 10 * s, 0, PI);
  }
  pop();
}

// 雲朵與草地背景
function initClouds() {
  clouds = [];
  for (let i = 0; i < 4; i++) {
    clouds.push({ x: random(W), y: random(40, 200), s: random(0.7, 1.3), v: random(0.15, 0.4) });
  }
}

function drawBackdrop(ground = true) {
  noStroke();
  fill(C.sky);
  rect(0, 0, W, H);
  for (const c of clouds) {
    c.x += c.v;
    if (c.x > W + 90) c.x = -90;
    push();
    translate(c.x, c.y);
    scale(c.s);
    fill(255, 235);
    ellipse(0, 0, 90, 40);
    ellipse(-28, 6, 50, 30);
    ellipse(30, 6, 56, 32);
    ellipse(8, -14, 50, 36);
    pop();
  }
  if (ground) {
    fill("#A7D88B");
    rect(0, H - 70, W, 70);
    fill("#8BC873");
    for (let x = 0; x < W + 60; x += 60) ellipse(x, H - 70, 70, 26);
  }
}

// 學校建築（時鐘指針會轉、國旗會飄）
function drawSchool(cx, by, k = 1) {
  push();
  translate(cx, by);
  scale(k);
  noStroke();
  fill("#F6E7CB");
  rect(-150, -160, 300, 160, 6);
  fill("#E07A5F");
  rect(-160, -172, 320, 16, 4);
  // 鐘塔
  fill("#F6E7CB");
  rect(-30, -225, 60, 56, 4);
  fill("#E07A5F");
  triangle(-40, -225, 40, -225, 0, -260);
  fill(255);
  stroke(C.blue);
  strokeWeight(3);
  circle(0, -197, 36);
  line(0, -197, 0, -209);
  push();
  translate(0, -197);
  rotate(frameCount * 0.02);
  line(0, 0, 10, 0);
  pop();
  noStroke();
  // 窗戶
  fill("#8ECAE6");
  const wx = [-125, -78, 44, 91];
  for (let r = 0; r < 2; r++) {
    for (const x of wx) rect(x, -145 + r * 55, 34, 30, 4);
  }
  // 大門
  fill("#B5838D");
  rect(-24, -64, 48, 64, 8, 8, 0, 0);
  // 旗桿
  stroke("#6C757D");
  strokeWeight(3);
  line(122, -172, 122, -245);
  noStroke();
  fill(C.pink);
  triangle(122, -245, 152 + sin(frameCount * 0.1) * 4, -235, 122, -225);
  pop();
}

function drawTree(x, y, k = 1) {
  push();
  translate(x, y);
  scale(k);
  noStroke();
  fill("#8D6E63");
  rect(-5, 0, 10, 26, 3);
  fill("#52B788");
  circle(0, -8, 40);
  circle(-14, 4, 28);
  circle(14, 4, 28);
  pop();
}

// 過關印章
function drawStamp(x, y, r, i) {
  const lv = LEVELS[i];
  push();
  translate(x, y);
  rotate(-0.12);
  const c = color(lv.color);
  noFill();
  stroke(c);
  strokeWeight(r * 0.08);
  circle(0, 0, r * 2);
  strokeWeight(r * 0.03);
  circle(0, 0, r * 1.68);
  noStroke();
  fill(c);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(r * 0.42);
  text(lv.icon, 0, -r * 0.3);
  textSize(r * 0.26);
  text(lv.name, 0, r * 0.2);
  textSize(r * 0.17);
  text("過關", 0, r * 0.5);
  pop();
}

// 彩帶
function spawnConfetti(n) {
  const colors = ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#F78C6B"];
  for (let i = 0; i < n; i++) {
    confetti.push({
      x: random(W), y: random(-220, -10),
      vx: random(-1, 1), vy: random(2, 5),
      r: random(TWO_PI), vr: random(-0.2, 0.2),
      c: random(colors), w: random(6, 12), h: random(8, 16)
    });
  }
}

function updateConfetti() {
  noStroke();
  for (let i = confetti.length - 1; i >= 0; i--) {
    const p = confetti[i];
    p.x += p.vx;
    p.y += p.vy;
    p.r += p.vr;
    push();
    translate(p.x, p.y);
    rotate(p.r);
    fill(p.c);
    rect(-p.w / 2, -p.h / 2, p.w, p.h, 2);
    pop();
    if (p.y > H + 20) confetti.splice(i, 1);
  }
}

// ==========================================
// 7. 情境動畫小圖（每題一張，會動的 GIF 風格）
// ==========================================
function drawScenarioImage(type, x, y, size) {
  push();
  translate(x, y);
  fill(245, 250, 255);
  stroke(C.blue);
  strokeWeight(3);
  rect(-size / 2, -size / 2, size, size, 15);
  noStroke();
  const s = size / 100;
  const t = frameCount * 0.08;

  if (type === "bell_on" || type === "bell_off") {
    // 廣播喇叭與聲波
    fill(C.blue);
    rect(-20 * s, -10 * s, 15 * s, 20 * s, 3);
    triangle(-5 * s, -20 * s, 15 * s, -30 * s, 15 * s, 30 * s);
    noFill();
    stroke("#FF5722");
    strokeWeight(3 * s);
    const w1 = (t * 12) % 25;
    const w2 = (t * 12 + 12) % 25;
    arc(20 * s, 0, (15 + w1) * s, (25 + w1) * s, -QUARTER_PI, QUARTER_PI);
    arc(20 * s, 0, (15 + w2) * s, (25 + w2) * s, -QUARTER_PI, QUARTER_PI);
  } else if (type === "gate_greeting") {
    // 校門與揮手的老師
    fill("#E5989B");
    rect(-44 * s, -38 * s, 88 * s, 14 * s, 4 * s);
    fill("#B5838D");
    rect(-42 * s, -24 * s, 12 * s, 54 * s, 2 * s);
    rect(30 * s, -24 * s, 12 * s, 54 * s, 2 * s);
    fill("#FFD166");
    ellipse(0, -2 * s, 20 * s, 20 * s);
    fill("#457B9D");
    rect(-10 * s, 8 * s, 20 * s, 22 * s, 4 * s);
    push();
    translate(9 * s, 12 * s);
    rotate(0.5 + sin(t * 3) * 0.45);
    stroke("#FFD166");
    strokeWeight(4 * s);
    line(0, 0, 0, -16 * s);
    pop();
    fill("#FFC300");
    ellipse(-18 * s, -10 * s + sin(t * 2) * 2 * s, 8 * s, 8 * s);
  } else if (type === "crosswalk") {
    // 斑馬線與導護旗子
    fill("#495057");
    rect(-45 * s, -22 * s, 90 * s, 48 * s, 4 * s);
    fill(255);
    for (let i = 0; i < 6; i++) rect(-40 * s + i * 14 * s, -17 * s, 8 * s, 38 * s, 1 * s);
    const p = (t * 0.2) % 1;
    fill("#E76F51");
    ellipse(lerp(-36 * s, 36 * s, p), 2 * s - abs(sin(t * 4)) * 3 * s, 13 * s, 13 * s);
    push();
    translate(36 * s, -44 * s);
    stroke("#6C757D");
    strokeWeight(2 * s);
    line(0, 0, 0, 22 * s);
    noStroke();
    fill("#FFC300");
    rotate(sin(t * 3) * 0.25);
    triangle(0, 0, 16 * s, 5 * s, 0, 11 * s);
    pop();
  } else if (type === "goodbye_parent") {
    // 家長與孩子揮手道別
    fill("#6D597A");
    ellipse(-20 * s, -14 * s, 22 * s, 22 * s);
    rect(-32 * s, -2 * s, 24 * s, 34 * s, 6 * s);
    fill("#FFD166");
    ellipse(18 * s, 2 * s, 16 * s, 16 * s);
    fill("#EF6F6C");
    rect(10 * s, 10 * s, 16 * s, 20 * s, 4 * s);
    push();
    translate(24 * s, 12 * s);
    rotate(0.4 + sin(t * 3.5) * 0.5);
    stroke("#FFD166");
    strokeWeight(3.5 * s);
    line(0, 0, 6 * s, -14 * s);
    pop();
    const rise = (t * 8) % 30;
    fill(255, 77, 109, map(rise, 0, 30, 255, 0));
    push();
    translate(0, -22 * s - rise * s);
    ellipse(-3 * s, 0, 8 * s, 8 * s);
    ellipse(3 * s, 0, 8 * s, 8 * s);
    triangle(-7 * s, 2 * s, 7 * s, 2 * s, 0, 9 * s);
    pop();
  } else if (type === "slide_bell") {
    // 溜滑梯與搖擺大鐘
    fill("#4CAF50");
    rect(-45 * s, 25 * s, 90 * s, 15 * s, 5);
    fill("#FF5722");
    triangle(-30 * s, 25 * s, -10 * s, -20 * s, 10 * s, 25 * s);
    fill("#FFC107");
    rect(-10 * s, -20 * s, 35 * s, 8 * s, 3);
    const sp = (t * 0.3) % 1;
    fill("#E76F51");
    ellipse(lerp(-10 * s, 25 * s, sp), lerp(-25 * s, 20 * s, sp), 12 * s, 12 * s);
    push();
    translate(25 * s, -20 * s);
    rotate(sin(t * 2) * 0.25);
    fill(C.blue);
    ellipse(0, 0, 25 * s, 25 * s);
    pop();
  } else if (type === "stomach_hand") {
    // 肚子痛＋舉手
    fill("#FFD166");
    ellipse(-15 * s, -10 * s, 35 * s, 35 * s);
    fill("#EF476F");
    ellipse(-15 * s, 20 * s, 30 * s, 25 * s);
    push();
    translate(10 * s, 25 * s);
    rotate(sin(t * 3) * 0.2);
    stroke(C.blue);
    strokeWeight(4 * s);
    line(0, 0, 15 * s, -50 * s);
    noStroke();
    fill("#FFD166");
    ellipse(15 * s, -52 * s, 12 * s, 12 * s);
    pop();
  } else if (type === "blackboard_answer") {
    // 黑板寫字
    fill("#2D6A4F");
    rect(-40 * s, -35 * s, 80 * s, 40 * s, 4);
    fill(255);
    const lw = (sin(t * 2) + 1) * 15 * s;
    rect(-30 * s, -25 * s, 10 * s + lw, 5 * s);
    rect(-30 * s, -15 * s, 40 * s, 5 * s);
    fill("#FFD166");
    ellipse(0, 25 * s, 28 * s, 28 * s);
  } else if (type === "clean_desk") {
    // 桌上彩色筆跳動
    fill("#B07D62");
    rect(-40 * s, 5 * s, 80 * s, 25 * s, 4);
    const py = sin(t * 2) * 4 * s;
    fill("#E63946");
    rect(-25 * s, -20 * s + py, 8 * s, 25 * s, 2);
    fill("#457B9D");
    rect(-10 * s, -25 * s - py, 8 * s, 30 * s, 2);
    fill("#2A9D8F");
    rect(15 * s, -15 * s, 20 * s, 20 * s, 5);
  } else if (type === "swing_queue") {
    // 盪鞦韆與排隊的人
    push();
    translate(-30 * s, -40 * s);
    rotate(sin(t * 1.8) * 0.35);
    stroke("#6C757D");
    strokeWeight(3 * s);
    line(0, 0, -5 * s, 50 * s);
    line(0, 0, 15 * s, 50 * s);
    noStroke();
    fill("#D62828");
    rect(-10 * s, 50 * s, 25 * s, 6 * s);
    pop();
    fill(C.blue);
    ellipse(15 * s, -5 * s, 18 * s, 18 * s);
    ellipse(32 * s, -5 * s, 18 * s, 18 * s);
  } else if (type === "bump_pencils") {
    // 愛心跳動＋掉落的筆
    push();
    scale(1 + sin(t * 3) * 0.12);
    fill("#FF4D6D");
    ellipse(-5 * s, -15 * s, 22 * s, 22 * s);
    ellipse(10 * s, -15 * s, 22 * s, 22 * s);
    triangle(-15 * s, -10 * s, 20 * s, -10 * s, 2.5 * s, 10 * s);
    pop();
    fill("#E76F51");
    rect(-30 * s, 20 * s, 25 * s, 6 * s, 2);
    fill("#2A9D8F");
    rect(-5 * s, 25 * s, 25 * s, 6 * s, 2);
  } else if (type === "fall_hurt") {
    // 膝蓋貼 OK 繃＋健康中心十字
    fill("#FFD6A5");
    rect(-38 * s, -6 * s, 52 * s, 28 * s, 14 * s);
    push();
    translate(-12 * s, 8 * s);
    rotate(-0.3);
    fill("#F4A261");
    rect(-14 * s, -6 * s, 28 * s, 12 * s, 6 * s);
    fill("#FFE8CC");
    rect(-5 * s, -4 * s, 10 * s, 8 * s, 2 * s);
    pop();
    push();
    translate(26 * s, -22 * s);
    scale(1 + sin(t * 3) * 0.12);
    fill(255);
    stroke("#E63946");
    strokeWeight(2 * s);
    circle(0, 0, 26 * s);
    noStroke();
    fill("#E63946");
    rect(-3 * s, -9 * s, 6 * s, 18 * s, 1);
    rect(-9 * s, -3 * s, 18 * s, 6 * s, 1);
    pop();
  } else if (type === "soap_water") {
    // 洗手泡泡
    fill("#90E0EF");
    rect(-3 * s, -10 * s, 6 * s, 30 * s, 2);
    fill("#0077B6");
    rect(-10 * s, -35 * s, 20 * s, 25 * s, 4);
    fill("#F72585");
    rect(-20 * s, -5 * s, 25 * s, 15 * s, 5);
    fill(255, 255, 255, 200);
    const b1 = (t * 12) % 35;
    const b2 = (t * 10 + 15) % 35;
    ellipse(-15 * s, 15 * s - b1 * s, 10 * s, 10 * s);
    ellipse(15 * s, 20 * s - b2 * s, 14 * s, 14 * s);
  } else if (type === "veggie") {
    // 碗裡晃動的青菜
    fill(255);
    stroke("#ADB5BD");
    strokeWeight(2 * s);
    arc(0, 5 * s, 70 * s, 50 * s, 0, PI, CHORD);
    noStroke();
    for (let i = 0; i < 4; i++) {
      fill(i % 2 ? "#52B788" : "#2D6A4F");
      ellipse(-21 * s + i * 14 * s, 2 * s + sin(t * 3 + i) * 3 * s, 14 * s, 22 * s);
    }
    push();
    translate(22 * s, -24 * s);
    rotate(0.6 + sin(t * 2) * 0.15);
    fill("#ADB5BD");
    rect(-2 * s, 0, 4 * s, 22 * s, 2 * s);
    ellipse(0, 0, 10 * s, 13 * s);
    pop();
    const sp = (sin(t * 4) + 1) / 2;
    fill("#FFC300");
    ellipse(-30 * s, -22 * s, 3 * s + 5 * s * sp, 3 * s + 5 * s * sp);
  } else if (type === "tray_return") {
    // 廚餘倒進桶子
    fill("#2A9D8F");
    rect(-20 * s, 2 * s, 40 * s, 32 * s, 4 * s);
    fill("#21867A");
    rect(-23 * s, -4 * s, 46 * s, 8 * s, 3 * s);
    const cs = ["#BC6C25", "#E9C46A", "#90BE6D"];
    for (let i = 0; i < 3; i++) {
      const fy = (t * 15 + i * 12) % 34;
      fill(cs[i]);
      ellipse(-8 * s + i * 8 * s, -38 * s + fy * s, 7 * s, 7 * s);
    }
    push();
    translate(-22 * s, -38 * s);
    rotate(0.6);
    fill(255);
    stroke("#ADB5BD");
    strokeWeight(1.5 * s);
    arc(0, 0, 26 * s, 18 * s, 0, PI, CHORD);
    pop();
  } else if (type === "search_eraser") {
    // 放大鏡搜尋
    fill("#F4A261");
    rect(-35 * s, -10 * s, 70 * s, 35 * s, 5);
    push();
    translate(5 * s, -15 * s);
    rotate(sin(t * 2) * 0.45);
    stroke(C.blue);
    strokeWeight(4 * s);
    noFill();
    ellipse(0, 0, 30 * s, 30 * s);
    line(12 * s, 12 * s, 25 * s, 25 * s);
    pop();
  } else if (type === "nap_time") {
    // 午休的小夜燈
    fill(C.blue);
    rect(-35 * s, 0, 70 * s, 25 * s, 5);
    fill("#FFD166");
    ellipse(-10 * s, -10 * s, 25 * s, 25 * s);
    fill(255, 209, 102, 140 + sin(t * 2.5) * 110);
    ellipse(25 * s, -20 * s, 24 * s, 24 * s);
  } else if (type === "contact_book") {
    // 聯絡簿與正在寫字的筆
    fill("#E9ECEF");
    rect(-40 * s, -28 * s, 80 * s, 56 * s, 4 * s);
    fill("#FFF3B0");
    rect(-37 * s, -25 * s, 36 * s, 50 * s, 2 * s);
    rect(1 * s, -25 * s, 36 * s, 50 * s, 2 * s);
    fill("#ADB5BD");
    for (let i = 0; i < 3; i++) rect(-33 * s, -17 * s + i * 12 * s, 28 * s, 3 * s);
    const w = ((t * 0.6) % 1) * 26 * s;
    fill(C.blue);
    rect(5 * s, -17 * s, w, 3 * s);
    push();
    translate(5 * s + w, -17 * s);
    rotate(0.5);
    fill("#E76F51");
    rect(-2.5 * s, -22 * s, 5 * s, 18 * s, 1);
    fill("#333");
    triangle(-2.5 * s, -4 * s, 2.5 * s, -4 * s, 0, 0);
    pop();
  } else if (type === "wait_pickup") {
    // 在校門等家人＋安全盾牌
    fill("#B5838D");
    rect(-44 * s, -30 * s, 8 * s, 58 * s);
    rect(-44 * s, -30 * s, 30 * s, 6 * s);
    fill("#FFD166");
    ellipse(-22 * s, 0, 16 * s, 16 * s);
    fill("#EF6F6C");
    rect(-29 * s, 8 * s, 14 * s, 20 * s, 4 * s);
    push();
    translate(18 * s, -2 * s);
    scale(1 + sin(t * 3) * 0.08);
    fill(C.blue);
    beginShape();
    vertex(0, -26 * s);
    vertex(22 * s, -18 * s);
    vertex(20 * s, 6 * s);
    vertex(0, 24 * s);
    vertex(-20 * s, 6 * s);
    vertex(-22 * s, -18 * s);
    endShape(CLOSE);
    stroke(255);
    strokeWeight(4 * s);
    noFill();
    beginShape();
    vertex(-9 * s, 0);
    vertex(-2 * s, 8 * s);
    vertex(11 * s, -9 * s);
    endShape();
    pop();
  } else if (type === "corridor_walk") {
    // 走廊上交替的腳印
    fill("#ADB5BD");
    rect(-40 * s, -30 * s, 80 * s, 60 * s, 8);
    fill(255);
    rect(-10 * s, -30 * s, 20 * s, 60 * s);
    const step = Math.floor(t * 2.5) % 2;
    fill(step === 0 ? C.blue : 180);
    ellipse(5 * s, 10 * s, 10 * s, 16 * s);
    fill(step === 1 ? C.blue : 180);
    ellipse(5 * s, -15 * s, 10 * s, 16 * s);
  }
  pop();
}

// ==========================================
// 8. p5.js 生命週期
// ==========================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Noto Sans TC");
  textAlign(CENTER, CENTER);
  // 先請瀏覽器下載字型，畫布文字才會用到
  if (document.fonts && document.fonts.load) {
    document.fonts.load('400 20px "Noto Sans TC"');
    document.fonts.load('700 20px "Noto Sans TC"');
  }
  initClouds();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // 計算等比例縮放，讓 960×640 的畫面置中
  sc = min(width / W, height / H);
  offX = (width - W * sc) / 2;
  offY = (height - H * sc) / 2;
  mx = (mouseX - offX) / sc;
  my = (mouseY - offY) / sc;

  background(C.sky);
  buttons = [];

  push();
  translate(offX, offY);
  scale(sc);
  textAlign(CENTER, CENTER);

  if (state === "TITLE") drawTitleScreen();
  else if (state === "STORY") drawStoryScreen();
  else if (state === "MAP") drawMapScreen(false);
  else if (state === "LEVEL_INTRO") drawLevelIntro();
  else if (state === "QUESTION") drawQuestionScreen();
  else if (state === "EXPLANATION") drawExplanationScreen();
  else if (state === "LEVEL_CLEAR") drawLevelClearScreen();
  else if (state === "RESULT") drawResultScreen();

  updateConfetti();
  pop();

  // 滑到按鈕上時變成手指游標
  const overBtn = buttons.some((b) => isOver(b.x, b.y, b.w, b.h));
  cursor(overBtn || state === "STORY" ? HAND : ARROW);
}

// ==========================================
// 9. 各畫面
// ==========================================

// ---- 標題畫面 ----
function drawTitleScreen() {
  drawBackdrop();
  drawSchool(730, 570, 1.05);
  drawMascot(230, 400, 170, "cheer");

  push();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(54);
  // 白色描邊字
  stroke(255);
  strokeWeight(12);
  fill(255);
  text("小書包的校園大冒險", W / 2, 105);
  noStroke();
  fill(C.blue);
  text("小書包的校園大冒險", W / 2, 105);
  fill(C.orange);
  textSize(24);
  text("—— 小一新鮮人闖關挑戰 ——", W / 2, 168);
  pop();

  drawButton("開始冒險 ▶", W / 2 - 130, 515, 260, 64, () => {
    playSound("click");
    startGame(true);
  }, { size: 26, color: C.pink, hover: C.darkPink });
}

// ---- 開場故事（打字機效果）----
function drawStoryScreen() {
  drawBackdrop();
  drawSchool(780, 570, 0.8);

  const line = STORY[storyIdx];
  const chars = Array.from(line.text);
  const n = min(chars.length, floor((millis() - typeStart) / TYPE_MS));
  if (n > lastTyped) {
    if (n % 3 === 0) playSound("type");
    lastTyped = n;
  }

  drawMascot(220, 400, 190, line.mood);
  drawBubble(350, 150, 470, chars.slice(0, n).join(""), { size: 26, measure: line.text });

  // 進度點
  noStroke();
  for (let i = 0; i < STORY.length; i++) {
    fill(i <= storyIdx ? C.blue : color(255, 200));
    circle(W / 2 - (STORY.length - 1) * 14 + i * 28, 600, 13);
  }

  if (n >= chars.length && floor(millis() / 500) % 2 === 0) {
    push();
    fill(C.blue);
    textStyle(BOLD);
    textSize(18);
    textAlign(RIGHT, CENTER);
    text("點一下繼續 ▶", 820, 340);
    pop();
  }

  drawButton("跳過故事 ⏭", 790, 20, 150, 44, () => {
    playSound("click");
    setState("MAP");
  }, { size: 17, color: "#6C757D", hover: "#495057" });
}

function advanceStory() {
  const len = Array.from(STORY[storyIdx].text).length;
  // 字還沒打完：先一次顯示整句
  if (floor((millis() - typeStart) / TYPE_MS) < len) {
    typeStart = millis() - len * TYPE_MS - 10;
    return;
  }
  playSound("click");
  if (storyIdx < STORY.length - 1) {
    storyIdx++;
    typeStart = millis();
    lastTyped = 0;
  } else {
    setState("MAP");
  }
}

// ---- 校園地圖 ----
function drawMapScreen(asBackground) {
  drawBackdrop(false);
  noStroke();
  fill("#BDE7A7");
  rect(20, 80, W - 40, H - 100, 30);

  drawTree(80, 170);
  drawTree(880, 230, 1.1);
  drawTree(530, 300, 0.9);
  drawTree(250, 560, 0.9);
  drawTree(880, 560);
  drawTree(70, 320, 0.8);

  // 小路
  noFill();
  strokeJoin(ROUND);
  for (const [col, wt] of [["#EAD7B0", 36], ["#F7ECD5", 24]]) {
    stroke(col);
    strokeWeight(wt);
    beginShape();
    curveVertex(LEVELS[0].x, LEVELS[0].y);
    for (const lv of LEVELS) curveVertex(lv.x, lv.y);
    curveVertex(LEVELS[LEVELS.length - 1].x, LEVELS[LEVELS.length - 1].y);
    endShape();
  }
  noStroke();

  for (let i = 0; i < LEVELS.length; i++) drawMapNode(i, asBackground);

  // 小書包角色站在目前的關卡上
  const p = avatarPos();
  drawMascot(p.x, p.y - 72, 52, walk ? "cheer" : "happy");

  // 標題列
  push();
  fill(C.blue);
  rect(24, 14, 250, 44, 22);
  fill(255);
  textStyle(BOLD);
  textSize(21);
  text("🗺️ 校園探險地圖", 149, 36);
  pop();
  drawStarCounter();

  if (asBackground) return;

  if (walk) {
    push();
    fill(C.blue);
    textStyle(BOLD);
    textSize(20);
    text("出發！前往下一站……", W / 2, 592);
    pop();
  } else {
    const lv = LEVELS[levelIdx];
    drawButton(`進入第 ${levelIdx + 1} 關：${lv.name} ▶`, W / 2 - 180, 565, 360, 54,
      enterLevelIntro, { size: 21, color: C.pink, hover: C.darkPink });
  }
}

function drawMapNode(i, asBackground) {
  const lv = LEVELS[i];
  const done = i < levelIdx;
  const current = i === levelIdx;
  const locked = i > levelIdx;

  push();
  translate(lv.x, lv.y);
  textAlign(CENTER, CENTER);

  if (current && !walk) {
    noFill();
    stroke(255, 220, 90);
    strokeWeight(8);
    circle(0, 0, 104 * (1 + sin(frameCount * 0.1) * 0.06));
  }
  noStroke();
  fill(0, 35);
  ellipse(0, 40, 80, 16);
  fill(locked ? "#CED4DA" : lv.color);
  stroke(255);
  strokeWeight(5);
  circle(0, 0, 84);
  noStroke();
  textSize(34);
  fill(0);
  text(lv.icon, 0, 2);
  if (locked) {
    fill(206, 212, 218, 190);
    circle(0, 0, 78);
    textSize(24);
    text("🔒", 0, 0);
  }

  // 關卡編號
  fill(C.blue);
  circle(-30, -30, 26);
  fill(255);
  textStyle(BOLD);
  textSize(14);
  text(i + 1, -30, -30);

  // 名稱標籤
  textSize(16);
  const tw = textWidth(lv.name) + 26;
  fill(255);
  rect(-tw / 2, 48, tw, 28, 14);
  fill(locked ? 150 : 40);
  text(lv.name, 0, 62);

  if (done) {
    fill("#2DC653");
    circle(30, -30, 28);
    fill(255);
    textSize(16);
    text("✓", 30, -29);
    for (let k = 0; k < PER_LEVEL; k++) {
      drawStar(-12 + k * 24, 92, 10, 4.5, k < levelStars[i]);
    }
  }
  pop();

  if (current && !walk && !asBackground) addHit(lv.x - 42, lv.y - 42, 84, 84, enterLevelIntro);
}

// 計算小書包在地圖上的位置（走路時一跳一跳前進）
function avatarPos() {
  const to = LEVELS[levelIdx];
  if (!walk) return { x: to.x, y: to.y };
  const from = LEVELS[walk.from];
  const p = constrain((millis() - walk.start) / WALK_MS, 0, 1);
  const e = p < 0.5 ? 2 * p * p : 1 - pow(-2 * p + 2, 2) / 2;
  const hop = abs(sin(p * PI * 5)) * 16;
  const step = floor(p * 5);
  if (step > walk.lastStep && step < 5) {
    walk.lastStep = step;
    playSound("step");
  }
  if (p >= 1) walk = null;
  return { x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e) - hop };
}

function drawStarCounter() {
  push();
  noStroke();
  fill(255, 235);
  rect(W - 176, 14, 152, 44, 22);
  drawStar(W - 148, 36, 14, 6, true);
  fill(C.blue);
  textStyle(BOLD);
  textSize(20);
  textAlign(LEFT, CENTER);
  text(`${totalStars()} / ${MAX_STARS}`, W - 126, 37);
  pop();
}

function enterLevelIntro() {
  playSound("click");
  setState("LEVEL_INTRO");
}

// ---- 關卡介紹卡 ----
function drawLevelIntro() {
  drawMapScreen(true);
  noStroke();
  fill(20, 40, 80, 140);
  rect(0, 0, W, H);

  const lv = LEVELS[levelIdx];
  const k = constrain((millis() - stateStart) / 380, 0, 1);

  push();
  translate(W / 2, H / 2);
  scale(easeOutBack(k));
  translate(-W / 2, -H / 2);

  fill(255);
  stroke(lv.color);
  strokeWeight(6);
  rect(180, 120, 600, 400, 28);
  noStroke();
  fill(lv.color);
  rect(180, 120, 600, 90, 28, 28, 0, 0);
  fill(255);
  textStyle(BOLD);
  textSize(32);
  text(`第 ${levelIdx + 1} 關　${lv.icon} ${lv.name}`, W / 2, 165);

  drawMascot(290, 390, 130, "happy");
  drawBubble(380, 245, 370, lv.intro, { size: 21 });

  fill(C.blue);
  textStyle(BOLD);
  textSize(18);
  text(`本關有 ${PER_LEVEL} 個挑戰，答對就能得到 ⭐`, 565, 400);
  pop();

  if (k >= 1) {
    drawButton("開始挑戰 ▶", 460, 432, 210, 56, startLevel, { color: C.pink, hover: C.darkPink });
    drawButton("✕", 728, 136, 40, 40, () => {
      playSound("click");
      setState("MAP");
    }, { size: 18, color: "rgba(0,0,0,0.25)", hover: "rgba(0,0,0,0.45)" });
  }
}

function startLevel() {
  playSound("click");
  qIdx = 0;
  setState("QUESTION");
  enterQuestion();
}

function enterQuestion() {
  selected = -1;
  const q = curQ();
  if (q.sound) setTimeout(() => playSound(q.sound), 300); // 鐘聲題自動播放
}

// ---- 答題畫面 ----
function drawQuestionTopBar() {
  const lv = LEVELS[levelIdx];
  push();
  noStroke();
  textStyle(BOLD);
  textSize(18);
  const label = `第 ${levelIdx + 1} 關・${lv.icon} ${lv.name}`;
  const tw = textWidth(label) + 40;
  fill(lv.color);
  rect(24, 14, tw, 44, 22);
  fill(255);
  text(label, 24 + tw / 2, 36);

  // 本關進度
  const n = plan[levelIdx].length;
  fill(C.blue);
  textSize(17);
  text(`挑戰 ${qIdx + 1} / ${n}`, W / 2, 28);
  for (let i = 0; i < n; i++) {
    fill(i < qIdx ? "#2DC653" : i === qIdx ? C.blue : color(255, 200));
    circle(W / 2 - (n - 1) * 12 + i * 24, 50, 11);
  }
  pop();
  drawStarCounter();
}

function drawQuestionScreen() {
  drawBackdrop(false);
  drawQuestionTopBar();

  const q = curQ();
  const lv = LEVELS[levelIdx];
  const cardX = 80, cardW = 800;
  const storyY = 70, storyH = 150;

  // 情境卡
  fill(255, 245);
  stroke(C.blue);
  strokeWeight(2);
  rect(cardX, storyY, cardW, storyH, 18);
  drawScenarioImage(q.type, cardX + 80, storyY + storyH / 2, 124);

  push();
  noStroke();
  fill(40);
  textSize(19);
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);
  const sl = getWrappedLines("【情境】" + q.story, cardW - 190);
  drawLines(sl, cardX + 162, storyY + storyH / 2 - ((sl.length - 1) * 30) / 2, 30);
  pop();

  // 鐘聲題：重播按鈕
  let qY = 268;
  if (q.sound) {
    drawButton("🔊 再聽一次鐘聲", W / 2 - 110, storyY + storyH + 12, 220, 42,
      () => playSound(q.sound), { size: 17, color: C.pink, hover: C.darkPink });
    qY = 306;
  }

  // 題目
  push();
  noStroke();
  fill(C.blue);
  textStyle(BOLD);
  textSize(22);
  const ql = getWrappedLines(q.question, 760);
  drawLines(ql, W / 2, qY, 32);
  pop();
  const optY0 = qY + (ql.length - 1) * 32 + 36;

  // 選項
  const optH = 62, gap = 12;
  for (let i = 0; i < q.options.length; i++) {
    const oy = optY0 + i * (optH + gap);
    const over = isOver(cardX, oy, cardW, optH);
    push();
    fill(over ? "#F0F7FF" : 255);
    stroke(over ? lv.color : "#A0C4E2");
    strokeWeight(over ? 3 : 1.5);
    rect(cardX, oy - (over ? 2 : 0), cardW, optH, 14);
    noStroke();
    fill(lv.color);
    rect(cardX + 12, oy + optH / 2 - 19, 38, 38, 10);
    fill(255);
    textStyle(BOLD);
    textSize(19);
    textAlign(CENTER, CENTER);
    text(String.fromCharCode(65 + i), cardX + 31, oy + optH / 2);
    fill(30);
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    const ol = getWrappedLines(q.options[i], cardW - 90);
    drawLines(ol, cardX + 66, oy + optH / 2 - ((ol.length - 1) * 24) / 2, 24);
    pop();
    addHit(cardX, oy, cardW, optH, () => chooseOption(i));
  }
}

function chooseOption(i) {
  selected = i;
  if (i === curQ().correct) {
    levelStars[levelIdx]++;
    playSound("correct");
  } else {
    playSound("wrong");
  }
  setState("EXPLANATION");
}

// ---- 解說畫面 ----
function drawExplanationScreen() {
  drawBackdrop(false);
  drawQuestionTopBar();

  const q = curQ();
  const ok = selected === q.correct;

  push();
  noStroke();
  textStyle(BOLD);
  textSize(34);
  fill(ok ? C.green : C.orange);
  text(ok ? "答對了！獲得一顆星 ⭐" : "差一點點！我們一起來學習", W / 2, 96);
  pop();

  const cx = 120, cw = 720, cy = 130, ch = 345;
  fill(255);
  stroke(ok ? "#4CAF50" : "#FF8A65");
  strokeWeight(4);
  rect(cx, cy, cw, ch, 22);
  drawScenarioImage(q.type, W / 2, cy + 72, 110);

  push();
  noStroke();
  let ty = cy + 152;
  if (!ok) {
    fill(C.green);
    textStyle(BOLD);
    textSize(19);
    const al = getWrappedLines(`正確答案：${String.fromCharCode(65 + q.correct)}　${q.options[q.correct]}`, cw - 60);
    drawLines(al, W / 2, ty, 28);
    ty += al.length * 28 + 10;
  }
  fill(40);
  textStyle(NORMAL);
  textSize(21);
  const el = getWrappedLines(q.explanation, cw - 70);
  drawLines(el, W / 2, ty + 8, 32);
  pop();

  drawMascot(140, 565, 80, ok ? "cheer" : "oops");
  drawBubble(195, 510, 300, ok ? "好棒！把這個好習慣記起來！" : "沒關係！知道正確做法就很棒了！", { size: 17 });

  const last = qIdx === plan[levelIdx].length - 1;
  drawButton(last ? "完成這一關 ✔" : "下一題 ▶", 600, 525, 240, 58, nextAfterExplanation);
}

function nextAfterExplanation() {
  playSound("click");
  if (qIdx < plan[levelIdx].length - 1) {
    qIdx++;
    setState("QUESTION");
    enterQuestion();
  } else {
    setState("LEVEL_CLEAR");
  }
}

// ---- 過關畫面（蓋章）----
function drawLevelClearScreen() {
  drawBackdrop();
  const lv = LEVELS[levelIdx];
  const got = levelStars[levelIdx];
  const n = plan[levelIdx].length;

  // 旋轉光芒
  push();
  translate(W / 2, 255);
  rotate(frameCount * 0.01);
  noStroke();
  fill(255, 230, 150, 110);
  for (let i = 0; i < 12; i++) {
    rotate(TWO_PI / 12);
    triangle(0, 0, -18, -150, 18, -150);
  }
  pop();

  push();
  textStyle(BOLD);
  textSize(42);
  stroke(255);
  strokeWeight(10);
  fill(255);
  text(`第 ${levelIdx + 1} 關　過關！`, W / 2, 70);
  noStroke();
  fill(lv.color);
  text(`第 ${levelIdx + 1} 關　過關！`, W / 2, 70);
  pop();

  // 印章從大縮小「蓋」下來
  const k = constrain((millis() - stateStart) / 420, 0, 1);
  push();
  translate(W / 2, 255);
  scale(lerp(2.6, 1, 1 - pow(1 - k, 3)));
  drawingContext.globalAlpha = k;
  noStroke();
  fill(255);
  circle(0, 0, 220);
  drawStamp(0, 0, 105, levelIdx);
  pop();

  for (let i = 0; i < n; i++) drawStar(W / 2 - (n - 1) * 40 + i * 80, 412, 30, 13, i < got);

  const msg = got === n ? "完美過關！你真是太厲害了！"
    : got > 0 ? "過關囉！答錯的題目要再想一想喔。"
      : "過關囉！解說裡的好方法要記住喔！";
  drawMascot(160, 555, 88, "cheer");
  drawBubble(220, 495, 320, msg, { size: 17 });

  if (k >= 1) {
    const last = levelIdx === LEVELS.length - 1;
    drawButton(last ? "領取新生護照 🎓" : "前往下一站 ➜", 600, 525, 260, 58, afterLevelClear,
      { color: C.pink, hover: C.darkPink });
  }
}

function afterLevelClear() {
  playSound("click");
  if (levelIdx < LEVELS.length - 1) {
    walk = { from: levelIdx, start: millis(), lastStep: -1 };
    levelIdx++;
    setState("MAP");
  } else {
    setState("RESULT");
  }
}

// ---- 結局：小一新生護照 ----
function getRank(t) {
  if (t === MAX_STARS) return { title: "校園小達人", msg: "全部答對！你已經完全準備好當小一新鮮人了！" };
  if (t >= 9) return { title: "準備好囉！", msg: "表現超棒！學校裡的規則你幾乎都知道了！" };
  if (t >= 6) return { title: "小小新鮮人", msg: "很不錯！再複習答錯的題目，你會更厲害！" };
  return { title: "見習新生", msg: "第一次接觸校園生活難免不熟悉，多玩幾次一定會越來越棒！" };
}

function drawResultScreen() {
  drawBackdrop();
  const total = totalStars();
  const rank = getRank(total);

  // 護照封面與內頁
  noStroke();
  fill(0, 40);
  rect(76, 58, 820, 500, 26);
  fill(C.blue);
  rect(70, 50, 820, 500, 26);
  fill("#FFF8E7");
  rect(90, 68, 385, 464, 16);
  rect(485, 68, 385, 464, 16);
  stroke("#E9D8B4");
  strokeWeight(2);
  line(480, 80, 480, 520);

  // 左頁
  push();
  noStroke();
  textAlign(CENTER, CENTER);
  fill(C.blue);
  textStyle(BOLD);
  textSize(30);
  text("小一新生護照", 282, 110);
  fill(150);
  textStyle(NORMAL);
  textSize(13);
  text("FIRST GRADE PASSPORT", 282, 142);
  pop();

  drawMascot(282, 250, 115, "cheer");

  push();
  noStroke();
  textAlign(CENTER, CENTER);
  fill(60);
  textSize(17);
  text("持照人：小一新鮮人", 282, 340);
  fill(C.pink);
  rect(172, 362, 220, 46, 23);
  fill(255);
  textStyle(BOLD);
  textSize(22);
  text(rank.title, 282, 385);
  pop();

  drawStar(220, 438, 15, 6.5, true);
  push();
  noStroke();
  fill(C.blue);
  textStyle(BOLD);
  textSize(20);
  textAlign(LEFT, CENTER);
  text(`獲得星星 ${total} / ${MAX_STARS}`, 242, 439);
  fill(70);
  textStyle(NORMAL);
  textSize(15);
  textAlign(CENTER, CENTER);
  const ml = getWrappedLines(rank.msg, 320);
  drawLines(ml, 282, 478, 24);
  pop();

  // 右頁：6 個關卡印章
  push();
  noStroke();
  fill(C.blue);
  textStyle(BOLD);
  textSize(24);
  text("闖關印章", 677, 105);
  pop();
  const xs = [562, 677, 792];
  const ys = [215, 385];
  for (let i = 0; i < LEVELS.length; i++) {
    const x = xs[i % 3];
    const y = ys[floor(i / 3)];
    drawStamp(x, y, 46, i);
    for (let k = 0; k < PER_LEVEL; k++) drawStar(x - 12 + k * 24, y + 68, 10, 4.5, k < levelStars[i]);
  }

  drawButton("再玩一次 🔄", W / 2 - 120, 572, 240, 56, () => {
    playSound("click");
    startGame(false);
  }, { color: C.pink, hover: C.darkPink });
}

// ==========================================
// 10. 滑鼠／觸控事件
// ==========================================
function mousePressed() {
  initAudio();
  if (millis() - lastClickTime < 200) return false; // 防止連點
  lastClickTime = millis();

  mx = (mouseX - offX) / sc;
  my = (mouseY - offY) / sc;

  // 從最上層的按鈕開始檢查
  for (let i = buttons.length - 1; i >= 0; i--) {
    const b = buttons[i];
    if (isOver(b.x, b.y, b.w, b.h)) {
      b.onClick();
      return false;
    }
  }
  if (state === "STORY") advanceStory();
  return false;
}
