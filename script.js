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
  const start = new Date("2022-02-10T06:48:00");
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();
  //console.log(years, months, days, hours, minutes, seconds);
  
  
  if (seconds < 0) {
    seconds += 60;
    minutes--;
  }

  if (minutes < 0) {
    minutes += 60;
    hours--;
  }

  if (hours < 0) {
    hours += 24;
    days--;
  }

  if (days < 0) {
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
    months--;
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  document.getElementById("loveTime").textContent =
    `Llevamos ${years} años, ${months} meses, ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos juntos`;
}


setInterval(updateLoveTime, 1000);

