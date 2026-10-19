(function () {
  'use strict';
  function normalize(value) { return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function matches(text, query, category, itemCategory) {
    return (category === 'all' || itemCategory.split(' ').includes(category)) && normalize(query).split(/\s+/).filter(Boolean).every(function (word) { return normalize(text).includes(word); });
  }
  function parseCommand(value) {
    var command = normalize(value).trim().replace(/^\/?/, '');
    var commands = {help: 'help', projects: 'all', ai: 'ai', backend: 'backend', tools: 'tools', contact: 'contact', clear: 'clear'};
    return Object.prototype.hasOwnProperty.call(commands, command) ? commands[command] : 'unknown';
  }
  if (typeof module === 'object' && module.exports) { module.exports = {matches: matches, parseCommand: parseCommand}; return; }
  function init() {
    var root = document.querySelector('[data-project-explorer]'); if (!root) return;
    var query = root.querySelector('[data-project-query]');
    var category = root.querySelector('[data-project-category]');
    var cards = Array.from(root.querySelectorAll('[data-project-card]'));
    var count = root.querySelector('[data-project-count]');
    var empty = root.querySelector('[data-project-empty]');
    var reset = root.querySelector('[data-project-reset]');
    var initial = new URLSearchParams(location.search);
    query.value = (initial.get('q') || '').slice(0, 160);
    if (Array.from(category.options).some(function (o) { return o.value === initial.get('category'); })) category.value = initial.get('category');
    function update() {
      var visible = 0;
      cards.forEach(function (card) { var show = matches(card.textContent, query.value, category.value, card.dataset.category); card.hidden = !show; if (show) visible++; });
      count.textContent = visible + ' of ' + cards.length + ' projects'; empty.hidden = visible !== 0;
      var url = new URL(location.href); url.searchParams.delete('q'); url.searchParams.delete('category');
      if (query.value.trim()) url.searchParams.set('q', query.value.trim());
      if (category.value !== 'all') url.searchParams.set('category', category.value);
      try { history.replaceState(null, '', url.pathname + url.search + url.hash); } catch (_) { /* local previews may disable history */ }
    }
    query.addEventListener('input', update); category.addEventListener('change', update);
    reset.addEventListener('click', function () { query.value = ''; category.value = 'all'; update(); query.focus(); });
    root.querySelectorAll('[data-project-preset]').forEach(function (button) {
      button.addEventListener('click', function () { category.value = button.dataset.projectPreset; query.value = ''; update(); });
    });
    document.addEventListener('keydown', function (event) {
      var editing = event.target.closest('input, textarea, select, [contenteditable="true"]');
      if (event.key === '/' && !editing && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); query.focus(); }
      if (event.key === 'Escape' && event.target === query) { query.value = ''; update(); }
    });
    var form = root.querySelector('[data-command-form]');
    var input = root.querySelector('[data-command-input]');
    var output = root.querySelector('[data-command-output]');
    form.addEventListener('submit', function (event) {
      event.preventDefault(); var command = parseCommand(input.value); input.value = '';
      if (command === 'unknown') { output.textContent = 'Unknown command. Try help, projects, ai, backend, tools, contact or clear.'; return; }
      if (command === 'help') { output.textContent = 'projects → all work · ai → AI apps · backend → API & routing · tools → coding workflows · contact → project inquiry · clear → reset'; return; }
      if (command === 'contact') { output.textContent = 'Contact: kazimusharraf1234@gmail.com. Use the contact link below to discuss a role or project.'; return; }
      query.value = ''; category.value = command === 'clear' ? 'all' : command; update();
      output.textContent = command === 'clear' ? 'Filters reset. Ready to explore.' : count.textContent + ' — open a card to inspect its implementation.';
    });
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
