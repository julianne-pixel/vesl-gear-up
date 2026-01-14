/* app.js — Full replacement
   VESL STEM Preseason Gear-Up (Spring 2026)
   Plain JS, single-file app
*/

"use strict";

// ---------------- CONFIG ----------------
const CONFIG = {
  appTitle: "VESL STEM",
  subTitle: "Preseason Gear-Up",
  seasonLabel: "Spring 2026",
  accent: "#00fd64", // VESL green
  shortVideoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1",
  videoMinSeconds: 5,
  supportEmail: "support@thenotwork.org",
  helpUrl: "https://thenotwork.org/help"
};

// ---------------- STATE ----------------
const state = {
  stepIndex: 0,

  // Step 1
  readyToCompete: null,          // "lets_go" | "sort_of" | "not_sure"
  participation: null,           // "every_week" | "most_weeks" | "when_i_can" | "trying"

  // Step 2
  videoTimerDone: false,

  // Step 3
  winUnderstanding: [],          // multi select

  // Step 4
  playstyle: [],                 // up to 2
  motivation: null,              // required

  // Step 5
  blockers: [],                  // multi (with "none" mutual exclusive)
  helpConfidence: null,          // "yes" | "not_sure"

  // Step 6
  ready: false                   // boolean
};

const STEPS = [
  {
    key: "welcome",
    title: "Team First",
    kicker: "Checkpoint 1",
    headline: "You’re on a STEM team this season.",
    body:
      "Before challenges begin, let’s get you geared up: how the season works, how to win, and what to do on Day 1.",
    tip: "This takes ~5 minutes. No grades—just gear-up.",
    render: () => {
      return `
        <div class="cardInner">
          <div class="kicker">🧩 ${STEPS[0].kicker}</div>

          <h1 class="h1">${STEPS[0].headline}</h1>
          <p class="p">${STEPS[0].body}</p>

          <div class="qBlock">
            <div class="qTitle">Are you ready to compete this season?</div>
            <div class="qSub">Choose the one that feels most true.</div>

            <div class="grid" aria-label="Ready to compete">
              ${tileHTML("readyToCompete", "lets_go", "Let’s Go!", "", state.readyToCompete)}
              ${tileHTML("readyToCompete", "sort_of", "Sort of?", "", state.readyToCompete)}
              ${tileHTML("readyToCompete", "not_sure", "Not sure yet…", "", state.readyToCompete)}
            </div>
          </div>

          <div class="qBlock">
            <div class="qTitle">Quick vibe check: how often do you think you’ll participate?</div>
            <div class="qSub">This helps us tailor tips for you.</div>

            <div class="grid" aria-label="Participation">
              ${tileHTML("participation", "every_week", "Every Week", "", state.participation)}
              ${tileHTML("participation", "most_weeks", "Most Weeks", "", state.participation)}
              ${tileHTML("participation", "when_i_can", "When I Can", "", state.participation)}
              ${tileHTML("participation", "trying", "Just Trying it Out", "", state.participation)}
            </div>
          </div>
        </div>
      `;
    },
    canProceed: () => Boolean(state.readyToCompete) && Boolean(state.participation)
  },

  {
    key: "video",
    title: "How It Works",
    kicker: "Checkpoint 2",
    headline: "Watch this quick vid!",
    body:
      "This explains how weekly challenges work, how points & rewards work, and how teams qualify.",
    tip: "Watch at least a few seconds to unlock Next.",
    onEnter: () => {
      state.videoTimerDone = false;
      startVideoCountdown(CONFIG.videoMinSeconds);
    },
    render: () => {
      const hasVideo = Boolean(CONFIG.shortVideoEmbedUrl);
      return `
        <div class="cardInner">
          <div class="kicker">🎥 ${STEPS[1].kicker}</div>
          <h1 class="h1">${STEPS[1].headline}</h1>
          <p class="p">${STEPS[1].body}</p>

          <div class="videoWrap">
            <div class="videoHeader">
              <div class="tiny">Short video</div>
              <div class="tiny" id="videoTimer">
                ${state.videoTimerDone ? "✅ Next unlocked" : `Unlocks in ${CONFIG.videoMinSeconds}s`}
              </div>
            </div>

            ${
              hasVideo
                ? `<iframe class="videoFrame"
                    src="${CONFIG.shortVideoEmbedUrl}"
                    title="Season briefing video"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen></iframe>`
                : `<div class="videoPlaceholder">
                    Add your short video embed URL in <code>CONFIG.shortVideoEmbedUrl</code>.
                  </div>`
            }
          </div>

          <div class="notice">
            <strong>Rule:</strong> Watch at least ${CONFIG.videoMinSeconds} seconds, then you can continue.
          </div>
        </div>
      `;
    },
    canProceed: () => state.videoTimerDone === true
  },

  {
    key: "winning",
    title: "Winning",
    kicker: "Checkpoint 3",
    headline: "Winning is simple.",
    body:
      "You win by showing up on time, submitting consistently, and earning points for your team. Featured weeks matter.",
    tip: "Consistency beats perfection. Submit something every week.",
    render: () => {
      const options = [
        ["weekly", "Completing weekly challenges", "You earn rewards + help your team."],
        ["on_time", "Doing featured challenges on time", "Multipliers make early weeks count more."],
        ["team_points", "Helping your team earn season points", "Team points → rank up."],
        ["playoffs", "Showing up for playoffs", "Bigger stakes. Bigger points."]
      ];

      return `
        <div class="cardInner">
          <div class="kicker">🏆 ${STEPS[2].kicker}</div>
          <h1 class="h1">${STEPS[2].headline}</h1>
          <p class="p">${STEPS[2].body}</p>

            <div class="instructionBanner">
  <div class="instructionTitle">Pick all that apply</div>
  <div class="instructionSub">This just helps you remember the rules.</div>
</div>

          </div>

          <div class="grid" aria-label="Winning rules selection">
            ${options
              .map(([value, title, sub]) =>
                tileHTMLMulti("winUnderstanding", value, title, sub, state.winUnderstanding)
              )
              .join("")}
          </div>
        </div>
      `;
    },
    // allow anything, but validate on Next:
    canProceed: () => true,
    validateBeforeNext: () => {
      const needed = ["weekly", "on_time", "team_points", "playoffs"];
      const picked = new Set(state.winUnderstanding || []);
      const allPicked = needed.every(v => picked.has(v));

      if (allPicked) return true;

      showModal({
        title: "All of these are correct ✅",
        body:
          "Nice try — this one is a reminder screen. All four choices are part of how you win. We selected them for you.",
        primaryText: "Got it",
        onPrimary: () => {
          state.winUnderstanding = [...needed];
          render();
        }
      });

      return false; // stop next, user clicks Next again after modal + auto-select
    }
  },

  {
    key: "playstyle",
    title: "Playstyle",
    kicker: "Checkpoint 4",
    headline: "Choose your playstyle (pick up to 2).",
    body:
      "You don’t need to be “the best” at everything. Choose what feels like you.",
    tip: "Team points = States. Your weekly work helps everyone.",
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
          <div class="kicker">🧠 ${STEPS[3].kicker}</div>
          <h1 class="h1">${STEPS[3].headline}</h1>
          <p class="p">${STEPS[3].body}</p>

          <div class="grid" aria-label="Playstyle selection">
            ${options
              .map(([value, title, sub]) =>
                tileHTMLMultiLimited("playstyle", value, title, sub, state.playstyle, 2)
              )
              .join("")}
          </div>

          <div class="bonusHeader">
            <div class="bonusPill">BONUS (required)</div>
            <div class="bonusTitle">What are you most excited about?</div>
            <div class="bonusSub">Pick one — this helps personalize your season tips.</div>
          </div>

          <div class="chipRow" aria-label="Motivation selection">
            ${motivations
              .map(([value, label]) => chipHTML("motivation", value, label, state.motivation))
              .join("")}
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
          <div class="kicker">🛟 ${STEPS[4].kicker}</div>
          <h1 class="h1">${STEPS[4].headline}</h1>
          <p class="p">${STEPS[4].body}</p>

          <div class="qBlock">
            <div class="qTitle">What might make it hard some weeks?</div>
            <div class="qSub">Pick any that apply.</div>

            <div class="chipRow" aria-label="Blockers selection">
              ${blockers
                .map(([value, label]) => chipHTMLMulti("blockers", value, label, state.blockers))
                .join("")}
            </div>

            <div class="miniHint">
              Tip: “Nothing — I’m good” can’t be selected with other issues.
            </div>
          </div>

          <div class="qBlock">
            <div class="qTitle">Do you know where to get help if you’re stuck?</div>
            <div class="qSub">Be honest — we’ll show you the right link.</div>

            <div class="chipRow" aria-label="Help confidence selection">
              ${chipHTML("helpConfidence", "yes", "✅ Yes", state.helpConfidence)}
              ${chipHTML("helpConfidence", "not_sure", "🤔 Not sure yet", state.helpConfidence)}
            </div>
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
        <div class="cardInner finalCard">
          <div class="kicker">🚦 ${STEPS[5].kicker}</div>
          <h1 class="h1">${STEPS[5].headline}</h1>
          <p class="p">${STEPS[5].body}</p>

          <div class="finalBadge">🔥 ${CONFIG.seasonLabel} — LET’S DO THIS</div>

          <div class="grid">
            <div class="tile ${readySelected ? "selected" : ""}" role="button" tabindex="0"
                 data-type="single" data-field="ready" data-value="true"
                 style="grid-column: span 12;">
              <div class="tileTitle">✅ I’m Season Ready</div>
              <div class="tileSub">I know what to do when challenges drop.</div>
            </div>
          </div>

          <div class="notice bigNotice">
            <strong>Unlock:</strong> Season Ready badge + faster Day 1 start.
          </div>
        </div>
      `;
    },
    canProceed: () => state.ready === true,
    onNext: () => completeFlow()
  }
];

// ---------------- DOM ----------------
const elApp = document.getElementById("app") || document.body;

const BASE_HTML = `
  <div class="shell">
    <div class="topBar">
      <div class="brand">
        <div class="logo">V</div>
        <div class="brandText">
          <div class="brandTitle">${CONFIG.appTitle}</div>
          <div class="brandSub">${CONFIG.subTitle}</div>
        </div>
      </div>
      <div class="statusPill" id="statusPill">Status: Not Ready</div>
    </div>

    <div class="progressWrap">
      <div class="progressTop">
        <div class="progressLabel" id="progressLabel"></div>
        <button class="ghostBtn" id="restartBtn" type="button">Restart</button>
      </div>
      <div class="progressBar"><div class="progressFill" id="progressFill"></div></div>
    </div>

    <div class="card" id="card"></div>

    <div class="bottomBar">
      <div class="tip" id="tip"></div>
      <div class="nav">
        <button class="btn secondary" id="backBtn" type="button">Back</button>
        <button class="btn primary" id="nextBtn" type="button">Next</button>
      </div>
    </div>
  </div>

  <div class="modalOverlay" id="modalOverlay" aria-hidden="true">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modalTitle" id="modalTitle"></div>
      <div class="modalBody" id="modalBody"></div>
      <div class="modalActions">
        <button class="btn secondary" id="modalCancel" type="button">Close</button>
        <button class="btn primary" id="modalOk" type="button">OK</button>
      </div>
    </div>
  </div>
`;

const STYLE = `
  <style>
    :root{
      --accent:${CONFIG.accent};
      --bg:#070A10;
      --card:#0B0F16CC;
      --stroke:rgba(255,255,255,.10);
      --stroke2:rgba(255,255,255,.14);
      --text:#EAF0FF;
      --muted:rgba(234,240,255,.72);
      --muted2:rgba(234,240,255,.55);
      --shadow: 0 18px 60px rgba(0,0,0,.55);
      --r:24px;
    }
    *{box-sizing:border-box}
    body{margin:0;background: radial-gradient(1200px 800px at 20% 10%, rgba(167,80,255,.35), transparent 60%),
                      radial-gradient(1000px 700px at 85% 20%, rgba(0,253,100,.18), transparent 55%),
                      radial-gradient(900px 700px at 60% 90%, rgba(255,90,120,.18), transparent 55%),
                      var(--bg);
         font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
         color:var(--text);
    }
    .shell{max-width:1100px;margin:26px auto;padding:0 18px}
    .topBar{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
    .brand{display:flex;align-items:center;gap:12px}
    .logo{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;
          background:rgba(255,255,255,.08);border:1px solid var(--stroke);font-weight:800}
    .brandTitle{font-weight:800;letter-spacing:.2px}
    .brandSub{color:var(--muted2);font-size:13px;margin-top:2px}
    .statusPill{padding:10px 14px;border-radius:999px;border:1px solid var(--stroke);
                background:rgba(255,255,255,.06);color:var(--muted)}
    .progressWrap{padding:14px 16px;border-radius:18px;border:1px solid var(--stroke);
                  background:rgba(255,255,255,.04);backdrop-filter: blur(10px);margin-bottom:14px}
    .progressTop{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
    .progressLabel{color:var(--muted);font-weight:700}
    .ghostBtn{border:1px solid var(--stroke);background:rgba(255,255,255,.06);color:var(--muted);
              border-radius:999px;padding:10px 14px;font-weight:700;cursor:pointer}
    .progressBar{height:10px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden;border:1px solid var(--stroke)}
    .progressFill{height:100%;width:0%;background:linear-gradient(90deg, rgba(0,253,100,.95), rgba(167,80,255,.9));transition:width .25s ease}

    .card{border-radius:var(--r);border:1px solid var(--stroke);background:var(--card);
          box-shadow:var(--shadow);backdrop-filter: blur(16px);padding:26px}
    .cardInner{max-width:980px}
    .kicker{display:inline-flex;align-items:center;gap:10px;padding:8px 12px;border-radius:999px;
            border:1px solid var(--stroke);background:rgba(255,255,255,.05);color:var(--muted);
            font-weight:800;margin-bottom:14px}
    .h1{font-size:44px;line-height:1.05;margin:0 0 12px;font-weight:900}
    .p{margin:0 0 18px;color:var(--muted);font-size:18px;line-height:1.45}

    .qBlock{border:1px dashed rgba(255,255,255,.16);border-radius:18px;padding:16px 16px 14px;margin-top:14px;
            background:rgba(0,0,0,.18)}
    .qTitle{font-weight:900;font-size:18px;margin-bottom:6px}
    .qSub{color:var(--muted2);font-size:13px;margin-bottom:12px}
    .miniHint{margin-top:10px;color:var(--muted2);font-size:12px}

    .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px;margin-top:10px}
    .tile{grid-column: span 6; padding:18px 18px;border-radius:18px;border:1px solid var(--stroke);
          background:rgba(255,255,255,.04);cursor:pointer;user-select:none;transition:transform .05s ease, border .15s ease, background .15s ease}
    .tile:hover{border-color:var(--stroke2);background:rgba(255,255,255,.06)}
    .tile:active{transform:scale(.99)}
    .tileTitle{font-weight:900;font-size:20px;margin-bottom:6px}
    .tileSub{color:var(--muted2);font-size:14px}
    .tile.selected{border-color:rgba(0,253,100,.55);box-shadow:0 0 0 1px rgba(0,253,100,.25) inset;
                   background:rgba(0,253,100,.10)}
    @media (max-width: 820px){ .tile{grid-column: span 12} .h1{font-size:34px} }

    .chipRow{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}
    .chip{border:1px solid var(--stroke);background:rgba(255,255,255,.04);color:var(--text);
          padding:10px 14px;border-radius:999px;font-weight:800;cursor:pointer;user-select:none}
    .chip:hover{border-color:var(--stroke2);background:rgba(255,255,255,.06)}
    .chip.selected{border-color:rgba(0,253,100,.55);background:rgba(0,253,100,.12)}
    .chip:active{transform:scale(.99)}

    .notice{margin-top:16px;padding:14px 16px;border-radius:16px;border:1px dashed rgba(255,255,255,.16);
            color:var(--muted);background:rgba(0,0,0,.18)}
    .bigNotice{font-size:16px}

    .calloutTop{margin-top:14px;padding:14px 16px;border-radius:16px;border:1px solid rgba(0,253,100,.22);
                background:rgba(0,253,100,.08)}
    .calloutTitle{font-weight:900}
    .calloutSub{color:var(--muted);font-size:13px;margin-top:4px}

    .videoWrap{margin-top:14px;border-radius:18px;overflow:hidden;border:1px solid var(--stroke);background:rgba(0,0,0,.40)}
    .videoHeader{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;color:var(--muted2);
                 background:rgba(255,255,255,.05);border-bottom:1px solid var(--stroke)}
    .tiny{font-size:12px;font-weight:900;letter-spacing:.2px}
    .videoFrame{width:100%;height:420px;border:0;display:block;background:#000}
    .videoPlaceholder{padding:18px;color:var(--muted)}
    @media(max-width:820px){ .videoFrame{height:260px} }

    .bonusHeader{margin-top:18px;padding:14px 16px;border-radius:16px;border:1px solid rgba(167,80,255,.25);
                 background:rgba(167,80,255,.10)}
    .bonusPill{display:inline-flex;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,.22);
               border:1px solid rgba(255,255,255,.16);font-weight:900;font-size:12px}
    .bonusTitle{font-weight:900;margin-top:10px}
    .bonusSub{color:var(--muted);font-size:13px;margin-top:4px}

    .bottomBar{display:flex;justify-content:space-between;align-items:center;margin-top:14px;gap:16px}
    .tip{color:var(--muted2);font-size:14px;flex:1}
    .nav{display:flex;gap:10px}
    .btn{border-radius:999px;padding:12px 18px;font-weight:900;border:1px solid var(--stroke);cursor:pointer}
    .btn.secondary{background:rgba(255,255,255,.06);color:var(--muted)}
    .btn.primary{background:linear-gradient(90deg, rgba(0,253,100,.85), rgba(167,80,255,.75));color:#07110B;border-color:transparent}
    .btn:disabled{opacity:.45;cursor:not-allowed}

    .finalCard{position:relative;overflow:hidden}
    .finalCard:before{
      content:"";
      position:absolute;inset:-2px;
      background: radial-gradient(600px 240px at 20% 10%, rgba(0,253,100,.22), transparent 60%),
                  radial-gradient(600px 240px at 80% 20%, rgba(167,80,255,.22), transparent 60%);
      pointer-events:none;
    }
    .finalBadge{display:inline-flex;align-items:center;gap:10px;margin:10px 0 18px;
                padding:10px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.18);
                background:rgba(0,0,0,.22);font-weight:900;color:var(--muted)}

    /* Modal */
    .modalOverlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;padding:18px;z-index:50}
    .modalOverlay.show{display:flex}
    .modal{width:min(560px, 100%);border-radius:18px;border:1px solid var(--stroke);
           background:rgba(10,14,22,.92);backdrop-filter: blur(12px);padding:16px;box-shadow:var(--shadow)}
    .modalTitle{font-weight:900;font-size:18px;margin-bottom:10px}
    .modalBody{color:var(--muted);line-height:1.45}
    .modalActions{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}

  </style>
`;

// ---------------- RENDER ----------------
function render(){
  elApp.innerHTML = STYLE + BASE_HTML;

  const elCard = document.getElementById("card");
  const elTip = document.getElementById("tip");
  const elProgressLabel = document.getElementById("progressLabel");
  const elFill = document.getElementById("progressFill");
  const elNext = document.getElementById("nextBtn");
  const elBack = document.getElementById("backBtn");
  const elRestart = document.getElementById("restartBtn");
  const elStatus = document.getElementById("statusPill");

  const step = STEPS[state.stepIndex];

  elCard.innerHTML = step.render();
  elTip.textContent = `Tip: ${step.tip || ""}`;
  elProgressLabel.textContent = `Gear Up: ${state.stepIndex + 1} / ${STEPS.length}`;

  const pct = ((state.stepIndex + 1) / STEPS.length) * 100;
  elFill.style.width = `${pct}%`;

  elBack.disabled = state.stepIndex === 0;
  elNext.textContent = state.stepIndex === STEPS.length - 1 ? "Finish" : "Next";

  // Status pill
  elStatus.textContent = `Status: ${state.ready ? "Ready" : "Not Ready"}`;

  // Next enabled/disabled
  elNext.disabled = !step.canProceed();

  // Bind nav buttons
  elBack.onclick = () => goBack();
  elNext.onclick = () => goNext();
  elRestart.onclick = () => restart();

  // Delegated click handling (fixes “selections not working”)
  elCard.addEventListener("click", (e) => {
    const target = e.target.closest("[data-field][data-value]");
    if (!target) return;

    const field = target.getAttribute("data-field");
    const value = target.getAttribute("data-value");
    const type = target.getAttribute("data-type") || "single";
    const limit = Number(target.getAttribute("data-limit") || "0");

    if (type === "single") {
      setSingle(field, value);
    } else if (type === "multi") {
      toggleMulti(field, value);
    } else if (type === "multiLimited") {
      toggleMultiLimited(field, value, limit || 2);
    }

    // Page 5 special behavior: help confidence modal
    if (field === "helpConfidence" && value === "not_sure") {
      showModal({
        title: "No worries — here’s where to get help",
        body: `Use the Help Center: <strong>${CONFIG.helpUrl}</strong><br/><br/>
              Or email us at <strong>${CONFIG.supportEmail}</strong>.`,
        primaryText: "Got it"
      });
    }

    render();
  });

  // Keyboard accessibility: Enter/Space activates tiles
  elCard.addEventListener("keydown", (e) => {
    if (!(e.key === "Enter" || e.key === " ")) return;
    const target = e.target.closest("[data-field][data-value]");
    if (!target) return;
    e.preventDefault();
    target.click();
  });

  // Enter hook
  if (typeof step.onEnter === "function") step.onEnter();
}

function restart(){
  state.stepIndex = 0;
  state.readyToCompete = null;
  state.participation = null;
  state.videoTimerDone = false;
  state.winUnderstanding = [];
  state.playstyle = [];
  state.motivation = null;
  state.blockers = [];
  state.helpConfidence = null;
  state.ready = false;
  stopVideoCountdown();
  render();
}

function goBack(){
  stopVideoCountdown();
  state.stepIndex = Math.max(0, state.stepIndex - 1);
  render();
}

function goNext(){
  const step = STEPS[state.stepIndex];

  // extra validation hook
  if (typeof step.validateBeforeNext === "function") {
    const ok = step.validateBeforeNext();
    if (!ok) return;
  }

  if (!step.canProceed()) return;

  stopVideoCountdown();

  if (typeof step.onNext === "function" && state.stepIndex === STEPS.length - 1) {
    step.onNext();
    return;
  }

  state.stepIndex = Math.min(STEPS.length - 1, state.stepIndex + 1);
  render();
}

function completeFlow(){
  showModal({
    title: "You’re geared up ✅",
    body: `Nice — you’re officially ready for <strong>${CONFIG.seasonLabel}</strong>.<br/><br/>
          You can close this window or restart if you want to test again.`,
    primaryText: "Restart",
    onPrimary: () => restart(),
    showCancel: false
  });
}

// ---------------- UI HELPERS ----------------
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

function tileHTMLMulti(field, value, title, sub, selectedArr){
  const selected = Array.isArray(selectedArr) && selectedArr.includes(value) ? "selected" : "";
  const subHtml = sub ? `<div class="tileSub">${sub}</div>` : "";
  return `
    <div class="tile ${selected}" role="button" tabindex="0"
         data-type="multi" data-field="${field}" data-value="${value}">
      <div class="tileTitle">${title}</div>
      ${subHtml}
    </div>
  `;
}

function tileHTMLMultiLimited(field, value, title, sub, selectedArr, limit){
  const selected = Array.isArray(selectedArr) && selectedArr.includes(value) ? "selected" : "";
  const subHtml = sub ? `<div class="tileSub">${sub}</div>` : "";
  return `
    <div class="tile ${selected}" role="button" tabindex="0"
         data-type="multiLimited" data-limit="${limit}"
         data-field="${field}" data-value="${value}">
      <div class="tileTitle">${title}</div>
      ${subHtml}
    </div>
  `;
}

function chipHTML(field, value, label, selectedValue){
  const selected = selectedValue === value ? "selected" : "";
  return `
    <div class="chip ${selected}" role="button" tabindex="0"
         data-type="single" data-field="${field}" data-value="${value}">
      ${label}
    </div>
  `;
}

function chipHTMLMulti(field, value, label, selectedArr){
  const selected = Array.isArray(selectedArr) && selectedArr.includes(value) ? "selected" : "";
  return `
    <div class="chip ${selected}" role="button" tabindex="0"
         data-type="multi" data-field="${field}" data-value="${value}">
      ${label}
    </div>
  `;
}

// ---------------- STATE MUTATORS ----------------
function setSingle(field, value){
  if (field === "ready") {
    state.ready = (value === "true");
    return;
  }
  state[field] = value;
}

function toggleMulti(field, value){
  const arr = Array.isArray(state[field]) ? [...state[field]] : [];

  // Page 5 special: blockers "none" mutual exclusivity
  if (field === "blockers") {
    if (value === "none") {
      state.blockers = ["none"];
      return;
    } else {
      // selecting any other removes "none"
      const withoutNone = arr.filter(v => v !== "none");
      const idx = withoutNone.indexOf(value);
      if (idx >= 0) withoutNone.splice(idx, 1);
      else withoutNone.push(value);
      state.blockers = withoutNone;
      return;
    }
  }

  const idx = arr.indexOf(value);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(value);
  state[field] = arr;
}

function toggleMultiLimited(field, value, limit){
  const arr = Array.isArray(state[field]) ? [...state[field]] : [];
  const idx = arr.indexOf(value);

  if (idx >= 0) {
    arr.splice(idx, 1);
    state[field] = arr;
    return;
  }
  if (arr.length >= limit) {
    // soft block with modal
    showModal({
      title: `Pick up to ${limit}`,
      body: `You can choose up to ${limit} options here. Unselect one first.`,
      primaryText: "OK",
      showCancel: false
    });
    return;
  }
  arr.push(value);
  state[field] = arr;
}

// ---------------- VIDEO TIMER ----------------
let videoInterval = null;
let secondsLeft = 0;

function startVideoCountdown(seconds){
  stopVideoCountdown();
  secondsLeft = seconds;

  const tick = () => {
    const el = document.getElementById("videoTimer");
    if (secondsLeft <= 0) {
      state.videoTimerDone = true;
      if (el) el.textContent = "✅ Next unlocked";
      const nextBtn = document.getElementById("nextBtn");
      if (nextBtn) nextBtn.disabled = !STEPS[state.stepIndex].canProceed();
      stopVideoCountdown();
      return;
    }
    if (el) el.textContent = `Unlocks in ${secondsLeft}s`;
    secondsLeft -= 1;
  };

  // immediate paint
  tick();
  videoInterval = setInterval(tick, 1000);
}

function stopVideoCountdown(){
  if (videoInterval) clearInterval(videoInterval);
  videoInterval = null;
}

// ---------------- MODAL ----------------
function showModal({ title, body, primaryText="OK", onPrimary=null, showCancel=true }){
  const overlay = document.getElementById("modalOverlay");
  const t = document.getElementById("modalTitle");
  const b = document.getElementById("modalBody");
  const ok = document.getElementById("modalOk");
  const cancel = document.getElementById("modalCancel");

  if (!overlay || !t || !b || !ok || !cancel) return;

  t.textContent = title || "";
  b.innerHTML = body || "";

  ok.textContent = primaryText;

  cancel.style.display = showCancel ? "inline-flex" : "none";

  const close = () => {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden","true");
    ok.onclick = null;
    cancel.onclick = null;
  };

  ok.onclick = () => {
    close();
    if (typeof onPrimary === "function") onPrimary();
  };
  cancel.onclick = () => close();

  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden","false");
}

// ---------------- BOOT ----------------
render();
