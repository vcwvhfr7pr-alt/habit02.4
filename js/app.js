// ==========================================
// ТРЕКЕР ПРИВЫЧЕК — ГЛАВНЫЙ ФАЙЛ v2
// ==========================================

// ==========================================
// ИНИЦИАЛИЗАЦИЯ TELEGRAM MINI APP
// ==========================================

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
  if (tg.colorScheme === 'dark') {
    document.body.classList.add('dark');
  }
}

// ==========================================
// ПЕРЕМЕННЫЕ — "ПАМЯТЬ" ПРИЛОЖЕНИЯ
// ==========================================

let habits = JSON.parse(localStorage.getItem('habits')) || [];
let selectedPeriod = 7;
let currentOptionsId = null;

// Смещение просматриваемого дня.
// 0 = сегодня, -1 = вчера, -2 = позавчера, и т.д.
// Нельзя зайти в будущее (больше 0).
let viewOffset = 0;

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ С ДАТАМИ
// ==========================================

// Возвращает строку-ключ для даты в формате "2024-01-15"
function dateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// Ключ для РЕАЛЬНОГО сегодня (не зависит от viewOffset)
function today() {
  return dateKey(new Date());
}

// Ключ для просматриваемого дня (с учётом смещения)
function viewDay() {
  const d = new Date();
  d.setDate(d.getDate() + viewOffset);
  return dateKey(d);
}

// Красивое название дня для шапки
function formatDayLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  if (offset === 0) {
    return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  if (offset === -1) {
    return 'Вчера, ' + d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  }
  return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Название цели по количеству дней
function goalLabel(days) {
  const map = { 7: '1 неделя', 14: '2 недели', 30: '1 месяц', 180: '6 месяцев', 365: '1 год' };
  return map[days] || (days + ' дней');
}

// ==========================================
// НАВИГАЦИЯ ПО ДНЯМ — СТРЕЛКИ
// ==========================================

function changeDay(direction) {
  const newOffset = viewOffset + direction;
  // Запрещаем уходить в будущее
  if (newOffset > 0) return;
  viewOffset = newOffset;
  renderHabits();
}

// Вернуться на сегодня (тап на дату)
function goToToday() {
  if (viewOffset !== 0) {
    viewOffset = 0;
    renderHabits();
  }
}

// ==========================================
// ПОДСЧЁТ СЕРИИ (STREAK)
// ==========================================

function calculateStreak(habit) {
  let streak = 0;
  const todayStr = today(); // всегда от реального сегодня

  if (habit.completions[todayStr]) {
    streak = 1;
  }

  const check = new Date();
  check.setDate(check.getDate() - 1);

  for (let i = 0; i < 365; i++) {
    const key = dateKey(check);
    if (habit.completions[key]) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ==========================================
// ПРОГРЕСС К ЦЕЛИ
// ==========================================

function calculateProgress(habit, periodDays) {
  let completed = 0;

  for (let i = 0; i < periodDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (habit.completions[dateKey(d)]) {
      completed++;
    }
  }

  const target = Math.min(habit.goalDays, periodDays);
  const percent = target > 0 ? Math.round((completed / target) * 100) : 0;

  return { completed, target, percent: Math.min(percent, 100) };
}

// ==========================================
// СОХРАНЕНИЕ В ПАМЯТЬ
// ==========================================

function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

// ==========================================
// ОТОБРАЖЕНИЕ ПРИВЫЧЕК
// ==========================================

// Уровень карточки по streak
function getTier(streak) {
  if (streak >= 365) return 'tier-plat';
  if (streak >= 100) return 'tier-gold';
  if (streak >= 30)  return 'tier-silver';
  if (streak >= 7)   return 'tier-bronze';
  return '';
}

function renderHabits() {
  const list = document.getElementById('habits-list');
  const viewDateStr = viewDay();
  const isToday = (viewOffset === 0);

  // Обновляем дату в шапке
  document.getElementById('today-label').textContent = formatDayLabel(viewOffset);

  // Подсказка "вернуться к сегодня"
  const hint = document.getElementById('today-back-hint');
  hint.textContent = isToday ? '' : '\u21A9 Вернуться к сегодня';

  // Стрелка "вперёд" — неактивна если уже сегодня
  document.getElementById('btn-next-day').disabled = isToday;

  if (habits.length === 0) {
    list.innerHTML = '<div class="empty-state"><span class="empty-icon">🌱</span><p>У вас пока нет привычек.<br>Добавьте первую!</p></div>';
    return;
  }

  list.innerHTML = '';

  habits.forEach(function(habit) {
    const isDone = !!habit.completions[viewDateStr];
    const streak = calculateStreak(habit);

    const tier = getTier(streak);
    const card = document.createElement('div');
    card.className = 'habit-card' + (tier ? ' ' + tier : '') + (isDone ? ' done' : '');
    card.onclick = function(e) {
      if (e.target.closest('.habit-options-btn')) return;
      toggleHabit(habit.id);
    };
    card.innerHTML =
      '<div class="habit-top">' +
        '<div class="habit-name">' + habit.name + '</div>' +
        '<button class="habit-options-btn" onclick="openOptionsModal(\'' + habit.id + '\')">' +
          '⋯' +
        '</button>' +
      '</div>' +
      '<div class="habit-info">' +
        '<span class="streak-badge">🔥 ' + streak + ' ' + pluralDays(streak) + '</span>' +
        '<span class="goal-badge">🎯 ' + goalLabel(habit.goalDays) + '</span>' +
        '<span class="check-btn">' + (isDone ? '✓' : '') + '</span>' +
      '</div>';

    list.appendChild(card);
    enableDrag(card, habit.id); // включаем перетаскивание
  });
}
function pluralDays(n) {
  if (n % 100 >= 11 && n % 100 <= 19) return 'дней';
  const r = n % 10;
  if (r === 1) return 'день';
  if (r >= 2 && r <= 4) return 'дня';
  return 'дней';
}

// ==========================================
// ОТОБРАЖЕНИЕ ПРОГРЕССА
// ==========================================

function renderProgress() {
  var list = document.getElementById('progress-list');

  if (habits.length === 0) {
    list.innerHTML = '<div class="empty-state"><span class="empty-icon">📊</span><p>Добавьте привычки, чтобы<br>видеть свой прогресс.</p></div>';
    return;
  }

  list.innerHTML = '';

  habits.forEach(function(habit) {
    // Диапазон дней для шкалы — просто берём выбранный период
    var days = selectedPeriod;

    // Шкала всегда показывает ровно столько делений, сколько дней.
    // Каждое деление = 1 день. Это работает визуально потому что
    // CSS flex растягивает каждое деление пропорционально ширине полосы.
    // Никакой группировки не нужно — браузер сам делает деления тонкими.
    var segsCount = days;
    var completedCount = 0;

    // Строим HTML для всех сегментов разом (быстрее чем по одному)
    // s=0 → самый старый день (days-1 дней назад), s=segsCount-1 → сегодня
    var segParts = [];
    for (var s = 0; s < segsCount; s++) {
      var daysAgo = segsCount - 1 - s; // 0 = сегодня, segsCount-1 = самый старый
      var d = new Date();
      d.setDate(d.getDate() - daysAgo);
      var key = dateKey(d);
      var done = !!habit.completions[key];
      if (done) completedCount++;
      segParts.push(done ? '1' : '0');
    }

    // Собираем сегменты в одну строку HTML
    var segments = segParts.map(function(v) {
      return '<div class="progress-seg' + (v === '1' ? ' filled' : '') + '"></div>';
    }).join('');

    var card = document.createElement('div');
    card.className = 'progress-card';
    card.innerHTML =
      '<div class="habit-name">' + habit.name + '</div>' +
      '<div class="progress-bar-wrap">' + segments + '</div>' +
      '<div class="progress-stats">' + completedCount + ' ' + pluralDays(completedCount) + ' выполнено из ' + days + '</div>';

    list.appendChild(card);
  });
}

// ==========================================
// ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
// ==========================================

function showPage(pageName) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });

  document.getElementById('page-' + pageName).classList.add('active');
  document.getElementById('nav-' + pageName).classList.add('active');

  if (pageName === 'progress') renderProgress();
  if (pageName === 'achievements') renderAchievements();
}

function selectPeriod(days) {
  selectedPeriod = days;
  renderProgress();
}

// ==========================================
// ОТМЕТКА ПРИВЫЧКИ
// ==========================================

function toggleHabit(id) {
  const habit = habits.find(function(h) { return h.id === id; });
  if (!habit) return;

  const dayStr = viewDay(); // отмечаем тот день, который сейчас просматриваем

  if (habit.completions[dayStr]) {
    delete habit.completions[dayStr];
  } else {
    habit.completions[dayStr] = true;
  }

  saveHabits();
  renderHabits();

  // Проверяем не разблокировалось ли новое достижение
  var newAch = checkAchievements();
  if (newAch.length > 0) {
    setTimeout(function() {
      alert('🏆 Новая награда: ' + newAch[0].icon + ' ' + newAch[0].title + '!');
    }, 300);
  }
}

// ==========================================
// УДАЛЕНИЕ ПРИВЫЧКИ
// ==========================================

function deleteHabit() {
  if (!confirm('Удалить эту привычку? Данные будут потеряны.')) return;
  habits = habits.filter(function(h) { return h.id !== currentOptionsId; });
  saveHabits();
  renderHabits();
  closeOptionsModal();
}

// ==========================================
// ДОБАВЛЕНИЕ ПРИВЫЧКИ
// ==========================================

function openAddModal() {
  document.getElementById('habit-name').value = '';
  document.getElementById('add-modal').classList.add('open');
  setTimeout(function() { document.getElementById('habit-name').focus(); }, 100);
}

function closeAddModal() {
  document.getElementById('add-modal').classList.remove('open');
}

function saveHabit() {
  const name = document.getElementById('habit-name').value.trim();
  const goalDays = parseInt(document.getElementById('habit-goal').value);

  if (!name) {
    alert('Введите название привычки!');
    return;
  }

  habits.push({
    id: Date.now().toString(),
    name: name,
    goalDays: goalDays,
    createdAt: today(),
    completions: {}
  });

  saveHabits();
  renderHabits();
  closeAddModal();
}

// ==========================================
// ОПЦИИ ПРИВЫЧКИ
// ==========================================

function openOptionsModal(id) {
  currentOptionsId = id;
  const habit = habits.find(function(h) { return h.id === id; });
  if (!habit) return;
  document.getElementById('options-modal-title').textContent = habit.name;
  document.getElementById('options-modal').classList.add('open');
}

function closeOptionsModal() {
  document.getElementById('options-modal').classList.remove('open');
  currentOptionsId = null;
}

// ==========================================
// РЕДАКТИРОВАНИЕ ПРИВЫЧКИ
// ==========================================

function openEditModal() {
  const habit = habits.find(function(h) { return h.id === currentOptionsId; });
  if (!habit) return;

  // Сохраняем id ДО закрытия меню (closeOptionsModal обнуляет currentOptionsId)
  var editingId = currentOptionsId;

  // Закрываем меню опций
  document.getElementById('options-modal').classList.remove('open');
  // Восстанавливаем id чтобы saveEdit его нашёл
  currentOptionsId = editingId;

  // Заполняем поля текущими значениями
  document.getElementById('edit-name').value = habit.name;
  document.getElementById('edit-goal').value = habit.goalDays;
  document.getElementById('edit-modal').classList.add('open');

  setTimeout(function() { document.getElementById('edit-name').focus(); }, 100);
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('open');
}

function saveEdit() {
  const name = document.getElementById('edit-name').value.trim();
  const goalDays = parseInt(document.getElementById('edit-goal').value);

  if (!name) {
    alert('Введите название привычки!');
    return;
  }

  const habit = habits.find(function(h) { return h.id === currentOptionsId; });
  if (!habit) return;

  // Обновляем поля — данные о выполнении НЕ трогаем
  habit.name = name;
  habit.goalDays = goalDays;

  saveHabits();
  renderHabits();
  closeEditModal();
  currentOptionsId = null;
}

function closeModalOnOverlay(event) {
  if (event.target.classList.contains('modal-overlay')) {
    document.querySelectorAll('.modal-overlay').forEach(function(m) { m.classList.remove('open'); });
    currentOptionsId = null;
  }
}

// Закрытие edit-modal кликом на фон (отдельный обработчик без влияния на кнопки)
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('edit-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeEditModal();
    }
  });
});

// ==========================================
// ЗАПУСК
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  renderHabits();
  document.getElementById('habit-name').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') saveHabit();
  });
});

// ==========================================
// ДОСТИЖЕНИЯ
// ==========================================

// Список всех достижений с условиями разблокировки
var ACHIEVEMENTS = [
  // Серии
  { id: 'streak3',   icon: '🌱', title: 'Первые шаги',          desc: '3 дня подряд',             category: 'Серии дней',  check: function(s) { return s.maxStreak >= 3; } },
  { id: 'streak7',   icon: '🔥', title: 'Неделя без пропусков', desc: '7 дней подряд',             category: 'Серии дней',  check: function(s) { return s.maxStreak >= 7; } },
  { id: 'streak30',  icon: '💪', title: 'Железная воля',        desc: '30 дней подряд',            category: 'Серии дней',  check: function(s) { return s.maxStreak >= 30; } },
  { id: 'streak100', icon: '👑', title: 'Легенда',              desc: '100 дней подряд',           category: 'Серии дней',  check: function(s) { return s.maxStreak >= 100; } },
  { id: 'streak365', icon: '🌌', title: 'Вне времени',          desc: '365 дней подряд',           category: 'Серии дней',  check: function(s) { return s.maxStreak >= 365; } },
  // Выполнения (считается лучшая привычка)
  { id: 'done10',    icon: '⚡', title: 'Начало положено',      desc: '10 выполнений одной привычки',  category: 'Выполнения', check: function(s) { return s.bestHabitDone >= 10; } },
  { id: 'done50',    icon: '🎯', title: 'Полпути',              desc: '50 выполнений одной привычки',  category: 'Выполнения', check: function(s) { return s.bestHabitDone >= 50; } },
  { id: 'done100',   icon: '🏆', title: 'Мастер привычки',      desc: '100 выполнений одной привычки', category: 'Выполнения', check: function(s) { return s.bestHabitDone >= 100; } },
  { id: 'done200',   icon: '💎', title: 'Бриллиантовый уровень', desc: '200 выполнений одной привычки', category: 'Выполнения', check: function(s) { return s.bestHabitDone >= 200; } },
  { id: 'done365',   icon: '🔱', title: 'Год посвящения',       desc: '365 выполнений одной привычки', category: 'Выполнения', check: function(s) { return s.bestHabitDone >= 365; } },
  // Привычки
  { id: 'habits3',   icon: '🌀', title: 'Многозадачность',      desc: '3 привычки одновременно',       category: 'Привычки',   check: function(s) { return s.habitCount >= 3; } },
  { id: 'habits5',   icon: '🚀', title: 'Машина продуктивности', desc: '5 привычек одновременно',      category: 'Привычки',   check: function(s) { return s.habitCount >= 5; } },
  { id: 'habits7',   icon: '🧠', title: 'Архитектор жизни',     desc: '7 привычек одновременно',       category: 'Привычки',   check: function(s) { return s.habitCount >= 7; } },
  { id: 'goal1',     icon: '🎖', title: 'Слово держу',          desc: 'Выполнил цель одной привычки',  category: 'Привычки',   check: function(s) { return s.completedGoals >= 1; } },
  { id: 'goal3',     icon: '🌟', title: 'Человек слова',        desc: 'Выполнил цели 3 привычек',      category: 'Привычки',   check: function(s) { return s.completedGoals >= 3; } },
];

// Считаем статистику по всем привычкам
function calcStats() {
  var totalDone = 0;
  var maxStreak = 0;
  var bestHabitDone = 0;
  var habitCount = habits.length;
  var completedGoals = 0;

  habits.forEach(function(habit) {
    var done = Object.keys(habit.completions).length;
    totalDone += done;
    // Лучшая привычка по количеству выполнений
    if (done > bestHabitDone) bestHabitDone = done;
    // Максимальный streak
    var s = calculateStreak(habit);
    if (s > maxStreak) maxStreak = s;
    // Выполнена ли цель (выполнений >= goalDays)
    if (done >= habit.goalDays) completedGoals++;
  });

  return {
    totalDone: totalDone,
    maxStreak: maxStreak,
    habitCount: habitCount,
    bestHabitDone: bestHabitDone,
    completedGoals: completedGoals
  };
}

// Загружаем сохранённые данные о достижениях (дата получения)
function loadAchievements() {
  return JSON.parse(localStorage.getItem('achievements')) || {};
}

function saveAchievements(data) {
  localStorage.setItem('achievements', JSON.stringify(data));
}

// Проверяем новые достижения и сохраняем дату получения
function checkAchievements() {
  var stats = calcStats();
  var unlocked = loadAchievements();
  var newOnes = [];

  ACHIEVEMENTS.forEach(function(a) {
    if (!unlocked[a.id] && a.check(stats)) {
      unlocked[a.id] = today(); // сохраняем дату получения
      newOnes.push(a);
    }
  });

  if (newOnes.length > 0) {
    saveAchievements(unlocked);
  }
  return newOnes;
}

// Рендер страницы достижений
function renderAchievements() {
  checkAchievements();

  var unlocked = loadAchievements();
  var stats = calcStats();
  var list = document.getElementById('achievements-list');
  if (!list) return;

  var unlockedCount = Object.keys(unlocked).length;

  // Подзаголовок
  var subtitle = document.getElementById('ach-subtitle');
  if (subtitle) subtitle.textContent = unlockedCount + ' из ' + ACHIEVEMENTS.length + ' наград получено';

  // Счётчики сверху — 4 блока в один ряд
  var totalAch = ACHIEVEMENTS.length;
  var pct = Math.round(unlockedCount / totalAch * 100);
  var countersHtml =
    '<div class="ach-counters">' +
      '<div class="ach-stat"><div class="ach-stat-val">' + unlockedCount + '/' + totalAch + '</div><div class="ach-stat-label">наград</div></div>' +
      '<div class="ach-stat"><div class="ach-stat-val">' + pct + '%</div><div class="ach-stat-label">прогресс</div></div>' +
      '<div class="ach-stat"><div class="ach-stat-val">' + stats.maxStreak + '</div><div class="ach-stat-label">макс. серия</div></div>' +
      '<div class="ach-stat"><div class="ach-stat-val">' + stats.bestHabitDone + '</div><div class="ach-stat-label">лучшая привычка</div></div>' +
    '</div>';

  // Группируем по категориям
  var categories = {};
  ACHIEVEMENTS.forEach(function(a) {
    if (!categories[a.category]) categories[a.category] = [];
    categories[a.category].push(a);
  });

  var sectionsHtml = '';
  Object.keys(categories).forEach(function(cat) {
    sectionsHtml += '<div class="ach-section"><div class="ach-section-title">' + cat + '</div><div class="ach-grid">';
    categories[cat].forEach(function(a) {
      var isUnlocked = !!unlocked[a.id];
      var dateHtml = isUnlocked ? '<div class="ach-date">получено ' + formatShortDate(unlocked[a.id]) + '</div>' : '';
      var lockHtml = isUnlocked ? '' : '<span class="ach-lock" style="font-size:12px;display:block;margin-bottom:2px;color:#888">&#128274;</span>';
      sectionsHtml +=
        '<div class="ach-card' + (isUnlocked ? ' unlocked' : ' locked') + '">' +
          lockHtml +
          '<span class="ach-icon">' + a.icon + '</span>' +
          '<div class="ach-card-title">' + a.title + '</div>' +
          '<div class="ach-card-desc">' + a.desc + '</div>' +
          dateHtml +
        '</div>';
    });
    sectionsHtml += '</div></div>';
  });

  list.innerHTML = countersHtml + sectionsHtml;
}

// Короткий формат даты: "5 апр"
function formatShortDate(dateStr) {
  var months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  var d = new Date(dateStr);
  return d.getDate() + ' ' + months[d.getMonth()];
}

// ==========================================
// СОРТИРОВКА КАРТОЧЕК (DRAG & DROP)
// ==========================================
// Работает на телефоне (touch) и на компьютере (mouse).
// Порядок сохраняется в localStorage.

var dragState = {
  dragging: null,    // карточка которую тащим
  startY: 0,         // начальная позиция пальца
  startIndex: 0,     // начальный индекс в массиве
  placeholder: null  // серая заглушка на месте карточки
};

// Создаём заглушку — серый прямоугольник на место перетаскиваемой карточки
function createPlaceholder(height) {
  var ph = document.createElement('div');
  ph.className = 'drag-placeholder';
  ph.style.height = height + 'px';
  return ph;
}

// Включаем drag на карточке — вызывается при создании каждой карточки
function enableDrag(card, habitId) {
  // Иконка для перетаскивания — добавляем в habit-top
  var handle = document.createElement('span');
  handle.className = 'drag-handle';
  handle.innerHTML = '&#9776;'; // ≡ три полоски
  handle.setAttribute('title', 'Перетащить');
  card.querySelector('.habit-top').prepend(handle);

  // Touch (телефон)
  handle.addEventListener('touchstart', function(e) {
    startDrag(e.touches[0].clientY, card, habitId);
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('touchend', onDragEnd);

  // Mouse (компьютер)
  handle.addEventListener('mousedown', function(e) {
    startDrag(e.clientY, card, habitId);
    e.preventDefault();
  });

  document.addEventListener('mousemove', onDragMoveMouse);
  document.addEventListener('mouseup', onDragEnd);
}

function startDrag(clientY, card, habitId) {
  dragState.dragging = card;
  dragState.startY = clientY;
  dragState.startIndex = habits.findIndex(function(h) { return h.id === habitId; });

  // Создаём заглушку той же высоты
  dragState.placeholder = createPlaceholder(card.offsetHeight);
  card.parentNode.insertBefore(dragState.placeholder, card);

  // Стиль перетаскиваемой карточки
  card.style.position = 'fixed';
  card.style.zIndex = '999';
  card.style.width = card.parentNode.offsetWidth + 'px';
  card.style.opacity = '0.85';
  card.style.top = card.getBoundingClientRect().top + 'px';
  card.style.left = card.getBoundingClientRect().left + 'px';
  card.style.pointerEvents = 'none';
  card.style.transition = 'none';
  card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
}

function onDragMove(e) {
  if (!dragState.dragging) return;
  e.preventDefault();
  var clientY = e.touches ? e.touches[0].clientY : e.clientY;
  moveCard(clientY);
}

function onDragMoveMouse(e) {
  if (!dragState.dragging) return;
  moveCard(e.clientY);
}

function moveCard(clientY) {
  var card = dragState.dragging;
  var deltaY = clientY - dragState.startY;
  var origTop = parseFloat(card.style.top);

  // Двигаем карточку за пальцем
  card.style.top = (origTop + deltaY) + 'px';
  dragState.startY = clientY;

  // Проверяем над какой карточкой находимся и двигаем заглушку
  var list = document.getElementById('habits-list');
  var cards = list.querySelectorAll('.habit-card');
  var ph = dragState.placeholder;
  var cardCenter = card.getBoundingClientRect().top + card.offsetHeight / 2;

  cards.forEach(function(other) {
    if (other === card) return;
    var otherRect = other.getBoundingClientRect();
    var otherCenter = otherRect.top + otherRect.height / 2;

    if (cardCenter < otherCenter && ph.nextSibling !== other) {
      list.insertBefore(ph, other);
    } else if (cardCenter > otherCenter && other.nextSibling !== ph) {
      list.insertBefore(ph, other.nextSibling);
    }
  });
}

function onDragEnd() {
  if (!dragState.dragging) return;

  var card = dragState.dragging;
  var ph = dragState.placeholder;
  var list = document.getElementById('habits-list');

  // Вычисляем новый индекс по положению заглушки
  var allItems = Array.from(list.children);
  var newIndex = allItems.indexOf(ph);

  // Считаем сколько настоящих карточек до заглушки (не считая саму карточку)
  var realIndex = 0;
  for (var i = 0; i < newIndex; i++) {
    if (allItems[i].classList.contains('habit-card') || allItems[i].classList.contains('drag-placeholder')) {
      if (allItems[i] !== ph) realIndex++;
    }
  }

  // Переставляем в массиве habits
  var oldIndex = dragState.startIndex;
  if (oldIndex !== realIndex && realIndex <= habits.length) {
    var moved = habits.splice(oldIndex, 1)[0];
    habits.splice(realIndex, 0, moved);
    saveHabits();
  }

  // Убираем стили перетаскивания
  card.style.position = '';
  card.style.zIndex = '';
  card.style.width = '';
  card.style.opacity = '';
  card.style.top = '';
  card.style.left = '';
  card.style.pointerEvents = '';
  card.style.transition = '';
  card.style.boxShadow = '';

  if (ph && ph.parentNode) ph.parentNode.removeChild(ph);

  dragState.dragging = null;
  dragState.placeholder = null;

  // Перерисовываем чисто
  renderHabits();
}
