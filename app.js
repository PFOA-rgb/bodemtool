// ==========================================
// APP.JS - DEFINITIEVE VERSIE (MET TEXTUREN & SLIDERS)
// ==========================================

// --- 1. CONFIGURATIE ---
let PX_TEXT_H = 352;
let PX_BAR_H = 350;

window.currentGPO = 1;
window.projectData = {};
for (let i = 1; i <= 10; i++) window.projectData[i] = null;
window.rootColorCache = {};
window.activeTab = null;
window.autoSaveReady = false;
window.autoSaveTimer = null;

// Variabele om wijzigingen bij te houden
window.hasUnsavedChanges = false;

// Global settings
window.globalSettings = {
  showHeader: false,
  headers: { fysisch: "Fysisch", beworteling: "Wortelontwikkeling" },
  project: "",
  locatie: "",
  opdrachtgever: "",
  onderzoeker: "",
};

// Kleuren en Data Definities
const BODEM_KLEUREN = {
  Zand: "#E6C77A",
  "Lemig zand": "#C9A66B",
  "Lichte klei": "#B88A5A",
  "Zware klei": "#7A4E2D",
  Veen: "#3B2A1F",
  Löss: "#E8D8A8",
  Bomenzand: "#6B4A34",
  Bomengrond: "#5A3E2B",
  Elementverharding: "#A94438",
  Halfverharding: "#9E9E9E",
  Menggranulaat: "#8C8C8C",
};
const BASE_COLORS = [
  "#1A1A1A",
  "#3E2723",
  "#5D4037",
  "#795548",
  "#A1887F",
  "#BDBDBD",
  "#D7CCC8",
  "#F5F5DC",
  "#B25842",
  "#9E9E9E",
  "#37474F",
  "#FFB300",
  "#8D6E63",
  "#90A4AE",
  "#78909C",
  "#FFFFFF",
];
const DATA_FRACTIES = ["Zeer fijn", "Fijn", "Matig grof", "Grof", "N.v.t."];
const DATA_HUMUS = [
  "Humusloos",
  "Humusarm",
  "Matig humeus",
  "Humeus",
  "Humusrijk",
  "N.v.t.",
];
const DATA_BTYPES = [
  "Zand",
  "Lemig zand",
  "Lichte klei",
  "Zware klei",
  "Veen",
  "Löss",
  "Bomenzand",
  "Bomengrond",
  "Elementverharding",
  "Halfverharding",
  "Menggranulaat",
];
const DATA_TEXTUREN = ["Geen", "Verharding", "Zand", "Klei"];
const DATA_KENMERKEN = [
  "Sterk verdicht",
  "Verdicht",
  "Puinhoudend",
  "Oxidatie",
  "Gley-verschijnselen",
  "Reductiezone",
  "Schijngrondwater",
  "Capillaire zone",
  "Grondwater",
  "Kabel/leiding",
  "NAP",
  "N.v.t.",
];
const ARCERINGEN = [
  "Geen",
  "Diagonaal (Verdicht)",
  "Kruislings (Puin)",
  "Golven (Water)",
  "Stippen (Zand/Gley)",
  "Horizontaal",
  "Cirkel",
];
const POSITIES = ["Volledig", "Links", "Rechts"];
const KENMERK_PRESETS = {
  Verdicht: { k: "#e6e6e6", pk: "#000000", p: "Diagonaal (Verdicht)" },
  "Sterk verdicht": { k: "#add8e6", pk: "#00008b", p: "Diagonaal (Verdicht)" },
  Puinhoudend: { k: "#ffffff", pk: "#ff0000", p: "Kruislings (Puin)" },
  Grondwater: { k: "#e0f7fa", pk: "#0000ff", p: "Golven (Water)" },
  Schijngrondwater: { k: "#e0f7fa", pk: "#0000ff", p: "Golven (Water)" },
  "Gley-verschijnselen": {
    k: "#fff3e0",
    pk: "#ff9800",
    p: "Stippen (Zand/Gley)",
  },
  "Kabel/leiding": { k: "#e8eaeb", pk: "#cc0000", p: "Cirkel" },
};
const DATA_OPNAMEWORTELS = [
  "Opnamewortels (extensief)",
  "Opnamewortels (intensief)",
  "Grove beworteling",
  "Geen opnamebeworteling",
  "Niet verder onderzocht",
  "Afgestorven wortel",
];
const DATA_STABILITEITSWORTELS = [
  "Stabiliteitswortel",
  "Stabiliteitswortels",
  "Grove beworteling",
  "Geen stabiliteitsbeworteling",
];
const OPERATORS = ["=", "<", ">", "≤", "≥"];
const SIZES = ["•", "●", "⬤"];
const KLEUR_NAMEN = {
  "#f3e5ab": "geel",
  "#d9c2a3": "lichtbruin",
  "#a67b5b": "bruin",
  "#5c4033": "donkerbruin",
  "#edbb99": "oranje",
  "#ffffff": "wit",
  "#333333": "zwart",
  "#add8e6": "blauw",
  "#a9a9a9": "grijs",
  "#f2efe9": "lichtbruin",
};

function applyFieldMode(enabled) {
  document.body.classList.toggle("field-mode", enabled);
  const btn = document.getElementById("field-mode-toggle");
  if (btn) {
    btn.classList.toggle("active", enabled);
    btn.setAttribute("aria-pressed", enabled ? "true" : "false");
    btn.innerText = enabled ? "Veldmodus aan" : "Veldmodus";
  }
}

function initFieldMode() {
  const savedMode = localStorage.getItem("bodemtool-field-mode");
  const autoFieldMode = window.matchMedia("(pointer: coarse), (max-width: 800px)").matches;
  applyFieldMode(savedMode === null ? autoFieldMode : savedMode === "true");
}

function toggleFieldMode() {
  const enabled = !document.body.classList.contains("field-mode");
  localStorage.setItem("bodemtool-field-mode", enabled ? "true" : "false");
  applyFieldMode(enabled);
}

// --- OPSTARTEN ---
document.addEventListener("DOMContentLoaded", async () => {
  initFieldMode();
  genereerGPOTabs();

  // Initialiseer lege lagen
  voegBodemLaagToe();
  voegOpnameLaagToe();

  // Specifieke startwaarde voor stabiliteit
  voegStabLaagToe({
    s: 0,
    e: 100,
    t: "Geen stabiliteitsbeworteling",
    k: "#5c4033",
  });

  voegOndergrondKenmerkToe();

  renderGPOTabs();
  wisselTab("fysisch");

  // Zet direct de juiste hoogte en breedte bij het inladen
  syncHoogte("input");
  syncBreedte("input");

  // Initialiseer de CSS variabelen voor de texturen (Zet ze direct goed)
  syncOpacity("ao", "slider");
  syncOpacity("disp", "slider");

  updateUI();
  renderFieldPhotos();

  // FAILSAFE LOGICA
  const dashboard = document.getElementById("dashboard-container");
  if (dashboard) {
    dashboard.addEventListener("input", markProjectChanged);
    dashboard.addEventListener("change", markProjectChanged);
  }

  await restoreAutoDraft();
  window.autoSaveReady = true;
  window.hasUnsavedChanges = false;
  setAutoSaveStatus("Lokaal opgeslagen", "saved");
  requestPersistentStorage();
});

// ==========================================
// HELPER FUNCTIES
// ==========================================
function opts(arr, selected) {
  return arr
    .map(
      (x) =>
        `<option value="${x}" ${x === selected ? "selected" : ""}>${x}</option>`,
    )
    .join("");
}

function optsWithCustom(arr, selected) {
  let isCustom = !arr.includes(selected);
  let html = arr
    .map(
      (x) =>
        `<option value="${x}" ${x === selected ? "selected" : ""}>${x}</option>`,
    )
    .join("");
  html += `<option value="CUSTOM" ${isCustom ? "selected" : ""}>Zelf invullen...</option>`;
  return html;
}

window.getVal = function (parent, sel1, sel2) {
  const el = parent.querySelector(sel1);
  if (!el) return "";
  return el.value === "CUSTOM" ? parent.querySelector(sel2).value : el.value;
};

function verwijderLaag(containerId) {
  const container = document.getElementById(containerId);
  if (container.lastChild) container.lastChild.remove();
  markProjectChanged();
  updateUI();
  updateRootUI();
}

function syncMaxDieptes() {
  valideerDieptes("bodem-container", "card-bodem");
  valideerDieptes("opname-container", "card-opname");
  valideerDieptes("stab-container", "card-stab");
  updateUI();
  updateRootUI();
}

function valideerDieptes(id, cls) {
  const max = parseInt(document.getElementById("maxDiepte").value) || 100;
  document
    .getElementById(id)
    .querySelectorAll("." + cls)
    .forEach((card, i, arr) => {
      const eindInput = card.querySelector(".inp-eind");
      if (parseInt(eindInput.value) > max) eindInput.value = max;
      if (arr[i + 1]) {
        arr[i + 1].querySelector(".inp-start").value = eindInput.value;
      }
    });
}

// ==========================================
// TEXTUUR BLENDER HELPER
// ==========================================

// 1. Zorgt alleen nog voor de hoofdkleur en CSS patronen
function getBodemBgStyle(c, i, arr) {
  const eigenKleur = c.querySelector(".inp-kleur").value;
  const heeftVerloop = c.querySelector(".inp-grad")
    ? c.querySelector(".inp-grad").checked
    : false;
  const textuur = c.querySelector(".inp-textuur")
    ? c.querySelector(".inp-textuur").value
    : "Geen";

  let bgKleur = eigenKleur;
  let bgAfbeelding = "";
  let extraShadow = "";

  if (heeftVerloop && arr[i + 1]) {
    const volgendeKleur = arr[i + 1].querySelector(".inp-kleur").value;
    bgAfbeelding = `linear-gradient(to bottom, ${eigenKleur} 40%, ${volgendeKleur})`;
  }

  const PATROON_VERHARDING = `repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.2) 17px), repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.2) 17px)`;
  const PATROON_KLEI = `repeating-linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.03) 2px, transparent 2px, transparent 8px)`;

  if (textuur === "Verharding") {
    bgAfbeelding = bgAfbeelding
      ? `${PATROON_VERHARDING}, ${bgAfbeelding}`
      : PATROON_VERHARDING;
    extraShadow = "box-shadow: inset 0px -6px 8px -4px rgba(0,0,0,0.5);";
  } else if (textuur === "Klei") {
    bgAfbeelding = bgAfbeelding
      ? `${PATROON_KLEI}, ${bgAfbeelding}`
      : PATROON_KLEI;
  }

  let bgStyle = `background-color: ${bgKleur};`;
  if (bgAfbeelding) bgStyle += ` background-image: ${bgAfbeelding};`;
  if (extraShadow) bgStyle += ` ${extraShadow}`;

  return bgStyle;
}

// 2. Genereert de onzichtbare, gestapelde zandlagen die luisteren naar jouw sliders
function getTextureLayersHtml(c) {
  const textuur = c.querySelector(".inp-textuur")
    ? c.querySelector(".inp-textuur").value
    : "Geen";
  if (textuur !== "Zand") return "";

  const PATROON_AO = typeof MAP_AO_ZAND !== "undefined" ? MAP_AO_ZAND : "none";
  const PATROON_DISP =
    typeof MAP_DISP_ZAND !== "undefined" ? MAP_DISP_ZAND : "none";

  const baseStyle =
    "position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; background-size: 50px 50px; background-repeat: repeat; border-radius: inherit;";

  return `
        <div style="${baseStyle} background-image: ${PATROON_AO}; mix-blend-mode: multiply; opacity: var(--ao-opacity, 1);"></div>
        <div style="${baseStyle} background-image: ${PATROON_DISP}; mix-blend-mode: multiply; opacity: var(--disp-opacity, 1);"></div>
    `;
}

// ==========================================
// INPUT GENERATOREN (UI)
// ==========================================

function voegBodemLaagToe(d = null) {
  if (d === null) markProjectChanged();

  const con = document.getElementById("bodem-container");
  let s = 0,
    e = 30;

  if (!d && con.lastChild) {
    s = parseInt(con.lastChild.querySelector(".inp-eind").value);
    e = Math.min(s + 20, parseInt(document.getElementById("maxDiepte").value));
  } else if (d) {
    s = d.s;
    e = d.e;
  }

  const div = document.createElement("div");
  div.className = "input-card card-bodem";
  const isGrad = d?.g ? "checked" : "";
  const offset = d?.off || 0;
  const defKleur = d?.k || "#f3e5ab";

  const paletteHtml = BASE_COLORS.map(
    (c) =>
      `<div class="mini-swatch" style="background:${c}" onclick="this.closest('.input-card').querySelector('.inp-kleur').value='${c}';updateUI();"></div>`,
  ).join("");

  div.innerHTML = `
    <div class="row">
        <div style="flex:0 0 85px;" class="float-group"><input type="number" class="float-input inp-start" value="${s}" onchange="syncMaxDieptes()"><label class="float-label">Start</label></div>
        <div style="flex:0 0 85px;" class="float-group"><input type="number" class="float-input inp-eind" value="${e}" onchange="syncMaxDieptes()"><label class="float-label">Eind</label></div>
        <div style="flex:1;" class="compact-color-wrapper">
            <div class="tiny-label">Kleur</div>
            <div class="mini-palette" style="margin-top:0; margin-bottom:3px;">${paletteHtml}</div>
            <div style="display:flex; gap:5px; align-items:center;">
                <input type="color" class="inp-kleur" value="${defKleur}" onchange="updateUI()" style="flex:1;">
                <div style="display:flex; flex-direction:column; align-items:center; margin-left:2px;">
                    <input type="checkbox" class="inp-grad" ${isGrad} onchange="updateUI()" style="width:14px; height:14px; margin:0;">
                    <div class="tiny-label" style="font-size:9px;">Verloop</div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div style="flex:1" class="float-group">
            <select class="float-input inp-frac" onchange="handleSelectChange(this)">${optsWithCustom(DATA_FRACTIES, d?.f || "Fijn")}</select>
            <label class="float-label">Fractie</label>
            <input type="text" class="custom-input inp-frac-custom" value="${d?.f || ""}" style="display:${d && !DATA_FRACTIES.includes(d.f) ? "block" : "none"}" onkeyup="updateUI()">
        </div>
        <div style="flex:1" class="float-group">
            <select class="float-input inp-humus" onchange="handleSelectChange(this)">${optsWithCustom(DATA_HUMUS, d?.h || "Humusarm")}</select>
            <label class="float-label">Org.</label>
            <input type="text" class="custom-input inp-humus-custom" value="${d?.h || ""}" style="display:${d && !DATA_HUMUS.includes(d.h) ? "block" : "none"}" onkeyup="updateUI()">
        </div>
        <div style="flex:1" class="float-group">
            <select class="float-input inp-type" onchange="handleSelectChange(this)">${optsWithCustom(DATA_BTYPES, d?.t || "Zand")}</select>
            <label class="float-label">Type</label>
            <input type="text" class="custom-input inp-type-custom" value="${d?.t || ""}" style="display:${d && !DATA_BTYPES.includes(d.t) ? "block" : "none"}" onkeyup="updateUI()">
        </div>
        <div style="flex:1" class="float-group">
            <select class="float-input inp-textuur" onchange="updateUI()">${opts(DATA_TEXTUREN, d?.tx || "Geen")}</select>
            <label class="float-label">Textuur</label>
        </div>
        <div style="display:flex; flex-direction:column; justify-content:center; margin-left:5px; gap:2px;">
            <button type="button" onclick="adjustOffset(this, -2)" style="width:20px; height:18px; font-size:10px; padding:0; cursor:pointer; background:#eee; border:1px solid #ccc; border-radius:3px;">▲</button>
            <button type="button" onclick="adjustOffset(this, 2)" style="width:20px; height:18px; font-size:10px; padding:0; cursor:pointer; background:#eee; border:1px solid #ccc; border-radius:3px;">▼</button>
            <input type="hidden" class="inp-offset" value="${offset}">
        </div>
    </div>`;
  con.appendChild(div);
  updateUI();
}

function voegOpnameLaagToe(d = null) {
  if (d === null) markProjectChanged();
  const con = document.getElementById("opname-container");
  let s = 0,
    e = 20;
  if (d) {
    s = d.s;
    e = d.e;
  }

  const div = document.createElement("div");
  div.className = "input-card card-opname";
  const defT = d?.t || "Opnamewortels (extensief)";
  const defS = d?.style || "Cirkels";
  const offset = d?.off || 0;
  const defOp = d?.op || "=";
  const defSize = d?.sz || "●";
  const defKleur = d?.k || "#5c4033";
  const defCount = d?.cnt || "";
  const defPositions =
    typeof d?.pts === "string" ? d.pts : JSON.stringify(d?.pts || []);

  const paletteHtml = BASE_COLORS.map(
    (c) =>
      `<div class="mini-swatch" style="background:${c}" onclick="this.closest('.input-card').querySelector('.inp-kleur').value='${c}';updateRootUI();"></div>`,
  ).join("");

  div.innerHTML = `
    <div class="row">
        <div style="flex:0 0 70px;" class="float-group"><input type="number" class="float-input inp-start" value="${s}" onchange="updateRootUI()"><label class="float-label">Start</label></div>
        <div style="flex:0 0 70px;" class="float-group"><input type="number" class="float-input inp-eind" value="${e}" onchange="updateRootUI()"><label class="float-label">Eind</label></div>
        <div style="flex:1;" class="compact-color-wrapper">
            <div class="tiny-label">Kleur</div>
            <div class="mini-palette" style="margin-top:0; margin-bottom:3px;">${paletteHtml}</div>
            <input type="color" class="inp-kleur" value="${defKleur}" onchange="updateRootUI()">
        </div>
    </div>
    <div class="row">
        <div style="flex:3" class="float-group">
            <select class="float-input r-type" onchange="handleSelectChange(this)">${optsWithCustom(DATA_OPNAMEWORTELS, defT)}</select>
            <label class="float-label">Type</label>
            <input type="text" class="custom-input r-type-custom" value="${defT}" style="display:${d && !DATA_OPNAMEWORTELS.includes(defT) ? "block" : "none"}" onkeyup="updateRootUI()">
        </div>
        <div style="flex:1.5" class="float-group">
            <select class="float-input r-style" onchange="updateRootUI()">
                <option value="Cirkels" ${defS === "Cirkels" ? "selected" : ""}>⚪ Cirkels</option>
                <option value="Balkjes" ${defS === "Balkjes" ? "selected" : ""}>▬ Balkjes</option>
                <option value="Natuurlijk" ${defS === "Natuurlijk" ? "selected" : ""}>🌱 Natuurlijk</option>
            </select>
            <label class="float-label">Stijl</label>
        </div>
    </div>
    <div class="row">
        <div style="flex:0 0 45px;" class="float-group"><select class="float-input r-oper" onchange="updateRootUI()">${opts(OPERATORS, defOp)}</select><label class="float-label">Op</label></div>
        <div style="flex:0 0 50px;" class="float-group"><input type="number" step="0.1" class="float-input r-diam" value="${d?.d || ""}" placeholder="cm" onkeyup="updateRootUI()"><label class="float-label">Ø</label></div>
        <div style="flex:0 0 55px;" class="float-group"><select class="float-input r-size" onchange="updateRootUI()">${opts(SIZES, defSize)}</select><label class="float-label">Grootte</label></div>
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:flex-end; gap:2px;">
            <button type="button" onclick="adjustOffset(this, -2)" style="width:20px; height:18px; font-size:10px; padding:0; cursor:pointer; background:#eee; border:1px solid #ccc; border-radius:3px;">▲</button>
            <button type="button" onclick="adjustOffset(this, 2)" style="width:20px; height:18px; font-size:10px; padding:0; cursor:pointer; background:#eee; border:1px solid #ccc; border-radius:3px;">▼</button>
            <input type="hidden" class="inp-offset" value="${offset}">
        </div>
    </div>
    <div class="row">
        <div style="flex:0 0 80px;" class="float-group"><input type="number" min="0" step="1" class="float-input r-count" value="${defCount}" placeholder="auto" oninput="updateRootUI()"><label class="float-label">Aantal</label></div>
        <input type="hidden" class="r-positions" value='${defPositions}'>
        <div style="flex:1; font-size:11px; color:#666; padding-top:16px;">Aantal invullen = losse wortels die je kunt slepen</div>
    </div>`;
  con.appendChild(div);
  updateRootUI();
}

function voegStabLaagToe(d = null) {
  if (d === null) markProjectChanged();
  const con = document.getElementById("stab-container");
  let s = 0,
    e = 20;
  if (d) {
    s = d.s;
    e = d.e;
  }

  const div = document.createElement("div");
  div.className = "input-card card-stab";
  const defT = d?.t || "Stabiliteitswortel";
  const defS = d?.style || "Cirkels";
  const offset = d?.off || 0;
  const defOp = d?.op || "=";
  const defSize = d?.sz || "●";
  const defKleur = d?.k || "#5c4033";
  const defCount = d?.cnt || "";
  const defPositions =
    typeof d?.pts === "string" ? d.pts : JSON.stringify(d?.pts || []);

  const paletteHtml = BASE_COLORS.map(
    (c) =>
      `<div class="mini-swatch" style="background:${c}" onclick="this.closest('.input-card').querySelector('.inp-kleur').value='${c}';updateRootUI();"></div>`,
  ).join("");

  div.innerHTML = `
    <div class="row">
        <div style="flex:0 0 70px;" class="float-group"><input type="number" class="float-input inp-start" value="${s}" onchange="updateRootUI()"><label class="float-label">Start</label></div>
        <div style="flex:0 0 70px;" class="float-group"><input type="number" class="float-input inp-eind" value="${e}" onchange="updateRootUI()"><label class="float-label">Eind</label></div>
        <div style="flex:1;" class="compact-color-wrapper">
            <div class="tiny-label">Kleur</div>
            <div class="mini-palette" style="margin-top:0; margin-bottom:3px;">${paletteHtml}</div>
            <input type="color" class="inp-kleur" value="${defKleur}" onchange="updateRootUI()">
        </div>
    </div>
    <div class="row">
        <div style="flex:3" class="float-group">
            <select class="float-input r-type" onchange="handleSelectChange(this)">${optsWithCustom(DATA_STABILITEITSWORTELS, defT)}</select>
            <label class="float-label">Type</label>
            <input type="text" class="custom-input r-type-custom" value="${defT}" style="display:${d && !DATA_STABILITEITSWORTELS.includes(defT) ? "block" : "none"}" onkeyup="updateRootUI()">
        </div>
        <div style="flex:1.5" class="float-group">
            <select class="float-input r-style" onchange="updateRootUI()">
                <option value="Cirkels" ${defS === "Cirkels" ? "selected" : ""}>⚪ Cirkels</option>
                <option value="Balkjes" ${defS === "Balkjes" ? "selected" : ""}>▬ Balkjes</option>
                <option value="Natuurlijk" ${defS === "Natuurlijk" ? "selected" : ""}>🌱 Natuurlijk</option>
            </select>
            <label class="float-label">Stijl</label>
        </div>
    </div>
    <div class="row">
        <div style="flex:0 0 45px;" class="float-group"><select class="float-input r-oper" onchange="updateRootUI()">${opts(OPERATORS, defOp)}</select><label class="float-label">Op</label></div>
        <div style="flex:0 0 50px;" class="float-group"><input type="number" step="0.1" class="float-input r-diam" value="${d?.d || ""}" placeholder="cm" onkeyup="updateRootUI()"><label class="float-label">Ø</label></div>
        <div style="flex:0 0 55px;" class="float-group"><select class="float-input r-size" onchange="updateRootUI()">${opts(SIZES, defSize)}</select><label class="float-label">Grootte</label></div>
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:flex-end; gap:2px;">
            <button type="button" onclick="adjustOffset(this, -2)" style="width:20px; height:18px; font-size:10px; padding:0; cursor:pointer; background:#eee; border:1px solid #ccc; border-radius:3px;">▲</button>
            <button type="button" onclick="adjustOffset(this, 2)" style="width:20px; height:18px; font-size:10px; padding:0; cursor:pointer; background:#eee; border:1px solid #ccc; border-radius:3px;">▼</button>
            <input type="hidden" class="inp-offset" value="${offset}">
        </div>
    </div>
    <div class="row">
        <div style="flex:0 0 80px;" class="float-group"><input type="number" min="0" step="1" class="float-input r-count" value="${defCount}" placeholder="auto" oninput="updateRootUI()"><label class="float-label">Aantal</label></div>
        <input type="hidden" class="r-positions" value='${defPositions}'>
        <div style="flex:1; font-size:11px; color:#666; padding-top:16px;">Aantal invullen = losse wortels die je kunt slepen</div>
    </div>`;
  con.appendChild(div);
  updateRootUI();
}

function voegOndergrondKenmerkToe(d = null) {
  if (d === null) markProjectChanged();
  const con = document.getElementById("ondergrond-container");
  let s = 0,
    e = 30;
  if (!d && con.lastChild) {
    s = parseInt(con.lastChild.querySelector(".k-eind").value);
    e = Math.min(s + 20, parseInt(document.getElementById("maxDiepte").value));
  } else if (d) {
    s = d.s;
    e = d.e;
  }

  const div = document.createElement("div");
  div.className = "input-card card-ondergrond";
  const defT = d?.t || "Sterk verdicht";
  const defK = d?.k || "#add8e6";
  const defPK = d?.pk || "#00008b";
  const defP = d?.p || "Diagonaal (Verdicht)";
  const offset = d?.offset || 0;

  const paletteHtml = BASE_COLORS.map(
    (c) =>
      `<div class="mini-swatch" style="background:${c}" onclick="this.closest('.input-card').querySelector('.k-kleur').value='${c}';updateUI();"></div>`,
  ).join("");

  div.innerHTML = `
    <div class="row">
        <div style="flex:0 0 60px;" class="float-group"><input type="number" class="float-input k-start" value="${s}" onchange="updateUI()"><label class="float-label">Start</label></div>
        <div style="flex:0 0 60px;" class="float-group"><input type="number" class="float-input k-eind" value="${e}" onchange="updateUI()"><label class="float-label">Eind</label></div>
        <div style="flex:1;" class="float-group"><select class="float-input k-pos" onchange="updateUI()">${opts(POSITIES, d?.pos || "Volledig")}</select><label class="float-label">Positie</label></div>
    </div>
    <div class="row">
        <div style="flex:1; display:flex; flex-direction:column; justify-content:flex-end;" class="compact-color-wrapper">
            <div class="mini-palette" style="margin-top:0; margin-bottom:3px;">${paletteHtml}</div>
            <div class="dual-color-container">
                <div class="color-box-col">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div class="tiny-label">Basis</div>
                        <label style="font-size:9px; display:flex; align-items:center; gap:2px; cursor:pointer;">
                            <input type="checkbox" class="k-transp" onchange="updateUI()" style="margin:0; width:10px; height:10px;" ${d?.tr ? "checked" : ""}> Geen
                        </label>
                    </div>
                    <input type="color" class="k-kleur" value="${defK}" onchange="updateUI()">
                </div>
                <div class="color-box-col">
                    <div class="tiny-label">Lijn</div>
                    <input type="color" class="k-pat-kleur" value="${defPK}" onchange="updateUI()">
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div style="flex:1" class="float-group">
            <select class="float-input k-type" onchange="handleSelectChange(this)">${optsWithCustom(DATA_KENMERKEN, defT)}</select>
            <label class="float-label">Kenmerk</label>
            <input type="text" class="custom-input k-type-custom" value="${defT}" style="display:${d && !DATA_KENMERKEN.includes(defT) ? "block" : "none"}" onkeyup="updateUI()">
        </div>
        <div style="flex:1" class="float-group">
            <select class="float-input k-pat" onchange="updateUI()">${optsWithCustom(ARCERINGEN, defP).replace("Zelf invullen...", "")}</select>
            <label class="float-label">Arcering</label>
        </div>
    </div>
    <div class="row" style="align-items:flex-end;">
        <div style="flex:1" class="float-group" style="margin-bottom:0;"><input type="text" class="float-input k-info" value="${d?.i || ""}" placeholder=" " onchange="updateUI()"><label class="float-label">Info</label></div>
        <div style="display:flex; flex-direction:column; justify-content:center; margin-left:5px; gap:2px;">
            <button type="button" onclick="adjustOffset(this, -2)" style="width:20px; height:18px; font-size:10px; padding:0; cursor:pointer; background:#eee; border:1px solid #ccc; border-radius:3px;">▲</button>
            <button type="button" onclick="adjustOffset(this, 2)" style="width:20px; height:18px; font-size:10px; padding:0; cursor:pointer; background:#eee; border:1px solid #ccc; border-radius:3px;">▼</button>
            <input type="hidden" class="k-offset" value="${offset}">
        </div>
    </div>`;
  con.appendChild(div);
  updateUI();
}

function handleSelectChange(s) {
  const p = s.parentElement;
  const c = p.querySelector(".custom-input");
  if (s.value === "CUSTOM") {
    if (c) {
      c.style.display = "block";
      c.focus();
    }
  } else {
    if (c) c.style.display = "none";
  }

  if (s.classList.contains("k-type")) {
    const pre = KENMERK_PRESETS[s.value];
    if (pre) {
      const ca = s.closest(".card-ondergrond");
      ca.querySelector(".k-kleur").value = pre.k;
      ca.querySelector(".k-pat-kleur").value = pre.pk;
      ca.querySelector(".k-pat").value = pre.p;
    }
  }
  if (s.classList.contains("inp-type")) {
    const presetKleur = BODEM_KLEUREN[s.value];
    if (presetKleur) {
      s.closest(".input-card").querySelector(".inp-kleur").value = presetKleur;
    }
  }

  if (s.closest(".card-opname") || s.closest(".card-stab")) {
    updateRootUI();
  } else {
    updateUI();
  }
}

function adjustOffset(btn, delta) {
  const card = btn.closest(".input-card");
  let input =
    card.querySelector(".k-offset") || card.querySelector(".inp-offset");
  if (input) {
    let val = parseInt(input.value) || 0;
    val += delta;
    input.value = val;
    updateUI();
    updateRootUI();
  }
}

function toggleBodemBackground() {
  const isChecked = document.getElementById("toggle-bodem-bg").checked;
  if (isChecked) {
    cacheRootColors();
    document.querySelectorAll(".k-transp").forEach((cb) => (cb.checked = true));
  } else {
    restoreRootColors();
    resetOndergrondToPresets();
    document
      .querySelectorAll(".k-transp")
      .forEach((cb) => (cb.checked = false));
  }
  updateRootUI();
  updateUI();
}

function cacheRootColors() {
  window.rootColorCache = { opname: [], stab: [] };
  document
    .querySelectorAll(".card-opname .inp-kleur")
    .forEach((inp) => window.rootColorCache.opname.push(inp.value));
  document
    .querySelectorAll(".card-stab .inp-kleur")
    .forEach((inp) => window.rootColorCache.stab.push(inp.value));
}

function restoreRootColors() {
  const cache = window.rootColorCache;
  const defaultColor = "#5c4033";
  document.querySelectorAll(".card-opname .inp-kleur").forEach((inp, idx) => {
    inp.value =
      cache.opname && cache.opname[idx] ? cache.opname[idx] : defaultColor;
  });
  document.querySelectorAll(".card-stab .inp-kleur").forEach((inp, idx) => {
    inp.value = cache.stab && cache.stab[idx] ? cache.stab[idx] : defaultColor;
  });
}

function resetOndergrondToPresets() {
  document.querySelectorAll(".card-ondergrond").forEach((card) => {
    const typeVal =
      card.querySelector(".k-type").value === "CUSTOM"
        ? card.querySelector(".k-type-custom").value
        : card.querySelector(".k-type").value;
    const preset = KENMERK_PRESETS[typeVal];
    if (preset) {
      card.querySelector(".k-kleur").value = preset.k;
      card.querySelector(".k-pat-kleur").value = preset.pk;
      card.querySelector(".k-pat").value = preset.p;
    }
  });
}

function toggleHeader() {
  window.globalSettings.showHeader =
    document.getElementById("toggle-header").checked;
  updateUI();
  updateRootUI();
}
function updateHeaderFromInput() {
  const val = document.getElementById("header-text-input").value;
  const activeTab = document
    .getElementById("nav-fysisch")
    .classList.contains("active")
    ? "fysisch"
    : "beworteling";
  window.globalSettings.headers[activeTab] = val;
  if (activeTab === "fysisch")
    document.getElementById("vis-header-fysisch").innerText = val;
  else document.getElementById("vis-header-root").innerText = val;
}
function updateGlobalMeta() {
  window.globalSettings.project = document.getElementById("meta-project").value;
  window.globalSettings.locatie = document.getElementById("meta-locatie").value;
  window.globalSettings.opdrachtgever =
    document.getElementById("meta-opdrachtgever").value;
  window.globalSettings.onderzoeker =
    document.getElementById("meta-onderzoeker").value;
}

// ==========================================
// RENDER ENGINE
// ==========================================

function createGraphStructure(containerId, suffix) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const showHeader = window.globalSettings.showHeader;
  const headerDisplay = showHeader ? "block" : "none";
  const baseH = PX_BAR_H + 30;
  if (!showHeader) container.style.height = baseH + "px";
  else container.style.height = baseH + 40 + "px";

  const headerF = window.globalSettings.headers["fysisch"];
  const headerR = window.globalSettings.headers["beworteling"];

  if (suffix.includes("fys")) {
    container.innerHTML = `
            <div class="vis-header-title" id="vis-header-${suffix}" style="display:${headerDisplay}">${headerF}</div>
            <div class="profile-container">
                <div class="vis-column col-text-bodem vis-fysisch-dims" id="vis-text-bodem-${suffix}"></div>
                <div class="vis-column col-bar-bodem vis-fysisch-dims" id="vis-bar-bodem-${suffix}"></div>
                <div class="vis-column col-bar-bodem-spacer vis-fysisch-dims"></div>
                <div class="vis-column col-strip-ondergrond vis-fysisch-dims" id="vis-strip-ondergrond-${suffix}"></div>
                <div class="vis-column col-text-ondergrond vis-fysisch-dims" id="vis-text-ondergrond-${suffix}"></div>
            </div>`;
  } else {
    container.innerHTML = `
            <div class="vis-header-title" id="vis-header-${suffix}" style="display:${headerDisplay}">${headerR}</div>
            <div class="profile-container">
                <div class="vis-column col-text-root-left vis-beworteling-dims" id="vis-root-text-left-${suffix}"></div>
                <div class="vis-column col-bar-root-left vis-beworteling-dims" id="vis-root-bar-left-${suffix}"></div>
                <div class="vis-column col-bar-root-spacer vis-beworteling-dims"></div>
                <div class="vis-column col-bar-root-right vis-beworteling-dims" id="vis-root-bar-right-${suffix}"></div>
                <div class="vis-column col-text-root-right vis-beworteling-dims" id="vis-root-text-right-${suffix}"></div>
            </div>`;
  }
}

function updateUI() {
  renderPhysicalGraph(
    "vis-fysisch-wrapper",
    "vis-bar-bodem",
    "vis-text-bodem",
    "vis-strip-ondergrond",
    "vis-text-ondergrond",
  );
  updateBeschrijving();
}

function updateRootUI() {
  renderRootGraph(
    "vis-beworteling-wrapper",
    "vis-root-bar-left",
    "vis-root-bar-right",
    "vis-root-text-left",
    "vis-root-text-right",
  );
  updateWortelBeschrijving();
}

function clampPercentage(value) {
  return Math.max(0, Math.min(100, value));
}

function getManualRootPositions(card, count) {
  const input = card.querySelector(".r-positions");
  let positions = [];
  try {
    positions = JSON.parse(input?.value || "[]");
    if (!Array.isArray(positions)) positions = [];
  } catch (e) {
    positions = [];
  }

  positions = positions.slice(0, count).map((pos) => ({
    x: clampPercentage(parseFloat(pos.x) || 50),
    y: clampPercentage(parseFloat(pos.y) || 50),
  }));

  while (positions.length < count) {
    const i = positions.length;
    const x = 20 + ((i * 37) % 61);
    const y = count === 1 ? 50 : 10 + i * (80 / Math.max(1, count - 1));
    positions.push({ x: clampPercentage(x), y: clampPercentage(y) });
  }

  if (input) input.value = JSON.stringify(positions);
  return positions;
}

function renderManualRootsHtml(
  positions,
  kleur,
  stijl,
  sizeMult,
  cardClass,
  cardIndex,
  canDrag,
) {
  const isBalkjes = stijl === "Balkjes";
  const isNatuurlijk = stijl === "Natuurlijk";
  const cursor = canDrag ? "cursor:move; touch-action:none;" : "";
  return positions
    .map((pos, idx) => {
      const dragAttrs = canDrag
        ? `data-card-class="${cardClass}" data-card-index="${cardIndex}" data-root-index="${idx}" onpointerdown="startRootDrag(event)"`
        : "";
      let style = `position:absolute; left:${pos.x}%; top:${pos.y}%; transform:translate(-50%, -50%); ${cursor}`;
      let inner = "";
      if (isBalkjes) {
        const w = 22 * sizeMult;
        const h = 6 * sizeMult;
        style += ` width:${w}px; height:${h}px; background:${kleur}; border-radius:2px;`;
      } else if (isNatuurlijk) {
        const size = 30 * sizeMult;
        style += ` width:${size}px; height:${size}px;`;
        inner = `<svg viewBox="0 0 40 40" style="width:100%; height:100%; overflow:visible;"><path d="M20 2 C16 12 25 19 18 29 C15 33 13 36 12 39 M19 21 C12 24 8 29 5 35 M20 16 C27 19 31 24 35 30" stroke="${kleur}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
      } else {
        const size = 14 * sizeMult;
        style += ` width:${size}px; height:${size}px; background:${kleur}; border-radius:50%;`;
      }
      return `<div class="manual-root" ${dragAttrs} style="${style}">${inner}</div>`;
    })
    .join("");
}

let activeRootDrag = null;
function startRootDrag(event) {
  event.preventDefault();
  const root = event.currentTarget;
  const layer = root.closest(".manual-root-layer");
  if (!layer) return;
  activeRootDrag = {
    root,
    layer,
    cardClass: root.dataset.cardClass,
    cardIndex: parseInt(root.dataset.cardIndex),
    rootIndex: parseInt(root.dataset.rootIndex),
  };
  root.setPointerCapture?.(event.pointerId);
  moveRootDrag(event);
  document.addEventListener("pointermove", moveRootDrag);
  document.addEventListener("pointerup", stopRootDrag);
}

function moveRootDrag(event) {
  if (!activeRootDrag) return;
  const rect = activeRootDrag.layer.getBoundingClientRect();
  const x = clampPercentage(((event.clientX - rect.left) / rect.width) * 100);
  const y = clampPercentage(((event.clientY - rect.top) / rect.height) * 100);
  activeRootDrag.root.style.left = `${x}%`;
  activeRootDrag.root.style.top = `${y}%`;

  const card = document.querySelectorAll("." + activeRootDrag.cardClass)[
    activeRootDrag.cardIndex
  ];
  const input = card?.querySelector(".r-positions");
  if (!input) return;
  let positions = [];
  try {
    positions = JSON.parse(input.value || "[]");
  } catch (e) {
    positions = [];
  }
  positions[activeRootDrag.rootIndex] = {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  };
  input.value = JSON.stringify(positions);
  markProjectChanged();
}

function stopRootDrag() {
  activeRootDrag = null;
  document.removeEventListener("pointermove", moveRootDrag);
  document.removeEventListener("pointerup", stopRootDrag);
}

function renderPhysicalGraph(wrapperId, barId, textId, stripId, txtOId) {
  const max = parseInt(document.getElementById("maxDiepte").value) || 100;
  const showHeader = window.globalSettings.showHeader;
  const showBodemBg = document.getElementById("toggle-bodem-bg").checked;
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  if (wrapperId === "vis-fysisch-wrapper") {
    const headerTitle = document.getElementById("vis-header-fysisch");
    if (headerTitle) {
      const baseH = PX_BAR_H + 30;
      if (showHeader) {
        headerTitle.style.display = "block";
        wrapper.style.height = baseH + 40 + "px";
      } else {
        headerTitle.style.display = "none";
        wrapper.style.height = baseH + "px";
      }
    }
  }

  const scaleB = PX_BAR_H / max;
  const scaleT = PX_TEXT_H / max;
  [textId, barId, stripId, txtOId].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  });

  const bK = document.querySelectorAll(".card-bodem");
  const oK = document.querySelectorAll(".card-ondergrond");
  const hasOndergrond = oK.length > 0;
  const strip = document.getElementById(stripId);
  const txtO = document.getElementById(txtOId);

  if (strip) strip.style.display = hasOndergrond ? "block" : "none";
  if (txtO) txtO.style.display = hasOndergrond ? "block" : "none";

  bK.forEach((c, i, arr) => {
    const s = parseInt(c.querySelector(".inp-start").value),
      e = parseInt(c.querySelector(".inp-eind").value);
    if (s >= max) return;
    const topB = s * scaleB;
    const hB = (Math.min(e, max) - s) * scaleB;
    const topT = s * scaleT;
    const hT = (Math.min(e, max) - s) * scaleT;
    const txt = [
      getVal(c, ".inp-frac", ".inp-frac-custom"),
      getVal(c, ".inp-humus", ".inp-humus-custom"),
      getVal(c, ".inp-type", ".inp-type-custom"),
    ]
      .filter((v) => v !== "N.v.t." && v !== "")
      .join(" | ");
    const offset = parseInt(c.querySelector(".inp-offset").value) || 0;

    // Genereer de kleuren/patronen en de extra Zand-HTML
    const bgStyle = getBodemBgStyle(c, i, arr);
    const textureHtml = getTextureLayersHtml(c);

    const barEl = document.getElementById(barId);
    if (barEl)
      barEl.innerHTML += `<div class="layer-box" style="top:${topB}px; height:${hB}px; ${bgStyle}; position: relative; overflow: hidden;">${textureHtml}</div>`;

    let labelHtml = `<div class="layer-box" style="top:${topT}px; height:${hT}px;"><div class="text-box" style="justify-content:center; text-align:center; transform: translateY(${offset}px);">${txt}</div></div>`;
    let toonStart = true;
    if (i > 0) {
      const prev = arr[i - 1];
      const prevS = parseInt(prev.querySelector(".inp-start").value);
      const prevE = parseInt(prev.querySelector(".inp-eind").value);
      if (prevE - prevS < 6) toonStart = false;
    }
    if (toonStart)
      labelHtml += `<div class="tick-right" style="top:${topT}px;"></div><div class="depth-edge-label" style="top:${topT}px;">${s === 0 ? "0 cm" : "-" + s + " cm"}</div>`;
    if (i === arr.length - 1 || e >= max) {
      const effE = Math.min(e, max);
      if (effE - s >= 6)
        labelHtml += `<div class="tick-right" style="top:${topT + hT - 2}px;"></div><div class="depth-edge-label" style="top:${topT + hT}px;">-${effE} cm</div>`;
    }
    const textEl = document.getElementById(textId);
    if (textEl) textEl.innerHTML += labelHtml;
  });

  if (hasOndergrond) {
    if (txtO)
      txtO.innerHTML += `<div class="tick-left" style="top:0px;"></div><div class="depth-edge-label" style="top:0px;">0 cm</div>`;
    if (txtO)
      txtO.innerHTML += `<div class="tick-left" style="top:${PX_TEXT_H - 2}px;"></div><div class="depth-edge-label" style="top:${PX_TEXT_H}px;">-${max} cm</div>`;

    if (showBodemBg) {
      bK.forEach((c, i, arr) => {
        const s = parseInt(c.querySelector(".inp-start").value),
          e = parseInt(c.querySelector(".inp-eind").value);
        if (s >= max) return;
        const topB = s * scaleB;
        const hB = (Math.min(e, max) - s) * scaleB;

        const bgStyle = getBodemBgStyle(c, i, arr);
        const textureHtml = getTextureLayersHtml(c);

        const stripEl = document.getElementById(stripId);
        if (stripEl)
          stripEl.innerHTML += `<div class="layer-box" style="top:${topB}px; height:${hB}px; ${bgStyle} z-index: 0; position: relative; overflow: hidden;">${textureHtml}</div>`;
      });
    }

    oK.forEach((c) => {
      const s = parseInt(c.querySelector(".k-start").value),
        e = parseInt(c.querySelector(".k-eind").value);
      if (s >= max) return;
      const topB = s * scaleB;
      const hB = (Math.min(e, max) - s) * scaleB;
      const topT = s * scaleT;
      const hT = (Math.min(e, max) - s) * scaleT;
      const pos = c.querySelector(".k-pos").value;
      const offset = parseInt(c.querySelector(".k-offset").value) || 0;
      let ws = "width:100% !important;",
        ls = "left:0 !important;";
      let ts = "justify-content:center; text-align:center; width:100%; left:0;";
      if (pos === "Links") {
        ws = "width:50% !important;";
        ls = "left:0 !important;";
      }
      if (pos === "Rechts") {
        ws = "width:50% !important;";
        ls = "left:50% !important;";
      }
      const rCirkel = pos === "Volledig" ? 40 : 22;
      const SVG_PATRONEN = {
        Diag: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22%3E%3Cpath d=%22M-1,11 L11,-1%22 stroke=%22KLEUR%22 stroke-width=%222%22/%3E%3C/svg%3E",
        Kruis:
          "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22%3E%3Cpath d=%22M0,0 L10,10 M10,0 L0,10%22 stroke=%22KLEUR%22 stroke-width=%222%22/%3E%3C/svg%3E",
        Horiz:
          "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22%3E%3Cpath d=%22M0,5 L10,5%22 stroke=%22KLEUR%22 stroke-width=%222%22/%3E%3C/svg%3E",
        Stip: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%228%22 height=%228%22%3E%3Ccircle cx=%224%22 cy=%224%22 r=%222%22 fill=%22KLEUR%22/%3E%3C/svg%3E",
        Golv: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22%3E%3Cpath d=%22M0,6 Q3,0 6,6 T12,6%22 stroke=%22KLEUR%22 stroke-width=%221.5%22 fill=%22none%22/%3E%3C/svg%3E",
        Cirkel: `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%22${rCirkel}%22 stroke=%22black%22 stroke-width=%224%22 fill=%22KLEUR%22/%3E%3C/svg%3E`,
      };

      const tVal = getVal(c, ".k-type", ".k-type-custom");
      const pVal = c.querySelector(".k-pat").value;
      const lijnKleur = c
        .querySelector(".k-pat-kleur")
        .value.replace("#", "%23");

      let bgKleur = c.querySelector(".k-kleur").value;
      const isTransp = c.querySelector(".k-transp")
        ? c.querySelector(".k-transp").checked
        : false;
      if (isTransp) {
        bgKleur = "transparent";
      }

      let bgImage = "none";
      let extraClass = "";
      let renderTop = topB;
      let renderHeight = hB;
      let bgSize = "auto";
      if (tVal !== "N.v.t.") {
        if (pVal.includes("Diag"))
          bgImage = `url('${SVG_PATRONEN["Diag"].replace("KLEUR", lijnKleur)}')`;
        else if (pVal.includes("Kruis"))
          bgImage = `url('${SVG_PATRONEN["Kruis"].replace("KLEUR", lijnKleur)}')`;
        else if (pVal.includes("Horiz"))
          bgImage = `url('${SVG_PATRONEN["Horiz"].replace("KLEUR", lijnKleur)}')`;
        else if (pVal.includes("Stip"))
          bgImage = `url('${SVG_PATRONEN["Stip"].replace("KLEUR", lijnKleur)}')`;
        else if (pVal.includes("Golv"))
          bgImage = `url('${SVG_PATRONEN["Golv"].replace("KLEUR", lijnKleur)}')`;
        else if (pVal.includes("Cirkel")) {
          bgImage = `url('${SVG_PATRONEN["Cirkel"].replace(/KLEUR/g, lijnKleur)}')`;
          extraClass = "cirkel-fix";
          bgSize = "contain";
          const minSize = 20;
          if (renderHeight < minSize) {
            const diff = minSize - renderHeight;
            renderTop = topB - diff / 2;
            renderHeight = minSize;
          }
        }
      }
      const bgRepeat = bgSize === "contain" ? "no-repeat" : "repeat";
      const bgPos = bgSize === "contain" ? "center" : "left top";

      const stripEl = document.getElementById(stripId);
      if (stripEl)
        stripEl.innerHTML += `<div class="layer-box ${extraClass}" style="top:${renderTop}px; height:${renderHeight}px; background-color:${bgKleur}; background-image:${bgImage}; background-size:${bgSize}; background-repeat:${bgRepeat}; background-position:${bgPos}; ${ws} ${ls} z-index: 1;"></div>`;

      const isDun = hT < 28;
      const inhoud =
        tVal === "N.v.t."
          ? ""
          : tVal + "<br>" + c.querySelector(".k-info").value;
      let dunStyle = "";
      if (isDun) {
        dunStyle = `align-items: flex-start; padding-top: 6px; overflow: visible; height: auto; white-space: nowrap; transform: translateY(${offset}px);`;
      } else {
        dunStyle = `transform: translateY(${offset}px);`;
      }
      const txtEl = document.getElementById(txtOId);
      if (txtEl)
        txtEl.innerHTML += `<div class="layer-box" style="top:${topT}px; height:${hT}px; z-index: 20;"><div class="text-box" style="${ts} ${dunStyle}">${inhoud}</div></div>`;

      if (s > 0 && txtEl)
        txtEl.innerHTML += `<div class="tick-left" style="top:${topT}px;"></div><div class="depth-edge-label" style="top:${topT}px;">-${s} cm</div>`;
      if (e < max && !isDun && txtEl)
        txtEl.innerHTML += `<div class="tick-left" style="top:${topT + hT}px;"></div><div class="depth-edge-label" style="top:${topT + hT}px;">-${e} cm</div>`;
    });
  }
}

function renderRootGraph(
  wrapperId,
  barIdLeft,
  barIdRight,
  textIdLeft,
  textIdRight,
) {
  const max = parseInt(document.getElementById("maxDiepte").value) || 100;
  const showHeader = window.globalSettings.showHeader;
  const showBodemBg = document.getElementById("toggle-bodem-bg").checked;
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  if (wrapperId === "vis-beworteling-wrapper") {
    const headerTitle = document.getElementById("vis-header-root");
    if (headerTitle) {
      const baseH = PX_BAR_H + 30;
      if (showHeader) {
        headerTitle.style.display = "block";
        wrapper.style.height = baseH + 40 + "px";
      } else {
        headerTitle.style.display = "none";
        wrapper.style.height = baseH + "px";
      }
    }
  }

  const scaleB = PX_BAR_H / max;
  const scaleT = PX_TEXT_H / max;
  [textIdLeft, barIdLeft, barIdRight, textIdRight].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  });

  const drawTicks = (id, isRight) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML += `<div class="${isRight ? "tick-left" : "tick-right"}" style="top:0px;"></div><div class="depth-edge-label" style="top:0px;">0 cm</div>`;
      el.innerHTML += `<div class="${isRight ? "tick-left" : "tick-right"}" style="top:${PX_TEXT_H - 2}px;"></div><div class="depth-edge-label" style="top:${PX_TEXT_H}px;">-${max} cm</div>`;
    }
  };
  drawTicks(textIdLeft, false);
  drawTicks(textIdRight, true);

  if (showBodemBg) {
    const bodemCards = document.querySelectorAll(".card-bodem");
    bodemCards.forEach((c, i, arr) => {
      const s = parseInt(c.querySelector(".inp-start").value),
        e = parseInt(c.querySelector(".inp-eind").value);
      if (s >= max) return;
      const topB = s * scaleB;
      const hB = (Math.min(e, max) - s) * scaleB;

      const bgStyle = getBodemBgStyle(c, i, arr);
      const textureHtml = getTextureLayersHtml(c);

      const bgHtml = `<div class="layer-box" style="top:${topB}px; height:${hB}px; ${bgStyle} z-index: 1; position: relative; overflow: hidden;">${textureHtml}</div>`;
      const bl = document.getElementById(barIdLeft);
      if (bl) bl.innerHTML += bgHtml;
      const br = document.getElementById(barIdRight);
      if (br) br.innerHTML += bgHtml;
    });
  }

  const renderRoot = (cardClass, barId, textId, isLeft) => {
    document.querySelectorAll("." + cardClass).forEach((c, i, arr) => {
      const s = parseInt(c.querySelector(".inp-start").value),
        e = parseInt(c.querySelector(".inp-eind").value);
      if (s >= max) return;
      const topB = s * scaleB;
      const hB = (Math.min(e, max) - s) * scaleB;
      const topT = s * scaleT;
      const hT = (Math.min(e, max) - s) * scaleT;
      const tVal = getVal(c, ".r-type", ".r-type-custom");
      const dVal = c.querySelector(".r-diam").value;
      let kleur = c.querySelector(".inp-kleur").value;
      const stijl = c.querySelector(".r-style").value;
      const op = c.querySelector(".r-oper")
        ? c.querySelector(".r-oper").value
        : "";
      const sizeChar = c.querySelector(".r-size")
        ? c.querySelector(".r-size").value
        : "●";
      const offset = parseInt(c.querySelector(".inp-offset").value) || 0;
      const customCount = parseInt(c.querySelector(".r-count")?.value) || 0;
      const lowerT = tVal.toLowerCase();

      let bgKleur = showBodemBg ? "transparent" : "#f2efe9";
      let symboolKleur = kleur;
      let sizeMult = 1.0;
      if (sizeChar === "•") sizeMult = 0.6;
      if (sizeChar === "⬤") sizeMult = 1.4;
      let bgImage = "none";
      let bgSize = "100% 100%";
      let bgRepeat = "repeat";
      let bgPos = "left top";
      let renderHeight = hB;
      let renderTop = topB;
      let forceIconMode = false;
      const minIconHeight = 30;

      if (tVal.includes("Stabiliteitswortel")) {
        if (renderHeight < minIconHeight) {
          forceIconMode = true;
          const diff = minIconHeight - renderHeight;
          renderHeight = minIconHeight;
          renderTop = topB - diff / 2;
        }
      }
      if (tVal === "Stabiliteitswortel" && stijl === "Cirkels") {
        const density = customCount || 1;
        bgImage =
          density === 1
            ? generateSingleRootSVG(symboolKleur)
            : generateCircleSVG(density, 5 * sizeMult, symboolKleur);
        const baseSize = 30 * sizeMult;
        bgSize = density === 1 ? `${baseSize}px ${baseSize}px` : "100% 100%";
        bgRepeat = "no-repeat";
        bgPos = "center";
      } else if (tVal === "Stabiliteitswortels" && stijl === "Cirkels") {
        const density = customCount || 3;
        bgImage = customCount
          ? generateCircleSVG(density, 5 * sizeMult, symboolKleur)
          : generateFixedClusterSVG(symboolKleur);
        const baseW = 60 * sizeMult;
        const baseH = 22 * sizeMult;
        bgSize = customCount ? "100% 100%" : `${baseW}px ${baseH}px`;
        bgRepeat = "no-repeat";
        bgPos = "center";
      } else if (!lowerT.includes("geen")) {
        let density = 0;
        let dikte = 1.5;
        if (stijl === "Cirkels") {
          if (lowerT.includes("grove")) {
            dikte = 6 * sizeMult;
            density = 5;
          } else if (lowerT.includes("afgestorven")) {
            dikte = 5 * sizeMult;
            density = 1;
          } else if (lowerT.includes("intensief")) {
            dikte = 5 * sizeMult;
            density = 5;
          } else {
            dikte = 5 * sizeMult;
            density = 3;
          }
          if (customCount) density = customCount;
          bgImage = generateCircleSVG(density, dikte, symboolKleur);
        } else if (stijl === "Balkjes") {
          density = customCount || (lowerT.includes("intensief") ? 20 : 8);
          bgImage = generateStripeSVG(density, dikte);
        } else {
          density = customCount || (lowerT.includes("intensief") ? 8 : 4);
          bgImage = generateRootSVG(density, dikte, symboolKleur);
        }
      }
      const zIndex = tVal.includes("Stabiliteitswortel") ? 50 : 5;
      const bEl = document.getElementById(barId);
      if (bEl && customCount && !lowerT.includes("geen")) {
        const positions = getManualRootPositions(c, customCount);
        const rootsHtml = renderManualRootsHtml(
          positions,
          symboolKleur,
          stijl,
          sizeMult,
          cardClass,
          i,
          wrapperId === "vis-beworteling-wrapper",
        );
        bEl.innerHTML += `<div class="layer-box manual-root-layer" style="top:${renderTop}px; height:${renderHeight}px; background-color:${bgKleur}; z-index:${zIndex}; overflow:hidden;">${rootsHtml}</div>`;
      } else if (bEl) {
        bEl.innerHTML += `<div class="layer-box" style="top:${renderTop}px; height:${renderHeight}px; background-color:${bgKleur}; background-image:${bgImage}; background-size:${bgSize}; background-repeat:${bgRepeat}; background-position:${bgPos}; z-index:${zIndex}; overflow:visible;"></div>`;
      }
      if (forceIconMode && hB > 0 && bEl) {
        bEl.innerHTML += `<div class="layer-box" style="top:${topB}px; height:${hB}px; background-color:${bgKleur}; z-index:4;"></div>`;
      }

      let desc = "";
      let parts = tVal.split(" (");
      if (parts.length > 1) {
        let n = parts[0];
        let sub = "(" + parts[1];
        let diam = dVal ? ` ${op} ${dVal.replace(".", ",")} cm` : "";
        desc = `${n}<br>${sub}${diam}`;
      } else {
        let diam = dVal ? `<br>${op} ${dVal.replace(".", ",")} cm` : "";
        desc = tVal + diam;
      }

      const align = isLeft ? "flex-end" : "flex-start";
      const textAlign = isLeft ? "right" : "left";
      const pad = isLeft ? "padding-right:5px;" : "padding-left:5px;";
      let labelHtml = `<div class="layer-box" style="top:${topT}px; height:${hT}px;"><div class="text-box" style="justify-content:${align}; text-align:${textAlign}; ${pad} transform: translateY(${offset}px);">${desc}</div></div>`;

      const minDikteVoorBeideLabels = 6;
      const minAfstandTotVorige = 3;
      let toonStart = true;
      let toonEind = true;
      if (s === 0) {
        toonStart = false;
      } else if (i > 0) {
        const prev = arr[i - 1];
        const prevE = parseInt(prev.querySelector(".inp-eind").value);
        if (s - prevE < minAfstandTotVorige) {
          toonStart = false;
        }
      }
      if (e - s < minDikteVoorBeideLabels) {
        toonStart = false;
      }
      if (e >= max) {
        toonEind = false;
      }

      if (toonStart)
        labelHtml += `<div class="${isLeft ? "tick-right" : "tick-left"}" style="top:${topT}px;"></div><div class="depth-edge-label" style="top:${topT}px;">-${s} cm</div>`;
      if (toonEind) {
        const effE = Math.min(e, max);
        labelHtml += `<div class="${isLeft ? "tick-right" : "tick-left"}" style="top:${topT + hT - 2}px;"></div><div class="depth-edge-label" style="top:${topT + hT}px;">-${effE} cm</div>`;
      }
      const txtEl = document.getElementById(textId);
      if (txtEl) txtEl.innerHTML += labelHtml;
    });
  };
  renderRoot("card-opname", barIdLeft, textIdLeft, true);
  renderRoot("card-stab", barIdRight, textIdRight, false);
}

// --- SVG GENERATORS ---
function generateSingleRootSVG(kleur) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="25" fill="${kleur}" stroke="none"/></svg>`;
  return (
    "url('data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) + "')"
  );
}
function generateFixedClusterSVG(kleur) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><circle cx="15" cy="15" r="14" fill="${kleur}" stroke="none"/><circle cx="85" cy="15" r="14" fill="${kleur}" stroke="none"/><circle cx="50" cy="40" r="14" fill="${kleur}" stroke="none"/></svg>`;
  return (
    "url('data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) + "')"
  );
}
function generateRootSVG(density, dikte, kleur) {
  const parts = [];
  const isGrof = dikte >= 2;
  if (isGrof) {
    const numRoots = Math.max(2, Math.ceil(density / 3));
    const mainDikte = dikte;
    const branchDikte = dikte * 0.6;
    for (let i = 0; i < numRoots; i++) {
      const startX = 15 + Math.random() * 70;
      const startY = Math.random() * 20;
      const endX = startX + (Math.random() * 40 - 20);
      const endY = startY + 50 + Math.random() * 40;
      const midX = (startX + endX) / 2 + (Math.random() * 15 - 7.5);
      const midY = (startY + endY) / 2;
      parts.push(
        `<path d="M${startX},${startY} L${midX},${midY} L${endX},${endY}" stroke="${kleur}" stroke-width="${mainDikte}" fill="none" opacity="0.95" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
      const numBranches = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numBranches; j++) {
        const splitRatio = 0.2 + Math.random() * 0.6;
        const splitX = startX + (endX - startX) * splitRatio;
        const splitY = startY + (endY - startY) * splitRatio;
        const branchLen = 15 + Math.random() * 20;
        const branchDir = Math.random() > 0.5 ? 1 : -1;
        const bEndX = splitX + branchLen * branchDir * (0.4 + Math.random());
        const bEndY = splitY + branchLen * (0.4 + Math.random());
        parts.push(
          `<path d="M${splitX},${splitY} L${bEndX},${bEndY}" stroke="${kleur}" stroke-width="${branchDikte}" fill="none" opacity="0.9" stroke-linecap="round"/>`,
        );
      }
    }
  } else {
    const fineDikte = 0.7;
    for (let i = 0; i < density; i++) {
      const startX = 5 + Math.random() * 90;
      const startY = 5 + Math.random() * 80;
      const len = 15 + Math.random() * 20;
      const x1 = startX + (Math.random() * 8 - 4);
      const y1 = startY + len * 0.4;
      const x2 = x1 + (Math.random() * 8 - 4);
      const y2 = startY + len * 0.8;
      const endX = x2 + (Math.random() * 8 - 4);
      const endY = startY + len;
      parts.push(
        `<path d="M${startX},${startY} L${x1},${y1} L${x2},${y2} L${endX},${endY}" stroke="${kleur}" stroke-width="${fineDikte}" fill="none" opacity="0.75" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
      if (Math.random() > 0.5) {
        const splitX = x2 + (Math.random() * 10 - 5);
        const splitY = y2 + Math.random() * 10;
        parts.push(
          `<path d="M${x2},${y2} L${splitX},${splitY}" stroke="${kleur}" stroke-width="${fineDikte}" fill="none" opacity="0.75" stroke-linecap="round"/>`,
        );
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${parts.join("")}</svg>`;
  return (
    "url('data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) + "')"
  );
}
function generateCircleSVG(density, dikte, kleur) {
  let circles = "";
  const r = dikte;
  const step = 80 / Math.max(1, density);
  for (let i = 0; i < density; i++) {
    const cx = Math.floor(Math.random() * 70) + 15;
    const cy = i * step + 10 + Math.random() * 5;
    circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${kleur}" opacity="0.9"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">${circles}</svg>`;
  return (
    "url('data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) + "')"
  );
}
function generateStripeSVG(density, dikte) {
  let bars = "";
  const count = Math.max(1, density || 1);
  const h = dikte < 2 ? 3 : 8;
  const step = 100 / count;
  for (let i = 0; i < count; i++) {
    const kleur = i % 2 === 0 ? "#aaaaaa" : "#555555";
    const y = i * step;
    bars += `<rect x="0" y="${y}" width="100" height="${h}" fill="${kleur}" stroke="none"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${bars}</svg>`;
  return (
    "url('data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) + "')"
  );
}

// ==========================================
// NAVIGATIE & TABS
// ==========================================

function wisselTab(tabNaam) {
  const vorigeTab = window.activeTab;
  window.activeTab = tabNaam;
  ["view-fysisch", "view-beworteling"].forEach(
    (id) => (document.getElementById(id).style.display = "none"),
  );
  ["nav-fysisch", "nav-beworteling", "nav-collage"].forEach((id) =>
    document.getElementById(id).classList.remove("active"),
  );
  document.getElementById("dashboard-container").style.display = "none";
  document.getElementById("collage-view").style.display = "none";

  document.getElementById("nav-" + tabNaam).classList.add("active");

  if (tabNaam === "collage") {
    document.getElementById("collage-view").style.display = "flex";
    updateCollageUI();
  } else {
    document.getElementById("dashboard-container").style.display = "flex";
    const inputBodem = document.getElementById("input-sectie-bodem");
    const inputOpname = document.getElementById("input-sectie-opname");
    const inputOndergrond = document.getElementById("input-sectie-ondergrond");
    const inputStab = document.getElementById("input-sectie-stab");
    const photosFysisch = document.getElementById("photos-fysisch-panel");
    const photosBeworteling = document.getElementById(
      "photos-beworteling-panel",
    );

    if (inputBodem)
      inputBodem.style.display = tabNaam === "fysisch" ? "flex" : "none";
    if (inputOpname)
      inputOpname.style.display = tabNaam === "beworteling" ? "flex" : "none";
    if (inputOndergrond)
      inputOndergrond.style.display = tabNaam === "fysisch" ? "flex" : "none";
    if (inputStab)
      inputStab.style.display = tabNaam === "beworteling" ? "flex" : "none";
    if (photosFysisch)
      photosFysisch.style.display = tabNaam === "fysisch" ? "block" : "none";
    if (photosBeworteling)
      photosBeworteling.style.display =
        tabNaam === "beworteling" ? "block" : "none";

    document.getElementById("vis-fysisch-wrapper").style.display =
      tabNaam === "fysisch" ? "flex" : "none";
    document.getElementById("vis-beworteling-wrapper").style.display =
      tabNaam === "beworteling" ? "flex" : "none";
    document.getElementById("view-" + tabNaam).style.display = "flex";

    const currentHeader = window.globalSettings.headers
      ? window.globalSettings.headers[tabNaam]
      : tabNaam === "fysisch"
        ? "Fysisch"
        : "Wortelontwikkeling";
    document.getElementById("header-text-input").value = currentHeader;
    if (tabNaam === "beworteling") updateRootUI();
    if (tabNaam === "fysisch") updateUI();

    if (vorigeTab && vorigeTab !== tabNaam) scrollFieldModeToProfile();
  }
}

function scrollFieldModeToProfile() {
  if (!document.body.classList.contains("field-mode")) return;
  requestAnimationFrame(() => {
    document.getElementById("profielgegevens-heading")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

function genereerGPOTabs() {
  const con = document.getElementById("gpo-tabs-wrapper");
  con.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement("button");
    btn.className = `gpo-tab-btn ${i === currentGPO ? "active" : ""}`;
    btn.innerText = i;
    btn.onclick = () => wisselGPO(i);
    con.appendChild(btn);
  }
}
function renderGPOTabs() {
  document.querySelectorAll(".gpo-tab-btn").forEach((btn, idx) => {
    let i = idx + 1;
    if (i === currentGPO) btn.classList.add("active");
    else btn.classList.remove("active");
    if (
      window.projectData[i] &&
      (window.projectData[i].b.length > 0 ||
        window.projectData[i].ro.length > 0)
    )
      btn.classList.add("gpo-has-data");
    else btn.classList.remove("gpo-has-data");
  });
  document.getElementById("gpo-status").innerText = `GPO #${currentGPO}`;
  if (document.getElementById("gpo-status-root"))
    document.getElementById("gpo-status-root").innerText =
      `GPO #${currentGPO} (Beworteling)`;
}

function heeftGPOData(gpoData) {
  if (!gpoData) return false;
  return ["b", "o", "ro", "rs"].some(
    (key) => Array.isArray(gpoData[key]) && gpoData[key].length > 0,
  );
}

let pendingPhotoCategory = null;
const MAX_FIELD_PHOTOS = 4;
const PHOTO_MAX_SIZE = 1600;
const PHOTO_QUALITY = 0.8;
const STORAGE_DB_NAME = "bodemtool-storage";
const STORAGE_DB_VERSION = 1;
const PHOTO_STORE = "photos";
const DRAFT_STORE = "drafts";
const CURRENT_DRAFT_ID = "current-project";
let storageDbPromise = null;
let fieldPhotoObjectUrls = [];
let fieldPhotoRenderVersion = 0;

function openStorageDb() {
  if (!storageDbPromise) {
    storageDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(STORAGE_DB_NAME, STORAGE_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE))
          db.createObjectStore(PHOTO_STORE, { keyPath: "id" });
        if (!db.objectStoreNames.contains(DRAFT_STORE))
          db.createObjectStore(DRAFT_STORE, { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return storageDbPromise;
}

async function runStorageTransaction(storeName, mode, operation) {
  const db = await openStorageDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    let result;
    try {
      result = operation(store);
    } catch (error) {
      reject(error);
      return;
    }
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function putPhotoBlob(id, blob) {
  return runStorageTransaction(PHOTO_STORE, "readwrite", (store) =>
    store.put({ id, blob, updatedAt: Date.now() }),
  );
}

async function getPhotoBlob(id) {
  const db = await openStorageDb();
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(PHOTO_STORE, "readonly")
      .objectStore(PHOTO_STORE)
      .get(id);
    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => reject(request.error);
  });
}

function deletePhotoBlob(id) {
  return runStorageTransaction(PHOTO_STORE, "readwrite", (store) =>
    store.delete(id),
  );
}

async function prunePhotoStore(projectDataToKeep) {
  const activeIds = new Set();
  for (let nummer = 1; nummer <= 10; nummer++) {
    const photos = projectDataToKeep[nummer]?.photos;
    if (!photos) continue;
    ["fysisch", "beworteling"].forEach((category) => {
      (photos[category] || []).forEach((photo) => activeIds.add(photo.id));
    });
  }
  const db = await openStorageDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE, "readwrite");
    const store = transaction.objectStore(PHOTO_STORE);
    const request = store.getAllKeys();
    request.onsuccess = () => {
      request.result.forEach((id) => {
        if (!activeIds.has(id)) store.delete(id);
      });
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

function setAutoSaveStatus(text, state = "") {
  const status = document.getElementById("autosave-status");
  if (!status) return;
  status.textContent = text;
  status.className = `autosave-status ${state}`.trim();
}

function markProjectChanged() {
  window.hasUnsavedChanges = true;
  if (!window.autoSaveReady) return;
  setAutoSaveStatus("Opslaan…", "saving");
  clearTimeout(window.autoSaveTimer);
  window.autoSaveTimer = setTimeout(saveAutoDraft, 600);
}

async function saveAutoDraft() {
  if (!window.autoSaveReady) return;
  try {
    if (document.getElementById("meta-project")) updateGlobalMeta();
    slaHuidigProfielOpInGeheugen();
    await runStorageTransaction(DRAFT_STORE, "readwrite", (store) =>
      store.put({
        id: CURRENT_DRAFT_ID,
        data: window.projectData,
        global: window.globalSettings,
        updatedAt: Date.now(),
      }),
    );
    window.hasUnsavedChanges = false;
    setAutoSaveStatus("Lokaal opgeslagen", "saved");
  } catch (error) {
    console.error(error);
    setAutoSaveStatus("Opslaan mislukt", "error");
  }
}

async function restoreAutoDraft() {
  try {
    const db = await openStorageDb();
    const draft = await new Promise((resolve, reject) => {
      const request = db
        .transaction(DRAFT_STORE, "readonly")
        .objectStore(DRAFT_STORE)
        .get(CURRENT_DRAFT_ID);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    if (!draft?.data) return false;
    await applyLoadedProject({ data: draft.data, global: draft.global }, null, false);
    return true;
  } catch (error) {
    console.error("Automatisch opgeslagen project kon niet worden hersteld.", error);
    setAutoSaveStatus("Herstel mislukt", "error");
    return false;
  }
}

async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist) await navigator.storage.persist();
  } catch (error) {
    console.warn("Permanente browseropslag kon niet worden aangevraagd.", error);
  }
}

function getEmptyPhotos() {
  return { fysisch: [], beworteling: [] };
}

function ensureCurrentGPOPhotos() {
  if (!window.projectData[currentGPO]) window.projectData[currentGPO] = { photos: getEmptyPhotos() };
  if (!window.projectData[currentGPO].photos) window.projectData[currentGPO].photos = getEmptyPhotos();
  if (!Array.isArray(window.projectData[currentGPO].photos.fysisch)) window.projectData[currentGPO].photos.fysisch = [];
  if (!Array.isArray(window.projectData[currentGPO].photos.beworteling)) window.projectData[currentGPO].photos.beworteling = [];
  return window.projectData[currentGPO].photos;
}

function triggerFieldPhotoUpload(category) {
  slaHuidigProfielOpInGeheugen();
  const photos = ensureCurrentGPOPhotos();
  if (photos[category].length >= MAX_FIELD_PHOTOS) {
    toonNotificatie("Maximaal 4 foto's per onderdeel.", "fout");
    return;
  }
  pendingPhotoCategory = category;
  document.getElementById("field-photo-input")?.click();
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, PHOTO_MAX_SIZE / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("Foto converteren mislukt.")),
          "image/jpeg",
          PHOTO_QUALITY,
        );
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleFieldPhotoUpload(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file || !pendingPhotoCategory) return;
  try {
    const photos = ensureCurrentGPOPhotos();
    if (photos[pendingPhotoCategory].length >= MAX_FIELD_PHOTOS) return;
    const blob = await resizeImageFile(file);
    const id = crypto.randomUUID
      ? `photo-${crypto.randomUUID()}`
      : `photo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await putPhotoBlob(id, blob);
    photos[pendingPhotoCategory].push({
      id,
      label: `Foto ${photos[pendingPhotoCategory].length + 1}`,
      type: "image/jpeg",
      size: blob.size,
    });
    markProjectChanged();
    await renderFieldPhotos();
  } catch (error) {
    console.error(error);
    toonNotificatie("Foto toevoegen mislukt.", "fout");
  }
}

async function removeFieldPhoto(category, index) {
  const photos = ensureCurrentGPOPhotos();
  const [removed] = photos[category].splice(index, 1);
  if (removed?.id) await deletePhotoBlob(removed.id);
  markProjectChanged();
  await renderFieldPhotos();
}

async function renderFieldPhotos() {
  const renderVersion = ++fieldPhotoRenderVersion;
  const photos = ensureCurrentGPOPhotos();
  fieldPhotoObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  fieldPhotoObjectUrls = [];
  for (const category of ["fysisch", "beworteling"]) {
    const grid = document.getElementById(`photos-${category}-grid`);
    if (!grid) continue;
    grid.innerHTML = "";
    for (const [idx, photo] of photos[category].entries()) {
      const blob = await getPhotoBlob(photo.id);
      if (renderVersion !== fieldPhotoRenderVersion) return;
      if (!blob || !grid.isConnected) continue;
      const url = URL.createObjectURL(blob);
      fieldPhotoObjectUrls.push(url);
      const card = document.createElement("div");
      card.className = "field-photo-card";
      const img = document.createElement("img");
      img.src = url;
      img.alt = photo.label || `Foto ${idx + 1}`;
      const actions = document.createElement("div");
      actions.className = "field-photo-actions";
      const label = document.createElement("span");
      label.style.cssText = "flex:1; font-size:12px;";
      label.textContent = photo.label || `Foto ${idx + 1}`;
      const button = document.createElement("button");
      button.className = "action-btn";
      button.type = "button";
      button.textContent = "Verwijder";
      button.onclick = () => removeFieldPhoto(category, idx);
      actions.append(label, button);
      card.append(img, actions);
      grid.appendChild(card);
    }
  }
}

function dupliceerNaarVolgendeGPO() {
  const bron = currentGPO;
  const doel = bron + 1;
  if (doel > 10) {
    toonNotificatie("Geen volgende GPO beschikbaar.", "fout");
    return;
  }

  slaHuidigProfielOpInGeheugen();
  if (!window.projectData[bron]) {
    toonNotificatie("Er is geen GPO-data om te dupliceren.", "fout");
    return;
  }

  if (heeftGPOData(window.projectData[doel])) {
    const overschrijven = confirm(
      `GPO ${doel} bevat al gegevens. Wil je deze overschrijven?`,
    );
    if (!overschrijven) return;
  }

  window.projectData[doel] = JSON.parse(
    JSON.stringify(window.projectData[bron]),
  );
  window.projectData[doel].photos = getEmptyPhotos();
  markProjectChanged();
  wisselGPO(doel);
  toonNotificatie(`GPO ${bron} gekopieerd naar GPO ${doel}.`, "succes");
}

function wisselGPO(nieuwNummer) {
  if (currentGPO === nieuwNummer) return;
  slaHuidigProfielOpInGeheugen();
  currentGPO = nieuwNummer;
  [
    "bodem-container",
    "ondergrond-container",
    "opname-container",
    "stab-container",
  ].forEach((id) => (document.getElementById(id).innerHTML = ""));
  const data = window.projectData[currentGPO];
  if (data) {
    document.getElementById("maxDiepte").value = data.max || 100;
    if (data.b && data.b.length > 0) data.b.forEach((x) => voegBodemLaagToe(x));
    else voegBodemLaagToe();
    if (data.o && data.o.length > 0)
      data.o.forEach((x) => voegOndergrondKenmerkToe(x));
    else voegOndergrondKenmerkToe();
    if (data.ro && data.ro.length > 0)
      data.ro.forEach((x) => voegOpnameLaagToe(x));
    else voegOpnameLaagToe();
    if (data.rs && data.rs.length > 0)
      data.rs.forEach((x) => voegStabLaagToe(x));
    else {
      voegStabLaagToe({
        s: 0,
        e: parseInt(data.max || 100),
        t: "Geen stabiliteitsbeworteling",
        k: "#5c4033",
      });
    }
    herstelMetaGegevens();
  } else {
    const max = 100;
    document.getElementById("maxDiepte").value = max;
    herstelMetaGegevens();
    voegBodemLaagToe();
    voegOpnameLaagToe();
    voegStabLaagToe({
      s: 0,
      e: max,
      t: "Geen stabiliteitsbeworteling",
      k: "#5c4033",
    });
    voegOndergrondKenmerkToe();
  }
  renderGPOTabs();
  syncMaxDieptes();
  renderFieldPhotos();
  scrollFieldModeToProfile();
}

function slaHuidigProfielOpInGeheugen() {
  if (typeof projectData === "undefined") return;
  const d = {
    max: document.getElementById("maxDiepte").value,
    b: [],
    o: [],
    ro: [],
    rs: [],
    photos: projectData[currentGPO]?.photos || getEmptyPhotos(),
    meta: {
      boom: document.getElementById("meta-boomnr")?.value || "",
      dist: document.getElementById("meta-afstand")?.value || "",
      wind: document.getElementById("meta-wind")?.value || "noordzijde",
      datum: document.getElementById("meta-datum")?.value || "",
    },
  };
  const getSafeVal = (el, selector) => {
    const target = el.querySelector(selector);
    return target ? target.value : "";
  };

  document.querySelectorAll(".card-bodem").forEach((c) => {
    d.b.push({
      s: getSafeVal(c, ".inp-start"),
      e: getSafeVal(c, ".inp-eind"),
      t: getVal(c, ".inp-type", ".inp-type-custom"),
      f: getVal(c, ".inp-frac", ".inp-frac-custom"),
      h: getVal(c, ".inp-humus", ".inp-humus-custom"),
      k: getSafeVal(c, ".inp-kleur"),
      g: c.querySelector(".inp-grad")?.checked || false,
      off: getSafeVal(c, ".inp-offset"),
      tx: getSafeVal(c, ".inp-textuur"),
    });
  });

  document.querySelectorAll(".card-ondergrond").forEach((c) => {
    d.o.push({
      s: getSafeVal(c, ".k-start"),
      e: getSafeVal(c, ".k-eind"),
      t: getVal(c, ".k-type", ".k-type-custom"),
      p: getSafeVal(c, ".k-pat"),
      k: getSafeVal(c, ".k-kleur"),
      pk: getSafeVal(c, ".k-pat-kleur"),
      i: getSafeVal(c, ".k-info"),
      pos: getSafeVal(c, ".k-pos"),
      offset: getSafeVal(c, ".k-offset"),
      tr: c.querySelector(".k-transp")
        ? c.querySelector(".k-transp").checked
        : false,
    });
  });

  document.querySelectorAll(".card-opname").forEach((c) => {
    d.ro.push({
      s: getSafeVal(c, ".inp-start"),
      e: getSafeVal(c, ".inp-eind"),
      t: getSafeVal(c, ".r-type"),
      d: getSafeVal(c, ".r-diam"),
      k: getSafeVal(c, ".inp-kleur"),
      off: getSafeVal(c, ".inp-offset"),
      op: getSafeVal(c, ".r-oper"),
      sz: getSafeVal(c, ".r-size"),
      cnt: getSafeVal(c, ".r-count"),
      pts: getSafeVal(c, ".r-positions"),
    });
  });

  document.querySelectorAll(".card-stab").forEach((c) => {
    d.rs.push({
      s: getSafeVal(c, ".inp-start"),
      e: getSafeVal(c, ".inp-eind"),
      t: getSafeVal(c, ".r-type"),
      d: getSafeVal(c, ".r-diam"),
      k: getSafeVal(c, ".inp-kleur"),
      off: getSafeVal(c, ".inp-offset"),
      op: getSafeVal(c, ".r-oper"),
      sz: getSafeVal(c, ".r-size"),
      cnt: getSafeVal(c, ".r-count"),
      pts: getSafeVal(c, ".r-positions"),
    });
  });

  projectData[currentGPO] = d;
}

function herstelMetaGegevens() {
  const data = projectData[currentGPO];
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  if (data && data.meta) {
    setVal("meta-boomnr", data.meta.boom || "");
    setVal("meta-afstand", data.meta.dist || "");
    setVal("meta-wind", data.meta.wind || "noordzijde");
    setVal("meta-datum", data.meta.datum || "");
  } else {
    setVal("meta-boomnr", "");
    setVal("meta-afstand", "");
    setVal("meta-wind", "noordzijde");
    setVal("meta-datum", "");
  }
  setVal("meta-project", window.globalSettings.project || "");
  setVal("meta-locatie", window.globalSettings.locatie || "");
  setVal("meta-opdrachtgever", window.globalSettings.opdrachtgever || "");
  setVal("meta-onderzoeker", window.globalSettings.onderzoeker || "");
  document.getElementById("toggle-header").checked =
    window.globalSettings.showHeader;
}

async function saveBlobBestand(blob, filename, pickerTypes) {
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: pickerTypes,
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      if (err && err.name === "AbortError") return false;
      console.error("Opslaan mislukt:", err);
      toonNotificatie("Opslaan mislukt.", "fout");
      return false;
    }
  }

  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

function dataUrlToBase64(dataUrl) {
  return dataUrl.split(",")[1] || "";
}

function dataUrlToBlob(dataUrl) {
  const [header, base64 = ""] = dataUrl.split(",");
  const mime = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
  return new Blob([buffer], { type: mime });
}

function cleanBestandsnaam(text) {
  return String(text || "")
    .replace(/[^a-zA-Z0-9\-\.]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function getPhotoArchivePath(gpoNumber, category, index) {
  return `GPO_${gpoNumber}/fotos/GPO_${gpoNumber}_${category}_${index + 1}.jpg`;
}

function buildProjectExportData(gpoNummers = null) {
  updateGlobalMeta();
  slaHuidigProfielOpInGeheugen();
  const selected = gpoNummers ? new Set(gpoNummers.map(Number)) : null;
  const data = {};
  for (let nummer = 1; nummer <= 10; nummer++) {
    const source = projectData[nummer];
    if (!source || (selected && !selected.has(nummer))) {
      data[nummer] = null;
      continue;
    }
    const copy = JSON.parse(JSON.stringify(source));
    const photos = copy.photos || getEmptyPhotos();
    ["fysisch", "beworteling"].forEach((category) => {
      photos[category] = (photos[category] || []).map((photo, index) => ({
        id: photo.id,
        label: photo.label || `Foto ${index + 1}`,
        type: photo.type || "image/jpeg",
        size: photo.size || 0,
        path: getPhotoArchivePath(nummer, category, index),
      }));
    });
    copy.photos = photos;
    data[nummer] = copy;
  }
  return { formatVersion: 2, data, global: window.globalSettings };
}

function buildRapportageTekst(gpoNummers) {
  const regels = [];
  regels.push(`Project: ${window.globalSettings.project || ""}`);
  regels.push(`Locatie: ${window.globalSettings.locatie || ""}`);
  regels.push(`Opdrachtgever: ${window.globalSettings.opdrachtgever || ""}`);
  regels.push(`Onderzoeker: ${window.globalSettings.onderzoeker || ""}`);
  regels.push("");
  gpoNummers.forEach((nummer) => {
    const data = projectData[nummer];
    if (!data) return;
    regels.push(`GPO ${nummer}`);
    if (data.meta) {
      regels.push(`Boom: ${data.meta.boom || ""}`);
      regels.push(`Afstand: ${data.meta.dist || ""} cm`);
      regels.push(`Windrichting: ${data.meta.wind || ""}`);
    }
    if (nummer === currentGPO) {
      regels.push("Beschrijving fysisch:");
      regels.push(document.getElementById("beschrijving-output")?.value || "");
      regels.push("Beschrijving wortelontwikkeling:");
      regels.push(document.getElementById("wortel-beschrijving-output")?.value || "");
    }
    regels.push("");
  });
  return regels.join("\n");
}

async function voegGPOAanZipToe(zip, nummer, includeImages) {
  const data = projectData[nummer];
  if (!data) return;
  const folder = zip.folder(`GPO_${nummer}`);
  const photos = data.photos || getEmptyPhotos();
  const photoFolder = folder.folder("fotos");
  for (const category of ["fysisch", "beworteling"]) {
    for (const [idx, photo] of (photos[category] || []).entries()) {
      const blob = await getPhotoBlob(photo.id);
      if (!blob) throw new Error(`Foto ${photo.id} ontbreekt in de lokale opslag.`);
      photoFolder.file(`GPO_${nummer}_${category}_${idx + 1}.jpg`, blob);
    }
  }

  if (!includeImages) return;
  const vorigeGPO = currentGPO;
  if (currentGPO !== nummer) wisselGPO(nummer);
  await new Promise((resolve) => setTimeout(resolve, 150));
  const fysisch = await captureGraphTight("vis-fysisch-wrapper");
  const beworteling = await captureGraphTight("vis-beworteling-wrapper");
  folder.file(`GPO_${nummer}_Fysisch.png`, dataUrlToBase64(fysisch), { base64: true });
  folder.file(`GPO_${nummer}_Wortelontwikkeling.png`, dataUrlToBase64(beworteling), { base64: true });
  if (currentGPO !== vorigeGPO) wisselGPO(vorigeGPO);
}

async function exportGPOsZip(gpoNummers, filename, includeImages = true) {
  if (typeof JSZip === "undefined") {
    toonNotificatie("ZIP export is niet beschikbaar. Controleer je internetverbinding.", "fout");
    return;
  }
  try {
    const zip = new JSZip();
    zip.file(
      "project.json",
      JSON.stringify(buildProjectExportData(gpoNummers), null, 2),
    );
    zip.file("rapportage_tekst.txt", buildRapportageTekst(gpoNummers));
    for (const nummer of gpoNummers) await voegGPOAanZipToe(zip, nummer, includeImages);
    const blob = await zip.generateAsync({ type: "blob" });
    return await saveBlobBestand(blob, filename, [
      {
        description: "Bodemtool-project",
        accept: { "application/zip": [".zip"] },
      },
    ]);
  } catch (error) {
    console.error(error);
    toonNotificatie("ZIP export mislukt.", "fout");
    return false;
  }
}

function exportHuidigeGPOZip() {
  const project = cleanBestandsnaam(window.globalSettings.project) || "Bodemtool";
  exportGPOsZip([currentGPO], `${project}_GPO_${currentGPO}_export.zip`, true);
}

function exportAlleGPOsZip() {
  const nummers = [];
  slaHuidigProfielOpInGeheugen();
  for (let i = 1; i <= 10; i++) if (heeftGPOData(projectData[i])) nummers.push(i);
  if (nummers.length === 0) {
    toonNotificatie("Geen GPO's om te exporteren.", "fout");
    return;
  }
  if (IS_MOBILE_OR_TABLET) {
    const doorgaan = confirm(
      "Export alles kan op tablet/Safari even duren. Wil je doorgaan?",
    );
    if (!doorgaan) return;
  }
  const project = cleanBestandsnaam(window.globalSettings.project) || "Bodemtool";
  exportGPOsZip(nummers, `${project}_alle_GPOs_export.zip`, true);
}

async function slaOpProject() {
  slaHuidigProfielOpInGeheugen();
  const nummers = [];
  for (let nummer = 1; nummer <= 10; nummer++) {
    if (projectData[nummer]) nummers.push(nummer);
  }
  const project = cleanBestandsnaam(window.globalSettings.project) || "Bodemtool";
  const opgeslagen = await exportGPOsZip(
    nummers.length ? nummers : [currentGPO],
    `${project}_project.zip`,
    false,
  );

  if (opgeslagen) {
    window.hasUnsavedChanges = false;
    await saveAutoDraft();
    toonNotificatie("Project opgeslagen.", "succes");
  }
}

async function migratePhotosToIndexedDb(data, zip = null) {
  let missingPhotos = 0;
  for (let nummer = 1; nummer <= 10; nummer++) {
    const gpo = data[nummer];
    if (!gpo) continue;
    if (!gpo.photos) gpo.photos = getEmptyPhotos();
    for (const category of ["fysisch", "beworteling"]) {
      const migrated = [];
      const photos = Array.isArray(gpo.photos[category])
        ? gpo.photos[category]
        : [];
      for (const [index, photo] of photos.entries()) {
        const fallbackId = `${Date.now()}-${nummer}-${category}-${index}`;
        const id = photo.id || `photo-${crypto.randomUUID?.() || fallbackId}`;
        let blob = null;
        if (zip) {
          const path = photo.path || getPhotoArchivePath(nummer, category, index);
          const entry = zip.file(path);
          if (entry) blob = await entry.async("blob");
        }
        if (
          !blob &&
          typeof photo.src === "string" &&
          photo.src.startsWith("data:")
        ) {
          blob = dataUrlToBlob(photo.src);
        }
        if (blob) await putPhotoBlob(id, blob);
        else blob = await getPhotoBlob(id);
        if (!blob) missingPhotos++;
        migrated.push({
          id,
          label: photo.label || `Foto ${index + 1}`,
          type: blob?.type || photo.type || "image/jpeg",
          size: blob?.size || photo.size || 0,
        });
      }
      gpo.photos[category] = migrated;
    }
  }
  return missingPhotos;
}

async function applyLoadedProject(parsed, zip = null, replacePhotos = true) {
  const sourceData = parsed.global ? parsed.data : parsed;
  if (!sourceData || typeof sourceData !== "object")
    throw new Error("Projectgegevens ontbreken.");
  const normalizedData = {};
  for (let nummer = 1; nummer <= 10; nummer++)
    normalizedData[nummer] = sourceData[nummer] || null;
  const missingPhotos = await migratePhotosToIndexedDb(normalizedData, zip);
  if (replacePhotos) await prunePhotoStore(normalizedData);
  window.projectData = normalizedData;
  const loadedGlobal = parsed.global || {};
  window.globalSettings = {
    showHeader: false,
    headers: { fysisch: "Fysisch", beworteling: "Wortelontwikkeling" },
    project: "",
    locatie: "",
    opdrachtgever: "",
    onderzoeker: "",
    ...loadedGlobal,
    headers: {
      fysisch: "Fysisch",
      beworteling: "Wortelontwikkeling",
      ...(loadedGlobal.headers || {}),
    },
  };
  window.currentGPO = 0;
  wisselGPO(1);
  await renderFieldPhotos();
  window.hasUnsavedChanges = false;
  if (replacePhotos && window.autoSaveReady) await saveAutoDraft();
  return missingPhotos;
}

async function laadProject(event) {
  const fileInput = event.target;
  if (!fileInput.files || fileInput.files.length === 0) return;
  const file = fileInput.files[0];
  fileInput.value = "";
  try {
    let parsed;
    let zip = null;
    if (file.name.toLowerCase().endsWith(".zip")) {
      if (typeof JSZip === "undefined")
        throw new Error("ZIP-ondersteuning is niet beschikbaar.");
      zip = await JSZip.loadAsync(file);
      const projectEntry = zip.file("project.json");
      if (!projectEntry)
        throw new Error("project.json ontbreekt in het ZIP-bestand.");
      parsed = JSON.parse(await projectEntry.async("text"));
    } else {
      parsed = JSON.parse(await file.text());
    }
    const missingPhotos = await applyLoadedProject(parsed, zip, true);
    toonNotificatie(
      missingPhotos
        ? `Project geladen; ${missingPhotos} foto('s) ontbreken.`
        : "Project succesvol geladen.",
      missingPhotos ? "fout" : "succes",
    );
  } catch (error) {
    console.error(error);
    toonNotificatie(`Project laden mislukt: ${error.message}`, "fout");
  }
}

function updateBeschrijving() {
  updateWortelBeschrijving();
  const data =
    typeof projectData !== "undefined" && projectData[currentGPO]
      ? projectData[currentGPO]
      : { b: [] };
  const lagen = [];
  document.querySelectorAll(".card-bodem").forEach((c) => {
    lagen.push({
      s: parseInt(c.querySelector(".inp-start").value),
      e: parseInt(c.querySelector(".inp-eind").value),
      t: getVal(c, ".inp-type", ".inp-type-custom"),
      f: getVal(c, ".inp-frac", ".inp-frac-custom"),
      h: getVal(c, ".inp-humus", ".inp-humus-custom"),
      k: c.querySelector(".inp-kleur").value,
    });
  });
  if (lagen.length === 0) {
    document.getElementById("beschrijving-output").value = "";
    return;
  }
  const boomNr = document.getElementById("meta-boomnr").value || "[NR]";
  const afstand = document.getElementById("meta-afstand").value || "[AFST]";
  const wind = document.getElementById("meta-wind").value;
  let tekst = `Bij boom ${boomNr} is op ${afstand} cm vanuit het hart van de stamvoet, aan de ${wind}, een profielsleuf gegraven en een grondboring uitgevoerd. `;
  lagen.forEach((laag, index) => {
    const laagnr = index + 1;
    const dikte = laag.e - laag.s;
    let eigenschappen = [];
    if (laag.f && laag.f !== "N.v.t.") eigenschappen.push(laag.f.toLowerCase());
    if (laag.h && laag.h !== "N.v.t.") eigenschappen.push(laag.h.toLowerCase());
    if (laag.k && KLEUR_NAMEN[laag.k]) {
      eigenschappen.push(KLEUR_NAMEN[laag.k]);
    }
    if (laag.t && laag.t !== "N.v.t.") eigenschappen.push(laag.t.toLowerCase());
    const propString = eigenschappen.join(", ").replace(/, ([^,]*)$/, " $1");
    switch (laagnr) {
      case 1:
        tekst += `De toplaag bestaat uit ca. ${dikte} cm ${propString}. `;
        break;
      case 2:
        tekst += `Hieronder bevindt zich een laag van ca. ${dikte} cm ${propString}. `;
        break;
      case 3:
        tekst += `Tussen de ${laag.s} cm en ${laag.e} cm -mv bevindt zich een laag die uit ${propString} bestaat. `;
        break;
      case 4:
        tekst += `Onder deze laag, tussen de ${laag.s} en ${laag.e} cm -mv volgt een laag die uit ${propString} bestaat. `;
        break;
      case 5:
        tekst += `Tussen de ${laag.s} cm en ${laag.e} cm -mv bevindt zich een laag met ${propString}. `;
        break;
      default:
        tekst += `Laag ${laagnr} (${laag.s}-${laag.e} cm): ${propString}. `;
    }
  });
  const outputEl = document.getElementById("beschrijving-output");
  if (outputEl) outputEl.value = tekst;
}
function getRootDescriptionTypeText(type) {
  const lower = type.toLowerCase();
  if (lower.includes("niet verder onderzocht"))
    return "is het profiel niet verder onderzocht";
  if (lower.includes("geen opname"))
    return "is geen opnamebeworteling waargenomen";
  if (lower.includes("geen stabiliteits"))
    return "is geen stabiliteitsbeworteling aangetroffen";
  if (lower.includes("afgestorven"))
    return "zijn afgestorven wortelresten aangetroffen";
  if (lower.includes("intensief"))
    return "is sprake van intensieve opnamebeworteling";
  if (lower.includes("extensief"))
    return "zijn extensieve opnamewortels aangetroffen";
  if (lower.includes("grove")) return "is grove beworteling aanwezig";
  if (lower.includes("stabiliteitswortels"))
    return "zijn stabiliteitswortels aangetroffen";
  if (lower.includes("stabiliteitswortel"))
    return "is een stabiliteitswortel aangetroffen";
  return `is ${type.toLowerCase()} aangetroffen`;
}

function formatDiameterText(operator, diameter) {
  if (!diameter) return "";
  return ` met een diameter van ${operator || ""} ${String(diameter).replace(".", ",")} cm`.replace(
    "van  ",
    "van ",
  );
}

function collectRootLayers(selector) {
  return Array.from(document.querySelectorAll(selector)).map((c) => ({
    s: parseInt(c.querySelector(".inp-start")?.value) || 0,
    e: parseInt(c.querySelector(".inp-eind")?.value) || 0,
    t: getVal(c, ".r-type", ".r-type-custom"),
    d: c.querySelector(".r-diam")?.value || "",
    op: c.querySelector(".r-oper")?.value || "",
    cnt: parseInt(c.querySelector(".r-count")?.value) || 0,
  }));
}

function schrijfGetalOnderTwintigUit(getal) {
  const woorden = [
    "nul",
    "één",
    "twee",
    "drie",
    "vier",
    "vijf",
    "zes",
    "zeven",
    "acht",
    "negen",
    "tien",
    "elf",
    "twaalf",
    "dertien",
    "veertien",
    "vijftien",
    "zestien",
    "zeventien",
    "achttien",
    "negentien",
  ];
  return getal > 0 && getal < 20 ? woorden[getal] : String(getal);
}

function rootLayerSentence(layer) {
  if (!layer.t || layer.t === "N.v.t.") return "";
  const lower = layer.t.toLowerCase();
  const traject = lower.includes("niet verder onderzocht")
    ? `Vanaf ${layer.s} cm -mv`
    : `In de laag van ${layer.s} tot ${layer.e} cm -mv`;
  const aantal =
    layer.cnt &&
    !lower.includes("geen") &&
    !lower.includes("niet verder onderzocht")
      ? `${schrijfGetalOnderTwintigUit(layer.cnt)} `
      : "";
  let tekst = getRootDescriptionTypeText(layer.t);
  if (aantal && (lower.includes("stabiliteits") || lower.includes("wortel"))) {
    tekst = tekst
      .replace("zijn ", `zijn ${aantal}`)
      .replace("is een ", `is ${aantal === "1 " ? "een " : aantal}`);
  }
  return `${traject} ${tekst}${formatDiameterText(layer.op, layer.d)}.`;
}

function updateWortelBeschrijving() {
  const outputEl = document.getElementById("wortel-beschrijving-output");
  if (!outputEl) return;

  const max = parseInt(document.getElementById("maxDiepte")?.value) || 100;
  const opname = collectRootLayers(".card-opname");
  const stab = collectRootLayers(".card-stab");
  const zinnen = [];

  opname.forEach((laag) => {
    const zin = rootLayerSentence(laag);
    if (zin) zinnen.push(zin);
  });
  stab.forEach((laag) => {
    const zin = rootLayerSentence(laag);
    if (zin) zinnen.push(zin);
  });

  if (zinnen.length === 0) {
    outputEl.value = "";
    return;
  }

  let tekst = zinnen.join(" ");

  const diepsteWortel = [...opname, ...stab]
    .filter(
      (laag) =>
        laag.t &&
        !laag.t.toLowerCase().includes("geen") &&
        !laag.t.toLowerCase().includes("niet verder onderzocht"),
    )
    .reduce((diepste, laag) => Math.max(diepste, laag.e), 0);
  const heeftStab = stab.some(
    (laag) => laag.t && !laag.t.toLowerCase().includes("geen"),
  );
  const heeftExplicietGeenStab = stab.some(
    (laag) => laag.t && laag.t.toLowerCase().includes("geen stabiliteits"),
  );
  const heeftNietVerder = [...opname, ...stab].some(
    (laag) => laag.t && laag.t.toLowerCase().includes("niet verder onderzocht"),
  );

  if (diepsteWortel > 0 && diepsteWortel <= max * 0.4)
    tekst +=
      " De wortelontwikkeling concentreert zich voornamelijk in de bovenste profielzone.";
  else if (diepsteWortel >= max * 0.7)
    tekst += " De beworteling zet zich voort tot in de diepere profielzone.";
  if (!heeftStab && !heeftExplicietGeenStab)
    tekst +=
      " Binnen het onderzochte profiel is geen duidelijke stabiliteitsbeworteling waargenomen.";
  if (heeftNietVerder)
    tekst +=
      " Over de niet onderzochte diepere laag kan op basis van dit profiel geen uitspraak worden gedaan.";

  outputEl.value = tekst;
}

function kopieerBeschrijving(elementId = "beschrijving-output") {
  const copyText = document.getElementById(elementId);
  if (!copyText) return;
  copyText.select();
  navigator.clipboard.writeText(copyText.value).then(() => {
    toonNotificatie("Tekst gekopieerd!", "succes");
  });
}

// ==========================================
// EXPORT (SINGLE)
// ==========================================
const IS_MOBILE_OR_TABLET = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
const EXPORT_CONFIG = {
  quality: 1.0,
  pixelRatio: IS_MOBILE_OR_TABLET ? 2 : 3,
  backgroundColor: "white",
};
const BUFFER_PX = 12;

async function captureGraphTight(elementId) {
  const node = document.getElementById(elementId);
  if (!node) throw new Error(`Element ${elementId} niet gevonden`);
  const originalDisplay = node.style.display;
  if (originalDisplay === "none") node.style.display = "flex";
  const originalWidth = node.offsetWidth;
  const newHeight = node.scrollHeight + BUFFER_PX * 2;
  try {
    const dataUrl = await htmlToImage.toPng(node, {
      ...EXPORT_CONFIG,
      width: originalWidth,
      height: newHeight,
      style: {
        "margin-top": `${BUFFER_PX}px`,
        "margin-bottom": "0",
        transform: "none",
        display: "flex",
      },
    });
    return dataUrl;
  } finally {
    node.style.display = originalDisplay;
  }
}

async function downloadPNG() {
  const btn = document.querySelector(".tb-btn-download");
  if (btn) btn.innerText = "Bezig...";
  try {
    const isRootView =
      document.getElementById("view-beworteling").style.display !== "none";
    const project = window.globalSettings.project || "";
    const boomNummer = document.getElementById("meta-boomnr").value || "";
    const gpoNummer = window.currentGPO || 1;
    const type = isRootView ? "Beworteling" : "Fysisch";
    const clean = (text) => text.replace(/[^a-zA-Z0-9\-\.]/g, "_");
    let naamOnderdelen = [];
    if (project) naamOnderdelen.push(clean(project));
    if (boomNummer) naamOnderdelen.push("boom_" + clean(boomNummer));
    naamOnderdelen.push("GPO_" + gpoNummer);
    naamOnderdelen.push(type);
    const filename = naamOnderdelen.join("_") + ".png";
    const targetId = isRootView
      ? "vis-beworteling-wrapper"
      : "vis-fysisch-wrapper";
    const dataUrl = await captureGraphTight(targetId);
    const blob = await (await fetch(dataUrl)).blob();
    await saveBlobBestand(blob, filename, [
      { description: "PNG afbeelding", accept: { "image/png": [".png"] } },
    ]);
  } catch (error) {
    console.error("Export Fout:", error);
    toonNotificatie("Er ging iets mis bij het downloaden.", "fout");
  } finally {
    if (btn) btn.innerText = "Download PNG";
  }
}

async function kopieerNaarKlembord() {
  try {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      toonNotificatie("Afbeelding kopiëren wordt niet ondersteund. Gebruik Download PNG.", "fout");
      return;
    }
    let targetId =
      document.getElementById("view-beworteling").style.display !== "none"
        ? "vis-beworteling-wrapper"
        : "vis-fysisch-wrapper";
    const dataUrl = await captureGraphTight(targetId);
    const blob = await (await fetch(dataUrl)).blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    toonNotificatie("✅ Gekopieerd naar klembord!", "succes");
  } catch (error) {
    console.error("Klembord fout:", error);
    toonNotificatie("❌ Kopiëren mislukt. Gebruik Download PNG op Safari/tablet.", "fout");
  }
}

function toonNotificatie(tekst, type = "succes") {
  const div = document.createElement("div");
  div.innerText = tekst;
  div.style.position = "fixed";
  div.style.bottom = "20px";
  div.style.right = "20px";
  div.style.padding = "12px 24px";
  div.style.color = "#ffffff";
  div.style.borderRadius = "5px";
  div.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
  div.style.fontFamily = "Segoe UI, sans-serif";
  div.style.fontSize = "14px";
  div.style.zIndex = "99999";
  div.style.transition = "opacity 0.5s, transform 0.5s";
  div.style.opacity = "0";
  div.style.transform = "translateY(20px)";
  div.style.backgroundColor = type === "fout" ? "#d32f2f" : "#2e7d32";
  document.body.appendChild(div);
  setTimeout(() => {
    div.style.opacity = "1";
    div.style.transform = "translateY(0)";
  }, 10);
  setTimeout(() => {
    div.style.opacity = "0";
    div.style.transform = "translateY(20px)";
    setTimeout(() => {
      if (div.parentNode) div.parentNode.removeChild(div);
    }, 500);
  }, 3000);
}

// ==========================================
// COLLAGE MODULE
// ==========================================
let collageImages = [null, null, null];
let currentCollageLayout = 2;

function renderCollageSlot2() {
  const slot = document.getElementById("slot-2");
  const imgObj = collageImages[2];
  const showBorder = document.getElementById("col-showBorder").checked;

  slot.innerHTML = "";
  if (!imgObj) {
    slot.className = "slot empty";
    slot.innerHTML =
      '<div style="font-size:24px;">📷</div><div>Klik om foto toe te voegen</div>';
    return;
  }
  slot.className = "slot filled";
  const displayImg = new Image();
  displayImg.src = imgObj.src;
  displayImg.style.maxWidth = "100%";
  displayImg.style.maxHeight = "100%";
  displayImg.style.objectFit = "contain";

  if (showBorder) {
    displayImg.style.border = "4px solid #9BBB59";
    displayImg.style.padding = "2px";
  } else {
    displayImg.style.border = "1px solid #ccc";
    displayImg.style.padding = "0";
  }
  slot.appendChild(displayImg);
}

function refreshCollage() {
  updateCollageUI();
}

function changeCollageLayout(num) {
  currentCollageLayout = num;
  const grid = document.getElementById("collageGrid");
  if (grid) grid.setAttribute("data-cols", num);
  const wrap2 = document.getElementById("wrap-2");
  if (wrap2) {
    if (num === 2) wrap2.classList.add("hidden");
    else wrap2.classList.remove("hidden");
  }
}

function triggerFileUpload(idx) {
  const el = document.getElementById("extra-upload");
  if (el) el.click();
}
function handleCollageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    const img = new Image();
    img.onload = () => {
      collageImages[2] = img;
      renderCollageSlot2();
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
  e.target.value = "";
}
function clearCollageSlot(idx) {
  if (idx === 2) {
    collageImages[2] = null;
    renderCollageSlot2();
  }
}

// --- DE MAGIE: GENERATE ONZICHTBARE DOM VOOR EXPORT ---
async function generateHighResCollageCanvas() {
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "fixed";
  tempContainer.style.left = "-10000px";
  tempContainer.style.top = "0px";
  tempContainer.style.width = "1200px";
  tempContainer.style.zIndex = "-9999";
  document.body.appendChild(tempContainer);

  const wrapF = document.createElement("div");
  wrapF.id = "export-fys-wrapper";
  wrapF.className = "vis-container-wrapper";
  wrapF.style.width = "450px";
  wrapF.style.display = "flex";
  tempContainer.appendChild(wrapF);

  createGraphStructure("export-fys-wrapper", "export-fys");
  renderPhysicalGraph(
    "export-fys-wrapper",
    "vis-bar-bodem-export-fys",
    "vis-text-bodem-export-fys",
    "vis-strip-ondergrond-export-fys",
    "vis-text-ondergrond-export-fys",
  );

  const wrapR = document.createElement("div");
  wrapR.id = "export-root-wrapper";
  wrapR.className = "vis-container-wrapper";
  wrapR.style.width = "450px";
  wrapR.style.display = "flex";
  tempContainer.appendChild(wrapR);

  createGraphStructure("export-root-wrapper", "export-root");
  renderRootGraph(
    "export-root-wrapper",
    "vis-root-bar-left-export-root",
    "vis-root-bar-right-export-root",
    "vis-root-text-left-export-root",
    "vis-root-text-right-export-root",
  );

  await new Promise((r) => setTimeout(r, 200));

  let imgF = null,
    imgR = null;

  try {
    const dataF = await captureGraphTight("export-fys-wrapper");
    imgF = await loadImage(dataF);

    const dataR = await captureGraphTight("export-root-wrapper");
    imgR = await loadImage(dataR);
  } catch (e) {
    console.error("Export Fout:", e);
    return null;
  } finally {
    document.body.removeChild(tempContainer);
  }

  return buildFinalCollageFromImages([imgF, imgR, collageImages[2]]);
}

// Update de Collage tabbladen (LIVE PREVIEW)
function updateCollageUI() {
  const slot0 = document.getElementById("slot-0");
  const slot1 = document.getElementById("slot-1");

  if (slot0) {
    slot0.className = "slot filled";
    slot0.innerHTML =
      '<div id="wrapper-fys-collage" class="vis-container-wrapper" style="width:100%; height:100%; border:none; padding:5px; transform:scale(0.7); transform-origin:top center;"></div>';
    createGraphStructure("wrapper-fys-collage", "collage-fys");
    renderPhysicalGraph(
      "wrapper-fys-collage",
      "vis-bar-bodem-collage-fys",
      "vis-text-bodem-collage-fys",
      "vis-strip-ondergrond-collage-fys",
      "vis-text-ondergrond-collage-fys",
    );
  }

  if (slot1) {
    slot1.className = "slot filled";
    slot1.innerHTML =
      '<div id="wrapper-root-collage" class="vis-container-wrapper" style="width:100%; height:100%; border:none; padding:5px; transform:scale(0.7); transform-origin:top center;"></div>';
    createGraphStructure("wrapper-root-collage", "collage-root");
    renderRootGraph(
      "wrapper-root-collage",
      "vis-root-bar-left-collage-root",
      "vis-root-bar-right-collage-root",
      "vis-root-text-left-collage-root",
      "vis-root-text-right-collage-root",
    );
  }

  renderCollageSlot2();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function buildFinalCollageFromImages(images) {
  const activeImages = [];
  const autoTrim = document.getElementById("col-autoTrim").checked;

  for (let i = 0; i < currentCollageLayout; i++) {
    let raw = images[i];
    if (!raw) continue;
    if (autoTrim && i < 2) {
      try {
        activeImages.push(trimWhiteBorders(raw));
      } catch (e) {
        activeImages.push(raw);
      }
    } else {
      activeImages.push(raw);
    }
  }

  if (activeImages.length === 0) return null;

  const showBorder = document.getElementById("col-showBorder").checked;
  const TARGET_WIDTH = 2400;
  const BORDER_COLOR = "#9BBB59";
  const BORDER_PX = 5;
  const INNER_PAD = 20;
  const PAD_Y = 5;
  const PAD_X = 5;
  const GAP = 40;

  const totalOverhead =
    PAD_X * 2 +
    GAP * (activeImages.length - 1) +
    activeImages.length * (BORDER_PX * 2 + INNER_PAD * 2);
  const availableWidth = TARGET_WIDTH - totalOverhead;
  let sumAR = 0;
  activeImages.forEach((img) => {
    sumAR += img.width / img.height;
  });
  const commonH = availableWidth / sumAR;
  const totalH = commonH + PAD_Y * 2 + BORDER_PX * 2 + INNER_PAD * 2;

  const canvas = document.createElement("canvas");
  canvas.width = TARGET_WIDTH;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let currentX = PAD_X;
  activeImages.forEach((img) => {
    const contentW = commonH * (img.width / img.height);
    const blockW = contentW + INNER_PAD * 2 + BORDER_PX * 2;
    const imgX = currentX + BORDER_PX + INNER_PAD;
    const imgY = PAD_Y + BORDER_PX + INNER_PAD;

    ctx.drawImage(img, imgX, imgY, contentW, commonH);

    if (showBorder) {
      ctx.strokeStyle = BORDER_COLOR;
      ctx.lineWidth = BORDER_PX;
      ctx.strokeRect(
        currentX + BORDER_PX / 2,
        PAD_Y + BORDER_PX / 2,
        blockW - BORDER_PX,
        totalH - PAD_Y * 2 - BORDER_PX,
      );
    }
    currentX += blockW + GAP;
  });
  return canvas;
}

// --- DOWNLOAD & COPY ACTIONS ---
async function saveCollageImage() {
  try {
    const canvas = await generateHighResCollageCanvas();
    if (!canvas) {
      toonNotificatie("Kon geen afbeelding genereren.", "fout");
      return;
    }

    const project = window.globalSettings.project || "";
    const boomNummer = document.getElementById("meta-boomnr")
      ? document.getElementById("meta-boomnr").value
      : "";
    const gpoNummer = window.currentGPO || 1;
    const clean = (text) => text.replace(/[^a-zA-Z0-9\-\.]/g, "_");
    let naamOnderdelen = [];
    if (project) naamOnderdelen.push(clean(project));
    if (boomNummer) naamOnderdelen.push("boom_" + clean(boomNummer));
    naamOnderdelen.push("GPO_" + gpoNummer);
    naamOnderdelen.push("Overzicht");
    const filename = naamOnderdelen.join("_") + ".png";

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) {
      toonNotificatie("Kon geen afbeelding genereren.", "fout");
      return;
    }
    await saveBlobBestand(blob, filename, [
      { description: "PNG afbeelding", accept: { "image/png": [".png"] } },
    ]);
  } catch (e) {
    console.error(e);
    toonNotificatie("Fout bij genereren.", "fout");
  }
}

async function copyCollageToClipboard() {
  try {
    const canvas = await generateHighResCollageCanvas();
    if (!canvas) {
      toonNotificatie("Kon geen afbeelding genereren.", "fout");
      return;
    }
    canvas.toBlob((blob) => {
      try {
        if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard
            .write([item])
            .then(() => {
              toonNotificatie("✅ Collage gekopieerd naar klembord!", "succes");
            })
            .catch((e) => {
              console.error(e);
              toonNotificatie("Browser blokkeert kopieeractie. Gebruik Download Totaalplaatje.", "fout");
            });
        } else {
          toonNotificatie("Afbeelding kopiëren wordt niet ondersteund. Gebruik Download Totaalplaatje.", "fout");
        }
      } catch (e) {
        toonNotificatie("Kopiëren mislukt.", "fout");
      }
    });
  } catch (e) {
    console.error(e);
    toonNotificatie("Fout bij genereren.", "fout");
  }
}

// --- TRIM HELPER ---
function trimWhiteBorders(imgElement) {
  const canvas = document.createElement("canvas");
  canvas.width = imgElement.width;
  canvas.height = imgElement.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgElement, 0, 0);
  try {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const l = pixels.data.length;
    const bound = { top: null, left: null, right: null, bottom: null };
    let x, y;
    for (let i = 0; i < l; i += 4) {
      if (
        pixels.data[i] < 250 ||
        pixels.data[i + 1] < 250 ||
        pixels.data[i + 2] < 250
      ) {
        x = (i / 4) % canvas.width;
        y = ~~(i / 4 / canvas.width);
        if (bound.top === null) bound.top = y;
        if (bound.left === null) bound.left = x;
        else if (x < bound.left) bound.left = x;
        if (bound.right === null) bound.right = x;
        else if (x > bound.right) bound.right = x;
        if (bound.bottom === null) bound.bottom = y;
        else if (y > bound.bottom) bound.bottom = y;
      }
    }
    if (bound.top === null) return imgElement;
    const trimWidth = bound.right - bound.left + 1;
    const trimHeight = bound.bottom - bound.top + 1;
    const trimmed = document.createElement("canvas");
    trimmed.width = trimWidth;
    trimmed.height = trimHeight;
    trimmed
      .getContext("2d")
      .drawImage(
        canvas,
        bound.left,
        bound.top,
        trimWidth,
        trimHeight,
        0,
        0,
        trimWidth,
        trimHeight,
      );
    return trimmed;
  } catch (e) {
    return imgElement;
  }
}

// --- 7. FAILSAFE (BEFORE UNLOAD) ---
window.addEventListener("beforeunload", function (e) {
  if (window.hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = "";
  }
});

function syncHoogte(bron) {
  let val =
    bron === "slider"
      ? document.getElementById("sliderHoogte").value
      : document.getElementById("inputHoogte").value;
  val = parseInt(val) || 350;

  if (bron === "slider") document.getElementById("inputHoogte").value = val;
  if (bron === "input") document.getElementById("sliderHoogte").value = val;

  PX_BAR_H = val;
  PX_TEXT_H = val + 2;

  let styleTag = document.getElementById("dynamic-hoogte");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "dynamic-hoogte";
    document.head.appendChild(styleTag);
  }

  styleTag.innerHTML = `
        .vis-column {
            min-height: ${PX_TEXT_H}px !important;
        }
    `;

  markProjectChanged();

  updateUI();
  updateRootUI();
  if (document.getElementById("collage-view").style.display !== "none")
    updateCollageUI();
}

function syncBreedte(bron) {
  let val =
    bron === "slider"
      ? document.getElementById("sliderBreedte").value
      : document.getElementById("inputBreedte").value;
  val = parseInt(val) || 120;

  if (bron === "slider") document.getElementById("inputBreedte").value = val;
  if (bron === "input") document.getElementById("sliderBreedte").value = val;

  let styleTag = document.getElementById("dynamic-afmetingen");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "dynamic-afmetingen";
    document.head.appendChild(styleTag);
  }

  styleTag.innerHTML = `
        .col-text-bodem, .col-text-ondergrond, .col-text-root-left, .col-text-root-right {
            width: ${val}px !important;
            min-width: ${val}px !important;
        }
    `;
  markProjectChanged();
}

function syncOpacity(type, bron) {
  let val;
  if (type === "ao") {
    val =
      bron === "slider"
        ? document.getElementById("sliderAoOpacity").value
        : document.getElementById("inputAoOpacity").value;
    val = Math.max(0, Math.min(100, parseInt(val) || 100));
    if (bron === "slider")
      document.getElementById("inputAoOpacity").value = val;
    if (bron === "input")
      document.getElementById("sliderAoOpacity").value = val;
    // Koppel de waarde (0 tot 1) direct aan de CSS variabele
    document.documentElement.style.setProperty("--ao-opacity", val / 100);
  } else {
    val =
      bron === "slider"
        ? document.getElementById("sliderDispOpacity").value
        : document.getElementById("inputDispOpacity").value;
    val = Math.max(0, Math.min(100, parseInt(val) || 100));
    if (bron === "slider")
      document.getElementById("inputDispOpacity").value = val;
    if (bron === "input")
      document.getElementById("sliderDispOpacity").value = val;
    // Koppel de waarde (0 tot 1) direct aan de CSS variabele
    document.documentElement.style.setProperty("--disp-opacity", val / 100);
  }
  markProjectChanged();
}
