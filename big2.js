const API_BASE = "https://big2online.com";

const buttonPlay = document.querySelector("#play");
const buttonPass = document.querySelector("#pass");
const buttonClear = document.querySelector("#clear");
const buttonReady = document.querySelector("#ready");
const toggleSessionHistoryButton = document.querySelector("#toggle-session-history");
const sessionHistoryPanel = document.querySelector("#session-history-panel");
const sessionHistoryContent = document.querySelector("#session-history-content");
const playerStatusContent = document.querySelector("#player-status-content");
const togglePastSessionsButton = document.querySelector("#toggle-past-sessions");
const pastSessionsPanel = document.querySelector("#past-sessions-panel");
const pastSessionsList = document.querySelector("#past-sessions-list");
const pastSessionSummary = document.querySelector("#past-session-summary");


const out = document.querySelector("#out");
const historyContent = document.querySelector(".history-content");

const playerId = sessionStorage.getItem("player_id");
const playerName = sessionStorage.getItem("player_name");

let readyCheck = null;
let lastKnownStatus = null;
let winnerAlertShown = false;

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
  if (suit === "CLUBS") return 2;
  if (suit === "DIAMONDS") return 1;
  if (suit === "HEARTS") return 3;
  if (suit === "SPADES") return 4;
  return 0;
}

const BIG_TWO_RANK = {
  3: 1,
  4: 2,
  5: 3,
  6: 4,
  7: 5,
  8: 6,
  9: 7,
  10: 8,
  11: 9,
  12: 10,
  13: 11,
  14: 12,
  15: 13
};

const FIVE_CARD_TYPE = {
  STRAIGHT: 1,
  FLUSH: 2,
  FULL_HOUSE: 3,
  FOUR_OF_A_KIND: 4,
  STRAIGHT_FLUSH: 5
};

function cardPower(card) {
  return BIG_TWO_RANK[card.number];
}

function sortByPower(hand) {
  return [...hand].sort((a, b) => {
    if (cardPower(b) !== cardPower(a)) {
      return cardPower(b) - cardPower(a);
    }

    return suitRank(b.suit) - suitRank(a.suit);
  });
}

async function isValidPlay(selected) {
  const turnData = await getCurrentTurnData();

  if (Number(playerId) !== Number(turnData.current_turn_player_id)) {
    alert("Not your turn");
    return false;
  }

  const count = selected.length;

  if (count === 0) return false;

  const firstPlayRequired = await isFirstPlayOfGame();

  if (firstPlayRequired) {
    if (!hasThreeOfDiamonds(selected)) {
      alert("First play of the game must include 3♦.");
      return false;
    }

    if (count === 1) return true;
    if (count === 2) return checkPair(selected);
    if (count === 3) return checkThreeOfAKind(selected);
    if (count === 5) return compareFive(selected, []);

    alert("Du får bara spela 1, 2, 3 eller 5 kort.");
    return false;
  }

  const tableCards = await getTableCards();
  const tableCount = tableCards.length;

  if (tableCount > 0 && count !== tableCount) {
    alert("Du måste lägga lika många kort som ligger på bordet.");
    return false;
  }

  if (count === 1) return compareOne(selected, tableCards);
  if (count === 2) return checkPair(selected) && comparePair(selected, tableCards);
  if (count === 3) return checkThreeOfAKind(selected) && compareThreeOfAKind(selected, tableCards);
  if (count === 5) return compareFive(selected, tableCards);

  alert("Du får bara spela 1, 2, 3 eller 5 kort.");
  return false;
}

function compareOne(current, previous) {
  if (!previous || previous.length === 0) return true;

  const a = current[0];
  const b = previous[0];

  if (cardPower(a) > cardPower(b)) return true;
  if (cardPower(a) < cardPower(b)) {
    alert("Your hand is weaker than the previously played hand.");
    return false;
  }

  if (suitRank(a.suit) > suitRank(b.suit)) return true;

  alert("Your hand is weaker than the previously played hand.");
  return false;
}

function checkPair(hand) {
  return hand.length === 2 && hand[0].number === hand[1].number;
}

function comparePair(current, previous) {
  if (!previous || previous.length === 0) return true;

  if (!checkPair(current)) {
    alert("You have to play a pair.");
    return false;
  }

  const currentSorted = sortByPower(current);
  const previousSorted = sortByPower(previous);

  const a = currentSorted[0];
  const b = previousSorted[0];

  if (cardPower(a) > cardPower(b)) return true;
  if (cardPower(a) < cardPower(b)) {
    alert("Your hand is weaker than the previously played hand.");
    return false;
  }

  if (suitRank(a.suit) > suitRank(b.suit)) return true;

  alert("Your hand is weaker than the previously played hand.");
  return false;
}

function checkThreeOfAKind(hand) {
  return (
    hand.length === 3 &&
    hand[0].number === hand[1].number &&
    hand[1].number === hand[2].number
  );
}

function compareThreeOfAKind(current, previous) {
  if (!previous || previous.length === 0) return true;

  if (!checkThreeOfAKind(current)) {
    alert("You have to play trips.");
    return false;
  }

  if (cardPower(current[0]) > cardPower(previous[0])) return true;

  alert("Your hand is weaker than the previously played hand.");
  return false;
}

function checkStraight(hand) {
  if (hand.length !== 5) return false;

  const nums = hand.map(c => c.number).sort((a, b) => a - b);
  const normalStraight = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);

  const specialLowStraight =
    nums.join(",") === "3,4,5,14,15"; // 3-4-5-A-2

  return normalStraight || specialLowStraight;
}

function checkFlush(hand) {
  return hand.length === 5 && hand.every(c => c.suit === hand[0].suit);
}

function checkFullHouse(hand) {
  if (hand.length !== 5) return false;

  const counts = {};

  for (const card of hand) {
    counts[card.number] = (counts[card.number] || 0) + 1;
  }

  const values = Object.values(counts).sort((a, b) => a - b);

  return values[0] === 2 && values[1] === 3;
}

function checkFourOfAKind(hand) {
  if (hand.length !== 5) return false;

  const counts = {};

  for (const card of hand) {
    counts[card.number] = (counts[card.number] || 0) + 1;
  }

  return Object.values(counts).includes(4);
}

function checkStraightFlush(hand) {
  return checkStraight(hand) && checkFlush(hand);
}

function getFiveCardType(hand) {
  if (checkStraightFlush(hand)) return FIVE_CARD_TYPE.STRAIGHT_FLUSH;
  if (checkFourOfAKind(hand)) return FIVE_CARD_TYPE.FOUR_OF_A_KIND;
  if (checkFullHouse(hand)) return FIVE_CARD_TYPE.FULL_HOUSE;
  if (checkFlush(hand)) return FIVE_CARD_TYPE.FLUSH;
  if (checkStraight(hand)) return FIVE_CARD_TYPE.STRAIGHT;

  return 0;
}

function checkFive(hand) {
  return hand.length === 5 && getFiveCardType(hand) > 0;
}

function getGroupNumber(hand, amount) {
  const counts = {};

  for (const card of hand) {
    counts[card.number] = (counts[card.number] || 0) + 1;
  }

  for (const number in counts) {
    if (counts[number] === amount) {
      return Number(number);
    }
  }

  return null;
}

function compareFive(current, previous) {

  const currentType = getFiveCardType(current);

  if (currentType === 0) {
    alert("Illegitimate 5 cards hand.");
    return false;
  }  

  if (!previous || previous.length === 0) return true;

  const previousType = getFiveCardType(previous);

  if (currentType > previousType) return true;

  if (currentType < previousType) {
    alert("Your hand is weaker than the previously played hand.");
    return false;
  }

  if (currentType === FIVE_CARD_TYPE.FULL_HOUSE) {
    const currentThree = getGroupNumber(current, 3);
    const previousThree = getGroupNumber(previous, 3);

    if (BIG_TWO_RANK[currentThree] > BIG_TWO_RANK[previousThree]) return true;

    alert("Your hand is weaker than the previously played hand.");
    return false;
  }

  if (currentType === FIVE_CARD_TYPE.FOUR_OF_A_KIND) {
    const currentFour = getGroupNumber(current, 4);
    const previousFour = getGroupNumber(previous, 4);

    if (BIG_TWO_RANK[currentFour] > BIG_TWO_RANK[previousFour]) return true;

    alert("Your hand is weaker than the previously played hand.");
    return false;
  }

  const currentSorted = sortByPower(current);
  const previousSorted = sortByPower(previous);

  for (let i = 0; i < 5; i++) {
    const a = currentSorted[i];
    const b = previousSorted[i];

    if (cardPower(a) > cardPower(b)) return true;
    if (cardPower(a) < cardPower(b)) {
      alert("Your hand is weaker than the previously played hand.");
      return false;
    }

    if (suitRank(a.suit) > suitRank(b.suit)) return true;
    if (suitRank(a.suit) < suitRank(b.suit)) {
      alert("Your hand is weaker than the previously played hand.");
      return false;
    }
  }

  alert("Your hand is weaker than the previously played hand.");
  return false;
}

function hasThreeOfDiamonds(cards) {
  return cards.some(card =>
    Number(card.card_id) === 2 ||
    (Number(card.number) === 3 && card.suit === "DIAMONDS")
  );
}

async function getCurrentTurnData() {
  const res = await fetch(`${API_BASE}/current-turn/${playerId}`);
  return await res.json();
}

async function isFirstPlayOfGame() {
  const res = await fetch(`${API_BASE}/first-play-required/${playerId}`);
  const data = await res.json();
  return data.first_play_required;
}

function hasThreeOfDiamonds(cards) {
  return cards.some(card =>
    card.card_id === 2 ||
    (card.number === 3 && card.suit === "DIAMONDS")
  );
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

async function getTableCards() {
  const res = await fetch(`${API_BASE}/table-cards/${playerId}`);

  if (!res.ok) {
    console.error("Could not load table cards");
    return [];
  }

  return await res.json();
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

    const turnInfo = document.querySelector("#turn-info");
    if (turnInfo) {
      turnInfo.textContent = data.current_turn_player_name
        ? `Current turn: ${data.current_turn_player_name}`
        : `Current turn: not set yet`;
    }

    if (Number(data.current_turn_player_id) === Number(playerId)) {
      document.body.classList.add("your-turn");
    } else {
      document.body.classList.remove("your-turn");
    }

    const roundInfo = document.querySelector("#round-info");
    if (roundInfo) {
      roundInfo.textContent = `Current Round ${data.round_number}`;
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadSessionHistory() {
  try {
    const res = await fetch(`${API_BASE}/session-history/${playerId}`);
    const rounds = await res.json();

    if (!res.ok) {
      sessionHistoryContent.innerHTML = "<div>Could not load session history.</div>";
      return;
    }

    if (!rounds || rounds.length === 0) {
      sessionHistoryContent.innerHTML = "<div>No rounds finished yet.</div>";
      return;
    }

    sessionHistoryContent.innerHTML = rounds.map(round => {
      const rows = round.players.map(player => {
        const pointsClass =
          Number(player.round_change) >= 0 ? "score-positive" : "score-negative";

        const winnerClass = player.is_winner ? "winner" : "";

        return `
          <div class="round-score-row ${winnerClass}">
            <div>${player.is_winner ? "🏆 " : ""}${player.player_name}</div>
            <div>${player.cards_left}</div>
            <div class="${pointsClass}">
              ${player.round_change > 0 ? "+" : ""}${player.round_change}
            </div>
            <div>${player.total_points}</div>
          </div>
        `;
      }).join("");

      return `
        <div class="round-history-card">
          <div class="round-history-title">
            Round ${round.round_number} - Winner: ${round.winner_name}
          </div>

          <div class="round-score-header">
            <div>Player</div>
            <div>Cards Left</div>
            <div>Won/Lost</div>
            <div>Total</div>
          </div>

          ${rows}
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error(err);
    sessionHistoryContent.innerHTML = "<div>Could not load session history.</div>";
  }
}

if (toggleSessionHistoryButton) {
  toggleSessionHistoryButton.addEventListener("click", async () => {
    sessionHistoryPanel.classList.toggle("hidden");

    if (!sessionHistoryPanel.classList.contains("hidden")) {
      await loadSessionHistory();
    }
  });
}

async function loadPlayerStatus() {
  try {
    const res = await fetch(`${API_BASE}/player-status/${playerId}`);
    const players = await res.json();

    const turnRes = await fetch(`${API_BASE}/current-turn/${playerId}`);
    const turnData = await turnRes.json();

    if (!res.ok) {
      playerStatusContent.innerHTML = "Could not load players.";
      return;
    }

    playerStatusContent.innerHTML = players.map(player => {

      const oneCardClass =
        Number(player.cards_left) === 1 ? "one-card" : "";

      const currentTurnClass =
        Number(player.id) === Number(turnData.current_turn_player_id)
          ? "current-turn"
          : "";

      return `
        <div class="player-status-row ${oneCardClass} ${currentTurnClass}">
          <span>${player.name}</span>
          <span>${player.cards_left} cards</span>
        </div>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
    playerStatusContent.innerHTML = "Could not load players.";
  }
}
async function loadPastSessions() {
  try {
    const res = await fetch(`${API_BASE}/past-sessions/${playerId}`);
    const sessions = await res.json();

    if (!sessions || sessions.length === 0) {
      pastSessionsList.innerHTML = "<div>No past sessions yet.</div>";
      pastSessionSummary.innerHTML = "";
      return;
    }

    pastSessionsList.innerHTML = sessions.map(session => `
      <button class="past-session-button" data-game-id="${session.game_id}">
        Game ${session.game_id} - ${session.total_rounds} rounds
      </button>
    `).join("");

    document.querySelectorAll(".past-session-button").forEach(button => {
      button.addEventListener("click", async () => {
        const gameId = button.dataset.gameId;
        await loadPastSessionSummary(gameId);
      });
    });
  } catch (err) {
    console.error(err);
    pastSessionsList.innerHTML = "<div>Could not load past sessions.</div>";
  }
}

async function loadPastSessionSummary(gameId) {
  try {
    const res = await fetch(`${API_BASE}/past-session-summary/${gameId}`);
    const data = await res.json();

    if (!data.players || data.players.length === 0) {
      pastSessionSummary.innerHTML = "<div>No score data for this session.</div>";
      return;
    }

    pastSessionSummary.innerHTML = `
      <div class="past-session-summary-card">
        <h3>Game ${data.game_id}</h3>
        <div>Total rounds: ${data.total_rounds}</div>
        <hr>
        ${data.players.map(player => `
          <div class="past-session-player-row">
            <span>${player.player_name}</span>
            <strong>${player.total_points}</strong>
          </div>
        `).join("")}
      </div>
    `;
  } catch (err) {
    console.error(err);
    pastSessionSummary.innerHTML = "<div>Could not load session summary.</div>";
  }
}

if (togglePastSessionsButton) {
  togglePastSessionsButton.addEventListener("click", async () => {
    pastSessionsPanel.classList.toggle("hidden");

    if (!pastSessionsPanel.classList.contains("hidden")) {
      await loadPastSessions();
    }
  });
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

async function checkWinnerStatus() {
  try {
    const res = await fetch(`${API_BASE}/winner-status/${playerId}`);
    const data = await res.json();

    if (!res.ok) return;

    if (lastKnownStatus === null) {
      lastKnownStatus = data.status;
    }

    if (data.status === "WAITING" && data.last_winner_name && !winnerAlertShown) {
      winnerAlertShown = true;

      alert(`${data.last_winner_name} won the round. Everyone must click ready again.`);

      out.innerHTML = "";
      historyContent.innerHTML = "";
      await loadCurrentTurn();
    }

    if (data.status === "ACTIVE") {
      winnerAlertShown = false;
    }

    lastKnownStatus = data.status;
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

  const valid = await isValidPlay(selectedCards);

  if (!valid) {
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
      await loadPlayerStatus();
      return;
    }

    if (data.status === "board_cleared") {

      historyContent.innerHTML = "";

      await loadMyHand();
      await loadRoundHistory();
      await loadCurrentTurn();
      await loadPlayerStatus();

      return;
    }

    await loadMyHand();
    await loadRoundHistory();
    await loadCurrentTurn();
    await loadPlayerStatus();

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

      await loadRoundHistory();
      await loadCurrentTurn();
      await loadPlayerStatus();

      return;
    }

    await loadRoundHistory();
    await loadCurrentTurn();
    await loadPlayerStatus();

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
setInterval(loadPlayerStatus, 2000);

checkIfGameStarted();
loadRoundHistory();
loadCurrentTurn();
loadPlayerStatus();
setInterval(checkWinnerStatus, 2000);