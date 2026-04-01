/* ===================================================
   CommandForge — script.js  (no API required)
   Local template engine generates real Minecraft commands.
=================================================== */

const LS_KEY_VER = 'cf_version';

// ─── DOM refs ────────────────────────────────────────
const versionSelect  = document.getElementById('versionSelect');
const versionGate    = document.getElementById('versionGate');
const mainTool       = document.getElementById('mainTool');
const promptInput    = document.getElementById('promptInput');
const generateBtn    = document.getElementById('generateBtn');
const genError       = document.getElementById('genError');
const outputPanel    = document.getElementById('outputPanel');
const presetCards    = document.querySelectorAll('.preset-card');
const tabBtns        = document.querySelectorAll('.tab-btn');
const tabPanes       = document.querySelectorAll('.tab-pane');

const outHowItWorks = document.getElementById('out-how-it-works-content');
const outSetup      = document.getElementById('out-setup-content');
const outRepeating  = document.getElementById('out-repeating-content');
const outGive       = document.getElementById('out-give-content');

const bbWorkspace   = document.getElementById('bb-workspace');
const bbDropHint    = document.getElementById('bb-drop-hint');
const bbPreview     = document.getElementById('bb-preview');
const bbClearBtn    = document.getElementById('bb-clear');
const bbCopyBtn     = document.getElementById('bb-copy-cmd');

// ─── Init ────────────────────────────────────────────
(function init() {
  const savedVer = localStorage.getItem(LS_KEY_VER);
  if (savedVer) {
    versionSelect.value = savedVer;
    checkVersionGate();
  }
})();

// ─── Version Gate ────────────────────────────────────
versionSelect.addEventListener('change', () => {
  localStorage.setItem(LS_KEY_VER, versionSelect.value);
  checkVersionGate();
});

function checkVersionGate() {
  if (versionSelect.value) {
    versionGate.classList.add('hidden');
    mainTool.classList.remove('hidden');
  } else {
    versionGate.classList.remove('hidden');
    mainTool.classList.add('hidden');
  }
}

// ─── Tabs ────────────────────────────────────────────
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
    btn.classList.add('active');
    const pane = document.getElementById('tab-' + btn.dataset.tab);
    pane.classList.remove('hidden');
    pane.classList.add('active');
  });
});

// ─── Preset Prompts ──────────────────────────────────
const PRESET_PROMPTS = {
  'gun':            'gun',
  'jetpack':        'jetpack',
  'lightning-sword':'lightning sword',
  'grappling-hook': 'grappling hook',
  'grenade':        'grenade',
  'item-magnet':    'item magnet',
  'magic-armor':    'magic armor',
  'teleport-wand':  'teleport wand'
};

presetCards.forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.preset;
    if (PRESET_PROMPTS[key]) {
      promptInput.value = PRESET_PROMPTS[key];
      promptInput.focus();
    }
  });
});

// ─── Keyword → template matching ────────────────────
const KEYWORD_MAP = [
  { keys: ['gun','shoot','bullet','pistol','rifle','cannon','blast','fire'],  id: 'gun' },
  { keys: ['jetpack','fly','levitat','rocket','boost','hover','float'],        id: 'jetpack' },
  { keys: ['lightning','thunder','bolt','strike','zap','electric'],            id: 'lightning-sword' },
  { keys: ['grapple','hook','swing','latch','grappling','rope'],               id: 'grappling-hook' },
  { keys: ['grenade','bomb','explo','tnt','detonate','fuse'],                  id: 'grenade' },
  { keys: ['magnet','attract','pull','collect','pickup','suck','item'],        id: 'item-magnet' },
  { keys: ['armor','shield','protect','defence','defense','resist','magic'],   id: 'magic-armor' },
  { keys: ['teleport','warp','tp','blink','dash','wand','instant','phase'],    id: 'teleport-wand' },
];

function matchTemplate(text) {
  const lower = text.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.keys.some(k => lower.includes(k))) return entry.id;
  }
  return null;
}

// ─── Version grouping ────────────────────────────────
function vGroup(ver) {
  if (ver === 'Java 1.21+')     return 'j21';
  if (ver === 'Java 1.20.x')    return 'j20';
  if (ver.startsWith('Java'))   return 'jold';
  return 'bedrock';
}

// ─── Templates ───────────────────────────────────────
// Each gadget has entries for: j21, j20, jold, bedrock
// Each entry: { howItWorks, setup, repeating, give }

const T = {};

/* ══════════════ GUN ══════════════ */
T['gun'] = {
  howItWorks: `A "⚡ Gun" item made from a Carrot on a Stick.
When you right-click it, the minecraft.used statistic increments.
Each tick a repeating command block detects the use, summons a
snowball projectile aimed forward, plays a shoot sound, then resets
the counter so only one bullet fires per click.`,

  j21: {
    setup:
`# Run these once in chat or a command block:
scoreboard objectives add gun_use minecraft.used:minecraft.carrot_on_a_stick`,
    repeating:
`# Fire projectile aimed forward from the player's eyes
execute as @a[scores={gun_use=1..}] at @s anchored eyes run summon minecraft:snowball ^ ^ ^1
# Shooting sound
execute as @a[scores={gun_use=1..}] at @s run playsound minecraft:entity.arrow.shoot master @s ~ ~ ~ 1 2
# Reset counter
execute as @a[scores={gun_use=1..}] run scoreboard players set @s gun_use 0`,
    give:
`/give @p minecraft:carrot_on_a_stick[item_name='{"text":"⚡ Gun","color":"gold","italic":false}',custom_model_data=1001] 1`
  },

  j20: {
    setup:
`scoreboard objectives add gun_use minecraft.used:minecraft.carrot_on_a_stick`,
    repeating:
`execute as @a[scores={gun_use=1..}] at @s anchored eyes run summon minecraft:snowball ^ ^ ^1
execute as @a[scores={gun_use=1..}] at @s run playsound minecraft:entity.arrow.shoot master @s ~ ~ ~ 1 2
execute as @a[scores={gun_use=1..}] run scoreboard players set @s gun_use 0`,
    give:
`/give @p minecraft:carrot_on_a_stick{display:{Name:'{"text":"⚡ Gun","color":"gold","italic":false}'},CustomModelData:1001} 1`
  },

  jold: {
    setup:
`scoreboard objectives add gun_use minecraft.used:minecraft.carrot_on_a_stick`,
    repeating:
`execute as @a[scores={gun_use=1..}] at @s run summon minecraft:snowball ^ ^ ^1
execute as @a[scores={gun_use=1..}] at @s run playsound minecraft:entity.arrow.shoot master @s ~ ~ ~ 1 2
execute as @a[scores={gun_use=1..}] run scoreboard players set @s gun_use 0`,
    give:
`/give @p minecraft:carrot_on_a_stick{display:{Name:'{"text":"⚡ Gun","color":"gold","italic":false}'}} 1`
  },

  bedrock: {
    setup:
`# Bedrock has no direct right-click detection on items.
# Use a button connected to a command block to trigger firing instead.
scoreboard objectives add gun_fire dummy`,
    repeating:
`# Wire a button → command block: scoreboard players set @a[r=5] gun_fire 1
execute as @a[scores={gun_fire=1..}] at @s run summon snowball ^ ^ ^1
execute as @a[scores={gun_fire=1..}] at @s run playsound shoot.bow @a[r=3]
execute as @a[scores={gun_fire=1..}] run scoreboard players set @s gun_fire 0`,
    give: `/give @p carrot_on_a_stick 1 0`
  }
};

/* ══════════════ JETPACK ══════════════ */
T['jetpack'] = {
  howItWorks: `A feather renamed "🚀 Jetpack" worn in your offhand slot.
Every game tick a repeating command block checks if the jetpack
feather is in your offhand. If it is, it grants Levitation I and
Slow Falling so you float up and glide down. Cloud particles emit
from your feet while active. Remove it from your offhand to land.`,

  j21: {
    setup: `# No setup required — effect is applied passively every tick.`,
    repeating:
`# Detect jetpack feather in offhand by custom_model_data component
execute as @a[nbt={Inventory:[{Slot:-106b,id:"minecraft:feather",components:{"minecraft:custom_model_data":{value:1001}}}]}] at @s run effect give @s minecraft:levitation 1 1 true
execute as @a[nbt={Inventory:[{Slot:-106b,id:"minecraft:feather",components:{"minecraft:custom_model_data":{value:1001}}}]}] at @s run effect give @s minecraft:slow_falling 1 0 true
execute as @a[nbt={Inventory:[{Slot:-106b,id:"minecraft:feather",components:{"minecraft:custom_model_data":{value:1001}}}]}] at @s run particle minecraft:cloud ~ ~0.5 ~ 0.2 0.1 0.2 0.05 3`,
    give:
`/give @p minecraft:feather[item_name='{"text":"🚀 Jetpack","color":"aqua","italic":false}',custom_model_data=1001] 1`
  },

  j20: {
    setup: `# No setup required.`,
    repeating:
`execute as @a[nbt={Inventory:[{Slot:-106b,id:"minecraft:feather",tag:{CustomModelData:1001}}]}] at @s run effect give @s minecraft:levitation 1 1 true
execute as @a[nbt={Inventory:[{Slot:-106b,id:"minecraft:feather",tag:{CustomModelData:1001}}]}] at @s run effect give @s minecraft:slow_falling 1 0 true
execute as @a[nbt={Inventory:[{Slot:-106b,id:"minecraft:feather",tag:{CustomModelData:1001}}]}] at @s run particle minecraft:cloud ~ ~0.5 ~ 0.2 0.1 0.2 0.05 3`,
    give:
`/give @p minecraft:feather{display:{Name:'{"text":"🚀 Jetpack","color":"aqua","italic":false}'},CustomModelData:1001} 1`
  },

  jold: {
    setup: `# No setup required.`,
    repeating:
`execute as @a[nbt={Inventory:[{Slot:-106b,id:"minecraft:feather",tag:{CustomModelData:1001}}]}] at @s run effect give @s minecraft:levitation 1 1 true
execute as @a[nbt={Inventory:[{Slot:-106b,id:"minecraft:feather",tag:{CustomModelData:1001}}]}] at @s run effect give @s minecraft:slow_falling 1 0 true`,
    give:
`/give @p minecraft:feather{display:{Name:'{"text":"🚀 Jetpack","color":"aqua","italic":false}'},CustomModelData:1001} 1`
  },

  bedrock: {
    setup: `# No setup required.`,
    repeating:
`# Detect feather in offhand using hasitem selector
effect @a[hasitem={item=feather,slot=slot.weapon.offhand}] levitation 1 1 true
effect @a[hasitem={item=feather,slot=slot.weapon.offhand}] slow_falling 1 0 true`,
    give: `/give @p feather 1 0`
  }
};

/* ══════════════ LIGHTNING SWORD ══════════════ */
T['lightning-sword'] = {
  howItWorks: `A diamond sword that strikes lightning at any mob you hit.
A scoreboard tracks damage dealt. When it increases, nearby mobs with
HurtTime > 0 (recently hit) get a lightning bolt summoned on them
and a thunder sound plays. The score resets each tick.`,

  j21: {
    setup:
`# Track melee damage dealt by each player
scoreboard objectives add dmg_dealt minecraft.custom:minecraft.damage_dealt`,
    repeating:
`# Store last damage value
execute as @a run scoreboard players operation @s dmg_prev = @s dmg_dealt
# Detect a new hit: damage increased this tick while holding the sword
execute as @a[nbt={SelectedItem:{id:"minecraft:diamond_sword",components:{"minecraft:custom_model_data":{value:1002}}}}] at @s run execute on target run summon minecraft:lightning_bolt ~ ~ ~
execute as @a[nbt={SelectedItem:{id:"minecraft:diamond_sword",components:{"minecraft:custom_model_data":{value:1002}}}}] at @s run execute on target run playsound minecraft:entity.lightning_bolt.thunder master @a ~ ~ ~ 100 1`,
    give:
`/give @p minecraft:diamond_sword[item_name='{"text":"⚡ Lightning Sword","color":"yellow","italic":false}',custom_model_data=1002,enchantments={levels:{"minecraft:sharpness":3}}] 1`
  },

  j20: {
    setup:
`scoreboard objectives add sw_hit minecraft.custom:minecraft.damage_dealt`,
    repeating:
`# Tag any entity near the player that has been recently hurt (HurtTime > 0)
execute as @a[nbt={SelectedItem:{id:"minecraft:diamond_sword",tag:{CustomModelData:1002}}}] at @s run tag @e[distance=..5,nbt={HurtTime:10s},tag=!just_struck] add just_struck
# Summon lightning and sound on tagged mobs
execute at @e[tag=just_struck] run summon minecraft:lightning_bolt ~ ~ ~
execute at @e[tag=just_struck] run playsound minecraft:entity.lightning_bolt.thunder master @a ~ ~ ~ 50 1
# Clean up tags
tag @e[tag=just_struck] remove just_struck`,
    give:
`/give @p minecraft:diamond_sword{display:{Name:'{"text":"⚡ Lightning Sword","color":"yellow","italic":false}'},Enchantments:[{id:"sharpness",lvl:3s}],CustomModelData:1002} 1`
  },

  jold: {
    setup:
`scoreboard objectives add sw_hit minecraft.custom:minecraft.damage_dealt`,
    repeating:
`execute as @a[nbt={SelectedItem:{id:"minecraft:diamond_sword"}}] at @s run tag @e[distance=..5,nbt={HurtTime:10s},tag=!just_struck] add just_struck
execute at @e[tag=just_struck] run summon minecraft:lightning_bolt ~ ~ ~
execute at @e[tag=just_struck] run playsound minecraft:entity.lightning_bolt.thunder master @a ~ ~ ~ 50 1
tag @e[tag=just_struck] remove just_struck`,
    give:
`/give @p minecraft:diamond_sword{display:{Name:'{"text":"⚡ Lightning Sword","color":"yellow","italic":false}'},Enchantments:[{id:"sharpness",lvl:3s}]} 1`
  },

  bedrock: {
    setup: `# No setup required.`,
    repeating:
`# Bedrock: summon lightning on all mobs within 4 blocks that have been hurt
execute as @a at @s run execute as @e[type=!player,r=4,tag=!no_strike] at @s if entity @s[rxm=-90,rx=90] run summon lightning_bolt ~ ~ ~
execute as @e[tag=just_struck_b] run tag @s remove just_struck_b`,
    give: `/give @p diamond_sword 1 0`
  }
};

/* ══════════════ GRAPPLING HOOK ══════════════ */
T['grappling-hook'] = {
  howItWorks: `A fishing rod renamed "🪝 Grappling Hook". When you cast it,
a bobber entity is created. A repeating command block detects if you
have a fishing rod bobber in the world, then teleports you toward
the bobber's location over several ticks, giving a grappling effect.
Reel it in (right-click again) to stop.`,

  j21: {
    setup:
`scoreboard objectives add hook_use minecraft.used:minecraft.fishing_rod`,
    repeating:
`# If the player cast the rod, teleport them toward their bobber
execute as @a[scores={hook_use=1..}] at @s run teleport @s ^ ^ ^0.8
# Fly toward bobber position
execute as @a at @e[type=minecraft:fishing_bobber,distance=..40,limit=1] run teleport @e[type=minecraft:fishing_bobber,distance=..40,limit=1,sort=nearest] ~ ~ ~
execute as @a[nbt={FishingBobber:{}}] at @e[type=minecraft:fishing_bobber,limit=1,sort=nearest] run teleport @s ~ ~ ~ facing @e[type=minecraft:fishing_bobber,limit=1,sort=nearest]
execute as @a[nbt={FishingBobber:{}}] at @s run teleport @s ^ ^ ^1.2
execute as @a[nbt={FishingBobber:{}}] at @s run playsound minecraft:block.chain.hit master @s ~ ~ ~ 0.5 1.5`,
    give:
`/give @p minecraft:fishing_rod[item_name='{"text":"🪝 Grappling Hook","color":"green","italic":false}',custom_model_data=1003,enchantments={levels:{"minecraft:unbreaking":10}}] 1`
  },

  j20: {
    setup:
`scoreboard objectives add hook_use minecraft.used:minecraft.fishing_rod`,
    repeating:
`# Teleport player toward their fishing bobber each tick
execute as @a[nbt={FishingBobber:{}}] at @e[type=minecraft:fishing_bobber,limit=1,sort=nearest] run teleport @s ~ ~ ~ facing @e[type=minecraft:fishing_bobber,limit=1,sort=nearest]
execute as @a[nbt={FishingBobber:{}}] at @s run teleport @s ^ ^ ^1.2
execute as @a[nbt={FishingBobber:{}}] at @s run playsound minecraft:block.chain.hit master @s ~ ~ ~ 0.5 1.5`,
    give:
`/give @p minecraft:fishing_rod{display:{Name:'{"text":"🪝 Grappling Hook","color":"green","italic":false}'},Enchantments:[{id:"unbreaking",lvl:10s}],CustomModelData:1003} 1`
  },

  jold: {
    setup:
`scoreboard objectives add hook_use minecraft.used:minecraft.fishing_rod`,
    repeating:
`execute as @a[nbt={FishingBobber:{}}] at @e[type=minecraft:fishing_bobber,limit=1,sort=nearest] run teleport @s ~ ~ ~ facing @e[type=minecraft:fishing_bobber,limit=1,sort=nearest]
execute as @a[nbt={FishingBobber:{}}] at @s run teleport @s ^ ^ ^1.2`,
    give:
`/give @p minecraft:fishing_rod{display:{Name:'{"text":"🪝 Grappling Hook","color":"green","italic":false}'},Enchantments:[{id:"unbreaking",lvl:10s}]} 1`
  },

  bedrock: {
    setup: `# No setup required.`,
    repeating:
`# Bedrock: teleport player toward their fishing bobber
execute as @e[type=fishing_hook] at @s run teleport @a[r=40] ~~~
execute as @a[hasitem={item=fishing_rod,slot=slot.weapon.mainhand}] at @e[type=fishing_hook,r=40] run teleport @s ~ ~ ~ facing @e[type=fishing_hook,r=2]
execute as @a[hasitem={item=fishing_rod,slot=slot.weapon.mainhand}] at @s run teleport @s ^ ^ ^1.5`,
    give: `/give @p fishing_rod 1 0`
  }
};

/* ══════════════ GRENADE ══════════════ */
T['grenade'] = {
  howItWorks: `A snowball renamed "💣 Grenade". When you throw it,
it lands and (on next tick) a primed TNT is summoned at the impact
point with a very short fuse (4 ticks). The TNT creates a powerful
explosion. Smoke and fire particles appear on impact.
Detect via the snowball entity disappearing near ground level.`,

  j21: {
    setup:
`# Tag thrown grenades so we can track them
# (No scoreboard setup needed)`,
    repeating:
`# Summon TNT where a grenade snowball lands (near a block)
execute as @e[type=minecraft:snowball,nbt={Item:{id:"minecraft:snowball",components:{"minecraft:custom_model_data":{value:1004}}}}] at @s if block ~ ~-0.5 ~ #minecraft:solid run summon minecraft:tnt ~ ~ ~ {Fuse:4s}
execute as @e[type=minecraft:snowball,nbt={Item:{id:"minecraft:snowball",components:{"minecraft:custom_model_data":{value:1004}}}}] at @s if block ~ ~-0.5 ~ #minecraft:solid run particle minecraft:smoke ~ ~ ~ 0.3 0.3 0.3 0.05 20
execute as @e[type=minecraft:snowball,nbt={Item:{id:"minecraft:snowball",components:{"minecraft:custom_model_data":{value:1004}}}}] at @s if block ~ ~-0.5 ~ #minecraft:solid run kill @s`,
    give:
`/give @p minecraft:snowball[item_name='{"text":"💣 Grenade","color":"dark_gray","italic":false}',custom_model_data=1004] 1`
  },

  j20: {
    setup: `# No setup required.`,
    repeating:
`# Spawn TNT at snowball landing point
execute as @e[type=minecraft:snowball] at @s if block ~ ~-0.5 ~ #minecraft:solid run summon minecraft:tnt ~ ~ ~ {Fuse:4s}
execute as @e[type=minecraft:snowball] at @s if block ~ ~-0.5 ~ #minecraft:solid run particle minecraft:smoke ~ ~ ~ 0.3 0.3 0.3 0.1 15
execute as @e[type=minecraft:snowball] at @s if block ~ ~-0.5 ~ #minecraft:solid run kill @s`,
    give:
`/give @p minecraft:snowball{display:{Name:'{"text":"💣 Grenade","color":"dark_gray","italic":false}'},CustomModelData:1004} 16`
  },

  jold: {
    setup: `# No setup required.`,
    repeating:
`execute as @e[type=minecraft:snowball] at @s if block ~ ~-0.5 ~ #minecraft:solid run summon minecraft:tnt ~ ~ ~ {Fuse:4s}
execute as @e[type=minecraft:snowball] at @s if block ~ ~-0.5 ~ #minecraft:solid run kill @s`,
    give:
`/give @p minecraft:snowball{display:{Name:'{"text":"💣 Grenade","color":"dark_gray","italic":false}'}} 16`
  },

  bedrock: {
    setup: `# No setup required.`,
    repeating:
`# Bedrock: detect snowball near solid block and spawn tnt
execute as @e[type=snowball] at @s detect ~ ~-1 ~ stone 0 run summon tnt ~ ~ ~
execute as @e[type=snowball] at @s detect ~ ~-1 ~ stone 0 run kill @s`,
    give: `/give @p snowball 16 0`
  }
};

/* ══════════════ ITEM MAGNET ══════════════ */
T['item-magnet'] = {
  howItWorks: `A lodestone/compass renamed "🧲 Item Magnet" held in your hand.
While you hold it, all dropped item entities within 8 blocks are
pulled toward you each tick using the teleport command. When items
get within 1.5 blocks they are picked up automatically via the
vanilla item pickup mechanic.`,

  j21: {
    setup: `# No setup required.`,
    repeating:
`# Pull all nearby dropped items toward the player holding the magnet
execute as @a[nbt={SelectedItem:{id:"minecraft:compass",components:{"minecraft:custom_model_data":{value:1005}}}}] at @s run execute as @e[type=minecraft:item,distance=..8] at @s run teleport @s ~-0.3 ~ ~-0.3 facing entity @a[limit=1,sort=nearest]
execute as @a[nbt={SelectedItem:{id:"minecraft:compass",components:{"minecraft:custom_model_data":{value:1005}}}}] at @s run playsound minecraft:block.amethyst_block.resonate master @s ~ ~ ~ 0.3 2`,
    give:
`/give @p minecraft:compass[item_name='{"text":"🧲 Item Magnet","color":"light_purple","italic":false}',custom_model_data=1005] 1`
  },

  j20: {
    setup: `# No setup required.`,
    repeating:
`# Teleport dropped items toward the player holding the magnet
execute as @a[nbt={SelectedItem:{id:"minecraft:compass",tag:{CustomModelData:1005}}}] at @s run execute as @e[type=minecraft:item,distance=..8] at @s run teleport @s ~ ~ ~ facing entity @a[limit=1,sort=nearest]
execute as @a[nbt={SelectedItem:{id:"minecraft:compass",tag:{CustomModelData:1005}}}] at @s run execute as @e[type=minecraft:item,distance=..8] at @e[type=minecraft:item,distance=..8] run teleport @s ~-0.25 ~ ~-0.25`,
    give:
`/give @p minecraft:compass{display:{Name:'{"text":"🧲 Item Magnet","color":"light_purple","italic":false}'},CustomModelData:1005} 1`
  },

  jold: {
    setup: `# No setup required.`,
    repeating:
`execute as @a[nbt={SelectedItem:{id:"minecraft:compass"}}] at @s run execute as @e[type=minecraft:item,distance=..8] at @s run teleport @s ~ ~ ~ facing entity @a[limit=1,sort=nearest]
execute as @a[nbt={SelectedItem:{id:"minecraft:compass"}}] as @e[type=minecraft:item,distance=..8] at @s run teleport @s ~-0.3 ~0 ~-0.3`,
    give:
`/give @p minecraft:compass{display:{Name:'{"text":"🧲 Item Magnet","color":"light_purple","italic":false}'}} 1`
  },

  bedrock: {
    setup: `# No setup required.`,
    repeating:
`# Pull items toward players holding compass
execute as @a[hasitem={item=compass,slot=slot.weapon.mainhand}] at @s run execute as @e[type=item,r=8] at @s run tp @s ~~~`,
    give: `/give @p compass 1 0`
  }
};

/* ══════════════ MAGIC ARMOR ══════════════ */
T['magic-armor'] = {
  howItWorks: `A full set of netherite armor renamed "🛡️ Magic Armor".
A repeating command block checks every tick if you're wearing all
4 pieces. If you are, it grants Regeneration II, Resistance I, and
Fire Resistance — all refreshed every second so they never wear off.
Remove any piece to lose the effects.`,

  j21: {
    setup: `# No setup required — effects are applied passively.`,
    repeating:
`# Check all 4 armor slots are wearing magic armor pieces via components
execute as @a[nbt={Inventory:[{Slot:103b,id:"minecraft:netherite_boots",components:{"minecraft:custom_model_data":{value:1006}}},{Slot:104b,id:"minecraft:netherite_leggings",components:{"minecraft:custom_model_data":{value:1006}}},{Slot:105b,id:"minecraft:netherite_chestplate",components:{"minecraft:custom_model_data":{value:1006}}},{Slot:106b,id:"minecraft:netherite_helmet",components:{"minecraft:custom_model_data":{value:1006}}}]}] at @s run effect give @s minecraft:regeneration 2 1 true
execute as @a[nbt={Inventory:[{Slot:103b,id:"minecraft:netherite_boots",components:{"minecraft:custom_model_data":{value:1006}}},{Slot:104b,id:"minecraft:netherite_leggings",components:{"minecraft:custom_model_data":{value:1006}}},{Slot:105b,id:"minecraft:netherite_chestplate",components:{"minecraft:custom_model_data":{value:1006}}},{Slot:106b,id:"minecraft:netherite_helmet",components:{"minecraft:custom_model_data":{value:1006}}}]}] at @s run effect give @s minecraft:resistance 2 0 true
execute as @a[nbt={Inventory:[{Slot:103b,id:"minecraft:netherite_boots",components:{"minecraft:custom_model_data":{value:1006}}},{Slot:106b,id:"minecraft:netherite_helmet",components:{"minecraft:custom_model_data":{value:1006}}}]}] at @s run effect give @s minecraft:fire_resistance 2 0 true`,
    give:
`/give @p minecraft:netherite_helmet[item_name='{"text":"🛡️ Magic Helmet","color":"light_purple","italic":false}',custom_model_data=1006] 1
/give @p minecraft:netherite_chestplate[item_name='{"text":"🛡️ Magic Chestplate","color":"light_purple","italic":false}',custom_model_data=1006] 1
/give @p minecraft:netherite_leggings[item_name='{"text":"🛡️ Magic Leggings","color":"light_purple","italic":false}',custom_model_data=1006] 1
/give @p minecraft:netherite_boots[item_name='{"text":"🛡️ Magic Boots","color":"light_purple","italic":false}',custom_model_data=1006] 1`
  },

  j20: {
    setup: `# No setup required.`,
    repeating:
`# Grant effects when all 4 magic armor pieces are worn
execute as @a[nbt={Inventory:[{Slot:103b,id:"minecraft:netherite_boots",tag:{CustomModelData:1006}},{Slot:104b,id:"minecraft:netherite_leggings",tag:{CustomModelData:1006}},{Slot:105b,id:"minecraft:netherite_chestplate",tag:{CustomModelData:1006}},{Slot:106b,id:"minecraft:netherite_helmet",tag:{CustomModelData:1006}}]}] run effect give @s minecraft:regeneration 2 1 true
execute as @a[nbt={Inventory:[{Slot:103b,id:"minecraft:netherite_boots",tag:{CustomModelData:1006}},{Slot:104b,id:"minecraft:netherite_leggings",tag:{CustomModelData:1006}},{Slot:105b,id:"minecraft:netherite_chestplate",tag:{CustomModelData:1006}},{Slot:106b,id:"minecraft:netherite_helmet",tag:{CustomModelData:1006}}]}] run effect give @s minecraft:resistance 2 0 true
execute as @a[nbt={Inventory:[{Slot:103b,id:"minecraft:netherite_boots",tag:{CustomModelData:1006}},{Slot:106b,id:"minecraft:netherite_helmet",tag:{CustomModelData:1006}}]}] run effect give @s minecraft:fire_resistance 2 0 true`,
    give:
`/give @p minecraft:netherite_helmet{display:{Name:'{"text":"🛡️ Magic Helmet","color":"light_purple","italic":false}'},CustomModelData:1006} 1
/give @p minecraft:netherite_chestplate{display:{Name:'{"text":"🛡️ Magic Chestplate","color":"light_purple","italic":false}'},CustomModelData:1006} 1
/give @p minecraft:netherite_leggings{display:{Name:'{"text":"🛡️ Magic Leggings","color":"light_purple","italic":false}'},CustomModelData:1006} 1
/give @p minecraft:netherite_boots{display:{Name:'{"text":"🛡️ Magic Boots","color":"light_purple","italic":false}'},CustomModelData:1006} 1`
  },

  jold: {
    setup: `# No setup required.`,
    repeating:
`# Simpler check: player wearing any netherite armor gets effects
execute as @a[nbt={Inventory:[{Slot:103b,id:"minecraft:netherite_boots"},{Slot:106b,id:"minecraft:netherite_helmet"}]}] run effect give @s minecraft:regeneration 2 1 true
execute as @a[nbt={Inventory:[{Slot:103b,id:"minecraft:netherite_boots"},{Slot:106b,id:"minecraft:netherite_helmet"}]}] run effect give @s minecraft:resistance 2 0 true
execute as @a[nbt={Inventory:[{Slot:103b,id:"minecraft:netherite_boots"},{Slot:106b,id:"minecraft:netherite_helmet"}]}] run effect give @s minecraft:fire_resistance 2 0 true`,
    give:
`/give @p minecraft:netherite_helmet{display:{Name:'{"text":"🛡️ Magic Helmet","color":"light_purple","italic":false}'}} 1
/give @p minecraft:netherite_chestplate{display:{Name:'{"text":"🛡️ Magic Chestplate","color":"light_purple","italic":false}'}} 1
/give @p minecraft:netherite_leggings{display:{Name:'{"text":"🛡️ Magic Leggings","color":"light_purple","italic":false}'}} 1
/give @p minecraft:netherite_boots{display:{Name:'{"text":"🛡️ Magic Boots","color":"light_purple","italic":false}'}} 1`
  },

  bedrock: {
    setup: `# No setup required.`,
    repeating:
`# Grant effects while wearing netherite armor set
effect @a[hasitem=[{item=netherite_helmet,slot=slot.armor.head},{item=netherite_chestplate,slot=slot.armor.chest},{item=netherite_leggings,slot=slot.armor.legs},{item=netherite_boots,slot=slot.armor.feet}]] regeneration 2 1 true
effect @a[hasitem=[{item=netherite_helmet,slot=slot.armor.head},{item=netherite_chestplate,slot=slot.armor.chest}]] resistance 2 0 true
effect @a[hasitem=[{item=netherite_boots,slot=slot.armor.feet}]] fire_resistance 2 0 true`,
    give:
`/give @p netherite_helmet 1 0
/give @p netherite_chestplate 1 0
/give @p netherite_leggings 1 0
/give @p netherite_boots 1 0`
  }
};

/* ══════════════ TELEPORT WAND ══════════════ */
T['teleport-wand'] = {
  howItWorks: `A blaze rod renamed "🌀 Teleport Wand". Right-clicking it
uses the minecraft.used statistic. A repeating command block detects
the use, then teleports you 10–15 blocks forward in the direction
you're looking (using ^ ^ ^12 relative to your facing direction).
A teleport sound and particle burst play on use.`,

  j21: {
    setup:
`scoreboard objectives add wand_use minecraft.used:minecraft.blaze_rod`,
    repeating:
`# Teleport forward 12 blocks in the player's look direction
execute as @a[scores={wand_use=1..},nbt={SelectedItem:{id:"minecraft:blaze_rod",components:{"minecraft:custom_model_data":{value:1007}}}}] at @s anchored eyes run teleport @s ^ ^ ^12
# Particles at destination
execute as @a[scores={wand_use=1..}] at @s run particle minecraft:portal ~ ~ ~ 0.5 0.5 0.5 0.2 30
# Teleport sound
execute as @a[scores={wand_use=1..}] at @s run playsound minecraft:entity.enderman.teleport master @s ~ ~ ~ 1 1
# Reset
execute as @a[scores={wand_use=1..}] run scoreboard players set @s wand_use 0`,
    give:
`/give @p minecraft:blaze_rod[item_name='{"text":"🌀 Teleport Wand","color":"dark_purple","italic":false}',custom_model_data=1007,enchantments={levels:{"minecraft:unbreaking":10}}] 1`
  },

  j20: {
    setup:
`scoreboard objectives add wand_use minecraft.used:minecraft.blaze_rod`,
    repeating:
`execute as @a[scores={wand_use=1..},nbt={SelectedItem:{id:"minecraft:blaze_rod",tag:{CustomModelData:1007}}}] at @s anchored eyes run teleport @s ^ ^ ^12
execute as @a[scores={wand_use=1..}] at @s run particle minecraft:portal ~ ~ ~ 0.5 0.5 0.5 0.2 30
execute as @a[scores={wand_use=1..}] at @s run playsound minecraft:entity.enderman.teleport master @s ~ ~ ~ 1 1
execute as @a[scores={wand_use=1..}] run scoreboard players set @s wand_use 0`,
    give:
`/give @p minecraft:blaze_rod{display:{Name:'{"text":"🌀 Teleport Wand","color":"dark_purple","italic":false}'},Enchantments:[{id:"unbreaking",lvl:10s}],CustomModelData:1007} 1`
  },

  jold: {
    setup:
`scoreboard objectives add wand_use minecraft.used:minecraft.blaze_rod`,
    repeating:
`execute as @a[scores={wand_use=1..}] at @s run teleport @s ^ ^ ^12
execute as @a[scores={wand_use=1..}] at @s run particle minecraft:portal ~ ~ ~ 0.5 0.5 0.5 0.2 20
execute as @a[scores={wand_use=1..}] at @s run playsound minecraft:entity.enderman.teleport master @s ~ ~ ~ 1 1
execute as @a[scores={wand_use=1..}] run scoreboard players set @s wand_use 0`,
    give:
`/give @p minecraft:blaze_rod{display:{Name:'{"text":"🌀 Teleport Wand","color":"dark_purple","italic":false}'}} 1`
  },

  bedrock: {
    setup:
`scoreboard objectives add wand_use dummy`,
    repeating:
`# Trigger via button → command block: scoreboard players set @a[r=3] wand_use 1
execute as @a[scores={wand_use=1..}] at @s run teleport @s ^ ^ ^12
execute as @a[scores={wand_use=1..}] at @s run particle enderman_teleport ~ ~ ~ 0.5 0.5 0.5 30
execute as @a[scores={wand_use=1..}] run scoreboard players set @s wand_use 0`,
    give: `/give @p blaze_rod 1 0`
  }
};

// ─── Generate ────────────────────────────────────────
generateBtn.addEventListener('click', runGenerate);
promptInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runGenerate();
});

function runGenerate() {
  const version = versionSelect.value;
  if (!version) { showError('Select a Minecraft version first.'); return; }

  const prompt = promptInput.value.trim();
  if (!prompt) { showError('Describe what you want to build.'); return; }

  hideError();

  const id = matchTemplate(prompt);
  if (!id) {
    showError('No matching gadget found. Try one of the presets, or use keywords like: gun, jetpack, lightning sword, grappling hook, grenade, item magnet, magic armor, teleport wand.');
    return;
  }

  const grp = vGroup(version);
  const tmpl = T[id];
  const ver  = tmpl[grp] || tmpl['j20']; // fallback

  outHowItWorks.textContent = tmpl.howItWorks.trim();
  outSetup.textContent      = ver.setup.trim();
  outRepeating.textContent  = ver.repeating.trim();
  outGive.textContent       = ver.give.trim();

  outputPanel.classList.remove('hidden');
  outputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Copy Buttons ─────────────────────────────────────
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    copyText(target.textContent, btn);
  });
});

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1500);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 1500);
  });
}

function showError(msg) { genError.textContent = msg; genError.classList.remove('hidden'); }
function hideError()    { genError.classList.add('hidden'); }

// ─── BLOCK BUILDER ───────────────────────────────────
let placedBlocks = [];
let dragSrcBlock = null;

document.querySelectorAll('.bb-block').forEach(block => {
  block.addEventListener('dragstart', e => {
    dragSrcBlock = { label: block.textContent.trim(), cmd: block.dataset.cmd, type: block.dataset.type };
    e.dataTransfer.effectAllowed = 'copy';
  });
  block.addEventListener('dragend', () => { dragSrcBlock = null; });
});

bbWorkspace.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; bbWorkspace.classList.add('drag-over'); });
bbWorkspace.addEventListener('dragleave', () => { bbWorkspace.classList.remove('drag-over'); });
bbWorkspace.addEventListener('drop', e => {
  e.preventDefault();
  bbWorkspace.classList.remove('drag-over');
  if (!dragSrcBlock) return;
  const id = 'blk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  placedBlocks.push({ id, label: dragSrcBlock.label, cmd: dragSrcBlock.cmd, type: dragSrcBlock.type });
  renderWorkspace();
});

function renderWorkspace() {
  Array.from(bbWorkspace.children).forEach(c => { if (c !== bbDropHint) bbWorkspace.removeChild(c); });

  if (placedBlocks.length === 0) {
    bbDropHint.style.display = '';
    bbPreview.textContent = '/';
    return;
  }
  bbDropHint.style.display = 'none';

  const typeColors = {
    target:'#e74c3c',position:'#3498db',effect:'#9b59b6',message:'#f39c12',
    setblock:'#7f8c8d',fill:'#7f8c8d',summon:'#f1c40f',execute:'#1abc9c',
    give:'#27ae60',clear:'#27ae60',sound:'#e67e22',tag:'#8e44ad',score:'#8e44ad'
  };

  placedBlocks.forEach((blk, i) => {
    if (i > 0) {
      const arrow = document.createElement('div');
      arrow.className = 'bb-connector';
      arrow.textContent = '→';
      bbWorkspace.appendChild(arrow);
    }
    const el = document.createElement('div');
    el.className = 'bb-placed-block';
    el.dataset.id = blk.id;
    el.style.borderLeftColor = typeColors[blk.type] || 'var(--accent)';
    const labelSpan = document.createElement('span');
    labelSpan.textContent = blk.label;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'bb-remove-btn'; removeBtn.title = 'Remove'; removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => { placedBlocks = placedBlocks.filter(b => b.id !== blk.id); renderWorkspace(); });
    el.appendChild(labelSpan); el.appendChild(removeBtn);
    bbWorkspace.appendChild(el);
  });
  updateCommandPreview();
}

function updateCommandPreview() {
  if (placedBlocks.length === 0) { bbPreview.textContent = '/'; return; }
  const parts = placedBlocks.map(b => b.cmd.trim());
  const cmd = assembleCommand(parts);
  bbPreview.textContent = cmd.startsWith('/') ? cmd : '/' + cmd;
}

function assembleCommand(parts) {
  if (parts.length === 1) return parts[0];
  const execParts = [], otherParts = [];
  for (const p of parts) {
    if (p.startsWith('execute ')) execParts.push(p.replace(/ run\s*$/, ''));
    else otherParts.push(p);
  }
  if (execParts.length > 0 && otherParts.length > 0) return execParts.join(' ') + ' run ' + otherParts.join(' ');
  return parts.join(' ');
}

bbClearBtn.addEventListener('click', () => { placedBlocks = []; renderWorkspace(); });
bbCopyBtn.addEventListener('click', () => { copyText(bbPreview.textContent, bbCopyBtn); });
