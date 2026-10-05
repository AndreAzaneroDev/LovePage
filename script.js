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
const quizQuestions = [
  {
    question: "¿Cuál fue nuestro primer beso?",
    options: ["Afuera de tu casa", "Cuando me acompañaste al dentista", "En un parque", "En San Miguel"],
    answer: 0,
    image: "fotopregunta1.jpeg",
    alt: "Una foto de nuestro primer beso"
  },
  {
    question: "¿Cuál fue la primera película que vimos juntos?",
    options: ["Tren Bala", "Mujer Rey", "Spiderman", "Black Adam"],
    answer: 2
  },
  {
    question: "¿Cuál fue el primer regalo que te hice?",
    options: ["Flores", "Perfume", "Peluche", "Ropa"],
    answer: 2
  },
  {
    question: "¿Cuándo tomamos esta foto?",
    options: ["Cuando ingresaste a BanBif", "Cuando terminaste la universidad", "Luego de ingresar a TP", "En un aniversario nuestro"],
    answer: 2,
    image: "fotopregunta4.jpeg",
    alt: "Una foto del día en que ingresaste a TP"
  },
  {
    question: "¿Qué es lo que más me gusta de ti?",
    options: ["Tus ojos", "Tus labios", "Tu rostro completo", "Todas las anteriores"],
    answer: 3,
    image: "fotopregunta5.jpeg",
    alt: "Una foto de Diana"
  }
];
let currentQuestionIndex = 0;
let selectedOptionIndex = null;
let questionAnswered = false;

document.getElementById("enterButton").addEventListener("click", () => {
  entryScreen.classList.add("is-leaving");
  pageContent.inert = false;
  window.setTimeout(() => entryScreen.remove(), 700);
  music.play().then(updateMusicButton).catch(() => {});
});

function renderQuizQuestion() {
  const question = quizQuestions[currentQuestionIndex];
  const photoWrap = document.getElementById("quizPhotoWrap");
  const photo = document.getElementById("quizPhoto");
  const progress = document.querySelector(".quiz-progress-track");

  document.getElementById("quizProgressLabel").textContent = `PREGUNTA ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
  document.getElementById("quizScoreLabel").textContent = `${currentQuestionIndex} ${currentQuestionIndex === 1 ? "RESPUESTA CORRECTA" : "RESPUESTAS CORRECTAS"}`;
  progress.setAttribute("aria-valuenow", String(currentQuestionIndex + 1));
  document.getElementById("quizProgressFill").style.width = `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`;
  document.getElementById("quizQuestion").textContent = question.question;
  document.getElementById("quizFeedback").textContent = "";
  document.getElementById("quizFeedback").classList.remove("is-error");
  document.getElementById("quizAction").innerHTML = 'Comprobar <span aria-hidden="true">→</span>';

  if (question.image) {
    photoWrap.classList.remove("hidden");
    photo.alt = question.alt;
    photo.onerror = () => photoWrap.classList.add("hidden");
    photo.onload = () => photoWrap.classList.remove("hidden");
    photo.src = `src/images/${question.image}`;
  } else {
    photo.removeAttribute("src");
    photoWrap.classList.add("hidden");
  }

  document.getElementById("quizOptions").innerHTML = question.options.map((option, index) =>
    `<button class="quiz-option" type="button" data-option="${index}" aria-pressed="false"><span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${option}</span></button>`
  ).join("");
  selectedOptionIndex = null;
  questionAnswered = false;
}

document.getElementById("quizOptions").addEventListener("click", (event) => {
  const option = event.target.closest(".quiz-option");
  if (!option || questionAnswered) return;

  document.querySelectorAll(".quiz-option").forEach((button) => {
    button.classList.remove("is-selected", "is-wrong");
    button.setAttribute("aria-pressed", "false");
  });
  option.classList.add("is-selected");
  option.setAttribute("aria-pressed", "true");
  selectedOptionIndex = Number(option.dataset.option);
  document.getElementById("quizFeedback").textContent = "";
  document.getElementById("quizFeedback").classList.remove("is-error");
});

document.getElementById("quizAction").addEventListener("click", () => {
  const feedback = document.getElementById("quizFeedback");
  const question = quizQuestions[currentQuestionIndex];

  if (questionAnswered) {
    if (currentQuestionIndex === quizQuestions.length - 1) {
      document.getElementById("quizPanel").classList.add("hidden");
      document.getElementById("quizSuccess").classList.remove("hidden");
      document.getElementById("lockedSection").classList.remove("hidden");
      document.getElementById("memoryGrid").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    currentQuestionIndex++;
    renderQuizQuestion();
    return;
  }

  if (selectedOptionIndex === null) {
    feedback.textContent = "Elige una respuesta para continuar.";
    feedback.classList.add("is-error");
    return;
  }

  if (selectedOptionIndex !== question.answer) {
    feedback.textContent = "Esa no era... ¡inténtalo otra vez!";
    feedback.classList.add("is-error");
    document.querySelector(`.quiz-option[data-option="${selectedOptionIndex}"]`).classList.add("is-wrong");
    return;
  }

  questionAnswered = true;
  document.querySelectorAll(".quiz-option").forEach((button) => { button.disabled = true; });
  document.querySelector(`.quiz-option[data-option="${selectedOptionIndex}"]`).classList.add("is-correct");
  const correctAnswers = currentQuestionIndex + 1;
  document.getElementById("quizScoreLabel").textContent = `${correctAnswers} ${correctAnswers === 1 ? "RESPUESTA CORRECTA" : "RESPUESTAS CORRECTAS"}`;
  feedback.textContent = "¡Correcto! Esa sí que la recuerdas. ♥";
  feedback.classList.remove("is-error");
  document.getElementById("quizAction").innerHTML = currentQuestionIndex === quizQuestions.length - 1
    ? 'Abrir nuestros recuerdos <span aria-hidden="true">↗</span>'
    : 'Siguiente pregunta <span aria-hidden="true">→</span>';
});

document.getElementById("quizSuccess").textContent = "¡Cinco de cinco! Nuestra historia está en buenas manos. ♥";

renderQuizQuestion();

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

