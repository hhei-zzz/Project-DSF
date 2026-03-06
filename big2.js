const button1 = document.querySelector("#test");
const button2 = document.querySelector("#play");
const out = document.querySelector("#out");

// IMPORTANT: use your EC2 public IP (NOT 127.0.0.1) when running in your browser on your own computer
const API_URL = "http://13.48.46.48:3000/deal";

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

function suitRank(suit) {
  if (suit === "CLUBS") return 1;
  if (suit === "DIAMONDS") return 2;
  if (suit === "HEARTS") return 3;
  if (suit === "SPADES") return 4;
  return 0;
}

function compareBig2(a, b) {
  if (a.number !== b.number) return b.number - a.number;      // high number first
  return suitRank(b.suit) - suitRank(a.suit);                // spades highest
}

function cardHtml(card) {
  const n = displayNumber(card.number);
  const s = suitSymbol(card.suit);
  const red = (card.suit === "HEARTS" || card.suit === "DIAMONDS") ? "red" : "";
  return `<span class="card ${red}" data-number="${card.number}" data-suit="${card.suit}">${n}${s}</span>`;
}

function handHtml(title, cards) {
  return `
    <div class="hand">
      <div class="hand-title">${title}</div>
      <div class="cards">${cards.map(cardHtml).join("")}</div>
    </div>
  `;
}

out.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const selectedCards = out.querySelectorAll(".card.selected");

  // if card already selected → allow unselect

  if (card.classList.contains("selected")) {
    card.classList.remove("selected");
    return;
  }

  // prevent selecting more than 5

  if (selectedCards.length >= 5) {
    return;
  }

  const number = card.dataset.number;
  const suit = card.dataset.suit;

  console.log(number, suit);
  
  card.classList.toggle("selected");

  card.classList.add("selected");
});

button1.addEventListener("click", async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const hands = await res.json();

    const sortedHands = {
      hand1: [...hands.hand1].sort(compareBig2),
      hand2: [...hands.hand2].sort(compareBig2),
      hand3: [...hands.hand3].sort(compareBig2),
      hand4: [...hands.hand4].sort(compareBig2),
    };

    out.innerHTML =
      handHtml("Hand 1", sortedHands.hand1) +
      handHtml("Hand 2", sortedHands.hand2) +
      handHtml("Hand 3", sortedHands.hand3) +
      handHtml("Hand 4", sortedHands.hand4);
  } catch (err) {
    console.error(err);
    out.textContent = "Kunde inte hämta händer. Kolla Console (F12).";
  }
});
