const button = document.querySelector ("#test");
const txt_out = document.querySelector ('#out');
const API_URL = "http://13.48.46.48:3000/random-card";

function displayNumber(n) {
      if (n === 11) return "J";
      if (n === 12) return "Q";
      if (n === 13) return "K";
      if (n === 14) return "A";
      if (n === 15) return "2";
      return String(n);
    }

button.addEventListener ("click", async () => {

	const res = await fetch (API_URL);
	const card = await res.json();
	txt_out.textContent =
	`${displayNumber(card.number)} of ${card.suit}`;
	
});
