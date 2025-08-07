function unlockSection() {
  const input = document.getElementById("secretPassword").value;
  const correctPassword = "10/02/2022"; // reemplaza por la clave real
  const section = document.getElementById("lockedSection");
  const message = document.getElementById("unlockMessage");

  if (input === correctPassword) {
    section.classList.remove("hidden");
    section.classList.add("animate-unlock");
    message.textContent = "Sección desbloqueada 💖";
  } else {
    message.textContent = "Contraseña incorrecta.";
  }
}


function openModal(id) {
  document.getElementById(id).style.display = "block";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function toggleMusic() {
  const music = document.getElementById("bgMusic");
  music.paused ? music.play() : music.pause();
}

function updateLoveTime() {
  const start = new Date("2022-10-02T06:48:00"); // fecha de inicio
  const now = new Date();
  const diff = now - start;

  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  document.getElementById("loveTime").textContent =
    `Llevamos ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos juntos 💞`;
}

setInterval(updateLoveTime, 1000);

