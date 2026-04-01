(function(){
'use strict';
const A = window.AETH;

const data = {};

function addPassive(key, name, icon, desc, max, col, apply){
  data[key] = { name, icon, desc, max, col, apply };
}

function addReact(t1, t2, name, mult, xpMag, col, blend){
  A.REACT = A.REACT || {};
  A.REACT[t1 + t2] = { name, mult, xpMag, col, blend };
  A.REACT[t2 + t1] = { name, mult, xpMag, col, blend };
}

// PASSIVES
addPassive('hp', 'HP', '❤', '+20 health', 5, '#ff5252', s=>{ s.hp += 20; s.maxHp += 20; });
addPassive('power', 'Power', '⚡', '+8% damage', 5, '#ffd740', s=>{ s.pow *= 1.08; });
addPassive('speed', 'Speed', '💨', '+5% attack speed', 5, '#4fc3f7', s=>{ s.spd *= 1.05; });
addPassive('armor', 'Armor', '🛡', '+3% damage reduction', 5, '#42a5f5', s=>{ s.arm += 0.03; });
addPassive('magnet', 'Magnet', '🧲', '+15% pickup range', 5, '#ba68c8', s=>{ s.mag += 0.15; });
addPassive('regen', 'Regen', '🩹', '+0.5 HP/sec', 5, '#81c784', s=>{ s.reg += 0.5; });
addPassive('catalyst', 'Catalyst', '✨', '+12% reaction chance', 5, '#e91e63', s=>{ s.cat += 0.12; });
addPassive('xp', 'XP Bonus', '📈', '+8% XP gain', 5, '#9ccc65', s=>{ s.xpb *= 1.08; });
addPassive('luck', 'Luck', '🍀', '+3% rare drop chance', 5, '#26a69a', s=>{ s.lck += 0.03; });

// REACTIONS
addReact('fire', 'water', 'Steam', 1.5, 80, '#b3e5fc', 'lighter');
addReact('fire', 'ice', 'Meteor', 2.2, 140, '#ff6e40', 'screen');
addReact('fire', 'nature', 'Wildfire', 2.0, 130, '#ff7043', 'multiply');
addReact('fire', 'lightning', 'Plasma', 2.5, 160, '#ffca28', 'screen');
addReact('fire', 'wind', 'Inferno', 2.3, 150, '#ff5722', 'screen');
addReact('fire', 'shadow', 'Hellfire', 2.4, 155, '#d32f2f', 'screen');
addReact('water', 'ice', 'Blizzard', 2.1, 135, '#81d4fa', 'screen');
addReact('water', 'nature', 'Swamp', 1.8, 110, '#66bb6a', 'darken');
addReact('water', 'lightning', 'Electrocute', 2.3, 145, '#64b5f6', 'screen');
addReact('water', 'wind', 'Typhoon', 2.2, 140, '#4fc3f7', 'screen');
addReact('water', 'shadow', 'Drown', 2.0, 125, '#0d47a1', 'darken');
addReact('ice', 'nature', 'Frost', 1.9, 120, '#80deea', 'lighten');
addReact('ice', 'lightning', 'Frostbolt', 2.4, 150, '#01579b', 'screen');
addReact('ice', 'wind', 'Hailstorm', 2.1, 135, '#b3e5fc', 'screen');
addReact('ice', 'shadow', 'Absolute Zero', 2.6, 170, '#0d47a1', 'screen');
addReact('nature', 'lightning', 'Overgrowth', 2.2, 140, '#7cb342', 'screen');
addReact('nature', 'wind', 'Tornado', 2.3, 145, '#9ccc65', 'screen');
addReact('nature', 'shadow', 'Decay', 2.1, 135, '#558b2f', 'multiply');
addReact('lightning', 'wind', 'Spark Storm', 2.4, 155, '#ffd54f', 'screen');
addReact('lightning', 'shadow', 'Dark Energy', 2.3, 150, '#455a64', 'multiply');
addReact('wind', 'shadow', 'Void', 2.2, 140, '#37474f', 'multiply');
addReact('light', 'fire', 'Radiance', 2.0, 125, '#fff59d', 'screen');
addReact('light', 'water', 'Sanctuary', 1.9, 120, '#b2dfdb', 'lighten');
addReact('light', 'ice', 'Aurora', 2.1, 135, '#80deea', 'lighten');
addReact('light', 'nature', 'Blessing', 2.0, 130, '#c8e6c9', 'lighten');
addReact('light', 'lightning', 'Holy Light', 2.4, 155, '#fff9c4', 'screen');
addReact('light', 'wind', 'Divine Wind', 2.2, 140, '#e0f2f1', 'lighten');
addReact('light', 'shadow', 'Eclipse', 2.0, 500, '#b388ff', 'screen');

A.PASS = data;

})();
