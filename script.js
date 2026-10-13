/**
 * Happy Birthday Cutie - Interactive Celebration & Photo Studio Engine
 */

(function () {
  'use strict';

  // State Management
  const state = {
    girlName: (localStorage.getItem('birthday_girl_name') && localStorage.getItem('birthday_girl_name') !== 'Cutie')
      ? localStorage.getItem('birthday_girl_name')
      : 'Cute Malkin',
    currentSongIndex: 0,
    musicPlaying: false,
    audioElement: null,
    audioCtx: null,
    musicTimer: null,
    noteIndex: 0,
    candlesExtinguished: [false, false, false],
    cakeCut: false,
    wishesCount: 8,
    // Photo Studio State
    studio: {
      image: null,
      imageSource: 'assets/sample_cutie.jpg',
      zoom: 1.0,
      rotation: 0,
      panX: 0,
      panY: 0,
      isPanning: false,
      panStartX: 0,
      panStartY: 0,
      flipH: false,
      currentFrame: 'none',
      currentFilter: 'none',
      polaroidCaption: "Happy Birthday Cute Malkin! Forever 19 vibes ✨",
      polaroidDate: "Oct 13 • Official 19th Birthday 💕",
      stickers: [],
      activeStickerIndex: -1,
      isDraggingSticker: false,
      dragOffsetX: 0,
      dragOffsetY: 0
    },
    // Scrapbook State
    scrapbook: {
      activeCategory: 'all',
      filteredList: [],
      currentLightboxIndex: 0
    }
  };

  // Render function placeholder, defined in initPhotoStudio
  let renderPhotoStudio = () => {};

  // Sticker Catalog
  const STICKER_DATA = {
    hats: [
      { id: 'h1', text: '🥳', label: 'Party Hat' },
      { id: 'h2', text: '👑', label: 'Tiara' },
      { id: 'h3', text: '👸', label: 'Crown' },
      { id: 'h4', text: '🌸', label: 'Floral Band' },
      { id: 'h5', text: '😇', label: 'Angel Halo' },
      { id: 'h6', text: '🐰', label: 'Bunny Ears' },
      { id: 'h7', text: '🐱', label: 'Cat Ears' },
      { id: 'h8', text: '🎀', label: 'Pink Bow' }
    ],
    kawaii: [
      { id: 'k1', text: '😊', label: 'Rosy Blush' },
      { id: 'k2', text: '💖', label: 'Heart Cheeks' },
      { id: 'k3', text: '🕶️', label: 'Heart Shades' },
      { id: 'k4', text: '💋', label: 'Sweet Kiss' },
      { id: 'k5', text: '🌸', label: 'Blossom' },
      { id: 'k6', text: '🦋', label: 'Butterfly' },
      { id: 'k7', text: '🧸', label: 'Teddy Bear' },
      { id: 'k8', text: '🐱', label: 'Kitten' }
    ],
    sweets: [
      { id: 's1', text: '🎂', label: 'B-Day Cake' },
      { id: 's2', text: '🧁', label: 'Cupcake' },
      { id: 's3', text: '🥂', label: 'Cheers' },
      { id: 's4', text: '🎁', label: 'Gift Box' },
      { id: 's5', text: '🎈', label: 'Balloons' },
      { id: 's6', text: '🍭', label: 'Lollipop' },
      { id: 's7', text: '🍰', label: 'Cake Slice' },
      { id: 's8', text: '🍫', label: 'Choco' }
    ],
    sparkles: [
      { id: 'sp1', text: '✨', label: 'Sparkles' },
      { id: 'sp2', text: '⭐', label: 'Star' },
      { id: 'sp3', text: '🪄', label: 'Magic Wand' },
      { id: 'sp4', text: '💖', label: 'Sparkle Heart' },
      { id: 'sp5', text: '🌈', label: 'Rainbow' },
      { id: 'sp6', text: '🎆', label: 'Fireworks' },
      { id: 'sp7', text: '💎', label: 'Diamond' },
      { id: 'sp8', text: '🌟', label: 'Glow Star' }
    ],
    badges: [
      { id: 'b1', text: '👑 BIRTHDAY QUEEN 👑', isBadge: true, label: 'Queen' },
      { id: 'b2', text: '💕 100% CUTIE 💕', isBadge: true, label: '100% Cutie' },
      { id: 'b3', text: '🌸 PRINCESS VIBES 🌸', isBadge: true, label: 'Princess' },
      { id: 'b4', text: '✨ MAIN CHARACTER ✨', isBadge: true, label: 'Main Vibe' },
      { id: 'b5', text: '😍 CUTEST SMILE EVER 😍', isBadge: true, label: 'Smile' },
      { id: 'b6', text: '🎂 HAPPY BIRTHDAY SWEETHEART 🎂', isBadge: true, label: 'Birthday' }
    ]
  };

  /* ==========================================================================
     1. Web Audio API Music Box & Sound Effects
     ========================================================================== */
  function getAudioContext() {
    if (!state.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new AudioCtxClass();
    }
    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  // Play a soft bell/music box chime note
  function playTone(freq, duration = 0.5, type = 'sine', gainVal = 0.2) {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be blocked prior to user interaction
    }
  }

  // Sound effects
  const soundFx = {
    pop() {
      playTone(520, 0.12, 'sine', 0.25);
    },
    chime() {
      [587.33, 739.99, 880, 1174.66].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.45, 'triangle', 0.2), i * 80);
      });
    },
    blow() {
      // Warm whoosh sound
      try {
        const ctx = getAudioContext();
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } catch (e) {}
    },
    fanfare() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => {
        setTimeout(() => playTone(f, 0.5, 'triangle', 0.25), i * 110);
      });
    },
    shutter() {
      playTone(900, 0.05, 'square', 0.2);
      setTimeout(() => playTone(450, 0.12, 'triangle', 0.25), 80);
    }
  };

  // Sweet gentle "Happy Birthday" music-box melody generator
  const bdayMelody = [
    { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 },
    { f: 349.23, d: 0.7 }, { f: 329.63, d: 1.2 },
    { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 },
    { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.2 },
    { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 523.25, d: 0.7 }, { f: 440.00, d: 0.7 },
    { f: 349.23, d: 0.7 }, { f: 329.63, d: 0.7 }, { f: 293.66, d: 1.0 },
    { f: 466.16, d: 0.35 }, { f: 466.16, d: 0.35 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 },
    { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.4 }
  ];

  /* Real Jukebox Audio Player System (10 Romantic Hindi & Acoustic MP3 Songs) */
  function initAudioPlayer() {
    state.audioElement = document.getElementById('bg-music-player');
    const playlist = window.MALKIN_PLAYLIST || [];
    if (!state.audioElement || playlist.length === 0) return;

    state.audioElement.src = playlist[state.currentSongIndex].src;
    state.audioElement.volume = 0.75;

    state.audioElement.addEventListener('ended', () => {
      nextSong();
    });
    state.audioElement.addEventListener('play', () => document.body.classList.add('music-playing'));
    state.audioElement.addEventListener('pause', () => document.body.classList.remove('music-playing'));

    updateMusicUI();
  }

  function playSong(index) {
    const playlist = window.MALKIN_PLAYLIST || [];
    if (!playlist.length || !state.audioElement) return;

    state.currentSongIndex = (index + playlist.length) % playlist.length;
    state.audioElement.src = playlist[state.currentSongIndex].src;
    state.audioElement.play().then(() => {
      state.musicPlaying = true;
      updateMusicUI();
    }).catch(err => {
      console.log('User interaction required to start music playback:', err);
    });
  }

  function toggleMusic(forceState) {
    const playlist = window.MALKIN_PLAYLIST || [];
    if (!state.audioElement && document.getElementById('bg-music-player')) {
      initAudioPlayer();
    }
    if (!state.audioElement) return;

    if (forceState !== undefined) {
      state.musicPlaying = forceState;
    } else {
      state.musicPlaying = !state.musicPlaying;
    }

    if (state.musicPlaying) {
      if (!state.audioElement.src || state.audioElement.src === window.location.href) {
        if (playlist.length > 0) state.audioElement.src = playlist[state.currentSongIndex].src;
      }
      state.audioElement.play().then(() => {
        updateMusicUI();
      }).catch(err => {
        console.log('Audio autoplay prevented:', err);
      });
    } else {
      state.audioElement.pause();
      updateMusicUI();
    }
  }

  function nextSong() {
    playSong(state.currentSongIndex + 1);
  }

  function prevSong() {
    playSong(state.currentSongIndex - 1);
  }

  function playPageSong(stepNum) {
    const pageTracks = [0, 1, 3, 2, 4, 5, 6];
    playSong(pageTracks[(stepNum - 1 + pageTracks.length) % pageTracks.length]);
  }

  function updateMusicUI() {
    const playlist = window.MALKIN_PLAYLIST || [];
    const currentTrack = playlist[state.currentSongIndex] || { title: 'Pal Pal Har Pal' };

    const titleEl = document.getElementById('music-track-title');
    const btn = document.getElementById('music-toggle-btn');
    if (titleEl) titleEl.textContent = currentTrack.title;

    if (btn) {
      if (state.musicPlaying) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }

    document.querySelectorAll('.playlist-track-row').forEach((row, idx) => {
      if (idx === state.currentSongIndex) {
        row.classList.add('is-active');
        const badge = row.querySelector('.track-play-badge');
        if (badge) badge.textContent = state.musicPlaying ? '▶ Playing' : '⏸ Paused';
      } else {
        row.classList.remove('is-active');
        const badge = row.querySelector('.track-play-badge');
        if (badge) badge.textContent = 'Tap to Play';
      }
    });
  }

  /* ==========================================================================
     2. Confetti & Particle Explosion
     ========================================================================== */
  function fireConfetti(originX = window.innerWidth / 2, originY = window.innerHeight / 2, count = 70) {
    const container = document.getElementById('particle-container');
    const colors = ['#f43f5e', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#38bdf8', '#fb7185', '#fef08a'];
    const emojis = ['💖', '✨', '🎀', '🌸', '⭐', '🎉'];

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      const isEmoji = Math.random() > 0.65;

      piece.style.position = 'fixed';
      piece.style.left = `${originX}px`;
      piece.style.top = `${originY}px`;
      piece.style.pointerEvents = 'none';
      piece.style.zIndex = '9999';

      if (isEmoji) {
        piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        piece.style.fontSize = `${Math.random() * 16 + 14}px`;
      } else {
        piece.style.width = `${Math.random() * 10 + 6}px`;
        piece.style.height = `${Math.random() * 14 + 8}px`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      }

      container.appendChild(piece);

      // Random flight velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 450 + 150;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 150; // upward bias

      const rotationSpeed = (Math.random() - 0.5) * 720;
      const startTime = performance.now();
      const lifeTime = Math.random() * 1200 + 1000;

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = elapsed / lifeTime;

        if (progress >= 1) {
          piece.remove();
          return;
        }

        const t = progress;
        const currentX = originX + vx * t;
        const currentY = originY + vy * t + 0.5 * 800 * t * t; // gravity
        const rot = rotationSpeed * t;
        const opacity = 1 - t;

        piece.style.transform = `translate(${currentX - originX}px, ${currentY - originY}px) rotate(${rot}deg)`;
        piece.style.opacity = opacity;

        requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    }
  }

  /* ==========================================================================
     3. Ambient Canvas (Floating Soft Hearts & Sparkles in Background)
     ========================================================================== */
  function initAmbientCanvas() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 28;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 14 + 10,
        speedY: -(Math.random() * 0.4 + 0.2),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.2,
        char: Math.random() > 0.5 ? '💖' : Math.random() > 0.5 ? '✨' : '🌸'
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -30) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px sans-serif`;
        ctx.fillText(p.char, p.x, p.y);
      });

      requestAnimationFrame(render);
    }

    render();
  }

  /* ==========================================================================
     4. Personalization & Name Updates
     ========================================================================== */
  function updateGirlName(name) {
    if (!name || !name.trim() || name.trim() === 'Cutie') {
      name = 'Cute Malkin';
    }
    state.girlName = name.trim();
    try {
      localStorage.setItem('birthday_girl_name', state.girlName);
    } catch (e) {}

    // Update all elements with class .birthday-girl-name
    document.querySelectorAll('.birthday-girl-name').forEach((el) => {
      el.textContent = state.girlName;
    });

    const btnDisplay = document.getElementById('btn-name-display');
    if (btnDisplay) btnDisplay.textContent = state.girlName;

    // Update polaroid caption default if still contains previous name
    const polaroidInput = document.getElementById('polaroid-text-input');
    if (polaroidInput && !polaroidInput.dataset.userEdited) {
      polaroidInput.value = `Happy Birthday ${state.girlName}! Forever 19 vibes ✨`;
      state.studio.polaroidCaption = polaroidInput.value;
      if (typeof renderPhotoStudio === 'function') {
        renderPhotoStudio();
      }
    }
  }

  /* ==========================================================================
     5. Gatekeeper Modal (Interactive Entrance Surprise)
     ========================================================================== */
  function setupGatekeeper() {
    const modal = document.getElementById('gatekeeper-modal');
    const yesBtn = document.getElementById('gate-yes-btn');
    const noBtn = document.getElementById('gate-no-btn');
    const retryBtn = document.getElementById('gate-retry-btn');
    const btnGroup = document.getElementById('gate-btn-group');
    const rejectionBox = document.getElementById('gate-rejection');
    const questionText = document.getElementById('gate-question-text');

    if (!modal) return;

    if (yesBtn) {
      yesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try { soundFx.fanfare(); } catch (err) {}
        try { fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 90); } catch (err) {}
        modal.classList.add('hidden');
        try { playPageSong(1); } catch (err) {}
      });
    }

    if (noBtn) {
      noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try { soundFx.pop(); } catch (err) {}
        if (btnGroup) btnGroup.classList.add('hidden');
        if (questionText) questionText.classList.add('hidden');
        if (rejectionBox) rejectionBox.classList.remove('hidden');
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try { soundFx.fanfare(); } catch (err) {}
        try { fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 90); } catch (err) {}
        modal.classList.add('hidden');
        try { playPageSong(1); } catch (err) {}
      });
    }
  }

  /* ==========================================================================
     6. Section 1: Cake Ceremony & Candle Blowing
     ========================================================================== */
  function setupCakeCeremony() {
    const blowBtn = document.getElementById('blow-candles-btn');
    const cutBtn = document.getElementById('cut-cake-btn');
    const relightBtn = document.getElementById('relight-btn');
    const celebrationBox = document.getElementById('celebration-box');
    const cakeSliceCut = document.getElementById('cake-slice-cut');
    const instructionText = document.getElementById('cake-instruction-text');
    const candleRack = document.querySelector('.candles-rack');

    // Malkin Birthday Celebration Popup Elements
    const malkinModal = document.getElementById('malkin-bday-modal');
    const closeMalkinBtn = document.getElementById('close-malkin-modal-btn');
    const proceedMalkinBtn = document.getElementById('malkin-proceed-btn');

    function openMalkinModal() {
      if (!malkinModal) return;
      malkinModal.classList.remove('hidden');
      try { soundFx.fanfare(); } catch (err) {}
      try { fireConfetti(window.innerWidth / 2, window.innerHeight * 0.45, 95); } catch (err) {}
    }

    function closeMalkinModal() {
      if (malkinModal) malkinModal.classList.add('hidden');
    }

    if (closeMalkinBtn) {
      closeMalkinBtn.addEventListener('click', closeMalkinModal);
    }

    if (proceedMalkinBtn) {
      proceedMalkinBtn.addEventListener('click', () => {
        closeMalkinModal();
        try { soundFx.pop(); } catch (err) {}
        if (cutBtn && !cutBtn.disabled) {
          cutBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          cutBtn.classList.add('pulse-btn');
        }
      });
    }

    if (malkinModal) {
      malkinModal.addEventListener('click', (e) => {
        if (e.target === malkinModal) closeMalkinModal();
      });
    }

    function extinguishCandle(index) {
      state.candlesExtinguished[index] = true;
      const flame = document.getElementById(`flame-${index + 1}`);
      if (flame) flame.classList.add('extinguished');

      const candle = document.querySelector(`.candle-${index + 1}`);
      if (candle) {
        candle.classList.add('is-extinguished');
        // Smoke puff animation
        const puff = document.createElement('div');
        puff.className = 'smoke-puff';
        candle.appendChild(puff);
        setTimeout(() => puff.remove(), 1500);
      }

      checkAllCandlesBlown();
    }

    function checkAllCandlesBlown() {
      const allBlown = state.candlesExtinguished.every(Boolean);
      if (allBlown) {
        soundFx.blow();
        setTimeout(soundFx.fanfare, 300);
        fireConfetti(window.innerWidth / 2, window.innerHeight * 0.45, 90);

        instructionText.textContent = `All candles blown! 🥳 Happiest 19th Birthday Cute Malkin! Now cut your special cake! 🍰✨`;
        blowBtn.disabled = true;
        cutBtn.disabled = false;
        celebrationBox.classList.remove('hidden');

        // Trigger Happiest Birthday Malkin Celebration Popup Modal!
        setTimeout(() => {
          openMalkinModal();
        }, 1200);
      }
    }

    // Individual candle clicks
    document.querySelectorAll('.candle').forEach((c, idx) => {
      c.addEventListener('click', () => {
        if (!state.candlesExtinguished[idx]) {
          soundFx.pop();
          extinguishCandle(idx);
        }
      });
    });

    // "Blow Out The Candles!" button
    blowBtn.addEventListener('click', () => {
      state.candlesExtinguished.forEach((blown, idx) => {
        if (!blown) setTimeout(() => extinguishCandle(idx), idx * 120);
      });
    });

    // Cake Cutting Button
    cutBtn.addEventListener('click', () => {
      soundFx.chime();
      fireConfetti(window.innerWidth / 2, window.innerHeight * 0.5, 75);
      cakeSliceCut.classList.remove('hidden');
      startFireworksCelebration();
      instructionText.textContent = 'Cake cut! Happy Birthday, Cute Malkin! Enjoy your birthday fireworks below!';
      cutBtn.disabled = true;
      cutBtn.classList.remove('pulse-btn');

      const nextLetterBtn = document.getElementById('cake-next-step-btn');
      if (nextLetterBtn) {
        nextLetterBtn.classList.add('pulse-btn');
        setTimeout(() => {
          nextLetterBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
      }
    });

    // Relight Button
    relightBtn.addEventListener('click', () => {
      soundFx.pop();
      state.candlesExtinguished = [false, false, false];
      document.querySelectorAll('.flame').forEach((f) => f.classList.remove('extinguished'));
      document.querySelectorAll('.candle').forEach((c) => c.classList.remove('is-extinguished'));
      cakeSliceCut.classList.add('hidden');
      celebrationBox.classList.add('hidden');
      const fwBanner = document.getElementById('fireworks-popup-banner');
      if (fwBanner) fwBanner.classList.add('hidden');
      closeMalkinModal();
      blowBtn.disabled = false;
      cutBtn.disabled = true;
      cutBtn.classList.remove('pulse-btn');
      instructionText.textContent = 'Candles relit! Make another wish in your heart. ✨';
    });
  }

  // Fireworks Celebration Canvas Engine (User requested: fireworks & pop text)
  function startFireworksCelebration() {
    const banner = document.getElementById('fireworks-popup-banner');
    if (!banner) return;
    banner.classList.remove('hidden');

    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = banner.offsetWidth || 700;
    canvas.height = banner.offsetHeight || 260;

    const particles = [];
    const colors = ['#f43f5e', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#38bdf8', '#fde047', '#fb7185', '#ffffff'];

    function createBurst(x, y) {
      soundFx.pop();
      const count = 45;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.2 - 0.1);
        const speed = Math.random() * 5 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          size: Math.random() * 3.5 + 2
        });
      }
    }

    createBurst(canvas.width * 0.2, canvas.height * 0.45);
    setTimeout(() => createBurst(canvas.width * 0.8, canvas.height * 0.45), 250);
    setTimeout(() => createBurst(canvas.width * 0.5, canvas.height * 0.35), 550);
    setTimeout(() => createBurst(canvas.width * 0.35, canvas.height * 0.55), 1050);
    setTimeout(() => createBurst(canvas.width * 0.65, canvas.height * 0.55), 1550);

    let animId;
    function renderFireworks() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.07;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (particles.length > 0) {
        animId = requestAnimationFrame(renderFireworks);
      }
    }
    renderFireworks();
  }

  /* ==========================================================================
     7. Section 2: GIF Cards Filter & Reactions
     ========================================================================== */
  function setupGifCards() {
    // Filter Pills
    const filterPills = document.querySelectorAll('#gif-filter-pills .pill');
    const cards = document.querySelectorAll('#gif-cards-grid .gif-card');

    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter;

        cards.forEach((card) => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // React Heart Buttons
    document.querySelectorAll('.react-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        soundFx.pop();
        const countSpan = btn.querySelector('.react-count');
        let count = parseInt(countSpan.textContent, 10) || 0;
        countSpan.textContent = count + 1;

        // Floating heart animation over button
        const rect = btn.getBoundingClientRect();
        fireConfetti(rect.left + rect.width / 2, rect.top, 12);
      });
    });

    // Allow clicking GIF media to pop up in lightbox
    document.querySelectorAll('#gif-cards-grid .gif-media-wrapper').forEach((wrap) => {
      wrap.style.cursor = 'pointer';
      wrap.addEventListener('click', (e) => {
        e.stopPropagation();
        const img = wrap.querySelector('img');
        const card = wrap.closest('.gif-card');
        const title = card ? card.querySelector('.card-title')?.textContent : 'Special Moment';
        if (img) {
          soundFx.pop();
          openCustomLightbox(img.src, title);
        }
      });
    });

    // Secret Note Buttons
    const noteModal = document.getElementById('note-modal');
    const noteModalText = document.getElementById('note-modal-text');
    const closeNoteBtn = document.getElementById('close-note-btn');
    const closeNoteModalBtn = document.getElementById('close-note-modal-btn');

    document.querySelectorAll('.read-note-btn').forEach((btn, index) => {
      btn.dataset.songIndex = String(index % (window.MALKIN_PLAYLIST || []).length);
      btn.addEventListener('click', () => {
        noteModalText.textContent = btn.dataset.note;
        const song = (window.MALKIN_PLAYLIST || [])[Number(btn.dataset.songIndex)];
        const songLabel = document.getElementById('note-song-label');
        if (songLabel && song) songLabel.textContent = `Now playing: ${song.title}`;
        noteModal.classList.remove('hidden');
        playSong(Number(btn.dataset.songIndex));
      });
    });

    [closeNoteBtn, closeNoteModalBtn].forEach((btn) => {
      if (btn) btn.addEventListener('click', () => {
        noteModal.classList.add('hidden');
        playPageSong(journey.currentStep);
      });
    });
  }

  /* ==========================================================================
     8. 🌟 CUTIE PHOTO STUDIO & MAGIC WEB EDITOR 🌟
     ========================================================================== */
  function initPhotoStudio() {
    const canvas = document.getElementById('photo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Load initial sample image
    const initialImg = new Image();
    initialImg.crossOrigin = 'anonymous';
    initialImg.onload = () => {
      state.studio.image = initialImg;
      renderPhotoStudio();
    };
    initialImg.onerror = () => {
      ctx.fillStyle = '#fff1f2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#9f1239';
      ctx.textAlign = 'center';
      ctx.font = '600 26px Outfit, sans-serif';
      ctx.fillText('Choose a photo to begin', canvas.width / 2, canvas.height / 2);
    };
    initialImg.src = state.studio.imageSource;

    // Render Function
    renderPhotoStudio = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const frameType = state.studio.currentFrame;
      const filterType = state.studio.currentFilter;

      // 1. Determine photo drawable bounding box based on frame
      let photoX = 0, photoY = 0, photoW = canvas.width, photoH = canvas.height;

      if (frameType === 'polaroid') {
        photoX = 45;
        photoY = 45;
        photoW = canvas.width - 90;
        photoH = canvas.height - 180;
      } else if (frameType === 'heart-glow' || frameType === 'fairy-lights' || frameType === 'kawaii-pink') {
        photoX = 30;
        photoY = 30;
        photoW = canvas.width - 60;
        photoH = canvas.height - 60;
      } else if (frameType === 'vintage-film') {
        photoX = 55;
        photoY = 40;
        photoW = canvas.width - 110;
        photoH = canvas.height - 80;
      } else if (frameType === 'washi-tape') {
        photoX = 35;
        photoY = 35;
        photoW = canvas.width - 70;
        photoH = canvas.height - 70;
      }

      // Draw Base Background for frames like Polaroid
      if (frameType === 'polaroid') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (frameType === 'vintage-film') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Draw Image (with Zoom, Rotation, Pan, Flip, and Filter)
      if (state.studio.image) {
        ctx.save();

        // Clip to photo area
        ctx.beginPath();
        if (frameType === 'heart-glow') {
          // Romantic rounded clip
          ctx.roundRect(photoX, photoY, photoW, photoH, 28);
        } else {
          ctx.rect(photoX, photoY, photoW, photoH);
        }
        ctx.clip();

        // Apply visual filter
        applyFilterStyle(ctx, filterType);

        // Move to photo center for zoom/pan/rotate
        const centerX = photoX + photoW / 2 + state.studio.panX;
        const centerY = photoY + photoH / 2 + state.studio.panY;
        ctx.translate(centerX, centerY);

        const songBpm = [92, 104, 88, 112, 96, 108, 84, 100, 116, 90][state.currentSongIndex] || 96;
        const songTime = state.audioElement ? state.audioElement.currentTime : 0;
        const beat = state.musicPlaying ? Math.max(0, Math.sin(songTime * songBpm * Math.PI / 30)) : 0;
        const motionScale = 1 + beat * 0.035;
        ctx.translate(Math.sin(songTime * 1.1) * beat * 8, Math.cos(songTime * 0.8) * beat * 6);

        ctx.rotate((state.studio.rotation * Math.PI) / 180);
        ctx.scale(
          state.studio.zoom * motionScale * (state.studio.flipH ? -1 : 1),
          state.studio.zoom * motionScale
        );

        // Calculate aspect fill
        const img = state.studio.image;
        const imgRatio = img.width / img.height;
        const targetRatio = photoW / photoH;
        let drawW, drawH;

        if (imgRatio > targetRatio) {
          drawW = photoW * 0.9;
          drawH = drawW / imgRatio;
        } else {
          drawH = photoH * 0.9;
          drawW = drawH * imgRatio;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

        // Draw filter overlay color washes
        applyFilterOverlay(ctx, filterType, -drawW / 2, -drawH / 2, drawW, drawH);

        ctx.restore();
      }

      // 3. Draw Aesthetic Frame Overlays & Details
      drawFrameOverlay(ctx, frameType, photoX, photoY, photoW, photoH);

      // 4. Draw Stickers
      state.studio.stickers.forEach((sticker, index) => {
        drawSticker(ctx, sticker, index === state.studio.activeStickerIndex);
      });
    }

    // Helper: Filter styles
    function applyFilterStyle(context, filter) {
      if (filter === 'bw-romance') {
        context.filter = 'grayscale(100%) contrast(115%) brightness(105%)';
      } else if (filter === 'vintage-warm') {
        context.filter = 'sepia(40%) contrast(105%) saturate(110%)';
      } else if (filter === 'golden-hour') {
        context.filter = 'saturate(130%) contrast(105%) brightness(105%)';
      } else if (filter === 'kawaii-blush') {
        context.filter = 'brightness(108%) saturate(125%) contrast(102%)';
      } else if (filter === 'dreamy-soft') {
        context.filter = 'contrast(95%) brightness(112%) saturate(115%)';
      } else if (filter === 'pop-pastel') {
        context.filter = 'saturate(150%) contrast(110%)';
      } else {
        context.filter = 'none';
      }
    }

    function applyFilterOverlay(context, filter, x, y, w, h) {
      if (filter === 'kawaii-blush') {
        context.fillStyle = 'rgba(244, 63, 94, 0.12)';
        context.fillRect(x, y, w, h);
      } else if (filter === 'golden-hour') {
        context.fillStyle = 'rgba(245, 158, 11, 0.15)';
        context.fillRect(x, y, w, h);
      } else if (filter === 'dreamy-soft') {
        context.fillStyle = 'rgba(236, 72, 153, 0.08)';
        context.fillRect(x, y, w, h);
      }
    }

    // Helper: Draw Frame Overlays
    function drawFrameOverlay(context, frame, px, py, pw, ph) {
      context.save();

      if (frame === 'polaroid') {
        // Inner border shadow
        context.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        context.lineWidth = 1.5;
        context.strokeRect(px, py, pw, ph);

        // Handwritten bottom text
        context.font = "bold 32px 'Caveat', cursive";
        context.fillStyle = '#1f2937';
        context.textAlign = 'center';
        context.fillText(state.studio.polaroidCaption, canvas.width / 2, canvas.height - 85);

        // Date stamp
        context.font = "20px 'Nunito', sans-serif";
        context.fillStyle = '#db2777';
        context.fillText(state.studio.polaroidDate, canvas.width / 2, canvas.height - 45);
      } else if (frame === 'heart-glow') {
        // Glowing heart vignette and roses
        context.strokeStyle = '#fda4af';
        context.lineWidth = 8;
        context.strokeRect(px, py, pw, ph);

        // Corner hearts
        context.font = '36px sans-serif';
        context.fillText('💖', px + 15, py + 45);
        context.fillText('💖', px + pw - 50, py + 45);
        context.fillText('🌸', px + 15, py + ph - 15);
        context.fillText('🌸', px + pw - 50, py + ph - 15);
      } else if (frame === 'fairy-lights') {
        // Garland wire and glowing lights
        context.beginPath();
        context.moveTo(0, 30);
        context.quadraticCurveTo(canvas.width / 2, 60, canvas.width, 30);
        context.strokeStyle = '#f59e0b';
        context.lineWidth = 2.5;
        context.setLineDash([4, 4]);
        context.stroke();
        context.setLineDash([]);

        // Twinkle stars in corners
        context.font = '32px sans-serif';
        context.fillText('✨', 35, 60);
        context.fillText('⭐', canvas.width / 2 - 15, 75);
        context.fillText('✨', canvas.width - 65, 60);
        context.fillText('🌟', 35, canvas.height - 45);
        context.fillText('🌟', canvas.width - 65, canvas.height - 45);

        // Delicate golden frame
        context.strokeStyle = '#fde047';
        context.lineWidth = 6;
        context.strokeRect(px, py, pw, ph);
      } else if (frame === 'kawaii-pink') {
        // Scalloped / ribbon border
        context.strokeStyle = '#f472b6';
        context.lineWidth = 10;
        context.strokeRect(px, py, pw, ph);

        // Corner ribbons
        context.font = '38px sans-serif';
        context.fillText('🎀', px + 5, py + 40);
        context.fillText('🎀', px + pw - 45, py + 40);
        context.fillText('🎀', px + 5, py + ph - 5);
        context.fillText('🎀', px + pw - 45, py + ph - 5);
      } else if (frame === 'vintage-film') {
        // Filmstrip perforations
        context.fillStyle = '#ffffff';
        for (let y = 50; y < canvas.height - 50; y += 45) {
          context.fillRect(15, y, 20, 25);
          context.fillRect(canvas.width - 35, y, 20, 25);
        }
      } else if (frame === 'washi-tape') {
        // Pastel washi tape strips across corners
        context.save();
        context.fillStyle = 'rgba(254, 215, 170, 0.85)';
        context.translate(60, 40);
        context.rotate((-15 * Math.PI) / 180);
        context.fillRect(-50, -12, 100, 24);
        context.restore();

        context.save();
        context.fillStyle = 'rgba(244, 114, 182, 0.85)';
        context.translate(canvas.width - 60, 40);
        context.rotate((15 * Math.PI) / 180);
        context.fillRect(-50, -12, 100, 24);
        context.restore();
      }

      context.restore();
    }

    // Helper: Draw Individual Sticker
    function drawSticker(context, sticker, isSelected) {
      context.save();
      context.translate(sticker.x, sticker.y);
      context.rotate((sticker.rotation * Math.PI) / 180);
      context.scale(sticker.scale, sticker.scale);

      if (sticker.isBadge) {
        // Render custom badge with cute background and border
        context.font = "bold 26px 'Outfit', sans-serif";
        const metrics = context.measureText(sticker.text);
        const w = metrics.width + 36;
        const h = 50;

        context.fillStyle = 'rgba(255, 255, 255, 0.95)';
        context.beginPath();
        context.roundRect(-w / 2, -h / 2, w, h, 25);
        context.fill();

        context.strokeStyle = '#f43f5e';
        context.lineWidth = 3;
        context.stroke();

        context.fillStyle = '#e11d48';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(sticker.text, 0, 0);

        sticker.boundingW = w;
        sticker.boundingH = h;
      } else if (sticker.isText) {
        // Custom text element
        context.font = `bold ${sticker.fontSize || 38}px ${sticker.fontFamily || "'Caveat', cursive"}`;
        const metrics = context.measureText(sticker.text);
        const w = metrics.width + 20;
        const h = (sticker.fontSize || 38) + 20;

        context.fillStyle = sticker.color || '#ec4899';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = 'rgba(255, 255, 255, 0.9)';
        context.shadowBlur = 8;
        context.fillText(sticker.text, 0, 0);

        sticker.boundingW = w;
        sticker.boundingH = h;
      } else {
        // Standard emoji/prop sticker
        const size = sticker.size || 64;
        context.font = `${size}px sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(sticker.text, 0, 0);

        sticker.boundingW = size;
        sticker.boundingH = size;
      }

      // Draw selection boundary if active
      if (isSelected) {
        const sw = (sticker.boundingW || 60) + 16;
        const sh = (sticker.boundingH || 60) + 16;
        context.strokeStyle = '#f43f5e';
        context.lineWidth = 2;
        context.setLineDash([6, 4]);
        context.strokeRect(-sw / 2, -sh / 2, sw, sh);
        context.setLineDash([]);

        // Small corner circles
        context.fillStyle = '#f43f5e';
        context.fillRect(-sw / 2 - 4, -sh / 2 - 4, 8, 8);
        context.fillRect(sw / 2 - 4, -sh / 2 - 4, 8, 8);
        context.fillRect(-sw / 2 - 4, sh / 2 - 4, 8, 8);
        context.fillRect(sw / 2 - 4, sh / 2 - 4, 8, 8);
      }

      context.restore();
    }

    // Populate Stickers Tray
    function populateStickers(category = 'hats') {
      const tray = document.getElementById('stickers-tray');
      if (!tray) return;
      tray.innerHTML = '';

      const items = STICKER_DATA[category] || STICKER_DATA.hats;
      items.forEach((item) => {
        const btn = document.createElement('button');
        btn.className = 'sticker-item-btn';
        btn.innerHTML = `<span>${item.text}</span><span class="sticker-item-label">${item.label}</span>`;
        btn.addEventListener('click', () => {
          soundFx.pop();
          addStickerToCanvas(item);
        });
        tray.appendChild(btn);
      });
    }

    // Add Sticker to Canvas
    function addStickerToCanvas(item) {
      const newSticker = {
        text: item.text,
        label: item.label,
        isBadge: !!item.isBadge,
        x: canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height / 2 + (Math.random() - 0.5) * 80,
        scale: 1.0,
        rotation: 0,
        size: item.isBadge ? null : 64
      };
      state.studio.stickers.push(newSticker);
      state.studio.activeStickerIndex = state.studio.stickers.length - 1;
      updateActiveStickerControls();
      renderPhotoStudio();
    }

    // Update tuning sliders for active sticker
    function updateActiveStickerControls() {
      const activeBox = document.getElementById('sticker-tuning-box');
      const nameDisplay = document.getElementById('active-sticker-name');
      const sizeSlider = document.getElementById('sticker-size-slider');
      const rotateSlider = document.getElementById('sticker-rotate-slider');
      const sizeVal = document.getElementById('sticker-size-val');
      const rotateVal = document.getElementById('sticker-rotate-val');

      if (state.studio.activeStickerIndex >= 0 && state.studio.activeStickerIndex < state.studio.stickers.length) {
        const active = state.studio.stickers[state.studio.activeStickerIndex];
        nameDisplay.textContent = active.label || active.text;
        sizeSlider.value = Math.round(active.scale * 100);
        sizeVal.textContent = `${Math.round(active.scale * 100)}%`;
        rotateSlider.value = active.rotation;
        rotateVal.textContent = `${active.rotation}°`;
      } else {
        nameDisplay.textContent = 'None (tap a sticker on canvas)';
      }
    }

    // Handle File Upload
    const fileInput = document.getElementById('photo-upload-input');
    const dropzone = document.getElementById('upload-dropzone');

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          state.studio.image = img;
          state.studio.zoom = 1.0;
          state.studio.rotation = 0;
          state.studio.panX = 0;
          state.studio.panY = 0;
          document.getElementById('zoom-slider').value = 100;
          document.getElementById('zoom-val').textContent = '100%';
          document.getElementById('rotate-slider').value = 0;
          document.getElementById('rotate-val').textContent = '0°';
          soundFx.chime();
          renderPhotoStudio();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
      });
    }

    if (dropzone) {
      ['dragenter', 'dragover'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
      });
    }

    // Load Sample Birthday Girl Photo
    const sampleBtn = document.getElementById('load-sample-photo-btn');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => {
        soundFx.pop();
        const img = new Image();
        img.onload = () => {
          state.studio.image = img;
          renderPhotoStudio();
        };
        img.src = 'assets/sample_cutie.jpg';
      });
    }

    // Populate Quick Album Picker with Cute Malkin's Real Photos
    const albumStrip = document.getElementById('studio-album-thumbnails');
    if (albumStrip && window.MALKIN_MEMORIES) {
      albumStrip.innerHTML = '';
      const imageMemories = window.MALKIN_MEMORIES.filter(m => m.type === 'image');
      imageMemories.forEach((mem, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = 'album-thumb-btn';
        thumbBtn.title = mem.title;
        thumbBtn.innerHTML = `<img src="${mem.src}" alt="${mem.title}" loading="lazy">`;
        thumbBtn.querySelector('img').addEventListener('error', () => thumbBtn.remove());

        thumbBtn.addEventListener('click', () => {
          soundFx.pop();
          document.querySelectorAll('.album-thumb-btn').forEach(b => b.classList.remove('active'));
          thumbBtn.classList.add('active');

          state.studio.imageSource = mem.src;
          state.studio.zoom = 1.0;
          state.studio.rotation = 0;
          state.studio.panX = 0;
          state.studio.panY = 0;
          state.studio.flipH = false;
          const zSlider = document.getElementById('zoom-slider');
          const zVal = document.getElementById('zoom-val');
          const rSlider = document.getElementById('rotate-slider');
          const rVal = document.getElementById('rotate-val');
          if (zSlider) zSlider.value = 100;
          if (zVal) zVal.textContent = '100%';
          if (rSlider) rSlider.value = 0;
          if (rVal) rVal.textContent = '0°';

          const img = new Image();
          img.onload = () => {
            state.studio.image = img;
            renderPhotoStudio();
          };
          img.onerror = () => {
            thumbBtn.remove();
          };
          img.src = mem.src;
        });

        albumStrip.appendChild(thumbBtn);
      });
    }

    // Sliders: Zoom, Rotate
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomVal = document.getElementById('zoom-val');
    zoomSlider.addEventListener('input', (e) => {
      state.studio.zoom = parseFloat(e.target.value) / 100;
      zoomVal.textContent = `${e.target.value}%`;
      renderPhotoStudio();
    });

    const rotateSlider = document.getElementById('rotate-slider');
    const rotateVal = document.getElementById('rotate-val');
    rotateSlider.addEventListener('input', (e) => {
      state.studio.rotation = parseInt(e.target.value, 10);
      rotateVal.textContent = `${e.target.value}°`;
      renderPhotoStudio();
    });

    document.getElementById('center-photo-btn').addEventListener('click', () => {
      soundFx.pop();
      state.studio.panX = 0;
      state.studio.panY = 0;
      state.studio.zoom = 1.0;
      state.studio.rotation = 0;
      zoomSlider.value = 100;
      zoomVal.textContent = '100%';
      rotateSlider.value = 0;
      rotateVal.textContent = '0°';
      renderPhotoStudio();
    });

    document.getElementById('flip-h-btn').addEventListener('click', () => {
      soundFx.pop();
      state.studio.flipH = !state.studio.flipH;
      renderPhotoStudio();
    });

    // Frame Buttons
    document.querySelectorAll('#frame-selector .frame-opt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFx.pop();
        document.querySelectorAll('#frame-selector .frame-opt-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.studio.currentFrame = btn.dataset.frame;

        const polaroidCaptionBox = document.getElementById('polaroid-caption-settings');
        if (state.studio.currentFrame === 'polaroid') {
          polaroidCaptionBox.classList.remove('hidden');
        } else {
          polaroidCaptionBox.classList.add('hidden');
        }

        renderPhotoStudio();
      });
    });

    // Polaroid Text Input
    const polaroidTextInput = document.getElementById('polaroid-text-input');
    const polaroidDateInput = document.getElementById('polaroid-date-input');

    polaroidTextInput.addEventListener('input', (e) => {
      polaroidTextInput.dataset.userEdited = 'true';
      state.studio.polaroidCaption = e.target.value;
      renderPhotoStudio();
    });

    polaroidDateInput.addEventListener('input', (e) => {
      state.studio.polaroidDate = e.target.value;
      renderPhotoStudio();
    });

    // Filters Buttons
    document.querySelectorAll('#filter-selector .filter-opt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFx.pop();
        document.querySelectorAll('#filter-selector .filter-opt-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.studio.currentFilter = btn.dataset.filter;
        renderPhotoStudio();
      });
    });

    // Sticker Category Tabs
    document.querySelectorAll('.sticker-subcategories .subcat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFx.pop();
        document.querySelectorAll('.sticker-subcategories .subcat-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        populateStickers(btn.dataset.subcat);
      });
    });

    // Active Sticker Controls
    document.getElementById('sticker-size-slider').addEventListener('input', (e) => {
      if (state.studio.activeStickerIndex >= 0) {
        const val = parseFloat(e.target.value) / 100;
        state.studio.stickers[state.studio.activeStickerIndex].scale = val;
        document.getElementById('sticker-size-val').textContent = `${e.target.value}%`;
        renderPhotoStudio();
      }
    });

    document.getElementById('sticker-rotate-slider').addEventListener('input', (e) => {
      if (state.studio.activeStickerIndex >= 0) {
        const val = parseInt(e.target.value, 10);
        state.studio.stickers[state.studio.activeStickerIndex].rotation = val;
        document.getElementById('sticker-rotate-val').textContent = `${val}°`;
        renderPhotoStudio();
      }
    });

    document.getElementById('delete-active-sticker-btn').addEventListener('click', () => {
      if (state.studio.activeStickerIndex >= 0) {
        soundFx.pop();
        state.studio.stickers.splice(state.studio.activeStickerIndex, 1);
        state.studio.activeStickerIndex = -1;
        updateActiveStickerControls();
        renderPhotoStudio();
      }
    });

    // Add Custom Text Stamp
    document.getElementById('add-text-to-canvas-btn').addEventListener('click', () => {
      const textVal = document.getElementById('custom-text-input').value.trim();
      if (!textVal) return;

      const fontChoice = document.getElementById('font-choice-select').value;
      const colorVal = document.getElementById('text-color-picker').value;

      soundFx.pop();
      const newTextSticker = {
        text: textVal,
        label: textVal,
        isText: true,
        fontFamily: fontChoice,
        fontSize: 38,
        color: colorVal,
        x: canvas.width / 2,
        y: canvas.height / 2,
        scale: 1.0,
        rotation: 0
      };

      state.studio.stickers.push(newTextSticker);
      state.studio.activeStickerIndex = state.studio.stickers.length - 1;
      updateActiveStickerControls();
      renderPhotoStudio();
    });

    // Quick Canvas Toolbar
    document.getElementById('undo-sticker-btn').addEventListener('click', () => {
      if (state.studio.stickers.length > 0) {
        soundFx.pop();
        state.studio.stickers.pop();
        state.studio.activeStickerIndex = state.studio.stickers.length - 1;
        updateActiveStickerControls();
        renderPhotoStudio();
      }
    });

    document.getElementById('clear-stickers-btn').addEventListener('click', () => {
      if (state.studio.stickers.length > 0) {
        soundFx.pop();
        state.studio.stickers = [];
        state.studio.activeStickerIndex = -1;
        updateActiveStickerControls();
        renderPhotoStudio();
      }
    });

    document.getElementById('reset-canvas-btn').addEventListener('click', () => {
      soundFx.pop();
      state.studio.stickers = [];
      state.studio.activeStickerIndex = -1;
      state.studio.zoom = 1.0;
      state.studio.rotation = 0;
      state.studio.panX = 0;
      state.studio.panY = 0;
      state.studio.currentFrame = 'none';
      state.studio.currentFilter = 'none';
      document.querySelectorAll('#frame-selector .frame-opt-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.frame === 'none');
      });
      document.getElementById('polaroid-caption-settings').classList.add('hidden');
      zoomSlider.value = 100;
      zoomVal.textContent = '100%';
      rotateSlider.value = 0;
      rotateVal.textContent = '0°';
      updateActiveStickerControls();
      renderPhotoStudio();
    });

    // Canvas Pointer Events: Dragging Stickers & Panning Photo
    function getCanvasCoordinates(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function checkStickerHit(coords) {
      // Check from top-most sticker down
      for (let i = state.studio.stickers.length - 1; i >= 0; i--) {
        const s = state.studio.stickers[i];
        const halfW = ((s.boundingW || 60) * s.scale) / 2 + 10;
        const halfH = ((s.boundingH || 60) * s.scale) / 2 + 10;

        if (
          coords.x >= s.x - halfW &&
          coords.x <= s.x + halfW &&
          coords.y >= s.y - halfH &&
          coords.y <= s.y + halfH
        ) {
          return i;
        }
      }
      return -1;
    }

    function handlePointerDown(e) {
      const coords = getCanvasCoordinates(e);
      const hitIndex = checkStickerHit(coords);

      if (hitIndex !== -1) {
        state.studio.activeStickerIndex = hitIndex;
        state.studio.isDraggingSticker = true;
        state.studio.dragOffsetX = coords.x - state.studio.stickers[hitIndex].x;
        state.studio.dragOffsetY = coords.y - state.studio.stickers[hitIndex].y;
        updateActiveStickerControls();
        renderPhotoStudio();
      } else {
        // If clicked outside, deselect sticker and start panning photo
        state.studio.activeStickerIndex = -1;
        state.studio.isPanning = true;
        state.studio.panStartX = coords.x - state.studio.panX;
        state.studio.panStartY = coords.y - state.studio.panY;
        updateActiveStickerControls();
        renderPhotoStudio();
      }
    }

    function handlePointerMove(e) {
      if (!state.studio.isDraggingSticker && !state.studio.isPanning) return;
      e.preventDefault();
      const coords = getCanvasCoordinates(e);

      if (state.studio.isDraggingSticker && state.studio.activeStickerIndex >= 0) {
        const active = state.studio.stickers[state.studio.activeStickerIndex];
        active.x = coords.x - state.studio.dragOffsetX;
        active.y = coords.y - state.studio.dragOffsetY;
        renderPhotoStudio();
      } else if (state.studio.isPanning) {
        state.studio.panX = coords.x - state.studio.panStartX;
        state.studio.panY = coords.y - state.studio.panStartY;
        renderPhotoStudio();
      }
    }

    function handlePointerUp() {
      state.studio.isDraggingSticker = false;
      state.studio.isPanning = false;
    }

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    // Initial Stickers Tray Load
    populateStickers('hats');

    // Studio Tabs Navigation
    document.querySelectorAll('.studio-tabs .studio-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFx.pop();
        document.querySelectorAll('.studio-tabs .studio-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.studio-controls-panel .tab-content').forEach((tab) => tab.classList.remove('active'));
        const targetTab = document.getElementById(btn.dataset.tab);
        if (targetTab) targetTab.classList.add('active');
      });
    });

    // DOWNLOAD HIGH-RES PHOTO (PNG)
    document.getElementById('download-photo-btn').addEventListener('click', () => {
      soundFx.shutter();
      // Render without active selection border for pure export
      const prevActive = state.studio.activeStickerIndex;
      state.studio.activeStickerIndex = -1;
      renderPhotoStudio();

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.girlName}_Birthday_Celebration.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        state.studio.activeStickerIndex = prevActive;
        renderPhotoStudio();

        fireConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 60);
      }, 'image/png');
    });

    const musicEditBtn = document.getElementById('record-music-edit-btn');
    if (musicEditBtn) musicEditBtn.addEventListener('click', async () => {
      if (!window.MediaRecorder || !canvas.captureStream || !state.audioElement) {
        alert('Music video export is not supported by this browser. Try the latest Chrome or Edge.');
        return;
      }
      try {
        if (!state.musicPlaying) await playSong(3);
        const videoStream = canvas.captureStream(30);
        const captureAudio = state.audioElement.captureStream || state.audioElement.mozCaptureStream;
        if (!captureAudio) throw new Error('Audio capture is not supported in this browser.');
        const audioStream = captureAudio.call(state.audioElement);
        const editStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioStream.getAudioTracks()
        ]);
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm';
        const recorder = new MediaRecorder(editStream, { mimeType });
        const chunks = [];
        recorder.addEventListener('dataavailable', (event) => {
          if (event.data.size) chunks.push(event.data);
        });
        recorder.addEventListener('stop', () => {
          const url = URL.createObjectURL(new Blob(chunks, { type: mimeType }));
          const link = document.createElement('a');
          link.href = url;
          link.download = `${state.girlName}_Music_Edit.webm`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          videoStream.getTracks().forEach((track) => track.stop());
          musicEditBtn.disabled = false;
          musicEditBtn.innerHTML = '<span>▶</span> Create 12s Music Edit (WebM)';
        }, { once: true });
        musicEditBtn.disabled = true;
        musicEditBtn.textContent = 'Recording your music edit…';
        recorder.start();
        window.setTimeout(() => {
          if (recorder.state === 'recording') recorder.stop();
        }, 12000);
      } catch (error) {
        console.error('Music edit export failed:', error);
        musicEditBtn.disabled = false;
        musicEditBtn.textContent = 'Could not record — try again';
      }
    });

    // PIN TO BIRTHDAY SCRAPBOOK WALL
    document.getElementById('pin-to-scrapbook-btn').addEventListener('click', () => {
      soundFx.chime();
      const prevActive = state.studio.activeStickerIndex;
      state.studio.activeStickerIndex = -1;
      renderPhotoStudio();

      const dataUrl = canvas.toDataURL('image/png');
      state.studio.activeStickerIndex = prevActive;
      renderPhotoStudio();

      addPolaroidToScrapbook(dataUrl, `Cutie Edit • ${state.girlName} 💕`);

      // Switch to scrapbook step (Step 5)
      if (typeof journey !== 'undefined' && journey.goToStep) {
        journey.goToStep(4);
      }
      fireConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 50);
    });
  }

  /* ==========================================================================
     9. Section 4: Scrapbook Wall Dynamic Polaroids & Royal Gallery
     ========================================================================== */
  function addPolaroidToScrapbook(imageSrc, caption = 'Magical Moment ✨') {
    const wallGrid = document.getElementById('scrapbook-wall-grid');
    if (!wallGrid) return;

    const tilts = ['pin-tilt-1', 'pin-tilt-2', 'pin-tilt-3'];
    const randomTilt = tilts[Math.floor(Math.random() * tilts.length)];

    const card = document.createElement('article');
    card.className = `polaroid-pin-card ${randomTilt}`;
    card.innerHTML = `
      <div class="clothes-pin">📌</div>
      <div class="polaroid-media-wrapper">
        <img src="${imageSrc}" alt="${caption}" class="polaroid-img">
      </div>
      <div class="polaroid-card-footer">
        <h4 class="polaroid-title-text">${caption}</h4>
        <p class="polaroid-sub-caption">Added to the Birthday Scrapbook 💕</p>
        <div class="polaroid-actions-row">
          <button class="polaroid-love-btn" title="Send Love to Malkin">
            <span>💖</span> <span class="like-number">50</span>
          </button>
        </div>
      </div>
    `;

    const loveBtn = card.querySelector('.polaroid-love-btn');
    if (loveBtn) {
      loveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundFx.pop();
        const countSpan = loveBtn.querySelector('.like-number');
        let count = parseInt(countSpan.textContent, 10) + 1;
        countSpan.textContent = count;
        const rect = loveBtn.getBoundingClientRect();
        fireConfetti(rect.left + rect.width / 2, rect.top, 20);
      });
    }

    card.addEventListener('click', (e) => {
      if (e.target.closest('.polaroid-love-btn')) return;
      soundFx.pop();
      openCustomLightbox(imageSrc, caption);
    });

    wallGrid.insertBefore(card, wallGrid.firstChild);
  }

  function setupScrapbook() {
    const wallGrid = document.getElementById('scrapbook-wall-grid');
    const memories = (window.MALKIN_MEMORIES || []).filter(m => m.id !== 'vid-1' && m.id !== 'vid-2');
    if (!wallGrid) return;

    const filterTabs = document.querySelectorAll('.sb-tab');
    const totalCountEl = document.getElementById('total-memories-count');
    if (totalCountEl) totalCountEl.textContent = memories.length;

    let activeFilter = 'all';

    function renderWall(category = 'all') {
      wallGrid.innerHTML = '';
      activeFilter = category;

      const filtered = category === 'all' 
        ? memories 
        : memories.filter(m => m.category === category);

      state.scrapbook.filteredList = filtered;

      filtered.forEach((item, index) => {
        const tilts = ['pin-tilt-1', 'pin-tilt-2', 'pin-tilt-3'];
        const tilt = tilts[index % tilts.length];

        const card = document.createElement('article');
        card.className = `polaroid-pin-card ${tilt}`;
        card.dataset.id = item.id;
        card.dataset.index = index;

        let mediaHtml = '';
        if (item.type === 'video') {
          mediaHtml = `
            <div class="polaroid-media-wrapper" data-idx="${index}">
              <video src="${item.src}" muted playsinline preload="metadata"></video>
              <span class="polaroid-video-badge">🎬 Video Reel</span>
              <div class="polaroid-play-overlay">▶</div>
            </div>
          `;
        } else {
          mediaHtml = `
            <div class="polaroid-media-wrapper" data-idx="${index}">
              <img src="${item.src}" alt="${item.title}" loading="lazy">
            </div>
          `;
        }

        const likesKey = 'malkin_likes_' + item.id;
        const currentLikes = parseInt(localStorage.getItem(likesKey), 10) || item.likes;

        card.innerHTML = `
          <div class="clothes-pin">📌</div>
          ${mediaHtml}
          <div class="polaroid-card-footer">
            <h4 class="polaroid-title-text">${item.title}</h4>
            <p class="polaroid-sub-caption">${item.caption}</p>
            <div class="polaroid-actions-row">
              <button class="polaroid-love-btn" data-id="${item.id}" title="Send Love to Malkin">
                <span>💖</span> <span class="like-number">${currentLikes}</span>
              </button>
            </div>
          </div>
        `;

        // Click anywhere on card (photo, video, title, caption, frame) to open lightbox
        card.addEventListener('click', (e) => {
          if (e.target.closest('.polaroid-love-btn')) return;
          soundFx.pop();
          openLightbox(index, item.id);
        });

        const mediaWrap = card.querySelector('.polaroid-media-wrapper');
        if (mediaWrap) {
          mediaWrap.addEventListener('click', (e) => {
            e.stopPropagation();
            soundFx.pop();
            openLightbox(index, item.id);
          });
        }

        // Like button
        const loveBtn = card.querySelector('.polaroid-love-btn');
        if (loveBtn) {
          loveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            soundFx.pop();
            const countSpan = loveBtn.querySelector('.like-number');
            let count = parseInt(countSpan.textContent, 10) + 1;
            countSpan.textContent = count;
            localStorage.setItem(likesKey, count);
            const rect = loveBtn.getBoundingClientRect();
            fireConfetti(rect.left + rect.width / 2, rect.top, 20);
          });
        }

        wallGrid.appendChild(card);
      });
    }

    // Filter tabs click
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        soundFx.pop();
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderWall(tab.dataset.filter);
      });
    });

    // Add Memory Note Modal
    const addNoteBtn = document.getElementById('add-scrapbook-note-btn');
    const modal = document.getElementById('scrapbook-modal');
    const closeBtn = document.getElementById('close-scrapbook-modal-btn');
    const saveBtn = document.getElementById('save-scrapbook-memory-btn');
    const captionInput = document.getElementById('new-memory-caption');
    const fileInput = document.getElementById('new-memory-file');

    if (addNoteBtn && modal) {
      addNoteBtn.addEventListener('click', () => modal.classList.remove('hidden'));
      if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const caption = captionInput.value.trim() || `Lovely memory with ${state.girlName}`;
          soundFx.chime();

          if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
              addPolaroidToScrapbook(e.target.result, caption);
              modal.classList.add('hidden');
              captionInput.value = '';
              fileInput.value = '';
            };
            reader.readAsDataURL(fileInput.files[0]);
          } else {
            addPolaroidToScrapbook('assets/gif/Heart Love GIF by SOOBOOKZ.gif', caption);
            modal.classList.add('hidden');
            captionInput.value = '';
          }
        });
      }
    }

    // Initial render
    renderWall('all');
  }

  /* ==========================================================================
     Lightbox Modal System (Interactive Photos & Video Playback with Controls)
     ========================================================================== */
  let wasMusicPlayingBeforeVideo = false;

  function closeLightboxModal() {
    const modal = document.getElementById('photo-lightbox-modal');
    if (!modal || modal.classList.contains('hidden')) return;

    // Pause and clean up any playing video immediately to prevent sound leaks
    const activeVideo = document.getElementById('active-lightbox-video');
    if (activeVideo) {
      try {
        activeVideo.pause();
        activeVideo.removeAttribute('src');
        activeVideo.load();
      } catch (err) {
        console.warn('Video cleanup error:', err);
      }
    }

    const container = document.getElementById('lightbox-media-container');
    if (container) container.innerHTML = '';

    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');

    // Resume background music if it was paused when video opened
    if (wasMusicPlayingBeforeVideo && state.audioElement && state.musicPlaying) {
      state.audioElement.play().catch(e => console.log('Resume music caught:', e));
      wasMusicPlayingBeforeVideo = false;
    }
  }

  function toggleActiveVideoPlay() {
    const video = document.getElementById('active-lightbox-video');
    const playPauseIcon = document.getElementById('lightbox-playpause-icon');
    const playPauseText = document.getElementById('lightbox-playpause-text');
    const playBadge = document.getElementById('video-center-play-badge');
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        if (playPauseIcon) playPauseIcon.textContent = '⏸️';
        if (playPauseText) playPauseText.textContent = 'Pause';
        if (playBadge) playBadge.classList.add('hidden');
      }).catch(e => console.log('Video play error:', e));
    } else {
      video.pause();
      if (playPauseIcon) playPauseIcon.textContent = '▶️';
      if (playPauseText) playPauseText.textContent = 'Play';
      if (playBadge) playBadge.classList.remove('hidden');
    }
  }

  function openLightbox(index, itemId) {
    const list = state.scrapbook.filteredList && state.scrapbook.filteredList.length 
      ? state.scrapbook.filteredList 
      : window.MALKIN_MEMORIES;
    if (!list || !list.length) return;

    let targetIndex = index;
    if (itemId) {
      const foundIdx = list.findIndex(m => m.id === itemId);
      if (foundIdx !== -1) targetIndex = foundIdx;
    }
    if (targetIndex < 0 || targetIndex >= list.length) targetIndex = 0;

    state.scrapbook.currentLightboxIndex = targetIndex;
    const modal = document.getElementById('photo-lightbox-modal');
    const container = document.getElementById('lightbox-media-container');
    const titleEl = document.getElementById('lightbox-title');
    const dateEl = document.getElementById('lightbox-date');
    const counterEl = document.getElementById('lightbox-counter');
    const badgeEl = document.getElementById('lightbox-media-badge');
    const videoControlsBar = document.getElementById('lightbox-video-controls-bar');
    const likeBtn = document.getElementById('lightbox-like-btn');
    const studioBtn = document.getElementById('lightbox-studio-btn');

    const item = list[targetIndex];
    if (titleEl) titleEl.textContent = item.title;
    if (dateEl) dateEl.textContent = `${item.caption} • ${item.date}`;
    if (counterEl) counterEl.textContent = `${targetIndex + 1} / ${list.length}`;

    // Clean up previous video if any
    const prevVid = document.getElementById('active-lightbox-video');
    if (prevVid) {
      try { prevVid.pause(); prevVid.removeAttribute('src'); prevVid.load(); } catch(e){}
    }
    container.innerHTML = '';

    if (item.type === 'video') {
      if (badgeEl) badgeEl.textContent = '🎬 Video Reel';
      if (videoControlsBar) videoControlsBar.classList.remove('hidden');

      // Pause background music during video playback so sounds don't collide
      if (state.musicPlaying && state.audioElement && !state.audioElement.paused) {
        wasMusicPlayingBeforeVideo = true;
        state.audioElement.pause();
      }

      container.innerHTML = `
        <div class="lightbox-video-wrapper">
          <video id="active-lightbox-video" src="${item.src}" controls playsinline autoplay preload="auto" class="lightbox-video-element"></video>
          <div id="video-tap-overlay" class="video-tap-overlay" title="Tap to Pause / Play">
            <div id="video-center-play-badge" class="video-center-play-badge hidden">▶</div>
          </div>
        </div>
      `;

      if (studioBtn) studioBtn.style.display = 'none';

      const video = document.getElementById('active-lightbox-video');
      const tapOverlay = document.getElementById('video-tap-overlay');
      const playBadge = document.getElementById('video-center-play-badge');
      const playPauseIcon = document.getElementById('lightbox-playpause-icon');
      const playPauseText = document.getElementById('lightbox-playpause-text');

      if (video) {
        // Attempt autoplay with sound; if browser blocks it, show the big play badge so 1 tap plays it
        video.play().then(() => {
          if (playPauseIcon) playPauseIcon.textContent = '⏸️';
          if (playPauseText) playPauseText.textContent = 'Pause';
          if (playBadge) playBadge.classList.add('hidden');
        }).catch(() => {
          if (playPauseIcon) playPauseIcon.textContent = '▶️';
          if (playPauseText) playPauseText.textContent = 'Play';
          if (playBadge) playBadge.classList.remove('hidden');
        });

        video.addEventListener('play', () => {
          if (playPauseIcon) playPauseIcon.textContent = '⏸️';
          if (playPauseText) playPauseText.textContent = 'Pause';
          if (playBadge) playBadge.classList.add('hidden');
        });
        video.addEventListener('pause', () => {
          if (playPauseIcon) playPauseIcon.textContent = '▶️';
          if (playPauseText) playPauseText.textContent = 'Play';
          if (playBadge) playBadge.classList.remove('hidden');
        });
        video.addEventListener('ended', () => {
          if (playPauseIcon) playPauseIcon.textContent = '🔄';
          if (playPauseText) playPauseText.textContent = 'Replay';
          if (playBadge) playBadge.classList.remove('hidden');
        });
      }

      if (tapOverlay) {
        tapOverlay.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleActiveVideoPlay();
        });
      }
    } else {
      if (badgeEl) badgeEl.textContent = '📸 Photo Memory';
      if (videoControlsBar) videoControlsBar.classList.add('hidden');

      // Resume music if it was paused by an earlier video in this lightbox session
      if (wasMusicPlayingBeforeVideo && state.audioElement && state.musicPlaying) {
        state.audioElement.play().catch(e => console.log('Resume music caught:', e));
        wasMusicPlayingBeforeVideo = false;
      }

      container.innerHTML = `
        <div class="lightbox-image-wrapper">
          <img src="${item.src}" alt="${item.title}" class="lightbox-image-element">
        </div>
      `;

      if (studioBtn) {
        studioBtn.style.display = 'inline-flex';
        studioBtn.onclick = () => {
          closeLightboxModal();
          loadIntoStudio(item.src);
        };
      }
    }

    const likesKey = 'malkin_likes_' + item.id;
    const currentLikes = parseInt(localStorage.getItem(likesKey), 10) || item.likes;
    const likeCountSpan = document.getElementById('lightbox-like-count');
    if (likeCountSpan) likeCountSpan.textContent = currentLikes;

    if (likeBtn) {
      likeBtn.onclick = () => {
        soundFx.pop();
        let newLikes = parseInt(likeCountSpan.textContent, 10) + 1;
        likeCountSpan.textContent = newLikes;
        localStorage.setItem(likesKey, newLikes);
        const rect = likeBtn.getBoundingClientRect();
        fireConfetti(rect.left + rect.width / 2, rect.top, 25);
      };
    }

    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function openCustomLightbox(src, caption) {
    const modal = document.getElementById('photo-lightbox-modal');
    const container = document.getElementById('lightbox-media-container');
    const titleEl = document.getElementById('lightbox-title');
    const dateEl = document.getElementById('lightbox-date');
    const counterEl = document.getElementById('lightbox-counter');
    const badgeEl = document.getElementById('lightbox-media-badge');
    const videoControlsBar = document.getElementById('lightbox-video-controls-bar');
    const studioBtn = document.getElementById('lightbox-studio-btn');

    if (titleEl) titleEl.textContent = caption || 'Special Memory';
    if (dateEl) dateEl.textContent = `Special Memory 💕`;
    if (counterEl) counterEl.textContent = ``;
    if (badgeEl) badgeEl.textContent = `✨ Special Moment`;
    if (videoControlsBar) videoControlsBar.classList.add('hidden');

    container.innerHTML = `
      <div class="lightbox-image-wrapper">
        <img src="${src}" alt="${caption}" class="lightbox-image-element">
      </div>
    `;

    if (studioBtn) studioBtn.style.display = 'none';
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function setupLightboxModal() {
    const modal = document.getElementById('photo-lightbox-modal');
    const closeBtn = document.getElementById('close-lightbox-btn');
    const backBtn = document.getElementById('lightbox-back-btn');
    const footerBackBtn = document.getElementById('lightbox-footer-back-btn');
    const prevBtn = document.getElementById('lightbox-prev-btn');
    const nextBtn = document.getElementById('lightbox-next-btn');

    const playPauseBtn = document.getElementById('lightbox-video-playpause-btn');
    const muteBtn = document.getElementById('lightbox-video-mute-btn');
    const restartBtn = document.getElementById('lightbox-video-restart-btn');

    if (!modal) return;

    // Close & Back triggers
    [closeBtn, backBtn, footerBackBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          soundFx.pop();
          closeLightboxModal();
        });
      }
    });

    // Tap outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeLightboxModal();
      }
    });

    // Video Quick Control buttons
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundFx.pop();
        toggleActiveVideoPlay();
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundFx.pop();
        const video = document.getElementById('active-lightbox-video');
        const muteIcon = document.getElementById('lightbox-mute-icon');
        const muteText = document.getElementById('lightbox-mute-text');
        if (!video) return;
        video.muted = !video.muted;
        if (video.muted) {
          if (muteIcon) muteIcon.textContent = '🔇';
          if (muteText) muteText.textContent = 'Muted';
        } else {
          if (muteIcon) muteIcon.textContent = '🔊';
          if (muteText) muteText.textContent = 'Sound';
        }
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundFx.pop();
        const video = document.getElementById('active-lightbox-video');
        if (!video) return;
        video.currentTime = 0;
        video.play().catch(() => {});
      });
    }

    // Prev / Next Navigation
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundFx.pop();
        const list = state.scrapbook.filteredList || window.MALKIN_MEMORIES;
        if (!list || !list.length) return;
        const newIndex = (state.scrapbook.currentLightboxIndex - 1 + list.length) % list.length;
        openLightbox(newIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundFx.pop();
        const list = state.scrapbook.filteredList || window.MALKIN_MEMORIES;
        if (!list || !list.length) return;
        const newIndex = (state.scrapbook.currentLightboxIndex + 1) % list.length;
        openLightbox(newIndex);
      });
    }

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (modal.classList.contains('hidden')) return;

      if (e.key === 'Escape') {
        closeLightboxModal();
      } else if (e.key === ' ' || e.code === 'Space') {
        const video = document.getElementById('active-lightbox-video');
        if (video) {
          e.preventDefault();
          toggleActiveVideoPlay();
        }
      } else if (e.key === 'ArrowLeft') {
        const list = state.scrapbook.filteredList || window.MALKIN_MEMORIES;
        if (list && list.length) {
          openLightbox((state.scrapbook.currentLightboxIndex - 1 + list.length) % list.length);
        }
      } else if (e.key === 'ArrowRight') {
        const list = state.scrapbook.filteredList || window.MALKIN_MEMORIES;
        if (list && list.length) {
          openLightbox((state.scrapbook.currentLightboxIndex + 1) % list.length);
        }
      }
    });

    // Mobile / Browser back button closes modal
    window.addEventListener('popstate', () => {
      if (!modal.classList.contains('hidden')) {
        closeLightboxModal();
      }
    });
  }

  /* ==========================================================================
     Cinematic Birthday Video Reel Theater Engine 🎬✨
     (Plays real cinematic celebration videos with full player controls)
     ========================================================================== */
  function initStoryReel() {
    const reelBtn = document.getElementById('play-story-reel-btn');
    const modal = document.getElementById('story-reel-modal');
    const closeBtn = document.getElementById('close-story-reel-btn');
    const backBtn = document.getElementById('story-back-btn');
    const bottomBackBtn = document.getElementById('cinema-bottom-back-btn');
    const prevBtn = document.getElementById('cinema-prev-clip-btn');
    const nextBtn = document.getElementById('cinema-next-clip-btn');
    const pauseBtn = document.getElementById('cinema-pause-play-btn');
    const activeImg = document.getElementById('cinema-active-img');
    const ambientGlow = document.getElementById('cinema-ambient-glow');
    const progressFill = document.getElementById('cinema-progress-fill');
    const titleEl = document.getElementById('cinema-reel-title');
    const playOverlay = document.getElementById('cinema-video-play-overlay');
    const momentBadge = document.getElementById('cinema-moment-badge');
    const momentTitle = document.getElementById('cinema-moment-title');
    const momentQuote = document.getElementById('cinema-moment-quote');
    const momentCounter = document.getElementById('cinema-moment-counter');
    const tapPrev = document.getElementById('cinema-tap-prev');
    const tapNext = document.getElementById('cinema-tap-next');
    const audioPlayer = document.getElementById('cinema-soundtrack-player');
    const musicToggleBtn = document.getElementById('cinema-music-toggle-btn');
    const musicTag = document.getElementById('cinema-music-tag');
    const songNameEl = document.getElementById('cinema-song-name');

    if (!modal || !activeImg) return;

    // Filter all images: strictly photos only, exclude Spider-Man photos and gift videos
    const SLIDE_DURATION = 4000; // 4 seconds per photo
    const ROMANTIC_SONGS = [
      {
        name: "Unki Tareef Mein Kahein Kya 💖",
        src: "assets/song/Unki Tareef Mein Kahein Kya - Alfaaz _ Hamza Malik.mp3"
      },
      {
        name: "Pal Pal Har Pal 🌸",
        src: "assets/song/pal pal har pal.mp3"
      },
      {
        name: "Chaar Kadam ✨",
        src: "assets/song/Chaar-Kadam-Ringtone.mp3"
      }
    ];
    let currentSongIndex = 0;

    function getReelPhotos() {
      const allMemories = window.MALKIN_MEMORIES || [];
      return allMemories.filter(item => {
        if (!item || item.type !== 'image') return false;
        const src = item.src || '';
        const fn = item.fileName || '';
        // Exclude spider-man mask photos
        if (src.includes('1.48.') || fn.includes('1.48.')) return false;
        // Exclude video files
        if (src.endsWith('.mp4') || src.includes('lv_0') || src.includes('lv_7533')) return false;
        return true;
      });
    }

    let reelPhotos = getReelPhotos();
    let currentIndex = 0;
    let isPlaying = false;
    let slideTimer = null;
    let slideStartTime = 0;
    let remainingTime = SLIDE_DURATION;
    let wasMusicPlayingBeforeCinema = false;

    // Setup audio player
    if (audioPlayer) {
      audioPlayer.loop = true;
      audioPlayer.volume = 0.9;
      audioPlayer.src = ROMANTIC_SONGS[currentSongIndex].src;
    }

    function updatePhoto(index, autoPlayNext = true) {
      reelPhotos = getReelPhotos();
      if (!reelPhotos.length) return;

      currentIndex = (index + reelPhotos.length) % reelPhotos.length;
      const photo = reelPhotos[currentIndex];

      // Reset animation class to trigger smooth Ken Burns effect
      const kbClass = `kenburns-${(currentIndex % 4) + 1}`;
      activeImg.className = 'cinema-kenburns-img';
      void activeImg.offsetWidth; // Force reflow
      activeImg.className = `cinema-kenburns-img ${kbClass}`;
      activeImg.src = photo.src;
      activeImg.alt = photo.title || 'Cute Malkin Birthday Memory';

      // Ambient blurred glow matching photo colors
      if (ambientGlow) {
        ambientGlow.style.backgroundImage = `url("${photo.src}")`;
      }

      // Update Lower-Third & Header
      if (titleEl) {
        titleEl.textContent = `Official 19th Birthday Cinematic Reel 🎬 (${currentIndex + 1}/${reelPhotos.length})`;
      }
      if (momentBadge) {
        momentBadge.textContent = photo.category ? `🌸 ${photo.category.toUpperCase()} • #${currentIndex + 1}` : `🌸 Memory #${currentIndex + 1}`;
      }
      if (momentTitle) {
        momentTitle.textContent = photo.title || 'Pure Sweetness Overload 🧁';
      }
      if (momentQuote) {
        momentQuote.textContent = photo.caption || '19th Birthday Keepsake Sealed for Cute Malkin 💖';
      }
      if (momentCounter) {
        momentCounter.textContent = `${currentIndex + 1} / ${reelPhotos.length} Moments`;
      }

      // Reset & animate progress bar
      remainingTime = SLIDE_DURATION;
      slideStartTime = Date.now();
      if (progressFill) {
        progressFill.style.transition = 'none';
        progressFill.style.width = '0%';
        void progressFill.offsetWidth;
        if (isPlaying) {
          progressFill.style.transition = `width ${remainingTime}ms linear`;
          progressFill.style.width = '100%';
        }
      }

      clearTimeout(slideTimer);
      if (isPlaying && autoPlayNext) {
        slideTimer = setTimeout(() => {
          updatePhoto(currentIndex + 1, true);
        }, remainingTime);
      }
    }

    function playReel() {
      isPlaying = true;
      if (pauseBtn) pauseBtn.textContent = '⏸️ Pause';
      if (playOverlay) playOverlay.classList.add('hidden');
      activeImg.style.animationPlayState = 'running';

      // Play romantic soundtrack
      if (audioPlayer && audioPlayer.paused) {
        audioPlayer.play().catch(() => {});
      }

      // Resume progress fill
      if (progressFill) {
        progressFill.style.transition = `width ${remainingTime}ms linear`;
        progressFill.style.width = '100%';
      }

      slideStartTime = Date.now();
      clearTimeout(slideTimer);
      slideTimer = setTimeout(() => {
        updatePhoto(currentIndex + 1, true);
      }, remainingTime);
    }

    function pauseReel() {
      isPlaying = false;
      if (pauseBtn) pauseBtn.textContent = '▶️ Play';
      if (playOverlay) playOverlay.classList.remove('hidden');
      activeImg.style.animationPlayState = 'paused';

      // Pause soundtrack
      if (audioPlayer && !audioPlayer.paused) {
        audioPlayer.pause();
      }

      // Freeze progress fill
      clearTimeout(slideTimer);
      const elapsed = Date.now() - slideStartTime;
      remainingTime = Math.max(200, remainingTime - elapsed);

      if (progressFill) {
        const computedWidth = window.getComputedStyle(progressFill).width;
        progressFill.style.transition = 'none';
        progressFill.style.width = computedWidth;
      }
    }

    function togglePlayPause() {
      if (isPlaying) {
        pauseReel();
      } else {
        playReel();
      }
    }

    function openCinema() {
      // Pause main website background music
      if (state.musicPlaying && state.audioElement && !state.audioElement.paused) {
        wasMusicPlayingBeforeCinema = true;
        state.audioElement.pause();
      }

      modal.classList.remove('hidden');
      document.body.classList.add('reel-open');

      // Refresh list in case memories data changed
      reelPhotos = getReelPhotos();
      currentIndex = 0;
      remainingTime = SLIDE_DURATION;

      // Start romantic music
      if (audioPlayer) {
        audioPlayer.currentTime = 0;
        audioPlayer.src = ROMANTIC_SONGS[currentSongIndex].src;
        if (songNameEl) songNameEl.textContent = ROMANTIC_SONGS[currentSongIndex].name;
      }

      isPlaying = true;
      if (pauseBtn) pauseBtn.textContent = '⏸️ Pause';
      if (playOverlay) playOverlay.classList.add('hidden');

      updatePhoto(0, true);

      if (audioPlayer) {
        audioPlayer.play().catch(() => {
          // If browser requires user interaction for audio
        });
      }
    }

    function closeCinema() {
      clearTimeout(slideTimer);
      isPlaying = false;

      if (audioPlayer) {
        try {
          audioPlayer.pause();
          audioPlayer.currentTime = 0;
        } catch (e) {}
      }

      modal.classList.add('hidden');
      document.body.classList.remove('reel-open');

      // Resume main website background music if it was paused
      if (wasMusicPlayingBeforeCinema && state.audioElement && state.musicPlaying) {
        state.audioElement.play().catch(() => {});
        wasMusicPlayingBeforeCinema = false;
      }
    }

    // Next / Prev slide handlers
    function nextSlide() {
      soundFx.pop();
      updatePhoto(currentIndex + 1, isPlaying);
    }

    function prevSlide() {
      soundFx.pop();
      updatePhoto(currentIndex - 1, isPlaying);
    }

    // Toggle soundtrack mute/unmute
    function toggleCinemaMusic() {
      if (!audioPlayer) return;
      audioPlayer.muted = !audioPlayer.muted;
      if (musicToggleBtn) {
        musicToggleBtn.textContent = audioPlayer.muted ? '🔇 Muted' : '🔊 Music';
      }
    }

    // Switch soundtrack to next romantic song
    function nextCinemaSong() {
      if (!audioPlayer) return;
      currentSongIndex = (currentSongIndex + 1) % ROMANTIC_SONGS.length;
      const nextSong = ROMANTIC_SONGS[currentSongIndex];
      audioPlayer.src = nextSong.src;
      if (songNameEl) songNameEl.textContent = nextSong.name;
      if (isPlaying) {
        audioPlayer.play().catch(() => {});
      }
      soundFx.pop();
    }

    // Event Listeners
    if (reelBtn) {
      reelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundFx.pop();
        openCinema();
      });
    }

    [closeBtn, backBtn, bottomBackBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          soundFx.pop();
          closeCinema();
        });
      }
    });

    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundFx.pop();
        togglePlayPause();
      });
    }

    if (playOverlay) {
      playOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlayPause();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
      });
    }

    if (tapPrev) {
      tapPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
      });
    }

    if (tapNext) {
      tapNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
      });
    }

    if (musicToggleBtn) {
      musicToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCinemaMusic();
      });
    }

    if (musicTag) {
      musicTag.style.cursor = 'pointer';
      musicTag.title = 'Click to switch romantic song';
      musicTag.addEventListener('click', (e) => {
        e.stopPropagation();
        nextCinemaSong();
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCinema();
    });

    window.addEventListener('keydown', (e) => {
      if (modal.classList.contains('hidden')) return;
      if (e.key === 'Escape') {
        closeCinema();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    });
  }

  /* Playlist Selector Modal */
  function setupPlaylistModal() {
    const btn = document.getElementById('music-playlist-btn');
    const modal = document.getElementById('playlist-modal');
    const closeBtn = document.getElementById('close-playlist-modal-btn');
    const closeBtn2 = document.getElementById('close-playlist-btn');
    const listContainer = document.getElementById('playlist-tracks-list');

    if (!btn || !modal || !listContainer) return;

    btn.addEventListener('click', () => {
      soundFx.pop();
      renderPlaylistTracks();
      modal.classList.remove('hidden');
    });

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (closeBtn2) closeBtn2.addEventListener('click', () => modal.classList.add('hidden'));

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });

    function renderPlaylistTracks() {
      listContainer.innerHTML = '';
      const playlist = window.MALKIN_PLAYLIST || [];
      playlist.forEach((track, idx) => {
        const row = document.createElement('div');
        row.className = 'playlist-track-row' + (idx === state.currentSongIndex ? ' is-active' : '');
        row.innerHTML = `
          <div class="track-main-info">
            <span class="track-name">🎵 ${track.title}</span>
            <span class="track-artist">${track.artist}</span>
          </div>
          <span class="track-play-badge">${idx === state.currentSongIndex && state.musicPlaying ? '▶ Playing' : 'Tap to Play'}</span>
        `;
        row.addEventListener('click', () => {
          soundFx.pop();
          playSong(idx);
          renderPlaylistTracks();
        });
        listContainer.appendChild(row);
      });
    }

    const prevBtn = document.getElementById('music-prev-btn');
    const nextBtn = document.getElementById('music-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => { soundFx.pop(); prevSong(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { soundFx.pop(); nextSong(); });
  }

  /* ==========================================================================
     10. Section 5: Mystery Birthday Gifts (Virtual Unboxing)
     ========================================================================== */
  function setupMysteryGifts() {
    document.querySelectorAll('.mystery-gift-card').forEach((card) => {
      const unopenedView = card.querySelector('.gift-unopened-view');
      const revealedContent = card.querySelector('.gift-revealed-content');
      const video = card.querySelector('.gift-video');
      const rewrapBtn = card.querySelector('.rewrap-gift-btn');

      // Direct video playback listener: automatically turn off background song
      if (video) {
        video.addEventListener('play', () => {
          toggleMusic(false);
          document.querySelectorAll('.gift-video').forEach((v) => {
            if (v !== video) v.pause();
          });
        });
      }

      // Card click to unwrap gift
      card.addEventListener('click', (e) => {
        // If clicking on active video player or rewrap button, don't trigger unbox
        if (e.target.closest('.gift-video-frame') || e.target.closest('.rewrap-gift-btn')) {
          return;
        }

        if (revealedContent && revealedContent.classList.contains('hidden')) {
          soundFx.chime();
          try { soundFx.fanfare(); } catch (err) {}

          const rect = card.getBoundingClientRect();
          fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 3, 50);

          // 1. TURN OFF BACKGROUND MUSIC IMMEDIATELY
          toggleMusic(false);

          // 2. Animate 3D lid pop & box opening
          card.classList.add('is-unwrapping');

          setTimeout(() => {
            if (unopenedView) unopenedView.classList.add('hidden');
            revealedContent.classList.remove('hidden');

            // 3. START VIDEO PLAYBACK IMMEDIATELY
            if (video) {
              document.querySelectorAll('.gift-video').forEach((v) => {
                if (v !== video) v.pause();
              });
              video.currentTime = 0;
              video.muted = false;
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.catch((err) => {
                  console.log('Video play error / user gesture needed:', err);
                });
              }
            }
          }, 320);
        }
      });

      // Rewrap button to wrap the box back
      if (rewrapBtn) {
        rewrapBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          soundFx.pop();
          if (video) {
            video.pause();
          }
          card.classList.remove('is-unwrapping');
          revealedContent.classList.add('hidden');
          if (unopenedView) unopenedView.classList.remove('hidden');
        });
      }
    });
  }

  /* ==========================================================================
     11. Section 6: The Wishing Sky (Floating Paper Lanterns)
     ========================================================================== */
  function initWishingSky() {
    const canvas = document.getElementById('sky-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    });

    // Twinkling Stars
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.5,
        alpha: Math.random(),
        delta: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
      });
    }

    // Floating Lanterns
    const lanterns = [
      { x: width * 0.2, y: height * 0.7, size: 22, sway: 0, text: 'Health & Smiles' },
      { x: width * 0.45, y: height * 0.5, size: 26, sway: 1.2, text: 'Forever Happy' },
      { x: width * 0.75, y: height * 0.65, size: 24, sway: 2.5, text: 'Dreams Come True' }
    ];

    function addLantern(text) {
      lanterns.push({
        x: Math.random() * (width - 120) + 60,
        y: height + 20,
        size: Math.random() * 8 + 22,
        sway: Math.random() * Math.PI * 2,
        speed: 2.4,
        text: text || 'Happy Birthday! ✨'
      });
    }

    function renderSky() {
      ctx.clearRect(0, 0, width, height);

      // Stars
      stars.forEach((s) => {
        s.alpha += s.delta;
        if (s.alpha > 1 || s.alpha < 0.2) s.delta = -s.delta;

        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Lanterns
      lanterns.forEach((l) => {
        l.y -= l.speed || 0.6;
        l.sway += 0.02;
        const currentX = l.x + Math.sin(l.sway) * 15;

        // Reset when drifted out top
        if (l.y < -50) {
          l.y = height + 30;
          l.x = Math.random() * (width - 120) + 60;
        }

        // Draw glowing lantern
        ctx.save();
        ctx.translate(currentX, l.y);

        // Glow halo
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, l.size * 1.8);
        grad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
        grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.35)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, l.size * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Lantern Body
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.roundRect(-l.size * 0.45, -l.size * 0.6, l.size * 0.9, l.size * 1.2, 5);
        ctx.fill();

        // Inner light
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, l.size * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      requestAnimationFrame(renderSky);
    }

    renderSky();

    // Release Lantern Button & Cinematic Paper-to-Lantern Flow
    const releaseBtn = document.getElementById('release-lantern-btn');
    const wishInput = document.getElementById('wish-message-input');
    const counterEl = document.getElementById('lantern-count');
    const stage = document.getElementById('cinematic-lantern-stage');
    const paperWrapper = document.getElementById('cinematic-paper');
    const wishTextEl = document.getElementById('cinematic-wish-text');
    const lantern = document.getElementById('cinematic-lantern');
    const lanternWishEl = document.getElementById('lantern-inscribed-wish');
    const statusBanner = document.getElementById('cinematic-status');

    function saveSecretWish(msg) {
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 1. Secretly store in Dev's private local vault
      try {
        const wishes = JSON.parse(localStorage.getItem('malkin_secret_wishes') || '[]');
        wishes.push({
          id: 'wish-' + Date.now(),
          text: msg,
          date: dateFormatted,
          timestamp: Date.now()
        });
        localStorage.setItem('malkin_secret_wishes', JSON.stringify(wishes));
      } catch (err) {}

      // 2. Transmit to save_wish.php so it automatically appends to README_SECRET_WISHES.md when live
      try {
        fetch('save_wish.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            wish: msg,
            date: dateFormatted,
            author: 'Friend'
          })
        }).then(res => res.json()).catch(() => {
          // Graceful fallback when testing offline or without PHP server
        });
      } catch (e) {}
    }

    if (releaseBtn && wishInput) {
      releaseBtn.addEventListener('click', () => {
        const msg = wishInput.value.trim() || 'May your 19th year bring endless happiness and smiles! ✨';

        // 1. Secretly Save the Wish to Note storage & README
        saveSecretWish(msg);

        // 2. Sound & Setup Cinematic Elements
        soundFx.chime();
        try { soundFx.fanfare(); } catch (e) {}

        state.wishesCount += 1;
        if (counterEl) counterEl.textContent = state.wishesCount;

        releaseBtn.disabled = true;
        releaseBtn.textContent = '🏮 Releasing to the Stars...';

        // 3. Initiate Cinematic View (Paper fold -> Lantern fly -> Letter page)
        if (stage && paperWrapper && lantern) {
          if (wishTextEl) wishTextEl.textContent = msg;
          if (lanternWishEl) {
            lanternWishEl.textContent = msg.slice(0, 20) + (msg.length > 20 ? '...' : '');
          }

          stage.classList.remove('hidden');
          // Force layout
          void stage.offsetWidth;
          stage.classList.add('active');

          paperWrapper.style.display = '';
          paperWrapper.className = 'cinematic-paper-wrapper';
          lantern.className = 'cinematic-sky-lantern hidden';
          if (statusBanner) statusBanner.className = 'cinematic-status-banner hidden';

          // Timeline Step 1: Paper Folds horizontally (1.2s)
          setTimeout(() => {
            paperWrapper.classList.add('folding-phase-1');
          }, 1200);

          // Timeline Step 2: Paper Folds vertically into glowing ember (1.9s)
          setTimeout(() => {
            paperWrapper.classList.remove('folding-phase-1');
            paperWrapper.classList.add('folding-phase-2');
          }, 1900);

          // Timeline Step 3: Glowing Lantern Materializes and Ascends (2.6s)
          setTimeout(() => {
            paperWrapper.style.display = 'none';
            lantern.classList.remove('hidden');
            lantern.classList.add('ascending');
            if (statusBanner) statusBanner.classList.remove('hidden');

            addLantern(msg);
            soundFx.chime();
            fireConfetti(window.innerWidth / 2, window.innerHeight * 0.45, 45);
          }, 2600);

          // Timeline Step 4: Lantern flies into the starry sky -> Letter Page Opens (4.2s)
          setTimeout(() => {
            stage.classList.remove('active');

            // Open Letter Page (Step 7 in journey.steps is step-3, Heartfelt Birthday Letter)
            journey.goToStep(7);

            setTimeout(() => {
              stage.classList.add('hidden');
              paperWrapper.style.display = '';
              paperWrapper.className = 'cinematic-paper-wrapper';
              lantern.className = 'cinematic-sky-lantern hidden';
              if (statusBanner) statusBanner.className = 'cinematic-status-banner hidden';
              releaseBtn.disabled = false;
              releaseBtn.textContent = '🏮 Release Lantern into the Sky!';
              wishInput.value = '';
              fireConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 60);
            }, 600);
          }, 4200);

        } else {
          // Fallback if modal elements not present
          addLantern(msg);
          fireConfetti(window.innerWidth / 2, window.innerHeight * 0.7, 40);
          setTimeout(() => {
            journey.goToStep(7);
            releaseBtn.disabled = false;
            releaseBtn.textContent = '🏮 Release Lantern into the Sky!';
            wishInput.value = '';
          }, 2500);
        }
      });
    }
  }

  /* ==========================================================================
     12. Section 7: Editable Heartfelt Letter
     ========================================================================== */
  function setupLetter() {
    const editBtn = document.getElementById('edit-letter-btn');
    const modal = document.getElementById('letter-modal');
    const closeBtn = document.getElementById('close-letter-modal-btn');
    const saveBtn = document.getElementById('save-letter-btn');
    const textarea = document.getElementById('edit-letter-textarea');
    const letterBody = document.getElementById('letter-body-text');

    // Load saved letter if any (clean up old English default template or plain version)
    const savedLetter = localStorage.getItem('birthday_letter_text');
    if (savedLetter && letterBody) {
      if (savedLetter.includes('Dearest Cutie') || savedLetter.includes('effortlessly brings') || savedLetter.includes('gentle grace') || !savedLetter.includes('🎮')) {
        localStorage.removeItem('birthday_letter_text');
      } else {
        letterBody.innerHTML = savedLetter;
      }
    }

    if (editBtn && modal) {
      editBtn.addEventListener('click', () => {
        soundFx.pop();
        textarea.value = letterBody.innerText;
        modal.classList.remove('hidden');
      });

      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

      saveBtn.addEventListener('click', () => {
        soundFx.chime();
        const paragraphs = textarea.value
          .split('\n\n')
          .filter((p) => p.trim())
          .map((p) => `<p>${p.trim()}</p>`)
          .join('');

        letterBody.innerHTML = paragraphs;
        localStorage.setItem('birthday_letter_text', paragraphs);
        modal.classList.add('hidden');
      });
    }
  }

  /* ==========================================================================
     13. Name Customization Modal
     ========================================================================== */
  function setupNameModal() {
    const triggerBtn = document.getElementById('customize-name-btn');
    const modal = document.getElementById('name-modal');
    const closeBtn = document.getElementById('close-name-modal-btn');
    const saveBtn = document.getElementById('save-name-btn');
    const input = document.getElementById('custom-girl-name-input');

    if (triggerBtn && modal) {
      triggerBtn.addEventListener('click', () => {
        soundFx.pop();
        input.value = state.girlName;
        modal.classList.remove('hidden');
      });

      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

      saveBtn.addEventListener('click', () => {
        soundFx.fanfare();
        updateGirlName(input.value);
        modal.classList.add('hidden');
        fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 40);
      });
    }
  }

  /* ==========================================================================
     14. Multi-Step Journey Controller (Paginated Step Transitions)
     ========================================================================== */
  const journey = {
    currentStep: 1,
    totalSteps: 7,
    steps: [
      { id: 'step-1', title: 'Welcome & Birthday Reveal', badge: 'Step 1 of 7' },
      { id: 'step-2', title: 'Make a Wish & Cut Cake', badge: 'Step 2 of 7' },
      { id: 'step-4', title: 'Why You Are So Special', badge: 'Step 3 of 7' },
      { id: 'step-6', title: 'Birthday Gifts', badge: 'Step 4 of 7' },
      { id: 'step-5', title: 'Cute Memory Wall', badge: 'Step 5 of 7' },
      { id: 'step-7', title: 'Midnight Wishing Sky', badge: 'Step 6 of 7' },
      { id: 'step-3', title: 'Heartfelt Birthday Letter', badge: 'Final Page' }
    ],

    goToStep(stepNum, updateHash = true) {
      if (stepNum < 1) stepNum = 1;
      if (stepNum > journey.totalSteps) stepNum = journey.totalSteps;

      journey.currentStep = stepNum;
      playPageSong(stepNum);

      // Pause all gift videos when switching steps
      document.querySelectorAll('.gift-video').forEach((v) => {
        try { v.pause(); } catch (e) {}
      });

      // Update DOM active step
      document.querySelectorAll('.journey-step').forEach((el) => {
        if (el.id === journey.steps[stepNum - 1].id) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });

      // Update Stepper Progress
      const info = journey.steps[stepNum - 1];
      const badgeEl = document.getElementById('stepper-step-badge');
      const titleEl = document.getElementById('stepper-step-title');
      const fillEl = document.getElementById('stepper-progress-fill');
      const prevBtn = document.getElementById('prev-step-btn');
      const nextBtn = document.getElementById('next-step-btn');

      if (badgeEl) badgeEl.textContent = info.badge;
      if (titleEl) titleEl.textContent = info.title;
      if (fillEl) {
        const percent = ((stepNum - 1) / (journey.totalSteps - 1)) * 100;
        fillEl.style.width = `${Math.max(12.5, percent)}%`;
      }

      if (prevBtn) prevBtn.disabled = (stepNum === 1);
      if (nextBtn) {
        if (stepNum === journey.totalSteps) {
          nextBtn.textContent = 'Replay 🔄';
        } else {
          nextBtn.textContent = 'Next Step →';
        }
      }

      // Update URL hash
      if (updateHash) {
        window.location.hash = `step-${stepNum}`;
      }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Confetti burst on key celebration moments
      if (stepNum === 2 || stepNum === 3 || stepNum === 7) {
        try { fireConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 45); } catch(e){}
      }
    },

    next() {
      if (journey.currentStep < journey.totalSteps) {
        journey.goToStep(journey.currentStep + 1);
      } else {
        journey.goToStep(1); // loop back
      }
    },

    prev() {
      if (journey.currentStep > 1) {
        journey.goToStep(journey.currentStep - 1);
      }
    },

    init() {
      // Stepper Header Nav Buttons
      const prevBtn = document.getElementById('prev-step-btn');
      const nextBtn = document.getElementById('next-step-btn');
      if (prevBtn) prevBtn.addEventListener('click', () => { soundFx.pop(); journey.prev(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { soundFx.pop(); journey.next(); });

      // Listen for all .next-step-trigger buttons throughout the app
      document.addEventListener('click', (e) => {
        const nextTrigger = e.target.closest('.next-step-trigger');
        if (nextTrigger) {
          soundFx.pop();
          const targetStep = parseInt(nextTrigger.dataset.next, 10);
          if (!isNaN(targetStep)) {
            journey.goToStep(targetStep);
          } else {
            journey.next();
          }
        }

        const prevTrigger = e.target.closest('.prev-step-trigger');
        if (prevTrigger) {
          soundFx.pop();
          const targetStep = parseInt(prevTrigger.dataset.prev, 10);
          if (!isNaN(targetStep)) {
            journey.goToStep(targetStep);
          } else {
            journey.prev();
          }
        }
      });

      // Check URL hash for direct step (e.g. #step-3)
      const hashMatch = window.location.hash.match(/#step-(\d+)/);
      if (hashMatch) {
        const stepFromHash = parseInt(hashMatch[1], 10);
        if (stepFromHash >= 1 && stepFromHash <= journey.totalSteps) {
          journey.goToStep(stepFromHash, false);
          return;
        }
      }

      // Initial state
      journey.goToStep(1, false);
    }
  };

  /* ==========================================================================
     15. Global Controls & Initialization
     ========================================================================== */
  function init() {
    // Modules initialization with fault-tolerance
    try { initAudioPlayer(); } catch (e) { console.error('Audio player error:', e); }
    try { setupPlaylistModal(); } catch (e) { console.error('Playlist modal error:', e); }
    try { setupGatekeeper(); } catch (e) { console.error('Gatekeeper error:', e); }
    try { updateGirlName(state.girlName); } catch (e) { console.error('Name sync error:', e); }
    try { initAmbientCanvas(); } catch (e) { console.error('Ambient canvas error:', e); }
    try { setupCakeCeremony(); } catch (e) { console.error('Cake error:', e); }
    try { setupGifCards(); } catch (e) { console.error('Gif cards error:', e); }
    try { initPhotoStudio(); } catch (e) { console.error('Photo studio error:', e); }
    try { setupScrapbook(); } catch (e) { console.error('Scrapbook error:', e); }
    try { setupLightboxModal(); } catch (e) { console.error('Lightbox error:', e); }
    try { initStoryReel(); } catch (e) { console.error('Story reel error:', e); }
    try { setupMysteryGifts(); } catch (e) { console.error('Gifts error:', e); }
    try { initWishingSky(); } catch (e) { console.error('Wishing sky error:', e); }
    try { setupLetter(); } catch (e) { console.error('Letter error:', e); }
    try { setupNameModal(); } catch (e) { console.error('Name modal error:', e); }
    try { journey.init(); } catch (e) { console.error('Journey error:', e); }

    // Floating controls
    try {
      const confettiBtn = document.getElementById('confetti-burst-btn');
      if (confettiBtn) {
        confettiBtn.addEventListener('click', () => {
          soundFx.pop();
          fireConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 70);
        });
      }

    } catch (e) {
      console.error('Controls error:', e);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
