(function(){
'use strict';
window.AETH = window.AETH || {};
const A = window.AETH;

A.CFG = {
  P_R: 15,
  P_SPEED: 220,
  P_HP: 100,
  P_INV: 0.75,
  DASH_CD: 2.4,
  DASH_TIME: 0.18,
  DASH_SPEED: 720,
  XP_REQ: 30,
  XP_GROW: 1.18,
  XP_MAG: 160,
  MAX_EN: 180,
  MAX_BUL: 280,
  MAX_EBUL: 160,
  MAX_XP: 220,
  MAX_FX: 240,
  MAX_TEXT: 220,
  SAVE_KEY: 'aetheris_save_v5',
  BIOME_STEP: 75,
  BOSS_INTERVAL: 60,
  MAX_BOSSES: 6,
  MAX_LEVEL: 50,
  AUTO_SAVE_INTERVAL: 30,
  WORLD_SIZE: 2000,
  FPS_UPDATE_INTERVAL: 0.5
};

A.U = {
  clamp(v,a,b){ return Math.max(a, Math.min(b, v)); },
  lerp(a,b,t){ return a + (b-a)*t; },
  rand(a,b){ return Math.random() * (b-a) + a; },
  randInt(a,b){ return Math.floor(Math.random() * (b-a+1)) + a; },
  dist(ax,ay,bx,by){ return Math.hypot(bx-ax, by-ay); },
  distSq(ax,ay,bx,by){ const dx = bx-ax, dy = by-ay; return dx*dx + dy*dy; },
  ang(ax,ay,bx,by){ return Math.atan2(by-ay, bx-ax); },
  fmtTime(s){ return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`; },
  fmtNum(n){ return n >= 1000 ? (n/1000).toFixed(1) + 'k' : String(n); },
  shuffle(a){ for(let i=a.length-1;i>0;i--){ const j = A.U.randInt(0, i); [a[i],a[j]] = [a[j],a[i]]; } return a; },
  safe(fn, fallback=null){ try { return fn(); } catch (_) { return fallback; } }
};

A.roundRect = function(cx, x, y, w, h, r){
  cx.beginPath();
  cx.moveTo(x+r,y);
  cx.lineTo(x+w-r,y);
  cx.quadraticCurveTo(x+w,y,x+w,y+r);
  cx.lineTo(x+w,y+h-r);
  cx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  cx.lineTo(x+r,y+h);
  cx.quadraticCurveTo(x,y+h,x,y+h-r);
  cx.lineTo(x,y+r);
  cx.quadraticCurveTo(x,y,x+r,y);
  cx.closePath();
  cx.fill();
};

A.strokeRoundRect = function(cx, x, y, w, h, r){
  cx.beginPath();
  cx.moveTo(x+r,y);
  cx.lineTo(x+w-r,y);
  cx.quadraticCurveTo(x+w,y,x+w,y+r);
  cx.lineTo(x+w,y+h-r);
  cx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  cx.lineTo(x+r,y+h);
  cx.quadraticCurveTo(x,y+h,x,y+h-r);
  cx.lineTo(x,y+r);
  cx.quadraticCurveTo(x,y,x+r,y);
  cx.closePath();
  cx.stroke();
};

A.makeSave = function(){
  return {
    shards: 0,
    unlocked: { fireball:true, whip:false, chain:false, orbit:false, laser:false, frost:false },
    meta: { hp:0, power:0, speed:0, armor:0, magnet:0, regen:0, catalyst:0, xp:0, luck:0 },
    stats: { totalRuns:0, totalKills:0, totalReactions:0, bossesKilled:0, bestTime:0, bestCombo:0, bestScore:0, timedWins:0, bossRushWins:0 },
    ach: {},
    settings: { screenShake:true, flash:true }
  };
};

A.loadSave = function(){
  const d = A.makeSave();
  try {
    const raw = JSON.parse(localStorage.getItem(A.CFG.SAVE_KEY) || 'null');
    if (!raw) return d;
    return {
      shards: raw.shards ?? d.shards,
      unlocked: Object.assign({}, d.unlocked, raw.unlocked || {}),
      meta: Object.assign({}, d.meta, raw.meta || {}),
      stats: Object.assign({}, d.stats, raw.stats || {}),
      ach: Object.assign({}, d.ach, raw.ach || {}),
      settings: Object.assign({}, d.settings, raw.settings || {})
    };
  } catch (_) { return d; }
};

A.saveSave = function(save){
  try { localStorage.setItem(A.CFG.SAVE_KEY, JSON.stringify(save)); } catch (_) {}
};

A.FPS = {
  current: 0,
  lastTime: performance.now(),
  frameCount: 0,
  updateInterval: A.CFG.FPS_UPDATE_INTERVAL,
  timeSinceUpdate: 0,
  
  update(dt) {
    this.frameCount++;
    this.timeSinceUpdate += dt;
    if (this.timeSinceUpdate >= this.updateInterval) {
      this.current = Math.round(this.frameCount / this.timeSinceUpdate);
      this.frameCount = 0;
      this.timeSinceUpdate = 0;
    }
  }
};

A.SND = {
  ctx:null,
  master:null,
  init(){
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.12;
      this.master.connect(this.ctx.destination);
    } catch (_) {}
  },
  tone(freq, dur, type='sine', gain=0.08, slide=1){
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slide !== 1) o.frequency.exponentialRampToValueAtTime(Math.max(1, freq * slide), this.ctx.currentTime + dur);
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    o.connect(g); g.connect(this.master);
    o.start(); o.stop(this.ctx.currentTime + dur);
  },
  noise(dur, gain=0.05){
    if (!this.ctx || !this.master) return;
    const b = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = b.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = b;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    src.connect(g); g.connect(this.master);
    src.start(); src.stop(this.ctx.currentTime + dur);
  },
  play(kind){
    if (!this.ctx) return;
    if (kind === 'shoot') this.tone(670, 0.04, 'square', 0.04, 0.82);
    else if (kind === 'hit') { this.tone(220, 0.05, 'triangle', 0.05, 0.9); this.noise(0.03, 0.015); }
    else if (kind === 'kill') { this.tone(150, 0.08, 'sine', 0.06, 0.8); this.noise(0.04, 0.02); }
    else if (kind === 'xp') this.tone(920, 0.05, 'sine', 0.05, 1.05);
    else if (kind === 'lvl') { this.tone(523, 0.08, 'sine', 0.08); setTimeout(()=>this.tone(659, 0.08, 'sine', 0.08), 70); setTimeout(()=>this.tone(784, 0.10, 'sine', 0.08), 140); }
    else if (kind === 'dash') { this.tone(320, 0.05, 'sawtooth', 0.05, 0.72); this.noise(0.03, 0.015); }
    else if (kind === 'select') this.tone(500, 0.04, 'sine', 0.04, 0.95);
    else if (kind === 'ouch') { this.tone(110, 0.08, 'square', 0.08, 0.74); this.noise(0.04, 0.02); }
    else if (kind === 'boss') { this.tone(92, 0.18, 'sawtooth', 0.09, 0.84); this.noise(0.08, 0.03); }
    else if (kind === 'evo') { this.tone(740, 0.08, 'sine', 0.08); setTimeout(()=>this.tone(988, 0.10, 'sine', 0.08), 80); }
    else if (kind === 'pause') this.tone(420, 0.03, 'sine', 0.03, 0.95);
  }
};

A.clampPool = function(arr){
  for (let i = 0; i < arr.length; i++) if (!arr[i].a) return arr[i];
  return null;
};

A.pick = function(arr){ return arr[A.U.randInt(0, arr.length - 1)]; };

})();
