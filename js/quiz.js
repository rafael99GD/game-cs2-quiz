/* quiz.js — Lógica del quiz */

const Quiz = (() => {

  // Estado interno
  let mapData = null;
  let questions = [];       // array de objetos pregunta
  let currentIndex = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let wrongLocations = [];  // nombres de los que falló
  let answered = false;
  let onComplete = null;    // callback cuando termina

  /* ─────────────────────────────────────────────
     Inicializar quiz con los datos de un mapa
  ───────────────────────────────────────────── */
  function init(map, completeCallback) {
    mapData = map;
    onComplete = completeCallback;
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    wrongLocations = [];
    answered = false;
    questions = buildQuestions(map);
  }

  /* ─────────────────────────────────────────────
     Construir lista de preguntas barajada
     Cada pregunta: { location, image, options[], correctIndex }
  ───────────────────────────────────────────── */
  function buildQuestions(map) {
    const locations = [...map.locations];
    shuffle(locations);

    return locations.map(loc => {
      // Elegir UNA imagen aleatoria de las disponibles para este lugar
      const image = pickRandom(loc.images);

      // Generar 4 opciones: la correcta + 3 distractores
      const options = buildOptions(loc.name, map.locations);

      return {
        locationName: loc.name,
        image,
        options,
        correctIndex: options.indexOf(loc.name)
      };
    });
  }

  /* ─────────────────────────────────────────────
     Generar las 4 opciones de respuesta
  ───────────────────────────────────────────── */
  function buildOptions(correctName, allLocations) {
    // Nombres de otros lugares (distractores)
    const pool = allLocations
      .map(l => l.name)
      .filter(n => n !== correctName);

    shuffle(pool);
    const distractors = pool.slice(0, 3);

    const options = [correctName, ...distractors];
    shuffle(options);
    return options;
  }

  /* ─────────────────────────────────────────────
     Responder pregunta actual
  ───────────────────────────────────────────── */
  function answer(selectedIndex) {
    if (answered) return null;
    answered = true;

    const q = questions[currentIndex];
    const isCorrect = selectedIndex === q.correctIndex;

    if (isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
      wrongLocations.push(q.locationName);
    }

    return { isCorrect, correctIndex: q.correctIndex };
  }

  /* ─────────────────────────────────────────────
     Pasar a la siguiente pregunta
  ───────────────────────────────────────────── */
  function next() {
    if (!answered) return false;  // No avanzar si no se respondió

    currentIndex++;
    answered = false;

    if (currentIndex >= questions.length) {
      // Quiz terminado
      if (onComplete) onComplete(getResults());
      return 'finished';
    }
    return 'next';
  }

  /* ─────────────────────────────────────────────
     Getters
  ───────────────────────────────────────────── */
  function getCurrentQuestion() {
    return questions[currentIndex] || null;
  }

  function getProgress() {
    return {
      current: currentIndex + 1,
      total: questions.length,
      pct: Math.round(((currentIndex) / questions.length) * 100)
    };
  }

  function getResults() {
    return {
      mapName: mapData.name,
      total: questions.length,
      correct: correctCount,
      wrong: wrongCount,
      wrongLocations: [...wrongLocations],
      accuracy: Math.round((correctCount / questions.length) * 100)
    };
  }

  function isAnswered() { return answered; }
  function getTotalQuestions() { return questions.length; }
  function getMapData() { return mapData; }

  /* ─────────────────────────────────────────────
     Utilidades
  ───────────────────────────────────────────── */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return {
    init,
    answer,
    next,
    getCurrentQuestion,
    getProgress,
    getResults,
    isAnswered,
    getTotalQuestions,
    getMapData
  };
})();
