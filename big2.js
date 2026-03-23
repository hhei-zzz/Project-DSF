const buttonPlay = document.querySelector("#play");
const buttonPass = document.querySelector("#pass");
const buttonClear = document.querySelector("#clear");
const buttonReady = document.querySelector("#ready");

const out = document.querySelector("#out");
const historyContent = document.querySelector("#history-content");
const roundInfo = document.querySelector("#round-info");

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

//Här börjar funktionerna för ettkort,par,triss,femkort
function CheckOne(hand){
  if (hand.length === 1){return true;}
  else{return false;}
}
function CompareOne(current, previous) {
    //1. Kollar om numret är högre.
    //2. Kollar det är samma nummer och isf om "mönstret" är högre.
    //Tips: Använd or eftersom att den kommer returnera såfort den ser true.
    if (CheckOne(current) && IsOne(previous)){ //dont think i need a previous
      return (current.number > previous.number) || (current.number === previous.number && suitRank(current.suit) > suitRank(previous.suit));
    } 
}

function CheckPair(hand){
  if (hand.length === 2 && hand[0].number === hand[1].number){return true;}
  else {return false;}
}
function ComparePair(current, previous) {
  //1. Kollar om det är samma par(siffra)
  //2. 
  if (CheckPair(current)){
    if (current[0].number === previous[0].number){
      const a = Math.max(suitRank(current[0].suit),suitRank(current[1].suit));
      const b = Math.max(suitRank(previous[0].suit),suitRank(previous[1].suit));
      return a>b; //Return true om a är större o false om b är större
  }
    else if (current[0].number > previous[0].number){
      return true;
  }
    else if (current[0].number < previous[0].number){
      return false;
  }

  }
  
}
function CheckTOAK(hand){
  if (hand.length === 3 && hand[0].number === hand[1].number && hand[1].number === hand[2].number){return true;}
  else {return false;}
}
function CompareTOAK(current, previous) {
  //1. Kollar om det är samma par(siffra)
  //2. 
  if(CheckTOAK(current)){
    return (current[0].number > previous[0].number);
  }
  
}
//Här jämför jag fem kort så jag skapar en array för "ranks" eftersom att straights kan 

function CheckFive(hand){
  if (hand.length === 5){
    if (CheckStraightFlush(hand) || CheckFOAK(hand) || CheckFullHouse(hand) || CheckFlush(hand) || CheckStraight(hand)){
      return true;
    }
  }
  else{return false;}
}
function CompareFive(current, previous){
  let currenttype = 0
  let previoustype = 0
  if (CheckStraight(current)){currenttype = 1;} 
  if (CheckStraight(past)){pasttype = 1;} 
}

const BIG_TWO_RANK = {3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: 12, 2: 13};
const Straight = 1;
const Flush = 2;
const FullHouse = 3;
const Fourofakind = 4;
const Straightflush = 5
const SUIT_RANK = {"DIAMONDS": 1, "CLUBS": 2, "HEARTS": 3, "SPADES": 4};

function CheckStraight(hand){ //kollar endast om det är en straight
  if (hand.length !== 5){return null;}
  const nums = hand.map(c => c.number).sort((a,b) => a - b);
  const numStr = nums.join(','); //för att checka om den loopar runt basically att d är en A-2-3-4-5 straight, måste göra så för vår databas är FUKEKCEN LAFKDFJ KJ DF
  const isNormal = nums.every((n,i) => i === 0 || n === nums[i-1] + 1); //kollar om d en normal straight (ingen loop i power) 
  const isLooped = (numStr === "2,3,4,5,14"); //hardcoded 
  if (!isNormal && !isLooped) return null;
  return true;

  //nu måste vi hitta highcard zzzz
  //idén är att vi ska istället för hand. nvm michael do lowk fka mig eftersom du la diamond som id1 istället för id4 :/
  //ny idé är att jag splittar upp allt i två funnktioner och kör composition
}
function CompareStraight(current, previous){

}




//*************************//



function cardHtml(card, handName) {
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

async function loadRoundHistory() {
  try {
    const res = await fetch(`http://13.48.46.48:3000/history/${playerId}`);
    const moves = await res.json();

    if (!moves || moves.length === 0) {
      roundInfo.textContent = "Current Round";
      historyContent.innerHTML = `<div class="move-row">No moves yet.</div>`;
      return;
    }

    roundInfo.textContent = `Moves this round`;

    const html = moves
      .slice()
      .reverse()
      .map(move => {
        if (move.move_type === "PASS") {
          return `<div class="move-row">${move.player_name}: Passed</div>`;
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

        return `<div class="move-row">${move.player_name}: ${cardText}</div>`;
      })
      .join("");

    historyContent.innerHTML = html;
  } catch (err) {
    console.error(err);
    historyContent.innerHTML = `<div class="move-row">Could not load history</div>`;
  }
}

buttonPlay.addEventListener("click", async () => {
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

    await loadMyHand();
    await loadRoundHistory();
  } catch (err) {
    console.error(err);
  }
});

buttonPass.addEventListener("click", async () => {
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

    await loadRoundHistory();
  } catch (err) {
    console.error(err);
  }
});

buttonClear.addEventListener("click", () => {
  document.querySelectorAll(".card.selected").forEach(card => {
    card.classList.remove("selected");
  });
});

buttonReady.addEventListener("click", async () => {
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
      await loadMyHand();
      await loadRoundHistory();
    } else {
      alert("You are marked as ready. Waiting for other players.");
    }
  } catch (err) {
    console.error(err);
    alert("Could not set ready");
  }
});

loadMyHand();
loadRoundHistory();
setInterval(loadRoundHistory, 3000);
