/**
 * Kids Easy Logic Game - Basic Level
 * Pure Vanilla JavaScript: Web Audio Synthesizer, Speech Narration, Confetti
 */

/* ==========================================================================
   1. SOUND SYNTHESIZER (Web Audio API)
   ========================================================================== */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Major chord chime: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const t = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + i * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(180, t + 0.2);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  }
}

/* ==========================================================================
   2. SPEECH NARRATOR
   ========================================================================== */
class VoiceNarrator {
  constructor() {
    this.enabled = true;
    this.synth = window.speechSynthesis;
  }

  speak(text) {
    if (!this.enabled || !this.synth) return;
    this.synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.2;

    const voices = this.synth.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith('hi'));
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (hindiVoice) utter.voice = hindiVoice;
    else if (englishVoice) utter.voice = englishVoice;

    this.synth.speak(utter);
  }

  stop() {
    if (this.synth) this.synth.cancel();
  }
}

/* ==========================================================================
   3. CONFETTI ENGINE
   ========================================================================== */
class ConfettiEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.active = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  launch() {
    this.particles = [];
    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#22c55e', '#a855f7', '#fb923c'];
    for (let i = 0; i < 75; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 150,
        y: this.canvas.height / 2 - 40,
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 12 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 6,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8,
        opacity: 1
      });
    }
    this.active = true;
    this.animate();
  }

  animate() {
    if (!this.active) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let alive = false;
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.vx *= 0.98;
      p.rotation += p.vRot;
      if (p.y > this.canvas.height * 0.45) p.opacity -= 0.015;

      if (p.opacity > 0 && p.y < this.canvas.height + 50) {
        alive = true;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }
    }

    if (alive) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.active = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

/* ==========================================================================
   4. GAME CONTROLLER
   ========================================================================== */
class SimpleKidsGame {
  constructor() {
    this.sound = new SoundEngine();
    this.voice = new VoiceNarrator();
    this.confetti = new ConfettiEngine(document.getElementById('confettiCanvas'));

    this.currentIndex = 0;
    this.stars = 0;
    this.isSolved = false;

    // 30 Basic, Visual, Intuitive Levels for Kids
    this.levels = [
      // 1-5: Basic Animals & Colors
      {
        prompt: "Which one is different?",
        hindi: "अलग जानवर कौन सा है?",
        voiceText: "अलग जानवर कौन सा है? बिल्ली को चुनो!",
        type: 'odd',
        options: ['🐶', '🐶', '🐱', '🐶'],
        correctIndex: 2
      },
      {
        prompt: "Find the RED circle!",
        hindi: "लाल गोला (Red Circle) ढूँढो!",
        voiceText: "लाल गोला ढूँढो!",
        type: 'target',
        target: '🔴',
        options: ['🔵', '🔴', '🟢'],
        correctIndex: 1
      },
      {
        prompt: "Which fruit is different?",
        hindi: "अलग फल कौन सा है?",
        voiceText: "अलग फल कौन सा है? केले को चुनो!",
        type: 'odd',
        options: ['🍎', '🍎', '🍌', '🍎'],
        correctIndex: 2
      },
      {
        prompt: "What comes next?",
        hindi: "आगे क्या आएगा?",
        voiceText: "शेर, बंदर, शेर... आगे क्या आएगा?",
        type: 'pattern',
        sequence: ['🦁', '🐵', '🦁', '❓'],
        options: ['🐵', '🦁'],
        correctIndex: 0
      },
      {
        prompt: "Which one can FLY?",
        hindi: "उड़ने वाला हवाई जहाज कौन सा है?",
        voiceText: "हवाई जहाज कौन सा है? उसे चुनो!",
        type: 'odd',
        options: ['🚗', '🚗', '✈️', '🚗'],
        correctIndex: 2
      },

      // 6-10: Shapes, Patterns, Sizes & Garden
      {
        prompt: "Find the shiny STAR!",
        hindi: "चमकता हुआ तारा (Star) ढूँढो!",
        voiceText: "तारा ढूँढो!",
        type: 'target',
        target: '⭐',
        options: ['🌙', '⭐', '☀️'],
        correctIndex: 1
      },
      {
        prompt: "What color comes next?",
        hindi: "आगे कौन सा रंग आएगा?",
        voiceText: "लाल, हरा, लाल... आगे क्या आएगा?",
        type: 'pattern',
        sequence: ['🔴', '🟢', '🔴', '❓'],
        options: ['🟢', '🔴'],
        correctIndex: 0
      },
      {
        prompt: "Which one is PIZZA?",
        hindi: "अलग खाना कौन सा है?",
        voiceText: "पिज़्ज़ा कौन सा है?",
        type: 'odd',
        options: ['🍦', '🍦', '🍕', '🍦'],
        correctIndex: 2
      },
      {
        prompt: "Which one is TINY?",
        hindi: "छोटा चूहा (Tiny Mouse) कौन सा है?",
        voiceText: "छोटा चूहा कौन सा है?",
        type: 'odd',
        options: ['🐘', '🐘', '🐭', '🐘'],
        correctIndex: 2
      },
      {
        prompt: "Find the BUTTERFLY!",
        hindi: "सुंदर तितली (Butterfly) ढूँढो!",
        voiceText: "तितली को चुनो!",
        type: 'odd',
        options: ['🌸', '🌸', '🌸', '🦋'],
        correctIndex: 3
      },

      // 11-15: Water Animals, Numbers, Yellow, Birds & Fruits
      {
        prompt: "Who does NOT live in water?",
        hindi: "पानी में कौन नहीं रहता?",
        voiceText: "पानी में कौन नहीं रहता? शेर को चुनो!",
        type: 'odd',
        options: ['🐟', '🐟', '🦁', '🐟'],
        correctIndex: 2
      },
      {
        prompt: "What number comes next?",
        hindi: "1, 2, 3 के बाद क्या आएगा?",
        voiceText: "एक, दो, तीन... इसके बाद चार आएगा! चार को चुनो!",
        type: 'pattern',
        sequence: ['1️⃣', '2️⃣', '3️⃣', '❓'],
        options: ['4️⃣', '5️⃣', '2️⃣'],
        correctIndex: 0
      },
      {
        prompt: "Find the YELLOW color!",
        hindi: "पीला रंग (Yellow) ढूँढो!",
        voiceText: "पीला रंग कौन सा है?",
        type: 'target',
        target: '🟡',
        options: ['🔴', '🟢', '🟡'],
        correctIndex: 2
      },
      {
        prompt: "Which one is a TURTLE?",
        hindi: "कछुआ (Turtle) कौन सा है?",
        voiceText: "कछुआ कौन सा है? उसे चुनो!",
        type: 'odd',
        options: ['🦜', '🦜', '🦜', '🐢'],
        correctIndex: 3
      },
      {
        prompt: "What fruit comes next?",
        hindi: "आगे कौन सा फल आएगा?",
        voiceText: "अंगूर, स्ट्रॉबेरी, अंगूर... आगे स्ट्रॉबेरी आएगी!",
        type: 'pattern',
        sequence: ['🍇', '🍓', '🍇', '❓'],
        options: ['🍓', '🍇'],
        correctIndex: 0
      },

      // 16-20: Pairs, Hot/Cold, Sky, Blue & Pets
      {
        prompt: "Who gives tasty MILK?",
        hindi: "मीठा दूध कौन देती है?",
        voiceText: "दूध कौन देती है? प्यारी गाय को चुनो!",
        type: 'target',
        target: '🥛',
        options: ['🐮', '🦁', '🐸'],
        correctIndex: 0
      },
      {
        prompt: "Which one is HOT fire?",
        hindi: "गरम आग (Fire) कौन सी है?",
        voiceText: "गरम आग कौन सी है? उसे चुनो!",
        type: 'odd',
        options: ['⛄', '⛄', '🔥', '⛄'],
        correctIndex: 2
      },
      {
        prompt: "Sun, Moon, Sun... What's next?",
        hindi: "सूरज, चाँद, सूरज... आगे क्या?",
        voiceText: "सूरज, चाँद, सूरज... आगे चाँद आएगा!",
        type: 'pattern',
        sequence: ['☀️', '🌙', '☀️', '❓'],
        options: ['🌙', '☀️'],
        correctIndex: 0
      },
      {
        prompt: "Find the BLUE water color!",
        hindi: "नीला रंग (Blue) ढूँढो!",
        voiceText: "नीला रंग कौन सा है?",
        type: 'target',
        target: '🔵',
        options: ['🔵', '🟡', '🔴'],
        correctIndex: 0
      },
      {
        prompt: "Who loves CARROTS?",
        hindi: "गाजर कौन खाता है?",
        voiceText: "गाजर कौन खाता है? खरगोश को चुनो!",
        type: 'target',
        target: '🥕',
        options: ['🐰', '🐯', '🐊'],
        correctIndex: 0
      },

      // 21-25: Vegetables, Hearts, Ships, Moods & Frogs
      {
        prompt: "Which one is healthy BROCCOLI?",
        hindi: "हरी सब्जी (Broccoli) कौन सी है?",
        voiceText: "हरी सब्जी ब्रोकोली कौन सी है?",
        type: 'odd',
        options: ['🍩', '🍩', '🥦', '🍩'],
        correctIndex: 2
      },
      {
        prompt: "Heart, Star, Heart... What's next?",
        hindi: "दिल, सितारा, दिल... आगे क्या?",
        voiceText: "दिल, सितारा, दिल... आगे सितारा आएगा!",
        type: 'pattern',
        sequence: ['❤️', '⭐', '❤️', '❓'],
        options: ['⭐', '❤️'],
        correctIndex: 0
      },
      {
        prompt: "Which one sails in WATER?",
        hindi: "पानी में तैरने वाला जहाज कौन सा है?",
        voiceText: "पानी का जहाज कौन सा है?",
        type: 'target',
        target: '🌊',
        options: ['🚢', '🚗', '🚂'],
        correctIndex: 0
      },
      {
        prompt: "Which one is SLEEPING?",
        hindi: "सोया हुआ चेहरा कौन सा है?",
        voiceText: "सोया हुआ चेहरा कौन सा है? उसे चुनो!",
        type: 'odd',
        options: ['😀', '😀', '😴', '😀'],
        correctIndex: 2
      },
      {
        prompt: "Find the jumping GREEN frog!",
        hindi: "कूदने वाला हरा मेंढक ढूँढो!",
        voiceText: "हरा मेंढक कौन सा है?",
        type: 'target',
        target: '🐸',
        options: ['🐵', '🐸', '🐶'],
        correctIndex: 1
      },

      // 26-30: Balloons, Football, Honey, Purple & King of Jungle
      {
        prompt: "Balloon, Balloon, Gift... What's next?",
        hindi: "गुब्बारा, गुब्बारा, तोहफा... आगे क्या?",
        voiceText: "गुब्बारा, गुब्बारा, तोहफा... गुब्बारा, गुब्बारा... आगे तोहफा आएगा!",
        type: 'pattern',
        sequence: ['🎈', '🎈', '🎁', '🎈', '🎈', '❓'],
        options: ['🎁', '🎈'],
        correctIndex: 0
      },
      {
        prompt: "Which one is a FOOTBALL?",
        hindi: "खेलने वाली फुटबॉल कौन सी है?",
        voiceText: "खेलने वाली फुटबॉल कौन सी है? उसे चुनो!",
        type: 'odd',
        options: ['🎸', '🎸', '⚽', '🎸'],
        correctIndex: 2
      },
      {
        prompt: "Who makes sweet HONEY?",
        hindi: "मीठा शहद कौन बनाती है?",
        voiceText: "मीठा शहद मधुमक्खी बनाती है! मधुमक्खी चुनो!",
        type: 'target',
        target: '🍯',
        options: ['🐝', '🦋', '🐞'],
        correctIndex: 0
      },
      {
        prompt: "Yellow, Purple, Yellow... What's next?",
        hindi: "पीला, बैंगनी, पीला... आगे क्या?",
        voiceText: "पीला, बैंगनी, पीला... आगे बैंगनी रंग आएगा!",
        type: 'pattern',
        sequence: ['🟡', '🟣', '🟡', '❓'],
        options: ['🟣', '🟡'],
        correctIndex: 0
      },
      {
        prompt: "Who is the KING of the Jungle?",
        hindi: "जंगल का राजा कौन है?",
        voiceText: "जंगल का राजा शेर है! शेर को चुनो!",
        type: 'target',
        target: '👑',
        options: ['🦁', '🐰', '🐹'],
        correctIndex: 0
      }
    ];

    this.initEvents();
    this.loadLevel(0);
  }

  initEvents() {
    // Sound Toggle
    const soundBtn = document.getElementById('soundBtn');
    soundBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.voice.enabled = this.sound.enabled;
      document.getElementById('soundIcon').textContent = this.sound.enabled ? '🔊' : '🔇';
      if (this.sound.enabled) this.sound.playPop();
    });

    // Voice button
    document.getElementById('speakBtn').addEventListener('click', () => {
      const cur = this.levels[this.currentIndex];
      this.sound.playPop();
      this.voice.speak(cur.voiceText);
    });

    // Next Level button
    document.getElementById('nextBtn').addEventListener('click', () => {
      this.sound.playPop();
      this.nextLevel();
    });

    // Restart button
    document.getElementById('playAgainBtn').addEventListener('click', () => {
      this.sound.playPop();
      document.getElementById('winScreen').classList.add('hidden');
      document.getElementById('gameCard').classList.remove('hidden');
      this.stars = 0;
      document.getElementById('scoreText').textContent = '0';
      this.loadLevel(0);
    });
  }

  loadLevel(index) {
    this.currentIndex = index;
    this.isSolved = false;

    const data = this.levels[index];

    // UI Updates
    document.getElementById('levelText').textContent = `Level ${index + 1} of ${this.levels.length}`;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = `${((index + 1) / this.levels.length) * 100}%`;
    }
    document.getElementById('questionPrompt').textContent = data.prompt;
    document.getElementById('hindiPrompt').textContent = data.hindi;

    const feedback = document.getElementById('feedbackMsg');
    feedback.textContent = '';
    feedback.className = 'feedback-msg';

    document.getElementById('nextBtn').classList.add('hidden');

    // Preview Area (for patterns or targets)
    const previewEl = document.getElementById('previewArea');
    previewEl.innerHTML = '';

    if (data.type === 'pattern') {
      data.sequence.forEach(item => {
        const box = document.createElement('div');
        box.className = item === '❓' ? 'preview-box mystery' : 'preview-box';
        box.textContent = item;
        previewEl.appendChild(box);
      });
    } else if (data.type === 'target') {
      const box = document.createElement('div');
      box.className = 'preview-box mystery';
      box.textContent = data.target;
      previewEl.appendChild(box);
    }

    // Render Options
    const grid = document.getElementById('optionsGrid');
    grid.innerHTML = '';

    data.options.forEach((emoji, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-card';
      btn.textContent = emoji;
      btn.addEventListener('click', () => this.handlePick(idx, btn));
      grid.appendChild(btn);
    });

    // Speak prompt after brief delay
    setTimeout(() => {
      this.voice.speak(data.voiceText);
    }, 300);
  }

  handlePick(index, btnElement) {
    if (this.isSolved) return;

    const cur = this.levels[this.currentIndex];
    const feedback = document.getElementById('feedbackMsg');

    if (index === cur.correctIndex) {
      // Correct!
      this.isSolved = true;
      this.sound.playSuccess();
      this.confetti.launch();

      btnElement.classList.add('correct');
      feedback.textContent = "🎉 शाबाश! बहुत बढ़िया! (Awesome!) ⭐";
      feedback.className = 'feedback-msg good';

      this.stars++;
      document.getElementById('scoreText').textContent = this.stars;

      // Show Next button
      const nextBtn = document.getElementById('nextBtn');
      nextBtn.classList.remove('hidden');

      // Auto advance after 1.5 seconds if user doesn't click
      this.autoTimer = setTimeout(() => {
        if (this.isSolved) this.nextLevel();
      }, 1500);

    } else {
      // Wrong choice
      this.sound.playWrong();
      btnElement.classList.add('wrong');
      setTimeout(() => btnElement.classList.remove('wrong'), 400);

      feedback.textContent = "Try again! (एक बार और कोशिश करो!) 😊";
      feedback.className = 'feedback-msg try-again';
    }
  }

  nextLevel() {
    clearTimeout(this.autoTimer);
    if (this.currentIndex + 1 < this.levels.length) {
      this.loadLevel(this.currentIndex + 1);
    } else {
      // Victory!
      this.showWinScreen();
    }
  }

  showWinScreen() {
    this.sound.playSuccess();
    this.confetti.launch();
    document.getElementById('gameCard').classList.add('hidden');
    document.getElementById('winScreen').classList.remove('hidden');
    this.voice.speak("शाबाश! आपने सारे सवाल जीत लिए!");
  }
}

// Start Game
window.addEventListener('DOMContentLoaded', () => {
  window.game = new SimpleKidsGame();
});
