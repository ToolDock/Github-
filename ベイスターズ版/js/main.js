// ポジションの英語表記
const POS_EN = { "投手": "Pitcher", "捕手": "Catcher", "内野手": "Infielder", "外野手": "Outfielder" };

// 選手カード1枚分のHTML要素を作る
function makeCard(p, tag) {
  const isMaki = p.name === "牧 秀悟";
  // 牧のカードはリンクにする
  const card = document.createElement(isMaki ? "a" : tag);
  card.className = "playerCard";
  card.innerHTML =
    '<div class="cardNo">' + p.no + "</div>" +
    '<div class="cardName">' + p.name + "</div>" +
    '<span class="cardPos">' + POS_EN[p.pos] + "</span>" +
    (p.dev ? '<span class="cardDev">育成</span>' : "");
  // 牧のカードだけ、マウスを乗せると写真が出る
  if (isMaki) {
    card.classList.add("special");
    // クリックで球団公式サイトの牧選手のページを新しいタブで開く
    card.href = "https://www.baystars.co.jp/players/detail/2000035";
    card.target = "_blank";
    card.title = "牧 秀悟選手の公式プロフィールを見る";
    card.insertAdjacentHTML("afterbegin", '<img class="cardPhoto" src="image/maki.png" alt="牧 秀悟選手">');
  }
  return card;
}

// トップ：選手紹介のベルトコンベア
function buildConveyor(trackId, list) {
  const track = document.getElementById(trackId);
  if (!track) return;
  // 同じ並びを2回入れて、継ぎ目なくループさせる
  for (let i = 0; i < 2; i++) {
    for (const p of list) {
      const card = makeCard(p, "a");
      // 牧以外は選手名鑑のその選手へ
      if (!card.classList.contains("special")) {
        card.href = "players.html?q=" + encodeURIComponent(p.name);
        card.title = p.name + " を選手名鑑で見る";
      }
      track.appendChild(card);
    }
  }
  // 人数が多いほどゆっくり流し、1枚あたりの速さをそろえる
  track.style.setProperty("--duration", list.length * 3 + "s");
}

const regular = PLAYERS.filter(p => !p.dev);
buildConveyor("trackPitchers", regular.filter(p => p.pos === "投手"));
buildConveyor("trackFielders", regular.filter(p => p.pos !== "投手"));

// 選手名鑑：検索・絞り込み
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  const grid = document.getElementById("playerGrid");
  const count = document.getElementById("resultCount");
  const devCheck = document.getElementById("devCheck");
  const chips = document.querySelectorAll(".chip");
  let pos = "すべて";

  // 空白の有無や全角半角の違いを無視して比べられる形にそろえる
  const norm = s => s.normalize("NFKC").replace(/\s/g, "").toLowerCase();

  function render() {
    const q = norm(searchInput.value);
    const hits = PLAYERS.filter(p =>
      (pos === "すべて" || p.pos === pos) &&
      (devCheck.checked || !p.dev) &&
      (q === "" || norm(p.name).includes(q) || p.no === q)
    );
    grid.innerHTML = "";
    for (const p of hits) grid.appendChild(makeCard(p, "div"));
    if (hits.length === 0) {
      grid.innerHTML = '<p class="empty">該当する選手が見つかりませんでした</p>';
    }
    count.textContent = hits.length;
  }

  chips.forEach(chip => chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("on"));
    chip.classList.add("on");
    pos = chip.dataset.pos;
    render();
  }));
  searchInput.addEventListener("input", render);
  devCheck.addEventListener("change", render);

  // トップのカードから来たときは、その選手名で検索した状態にする
  const fromTop = new URLSearchParams(location.search).get("q");
  if (fromTop) searchInput.value = fromTop;
  render();
}

// トップ：背景できらめく星
const hero = document.querySelector(".hero");
if (hero) {
  for (let i = 0; i < 24; i++) {
    const s = document.createElement("span");
    s.className = "twinkle";
    s.textContent = "★";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 85 + "%";
    s.style.fontSize = 8 + Math.random() * 14 + "px";
    s.style.animationDelay = Math.random() * 3 + "s";
    hero.appendChild(s);
  }
}

// 隠しコマンド：「ILOVEYOKOHAMA」と入力するとBGM
const bgm = new Audio("bgm/atsukihoshi.mp3");
bgm.loop = true;
const bar = document.getElementById("nowPlaying");
let starTimer = null;

function fever() {
  if (!bgm.paused) return;
  bgm.currentTime = 0;
  bgm.play().catch(() => {
    alertBar("♪ bgm フォルダに atsukihoshi.mp3 を置くと音楽が流れます");
  });
  document.body.classList.add("fever");
  bar.querySelector(".nowText").innerHTML = '<span class="note">♪</span> 熱き星たちよ';
  bar.classList.add("show");
  starTimer = setInterval(dropStar, 120);
}

function stopFever() {
  bgm.pause();
  document.body.classList.remove("fever");
  bar.classList.remove("show");
  clearInterval(starTimer);
}

// 音楽ファイルがないときは、その旨をバーに表示する
function alertBar(msg) {
  bar.querySelector(".nowText").textContent = msg;
}

// 金色の星を1つ画面上から降らせる
function dropStar() {
  const s = document.createElement("span");
  s.className = "fallingStar";
  s.textContent = "★";
  s.style.left = Math.random() * 100 + "vw";
  s.style.fontSize = 14 + Math.random() * 26 + "px";
  s.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";
  document.body.appendChild(s);
  s.addEventListener("animationend", () => s.remove());
}

// キーボード：直近に押した文字が「ILOVEYOKOHAMA」になったら発動（大文字・小文字は区別しない）
const SECRET = "iloveyokohama";
let typed = "";
document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT") return;
  if (e.key.length !== 1) return; // Shiftなど文字以外のキーは無視
  typed = (typed + e.key.toLowerCase()).slice(-SECRET.length);
  if (typed === SECRET) fever();
});

document.getElementById("stopBgm").addEventListener("click", stopFever);
