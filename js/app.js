/* app.js — Controlador principal: navegación y actualización de UI */

const App = (() => {

  // ─── Estado ─────────────────────────────────────────
  let mapsData = [];
  let selectedMap = null;
  let nextTimeout = null;

  // ─── Init ────────────────────────────────────────────
  async function init() {
    try {
      const res = await fetch('data/maps.json');
      if (!res.ok) throw new Error('No se pudo cargar maps.json');
      const data = await res.json();
      mapsData = data.maps;
      renderMapGrid();
    } catch (err) {
      console.error('Error cargando maps.json:', err);
      document.getElementById('map-grid').innerHTML =
        `<div style="color:#f87171;grid-column:1/-1;padding:24px;text-align:center;font-size:14px;">
          Error al cargar los mapas.<br>
          <small style="opacity:0.6">${err.message}</small>
        </div>`;
    }
  }

  // ─── Renderizar tarjetas de mapas ────────────────────
  function renderMapGrid() {
    const grid = document.getElementById('map-grid');
    grid.innerHTML = '';

    if (mapsData.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-secondary);grid-column:1/-1;">No hay mapas configurados en maps.json</p>';
      return;
    }

    mapsData.forEach(map => {
      const card = document.createElement('div');
      card.className = 'map-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Jugar en ${map.name}`);

      // Imagen de portada del mapa
      const imgHtml = map.coverImage
        ? `<img class="map-card-image" src="${map.coverImage}" alt="${map.name}" onerror="this.parentNode.innerHTML=getMapPlaceholder('${map.name}')">`
        : `<div class="map-card-image-placeholder">${mapEmoji(map.name)}</div>`;

      // Icono del mapa
      const iconHtml = map.icon
        ? `<img class="map-card-icon" src="${map.icon}" alt="${map.name} icon" onerror="this.outerHTML='<div class=map-card-icon-placeholder>${mapEmoji(map.name)}</div>'">`
        : `<div class="map-card-icon-placeholder">${mapEmoji(map.name)}</div>`;

      const locCount = map.locations.length;

      card.innerHTML = `
        ${imgHtml}
        <div class="map-card-body">
          <div class="map-card-top">
            ${iconHtml}
            <div class="map-card-name">${map.name.toUpperCase()}</div>
          </div>
          <div class="map-card-meta">
            <span class="map-card-count">${locCount} lugar${locCount !== 1 ? 'es' : ''}</span>
            <span class="map-card-tag">CASUAL</span>
          </div>
        </div>
        <div class="map-card-play-hint">▶ JUGAR</div>
      `;

      card.addEventListener('click', () => startQuiz(map));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') startQuiz(map); });

      grid.appendChild(card);
    });
  }

  function getMapPlaceholder(name) {
    return `<div class="map-card-image-placeholder">${mapEmoji(name)}</div>`;
  }
  // Exponer globalmente para el onerror inline
  window.getMapPlaceholder = getMapPlaceholder;

  function mapEmoji(name) {
    const map = { mirage:'🌅', dust2:'🏜️', inferno:'🔥', nuke:'☢️', vertigo:'🏗️', ancient:'🏛️', anubis:'🌙', overpass:'🌉', train:'🚂', cache:'🏭' };
    const key = name.toLowerCase().replace(/\s/g, '');
    return map[key] || '🗺️';
  }

  // ─── Iniciar quiz con un mapa ────────────────────────
  function startQuiz(map) {
    if (map.locations.length < 4) {
      alert(`${map.name} necesita al menos 4 ubicaciones para generar 4 opciones de respuesta.`);
      return;
    }

    selectedMap = map;
    if (nextTimeout) { clearTimeout(nextTimeout); nextTimeout = null; }

    // Inicializar módulos
    Timer.reset();
    Quiz.init(map, showResults);

    // UI header
    document.getElementById('quiz-map-name').textContent = map.name.toUpperCase();
    document.getElementById('stat-total').textContent = Quiz.getTotalQuestions();

    // Mostrar pantalla quiz
    showScreen('quiz');

    // Pequeño delay para que la pantalla cargue antes de arrancar
    setTimeout(() => {
      Timer.start((formatted) => {
        document.getElementById('stat-timer').textContent = formatted;
      });
      renderQuestion();
    }, 80);
  }

  // ─── Renderizar pregunta actual ──────────────────────
  function renderQuestion() {
    const q = Quiz.getCurrentQuestion();
    if (!q) return;

    const progress = Quiz.getProgress();

    // Progreso header
    document.getElementById('stat-current').textContent = progress.current;
    document.getElementById('stat-correct').textContent = Quiz.getResults ? '' : ''; // se actualiza al responder
    updateHeaderStats();
    document.getElementById('progress-fill').style.width = progress.pct + '%';

    // Imagen — una sola aleatoria por pregunta
    const img1 = document.getElementById('quiz-img-1');
    const slot2 = document.getElementById('img-slot-2');
    const imagesGrid = document.getElementById('images-grid');

    img1.src = q.image;
    img1.alt = 'Vista del lugar';
    slot2.classList.add('hidden');
    imagesGrid.classList.remove('two-images');

    // Opciones
    const letters = ['A', 'B', 'C', 'D'];
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach((btn, i) => {
      document.getElementById(`ans-${i}`).textContent = q.options[i];
      btn.className = 'answer-btn';
      btn.disabled = false;
      btn.querySelector('.answer-letter').textContent = letters[i];
    });

    // Ocultar feedback
    const fb = document.getElementById('feedback-msg');
    fb.className = 'feedback-msg hidden';
    fb.textContent = '';
  }

  // ─── Seleccionar respuesta ───────────────────────────
  function selectAnswer(selectedIndex) {
    if (Quiz.isAnswered()) return;

    const result = Quiz.answer(selectedIndex);
    if (!result) return;

    Timer.stop(); // no pausamos el timer, pero podría hacerse

    // Deshabilitar botones
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach(btn => { btn.disabled = true; });

    // Marcar correcto e incorrecto
    btns[result.correctIndex].classList.add('correct');

    if (!result.isCorrect) {
      btns[selectedIndex].classList.add('wrong');
    }

    // Oscurecer las que no son relevantes
    btns.forEach((btn, i) => {
      if (i !== result.correctIndex && i !== selectedIndex) {
        btn.classList.add('dimmed');
      }
    });

    // Feedback
    const fb = document.getElementById('feedback-msg');
    fb.classList.remove('hidden');
    if (result.isCorrect) {
      fb.textContent = randomCorrectMsg();
      fb.className = 'feedback-msg is-correct';
    } else {
      const correctName = Quiz.getCurrentQuestion().options[result.correctIndex];
      fb.textContent = `Era: ${correctName}`;
      fb.className = 'feedback-msg is-wrong';
    }

    // Actualizar stats de header
    updateHeaderStats();

    // Re-arrancar timer y avanzar automáticamente
    Timer.start((formatted) => {
      document.getElementById('stat-timer').textContent = formatted;
    });

    nextTimeout = setTimeout(() => {
      const status = Quiz.next();
      if (status === 'next') {
        renderQuestion();
      }
      // Si es 'finished', el callback de Quiz llama a showResults
    }, 1800);
  }

  function updateHeaderStats() {
    const res = Quiz.getResults();
    document.getElementById('stat-correct').textContent = res.correct;
    document.getElementById('stat-wrong').textContent = res.wrong;
  }

  function randomCorrectMsg() {
    const msgs = ['¡Correcto! 🎯', '¡Exacto!', '¡Muy bien!', '¡Perfecto!', '¡Sí!'];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  // ─── Mostrar resultados ──────────────────────────────
  function showResults(results) {
    Timer.stop();
    const totalMs = Timer.getElapsed();
    const totalFormatted = Timer.getFormatted();
    const avgSec = (totalMs / 1000 / results.total).toFixed(1);

    // Rango según precisión
    const { rank, title, subtitle } = getRank(results.accuracy);

    document.getElementById('results-rank').textContent = rank;
    document.getElementById('results-title').textContent = title;
    document.getElementById('results-subtitle').textContent = subtitle;
    document.getElementById('results-map-tag').textContent = `📍 ${results.mapName.toUpperCase()}`;

    document.getElementById('res-correct').textContent = results.correct;
    document.getElementById('res-wrong').textContent = results.wrong;
    document.getElementById('res-time').textContent = totalFormatted;
    document.getElementById('res-avg').textContent = `${avgSec}s`;
    document.getElementById('accuracy-pct').textContent = `${results.accuracy}%`;

    // Barra de precisión (con pequeño delay para animación)
    setTimeout(() => {
      document.getElementById('accuracy-bar-fill').style.width = results.accuracy + '%';
    }, 200);

    // Lugares fallados
    const wrongSection = document.getElementById('results-wrong-section');
    const wrongList = document.getElementById('results-wrong-list');
    if (results.wrongLocations.length === 0) {
      wrongSection.style.display = 'none';
    } else {
      wrongSection.style.display = 'block';
      wrongList.innerHTML = results.wrongLocations
        .map(name => `<span class="wrong-tag">${name}</span>`)
        .join('');
    }

    showScreen('results');
  }

  function getRank(accuracy) {
    if (accuracy === 100) return { rank: 'S', title: '¡Perfecto!', subtitle: 'Conoces este mapa como la palma de tu mano' };
    if (accuracy >= 90)  return { rank: 'A', title: '¡Excelente!', subtitle: 'Casi perfecto, muy pocas dudas' };
    if (accuracy >= 75)  return { rank: 'B', title: '¡Buen trabajo!', subtitle: 'Conoces bien el mapa, sigue practicando' };
    if (accuracy >= 55)  return { rank: 'C', title: 'No está mal', subtitle: 'Aún hay varios lugares que repasar' };
    if (accuracy >= 35)  return { rank: 'D', title: 'Sigue practicando', subtitle: 'Necesitas más partidas para memorizar el mapa' };
    return { rank: 'F', title: 'A practicar más', subtitle: 'No te rindas, la práctica hace al maestro' };
  }

  // ─── Salir del quiz con confirmación ────────────────
  function quitQuiz() {
    // Crear overlay de confirmación
    let overlay = document.getElementById('quit-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'quit-overlay';
      overlay.className = 'overlay';
      overlay.innerHTML = `
        <div class="confirm-card">
          <h3>¿Salir del quiz?</h3>
          <p>Perderás el progreso de esta partida</p>
          <div class="confirm-actions">
            <button class="btn-cancel" onclick="document.getElementById('quit-overlay').classList.add('hidden')">Continuar</button>
            <button class="btn-confirm-quit" onclick="App.confirmQuit()">Salir</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    } else {
      overlay.classList.remove('hidden');
    }
  }

  function confirmQuit() {
    document.getElementById('quit-overlay').classList.add('hidden');
    if (nextTimeout) { clearTimeout(nextTimeout); nextTimeout = null; }
    Timer.reset();
    goHome();
  }

  // ─── Repetir mapa actual ─────────────────────────────
  function replayMap() {
    if (selectedMap) startQuiz(selectedMap);
  }

  // ─── Volver al inicio ────────────────────────────────
  function goHome() {
    if (nextTimeout) { clearTimeout(nextTimeout); nextTimeout = null; }
    Timer.reset();
    showScreen('home');
  }

  // ─── Gestión de pantallas ────────────────────────────
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${name}`).classList.add('active');
    window.scrollTo(0, 0);
  }

  // ─── Arrancar ────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  // Exponer lo necesario globalmente (para onclick en HTML)
  return { selectAnswer, quitQuiz, confirmQuit, replayMap, goHome };
})();
