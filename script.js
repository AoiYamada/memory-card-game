const [boardDom] = document.getElementsByClassName("board");
const level2Dom = document.getElementById("level-2");
const level3Dom = document.getElementById("level-3");
const moveCounterDom = document.getElementById("move-counter");
const timeCounterDom = document.getElementById("time-counter");
const winDom = document.getElementsByClassName("win")[0];

const rawCards = [
  "fa-user",
  "fa-bell",
  "fa-bicycle",
  "fa-bug",
  "fa-car",
  "fa-bolt",
  "fa-asterisk",
  "fa-balance-scale",
  "fa-bathtub",
  "fa-binoculars",
  "fa-cog",
  "fa-cloud",
  "fa-coffee",
  "fa-cube",
  "fa-diamond",
  "fa-envelope",
  "fa-hand-spock-o",
  "fa-key",
];

class Game {
  constructor(rawCards, boardDom, moveCounterDom, timeCounterDom, winDom) {
    this.rawCards = rawCards;
    this.boardDom = boardDom;
    this.moveCounterDom = moveCounterDom;
    this.timeCounterDom = timeCounterDom;
    this.winDom = winDom;

    this.level = 1;
    this.reset();
  }

  get isEnd() {
    return this.cardPairNum === this.matchedPairNum;
  }

  openCard(cardDom) {
    this.startTimer();

    if (cardDom.classList.contains("card-opened")) {
      return;
    }

    if (this.selectedCards.length >= 2) {
      this.closeSelectedCards();
    }

    cardDom.classList.add("card-opened");
    this.selectedCards.push(cardDom);

    if (this.selectedCards.length !== 2) {
      return;
    }

    this.move += 1;

    const [firstCard, secondCard] = this.selectedCards.map(
      (selectedCardDom) =>
        selectedCardDom.querySelector(".card-back i").classList[1]
    );

    if (firstCard !== secondCard) {
      this.closeCardSchedule = setTimeout(() => this.closeSelectedCards(), 800);
      return;
    }

    this.matchedPairNum += 1;
    this.selectedCards.map(this.lightUpCard);
    this.clearSelectedCards();

    if (this.isEnd) {
      this.stopTimer();
      this.showWinDialog();
    }
  }

  lightUpCard(cardDom) {
    cardDom.classList.add("card-paired");
  }

  closeSelectedCards() {
    if (this.closeCardSchedule) {
      clearTimeout(this.closeCardSchedule);
      this.closeCardSchedule = null;
    }

    for (const cardDom of this.selectedCards) {
      cardDom.classList.remove("card-opened");
    }

    this.clearSelectedCards();
  }

  clearSelectedCards() {
    this.selectedCards = [];
  }

  updateTimeUsed() {
    this.timeUsed = Math.round((Date.now() - this.startTime) / 1000);
  }

  startTimer() {
    if (!this.timer) {
      this.startTime = Date.now();
      this.timer = setInterval(() => {
        this.updateTimeUsed();
        this.updateScore();
      }, 100);
    }
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  reset() {
    this.hideWinDialog();
    this.stopTimer();
    this.totalCards = {
      1: 4 * 4,
      2: 5 * 6,
      3: 6 * 6,
    }[this.level];
    const colNum = 3 + this.level;

    this.cardPairNum = this.totalCards / 2;
    this.matchedPairNum = 0;
    this.move = 0;
    this.timeUsed = 0;
    this.startTime = 0;
    this.timer = 0;
    this.cards = R.pipe(
      R.slice(0, this.cardPairNum),
      (cards) => R.concat(cards, cards),
      (cards) => cards.sort(() => Math.random() - 0.5),
      R.splitEvery(colNum)
    )(this.rawCards);
    this.selectedCards = [];
    this.closeCardSchedule = null;

    this.clearBoard();
    this.generateBoard();
    this.updateScore();
  }

  updateScore() {
    this.moveCounterDom.innerHTML = this.move;
    this.timeCounterDom.innerHTML = this.timeUsed;
  }

  clearBoard() {
    this.boardDom.innerHTML = "";
  }

  generateBoard() {
    this.boardDom.innerHTML = R.map(Game.generateRowDom, this.cards).join("");
  }

  showWinDialog() {
    this.winDom.classList.remove("hide");
  }

  hideWinDialog() {
    this.winDom.classList.add("hide");
  }

  static generateCardDom(contentIcon) {
    return `
      <li class="card">
        <div class="card-inner">
          <div class="card-front">
            <i class="fa fa-star" aria-hidden="true"></i>
          </div>
          <div class="card-back">
            <i class="fa ${contentIcon}" aria-hidden="true"></i>
          </div>
        </div>
      </li>
    `;
  }

  static generateRowDom(rowIcons) {
    return `
      <ul class="card-row">
        ${R.map(Game.generateCardDom, rowIcons).join("")}
      </ul>
    `;
  }
}

const game = new Game(
  rawCards,
  boardDom,
  moveCounterDom,
  timeCounterDom,
  winDom
);

document.addEventListener("click", function (e) {
  if (!e.target) return;

  switch (e.target.id) {
    case "level-1":
      level2Dom.classList.remove("fa-star");
      level2Dom.classList.add("fa-star-o");
      level3Dom.classList.remove("fa-star");
      level3Dom.classList.add("fa-star-o");
      game.level = 1;
      game.reset();
      break;
    case "level-2":
      level2Dom.classList.remove("fa-star-o");
      level2Dom.classList.add("fa-star");
      level3Dom.classList.remove("fa-star");
      level3Dom.classList.add("fa-star-o");
      game.level = 2;
      game.reset();
      break;
    case "level-3":
      level2Dom.classList.remove("fa-star-o");
      level2Dom.classList.add("fa-star");
      level3Dom.classList.remove("fa-star-o");
      level3Dom.classList.add("fa-star");
      game.level = 3;
      game.reset();
      break;
    case "refresh-btn":
      game.reset();
      break;
    default:
      const currentCardDom = e.target.closest(".card");
      if (currentCardDom) {
        game.openCard(currentCardDom);
      }
  }
});
