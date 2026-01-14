/* ==========
  VESL Gear-Up Checkpoint
  - Single-page onboarding (no "survey" vibe)
  - Stores answers in localStorage
  - Can export completion JSON
========== */

const STORAGE_KEY = "vesl_gearup_v1";

const elCard = document.getElementById("card");
const elBack = document.getElementById("backBtn");
const elNext = document.getElementById("nextBtn");
const elRestart = document.getElementById("restartBtn");

const elStepLabel = document.getElementById("stepLabel");
const elProgress = document.getElementById("progressFill");
const elStatusPill = document.getElementById("statusPill");
const elFooterTip = document.getElementById("footerTip");

const exportModal = document.getElementById("exportModal");
const closeExportBtn = document.getElementById("closeExportBtn");
const downloadBtn = document.getElementById("downloadBtn");

/**
 * CONFIG: Update these to match your season & video.
 */
const CONFIG = {
  seasonName: "Spring Season",
  stepsTotalLabel: 6,
  // Use one of the following:
  // 1) YouTube embed URL like: https://www.youtube.com/embed/VIDEO_ID
  // 2) Vimeo embed URL like: https://player.vimeo.com/video/VIDEO_ID
  // 3) Or leave blank to show a placeholder box
  shortVideoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  // Minimum seconds before "Next" is enabled on the video step
  videoMinSeconds: 12
};

const TIPS = [
  "This takes ~5 minutes. No grades—just gear-up.",
  "Showing up on time matters: featured weeks hit harder.",
  "Consistency beats perfection. Submit something every week.",
  "Team points = States. Your weekly work helps everyone."
];

// ---- State ----
let state = loadState();
let stepIndex = state.stepIndex ?? 0;

function defaultState(){
  return {
    stepIndex: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,

    // answers
    intent: null,           // definitely/probably/not_sure
    frequency: null,        // every_week/most_weeks/when_i_can/trying
    watchedShortVideo: false,
    winUnderstanding: [],   // multi-select
    playstyle: [],          // up to 2
    motivation: null,       // one
    blockers: [],           // multi-select
    helpConfidence: null,   // yes/not_sure
    ready: false
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  }catch{
    return defaultState();
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, stepIndex }));
}

// ---- Steps (Option 1) ----
const steps = [
  {
    key: "welcome",
    title: "Gear Up",
    kicker: "Checkpoint 1",
    headline: "You’re on a STEM team this season.",
    body:
      "Before challenges begin, let’s get you geared up: how the season works, how to win, and what to do on Day 1.",
    tip: TIPS[0],
    render: () => {

      const intentOptions = [
  ["definitely", "Yes", ""],
  ["probably", "Kinda", ""],
  ["not_sure", "Not sure yet", ""]
];

const freqOptions = [
  ["every_week", "Every Week", ""],
  ["most_weeks", "Most Weeks", ""],
  ["when_i_can", "When I Can", ""],
  ["trying", "Just Trying it Out", ""]
];

      return `
        <div class="cardInner">
          <div class="kicker">🧩 ${steps[0].kicker}</div>
          <h1 class="h1">${steps[0].headline}</h1>
          <p class="p">${steps[0].body}</p>


<div class="notice"><strong>Are you ready to compete this season?</strong></div>
<div class="grid" aria-label="Intent selection">
  ${intentOptions.map(([value, title, sub]) => tileHTML("intent", value, title, sub, state.intent)).join("")}
</div>

 
        </div>
      `;
    },
    canProceed: () => Boolean(state.intent && state.frequency)
  },

  {
    key: "video",
    title: "How It Works",
    kicker: "Checkpoint 2",
    headline: "Watch this quick vid!",
    body:
      "This explains how weekly challenges work, how points & rewards work, and how teams qualify.",
    tip: TIPS[1],
    render: () => {
      const hasVideo = Boolean(CONFIG.shortVideoEmbedUrl);
      return `
        <div class="cardInner">
          <div class="kicker">🎥 ${steps[1].kicker}</div>
          <h1 class="h1">${steps[1].headline}</h1>
          <p class="p">${steps[1].body}</p>

          <div class="videoWrap">
            <div class="videoHeader">
              <div class="tiny">Short video</div>
              <div class="tiny" id="videoTimer">Unlocks in ${CONFIG.videoMinSeconds}s</div>
            </div>
            ${
              hasVideo
                ? `<iframe class="videoFrame" src="${CONFIG.shortVideoEmbedUrl}" title="Season briefing video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
                : `<div style="padding:18px;color:var(--muted);">Add your short video embed URL in <code>app.js</code> → <code>CONFIG.shortVideoEmbedUrl</code>.</div>`
            }
          </div>

<div class="notice">
  When the timer hits 0, you can continue.
</div>


          <div class="row" role="group" aria-label="Video confirmation">
            <button class="chip ${state.watchedShortVideo ? "selected" : ""}" type="button" id="watchedBtn">
              ✅ I watched it
            </button>
          </div>
        </div>
      `;
    },
    onEnter: () => startVideoGateTimer(),
    canProceed: () => Boolean(state.watchedShortVideo) && videoGateUnlocked
  },

  {
    key: "how_to_win",
    title: "How You Win",
    kicker: "Checkpoint 3",
    headline: "Winning is simple.",
    body:
      "You win by showing up on time, submitting consistently, and earning points for your team. Featured weeks matter.",
    tip: TIPS[2],
    render: () => {
      const options = [
        ["weekly", "Completing weekly challenges", "You earn rewards + help your team."],
        ["featured", "Doing featured challenges on time", "Multipliers make early weeks count more."],
        ["team", "Helping your team earn season points", "Team points → rank up."],
        ["playoffs", "Showing up for playoffs", "Bigger stakes. Bigger points."]
      ];
      return `
        <div class="cardInner">
          <div class="kicker">🏆 ${steps[2].kicker}</div>
          <h1 class="h1">${steps[2].headline}</h1>
          <p class="p">${steps[2].body}</p>

          <div class="grid" aria-label="Win understanding">
            ${options
              .map(([value, title, sub]) =>
                tileHTMLMulti("winUnderstanding", value, title, sub, state.winUnderstanding)
              )
              .join("")}
          </div>

          <div class="notice">
            <strong>Pick all that apply.</strong> This just helps you remember the rules.
          </div>
        </div>
      `;
    },
    canProceed: () => (state.winUnderstanding?.length ?? 0) >= 2
  },

  {
    key: "playstyle",
    title: "Your Playstyle",
    kicker: "Checkpoint 4",
    headline: "Choose your playstyle (pick up to 2).",
    body:
      "You don’t need to be “the best” at everything. Choose what feels like you.",
    tip: TIPS[3],
    render: () => {
      const options = [
        ["builder", "Builder", "Likes making & creating things."],
        ["strategist", "Strategist", "Likes problem-solving & planning."],
        ["designer", "Designer", "Likes visuals, polish, and creativity."],
        ["explorer", "Explorer", "Likes trying new tools and learning fast."],
        ["speaker", "Communicator", "Likes presenting/explaining ideas."],
        ["figuring_out", "Still figuring it out", "Totally valid. Start anyway."]
      ];

      const motivations = [
        ["rewards", "Winning rewards"],
        ["competition", "Beating other teams"],
        ["skills", "Learning real skills"],
        ["creating", "Making cool stuff"],
        ["new", "Trying something new"]
      ];

      return `
        <div class="cardInner">
          <div class="kicker">🧠 ${steps[3].kicker}</div>
          <h1 class="h1">${steps[3].headline}</h1>
          <p class="p">${steps[3].body}</p>

          <div class="grid" aria-label="Playstyle selection">
            ${options
              .map(([value, title, sub]) =>
                tileHTMLMultiLimited("playstyle", value, title, sub, state.playstyle, 2)
              )
              .join("")}
          </div>

          <div class="notice"><strong>Bonus:</strong> what are you most excited about?</div>
          <div class="row" aria-label="Motivation selection">
            ${motivations.map(([value, label]) => chipHTML("motivation", value, label, state.motivation)).join("")}
          </div>
        </div>
      `;
    },
    canProceed: () => (state.playstyle?.length ?? 0) >= 1 && Boolean(state.motivation)
  },

  {
    key: "support",
    title: "Support",
    kicker: "Checkpoint 5",
    headline: "If you get stuck, you still win.",
    body:
      "The goal is progress—not perfection. Use the help tools, ask questions, and keep moving.",
    tip: "Most students who qualify for States are the ones who submit consistently.",
    render: () => {
      const blockers = [
        ["time", "Time / schedule"],
        ["tech", "Tech access"],
        ["confused", "Not understanding the challenge"],
        ["confidence", "Confidence / feeling behind"],
        ["none", "Nothing — I’m good"]
      ];

      return `
        <div class="cardInner">
          <div class="kicker">🛟 ${steps[4].kicker}</div>
          <h1 class="h1">${steps[4].headline}</h1>
          <p class="p">${steps[4].body}</p>

          <div class="notice">
            What might make it hard some weeks? (Pick any)
          </div>

          <div class="row" aria-label="Blockers selection">
            ${blockers.map(([value, label]) => chipHTMLMulti("blockers", value, label, state.blockers)).join("")}
          </div>

          <div class="notice">
            Do you feel like you know where to get help if you’re stuck?
          </div>

          <div class="row" aria-label="Help confidence selection">
            ${chipHTML("helpConfidence", "yes", "✅ Yes", state.helpConfidence)}
            ${chipHTML("helpConfidence", "not_sure", "🤔 Not sure yet", state.helpConfidence)}
          </div>

          <div class="notice">
            <strong>Help tip:</strong> Your teacher/coach + the platform help links are part of the game.
          </div>
        </div>
      `;
    },
    canProceed: () => (state.blockers?.length ?? 0) >= 1 && Boolean(state.helpConfidence)
  },

  {
    key: "ready",
    title: "Ready",
    kicker: "Final Checkpoint",
    headline: "Ready to enter the season?",
    body:
      "By clicking ready, you’re officially geared up. You’ll know what to do when challenges drop—and how to help your team win.",
    tip: "You can come back anytime, but being ready now helps you win early.",
    render: () => {
      const readySelected = state.ready === true;
      return `
        <div class="cardInner">
          <div class="kicker">🚦 ${steps[5].kicker}</div>
          <h1 class="h1">${steps[5].headline}</h1>
          <p class="p">${steps[5].body}</p>

          <div class="grid">
            <div class="tile ${readySelected ? "selected" : ""}" id="readyTile" style="grid-column: span 12;">
              <div class="tileTitle">✅ I’m Season Ready</div>
              <div class="tileSub">I know what to do when challenges drop.</div>
            </div>
          </div>

          <div class="notice">
            <strong>Unlock:</strong> Season Ready badge + faster Day 1 start.
          </div>
        </div>
      `;
    },
    canProceed: () => state.ready === true,
    onNext: () => completeFlow()
  }
];

// ---- UI helpers ----
function tileHTML(field, value, title, sub, selectedValue){
  const selected = selectedValue === value ? "selected" : "";
  const subHtml = sub ? `<div class="tileSub">${sub}</div>` : "";
  return `
    <div class="tile ${selected}" role="button" tabindex="0"
         data-type="single" data-field="${field}" data-value="${value}">
      <div class="tileTitle">${title}</div>
      ${subHtml}
    </div>
  `;
}


function tileHTMLMulti(field, value, title, sub, selectedArray){
  const selected = (selectedArray || []).includes(value) ? "selected" : "";
  const subHtml = sub ? `<div class="tileSub">${sub}</div>` : "";
  return `
    <div class="tile ${selected}" role="button" tabindex="0"
         data-type="multi" data-field="${field}" data-value="${value}">
      <div class="tileTitle">${title}</div>
      ${subHtml}
    </div>
  `;
}

function tileHTMLMultiLimited(field, value, title, sub, selectedArray, limit){
  const selected = (selectedArray || []).includes(value) ? "selected" : "";
  const subHtml = sub ? `<div class="tileSub">${sub}</div>` : "";
  return `
    <div class="tile ${selected}" role="button" tabindex="0"
         data-type="multiLimited" data-limit="${limit}" data-field="${field}" data-value="${value}">
      <div class="tileTitle">${title}</div>
      ${subHtml}
    </div>
  `;
}


function chipHTML(field, value, label, selectedValue){
  const selected = selectedValue === value ? "selected" : "";
  return `
    <button class="chip ${selected}" type="button"
            data-type="singleChip" data-field="${field}" data-value="${value}">
      ${label}
    </button>
  `;
}

function chipHTMLMulti(field, value, label, selectedArray){
  const selected = (selectedArray || []).includes(value) ? "selected" : "";
  return `
    <button class="chip ${selected}" type="button"
            data-type="multiChip" data-field="${field}" data-value="${value}">
      ${label}
    </button>
  `;
}

// ---- Render cycle ----
function render(){
  const step = steps[stepIndex];

  elStepLabel.textContent = `Gear Up: ${stepIndex + 1} / ${steps.length}`;
  elProgress.style.width = `${Math.round(((stepIndex + 1) / steps.length) * 100)}%`;
  elFooterTip.textContent = step.tip || TIPS[0];

  elBack.disabled = stepIndex === 0;
  elNext.textContent = stepIndex === steps.length - 1 ? "Finish" : "Next";

  // Next disabled until canProceed (except we allow stepping back always)
  elNext.disabled = !step.canProceed();

  elCard.innerHTML = step.render();

  // Attach handlers inside card
  bindCardInteractions();

  // Per-step entry hooks
  if(step.onEnter) step.onEnter();

  updateStatusPill();
  saveState();
}

function bindCardInteractions(){
  // Keyboard + click for tiles
  elCard.querySelectorAll(".tile").forEach((node) => {
    node.addEventListener("click", () => handleTile(node));
    node.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        handleTile(node);
      }
    });
  });

  // Chips
  elCard.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => handleChip(btn));
  });

  // Video watched button
  const watchedBtn = elCard.querySelector("#watchedBtn");
  if(watchedBtn){
    watchedBtn.addEventListener("click", () => {
      state.watchedShortVideo = !state.watchedShortVideo;
      render();
    });
  }

  // Ready tile
  const readyTile = elCard.querySelector("#readyTile");
  if(readyTile){
    readyTile.addEventListener("click", () => {
      state.ready = true;
      render();
    });
  }
}

function handleTile(node){
  const type = node.dataset.type;
  const field = node.dataset.field;
  const value = node.dataset.value;

  if(type === "single"){
    state[field] = value;
    render();
    return;
  }
  if(type === "multi"){
    toggleArrayValue(field, value);
    render();
    return;
  }
  if(type === "multiLimited"){
    const limit = parseInt(node.dataset.limit || "2", 10);
    const arr = state[field] || [];
    if(arr.includes(value)){
      state[field] = arr.filter(v => v !== value);
    }else{
      if(arr.length >= limit) return; // silently block
      state[field] = [...arr, value];
    }
    render();
    return;
  }
}

function handleChip(btn){
  const type = btn.dataset.type;
  const field = btn.dataset.field;
  const value = btn.dataset.value;

  if(type === "singleChip"){
    state[field] = value;
    render();
    return;
  }
  if(type === "multiChip"){
    toggleArrayValue(field, value);
    render();
    return;
  }
}

function toggleArrayValue(field, value){
  const arr = state[field] || [];
  if(arr.includes(value)){
    state[field] = arr.filter(v => v !== value);
  }else{
    state[field] = [...arr, value];
  }
}

// ---- Navigation ----
elBack.addEventListener("click", () => {
  if(stepIndex > 0){
    stepIndex--;
    saveState();
    render();
  }
});

elNext.addEventListener("click", () => {
  const step = steps[stepIndex];
  if(!step.canProceed()) return;

  if(step.onNext){
    step.onNext();
    return;
  }

  if(stepIndex < steps.length - 1){
    stepIndex++;
    saveState();
    render();
  }
});

elRestart.addEventListener("click", () => {
  if(confirm("Restart gear-up? This will clear your answers on this device.")){
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    stepIndex = 0;
    videoGateUnlocked = false;
    stopVideoGateTimer();
    render();
  }
});

// ---- Completion ----
function completeFlow(){
  state.completedAt = new Date().toISOString();
  saveState();
  exportModal.showModal();
}

closeExportBtn.addEventListener("click", () => exportModal.close());
downloadBtn.addEventListener("click", () => downloadCompletionJSON());

// ---- Status pill ----
function updateStatusPill(){
  const done = Boolean(state.completedAt) && state.ready === true;
  elStatusPill.textContent = done ? "Status: Season Ready ✅" : "Status: Not Ready";
  elStatusPill.style.color = done ? "rgba(0,253,100,.92)" : "var(--muted)";
  elStatusPill.style.borderColor = done ? "rgba(0,253,100,.35)" : "var(--line)";
  elStatusPill.style.background = done ? "rgba(0,253,100,0.08)" : "rgba(255,255,255,0.04)";
}

// ---- Video gating timer ----
let videoGateUnlocked = false;
let videoGateSecondsLeft = CONFIG.videoMinSeconds;
let videoGateInterval = null;

function startVideoGateTimer(){
  // only applies on the video step
  videoGateUnlocked = false;
  videoGateSecondsLeft = CONFIG.videoMinSeconds;
  stopVideoGateTimer();

  const timerEl = document.getElementById("videoTimer");
  if(!timerEl){
    videoGateUnlocked = true;
    return;
  }

  timerEl.textContent = `Unlocks in ${videoGateSecondsLeft}s`;
  videoGateInterval = setInterval(() => {
    videoGateSecondsLeft -= 1;
    if(videoGateSecondsLeft <= 0){
      videoGateUnlocked = true;
      timerEl.textContent = "Unlocked ✅";
      stopVideoGateTimer();
      // re-evaluate next button state
      elNext.disabled = !steps[stepIndex].canProceed();
      return;
    }
    timerEl.textContent = `Unlocks in ${videoGateSecondsLeft}s`;
  }, 1000);
}

function stopVideoGateTimer(){
  if(videoGateInterval){
    clearInterval(videoGateInterval);
    videoGateInterval = null;
  }
}

// ---- Export ----
function downloadCompletionJSON(){
  const payload = {
    version: "vesl_gearup_v1",
    seasonName: CONFIG.seasonName,
    startedAt: state.startedAt,
    completedAt: state.completedAt,
    answers: {
      intent: state.intent,
      frequency: state.frequency,
      watchedShortVideo: state.watchedShortVideo,
      winUnderstanding: state.winUnderstanding,
      playstyle: state.playstyle,
      motivation: state.motivation,
      blockers: state.blockers,
      helpConfidence: state.helpConfidence,
      ready: state.ready
    }
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
  a.download = `vesl-gearup-${stamp}.json`;

  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---- Boot ----
(function init(){
  // If someone completed already, keep them at last step
  if(state.completedAt && stepIndex < steps.length - 1){
    stepIndex = steps.length - 1;
  }
  render();
})();
