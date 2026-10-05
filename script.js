const entryScreen = document.getElementById("entryScreen");
const pageContent = document.getElementById("pageContent");
const music = document.getElementById("bgMusic");
const modal = document.getElementById("revealModal");
const canvas = document.getElementById("scratchCanvas");
const context = canvas.getContext("2d", { willReadFrequently: true });
const revealedMemories = new Set();
let activeCard = null;
let lastFocusedElement = null;
let isScratching = false;
let lastScratchPoint = null;
let scratchDistance = 0;

document.getElementById("enterButton").addEventListener("click", () => {
  entryScreen.classList.add("is-leaving");
  pageContent.inert = false;
  window.setTimeout(() => entryScreen.remove(), 700);
  music.play().then(updateMusicButton).catch(() => {});
});

document.getElementById("unlockForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("secretPassword").value.trim().replace(/[.-]/g, "/");
  const section = document.getElementById("lockedSection");
  const message = document.getElementById("unlockMessage");

  if (input === "10/02/2022") {
    section.classList.remove("hidden");
    message.textContent = "Lo recordaste. Ahora viene la mejor parte ♥";
    document.getElementById("memoryGrid").scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    message.textContent = "Casi... piensa en el día que comenzó todo.";
    document.getElementById("secretPassword").setAttribute("aria-invalid", "true");
  }
});

document.getElementById("secretPassword").addEventListener("input", (event) => {
  event.currentTarget.removeAttribute("aria-invalid");
});

document.getElementById("musicButton").addEventListener("click", () => {
  if (music.paused) {
    music.play().then(updateMusicButton).catch(() => {
      document.getElementById("musicLabel").textContent = "No se pudo reproducir";
    });
  } else {
    music.pause();
    updateMusicButton();
  }
});

function updateMusicButton() {
  const isPlaying = !music.paused;
  document.getElementById("musicButton").setAttribute("aria-pressed", String(isPlaying));
  document.getElementById("musicLabel").textContent = isPlaying ? "Pausar música" : "Activar música";
}

function updateMemoryCount() {
  document.getElementById("memoryCount").innerHTML = `${revealedMemories.size} <span>/ 9 revelados</span>`;
}

function openMemory(card) {
  activeCard = card;
  lastFocusedElement = document.activeElement;
  document.getElementById("modalTitle").textContent = card.dataset.title;
  const image = document.getElementById("modalImage");
  image.src = `src/images/${card.dataset.image}`;
  image.alt = card.dataset.alt;
  const alreadyRevealed = card.classList.contains("is-revealed");
  document.getElementById("modalCaption").textContent = alreadyRevealed
    ? "Un pedacito de nuestra historia, para guardar cerquita. ♥"
    : "Desliza el dedo o el cursor sobre la foto.";
  document.getElementById("scratchInstruction").classList.toggle("is-hidden", alreadyRevealed);
  document.getElementById("scratchFrame").classList.toggle("is-revealed", alreadyRevealed);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.getElementById("closeModal").focus();
  if (!alreadyRevealed) window.requestAnimationFrame(setupScratchLayer);
}

function setupScratchLayer() {
  const frame = document.getElementById("scratchFrame");
  const bounds = frame.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.round(bounds.width * pixelRatio);
  canvas.height = Math.round(bounds.height * pixelRatio);
  canvas.style.width = `${bounds.width}px`;
  canvas.style.height = `${bounds.height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.globalCompositeOperation = "source-over";
  context.fillStyle = "#e5b5aa";
  context.fillRect(0, 0, bounds.width, bounds.height);
  context.strokeStyle = "rgba(255, 250, 240, .28)";
  context.lineWidth = 1;
  for (let offset = -bounds.height; offset < bounds.width; offset += 18) {
    context.beginPath();
    context.moveTo(offset, 0);
    context.lineTo(offset + bounds.height, bounds.height);
    context.stroke();
  }
  context.fillStyle = "#6c4540";
  context.font = "14px Georgia";
  context.textAlign = "center";
  context.fillText("un recuerdo espera debajo", bounds.width / 2, bounds.height / 2 + 5);
  context.globalCompositeOperation = "destination-out";
  scratchDistance = 0;
  lastScratchPoint = null;
}

function scratchAt(event) {
  if (!isScratching) return;
  const bounds = canvas.getBoundingClientRect();
  const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  context.beginPath();
  context.arc(point.x, point.y, 25, 0, Math.PI * 2);
  context.fill();
  if (lastScratchPoint) {
    scratchDistance += Math.hypot(point.x - lastScratchPoint.x, point.y - lastScratchPoint.y);
  }
  lastScratchPoint = point;
  if (scratchDistance > bounds.width * bounds.height * 0.9) checkScratchProgress();
}

function checkScratchProgress() {
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let transparent = 0;
  let samples = 0;
  for (let pixel = 3; pixel < pixels.length; pixel += 4 * 48) {
    if (pixels[pixel] < 20) transparent++;
    samples++;
  }
  if (transparent / samples > 0.43) revealActiveMemory();
}

function revealActiveMemory() {
  if (!activeCard || activeCard.classList.contains("is-revealed")) return;
  activeCard.classList.add("is-revealed");
  activeCard.querySelector(".reveal-button").innerHTML = 'Ver recuerdo <span aria-hidden="true">↗</span>';
  revealedMemories.add(activeCard);
  updateMemoryCount();
  document.getElementById("scratchFrame").classList.add("is-revealed");
  document.getElementById("scratchInstruction").classList.add("is-hidden");
  document.getElementById("modalCaption").textContent = "Un pedacito de nuestra historia, para guardar cerquita. ♥";
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  isScratching = false;
  if (lastFocusedElement) lastFocusedElement.focus();
}

document.getElementById("memoryGrid").addEventListener("click", (event) => {
  const button = event.target.closest(".reveal-button");
  if (button) openMemory(button.closest(".memory-card"));
});

document.getElementById("closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});

canvas.addEventListener("pointerdown", (event) => {
  isScratching = true;
  lastScratchPoint = null;
  canvas.setPointerCapture(event.pointerId);
  scratchAt(event);
});
canvas.addEventListener("pointermove", scratchAt);
canvas.addEventListener("pointerup", () => {
  isScratching = false;
  lastScratchPoint = null;
  checkScratchProgress();
});
canvas.addEventListener("pointercancel", () => { isScratching = false; });

function updateLoveTime() {
  const start = new Date(2022, 1, 10, 6, 48, 0);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
    months--;
  }
  if (months < 0) { months += 12; years--; }

  const units = [
    [years, "años"], [months, "meses"], [days, "días"],
    [hours, "horas"], [minutes, "minutos"], [seconds, "segundos"]
  ];
  document.getElementById("timeUnits").innerHTML = units.map(([value, label]) =>
    `<div class="time-unit"><strong>${value}</strong><span>${label}</span></div>`
  ).join("");
}

updateLoveTime();
window.setInterval(updateLoveTime, 1000);

