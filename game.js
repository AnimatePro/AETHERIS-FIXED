(function(){
'use strict';
const A = window.AETH;

class Game {
  constructor(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gameTime = 0;
    this.state = 'menu'; // menu, playing, paused, gameOver, upgrades, settings
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.particles = [];
    this.texts = [];
    this.score = 0;
    this.kills = 0;
    this.waveCount = 0;
    this.levelUpChoices = [];
    this.lastReaction = null;
    this.lastReactionTime = 0;
    this.screenShake = 0;
    this.flashScreen = 0;
    this.lastAutoSave = 0;
    this.save = A.loadSave();
    this.settings = this.save.settings;
    this.enemyPool = [];
    this.bulletPool = [];
    this.particlePool = [];
    this.bossesSpawned = 0;
    this.nextBossWave = A.CFG.BOSS_INTERVAL;
    
    this.setupInput();
    this.setupPools();
    A.SND.init();
    this.drawMainMenu();
  }

  setupInput(){
    this.input = { up: false, down: false, left: false, right: false, shoot: false, dash: false };
    window.addEventListener('keydown', (e) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') this.input.up = true;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') this.input.down = true;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.input.left = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.input.right = true;
      if (e.key === ' ') { this.input.shoot = true; e.preventDefault(); }
      if (e.key === 'Shift') { this.input.dash = true; e.preventDefault(); }
      if (e.key === 'Escape') this.togglePause();
      if (e.key === 'r' || e.key === 'R') this.restart();
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') this.input.up = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') this.input.down = false;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.input.left = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.input.right = false;
      if (e.key === ' ') this.input.shoot = false;
      if (e.key === 'Shift') this.input.dash = false;
    });

    // Mouse/touch support
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
  }

  handleCanvasClick(e){
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.state === 'menu') this.handleMenuClick(x, y);
    else if (this.state === 'paused') this.handlePauseClick(x, y);
    else if (this.state === 'gameOver') this.handleGameOverClick(x, y);
    else if (this.state === 'upgrades') this.handleUpgradesClick(x, y);
    else if (this.state === 'settings') this.handleSettingsClick(x, y);
    else if (this.state === 'levelUp') this.handleLevelUpClick(x, y);
  }

  handleMenuClick(x, y){
    // Play button
    if (x > this.canvas.width / 2 - 100 && x < this.canvas.width / 2 + 100 &&
        y > this.canvas.height / 2 + 80 && y < this.canvas.height / 2 + 140){
      this.startGame();
      A.SND.play('select');
    }
    // Upgrades button
    if (x > this.canvas.width / 2 - 100 && x < this.canvas.width / 2 + 100 &&
        y > this.canvas.height / 2 + 160 && y < this.canvas.height / 2 + 220){
      this.state = 'upgrades';
      A.SND.play('select');
    }
    // Settings button
    if (x > this.canvas.width / 2 - 100 && x < this.canvas.width / 2 + 100 &&
        y > this.canvas.height / 2 + 240 && y < this.canvas.height / 2 + 300){
      this.state = 'settings';
      A.SND.play('select');
    }
  }

  handlePauseClick(x, y){
    // Resume button
    if (x > this.canvas.width / 2 - 80 && x < this.canvas.width / 2 + 80 &&
        y > this.canvas.height / 2 + 20 && y < this.canvas.height / 2 + 70){
      this.togglePause();
      A.SND.play('select');
    }
    // Quit button
    if (x > this.canvas.width / 2 - 80 && x < this.canvas.width / 2 + 80 &&
        y > this.canvas.height / 2 + 90 && y < this.canvas.height / 2 + 140){
      this.state = 'menu';
      A.SND.play('select');
    }
  }

  handleGameOverClick(x, y){
    // Restart button
    if (x > this.canvas.width / 2 - 80 && x < this.canvas.width / 2 + 80 &&
        y > this.canvas.height / 2 + 140 && y < this.canvas.height / 2 + 190){
      this.startGame();
      A.SND.play('select');
    }
  }

  handleUpgradesClick(x, y){
    // Back button
    if (x > this.canvas.width / 2 - 80 && x < this.canvas.width / 2 + 80 &&
        y > this.canvas.height - 80 && y < this.canvas.height - 30){
      this.state = 'menu';
      A.SND.play('select');
    }

    // Upgrade passives
    const startY = 180;
    const passives = Object.keys(A.PASS);
    for (let i = 0; i < passives.length; i++){
      const key = passives[i];
      const passive = A.PASS[key];
      const level = this.save.meta[key] || 0;
      const cost = Math.floor(100 * Math.pow(1.15, level));

      if (level < passive.max && this.save.shards >= cost &&
          x > this.canvas.width / 2 && x < this.canvas.width - 40 &&
          y > startY + i * 35 - 15 && y < startY + i * 35 + 15){
        this.save.shards -= cost;
        this.save.meta[key] = level + 1;
        passive.apply(this.player || {});
        A.SND.play('select');
      }
    }
  }

  handleSettingsClick(x, y){
    // Screen shake toggle
    if (x > this.canvas.width - 100 && x < this.canvas.width - 50 &&
        y > 130 && y < 160){
      this.save.settings.screenShake = !this.save.settings.screenShake;
      A.SND.play('select');
    }

    // Flash toggle
    if (x > this.canvas.width - 100 && x < this.canvas.width - 50 &&
        y > 190 && y < 220){
      this.save.settings.flash = !this.save.settings.flash;
      A.SND.play('select');
    }

    // Back button
    if (x > this.canvas.width / 2 - 80 && x < this.canvas.width / 2 + 80 &&
        y > this.canvas.height - 80 && y < this.canvas.height - 30){
      this.state = 'menu';
      A.SND.play('select');
    }
  }

  handleLevelUpClick(x, y){
    const choices = this.levelUpChoices || [];
    for (let i = 0; i < 3; i++){
      const choice = choices[i];
      if (!choice) continue;
      const buttonY = this.canvas.height / 2 + (i - 1) * 80;
      if (x > this.canvas.width / 2 - 120 && x < this.canvas.width / 2 + 120 &&
          y > buttonY && y < buttonY + 60){
        this.applyLevelUpChoice(choice);
        this.state = 'playing';
        A.SND.play('select');
        break;
      }
    }
  }

  setupPools(){
    for (let i = 0; i < A.CFG.MAX_EN; i++){
      this.enemyPool.push(new A.Enemy(0, 0, 'normal'));
    }
    for (let i = 0; i < A.CFG.MAX_BUL; i++){
      this.bulletPool.push(new A.Bullet(0, 0, 0, 0, 5, '#fff', 1, 'normal'));
    }
    for (let i = 0; i < A.CFG.MAX_FX; i++){
      this.particlePool.push(new A.Particle(0, 0, 0, 0, 3, '#fff', 1));
    }
  }

  startGame(){
    this.state = 'playing';
    this.gameTime = 0;
    this.kills = 0;
    this.score = 0;
    this.waveCount = 0;
    this.bossesSpawned = 0;
    this.nextBossWave = A.CFG.BOSS_INTERVAL;
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.particles = [];
    this.texts = [];
    this.player = new A.Player(A.CFG.WORLD_SIZE / 2, A.CFG.WORLD_SIZE / 2);
    
    // Apply saved passives
    for (let key in this.save.meta){
      const level = this.save.meta[key];
      if (level > 0 && A.PASS[key]){
        for (let i = 0; i < level; i++){
          A.PASS[key].apply(this.player);
        }
      }
    }

    this.spawnEnemies();
    A.SND.play('boss');
  }

  togglePause(){
    if (this.state === 'playing'){
      this.state = 'paused';
      A.SND.play('pause');
    } else if (this.state === 'paused'){
      this.state = 'playing';
      A.SND.play('pause');
    }
  }

  restart(){
    this.startGame();
  }

  drawMainMenu(){
    this.state = 'menu';
  }

  spawnEnemies(){
    this.waveCount++;
    const count = Math.floor(3 + this.waveCount * 0.5);
    for (let i = 0; i < count; i++){
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 200;
      const x = this.player.x + Math.cos(angle) * dist;
      const y = this.player.y + Math.sin(angle) * dist;
      
      let enemy;
      if (this.waveCount >= this.nextBossWave && this.bossesSpawned < A.CFG.MAX_BOSSES){
        enemy = new A.Boss(x, y);
        this.bossesSpawned++;
        this.nextBossWave += A.CFG.BOSS_INTERVAL;
        A.SND.play('boss');
      } else {
        enemy = new A.Enemy(x, y, 'normal');
        enemy.color = A.pick(['#ff6b6b', '#ff9800', '#ffd740', '#81c784', '#64b5f6']);
      }
      
      this.enemies.push(enemy);
    }
  }

  applyLevelUpChoice(choice){
    if (choice.type === 'passive'){
      const level = this.save.meta[choice.key] || 0;
      this.save.meta[choice.key] = level + 1;
      A.PASS[choice.key].apply(this.player);
    } else if (choice.type === 'weapon'){
      this.save.unlocked[choice.key] = true;
      this.player.weapons[choice.key] = true;
    }
    A.SND.play('evo');
  }

  generateLevelUpChoices(){
    this.levelUpChoices = [];
    
    // Weapon choices
    for (let w in this.player.weapons){
      if (!this.save.unlocked[w]){
        this.levelUpChoices.push({
          type: 'weapon',
          key: w,
          name: `Unlock ${w}`,
          desc: `Gain access to ${w} weapon`
        });
      }
    }

    // Passive choices
    const passiveKeys = Object.keys(A.PASS);
    while (this.levelUpChoices.length < 3 && passiveKeys.length > 0){
      const key = A.pick(passiveKeys);
      const level = this.save.meta[key] || 0;
      if (level < A.PASS[key].max){
        this.levelUpChoices.push({
          type: 'passive',
          key: key,
          name: `${A.PASS[key].icon} ${A.PASS[key].name}`,
          desc: A.PASS[key].desc
        });
      }
      passiveKeys.splice(passiveKeys.indexOf(key), 1);
    }

    if (this.levelUpChoices.length > 3) this.levelUpChoices = this.levelUpChoices.slice(0, 3);
  }

  update(dt){
    if (this.state !== 'playing') return;

    A.FPS.update(dt);
    this.gameTime += dt;
    this.lastAutoSave += dt;

    if (this.lastAutoSave >= A.CFG.AUTO_SAVE_INTERVAL){
      this.save.stats.totalRuns++;
      A.saveSave(this.save);
      this.lastAutoSave = 0;
    }

    if (!this.player || !this.player.a){
      this.endGame();
      return;
    }

    this.player.update(dt, this.input, this);

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--){
      const e = this.enemies[i];
      e.update(dt, this.player, this);

      if (e.collidesWith(this.player)){
        this.player.takeDamage(e.damage, this);
      }

      if (e.hp <= 0){
        e.a = 0;
        this.kills++;
        this.score += e instanceof A.Boss ? 500 : 50;
        this.save.stats.totalKills++;
        if (e instanceof A.Boss) this.save.stats.bossesKilled++;
        
        for (let j = 0; j < 10; j++){
          const angle = Math.random() * Math.PI * 2;
          const speed = 100 + Math.random() * 100;
          const p = new A.Particle(e.x, e.y, Math.cos(angle) * speed, Math.sin(angle) * speed, 3, e.color, 0.6);
          this.particles.push(p);
        }
        
        A.SND.play('kill');
      }

      if (!e.a) this.enemies.splice(i, 1);
    }

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--){
      const b = this.bullets[i];
      b.update(dt);

      let hit = false;
      for (let j = 0; j < this.enemies.length; j++){
        const e = this.enemies[j];
        if (b.collidesWith(e)){
          e.takeDamage(b.damage * this.player.pow);
          
          const angle = Math.random() * Math.PI * 2;
          const p = new A.Particle(b.x, b.y, Math.cos(angle) * 150, Math.sin(angle) * 150, 2, b.color, 0.3);
          this.particles.push(p);

          hit = true;
          break;
        }
      }

      if (hit || !b.a) this.bullets.splice(i, 1);
    }

    // Update enemy bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--){
      const b = this.enemyBullets[i];
      b.update(dt);

      if (b.collidesWith(this.player)){
        this.player.takeDamage(b.damage || 10, this);
        b.a = 0;
      }

      if (!b.a) this.enemyBullets.splice(i, 1);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--){
      const p = this.particles[i];
      p.update(dt);
      if (!p.a) this.particles.splice(i, 1);
    }

    // Update text floaties
    for (let i = this.texts.length - 1; i >= 0; i--){
      const t = this.texts[i];
      t.update(dt);
      if (!t.a) this.texts.splice(i, 1);
    }

    // Spawn wave
    if (this.enemies.length < 2){
      this.spawnEnemies();
    }

    // Level up check
    if (this.player.level > (this.save.stats.bestScore || 0)){
      this.save.stats.bestScore = this.score;
    }
  }

  endGame(){
    this.state = 'gameOver';
    this.save.stats.bestTime = Math.max(this.save.stats.bestTime, this.gameTime);
    this.save.stats.bestScore = Math.max(this.save.stats.bestScore, this.score);
    this.save.shards += Math.floor(this.score / 100);
    A.saveSave(this.save);
    A.SND.play('ouch');
  }

  draw(){
    const cx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Apply screen shake
    cx.save();
    if (this.screenShake > 0){
      const shake = this.screenShake * 5;
      cx.translate(A.U.rand(-shake, shake), A.U.rand(-shake, shake));
      this.screenShake -= 0.016;
    }

    if (this.state === 'menu'){
      A.UI.drawMainMenu(cx, this, this.save);
    } else if (this.state === 'paused'){
      this.drawGameWorld();
      A.UI.drawPauseMenu(cx, this);
    } else if (this.state === 'gameOver'){
      A.UI.drawGameOverMenu(cx, this, this.save);
    } else if (this.state === 'upgrades'){
      A.UI.drawUpgradesMenu(cx, this, this.save);
    } else if (this.state === 'settings'){
      A.UI.drawSettingsMenu(cx, this, this.save);
    } else if (this.state === 'levelUp'){
      this.drawGameWorld();
      A.UI.drawLevelUpMenu(cx, this);
    } else if (this.state === 'playing'){
      this.drawGameWorld();
      A.UI.drawHUD(cx, this, this.player, this.save);
    }

    // Flash screen
    if (this.flashScreen > 0){
      cx.fillStyle = `rgba(255, 255, 255, ${this.flashScreen})`;
      cx.fillRect(0, 0, w, h);
      this.flashScreen -= 0.016;
    }

    cx.restore();
  }

  drawGameWorld(){
    const cx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    cx.fillStyle = '#0a0e27';
    cx.fillRect(0, 0, w, h);

    // Grid
    cx.strokeStyle = '#1a2a4a';
    cx.lineWidth = 1;
    const gridSize = 50;
    for (let i = 0; i < w; i += gridSize){
      cx.beginPath();
      cx.moveTo(i, 0);
      cx.lineTo(i, h);
      cx.stroke();
    }
    for (let i = 0; i < h; i += gridSize){
      cx.beginPath();
      cx.moveTo(0, i);
      cx.lineTo(w, i);
      cx.stroke();
    }

    // Draw all entities
    this.particles.forEach(p => p.draw(cx));
    this.enemyBullets.forEach(b => b.draw(cx));
    this.bullets.forEach(b => b.draw(cx));
    this.enemies.forEach(e => e.draw(cx));
    if (this.player) this.player.draw(cx);
    this.texts.forEach(t => t.draw(cx));

    A.UI.drawReactionIndicator(cx, this);
    A.UI.drawWaveIndicator(cx, this);
  }

  run(){
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.016);
      lastTime = now;

      this.update(dt);
      this.draw();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  A.SND.init();
  const canvas = document.getElementById('gameCanvas') || document.querySelector('canvas');
  if (canvas){
    const game = new Game(canvas);
    game.run();
  }
});

A.Game = Game;

})();
