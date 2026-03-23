const API_BASE = "http://13.48.46.48";

const buttonPlay = document.querySelector("#play");
const buttonPass = document.querySelector("#pass");
const buttonClear = document.querySelector("#clear");
const buttonReady = document.querySelector("#ready");

const out = document.querySelector("#out");
const historyContent = document.querySelector(".history-content");

const playerId = sessionStorage.getItem("player_id");
const playerName = sessionStorage.getItem("player_name");

let readyCheck = null;

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

buttonClear.addEventListener("click", () => {
  out.querySelectorAll(".card.selected").forEach(card => {
    card.classList.remove("selected");
  });
});

async function loadMyHand() {
  try {
    const res = await fetch(`${API_BASE}/hand/${playerId}`);
    const cards = await res.json();
    const sorted = [...cards].sort(compareBig2);
    out.innerHTML = handHtml(sorted);
  } catch (err) {
    console.error(err);
    out.textContent = "Could not load hand";
  }
}

async function loadRoundHistory() {
  try {
    const res = await fetch(`${API_BASE}/history/${playerId}`);
    const moves = await res.json();

    if (!moves || moves.length === 0) {
      historyContent.innerHTML = "<div>No moves yet.</div>";
      return;
    }

    historyContent.innerHTML = moves
      .slice()
      .reverse()
      .map(move => {
        if (move.move_type === "PASS") {
          return `<div>${move.player_name}: Passed</div>`;
        }

        let cards = [];
        try {
          cards = JSON.parse(move.cards_json || "[]");
        } catch {
          cards = [];
        }

        const cardText = cards.map(card =>
          `${displayNumber(card.number)}${suitSymbol(card.suit)}`
        ).join(" ");

        return `<div>${move.player_name}: ${cardText}</div>`;
      })
      .join("");
  } catch (err) {
    console.error(err);
    historyContent.innerHTML = "<div>Could not load history</div>";
  }
}

async function loadCurrentTurn() {
  try {
    const res = await fetch(`${API_BASE}/current-turn/${playerId}`);
    const data = await res.json();

    const existing = document.querySelector("#turn-info");
    if (existing) {
      existing.textContent = data.current_turn_player_name
        ? `Current turn: ${data.current_turn_player_name}`
        : `Current turn: not set yet`;
    }
  } catch (err) {
    console.error(err);
  }
}

async function checkIfGameStarted() {
  try {
    const res = await fetch(`${API_BASE}/game-status/${playerId}`);
    const data = await res.json();

    if (data.status === "ACTIVE") {
      if (readyCheck) {
        clearInterval(readyCheck);
        readyCheck = null;
      }

      await loadMyHand();
      await loadRoundHistory();
      await loadCurrentTurn();
    }
  } catch (err) {
    console.error(err);
  }
}

buttonPlay.addEventListener("click", async () => {
  const selectedCards = getSelectedCards();

  if (selectedCards.length === 0) {
    alert("Select cards first");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/play`, {
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

    if (data.error) {
      alert(data.error);
      return;
    }

    if (data.status === "round_won") {
      alert(`Round won by player ${data.winner}. Everyone must click ready again.`);
      out.innerHTML = "";
      await loadRoundHistory();
      await loadCurrentTurn();
      return;
    }

    await loadMyHand();
    await loadRoundHistory();
    await loadCurrentTurn();
  } catch (err) {
    console.error(err);
    alert("Could not play");
  }
});

buttonPass.addEventListener("click", async () => {
  try {
    const res = await fetch(`${API_BASE}/pass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_id: Number(playerId)
      })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    if (data.status === "board_cleared") {
      historyContent.innerHTML = "";
      await loadCurrentTurn();
      return;
    }

    await loadRoundHistory();
    await loadCurrentTurn();
  } catch (err) {
    console.error(err);
    alert("Could not pass");
  }
});

buttonReady.addEventListener("click", async () => {
  try {
    const res = await fetch(`${API_BASE}/ready`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_id: Number(playerId)
      })
    });

    const data = await res.json();

    if (data.status === "all_ready") {
      if (data.board_cleared) {
        historyContent.innerHTML = "";
      } else {
        await loadRoundHistory();
      }

      await loadCurrentTurn();
      await loadMyHand();
    } else {
      if (!readyCheck) {
        readyCheck = setInterval(checkIfGameStarted, 2000);
        alert("Waiting for player to click ready");
      }
    }
  } catch (err) {
    console.error(err);
    alert("Could not set ready");
  }
});

setInterval(loadRoundHistory, 3000);
setInterval(loadCurrentTurn, 2000);

checkIfGameStarted();
loadRoundHistory();
loadCurrentTurn();