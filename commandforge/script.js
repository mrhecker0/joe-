/* ===================================================
   CommandForge — script.js
   Vanilla JS, no frameworks.
=================================================== */

// ─── Constants ──────────────────────────────────────
const MODEL      = 'claude-sonnet-4-20250514';
const WORKER_URL = 'https://commandforge.YOUR-SUBDOMAIN.workers.dev'; // ← replace after deploying
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

// Output pre elements
const outHowItWorks = document.getElementById('out-how-it-works-content');
const outSetup      = document.getElementById('out-setup-content');
const outRepeating  = document.getElementById('out-repeating-content');
const outGive       = document.getElementById('out-give-content');

// Block builder
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
const PRESETS = {
  'gun':            'a gun that shoots fast projectiles (snowballs or arrows) rapidly when right-clicked, with a cool shooting sound and muzzle effect',
  'jetpack':        'a jetpack item that gives the player levitation and slow falling while it is held in their off-hand or main hand, with particle effects',
  'lightning-sword':'a diamond sword that summons a lightning bolt at the enemy\'s location when it strikes them in melee combat',
  'grappling-hook': 'a grappling hook that launches the player toward wherever they look when right-clicked, using a fishing rod or carrot on a stick as the item',
  'grenade':        'a grenade item (snowball) that explodes with a large TNT-style blast when it lands, with a fuse delay and smoke trail',
  'item-magnet':    'an item magnet that automatically pulls all nearby dropped items toward the player while the item is held in their hand',
  'magic-armor':    'a set of magic armor that gives the player regeneration, resistance, and fire resistance while all four pieces are worn simultaneously',
  'teleport-wand':  'a teleport wand that teleports the player to wherever their crosshair is pointing (up to 20 blocks away) when right-clicked'
};

presetCards.forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.preset;
    if (PRESETS[key]) {
      promptInput.value = PRESETS[key];
      promptInput.focus();
    }
  });
});

// ─── AI Generator ────────────────────────────────────
generateBtn.addEventListener('click', runGenerate);
promptInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runGenerate();
});

async function runGenerate() {
  const version = versionSelect.value;
  if (!version) {
    showError('Select a Minecraft version first.');
    return;
  }
  const prompt = promptInput.value.trim();
  if (!prompt) {
    showError('Describe what you want to build.');
    return;
  }

  hideError();
  generateBtn.disabled = true;
  generateBtn.textContent = '⏳ Generating...';

  // Show panel, clear old content
  outputPanel.classList.remove('hidden');
  outHowItWorks.textContent = '';
  outSetup.textContent      = '';
  outRepeating.textContent  = '';
  outGive.textContent       = '';

  const systemPrompt = buildSystemPrompt(version);

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: 2048,
        stream:     true,
        system:     systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    await streamResponse(response);

  } catch (err) {
    showError('Error: ' + err.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = '⚡ Generate';
  }
}

function buildSystemPrompt(version) {
  return `You are a Minecraft command expert for ${version}. Output plain text commands only.
Use correct syntax for ${version} at all times.
Structure your response in EXACTLY these labeled sections with these exact headers on their own line:
HOW IT WORKS
SETUP COMMANDS
REPEATING COMMANDS
GIVE COMMAND
Add # comment lines above complex commands to explain what they do.
For held-item effects use the correct scoreboard/tag detection loop for ${version}.
Do not use markdown code fences. Just plain text and commands.`;
}

async function streamResponse(response) {
  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';
  let   fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const obj = JSON.parse(data);
        if (obj.type === 'content_block_delta' && obj.delta?.type === 'text_delta') {
          fullText += obj.delta.text;
          parseAndRender(fullText);
        }
      } catch (_) { /* skip malformed chunks */ }
    }
  }
  parseAndRender(fullText, true);
}

// Parse the 4 labeled sections and update the pre elements live
function parseAndRender(text) {
  const sections = {
    'HOW IT WORKS':      outHowItWorks,
    'SETUP COMMANDS':    outSetup,
    'REPEATING COMMANDS':outRepeating,
    'GIVE COMMAND':      outGive
  };
  const keys = Object.keys(sections);

  // Find all section start positions
  const positions = [];
  for (const key of keys) {
    const idx = text.indexOf(key);
    if (idx !== -1) positions.push({ key, idx });
  }
  positions.sort((a, b) => a.idx - b.idx);

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].idx + positions[i].key.length;
    const end   = i + 1 < positions.length ? positions[i + 1].idx : text.length;
    const content = text.slice(start, end).replace(/^\n+/, '').trimEnd();
    sections[positions[i].key].textContent = content;
  }
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
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 1500);
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 1500);
  });
}

// ─── Errors ───────────────────────────────────────────
function showError(msg) {
  genError.textContent = msg;
  genError.classList.remove('hidden');
}
function hideError() {
  genError.classList.add('hidden');
}

// ─── BLOCK BUILDER ───────────────────────────────────
// Each placed block is: { id, label, cmd, type }
let placedBlocks = [];
let dragSrcBlock = null; // sidebar block being dragged

// Sidebar drag start
document.querySelectorAll('.bb-block').forEach(block => {
  block.addEventListener('dragstart', e => {
    dragSrcBlock = {
      label: block.textContent.trim(),
      cmd:   block.dataset.cmd,
      type:  block.dataset.type
    };
    e.dataTransfer.effectAllowed = 'copy';
  });
  block.addEventListener('dragend', () => { dragSrcBlock = null; });
});

// Workspace drop zone
bbWorkspace.addEventListener('dragover', e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  bbWorkspace.classList.add('drag-over');
});
bbWorkspace.addEventListener('dragleave', () => {
  bbWorkspace.classList.remove('drag-over');
});
bbWorkspace.addEventListener('drop', e => {
  e.preventDefault();
  bbWorkspace.classList.remove('drag-over');
  if (!dragSrcBlock) return;

  const id = 'blk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  placedBlocks.push({ id, label: dragSrcBlock.label, cmd: dragSrcBlock.cmd, type: dragSrcBlock.type });
  renderWorkspace();
});

function renderWorkspace() {
  // Remove all non-hint children
  Array.from(bbWorkspace.children).forEach(c => {
    if (c !== bbDropHint) bbWorkspace.removeChild(c);
  });

  if (placedBlocks.length === 0) {
    bbDropHint.style.display = '';
    bbPreview.textContent = '/';
    return;
  }

  bbDropHint.style.display = 'none';

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

    // Color the left border by type (reuse sidebar logic via inline style)
    const typeColors = {
      target: '#e74c3c', position: '#3498db', effect: '#9b59b6',
      message: '#f39c12', setblock: '#7f8c8d', fill: '#7f8c8d',
      summon: '#f1c40f', execute: '#1abc9c', give: '#27ae60',
      clear: '#27ae60', sound: '#e67e22', tag: '#8e44ad', score: '#8e44ad'
    };
    el.style.borderLeftColor = typeColors[blk.type] || 'var(--accent)';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = blk.label;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'bb-remove-btn';
    removeBtn.title = 'Remove';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => {
      placedBlocks = placedBlocks.filter(b => b.id !== blk.id);
      renderWorkspace();
    });

    el.appendChild(labelSpan);
    el.appendChild(removeBtn);
    bbWorkspace.appendChild(el);
  });

  updateCommandPreview();
}

function updateCommandPreview() {
  if (placedBlocks.length === 0) {
    bbPreview.textContent = '/';
    return;
  }

  // Build the command string by chaining blocks
  // Execute blocks wrap the rest; others are concatenated
  let parts = placedBlocks.map(b => b.cmd.trim());

  // Smart assembly: if any execute blocks, nest them
  let cmd = assembleCommand(parts);
  bbPreview.textContent = cmd.startsWith('/') ? cmd : '/' + cmd;
}

function assembleCommand(parts) {
  if (parts.length === 1) return parts[0];

  // Find execute prefixes and chain them
  const execParts  = [];
  const otherParts = [];
  for (const p of parts) {
    if (p.startsWith('execute ')) execParts.push(p.replace(/ run\s*$/, ''));
    else otherParts.push(p);
  }

  if (execParts.length > 0 && otherParts.length > 0) {
    return execParts.join(' ') + ' run ' + otherParts.join(' ');
  }
  return parts.join(' ');
}

// Clear workspace
bbClearBtn.addEventListener('click', () => {
  placedBlocks = [];
  renderWorkspace();
});

// Copy assembled command
bbCopyBtn.addEventListener('click', () => {
  copyText(bbPreview.textContent, bbCopyBtn);
});
