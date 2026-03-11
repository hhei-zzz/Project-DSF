const button1 = document.querySelector("#deal");
const button2 = document.querySelector("#play");
const button3 = document.querySelector("#pass");
const button4 = document.querySelector("#clear");
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

function cardHtml(card, handName) {
  const n = displayNumber(card.number);
  const s = suitSymbol(card.suit);
  const red = (card.suit === "HEARTS" || card.suit === "DIAMONDS") ? "red" : "";
  return `<span class="card ${red}" data-number="${card.number}" data-suit="${card.suit}" data-hand="${handName}">${n}${s}</span>`;
}

function handHtml(title, cards, handName) {
  return `
    <div class="hand">
      <div class="hand-title">${title}</div>
      <div class="cards">${cards.map(card => cardHtml(card, handName)).join("")}</div>
    </div>
  `;
}

function getSelectedCards() {
  const selected = out.querySelectorAll(".card.selected");

  return Array.from(selected).map(card => ({
    number: Number(card.dataset.number),
    suit: card.dataset.suit,
    hand: card.dataset.hand
  }));
}

out.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const selectedCards = out.querySelectorAll(".card.selected");
  const clickedHand = card.dataset.hand;

  // if clicked card is already selected, unselect it
  if (card.classList.contains("selected")) {
    card.classList.remove("selected");
    return;
  }

  // if there are selected cards already, check they are from same hand
  if (selectedCards.length > 0) {
    const firstSelectedHand = selectedCards[0].dataset.hand;
    if (clickedHand !== firstSelectedHand) {
      return;
    }
  }

  // maximum 5 selected cards
  if (selectedCards.length >= 5) {
    return;
  }

  card.classList.add("selected");

  console.log(getSelectedCards());
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
      handHtml("Hand 1", sortedHands.hand1, "hand1") +
      handHtml("Hand 2", sortedHands.hand2, "hand2") +
      handHtml("Hand 3", sortedHands.hand3, "hand3") +
      handHtml("Hand 4", sortedHands.hand4, "hand4");
  } catch (err) {
    console.error(err);
    out.textContent = "Kunde inte hämta händer. Kolla Console (F12).";
  }
});

button2.addEventListener("click", async () => {

  const selectedCards = getSelectedCards();

  if (selectedCards.length === 0) {
    alert("Select cards first");
    return;
  }

  // Example simple validation
  if (selectedCards.length > 5) {
    alert("You can only play up to 5 cards");
    return;
  }

  try {

    const res = await fetch("http://13.48.46.48:3000/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cards: selectedCards
      })
    });

    const data = await res.json();

    console.log("Server response:", data);

    // remove cards from page after successful play
    const selectedEls = out.querySelectorAll(".card.selected");
    selectedEls.forEach(card => card.remove());

  } catch (err) {
    console.error(err);
  }

});

button3.addEventListener("click", async () => {


  const res = await fetch("http://13.48.46.48:3000/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cards: false
      })
    });



});

button4.addEventListener("click", async () => {
  // Hitta alla valda kort och ta bort "selected" klassen
  const selectedCards = document.querySelectorAll(".card.selected");
  
  selectedCards.forEach(card => {
    card.classList.remove("selected");
  });
  
  // Om du vill kan du logga att det är klart
  console.log("Alla kort är avmarkerade");
});
