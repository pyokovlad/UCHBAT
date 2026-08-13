/* ============================================
   ГЛОБАЛЬНЫЕ ФУНКЦИИ ГЕНЕРАТОРОВ
   (должны быть в глобальной области, чтобы работать через onclick="...")
   ============================================ */

/* --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ --- */
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function capitalizeWords(str) {
    return str.toLowerCase().split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
}

function copyOutput(elementId, btn) {
    const text = document.getElementById(elementId).textContent;
    if (!text || text.startsWith('Результат') || text.startsWith('Заполни')) return;

    // Попытка через современный Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showCopied(btn));
        return;
    }

    // Fallback для file:// и HTTP (создаём временную textarea)
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showCopied(btn);
    } catch (err) {
        alert('Не удалось скопировать. Выделите текст вручную.');
    }
    document.body.removeChild(textarea);
}

function showCopied(btn) {
    const originalText = btn.textContent;
    btn.textContent = '✅ Скопировано!';
    setTimeout(() => { btn.textContent = originalText; }, 2000);
}

/* --- ТАБЫ ИНСТРУМЕНТОВ --- */
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('tab-content--active');
    });
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('tab-btn--active');
    });
    document.getElementById(tabId).classList.add('tab-content--active');
    btn.classList.add('tab-btn--active');
}

/* --- ГЕНЕРАТОР 1: ДОКЛАД С ПОСТА --- */
function togglePostType() {
    const type = document.querySelector('input[name="post-type"]:checked').value;
    document.getElementById('post-status-block').style.display = type === 'status' ? 'block' : 'none';
    document.getElementById('post-minutes-block').style.display = type === 'minutes' ? 'block' : 'none';
}

function generatePost() {
    const rank = document.getElementById('post-rank').value;
    const surname = document.getElementById('post-surname').value.trim();
    const post = document.getElementById('post-post').value;
    const squad = document.getElementById('post-squad').value;
    const code = document.getElementById('post-code').value;
    const type = document.querySelector('input[name="post-type"]:checked').value;

    if (!surname) {
        alert('Введите фамилию');
        return;
    }

    let result = '';
    if (type === 'status') {
        const status = document.querySelector('input[name="post-status"]:checked').value;
        result = `Докладывает: ${rank} ${surname} | Пост ${post} ${status} | Состав - ${squad} | Код - ${code} | Доклад окончен.`;
    } else {
        const minutes = document.getElementById('post-minutes').value;
        result = `Докладывает: ${rank} ${surname} | Пост ${post} | Состав - ${squad} | Код - ${code} | Минуты - ${minutes} | Доклад окончен.`;
    }

    document.getElementById('output-post').textContent = result;
}

/* --- ГЕНЕРАТОР 2: ВЫЗОВ В РАЦИЮ --- */
function generateRadio() {
    const target = document.getElementById('radio-target').value;
    const text = document.getElementById('radio-text').value.trim().toUpperCase();

    if (!text) {
        alert('Введите текст сообщения');
        return;
    }

    const result = `УБ | ${target}, ${text}`;
    document.getElementById('output-radio').textContent = result;
}

/* --- ГЕНЕРАТОР 3: ЛЕКЦИЯ/ТРЕНИРОВКА --- */
function generateLecture() {
    const action = document.querySelector('input[name="lecture-action"]:checked').value;
    const activity = document.getElementById('lecture-activity').value;
    const time = getCurrentTime();

    const result = `/todo Военнослужащие ${action} ${activity}*Время на часах ${time}`;
    document.getElementById('output-lecture').textContent = result;
}

/* --- ГЕНЕРАТОР 4: ПРИСЯГА --- */
function generateOath() {
    const fio = capitalizeWords(document.getElementById('oath-fio').value.trim());

    if (!fio) {
        alert('Введите ФИО');
        return;
    }

    const time = getCurrentTime();
    const result = `/todo Рядовой ${fio} Торжественно присягнул на верность Вооруженным Силам Российской Федерации*Время на часах ${time}`;
    document.getElementById('output-oath').textContent = result;
}

/* --- ГЕНЕРАТОР 5: ЭКЗАМЕН --- */
function generateExam() {
    const rank = document.getElementById('exam-rank').value;
    const fio = capitalizeWords(document.getElementById('exam-fio').value.trim());
    const result = document.querySelector('input[name="exam-result"]:checked').value;
    const attempt = document.getElementById('exam-attempt').value;
    const points = document.getElementById('exam-points').value;
    const time = getCurrentTime();

    if (!fio) {
        alert('Введите ФИО');
        return;
    }

    const text = `/todo ${rank} ${fio} ${result} экзамен с ${attempt} попытки, набрав ${points} из 40 баллов*Время на часах ${time}`;
    document.getElementById('output-exam').textContent = text;
}

/* --- ГЕНЕРАТОР 6: ОБЪЯВЛЕНИЯ --- */
function toggleAnnPlatform() {
    const platform = document.querySelector('input[name="ann-platform"]:checked').value;
    document.getElementById('ann-room-block').style.display = platform === 'radio' ? 'block' : 'none';
    document.getElementById('ann-channel-block').style.display = platform === 'discord' ? 'block' : 'none';
}

function generateAnnouncement() {
    const platform = document.querySelector('input[name="ann-platform"]:checked').value;
    const target = document.querySelector('input[name="ann-target"]:checked').value;
    const hours = document.getElementById('ann-hours').value.padStart(2, '0');
    const minutes = document.getElementById('ann-minutes').value.padStart(2, '0');
    const activity = document.getElementById('ann-activity').value;
    const time = `${hours}:${minutes}`;

    let result = '';

    if (platform === 'radio') {
        const room = document.getElementById('ann-room').value;
        result = `УБ | ${target}, Внимание! в ${time} будет проходить ${activity}. ожидаю в штабе учебный класс №${room}`;
    } else {
        const channel = document.getElementById('ann-channel').value;
        const tag = target === 'УР' ? '<@&1465597494229729463>' : '<@&1482355350396076103>';
        const links = {
            'УР': {
                '1': 'https://discord.com/channels/1465391913229222103/1473314898464211047',
                '2': 'https://discord.com/channels/1465391913229222103/1473314928008892510',
                '3': 'https://discord.com/channels/1465391913229222103/1473314949634986056'
            },
            'ВА': {
                '1': 'https://discord.com/channels/1465391913229222103/1482745375084253316',
                '2': 'https://discord.com/channels/1465391913229222103/1482745414032818187',
                '3': 'https://discord.com/channels/1465391913229222103/1473314949634986056'
            }
        };
        const link = links[target][channel];
        result = `${tag} Внимание! в ${time} будет проходить ${activity}. Жду в ${link}`;
    }

    document.getElementById('output-announcement').textContent = result;
}

/* --- ГЕНЕРАТОР 7: ЕЖЕДНЕВНЫЙ ОТЧЁТ --- */
function toggleDailyCategory() {
    const category = document.querySelector('input[name="daily-category"]:checked').value;
    document.querySelectorAll('.daily-category-block').forEach(block => {
        block.style.display = 'none';
    });
    document.getElementById('daily-' + category).style.display = 'block';
}

function setTodayDate() {
    const checkbox = document.getElementById('daily-today');
    const dateInput = document.getElementById('daily-date');
    if (!checkbox || !dateInput) return;

    if (checkbox.checked) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
        dateInput.readOnly = true;
    } else {
        dateInput.readOnly = false;
    }
}

function generateDailyReport() {
    const fio = document.getElementById('daily-fio').value.trim();
    const staticId = document.getElementById('daily-static').value.trim();
    const date = document.getElementById('daily-date').value;
    const count = document.getElementById('daily-count').value;
    const link = document.getElementById('daily-link').value.trim();

    const activities = [];
    document.querySelectorAll('.daily-activity:checked').forEach(cb => {
        activities.push(cb.value);
    });

    if (!fio) {
        alert('Введите ФИО');
        return;
    }

    if (activities.length === 0) {
        alert('Выберите хотя бы одно мероприятие');
        return;
    }

    const formattedDate = formatDate(date);

    const result = `1. ${fio} | ${staticId}\n2. ${activities.join(', ')}.\n3. ${formattedDate}\n4. ${count}\n5. ${link}`;
    document.getElementById('output-daily').textContent = result;
}

/* --- ГЕНЕРАТОР 8: ПОДСЧЁТ БАЛЛОВ --- */
function recalcPoints() {
    let grandTotal = 0;
    document.querySelectorAll('.points-calc__input').forEach(input => {
        const points = parseInt(input.dataset.points) || 0;
        const count = parseInt(input.value) || 0;
        const total = points * count;
        grandTotal += total;
        const row = input.closest('.points-calc__row');
        if (row) {
            row.querySelector('.points-calc__total').textContent = total;
        }
    });
    document.getElementById('points-grand-total').textContent = grandTotal;
}

function generatePointsReport() {
    const onlyNonZero = document.getElementById('only-non-zero').checked;
    let lines = [];
    let grandTotal = 0;

    document.querySelectorAll('.points-calc__group').forEach(group => {
        const groupTitle = group.querySelector('.points-calc__group-title').textContent;
        let groupLines = [];

        group.querySelectorAll('.points-calc__row').forEach(row => {
            const name = row.querySelector('.points-calc__name').textContent;
            const input = row.querySelector('.points-calc__input');
            const points = parseInt(input.dataset.points) || 0;
            const count = parseInt(input.value) || 0;
            const total = points * count;
            grandTotal += total;

            if (onlyNonZero && count === 0) return;
            groupLines.push(`${name} [${count}/${total}] -`);
        });

        if (groupLines.length > 0) {
            lines.push(groupTitle);
            lines.push(...groupLines);
            lines.push('');
        }
    });

    lines.push(`Итого: ${grandTotal} баллов`);
    document.getElementById('output-points').textContent = lines.join('\n');
}


/* ============================================
   ИНИЦИАЛИЗАЦИЯ ПОСЛЕ ЗАГРУЗКИ DOM
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* --- БУРГЕР-МЕНЮ --- */
    const burgerBtn = document.getElementById('burgerBtn');
    const mainNav = document.getElementById('mainNav');

    function openNav() {
        mainNav.classList.add('is-open');
        burgerBtn.classList.add('is-open');
        document.body.classList.add('nav-open');
    }

    function closeNav() {
        mainNav.classList.remove('is-open');
        burgerBtn.classList.remove('is-open');
        document.body.classList.remove('nav-open');
    }

    if (burgerBtn && mainNav) {
        burgerBtn.addEventListener('click', () => {
            mainNav.classList.contains('is-open') ? closeNav() : openNav();
        });

        mainNav.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', closeNav);
        });

        document.addEventListener('click', (e) => {
            const isInsideNav = mainNav.contains(e.target);
            const isBurger = burgerBtn.contains(e.target);
            if (!isInsideNav && !isBurger && mainNav.classList.contains('is-open')) {
                closeNav();
            }
        });
    }

    /* --- ПОДСВЕТКА АКТИВНОЙ СТРАНИЦЫ --- */
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    /* --- ПЛАВНЫЙ СКРОЛЛ ДЛЯ ЯКОРЕЙ --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                closeNav();
            }
        });
    });

    /* --- МАСКА ДЛЯ СТАТИКА (XXX-XXX) --- */
    const staticInput = document.getElementById('daily-static');
    if (staticInput) {
        staticInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 6) value = value.slice(0, 6);
            if (value.length > 3) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            }
            e.target.value = value;
        });
    }

});

// ПОИСК ПО САЙТУ

(function initSearch() {
    // Индекс всех страниц. При добавлении новой страницы - просто допиши сюда новый объект
    const searchIndex = [
        {
            page: 'Главная',
            emoji: '🏠',
            url: 'index.html',
            keywords: 'главная приветствие быстрый доступ объявления новости разделы',
            description: 'Главная страница портала Учебного батальона с быстрым доступом ко всем разделам и последними объявлениями.'
        },
        {
            page: 'FAQ стажёру',
            emoji: '📖',
            url: 'faq.html',
            keywords: 'faq стажёр стажер новичок вопрос ответ обучение лекции тренировки документы спецсвязь допуск чёрный список черный экзамен присяга discord',
            description: 'Ответы на частые вопросы стажёров: обязанности, правила проведения лекций, формы допуска, спецсвязь Discord.'
        },
        {
            page: 'Лекции и тренировки',
            emoji: '📚',
            url: 'lectures.html',
            keywords: 'лекция тренировка обучение todo оповещение демонстрация вступительная профориентация устав строевая физическая огневая кпс медицинская ссо',
            description: 'Порядок проведения лекций и тренировок, виды занятий, баллы за проведение, использование команды /todo.'
        },
        {
            page: 'Формы допуска',
            emoji: '🎖',
            url: 'access.html',
            keywords: 'форма допуска первая вторая третья 1 2 3 разрешение лекция тренировка экзамен проверка отчёт отчет изъятие',
            description: 'Информация о трёх формах допуска для проведения лекций, проверки отчётов и проведения экзаменов.'
        },
        {
            page: 'Экзамены',
            emoji: '📝',
            url: 'exams.html',
            keywords: 'экзамен тест вопрос балл проходной попытка пересдача подсказка вариант результат ефрейтор',
            description: 'Правила проведения экзаменов для ефрейторов: 40 вопросов, 28 проходных баллов, 3 попытки, варианты тестов.'
        },
        {
            page: 'Переаттестация',
            emoji: '🔄',
            url: 'reattestation.html',
            keywords: 'переаттестация восстановление звание вопрос балл тест укмб старший сержант старшина прапорщик лейтенант',
            description: 'Правила восстановления в ВС РФ через переаттестацию: 27 вопросов, 30 минут, проходные баллы по званиям.'
        },
        {
            page: 'Посты и наряды',
            emoji: '🛡',
            url: 'posts.html',
            keywords: 'пост наряд дпч кпп дежурный водитель агитация агитационная стойка обязанности форма одежды доклад штаб',
            description: 'Посты ДПЧ, КПП, дежурный водитель и агитационная стойка: обязанности, форма одежды, доклады.'
        },
        {
            page: 'Призыв',
            emoji: '🪖',
            url: 'recruitment.html',
            keywords: 'призыв документы паспорт мед книжка справка нарколог личное дело бритый лысо этапы ввк объявление волна день открытых дверей экскурсия электронные заявки',
            description: 'Этапы призыва, требования к документам и шаблоны объявлений (гос. волна, КПП-1, день открытых дверей, экскурсия).'
        },
        {
            page: 'Проверка отчётов',
            emoji: '✅',
            url: 'reports.html',
            keywords: 'проверка отчёт отчет рапорт боди-камера бодикамера боди камера скриншот одобрить отказать ветка старший сержант форма допуска 2',
            description: 'Правила проверки отчётов УР и ВА: что проверять, причины отказа, оформление одобрения и отказа.'
        },
        {
            page: 'Чёрный список',
            emoji: '⛔',
            url: 'blacklist.html',
            keywords: 'чёрный черный список чс увольнение нарушение контракт повестка лив багом опп срок 14 30 50 дней',
            description: 'Причины и сроки внесения в Чёрный список: непрохождение УР/ВА, досрочное окончание, самовольный разрыв.'
        },
        {
            page: 'Система повышения',
            emoji: '📈',
            url: 'promotion.html',
            keywords: 'повышение звание рядовой ефрейтор сержант старшина прапорщик лейтенант капитан баллы условия тренировка лекция пост',
            description: 'Требования к повышению в Учебном батальоне и Отделе кадров: баллы и дополнительные условия для каждого звания.'
        },
        {
            page: 'Балловая система',
            emoji: '🧮',
            url: 'points.html',
            keywords: 'баллы начисление гмп поставка призыв поверка реанимация лекция тренировка экзамен присяга курс отдел кадров',
            description: 'Подробная таблица начисления баллов за мероприятия, лекции, тренировки и несение службы.'
        },
        {
            page: 'Инструменты',
            emoji: '🛠',
            url: 'tools.html',
            keywords: 'инструменты генератор рапорт доклад отчёт рация todo объявление калькулятор баллов',
            description: '8 генераторов для автоматического формирования докладов, рапортов, объявлений и подсчёта баллов.'
        },
        {
            page: 'Ресурсы',
            emoji: '🔗',
            url: 'resources.html',
            keywords: 'ресурсы ссылки discord спецсвязь форум таблицы google формы документы',
            description: 'Полезные ссылки: Discord, форум RMRP, таблицы отчётов, формы сдачи на допуски, варианты экзаменов.'
        }
    ];

    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClear');
    const resultsContainer = document.getElementById('searchResults');

    if (!input || !resultsContainer) return;

    let activeIndex = -1;

    function performSearch(query) {
        const q = query.trim().toLowerCase();

        clearBtn.classList.toggle('is-visible', q.length > 0);

        if (q.length < 2) {
            resultsContainer.classList.remove('is-open');
            resultsContainer.innerHTML = '';
            return;
        }

        const matches = searchIndex.filter(item => {
            const haystack = (item.page + ' ' + item.keywords + ' ' + item.description).toLowerCase();
            return haystack.includes(q);
        });

        renderResults(matches, q);
    }


    function renderResults(matches, query) {
        resultsContainer.innerHTML = '';

        if (matches.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search__empty">
                    <span class="search__empty-icon">🔍</span>
                    Ничего не найдено по запросу «${escapeHtml(query)}»
                </div>
            `;
            resultsContainer.classList.add('is-open');
            return;
        }


        const label = document.createElement('div');
        label.className = 'search__group-label';
        label.textContent = `Найдено: ${matches.length}`;
        resultsContainer.appendChild(label);

        // Элементы результатов
        matches.forEach((item, idx) => {
            const link = document.createElement('a');
            link.href = item.url;
            link.className = 'search__result';
            link.dataset.index = idx;

            const titleHtml = highlightMatch(item.page, query);
            const descHtml = highlightMatch(item.description, query);

            link.innerHTML = `
                <div class="search__result-title">
                    <span class="search__result-title-emoji">${item.emoji}</span>
                    ${titleHtml}
                </div>
                <div class="search__result-desc">${descHtml}</div>
            `;

            resultsContainer.appendChild(link);
        });

        // Подсказка по навигации
        const hint = document.createElement('div');
        hint.className = 'search__hint';
        hint.innerHTML = `
            <span>↑ ↓ — навигация</span>
            <span><kbd>Enter</kbd> — открыть</span>
            <span><kbd>Esc</kbd> — закрыть</span>
        `;
        resultsContainer.appendChild(hint);

        resultsContainer.classList.add('is-open');
        activeIndex = -1;
    }

    // --- Подсветка совпадений ---
    function highlightMatch(text, query) {
        if (!query) return escapeHtml(text);
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return escapeHtml(text).replace(regex, '<span class="search__highlight">$1</span>');
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // --- Закрытие списка ---
    function closeResults() {
        resultsContainer.classList.remove('is-open');
        activeIndex = -1;
    }

    // --- Очистка поля ---
    function clearInput() {
        input.value = '';
        clearBtn.classList.remove('is-visible');
        closeResults();
        input.focus();
    }

    // --- Навигация стрелками ---
    function updateActiveItem() {
        const items = resultsContainer.querySelectorAll('.search__result');
        items.forEach((el, i) => {
            el.classList.toggle('is-active', i === activeIndex);
            if (i === activeIndex) {
                el.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    // --- Обработчики событий ---
    input.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim().length >= 2) {
            performSearch(input.value);
        }
    });

    clearBtn.addEventListener('click', clearInput);

    // Закрытие по клику вне поиска
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
            closeResults();
        }
    });

    // Навигация клавиатурой
    input.addEventListener('keydown', (e) => {
        const items = resultsContainer.querySelectorAll('.search__result');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
            updateActiveItem();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            updateActiveItem();
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && items[activeIndex]) {
                e.preventDefault();
                window.location.href = items[activeIndex].href;
            }
        } else if (e.key === 'Escape') {
            closeResults();
            input.blur();
        }
    });

    // Глобальный хоткей Ctrl+K или Cmd+K для быстрого вызова поиска
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            input.focus();
            input.select();
        }
});

})();
