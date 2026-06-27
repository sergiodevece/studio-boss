const STORAGE_KEY = "sboss";
const SONG_TARGET = 60;

const SCHEDULE = {
  1: { allowed: true, label: "LUN", time: "23:00 → 01:30" },
  2: { allowed: true, label: "MAR", time: "23:00 → 01:30" },
  3: { allowed: true, label: "MIÉ", time: "23:00 → 01:30" },
  4: { allowed: true, label: "JUE", time: "TARDE → 03:00" },
  5: { allowed: false, label: "VIE" },
  6: { allowed: false, label: "SÁB" },
  0: { allowed: false, label: "DOM" },
};

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const SHORT_DAY_NAMES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

let data = loadData();
let currentWeekKey = getWeekKey(new Date());
let musicOn = false;
let synth = null;

const els = {};

function init() {
  els.songsRange = document.getElementById("songsRange");
  els.songsLabel = document.getElementById("songsLabel");
  els.songsPct = document.getElementById("songsPct");
  els.minusSong = document.getElementById("minusSong");
  els.plusSong = document.getElementById("plusSong");
  els.musicBtn = document.getElementById("musicBtn");
  els.tabButtons = [...document.querySelectorAll(".tab-btn")];
  els.panels = {
    hoy: document.getElementById("tab-hoy"),
    semana: document.getElementById("tab-semana"),
    historial: document.getElementById("tab-historial"),
  };

  els.songsRange.addEventListener("input", (event) => {
    setSongs(Number(event.target.value));
  });

  els.minusSong.addEventListener("click", () => changeSongs(-1));
  els.plusSong.addEventListener("click", () => changeSongs(1));
  els.musicBtn.addEventListener("click", toggleMusic);

  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => showTab(button.dataset.tab));
  });

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("input", handleDocumentInput);

  updateSongsUI();
  renderAll();
}

function loadData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      days: parsed.days && typeof parsed.days === "object" ? parsed.days : {},
      songs: Number.isFinite(Number(parsed.songs)) ? Number(parsed.songs) : 0,
    };
  } catch {
    return { days: {}, songs: 0 };
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn("No se pudo guardar el progreso en localStorage.");
  }
}

function handleDocumentClick(event) {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;

  const { action, day, status } = actionElement.dataset;

  if (action === "toggle-day") {
    toggleDay(day, status);
  }

  if (action === "prev-week") {
    moveWeek(-7);
  }

  if (action === "next-week") {
    moveWeek(7);
  }
}

function handleDocumentInput(event) {
  const noteDay = event.target.dataset.noteDay;
  if (!noteDay) return;

  if (!data.days[noteDay]) data.days[noteDay] = {};
  data.days[noteDay].notes = event.target.value;
  saveData();
}

function showTab(tabName) {
  Object.entries(els.panels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === tabName);
  });

  els.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  renderAll();
}

function renderAll() {
  renderHoy();
  renderSemana();
  renderHistorial();
}

function changeSongs(delta) {
  setSongs((data.songs || 0) + delta);
}

function setSongs(value) {
  data.songs = clamp(Number(value) || 0, 0, SONG_TARGET);
  saveData();
  updateSongsUI();
  renderHistorial();
}

function updateSongsUI() {
  const songs = data.songs || 0;
  const pct = Math.round((songs / SONG_TARGET) * 100);

  els.songsLabel.textContent = `${songs}/${SONG_TARGET}`;
  els.songsPct.textContent = `${pct}% completado`;
  els.songsRange.value = songs;
  els.songsRange.style.background = `linear-gradient(90deg, #ff00ff ${pct}%, #333 ${pct}%)`;
}

function renderHoy() {
  const today = getTodayKey();
  const todayDate = parseDateKey(today);
  const todayDow = todayDate.getDay();

  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(todayDate.getDate() - 1);
  const yesterday = formatDateKey(yesterdayDate);
  const yesterdayDow = yesterdayDate.getDay();

  let html = "";
  if (SCHEDULE[yesterdayDow]?.allowed) {
    html += renderDayPanel(yesterday, yesterdayDow, true);
  }
  html += renderDayPanel(today, todayDow, false);

  els.panels.hoy.innerHTML = html;
}

function renderDayPanel(dayKey, dow, isYesterday) {
  const sched = SCHEDULE[dow];
  const dayData = data.days[dayKey] || {};
  const points = dayData.points || 0;
  const pointClass = points > 0 ? "positive" : points < 0 ? "negative" : "";
  const panelClass = isYesterday ? "panel day-panel yesterday" : "panel day-panel";

  const body = sched.allowed
    ? renderAllowedDay(dayKey, sched, dayData)
    : renderFreeDay(dayKey, dayData);

  return `
    <article class="${panelClass}">
      ${isYesterday ? '<p class="yesterday-tag">◀ Ayer — ¿olvidaste registrar?</p>' : ""}
      <div class="day-head">
        <div>
          <h2 class="day-title">${DAY_NAMES[dow]}</h2>
          <p class="day-date">${dayKey}</p>
        </div>
        <p class="day-points ${pointClass}">${formatPoints(points)} pts</p>
      </div>
      ${body}
    </article>
  `;
}

function renderAllowedDay(dayKey, sched, dayData) {
  return `
    <p class="day-time">Horario: ${sched.time}</p>
    <div class="action-row">
      ${renderActionButton(dayKey, "complied", dayData.complied, "✅ Cumplido", "+5 puntos", "success")}
      ${renderActionButton(dayKey, "violated", dayData.violated, "❌ Incumplido", "-5 puntos", "danger")}
    </div>
    <textarea rows="3" data-note-day="${dayKey}" placeholder="Notas del día... ¿qué estás grabando?">${escapeHtml(dayData.notes || "")}</textarea>
  `;
}

function renderFreeDay(dayKey, dayData) {
  return `
    <p class="day-message free">🌴 Día libre — ¿has descansado?</p>
    <div class="action-row">
      ${renderActionButton(dayKey, "complied", dayData.complied, "🌴 Descansé", "+5 puntos", "success")}
      ${renderActionButton(dayKey, "violated", dayData.violated, "🎸 Grabé", "-5 puntos", "danger")}
    </div>
  `;
}

function renderActionButton(dayKey, status, active, label, sublabel, type) {
  const activeClass = active ? `active ${type}` : "";
  return `
    <button class="btn action-btn btn-${type === "success" ? "success" : "danger"} ${activeClass}" type="button" data-action="toggle-day" data-day="${dayKey}" data-status="${status}">
      ${label}
      <span>${sublabel}</span>
    </button>
  `;
}

function toggleDay(dayKey, status) {
  const dayData = data.days[dayKey] || {};

  if (status === "complied") {
    dayData.complied = !dayData.complied;
    dayData.violated = false;
    dayData.points = dayData.complied ? 5 : 0;
  }

  if (status === "violated") {
    dayData.violated = !dayData.violated;
    dayData.complied = false;
    dayData.points = dayData.violated ? -5 : 0;
  }

  data.days[dayKey] = dayData;
  saveData();
  renderAll();
}

function renderSemana() {
  const days = getWeekDays(currentWeekKey);
  const points = days.reduce((total, dayKey) => total + (data.days[dayKey]?.points || 0), 0);
  const weekStart = parseDateKey(currentWeekKey);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const isCurrentWeek = currentWeekKey === getWeekKey(new Date());
  const title = isCurrentWeek ? "Esta semana" : `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;

  const reward = getWeekReward(points);
  const barPct = clamp((points / 35) * 100, 0, 100);
  const barColor = points >= 35 ? "#ff6600" : points >= 30 ? "#ffff00" : "#ff00ff";

  els.panels.semana.innerHTML = `
    <div class="week-header">
      <button class="btn" type="button" data-action="prev-week">◀</button>
      <h2 class="week-header-title">${title}</h2>
      <button class="btn" type="button" data-action="next-week">▶</button>
    </div>

    <section class="panel week-summary">
      <p class="week-points">${points} pts</p>
      <p class="week-reward ${points >= 30 ? "unlocked" : ""}">${reward}</p>
      <div class="progress-bar" aria-hidden="true">
        <div class="progress-bar-fill" style="width:${barPct}%; background:${barColor}"></div>
      </div>
      <div class="progress-scale"><span>0</span><span>30🍺</span><span>35🍺🍺</span></div>
    </section>

    ${days.map(renderWeekDayCard).join("")}
  `;
}

function renderWeekDayCard(dayKey) {
  const date = parseDateKey(dayKey);
  const dow = date.getDay();
  const sched = SCHEDULE[dow];
  const dayData = data.days[dayKey] || {};
  const isToday = dayKey === getTodayKey();
  const points = dayData.points || 0;

  let borderColor = "#333";
  let background = "rgba(0, 0, 20, 0.6)";

  if (dayData.complied) {
    borderColor = "#00ff88";
    background = "rgba(0, 255, 136, 0.05)";
  } else if (dayData.violated) {
    borderColor = "#ff0055";
    background = "rgba(255, 0, 85, 0.05)";
  } else if (isToday) {
    borderColor = "#ff00ff";
    background = "rgba(255, 0, 255, 0.05)";
  }

  const info = sched.allowed ? sched.time : "🌴 libre";
  const positiveButton = sched.allowed ? "✅ Cumplió" : "🌴 Descansó";
  const negativeButton = sched.allowed ? "❌ Se pasó" : "🎸 Grabó";

  return `
    <article class="week-day-card" style="border-color:${borderColor}; background:${background}">
      ${isToday ? '<span class="today-flag">◀ Hoy</span>' : ""}
      <div class="week-day-main">
        <p class="week-day-name">${SHORT_DAY_NAMES[dow]}</p>
        <p class="week-day-info">${info}</p>
        <p class="week-day-score ${points > 0 ? "positive" : points < 0 ? "negative" : ""}">${sched.allowed || points !== 0 ? formatPoints(points) : ""}</p>
      </div>
      <div class="week-card-actions">
        ${renderMiniButton(dayKey, "complied", dayData.complied, positiveButton, "success")}
        ${renderMiniButton(dayKey, "violated", dayData.violated, negativeButton, "danger")}
      </div>
    </article>
  `;
}

function renderMiniButton(dayKey, status, active, label, type) {
  const activeClass = active ? `active ${type}` : "";
  return `
    <button class="btn btn-${type === "success" ? "success" : "danger"} action-btn ${activeClass}" type="button" data-action="toggle-day" data-day="${dayKey}" data-status="${status}">
      ${label}
    </button>
  `;
}

function renderHistorial() {
  const allDays = Object.entries(data.days).sort((a, b) => b[0].localeCompare(a[0]));
  const weekMap = {};

  allDays.forEach(([dayKey, dayData]) => {
    const weekKey = getWeekKey(parseDateKey(dayKey));
    weekMap[weekKey] = (weekMap[weekKey] || 0) + (dayData.points || 0);
  });

  const weeks = Object.entries(weekMap).sort((a, b) => b[0].localeCompare(a[0]));

  if (!weeks.length) {
    els.panels.historial.innerHTML = `
      <div class="panel history-empty">
        No hay datos aún<br><span>Empieza a registrar</span>
      </div>
    `;
    return;
  }

  const totalComplied = allDays.filter(([, day]) => day.complied).length;
  const totalViolated = allDays.filter(([, day]) => day.violated).length;
  const beerWeeks = weeks.filter(([, points]) => points >= 30).length;

  els.panels.historial.innerHTML = `
    <section class="panel">
      <h2 class="stats-title">🏆 Historial semanal</h2>
      ${weeks.map(renderHistoryWeek).join("")}
      <div class="stats-box">
        <h3 class="stats-title">Estadísticas</h3>
        <ul class="stats-list">
          <li>✅ Días cumplidos: <span class="positive">${totalComplied}</span></li>
          <li>❌ Días fallados: <span class="negative">${totalViolated}</span></li>
          <li>🍺 Semanas con cerveza: <span class="reward">${beerWeeks}</span></li>
          <li>🎵 Canciones grabadas: <span class="neon">${data.songs || 0}</span></li>
        </ul>
      </div>
    </section>
  `;
}

function renderHistoryWeek([weekKey, points]) {
  const start = parseDateKey(weekKey);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const reward = points >= 35 ? "🍺🍺" : points >= 30 ? "🍺" : "🚫";

  return `
    <div class="history-week">
      <p class="history-range">${formatShortDate(start)} - ${formatShortDate(end)}</p>
      <p class="history-score ${points >= 30 ? "reward" : points < 0 ? "negative" : ""}">
        <span>${formatPoints(points)}</span>
        <span>${reward}</span>
      </p>
    </div>
  `;
}

function moveWeek(days) {
  const date = parseDateKey(currentWeekKey);
  date.setDate(date.getDate() + days);
  currentWeekKey = getWeekKey(date);
  renderSemana();
}

function getWeekReward(points) {
  if (points >= 35) return "🍺🍺 Dos cervezas, maestro";
  if (points >= 30) return "🍺 Una cerveza bien ganada";
  return "🚫 Sin cerveza esta semana...";
}

function toggleMusic() {
  if (!musicOn) {
    synth = createSynthLoop();
    synth.start();
    musicOn = true;
    els.musicBtn.textContent = "🔊 Música ON (8-bit)";
    els.musicBtn.classList.add("on");
    return;
  }

  if (synth) synth.stop();
  synth = null;
  musicOn = false;
  els.musicBtn.textContent = "🔇 Música OFF";
  els.musicBtn.classList.remove("on");
}

function createSynthLoop() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContextClass();
  const notes = [
    [523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.20], [0, 0.08],
    [784, 0.10], [880, 0.10], [1047, 0.25], [0, 0.10],
    [659, 0.10], [784, 0.10], [880, 0.10], [784, 0.35], [0, 0.15],
    [523, 0.10], [587, 0.10], [659, 0.10], [784, 0.10], [880, 0.20], [0, 0.10],
    [698, 0.10], [784, 0.10], [880, 0.10], [1047, 0.40], [0, 0.20],
  ];

  let stopped = false;
  let timeoutId = null;

  function loop() {
    if (stopped) return;

    let time = ctx.currentTime;
    notes.forEach(([frequency, duration]) => {
      if (frequency > 0) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "square";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.02);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(time);
        oscillator.stop(time + duration);
      }

      time += duration;
    });

    const totalDuration = notes.reduce((acc, [, duration]) => acc + duration, 0);
    timeoutId = setTimeout(loop, totalDuration * 1000 + 200);
  }

  return {
    start() {
      ctx.resume();
      loop();
    },
    stop() {
      stopped = true;
      clearTimeout(timeoutId);
      ctx.close().catch(() => {});
    },
  };
}

function getTodayKey() {
  return formatDateKey(new Date());
}

function getWeekKey(date) {
  const dt = new Date(date);
  dt.setHours(0, 0, 0, 0);
  const daysSinceMonday = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - daysSinceMonday);
  return formatDateKey(dt);
}

function getWeekDays(weekKey) {
  const start = parseDateKey(weekKey);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return formatDateKey(day);
  });
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDate(date) {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function formatPoints(points) {
  return points > 0 ? `+${points}` : String(points || 0);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", init);
