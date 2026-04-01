(function(){
'use strict';
const A = window.AETH;

class Entity {
  constructor(x, y, r){
    this.x = x; this.y = y; this.r = r;
    this.vx = 0; this.vy = 0;
    this.hp = 1; this.maxHp = 1;
    this.a = 1; // active flag
  }
  update(dt){}
  draw(cx){}
  collidesWith(other){
    return A.U.distSq(this.x, this.y, other.x, other.y) < (this.r + other.r) ** 2;
  }
}

class Player extends Entity {
  constructor(x, y){
    super(x, y, A.CFG.P_R);
    this.hp = A.CFG.P_HP;
    this.maxHp = A.CFG.P_HP;
    this.spd = A.CFG.P_SPEED;
    this.pow = 1;
    this.arm = 0;
    this.mag = 0;
    this.reg = 0;
    this.cat = 0;
    this.xpb = 1;
    this.lck = 0;
    this.level = 1;
    this.xp = 0;
    this.xpReq = A.CFG.XP_REQ;
    this.energy = A.CFG.MAX_EN;
    this.maxEnergy = A.CFG.MAX_EN;
    this.dashCd = 0;
    this.invulnTime = 0;
    this.dir = 0;
    this.moving = false;
    this.weapons = { fireball: true, whip: false, chain: false, orbit: false, laser: false, frost: false };
    this.weaponCds = {};
    for (let k in this.weapons) this.weaponCds[k] = 0;
    this.flashing = false;
    this.flashTime = 0;
  }

  update(dt, input, game){
    // Movement
    this.vx = 0;
    this.vy = 0;
    this.moving = false;
    if (input.up) { this.vy -= this.spd; this.moving = true; }
    if (input.down) { this.vy += this.spd; this.moving = true; }
    if (input.left) { this.vx -= this.spd; this.moving = true; }
    if (input.right) { this.vx += this.spd; this.moving = true; }
    
    const mag = Math.hypot(this.vx, this.vy);
    if (mag > 0){
      this.vx = this.vx / mag * this.spd;
      this.vy = this.vy / mag * this.spd;
      this.dir = A.U.ang(0, 0, this.vx, this.vy);
    }
    
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    // World bounds
    this.x = A.U.clamp(this.x, this.r, A.CFG.WORLD_SIZE - this.r);
    this.y = A.U.clamp(this.y, this.r, A.CFG.WORLD_SIZE - this.r);
    
    // Dash
    if (input.dash && this.dashCd <= 0){
      this.vx = Math.cos(this.dir) * A.CFG.DASH_SPEED;
      this.vy = Math.sin(this.dir) * A.CFG.DASH_SPEED;
      this.dashCd = A.CFG.DASH_CD;
      A.SND.play('dash');
    }
    this.dashCd -= dt;
    
    // Regen
    if (this.hp < this.maxHp){
      this.hp += this.reg * dt;
      if (this.hp > this.maxHp) this.hp = this.maxHp;
    }
    
    // Invulnerability
    this.invulnTime -= dt;
    this.flashing = this.invulnTime > 0;
    
    // Energy
    this.energy = Math.min(this.energy + 30 * dt, this.maxEnergy);
    
    // Weapon cooldowns
    for (let k in this.weaponCds) this.weaponCds[k] -= dt;
    
    // Weapon fire
    if (input.shoot && this.energy >= 10){
      this.fireWeapons(game);
      this.energy -= 10;
    }
  }

  fireWeapons(game){
    if (this.weapons.fireball && this.weaponCds.fireball <= 0){
      const angle = this.dir + A.U.rand(-0.15, 0.15);
      const bullet = new Bullet(this.x, this.y, Math.cos(angle) * 450, Math.sin(angle) * 450, 8, '#ff6e40', 3, 'fireball');
      game.bullets.push(bullet);
      this.weaponCds.fireball = 0.4;
      A.SND.play('shoot');
    }
    
    if (this.weapons.whip && this.weaponCds.whip <= 0){
      const angle = this.dir;
      for (let i = -2; i <= 2; i++){
        const a = angle + i * 0.2;
        const bullet = new Bullet(this.x, this.y, Math.cos(a) * 380, Math.sin(a) * 380, 6, '#ff9800', 2.5, 'whip');
        game.bullets.push(bullet);
      }
      this.weaponCds.whip = 0.5;
      A.SND.play('shoot');
    }
    
    if (this.weapons.chain && this.weaponCds.chain <= 0){
      const angle = this.dir;
      for (let i = 0; i < 3; i++){
        const delay = i * 0.05;
        setTimeout(() => {
          const bullet = new Bullet(this.x, this.y, Math.cos(angle) * 420, Math.sin(angle) * 420, 7, '#ffd700', 2.8, 'chain');
          game.bullets.push(bullet);
        }, delay * 1000);
      }
      this.weaponCds.chain = 0.45;
      A.SND.play('shoot');
    }
    
    if (this.weapons.orbit && this.weaponCds.orbit <= 0){
      const count = 6;
      for (let i = 0; i < count; i++){
        const angle = (Math.PI * 2 * i) / count;
        const bullet = new Bullet(this.x, this.y, Math.cos(angle) * 300, Math.sin(angle) * 300, 5, '#ba68c8', 2, 'orbit');
        game.bullets.push(bullet);
      }
      this.weaponCds.orbit = 0.6;
      A.SND.play('shoot');
    }
    
    if (this.weapons.laser && this.weaponCds.laser <= 0){
      const bullet = new Bullet(this.x, this.y, Math.cos(this.dir) * 500, Math.sin(this.dir) * 500, 10, '#00e5ff', 4, 'laser');
      game.bullets.push(bullet);
      this.weaponCds.laser = 0.8;
      A.SND.play('shoot');
    }
    
    if (this.weapons.frost && this.weaponCds.frost <= 0){
      const angle = this.dir;
      const bullet = new Bullet(this.x, this.y, Math.cos(angle) * 350, Math.sin(angle) * 350, 8, '#80deea', 2.5, 'frost');
      bullet.freeze = true;
      game.bullets.push(bullet);
      this.weaponCds.frost = 0.55;
      A.SND.play('shoot');
    }
  }

  takeDamage(amount, game){
    if (this.invulnTime > 0) return;
    const actualDamage = amount * (1 - this.arm);
    this.hp -= actualDamage;
    this.invulnTime = A.CFG.P_INV;
    A.SND.play('ouch');
    if (game.settings.screenShake) game.screenShake = 0.08;
    if (game.settings.flash) game.flashScreen = 0.1;
  }

  gainXP(amount, game){
    this.xp += amount * this.xpb;
    while (this.xp >= this.xpReq && this.level < A.CFG.MAX_LEVEL){
      this.xp -= this.xpReq;
      this.level++;
      this.xpReq = Math.floor(A.CFG.XP_REQ * Math.pow(A.CFG.XP_GROW, this.level - 1));
      A.SND.play('lvl');
      game.levelUp = true;
    }
    if (this.xp > this.xpReq) this.xp = this.xpReq;
  }

  draw(cx){
    cx.fillStyle = this.flashing ? '#ffeb3b' : '#fff';
    cx.beginPath();
    cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    cx.fill();
    
    cx.strokeStyle = '#ffd700';
    cx.lineWidth = 2;
    cx.stroke();
    
    // Direction indicator
    const dirLen = this.r * 0.7;
    cx.strokeStyle = '#ffd700';
    cx.lineWidth = 2;
    cx.beginPath();
    cx.moveTo(this.x, this.y);
    cx.lineTo(this.x + Math.cos(this.dir) * dirLen, this.y + Math.sin(this.dir) * dirLen);
    cx.stroke();
  }
}

class Enemy extends Entity {
  constructor(x, y, type){
    super(x, y, 6);
    this.type = type;
    this.hp = 20;
    this.maxHp = 20;
    this.speed = 100;
    this.damage = 5;
    this.xpReward = 5;
    this.color = '#ff6b6b';
    this.target = null;
    this.shootCd = 0;
    this.elements = [];
  }

  update(dt, player, game){
    if (!player || !player.a) return;
    
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist > 0){
      this.vx = (dx / dist) * this.speed;
      this.vy = (dy / dist) * this.speed;
    }
    
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    this.shootCd -= dt;
    if (this.shootCd <= 0 && dist < 200){
      this.shoot(game, player);
      this.shootCd = A.U.rand(0.8, 1.5);
    }
  }

  shoot(game, player){
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;
    
    const bullet = new EnemyBullet(this.x, this.y, (dx / dist) * 200, (dy / dist) * 200, 5, '#ff4444');
    game.enemyBullets.push(bullet);
  }

  takeDamage(amount){
    this.hp -= amount;
  }

  draw(cx){
    cx.fillStyle = this.color;
    cx.beginPath();
    cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    cx.fill();
    
    cx.strokeStyle = '#000';
    cx.lineWidth = 1;
    cx.stroke();
    
    if (this.hp < this.maxHp){
      cx.fillStyle = '#ff4444';
      cx.fillRect(this.x - this.r, this.y - this.r - 8, (this.hp / this.maxHp) * this.r * 2, 3);
    }
  }
}

class Boss extends Enemy {
  constructor(x, y){
    super(x, y, 'boss');
    this.r = 12;
    this.hp = 200;
    this.maxHp = 200;
    this.speed = 80;
    this.damage = 15;
    this.xpReward = 100;
    this.color = '#ff00ff';
    this.shootCd = 1;
    this.phase = 1;
  }

  update(dt, player, game){
    super.update(dt, player, game);
    
    if (this.hp < this.maxHp / 2){
      this.phase = 2;
      this.speed = 120;
    }
    
    if (this.hp < this.maxHp / 4){
      this.phase = 3;
      this.speed = 150;
    }
  }

  shoot(game, player){
    const count = this.phase + 2;
    for (let i = 0; i < count; i++){
      const angle = (Math.PI * 2 * i) / count;
      const bullet = new EnemyBullet(this.x, this.y, Math.cos(angle) * 250, Math.sin(angle) * 250, 6, '#ff00ff');
      game.enemyBullets.push(bullet);
    }
  }

  draw(cx){
    cx.fillStyle = this.color;
    cx.beginPath();
    cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    cx.fill();
    
    cx.strokeStyle = '#ffff00';
    cx.lineWidth = 2;
    cx.stroke();
    
    if (this.hp < this.maxHp){
      cx.fillStyle = '#ff4444';
      cx.fillRect(this.x - this.r, this.y - this.r - 10, (this.hp / this.maxHp) * this.r * 2, 4);
    }
  }
}

class Bullet extends Entity {
  constructor(x, y, vx, vy, r, color, damage, type){
    super(x, y, r);
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.damage = damage;
    this.type = type;
    this.lifetime = 10;
    this.freeze = false;
    this.trail = [];
  }

  update(dt){
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;
    
    if (this.lifetime <= 0) this.a = 0;
    
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 20) this.trail.shift();
    
    if (this.x < 0 || this.x > A.CFG.WORLD_SIZE || this.y < 0 || this.y > A.CFG.WORLD_SIZE){
      this.a = 0;
    }
  }

  draw(cx){
    // Trail
    cx.strokeStyle = this.color;
    cx.globalAlpha = 0.3;
    cx.lineWidth = this.r * 0.5;
    cx.beginPath();
    if (this.trail.length > 0){
      cx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++){
        cx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      cx.stroke();
    }
    cx.globalAlpha = 1;
    
    // Main bullet
    cx.fillStyle = this.color;
    cx.beginPath();
    cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    cx.fill();
  }
}

class EnemyBullet extends Entity {
  constructor(x, y, vx, vy, r, color){
    super(x, y, r);
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.lifetime = 8;
  }

  update(dt){
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;
    
    if (this.lifetime <= 0) this.a = 0;
    
    if (this.x < 0 || this.x > A.CFG.WORLD_SIZE || this.y < 0 || this.y > A.CFG.WORLD_SIZE){
      this.a = 0;
    }
  }

  draw(cx){
    cx.fillStyle = this.color;
    cx.beginPath();
    cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    cx.fill();
    
    cx.strokeStyle = '#fff';
    cx.lineWidth = 1;
    cx.stroke();
  }
}

class Particle extends Entity {
  constructor(x, y, vx, vy, r, color, lifetime){
    super(x, y, r);
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
  }

  update(dt){
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 200 * dt; // gravity
    this.lifetime -= dt;
    
    if (this.lifetime <= 0) this.a = 0;
  }

  draw(cx){
    const alpha = this.lifetime / this.maxLifetime;
    cx.fillStyle = this.color;
    cx.globalAlpha = alpha;
    cx.beginPath();
    cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    cx.fill();
    cx.globalAlpha = 1;
  }
}

class TextFloaty extends Entity {
  constructor(x, y, text, color){
    super(x, y, 0);
    this.text = text;
    this.color = color;
    this.lifetime = 1.5;
    this.maxLifetime = 1.5;
    this.vy = -80;
  }

  update(dt){
    this.y += this.vy * dt;
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.a = 0;
  }

  draw(cx){
    const alpha = this.lifetime / this.maxLifetime;
    cx.fillStyle = this.color;
    cx.globalAlpha = alpha;
    cx.font = 'bold 16px Arial';
    cx.textAlign = 'center';
    cx.fillText(this.text, this.x, this.y);
    cx.globalAlpha = 1;
  }
}

A.Entity = Entity;
A.Player = Player;
A.Enemy = Enemy;
A.Boss = Boss;
A.Bullet = Bullet;
A.EnemyBullet = EnemyBullet;
A.Particle = Particle;
A.TextFloaty = TextFloaty;

})();
