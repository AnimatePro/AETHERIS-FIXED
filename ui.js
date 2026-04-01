(function(){
'use strict';
const A = window.AETH;

A.UI = {
  drawHUD(cx, game, player, save){
    const padding = 12;
    const barHeight = 20;
    const barWidth = 200;
    
    // FPS Counter
    cx.fillStyle = '#fff';
    cx.font = '12px monospace';
    cx.textAlign = 'left';
    cx.fillText(`FPS: ${A.FPS.current}`, padding, padding + 12);
    
    // HP Bar
    cx.fillStyle = '#ff4444';
    cx.fillRect(padding, padding + 20, barWidth, barHeight);
    cx.fillStyle = '#44ff44';
    cx.fillRect(padding, padding + 20, (player.hp / player.maxHp) * barWidth, barHeight);
    cx.strokeStyle = '#fff';
    cx.lineWidth = 2;
    cx.strokeRect(padding, padding + 20, barWidth, barHeight);
    cx.fillStyle = '#fff';
    cx.font = 'bold 14px Arial';
    cx.textAlign = 'center';
    cx.fillText(`${Math.floor(player.hp)}/${player.maxHp}`, padding + barWidth / 2, padding + 35);
    
    // Energy Bar
    cx.fillStyle = '#4488ff';
    cx.fillRect(padding, padding + 55, barWidth, barHeight);
    cx.fillStyle = '#ffff44';
    cx.fillRect(padding, padding + 55, (player.energy / player.maxEnergy) * barWidth, barHeight);
    cx.strokeStyle = '#fff';
    cx.lineWidth = 2;
    cx.strokeRect(padding, padding + 55, barWidth, barHeight);
    cx.fillStyle = '#fff';
    cx.font = 'bold 14px Arial';
    cx.textAlign = 'center';
    cx.fillText(`Energy: ${Math.floor(player.energy)}`, padding + barWidth / 2, padding + 70);
    
    // Level
    cx.fillStyle = '#fff';
    cx.font = 'bold 24px Arial';
    cx.textAlign = 'left';
    cx.fillText(`LVL ${player.level}`, padding, padding + 110);
    
    // XP Bar
    cx.fillStyle = '#444';
    cx.fillRect(padding, padding + 115, barWidth, 16);
    cx.fillStyle = '#ffff00';
    cx.fillRect(padding, padding + 115, (player.xp / player.xpReq) * barWidth, 16);
    cx.strokeStyle = '#fff';
    cx.lineWidth = 1;
    cx.strokeRect(padding, padding + 115, barWidth, 16);
    
    // Stats on right
    const rightX = game.canvas.width - padding - 150;
    cx.fillStyle = '#fff';
    cx.font = 'bold 12px Arial';
    cx.textAlign = 'right';
    cx.fillText(`💰 Shards: ${save.shards}`, game.canvas.width - padding, padding + 20);
    cx.fillText(`🕐 Time: ${A.U.fmtTime(game.gameTime)}`, game.canvas.width - padding, padding + 40);
    cx.fillText(`⚔️ Kills: ${game.kills}`, game.canvas.width - padding, padding + 60);
    cx.fillText(`🎯 Score: ${A.U.fmtNum(game.score)}`, game.canvas.width - padding, padding + 80);
    
    // Weapon indicators
    const weapons = ['fireball', 'whip', 'chain', 'orbit', 'laser', 'frost'];
    const icons = ['🔥', '⚡', '⛓', '🌀', '💙', '❄'];
    let yPos = game.canvas.height - padding - (weapons.length * 25);
    for (let i = 0; i < weapons.length; i++){
      const w = weapons[i];
      const unlocked = save.unlocked[w];
      cx.fillStyle = unlocked ? '#44ff44' : '#666';
      cx.font = 'bold 16px Arial';
      cx.textAlign = 'left';
      cx.fillText(icons[i], padding, yPos + (i * 25));
      cx.font = '12px Arial';
      cx.fillText(unlocked ? w : 'locked', padding + 30, yPos + (i * 25));
    }
  },

  drawPauseMenu(cx, game){
    // Dark overlay
    cx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    cx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Title
    cx.fillStyle = '#fff';
    cx.font = 'bold 48px Arial';
    cx.textAlign = 'center';
    cx.fillText('PAUSED', game.canvas.width / 2, game.canvas.height / 2 - 60);
    
    // Resume button
    A.UI.drawButton(cx, game.canvas.width / 2 - 80, game.canvas.height / 2 + 20, 160, 50, 'RESUME', '#44ff44');
    
    // Quit button
    A.UI.drawButton(cx, game.canvas.width / 2 - 80, game.canvas.height / 2 + 90, 160, 50, 'QUIT', '#ff4444');
  },

  drawGameOverMenu(cx, game, save){
    // Dark overlay
    cx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    cx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Title
    cx.fillStyle = '#ff4444';
    cx.font = 'bold 64px Arial';
    cx.textAlign = 'center';
    cx.fillText('GAME OVER', game.canvas.width / 2, game.canvas.height / 2 - 100);
    
    // Stats
    cx.fillStyle = '#fff';
    cx.font = '18px Arial';
    cx.textAlign = 'center';
    cx.fillText(`Level: ${game.player.level}`, game.canvas.width / 2, game.canvas.height / 2 - 20);
    cx.fillText(`Score: ${A.U.fmtNum(game.score)}`, game.canvas.width / 2, game.canvas.height / 2 + 15);
    cx.fillText(`Time: ${A.U.fmtTime(game.gameTime)}`, game.canvas.width / 2, game.canvas.height / 2 + 50);
    cx.fillText(`Enemies Killed: ${game.kills}`, game.canvas.width / 2, game.canvas.height / 2 + 85);
    
    // Restart button
    A.UI.drawButton(cx, game.canvas.width / 2 - 80, game.canvas.height / 2 + 140, 160, 50, 'RESTART', '#44ff44');
  },

  drawMainMenu(cx, game, save){
    // Background
    cx.fillStyle = '#1a1a2e';
    cx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Title
    cx.fillStyle = '#fff';
    cx.font = 'bold 72px Arial';
    cx.textAlign = 'center';
    cx.fillText('AETHERIS', game.canvas.width / 2, 100);
    
    cx.fillStyle = '#aaa';
    cx.font = '18px Arial';
    cx.fillText('A roguelike bullet hell', game.canvas.width / 2, 150);
    
    // Shards display
    cx.fillStyle = '#ffff00';
    cx.font = 'bold 24px Arial';
    cx.fillText(`💰 Shards: ${save.shards}`, game.canvas.width / 2, 220);
    
    // Stats
    cx.fillStyle = '#aaa';
    cx.font = '14px Arial';
    cx.fillText(`Best Score: ${A.U.fmtNum(save.stats.bestScore)}`, game.canvas.width / 2, 270);
    cx.fillText(`Total Runs: ${save.stats.totalRuns}`, game.canvas.width / 2, 300);
    cx.fillText(`Boss Kills: ${save.stats.bossesKilled}`, game.canvas.width / 2, 330);
    
    // Play button
    A.UI.drawButton(cx, game.canvas.width / 2 - 100, game.canvas.height / 2 + 80, 200, 60, 'PLAY', '#44ff44');
    
    // Upgrades button
    A.UI.drawButton(cx, game.canvas.width / 2 - 100, game.canvas.height / 2 + 160, 200, 60, 'UPGRADES', '#4488ff');
    
    // Settings button
    A.UI.drawButton(cx, game.canvas.width / 2 - 100, game.canvas.height / 2 + 240, 200, 60, 'SETTINGS', '#ffaa44');
  },

  drawUpgradesMenu(cx, game, save){
    // Background
    cx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    cx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Title
    cx.fillStyle = '#fff';
    cx.font = 'bold 48px Arial';
    cx.textAlign = 'center';
    cx.fillText('UPGRADES', game.canvas.width / 2, 60);
    
    // Shards
    cx.fillStyle = '#ffff00';
    cx.font = 'bold 24px Arial';
    cx.fillText(`💰 ${save.shards} Shards`, game.canvas.width / 2, 120);
    
    // Passives list
    cx.fillStyle = '#fff';
    cx.font = 'bold 16px Arial';
    cx.textAlign = 'left';
    const startY = 180;
    const passives = Object.keys(A.PASS);
    for (let i = 0; i < passives.length; i++){
      const key = passives[i];
      const passive = A.PASS[key];
      const level = save.meta[key] || 0;
      const cost = Math.floor(100 * Math.pow(1.15, level));
      
      cx.fillStyle = level >= passive.max ? '#666' : '#fff';
      cx.fillText(`${passive.icon} ${passive.name}`, 40, startY + i * 35);
      
      cx.font = '12px Arial';
      cx.fillStyle = '#aaa';
      cx.fillText(`Level ${level}/${passive.max}`, 40, startY + i * 35 + 15);
      
      cx.font = 'bold 14px Arial';
      cx.fillStyle = level >= passive.max ? '#666' : '#ffff00';
      cx.textAlign = 'right';
      cx.fillText(`Cost: ${cost}`, game.canvas.width - 40, startY + i * 35);
      cx.textAlign = 'left';
    }
    
    // Back button
    A.UI.drawButton(cx, game.canvas.width / 2 - 80, game.canvas.height - 80, 160, 50, 'BACK', '#ff6b6b');
  },

  drawSettingsMenu(cx, game, save){
    // Background
    cx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    cx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Title
    cx.fillStyle = '#fff';
    cx.font = 'bold 48px Arial';
    cx.textAlign = 'center';
    cx.fillText('SETTINGS', game.canvas.width / 2, 60);
    
    // Screen shake toggle
    cx.fillStyle = '#fff';
    cx.font = 'bold 18px Arial';
    cx.textAlign = 'left';
    cx.fillText('Screen Shake', 40, 150);
    const shakeColor = save.settings.screenShake ? '#44ff44' : '#ff4444';
    A.UI.drawToggle(cx, game.canvas.width - 100, 130, save.settings.screenShake, shakeColor);
    
    // Flash toggle
    cx.fillText('Screen Flash', 40, 210);
    const flashColor = save.settings.flash ? '#44ff44' : '#ff4444';
    A.UI.drawToggle(cx, game.canvas.width - 100, 190, save.settings.flash, flashColor);
    
    // Back button
    A.UI.drawButton(cx, game.canvas.width / 2 - 80, game.canvas.height - 80, 160, 50, 'BACK', '#ff6b6b');
  },

  drawLevelUpMenu(cx, game){
    // Overlay
    cx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    cx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Title
    cx.fillStyle = '#ffff00';
    cx.font = 'bold 48px Arial';
    cx.textAlign = 'center';
    cx.fillText('LEVEL UP!', game.canvas.width / 2, 80);
    
    // Three options
    const choices = game.levelUpChoices || [];
    for (let i = 0; i < 3; i++){
      const choice = choices[i];
      if (!choice) continue;
      
      const y = game.canvas.height / 2 + (i - 1) * 80;
      A.UI.drawButton(cx, game.canvas.width / 2 - 120, y, 240, 60, choice.name, '#4488ff');
      
      cx.fillStyle = '#aaa';
      cx.font = '12px Arial';
      cx.textAlign = 'center';
      cx.fillText(choice.desc, game.canvas.width / 2, y + 50);
    }
  },

  drawButton(cx, x, y, w, h, text, color){
    // Button background
    cx.fillStyle = color;
    A.roundRect(cx, x, y, w, h, 8);
    
    // Border
    cx.strokeStyle = '#fff';
    cx.lineWidth = 2;
    A.strokeRoundRect(cx, x, y, w, h, 8);
    
    // Text
    cx.fillStyle = '#000';
    cx.font = 'bold 20px Arial';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillText(text, x + w / 2, y + h / 2);
  },

  drawToggle(cx, x, y, enabled, color){
    const w = 50;
    const h = 30;
    const r = h / 2;
    
    // Background
    cx.fillStyle = enabled ? color : '#444';
    A.roundRect(cx, x, y, w, h, r);
    
    // Circle
    cx.fillStyle = '#fff';
    cx.beginPath();
    const circleX = enabled ? x + w - r : x + r;
    cx.arc(circleX, y + r, r - 2, 0, Math.PI * 2);
    cx.fill();
  },

  drawReactionIndicator(cx, game){
    if (!game.lastReaction || Date.now() - game.lastReactionTime > 2000) return;
    
    const alpha = Math.max(0, 1 - (Date.now() - game.lastReactionTime) / 2000);
    cx.fillStyle = `rgba(${game.lastReaction.col}, ${alpha})`;
    cx.globalAlpha = alpha;
    
    cx.font = 'bold 32px Arial';
    cx.textAlign = 'center';
    cx.fillText(game.lastReaction.name, game.canvas.width / 2, 200);
    
    cx.globalAlpha = 1;
  },

  drawWaveIndicator(cx, game){
    cx.fillStyle = '#fff';
    cx.font = '14px Arial';
    cx.textAlign = 'right';
    const waveText = `Wave: ${game.waveCount}`;
    cx.fillText(waveText, game.canvas.width - 20, 20);
  }
};

})();
