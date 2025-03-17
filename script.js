// script.js
let musicPlaying = true;
let currentSlide = 0;
const stops = ['castillo', 'plaza', 'iglesia', 'fuente', 'ermita', 'puente', 'bodega'];

// Definir las coordenadas de cada parada
const locations = {
  'castillo': { lat: 40.52063322, lng: -6.06336883 },
  'plaza': { lat: 40.52128923, lng: -6.06388034 },
  'iglesia': { lat: 40.52139802, lng: -6.06387663 },
  'fuente': { lat: 40.52218483, lng: -6.06456133 },
  'ermita': { lat: 40.522793, lng: -6.066424 },
  'puente': { lat: 40.522552, lng: -6.065858 },
  'bodega': { lat: 40.521659, lng: -6.064401 }
};

const toleranceRadius = 20;

const qrCodes = {
  'castillo': { 
    code: 'CASTILLO-1834', 
    hint: 'Busca cerca de la torre marcada por el rayo.', 
    curiosity: 'En 1834, un rayo destruyó parte de la torre del castillo, dejando una marca que aún se puede ver.' 
  },
  'plaza': { 
    code: 'PLAZA-1523', 
    hint: 'El mensaje está escondido cerca de las gradas de piedra.', 
    curiosity: 'La plaza fue escenario de capeas desde el siglo XVII, una tradición que aún se celebra.' 
  },
  'iglesia': { 
    code: 'IGLESIA-1300', 
    hint: 'Revisa los retablos para encontrar una pista.', 
    curiosity: 'La iglesia alberga un retablo del siglo XV que fue restaurado en 1998.' 
  },
  'fuente': { 
    code: 'FUENTE-1600', 
    hint: 'El portalón guarda un secreto bajo los caños.', 
    curiosity: 'La fuente fue construida en el siglo XVI para abastecer de agua al pueblo.' 
  },
  'ermita': { 
    code: 'ERMITA-1500', 
    hint: 'La Virgen podría señalar el lugar.', 
    curiosity: 'La Virgen de la ermita es del siglo XVI y fue traída desde Italia.' 
  },
  'puente': { 
    code: 'PUENTE-1400', 
    hint: 'Busca en el arco principal del puente.', 
    curiosity: 'El puente resistió una gran crecida del río Canderuelo en 1650.' 
  },
  'bodega': { 
    code: 'BODEGA-1600', 
    hint: 'El dintel del escudo oculta algo más.', 
    curiosity: 'La bodega guarda vinos de la uva Rufete, típica de la Sierra de Francia.' 
  }
};

function toggleMusic() {
  const audio = document.getElementById('ambient-sound') || document.getElementById('background-music');
  const musicBtn = document.querySelector('.music-btn');
  const musicIcon = document.querySelector('.music-icon');
  if (!audio || !musicBtn || !musicIcon) return;
  if (musicPlaying) {
    audio.pause();
    musicBtn.textContent = 'Reanudar Música';
    musicIcon.textContent = '🔇';
  } else {
    audio.play().catch(err => console.log('Error al reproducir música:', err));
    musicBtn.textContent = 'Pausar Música';
    musicIcon.textContent = '🎵';
  }
  musicPlaying = !musicPlaying;
}

function playSound(soundId) {
  const sound = document.getElementById(soundId);
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(err => console.log('Error al reproducir sonido:', err));
  }
}

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function checkLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        const stop = window.location.pathname.split('/').pop().replace('.html', '');
        const targetLocation = locations[stop];

        if (targetLocation) {
          const distance = getDistanceFromLatLonInMeters(userLat, userLng, targetLocation.lat, targetLocation.lng);
          if (distance <= toleranceRadius) {
            alert('¡Ubicación verificada!');
            unlockContent();
          } else {
            document.getElementById('location-status').textContent = `Estás a ${Math.round(distance)} metros. Acércate más (máximo ${toleranceRadius} metros). Precisión: ${Math.round(accuracy)}m`;
            playSound('error-sound');
          }
        } else {
          alert('No se encontró la ubicación para esta parada.');
        }
      },
      (error) => {
        document.getElementById('location-status').textContent = 'Error: ' + error.message + '. Usa verificación manual.';
        playSound('error-sound');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    document.getElementById('location-status').textContent = 'Geolocalización no soportada. Usa verificación manual.';
    playSound('error-sound');
  }
}

function checkLocationManual() {
  const input = document.getElementById('location-input').value.trim().toLowerCase();
  const stop = window.location.pathname.split('/').pop().replace('.html', '');
  if (input === stop || (stop === 'fuente' && input === 'fuente y portalón')) {
    unlockContent();
  } else {
    document.getElementById('location-status').textContent = 'Ubicación incorrecta. Intenta de nuevo.';
    playSound('error-sound');
  }
}

function checkQR() {
  const qrInput = document.getElementById('qr-input').value.trim().toUpperCase();
  const stop = window.location.pathname.split('/').pop().replace('.html', '');
  const qrData = qrCodes[stop];

  if (qrData && qrInput === qrData.code) {
    document.getElementById('qr-status').style.display = 'block';
    document.getElementById('qr-status').innerHTML = `
      <strong>Pista:</strong> ${qrData.hint}<br>
      <strong>Curiosidad:</strong> ${qrData.curiosity}
    `;
    playSound('success-sound');
  } else {
    document.getElementById('qr-status').style.display = 'block';
    document.getElementById('qr-status').textContent = 'Código QR incorrecto. Intenta de nuevo.';
    playSound('error-sound');
  }
}

function unlockContent() {
  const stop = window.location.pathname.split('/').pop().replace('.html', '');
  const messagePieces = {
    'castillo': 'Oculto', 'plaza': 'en', 'iglesia': 'la', 'fuente': 'bodega',
    'ermita': 'sin', 'puente': 'escudo', 'bodega': ''
  };
  document.getElementById('location-check').style.display = 'none';
  document.getElementById('game-content').style.display = 'block';
  document.getElementById('message-piece').style.display = 'inline';
  document.getElementById('location-status').textContent = '¡Ubicación verificada!';
  playSound('success-sound');
  setupCarousel();
  setupVisualChallenges();
  setupQuiz();
  localStorage.setItem(`${stop}-completed`, 'true');
  localStorage.setItem(`message-${stop}`, messagePieces[stop]);
  checkCompletion();
}

function setupCarousel() {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;
  const slides = carousel.querySelectorAll('.slide');
  const prevBtn = carousel.querySelector('.prev-slide');
  const nextBtn = carousel.querySelector('.next-slide');
  if (slides.length === 0) {
    console.log('No se encontraron slides en el carrusel.');
    return;
  }

  currentSlide = Array.from(slides).findIndex(slide => slide.classList.contains('active')) || 0;
  slides.forEach((slide, index) => {
    slide.style.display = index === currentSlide ? 'block' : 'none';
    slide.classList.toggle('active', index === currentSlide);
  });

  prevBtn.onclick = () => {
    slides[currentSlide].style.display = 'none';
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    slides[currentSlide].style.display = 'block';
    slides[currentSlide].classList.add('active');
    console.log(`Slide cambiado a: ${currentSlide}`);
  };

  nextBtn.onclick = () => {
    slides[currentSlide].style.display = 'none';
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].style.display = 'block';
    slides[currentSlide].classList.add('active');
    console.log(`Slide cambiado a: ${currentSlide}`);
  };
}

function setupVisualChallenges() {
  const stop = window.location.pathname.split('/').pop().replace('.html', '');
  const challenges = {
    'castillo': [
      { question: '¿Qué marcó la torre del homenaje?', options: ['Incendio', 'Rayo', 'Terremoto'], correct: 'Rayo' },
      { question: '¿Qué destaca en la entrada fortificada?', options: ['Arcos', 'Muralla', 'Torreones'], correct: 'Muralla' }
    ],
    'plaza': [
      { question: '¿Qué material destaca en las gradas?', options: ['Madera', 'Piedra', 'Metal'], correct: 'Piedra' },
      { question: '¿Qué se ve en el interior?', options: ['Burladeros', 'Columnas', 'Escaleras'], correct: 'Burladeros' }
    ],
    'iglesia': [
      { question: '¿Qué detalle destaca en la fachada?', options: ['Columnas jónicas', 'Vitrales', 'Reloj'], correct: 'Columnas jónicas' },
      { question: '¿Qué hay en el interior?', options: ['Retablos', 'Pinturas', 'Esculturas'], correct: 'Retablos' }
    ],
    'fuente': [
      { question: '¿Cuántos caños tiene la fuente?', options: ['Un caño', 'Dos caños', 'Tres caños'], correct: 'Dos caños' },
      { question: '¿Qué decora los caños?', options: ['Flores', 'Geométricos', 'Animales'], correct: 'Geométricos' }
    ],
    'ermita': [
      { question: '¿Qué rodea la ermita?', options: ['Parques', 'Montañas', 'Ciudad'], correct: 'Parques' },
      { question: '¿Qué imagen hay dentro?', options: ['Virgen', 'Cruz', 'Santo'], correct: 'Virgen' }
    ],
    'puente': [
      { question: '¿Qué material predomina?', options: ['Madera', 'Piedra', 'Ladrillo'], correct: 'Piedra' },
      { question: '¿Qué forma tiene el puente?', options: ['Arco', 'Recto', 'Curvo'], correct: 'Arco' }
    ],
    'bodega': [
      { question: '¿Qué es esencial aquí?', options: ['Barriles', 'Ventanas', 'Puertas'], correct: 'Barriles' },
      { question: '¿Qué hay en el dintel?', options: ['Escudo', 'Inscripción', 'Relieve'], correct: 'Escudo' }
    ]
  };
  const stopChallenges = challenges[stop];
  if (stopChallenges) {
    stopChallenges.forEach((challenge, index) => {
      const optionsDiv = document.getElementById(`visual-opciones-${index + 1}`);
      const resultElement = document.getElementById(`visual-resultado-${index + 1}`);
      if (localStorage.getItem(`visual-${stop}-${index + 1}`) === 'true') {
        if (optionsDiv) optionsDiv.style.display = 'none';
        if (resultElement) resultElement.textContent = '¡Correcto!';
      } else if (optionsDiv) {
        optionsDiv.innerHTML = challenge.options.map(opt => 
          `<button class="action-btn" onclick="checkVisualAnswer('${opt}', '${challenge.correct}', ${index + 1})">${opt}</button>`
        ).join('');
      }
    });
  }
}

function checkVisualAnswer(selected, correct, challengeNum) {
  const resultado = document.getElementById(`visual-resultado-${challengeNum}`);
  const optionsDiv = document.getElementById(`visual-opciones-${challengeNum}`);
  if (!resultado || !optionsDiv) return;
  if (selected === correct) {
    resultado.textContent = '¡Correcto!';
    optionsDiv.style.display = 'none';
    playSound('success-sound');
    localStorage.setItem(`visual-${window.location.pathname.split('/').pop().replace('.html', '')}-${challengeNum}`, 'true');
    checkCompletion();
  } else {
    resultado.textContent = 'Incorrecto. Intenta de nuevo.';
    playSound('error-sound');
  }
}

function setupQuiz() {
  const stop = window.location.pathname.split('/').pop().replace('.html', '');
  const quizzes = {
    'castillo': [
      { question: '¿En qué siglo nació este castillo?', options: ['XII', 'XIII', 'XIV'], correct: 'XIII' },
      { question: '¿Qué alberga el recinto desde 1834?', options: ['Discoteca', 'Cementerio', 'Parque infantil'], correct: 'Cementerio' },
      { question: '¿Qué ofrece hoy el castillo?', options: ['Museo', 'Centro de Interpretación', 'Biblioteca'], correct: 'Centro de Interpretación' }
    ],
    'plaza': [
      { question: '¿En qué siglo se transformó esta plaza?', options: ['XVI', 'XVII', 'XVIII'], correct: 'XVII' },
      { question: '¿Qué inspiró a Gonzalo a elegir su escondite en la plaza?', options: ['Capeas', 'Mejillón Rock', 'Procesión'], correct: 'Capeas' },
      { question: '¿Qué tradición serrana conecta esta plaza con La Bodega Medieval?', options: ['Elaboración de vino', 'Procesión religiosa', 'Festival de rock'], correct: 'Elaboración de vino' }
    ],
    'iglesia': [
      { question: '¿En qué siglo comenzó esta iglesia?', options: ['XIII', 'XIV', 'XV'], correct: 'XIII' },
      { question: '¿Qué estilo tiene la puerta?', options: ['Gótico-mudéjar', 'Románico', 'Barroco'], correct: 'Gótico-mudéjar' },
      { question: '¿Cuántas campanas hay en el campanario?', options: ['4', '3', '5'], correct: '5' }
    ],
    'fuente': [
      { question: '¿En qué siglo se construyó esta fuente?', options: ['XV', 'XVI', 'XVII'], correct: 'XVI' },
      { question: '¿Qué estilo es la fuente?', options: ['Renacentista', 'Gótico', 'Barroco'], correct: 'Renacentista' },
      { question: '¿Qué río pasa cerca?', options: ['Canderuelo', 'Francia', 'Tormes'], correct: 'Canderuelo' }
    ],
    'ermita': [
      { question: '¿En qué siglo se edificó esta ermita?', options: ['XIV', 'XV', 'XVI'], correct: 'XV' },
      { question: '¿Qué río está cerca?', options: ['Canderuelo', 'Francia', 'Duero'], correct: 'Canderuelo' },
      { question: '¿Qué siglo es la Virgen?', options: ['XV', 'XVI', 'XVII'], correct: 'XVI' }
    ],
    'puente': [
      { question: '¿En qué siglo se erigió este puente?', options: ['XIII', 'XIV', 'XV'], correct: 'XIV' },
      { question: '¿Sobre qué río está?', options: ['Canderuelo', 'Francia', 'Tajo'], correct: 'Canderuelo' },
      { question: '¿Qué resiste el puente?', options: ['Crecidas', 'Terremotos', 'Incendios'], correct: 'Crecidas' }
    ],
    'bodega': [
      { question: '¿En qué siglo nació esta bodega?', options: ['XV', 'XVI', 'XVII'], correct: 'XVI' },
      { question: '¿El vino de qué uva se produce en la Sierra de Francia?', options: ['Rufete', 'Moscatel', 'Pinot Noir'], correct: 'Rufete' },
      { question: '¿Qué guarda la bodega?', options: ['Un secreto', 'Oro', 'Libros'], correct: 'Un secreto' }
    ]
  };
  const stopQuizzes = quizzes[stop];
  if (stopQuizzes) {
    stopQuizzes.forEach((quiz, index) => {
      const optionsDiv = document.getElementById(`quiz-opciones-${index + 1}`);
      const resultElement = document.getElementById(`quiz-resultado-${index + 1}`);
      if (localStorage.getItem(`quiz-${stop}-${index + 1}`) === 'true') {
        if (optionsDiv) optionsDiv.style.display = 'none';
        if (resultElement) resultElement.textContent = '¡Correcto!';
      } else if (optionsDiv) {
        optionsDiv.innerHTML = quiz.options.map(opt => 
          `<button class="action-btn" onclick="checkAnswer('${opt}', '${quiz.correct}', ${index + 1})">${opt}</button>`
        ).join('');
      }
    });
  }
}

function checkAnswer(selected, correct, quizNum) {
  const resultado = document.getElementById(`quiz-resultado-${quizNum}`);
  const optionsDiv = document.getElementById(`quiz-opciones-${quizNum}`);
  if (!resultado || !optionsDiv) return;
  if (selected === correct) {
    resultado.textContent = '¡Correcto!';
    optionsDiv.style.display = 'none';
    playSound('success-sound');
    localStorage.setItem(`quiz-${window.location.pathname.split('/').pop().replace('.html', '')}-${quizNum}`, 'true');
    checkCompletion();
  } else {
    resultado.textContent = 'Incorrecto. Intenta de nuevo.';
    playSound('error-sound');
  }
}

function checkFinalAnswer() {
  const answer = document.getElementById('final-answer')?.value.toLowerCase().trim();
  const result = document.getElementById('final-resultado');
  if (!answer || !result) return;
  if (answer === 'el símbolo' || answer === 'simbolo') {
    result.textContent = '¡Correcto! Reserva para descubrirlo.';
    playSound('coins-sound');
    localStorage.setItem('final-bodega', 'true');
    checkCompletion();
  } else {
    result.textContent = 'Intenta de nuevo.';
    playSound('error-sound');
  }
}

function checkCompletion() {
  const stop = window.location.pathname.split('/').pop().replace('.html', '');
  const visualsCompleted = [1, 2].every(i => localStorage.getItem(`visual-${stop}-${i}`) === 'true');
  const quizzesCompleted = [1, 2, 3].every(i => localStorage.getItem(`quiz-${stop}-${i}`) === 'true');
  const finalCompleted = stop === 'bodega' ? localStorage.getItem('final-bodega') === 'true' : true;
  if (visualsCompleted && quizzesCompleted && finalCompleted) {
    const continueButton = document.getElementById('continue-button');
    if (continueButton) continueButton.style.display = 'block';
  }
}

function updateProgress() {
  const completed = stops.filter(stop => localStorage.getItem(`${stop}-completed`) === 'true').length;
  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-fill');
  if (progressText && progressFill) {
    progressText.textContent = `Paradas completadas: ${completed}/${stops.length}`;
    progressFill.style.width = `${(completed / stops.length) * 100}%`;
  }
}

function checkFinal() {
  const completed = stops.every(stop => localStorage.getItem(`${stop}-completed`) === 'true');
  if (completed) {
    const reveal = document.getElementById('treasure-reveal');
    if (reveal) {
      reveal.style.display = 'block';
      const message = stops.map(stop => localStorage.getItem(`message-${stop}`)).join(' ');
      document.getElementById('message-reveal').textContent = message;
      playSound('coins-sound');
    }
  } else {
    alert('Completa todas las paradas para revelar el mensaje.');
  }
}

function revealHint(message) {
  alert(`Pista Oculta: ${message}`);
}

function showHint(text) {
  alert(`Pista: ${text}`);
}

function setupInteractivity() {
  const buttons = document.querySelectorAll('.action-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(50);
    });
  });

  const stopIcons = document.querySelectorAll('.map-btn');
  stopIcons.forEach(icon => {
    const stop = icon.id.replace('btn-', '');
    if (localStorage.getItem(`${stop}-completed`) === 'true') {
      icon.classList.add('completed-animation');
    }
  });
}

function resetGame() {
  stops.forEach(stop => {
    localStorage.removeItem(`${stop}-completed`);
    localStorage.removeItem(`message-${stop}`);
    [1, 2].forEach(i => localStorage.removeItem(`visual-${stop}-${i}`));
    [1, 2, 3].forEach(i => localStorage.removeItem(`quiz-${stop}-${i}`));
  });
  localStorage.removeItem('final-bodega');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('ambient-sound') || document.getElementById('background-music');
  if (audio) {
    audio.play().catch(err => console.log('Error al reproducir música al cargar:', err));
  }

  const buttons = document.querySelectorAll('.stop-selector .action-btn');
  buttons.forEach(btn => {
    const stop = btn.textContent.toLowerCase().trim().replace(' y portalón', '');
    if (stops.includes(stop) && localStorage.getItem(`${stop}-completed`) === 'true') {
      btn.style.textDecoration = 'line-through';
    }
  });

  updateProgress();
  setupCarousel();
  setupVisualChallenges();
  setupQuiz();
  setupInteractivity();
});
