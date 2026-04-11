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

    let btnText;
    if (isDone) {
      btnText = '✅ Выполнено';
    } else if (isToday) {
      btnText = '○ Отметить сегодня';
    } else {
      btnText = '○ Отметить за этот день';
    }

    const card = document.createElement('div');
    // Вся карточка кликабельна — нажатие = выполнить/снять
    card.className = 'habit-card' + (isDone ? ' done' : '');
    card.onclick = function(e) {
      // Если нажали на кнопку "⋯" — не переключаем, а открываем меню
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
        // Иконка статуса справа
        '<span class="check-btn">' + (isDone ? '✅' : '○') + '</span>' +
      '</div>';

    list.appendChild(card);
  });
}

// Склонение слова "день"
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
