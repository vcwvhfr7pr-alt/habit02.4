/* ==========================================
   ОБЩИЕ НАСТРОЙКИ
   ========================================== */

* {
  box-sizing: border-box;  /* Чтобы padding не увеличивал размер элементов */
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent; /* Убираем синий фон при тапе на мобиле */
}

:root {
  /* Цвета — меняй их здесь, если хочешь другую тему */
  --bg: #f4f4f8;
  --card-bg: #ffffff;
  --primary: #5b5ef6;       /* Фиолетовый — основной цвет */
  --primary-light: #ebebff;
  --success: #34c759;       /* Зелёный — выполнено */
  --success-light: #e5f8ec;
  --danger: #ff3b30;        /* Красный — удалить */
  --text: #1a1a2e;          /* Тёмный текст */
  --text-muted: #8888aa;    /* Серый текст */
  --border: #e2e2ee;
  --streak-color: #ff9500;  /* Оранжевый — серия дней */
  --nav-height: 64px;       /* Высота нижней навигации */
}

/* Тёмная тема Telegram */
body.dark {
  --bg: #1c1c28;
  --card-bg: #28283c;
  --primary: #7b7dff;
  --primary-light: #2d2d50;
  --success: #30d158;
  --success-light: #1a3020;
  --border: #3a3a50;
  --text: #f0f0ff;
  --text-muted: #8888aa;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding-bottom: var(--nav-height); /* Место для нижней навигации */
}

/* ==========================================
   СТРАНИЦЫ
   ========================================== */

.page {
  display: none;    /* По умолчанию скрыта */
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
}

.page.active {
  display: block;   /* Показываем активную страницу */
}

/* ==========================================
   ШАПКА СТРАНИЦЫ
   ========================================== */

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
}

.today-date {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* ==========================================
   КАРТОЧКА ПРИВЫЧКИ
   ========================================== */

.habit-card {
  background: var(--card-bg);
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 8px;
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  user-select: none;
}

/* Карточка выполнена — зелёный контур и лёгкая заливка */
.habit-card.done {
  background: var(--success-light);
  border-color: var(--success);
}

.habit-card:active {
  transform: scale(0.985);
  transition: transform 0.1s;
}

/* Верхняя строка карточки */
.habit-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

/* Название привычки */
.habit-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  flex: 1;
}

/* Кнопка опций (три точки) */
.habit-options-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0 4px;
  line-height: 1;
}

/* Нижняя строка карточки: бейджи + кнопка в одну линию */
.habit-info {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: nowrap;
  overflow: hidden;
}

/* Бейдж серии дней */
.streak-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff3e0;
  color: var(--streak-color);
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.dark .streak-badge {
  background: #3a2800;
}

/* Бейдж цели */
.goal-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 13px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
}

/* Статус выполнения — иконка справа, не кнопка */
.check-btn {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  pointer-events: none; /* клик обрабатывает карточка целиком */
}

/* ==========================================
   ПУСТОЕ СОСТОЯНИЕ (нет привычек)
   ========================================== */

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-state .empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 16px;
  line-height: 1.5;
}

/* ==========================================
   КНОПКА "ДОБАВИТЬ ПРИВЫЧКУ"
   ========================================== */

.add-btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 2px dashed var(--primary);
  background: var(--primary-light);
  color: var(--primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.2s;
}

.add-btn:active {
  opacity: 0.7;
}

/* ==========================================
   НИЖНЯЯ НАВИГАЦИЯ
   ========================================== */

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background: var(--card-bg);
  border-top: 1px solid var(--border);
  display: flex;
  z-index: 100;
}

.nav-btn {
  flex: 1;
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 12px;
  transition: color 0.2s;
}

.nav-btn.active {
  color: var(--primary);
}

.nav-icon {
  font-size: 22px;
  line-height: 1;
}

/* ==========================================
   МОДАЛЬНЫЕ ОКНА
   ========================================== */

.modal-overlay {
  display: none;          /* Скрыто по умолчанию */
  position: fixed;
  inset: 0;               /* Растягивается на весь экран */
  background: rgba(0,0,0,0.5);
  z-index: 200;
  align-items: flex-end;  /* Модалка снизу (как в iOS) */
  justify-content: center;
}

.modal-overlay.open {
  display: flex;          /* Показываем при открытии */
}

.modal {
  background: var(--card-bg);
  border-radius: 24px 24px 0 0;
  padding: 24px 20px 32px;
  width: 100%;
  max-width: 480px;
}

.modal h2 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text);
}

.modal label {
  display: block;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 6px;
  margin-top: 14px;
}

.modal input,
.modal select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 16px;
  outline: none;
}

.modal input:focus,
.modal select:focus {
  border-color: var(--primary);
}

/* Кнопки в модалке */
.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  flex: 1;
  padding: 13px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
}

.btn-save {
  flex: 2;
  padding: 13px;
  border-radius: 12px;
  border: none;
  background: var(--primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save:active {
  opacity: 0.85;
}

/* Кнопки опций */
.option-btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  margin-bottom: 8px;
}

.option-btn.danger {
  color: var(--danger);
  border-color: #ffdddd;
  background: #fff5f5;
}

.dark .option-btn.danger {
  background: #3a1010;
  border-color: #5a2020;
}

/* ==========================================
   НАВИГАТОР ДАТ (СТРЕЛКИ)
   ========================================== */

.date-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 6px 8px;
}

.date-arrow {
  background: none;
  border: none;
  font-size: 26px;
  color: var(--primary);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: background 0.15s;
  flex-shrink: 0;
  line-height: 1;
  padding-bottom: 2px; /* визуальное выравнивание символов ‹ › */
}

.date-arrow:active {
  background: var(--primary-light);
}

/* Кнопка "вперёд" — серая когда мы уже на сегодня */
.date-arrow:disabled {
  color: var(--border);
  cursor: default;
}

.date-nav-center {
  flex: 1;
  text-align: center;
  cursor: pointer; /* тап = вернуться на сегодня */
}

.today-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
}

/* Подсказка "нажмите чтобы вернуться сегодня" */
.today-back-hint {
  font-size: 11px;
  color: var(--primary);
  margin-top: 1px;
  min-height: 14px; /* чтобы не прыгала высота */
}



.period-select {
  margin-top: 12px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: var(--card-bg);
  color: var(--text);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238888aa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}

.period-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* Карточка прогресса — компактная */
.progress-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 8px;
  border: 1px solid var(--border);
}

.progress-card .habit-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text);
}

/* Прогресс-бар — сплошная полоса */
.progress-bar-wrap {
  display: flex;
  height: 10px;
  margin: 0 0 5px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--border);
  /* min-width 0 чтобы flex не ломался при большом числе детей */
  min-width: 0;
}

/* Один сегмент — никаких границ, никаких зазоров, сплошная полоса */
.progress-seg {
  flex: 1 1 0;
  min-width: 0;
  background: var(--border);
}

.progress-seg.filled {
  background: var(--primary);
}

/* Подпись: X дней выполнено */
.progress-stats {
  font-size: 12px;
  color: var(--text-muted);
}

/* Убираем большой процент — не нужен */
.progress-percent {
  display: none;
}
