const button1 = document.querySelector("#test");
//const button2 = document.querySelector("#sort");
const out = document.querySelector("#out");
const API_URL = "http://13.48.46.48:3000/deal";

function compareBig2(a,b) {
  if (a.number !== b.number) return b.number - a.number;

  return sortRank(b.suit) - sortRank(a.suit);
}


function sortRank(suit) {
  if (suit === "CLUBS") return 1;
  if (suit === "DIAMONDS") return 2;
  if (suit === "HEARTS") return 3;
  if (suit === "SPADES") return 4;
  return 0;
}


function displayNumber(n) {
  if (n === 11) return "J";
  if (n === 12) return "Q";
  if (n === 13) return "K";
  if (n === 14) return "A";
  if (n === 15) return "2";
  return String(n);
}

function suitSymbol(suit) {
  if (suit === "CLUBS") return "♣";
  if (suit === "DIAMONDS") return "♦";
  if (suit === "HEARTS") return "♥";
  if (suit === "SPADES") return "♠";
  return suit;
}

function cardHtml(card) {
  const n = displayNumber(card.number);
  const s = suitSymbol(card.suit);
  const red = (card.suit === "HEARTS" || card.suit === "DIAMONDS") ? "red" : "";
  return `<span class="card ${red}">${n}${s}</span>`;
}

function handHtml(title, cards) {
  return `
    <div class="hand">
      <div class="hand-title">${title}</div>
      <div class="cards">${cards.map(cardHtml).join("")}</div>
    </div>
  `;
}

button1.addEventListener("click", async () => {
  const res = await fetch(API_URL);
  const hands = await res.json();

  const sortedHands = {
    hand1: [...hands.hand1].sort(compareBig2),
    hand2: [...hands.hand2].sort(compareBig2),
    hand3: [...hands.hand3].sort(compareBig2),
    hand4: [...hands.hand4].sort(compareBig2),
  };

  // ✅ render currentHand (sorted)
  out.innerHTML =
    handHtml("Hand 1", sortedHands.hand1) +
    handHtml("Hand 2", sortedHands.hand2) +
    handHtml("Hand 3", sortedHands.hand3) +
    handHtml("Hand 4", sortedHands.hand4);
});

