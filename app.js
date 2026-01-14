const app = document.getElementById("app");

/* STATE */
let step = 0;
const state = {
  intent: null,
  frequency: null,
  watched: false,
  winningChoices: [],
  playstyle: [],
  bonus: null,
  help: []
};

/* MODAL */
function showModal(title, body) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").textContent = body;
  document.getElementById("modal").classList.remove("hidden");
}
document.getElementById("modalClose").onclick = () =>
  document.getElementById("modal").classList.add("hidden");

/* RENDER */
function render() {
  app.innerHTML = `
    <div class="progressWrap">
      <div class="progressLabel">Gear Up: ${step + 1} / 6</div>
      <div class="progressBar">
        <div class="progressFill" style="width:${((step + 1) / 6) * 100}%"></div>
      </div>
    </div>

    ${pages[step]()}
  `;
}

/* PAGE DEFINITIONS */
const pages = [

  /* PAGE 1 */
  () => `
    <div class="card">
      <div class="questionBlock">
        <div class="questionLabel">Question</div>
        <div class="questionText">Are you ready to compete this season?</div>
      </div>

      <div class="choiceGrid">
        ${choice("I'm all in", "intent")}
        ${choice("I'm figuring it out", "intent")}
        ${choice("I'm unsure", "intent")}
      </div>

      <div class="questionBlock">
        <div class="questionLabel">Quick vibe check</div>
        <div class="questionText">How often do you think you’ll participate?</div>
      </div>

      <div class="choiceGrid">
        ${choice("Every week", "frequency")}
        ${choice("Most weeks", "frequency")}
        ${choice("When I can", "frequency")}
        ${choice("Just trying it out", "frequency")}
      </div>

      ${nav()}
    </div>
  `,

  /* PAGE 2 – VIDEO */
  () => `
    <div class="card">
      <div class="questionBlock">
        <div class="questionText">Watch this quick video</div>
      </div>

      <div class="videoWrap">
        <div class="videoHeader">
          <span>Season Overview</span>
          <span id="timer">Watching…</span>
        </div>
        <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
      </div>

      ${nav(true)}
    </div>
  `,

  /* PAGE 3 – WINNING */
  () => `
    <div class="card">
      <span class="pill">Pick all that apply</span>

      <div class="questionBlock">
        <div class="questionText">Winning is simple.</div>
      </div>

      <div class="choiceGrid">
        ${multi("Completing weekly challenges")}
        ${multi("Doing featured challenges on time")}
        ${multi("Helping your team earn points")}
        ${multi("Showing up for playoffs")}
      </div>

      ${nav()}
    </div>
  `,

  /* PAGE 4 */
  () => `
    <div class="card">
      <div class="questionBlock">
        <div class="questionText">Choose your playstyle (up to 2)</div>
      </div>

      <div class="choiceGrid">
        ${multi("Builder", "playstyle")}
        ${multi("Strategist", "playstyle")}
        ${multi("Designer", "playstyle")}
        ${multi("Explorer", "playstyle")}
        ${multi("Communicator", "playstyle")}
      </div>

      <hr style="opacity:.1;margin:28px 0"/>

      <span class="pill">Bonus</span>
      <div class="choiceGrid">
        ${choice("Winning rewards", "bonus")}
        ${choice("Learning real skills", "bonus")}
        ${choice("Making cool stuff", "bonus")}
      </div>

      ${nav()}
    </div>
  `,

  /* PAGE 5 */
  () => `
    <div class="card">
      <div class="questionBlock">
        <div class="questionText">Anything you’re worried about?</div>
      </div>

      <div class="choiceGrid">
        ${multi("Not sure yet", "help")}
        ${multi("Time management", "help")}
        ${multi("Understanding challenges", "help")}
        ${multi("Nothing — I'm good", "help")}
      </div>

      ${nav()}
    </div>
  `,

  /* PAGE 6 */
  () => `
    <div class="card">
      <div class="questionBlock">
        <div class="questionText">You’re officially geared up 🎉</div>
      </div>

      <p>You’re ready for Spring 2026. You know how to win — and how to help your team.</p>

      <div class="actions">
        <button class="btn primary">Enter the Season</button>
      </div>
    </div>
  `
];

/* HELPERS */
function choice(label, key) {
  return `<div class="choice" onclick="select('${key}','${label}')">${label}</div>`;
}
function multi(label, key = "winningChoices") {
  return `<div class="choice" onclick="toggle('${key}','${label}')">${label}</div>`;
}

/* EVENTS */
window.select = (key, val) => {
  state[key] = val;
  render();
};

window.toggle = (key, val) => {
  if (!Array.isArray(state[key])) state[key] = [];
  if (state[key].includes(val)) {
    state[key] = state[key].filter(v => v !== val);
  } else {
    if (key === "playstyle" && state[key].length >= 2) return;
    state[key].push(val);
  }
  render();
};

/* NAV */
function nav(disabled = false) {
  return `
    <div class="actions">
      ${step > 0 ? `<button class="btn secondary" onclick="back()">Back</button>` : "<span></span>"}
      <button class="btn primary" ${disabled && !state.watched ? "disabled" : ""} onclick="next()">Next</button>
    </div>
  `;
}

window.next = () => {
  if (step === 2 && state.winningChoices.length < 4) {
    showModal("Quick note", "All of these matter! Winning is about consistency, timing, and teamwork.");
    state.winningChoices = [
      "Completing weekly challenges",
      "Doing featured challenges on time",
      "Helping your team earn points",
      "Showing up for playoffs"
    ];
  }
  if (step === 4 && state.help.includes("Not sure yet")) {
    showModal(
      "Need help?",
      "Visit the Help Center or email support@thenotwork.org anytime."
    );
  }
  if (step < pages.length - 1) step++;
  render();
};

window.back = () => {
  if (step > 0) step--;
  render();
};

/* VIDEO TIMER */
setTimeout(() => {
  state.watched = true;
  render();
}, 5000);

/* INIT */
render();
