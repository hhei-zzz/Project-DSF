const button2 = document.querySelector("#play");
const button3 = document.querySelector("#pass");
const button4 = document.querySelector("#clear");
const out = document.querySelector("#out");
const historyBox = document.querySelector("#history");
const historyContent = document.querySelector(".history-content");
const button5 = document.querySelector("#ready")


const playerId = sessionStorage.getItem("player_id");
const playerName = sessionStorage.getItem("player_name");

document.querySelector("#player-title").textContent = `${playerName}'s Hand`;

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
  if (a.number !== b.number) return b.number - a.number;
  return suitRank(b.suit) - suitRank(a.suit);
}

function cardHtml(card) {
  const n = displayNumber(card.number);
  const s = suitSymbol(card.suit);
  const red = (card.suit === "HEARTS" || card.suit === "DIAMONDS") ? "red" : "";
  return `<span class="card ${red}" data-card-id="${card.id}" data-number="${card.number}" data-suit="${card.suit}">${n}${s}</span>`;
}

function handHtml(cards) {
  return `
    <div class="hand">
      <div class="hand-title">Your Hand</div>
      <div class="cards">${cards.map(cardHtml).join("")}</div>
    </div>
  `;
}

function getSelectedCards() {
  const selected = out.querySelectorAll(".card.selected");
  return Array.from(selected).map(card => ({
    card_id: Number(card.dataset.cardId),
    number: Number(card.dataset.number),
    suit: card.dataset.suit
  }));
}

out.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const selectedCards = out.querySelectorAll(".card.selected");

  if (card.classList.contains("selected")) {
    card.classList.remove("selected");
    return;
  }

  if (selectedCards.length >= 5) return;

  card.classList.add("selected");
});

async function loadMyHand() {
  try {
    const res = await fetch(`http://13.48.46.48:3000/hand/${playerId}`);
    const cards = await res.json();
    const sorted = [...cards].sort(compareBig2);
    out.innerHTML = handHtml(sorted);
  } catch (err) {
    console.error(err);
    out.textContent = "Could not load hand";
  }
}

historyBox.addEventListener("mouseenter", loadLastHandPlayed);

async function loadLastHandPlayed() {
  try {
    const res = await fetch("http://13.48.46.48:3000/history");
    const moves = await res.json();

    const lastPlay = moves[0];

    if (!lastPlay) {
      historyContent.innerHTML = "<div>No hand has been played yet.</div>";
      return;
    }

    if (lastPlay.move_type === "PASS") {
      historyContent.innerHTML = `<div>Player ${lastPlay.player_id}: Passed</div>`;
    } else {
      const cards = JSON.parse(lastPlay.cards_json);
      const cardText = cards.map(card =>
        `${displayNumber(card.number)}${suitSymbol(card.suit)}`
      ).join(" ");

      historyContent.innerHTML = `<div>Player ${lastPlay.player_id}: ${cardText}</div>`;
    }
  } catch (err) {
    console.error(err);
    historyContent.innerHTML = "<div>Could not get history</div>";
  }
}

button2.addEventListener("click", async () => {
  const selectedCards = getSelectedCards();

  if (selectedCards.length === 0) {
    alert("Select cards first");
    return;
  }

  try {
    const res = await fetch("http://13.48.46.48:3000/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_id: Number(playerId),
        cards: selectedCards
      })
    });

    const data = await res.json();
    console.log(data);
    loadMyHand();
  } catch (err) {
    console.error(err);
  }
});

button3.addEventListener("click", async () => {
  try {
    const res = await fetch("http://13.48.46.48:3000/pass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_id: Number(playerId)
      })
    });

    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
});

button4.addEventListener("click", () => {
  document.querySelectorAll(".card.selected").forEach(card => {
    card.classList.remove("selected");
  });
});


button5.addEventListener("click", async () => {
  try {
    const res = await fetch("http://13.48.46.48:3000/ready", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_id: Number(playerId)
      })
    });

    const data = await res.json();
    console.log(data);

    if (data.status === "all_ready") {
      alert("All players are ready. Cards have been dealt.");
      loadMyHand();
    } else {
      alert("You are marked as ready. Waiting for other players.");
    }

  } catch (err) {
    console.error(err);
    alert("Could not set ready");
  }
});

loadMyHand();