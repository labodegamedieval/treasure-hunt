let musicPlaying = true;
let currentSlide = 0;
const stops = ['castillo', 'plaza', 'iglesia', 'fuente', 'ermita', 'puente', 'bodega'];

const locations = {
  'castillo': { lat: 40.520512, lng: -6.063541 },
  'plaza': { lat: 40.520621, lng: -6.063455 },
  'iglesia': { lat: 40.521379, lng: -6.063810 },
  'fuente': { lat: 40.522185, lng: -6.064564 },
  'ermita': { lat: 40.522793, lng: -6.066424 },
  'puente': { lat: 40.522552, lng: -6.065858 },
  'bodega': { lat: 40.521659, lng: -6.064401 }
};

const toleranceRadius = 20;
const audioCheers = new Audio('sounds/cheers.mp3');

function toggleMusic() {
  const audio = document.getElementById('background-music');
  if (!audio) return;
  if (musicPlaying) {
    audio.pause();
  } else {
    audio.play().catch(err => console.log('Error al reproducir música:', err));
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

function checkLocationManual() {
  const input = document.getElementById('location-input').value.trim().toLowerCase();
  const stop = getCurrentStop();
  if (input === stop) {
    unlockContent();
  } else {
    document.getElementById('location-status').textContent = 'Ubicación incorrecta. Intenta de nuevo.';
    playSound('error-sound');
  }
}

function unlockContent() {
  document.getElementById('location-check').style.display = 'none';
  document.getElementById('game-content').style.display = 'block';
  playSound('success-sound');
  setupCarousel();
  setupVisualChallenges();
  setupQuiz();
  localStorage.setItem(`${getCurrentStop()}-completed`, 'true');
  checkCompletion();
}

function getCurrentStop() {
  return window.location.pathname.split('/').pop().replace('.html', '');
}

function setupCarousel() {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;

  slides[currentSlide].classList.add('active');
  document.querySelector('.prev-slide').onclick = () => changeSlide(-1);
  document.querySelector('.next-slide').onclick = () => changeSlide(1);
}

function changeSlide(direction) {
  const slides = document.querySelectorAll('.slide');
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
}

function setupVisualChallenges() {
  const stop = getCurrentStop();
  const challenges = document.querySelectorAll('.visual-challenge');
  challenges.forEach((challenge, index) => {
    challenge.querySelectorAll('.action-btn').forEach(button => {
      button.onclick = () => checkVisualAnswer(button, index + 1);
    });
  });
}

function checkVisualAnswer(button, challengeNum) {
  const correct = button.dataset.correct === 'true';
  const resultElement = document.getElementById(`visual-resultado-${challengeNum}`);
  if (correct) {
    resultElement.textContent = '¡Correcto!';
    button.parentElement.style.display = 'none';
    playSound('success-sound');
    localStorage.setItem(`visual-${getCurrentStop()}-${challengeNum}`, 'true');
    checkCompletion();
  } else {
    resultElement.textContent = 'Incorrecto. Intenta de nuevo.';
    playSound('error-sound');
  }
}

function setupQuiz() {
  const stop = getCurrentStop();
  const quizzes = document.querySelectorAll('.quiz-question');
  quizzes.forEach((quiz, index) => {
    quiz.querySelectorAll('.action-btn').forEach(button => {
      button.onclick = () => checkAnswer(button, index + 1);
    });
  });
}

function checkAnswer(button, quizNum) {
  const correct = button.dataset.correct === 'true';
  const resultElement = document.getElementById(`quiz-resultado-${quizNum}`);
  if (correct) {
    resultElement.textContent = '¡Correcto!';
    button.parentElement.style.display = 'none';
    playSound('success-sound');
    localStorage.setItem(`quiz-${getCurrentStop()}-${quizNum}`, 'true');
    checkCompletion();
  } else {
    resultElement.textContent = 'Incorrecto. Intenta de nuevo.';
    playSound('error-sound');
  }
}

function checkCompletion() {
  const stop = getCurrentStop();
  const allCompleted = [1, 2].every(i => localStorage.getItem(`visual-${stop}-${i}`) === 'true') &&
                        [1, 2, 3].every(i => localStorage.getItem(`quiz-${stop}-${i}`) === 'true');
  if (allCompleted) {
    document.getElementById('continue-button').style.display = 'block';
    document.getElementById('message-piece').style.display = 'inline';
    audioCheers.play();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('background-music')) {
    document.getElementById('background-music').play().catch(err => console.log('Error al reproducir música:', err));
  }
  updateProgress();
  setupCarousel();
  setupVisualChallenges();
  setupQuiz();
});