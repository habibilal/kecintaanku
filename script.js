/* ========================================================
   SCRIPT INTERAKTIF - KECINTAANKU (LDR APOLOGY)
   Floating Particles, Web Audio Synth, Reactions & Confetti
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Canvas Floating Hearts
  initHeartCanvas();

  // 2. Inisialisasi Web Audio Synth Music Box
  initAudioPlayer();

  // 3. Inisialisasi Tombol Reaksi & Modal
  initDecisionInteractions();
});

/* ========================================================
   1. CANVAS FLOATING HEARTS & SPARKLES
   ======================================================== */
function initHeartCanvas() {
  const canvas = document.getElementById('heartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(width < 600 ? 18 : 32, 40);

  // Palet warna partikel pastel
  const colors = [
    'rgba(255, 182, 193, 0.45)', // light pink
    'rgba(255, 192, 203, 0.55)', // pink
    'rgba(255, 222, 235, 0.6)',  // soft blush
    'rgba(232, 215, 241, 0.45)', // soft lavender
    'rgba(255, 230, 200, 0.4)'   // soft peach
  ];

  class FloatingParticle {
    constructor() {
      this.reset();
      this.y = Math.random() * height; // initial spread
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + 20 + Math.random() * 50;
      this.size = Math.random() * 12 + 8;
      this.speedY = Math.random() * 0.7 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = Math.random() * 0.5 + 0.3;
      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = (Math.random() - 0.5) * 0.02;
      this.isHeart = Math.random() > 0.35; // 65% hearts, 35% sparkles
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.008) * 0.4;
      this.angle += this.angularSpeed;

      if (this.y < -30 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;

      if (this.isHeart) {
        // Gambar bentuk hati sederhana
        const s = this.size * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s, -s * 0.6, -s * 1.2, s * 0.3, 0, s * 1.2);
        ctx.bezierCurveTo(s * 1.2, s * 0.3, s, -s * 0.6, 0, s * 0.3);
        ctx.fill();
      } else {
        // Gambar sparkle bokeh
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new FloatingParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animate);
  }

  animate();
}

/* ========================================================
   2. PEMUTAR AUDIO DARI FILE (lagu.mp3)
   Mendukung Autoplay langsung / Sentuhan Pertama Pengunjung
   ======================================================== */
function initAudioPlayer() {
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicIcon = document.getElementById('musicIcon');
  const musicLabel = document.getElementById('musicLabel');
  const bgMusic = document.getElementById('bgMusic');
  if (!musicToggleBtn || !bgMusic) return;

  // Set volume lembut yang nyaman didengar
  bgMusic.volume = 0.65;

  let hasStartedPlaying = false;

  function attemptPlay() {
    if (hasStartedPlaying) return;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          hasStartedPlaying = true;
          musicToggleBtn.classList.add('playing');
          musicIcon.textContent = '⏸️';
          musicLabel.textContent = 'Jeda Lagu';
          removeInteractionListeners();
        })
        .catch((err) => {
          // Browser memblokir autoplay otomatis sebelum ada interaksi pertama
          console.log('Autoplay ditahan kebijakan browser, menunggu sentuhan/klik pertama:', err);
        });
    }
  }

  // Coba putar langsung saat halaman dibuka
  attemptPlay();

  // Fallback: Begitu pacar menyentuh layar / scroll / mengklik apa saja, lagu langsung berputar
  function onFirstUserInteraction() {
    if (!hasStartedPlaying) {
      attemptPlay();
    }
  }

  const interactionEvents = ['click', 'touchstart', 'touchend', 'scroll', 'keydown'];
  function addInteractionListeners() {
    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, onFirstUserInteraction, { once: true, passive: true });
    });
  }

  function removeInteractionListeners() {
    interactionEvents.forEach((evt) => {
      window.removeEventListener(evt, onFirstUserInteraction);
    });
  }

  addInteractionListeners();

  // Tombol Manual Toggle
  musicToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Mencegah bentrok dengan listener global
    if (bgMusic.paused) {
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            hasStartedPlaying = true;
            musicToggleBtn.classList.add('playing');
            musicIcon.textContent = '⏸️';
            musicLabel.textContent = 'Jeda Lagu';
          })
          .catch((err) => {
            console.warn('File audio belum dapat diputar:', err);
            alert('File audio "lagu.mp3" belum ditemukan di folder website ini.\n\nSilakan masukkan file lagu pilihanmu ke dalam folder:\nC:\\xampp\\htdocs\\kecintaanku\\\nlalu beri nama "lagu.mp3", kemudian coba putar lagi ya!');
          });
      }
    } else {
      bgMusic.pause();
      musicToggleBtn.classList.remove('playing');
      musicIcon.textContent = '🎵';
      musicLabel.textContent = 'Putar Lagu';
    }
  });

  // Sinkronisasi status jika audio dipause/play
  bgMusic.addEventListener('play', () => {
    hasStartedPlaying = true;
    musicToggleBtn.classList.add('playing');
    musicIcon.textContent = '⏸️';
    musicLabel.textContent = 'Jeda Lagu';
  });

  bgMusic.addEventListener('pause', () => {
    musicToggleBtn.classList.remove('playing');
    musicIcon.textContent = '🎵';
    musicLabel.textContent = 'Putar Lagu';
  });
}


/* ========================================================
   3. DECISION INTERACTIONS & MODAL CELEBRATION
   ======================================================== */
function initDecisionInteractions() {
  const btnForgive = document.getElementById('btnForgive');
  const btnFight = document.getElementById('btnFight');
  const btnPout = document.getElementById('btnPout');
  const poutPleaBox = document.getElementById('poutPleaBox');

  const modal = document.getElementById('responseModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalAcceptBtn = document.getElementById('modalAcceptBtn');
  const modalEmoji = document.getElementById('modalEmoji');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalSweetQuote = document.getElementById('modalSweetQuote');

  // Konfigurasi respons berdasarkan pilihan
  const responses = {
    forgive: {
      emoji: '💖',
      title: 'Terima Kasih Banyak, Sayangku...',
      message: `
        <p>Air mataku hampir jatuh membaca keputusan ini. Rasa sesak dan bersalah di dadaku perlahan runtuh menjadi kelegaan yang luar biasa.</p>
        <p>Terima kasih sudah membuka pintu hatimu dan memaafkanku. Aku berjanji tidak akan menyia-nyiakan kesempatan ini. Aku akan belajar mendengar lebih baik dan selalu menjaga senyum manismu.</p>
      `,
      quote: '"Memaafkan adalah bentuk tertinggi dari cinta. Terima kasih sudah menjagaku di hatimu."'
    },
    fight: {
      emoji: '💫',
      title: 'Ayo Kita Berjuang Bersama Lagi!',
      message: `
        <p>Kata-katamu ini memberiku kekuatan berkali-kali lipat! Jarak ratusan kilometer ini tidak ada apa-apanya dibanding besarnya masa depan yang ingin kurajut bersamamu.</p>
        <p>Ayo kita hadapi rindu dan salah paham ini bersama-sama. Sampai hari di mana kita bisa berpelukan erat tanpa ada jeda layar lagi!</p>
      `,
      quote: '"Jarak hanya sementara, tapi kamu dan aku adalah selamanya."'
    }
  };

  function openModal(type) {
    const data = responses[type] || responses.forgive;
    modalEmoji.textContent = data.emoji;
    modalTitle.textContent = data.title;
    modalMessage.innerHTML = data.message;
    modalSweetQuote.textContent = data.quote;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    // Ledakan confetti hati & bintang
    createConfettiBurst();
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  if (btnForgive) {
    btnForgive.addEventListener('click', () => openModal('forgive'));
  }

  if (btnFight) {
    btnFight.addEventListener('click', () => openModal('fight'));
  }

  if (btnPout && poutPleaBox) {
    btnPout.addEventListener('click', () => {
      poutPleaBox.classList.toggle('hidden');
      if (!poutPleaBox.classList.contains('hidden')) {
        poutPleaBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalAcceptBtn) {
    modalAcceptBtn.addEventListener('click', () => {
      // Efek visual tambahan saat tombol peluk balik diklik
      createConfettiBurst();
      modalAcceptBtn.innerHTML = '<span>Pelukan Terkirim Erat!</span> <span>✨🥰</span>';
      setTimeout(() => {
        closeModal();
        modalAcceptBtn.innerHTML = '<span>Kirim Peluk Hangat Balik</span> <span>🫂❤️</span>';
      }, 1500);
    });
  }

  // Tutup jika mengklik di luar kartu modal
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Tutup dengan tombol Esc
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ========================================================
   4. CELEBRATION CONFETTI BURST
   ======================================================== */
function createConfettiBurst() {
  const container = document.getElementById('modalParticles');
  if (!container) return;

  container.innerHTML = '';
  const items = ['🌸', '✨', '💖', '💌', '💕', '🌷', '🤍'];
  const count = 30;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.textContent = items[Math.floor(Math.random() * items.length)];
    el.style.position = 'absolute';
    el.style.left = '50%';
    el.style.top = '40%';
    el.style.fontSize = Math.random() * 16 + 12 + 'px';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '10';

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 220 + 40;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;
    const duration = Math.random() * 1000 + 1200;

    container.appendChild(el);

    el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 1 },
        { transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.1)`, opacity: 0.9, offset: 0.7 },
        { transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY + 40}px)) scale(0.8)`, opacity: 0 }
      ],
      {
        duration: duration,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards'
      }
    );

    setTimeout(() => {
      el.remove();
    }, duration);
  }
}
