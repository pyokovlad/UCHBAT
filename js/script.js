/* ============================================
   ДОБАВЛЕНО: ДАННЫЕ СОТРУДНИКА ДЛЯ ОБУЧЕНИЯ
   и ВЕЧЕРНЕЙ ПОВЕРКИ
   ============================================ */

const LECTURE_API_URL = 'https://script.google.com/macros/s/AKfycby2rLPQ0EdDypMKitVyU0GZ746ER6_KC6ZxjciilOfJe99flUdDudH4QJSk1ffDp6HN/exec';

let siteNotificationTimer = null;

function showSiteNotification(message, type = 'warning', duration = 3500) {
    const notification = document.getElementById('site-notification');
    const text = document.getElementById('site-notification-text');
    const icon = document.getElementById('site-notification-icon');

    if (!notification || !text || !icon) {
        console.warn(message);
        return;
    }

    if (siteNotificationTimer) {
        clearTimeout(siteNotificationTimer);
    }

    notification.classList.remove(
        'site-notification--success',
        'site-notification--error',
        'site-notification--warning',
        'is-visible'
    );

    text.textContent = message;

    if (type === 'success') {
        icon.textContent = '✅';
        notification.classList.add('site-notification--success');
    } else if (type === 'error') {
        icon.textContent = '❌';
        notification.classList.add('site-notification--error');
    } else {
        icon.textContent = '⚠️';
        notification.classList.add('site-notification--warning');
    }

    // Небольшая задержка нужна для корректной CSS-анимации
    requestAnimationFrame(() => {
        notification.classList.add('is-visible');
    });

    siteNotificationTimer = setTimeout(() => {
        notification.classList.remove('is-visible');
    }, duration);
}




function getEmployeeIdentity() {
    const fioInput = document.getElementById('employee-fio');
    const staticInput = document.getElementById('employee-static');

    const fio = fioInput ? fioInput.value.trim() : '';
    const staticId = staticInput ? staticInput.value.trim() : '';

    if (!fio) {
        showSiteNotification('Введите Фамилию и Имя сотрудника.', 'warning');
        if (fioInput) fioInput.focus();
        return null;
    }

    if (!/^\d{3}-\d{3}$/.test(staticId)) {
        showSiteNotification('Введите статик в формате XXX-XXX.', 'warning');
        if (staticInput) staticInput.focus();
        return null;
    }

    localStorage.setItem('tools_employee_fio', fio);
    localStorage.setItem('tools_employee_static', staticId);

    return {
        fio,
        staticId
    };
}

function requireEmployeeIdentity() {
    return getEmployeeIdentity();
}

function getMoscowDate() {
    return new Date().toLocaleDateString('en-CA', {
        timeZone: 'Europe/Moscow'
    });
}

function getLecturePendingKey(staticId, activity) {
    return `lecture_pending_${staticId}_${activity}`;
}

function makeLectureId() {
    return 'lecture_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
}

async function postLectureEvent(payload) {
    if (!LECTURE_API_URL || LECTURE_API_URL.includes('ВСТАВЬТЕ_URL')) {
        return false;
    }

    try {
        await fetch(LECTURE_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        return true;
    } catch (error) {
        console.error('Ошибка отправки данных занятия:', error);
        return false;
    }
}

async function getLectureApi(action, params = {}) {
    if (!LECTURE_API_URL || LECTURE_API_URL.includes('ВСТАВЬТЕ_URL')) {
        return null;
    }

    try {
        const query = new URLSearchParams({
            action,
            ...params
        });

        const response = await fetch(`${LECTURE_API_URL}?${query.toString()}`, {
            method: 'GET'
        });

        return await response.json();
    } catch (error) {
        console.error('Ошибка получения данных занятий:', error);
        return null;
    }
}

async function findOpenLecture(identity, activity) {
    const localKey = getLecturePendingKey(identity.staticId, activity);
    const localSession = localStorage.getItem(localKey);

    if (localSession) {
        try {
            return JSON.parse(localSession);
        } catch (error) {
            localStorage.removeItem(localKey);
        }
    }

    const data = await getLectureApi('open', {
        staticId: identity.staticId,
        activity
    });

    if (data && data.success && data.session) {
        return data.session;
    }

    return null;
}

function toggleLectureAction() {
    const actionInput = document.querySelector('input[name="lecture-action"]:checked');
    const countBlock = document.getElementById('lecture-count-block');

    if (!actionInput || !countBlock) return;

    countBlock.style.display =
        actionInput.value === 'закончили' ? 'block' : 'none';

    if (actionInput.value !== 'закончили') {
        const checkbox = document.getElementById('lecture-count-confirm');

        if (checkbox) {
            checkbox.checked = false;
        }
    }
}


/* ============================================
   ГЛОБАЛЬНЫЕ ФУНКЦИИ ГЕНЕРАТОРОВ
   ============================================ */


/* --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ --- */

function getCurrentTime() {
    return new Date().toLocaleTimeString('ru-RU', {
        timeZone: 'Europe/Moscow',
        hour: '2-digit',
        minute: '2-digit'
    });
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

    if (!text || text.startsWith('Результат') || text.startsWith('Заполни')) {
        return;
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showCopied(btn));
        return;
    }

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
        showSiteNotification(
    'Не удалось скопировать. Выделите текст вручную.',
    'error'
);
    }

    document.body.removeChild(textarea);
}

function showCopied(btn) {
    const originalText = btn.textContent;

    btn.textContent = '✅ Скопировано!';

    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
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

    document.getElementById('post-status-block').style.display =
        type === 'status' ? 'block' : 'none';

    document.getElementById('post-minutes-block').style.display =
        type === 'minutes' ? 'block' : 'none';
}

function generatePost() {
    const rank = document.getElementById('post-rank').value;
    const surname = document.getElementById('post-surname').value.trim();
    const post = document.getElementById('post-post').value;
    const squad = document.getElementById('post-squad').value;
    const code = document.getElementById('post-code').value;
    const type = document.querySelector('input[name="post-type"]:checked').value;

    if (!surname) {
        showSiteNotification('Введите фамилию.', 'warning');
        return;
    }

    let result = '';

    if (type === 'status') {
        const status = document.querySelector('input[name="post-status"]:checked').value;

        result =
            `Докладывает: ${rank} ${surname} | Пост ${post} ${status} | Состав - ${squad} | Код - ${code} | Доклад окончен.`;
    } else {
        const minutes = document.getElementById('post-minutes').value;

        result =
            `Докладывает: ${rank} ${surname} | Пост ${post} | Состав - ${squad} | Код - ${code} | Минуты - ${minutes} | Доклад окончен.`;
    }

    document.getElementById('output-post').textContent = result;
}


/* --- ГЕНЕРАТОР 2: ВЫЗОВ В РАЦИЮ --- */

function generateRadio() {
    const target = document.getElementById('radio-target').value;
    const text = document.getElementById('radio-text').value.trim().toUpperCase();

    if (!text) {
        showSiteNotification('Введите текст сообщения.', 'warning');
        return;
    }

    const result = `УБ | ${target}, ${text}`;

    document.getElementById('output-radio').textContent = result;
}


/* --- ГЕНЕРАТОР 3: ЛЕКЦИЯ / ТРЕНИРОВКА --- */

async function generateLecture() {
    const identity = requireEmployeeIdentity();

    if (!identity) return;

    const actionInput = document.querySelector(
        'input[name="lecture-action"]:checked'
    );

    const activityElement =
        document.getElementById('lecture-activity');

    if (!actionInput || !activityElement) {
        return;
    }

    const action = actionInput.value;
    const activity = activityElement.value;

    if (!activity) {
        showSiteNotification(
            'Выберите лекцию или тренировку.',
            'warning'
        );
        return;
    }

    const localKey = getLecturePendingKey(
        identity.staticId,
        activity
    );


    /* ============================================================
       НАЧАЛИ
       ============================================================ */

    if (action === 'начали') {

        /*
         * Проверяем, нет ли уже запущенного занятия
         */
        const existing =
            localStorage.getItem(localKey);

        if (existing) {

            try {
                const session =
                    JSON.parse(existing);

                startLectureTimer(session);

                showSiteNotification(
                    'Занятие уже запущено. Секундомер продолжает работу.',
                    'warning'
                );

            } catch (error) {

                console.error(
                    'Ошибка восстановления занятия:',
                    error
                );

                localStorage.removeItem(localKey);
            }

            return;
        }


        /*
         * Создаём новую сессию
         */
        const now = new Date();

        const session = {
            id: makeLectureId(),

            fio: identity.fio,

            staticId: identity.staticId,

            activity: activity,

            date: getMoscowDate(),

            startTime: getCurrentTime(),

            startTimestamp: Date.now()
        };


        /*
         * Сохраняем занятие локально
         */
        localStorage.setItem(
            localKey,
            JSON.stringify(session)
        );


        /*
         * Отправляем НАЧАЛО
         * в твою новую Google Таблицу
         */
        await postLectureEvent({
            action: 'start',

            id: session.id,

            fio: session.fio,

            staticId: session.staticId,

            activity: session.activity,

            date: session.date,

            startTime: session.startTime
        });


        /*
         * Запускаем секундомер
         */
        startLectureTimer(session);


        /*
         * Формируем обычный /todo
         */
        const output =
            document.getElementById(
                'output-lecture'
            );

        if (output) {
            output.textContent =
                 `/todo Военнослужащие начали ${activity}*Время на часах ${session.startTime}`;
        }


        showSiteNotification(
            'Занятие начато. Секундомер запущен.',
            'success'
        );

        return;
    }


    /* ============================================================
       ЗАКОНЧИЛИ
       ============================================================ */

    if (action === 'закончили') {

        const checkbox =
            document.getElementById(
                'lecture-count-confirm'
            );


        /*
         * Если не стоит галочка «Засчитать»,
         * оставляем занятие открытым.
         */
        if (
            !checkbox ||
            !checkbox.checked
        ) {

            generateTodo(
                `Лекция "${activity}" завершена, но не засчитана.`
            );

            showSiteNotification(
                'Занятие не засчитано.',
                'warning'
            );

            return;
        }


        /*
         * Получаем активное занятие
         */
        const session =
            await findOpenLecture(
                identity,
                activity
            );


        if (!session) {

            showSiteNotification(
                'Не найдено активное занятие.',
                'error'
            );

            stopLectureTimer();

            return;
        }


        const endTime =
            getCurrentTime();


        /*
         * Отправляем ЗАВЕРШЕНИЕ
         * в твою новую Google Таблицу
         */
        await postLectureEvent({

            action: 'finish',

            id: session.id,

            fio: session.fio ||
                identity.fio,

            staticId: session.staticId ||
                identity.staticId,

            activity: session.activity ||
                activity,

            date: session.date ||
                getMoscowDate(),

            startTime: session.startTime,

            endTime: endTime,

            counted: true
        });


        /*
         * Удаляем активную сессию
         */
        localStorage.removeItem(
            localKey
        );


        /*
         * Останавливаем секундомер
         */
        stopLectureTimer();


        /*
         * Сбрасываем галочку
         */
        checkbox.checked = false;


        /*
         * Обычный результат
         */
        generateTodo(
            `Лекция "${activity}" завершена и засчитана.`
        );


        showSiteNotification(
            'Занятие завершено и засчитано.',
            'success'
        );
    }
}

// ============================================================
// СЕКУНДОМЕР ЛЕКЦИИ / ТРЕНИРОВКИ
// ============================================================

let lectureTimerInterval = null;
let lectureTimerStart = null;

function getLectureTimerElements() {
    return {
        timer: document.getElementById('lecture-timer'),
        display: document.getElementById(
            'lecture-timer-display'
        ),
        activity: document.getElementById(
            'lecture-timer-activity'
        )
    };
}

function formatLectureTimer(totalSeconds) {
    const hours = Math.floor(
        totalSeconds / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const seconds =
        totalSeconds % 60;

    return [
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(seconds).padStart(2, '0')
    ].join(':');
}

function updateLectureTimer() {
    const elements =
        getLectureTimerElements();

    if (
        !elements.display ||
        !lectureTimerStart
    ) {
        return;
    }

    const elapsedSeconds =
        Math.max(
            0,
            Math.floor(
                (Date.now() - lectureTimerStart) /
                1000
            )
        );

    elements.display.textContent =
        formatLectureTimer(
            elapsedSeconds
        );
}

function startLectureTimer(session) {
    const elements =
        getLectureTimerElements();

    if (
        !elements.timer ||
        !elements.display
    ) {
        return;
    }

    lectureTimerStart =
        Number(session.startTimestamp) ||
        Date.now();

    elements.timer.style.display =
        'block';

    if (elements.activity) {
        elements.activity.textContent =
            session.activity || '';
    }

    updateLectureTimer();

    if (lectureTimerInterval) {
        clearInterval(
            lectureTimerInterval
        );
    }

    lectureTimerInterval =
        setInterval(
            updateLectureTimer,
            1000
        );
}

function stopLectureTimer() {
    if (lectureTimerInterval) {
        clearInterval(
            lectureTimerInterval
        );

        lectureTimerInterval = null;
    }

    lectureTimerStart = null;

    const elements =
        getLectureTimerElements();

    if (!elements.timer) {
        return;
    }

    elements.timer.style.display =
        'none';

    if (elements.display) {
        elements.display.textContent =
            '00:00:00';
    }

    if (elements.activity) {
        elements.activity.textContent =
            '';
    }
}

function restoreLectureTimer() {
    const fioInput =
        document.getElementById(
            'employee-fio'
        );

    const staticInput =
        document.getElementById(
            'employee-static'
        );

    if (
        !fioInput ||
        !staticInput
    ) {
        return;
    }

    const fio =
        fioInput.value.trim();

    const staticId =
        staticInput.value.trim();

    if (
        !fio ||
        !staticId
    ) {
        return;
    }

    const activityElement =
        document.getElementById(
            'lecture-activity'
        );

    if (!activityElement) {
        return;
    }

    const activity =
        activityElement.value;

    const localKey =
        getLecturePendingKey(
            staticId,
            activity
        );

    const saved =
        localStorage.getItem(
            localKey
        );

    if (!saved) {
        return;
    }

    try {
        const session =
            JSON.parse(saved);

        if (
            !session ||
            !session.startTimestamp
        ) {
            return;
        }

        startLectureTimer(
            session
        );

    } catch (error) {
        console.error(
            'Не удалось восстановить секундомер:',
            error
        );
    }
}

/* --- ГЕНЕРАТОР 4: ПРИСЯГА --- */
function generateOath() {
    const fioInput = document.getElementById('oath-fio');

    if (!fioInput) {
        console.error('Не найдено поле #oath-fio');
        return;
    }

    const fio = capitalizeWords(fioInput.value.trim());

    if (!fio) {
        alert('Введите ФИО военнослужащего');
        fioInput.focus();
        return;
    }

    const time = getCurrentTime();

    const result =
        `/todo Рядовой ${fio} Торжественно присягнул на верность Вооруженным Силам Российской Федерации*Время на часах ${time}`;

    const output = document.getElementById('output-oath');

    if (output) {
        output.textContent = result;
    }
}


/* --- ГЕНЕРАТОР 5: ЭКЗАМЕН --- */
function generateExam() {
    const fioInput = document.getElementById('exam-fio');

    if (!fioInput) {
        console.error('Не найдено поле #exam-fio');
        return;
    }

    const fio = capitalizeWords(fioInput.value.trim());

    if (!fio) {
        alert('Введите ФИО военнослужащего');
        fioInput.focus();
        return;
    }

    const rankElement = document.getElementById('exam-rank');
    const resultElement = document.querySelector('input[name="exam-result"]:checked');
    const attemptElement = document.getElementById('exam-attempt');
    const pointsElement = document.getElementById('exam-points');

    if (!rankElement || !resultElement || !attemptElement || !pointsElement) {
        console.error('Не все поля экзамена найдены.');
        return;
    }

    const rank = rankElement.value;
    const result = resultElement.value;
    const attempt = attemptElement.value;
    const points = pointsElement.value || '0';
    const time = getCurrentTime();

    const text =
        `/todo ${rank} ${fio} ${result} экзамен с ${attempt} попытки, набрав ${points} из 40 баллов*Время на часах ${time}`;

    const output = document.getElementById('output-exam');

    if (output) {
        output.textContent = text;
    }
}


/* --- ВЕЧЕРНЯЯ ПОВЕРКА --- */

async function loadRollCallLessons() {
    const dateInput = document.getElementById('rollcall-date');
    const lessonsInput = document.getElementById('rollcall-lessons');

    if (!dateInput || !lessonsInput) return;

    const date = dateInput.value || getMoscowDate();

    lessonsInput.value = 'Загрузка...';

    try {
        const data = await getLectureApi('count', { date });

        if (!data) {
            throw new Error('Пустой ответ от Google Apps Script.');
        }

        const count = Number(data.count);

        if (!Number.isFinite(count)) {
            throw new Error('В ответе API нет корректного количества занятий.');
        }

        lessonsInput.value = count;
    } catch (error) {
        console.error('Ошибка загрузки количества занятий:', error);

        lessonsInput.value = '0';

        showSiteNotification(
            'Не удалось получить количество засчитанных занятий. Проверьте подключение Google Таблицы.',
            'error',
            5000
        );
    }
}

function generateRollCall() {
    if (!requireEmployeeIdentity()) return;

    const position = document.getElementById('rollcall-position').value;
    const rank = document.getElementById('rollcall-rank').value;
    const surname = document.getElementById('rollcall-surname').value.trim();

    const total = parseInt(
        document.getElementById('rollcall-total').value,
        10
    ) || 0;

    const formation = parseInt(
        document.getElementById('rollcall-formation').value,
        10
    ) || 0;

    const absent = parseInt(
        document.getElementById('rollcall-absent').value,
        10
    ) || 0;

    const entryReports = parseInt(
        document.getElementById('rollcall-entry-reports').value,
        10
    ) || 0;

    const rankReports = parseInt(
        document.getElementById('rollcall-rank-reports').value,
        10
    ) || 0;

    const dismissal = document.getElementById('rollcall-dismissal').value;

    const lessons = parseInt(
        document.getElementById('rollcall-lessons').value,
        10
    ) || 0;

    if (!surname) {
        showSiteNotification(
            'Введите фамилию докладывающего.',
            'warning'
        );
        return;
    }

    if (formation > total) {
        showSiteNotification(
            'Количество военнослужащих в строю не может быть больше количества по списку.',
            'warning'
        );
        return;
    }

    /*
     * Лица, незаконно отсутствующие
     */
    const absentText = absent === 0
        ? 'Лиц, незаконно отсутствующих, нет.'
        : `Лиц, незаконно отсутствующих — ${absent}.`;

    /*
     * Рапорт на вступление
     */
    let entryReportText;

    if (entryReports === 0) {
        entryReportText =
            'За прошедшие сутки рапортов на вступление в учебный батальон не поступало.';
    } else if (entryReports === 1) {
        entryReportText =
            'За прошедшие сутки поступил один рапорт на вступление в учебный батальон.';
    } else {
        entryReportText =
            `За прошедшие сутки поступило ${entryReports} рапорта на вступление в учебный батальон.`;
    }

    /*
     * Рапорт на очередное звание
     */
    let rankReportText;

    if (rankReports === 0) {
        rankReportText =
            'Рапортов на присвоение очередного воинского звания не поступало.';
    } else if (rankReports === 1) {
        rankReportText =
            'Поступил один рапорт на присвоение очередного воинского звания.';
    } else {
        rankReportText =
            `Поступило ${rankReports} рапорта на присвоение очередного воинского звания.`;
    }

    /*
     * Документы на увольнение
     */
    let dismissalText;

    if (
        dismissal === 'не планируется' ||
        dismissal === 'Не планируется'
    ) {
        dismissalText =
            'не планируется.';
    } else {
        dismissalText =
            `${dismissal}.`;
    }

    /*
     * Формирование доклада
     */
    const result = [
        '1. Здравья Желаю Товарищ МО, Здравия желаю товарищ генерал и т.п., Здравья Желаю Товарищи Офицеры (полковники и ниже)',

        `Докладывает: ${position}, ${rank} ${surname}`,

        'Личный состав учебного батальона для вечерней поверки построен на плацу.',

        `По списку в учебном батальоне — ${total} военнослужащих.`,

        `В строю — ${formation} военнослужащих, включая меня.`,

        `Документы на увольнение военнослужащих из рядов ВС РФ ${dismissalText}`,

        absentText,

        entryReportText,

        'Подразделение работало в штатном режиме, оказывало содействие в проведении плановых и поставочных мероприятиях, а также в призывных мероприятиях.',

        `Организовано ${lessons} занятий с личным составом.`,

        rankReportText,

        'Конфликтов между подразделениями и внутри подразделения не зафиксировано.',

        `Докладывал: ${position}, ${rank} ${surname}`
    ].join('\n\n');

    document.getElementById('output-rollcall').textContent = result;
}


/* --- ДОПОЛНИТЕЛЬНЫЕ ГЕНЕРАТОРЫ --- */

function generateTraining() {
    const rank =
        document.getElementById('training-rank').value;

    const surname =
        document.getElementById('training-surname').value.trim();

    const training =
        document.getElementById('training-type').value;

    if (!surname) {
        showSiteNotification('Введите фамилию.', 'warning');
        return;
    }

    const result =
        `/todo ${rank} ${surname} провёл тренировку ${training}*Время на часах ${getCurrentTime()}`;

    document.getElementById(
        'output-training'
    ).textContent = result;
}

function generateReport() {
    const rank =
        document.getElementById('report-rank').value;

    const surname =
        document.getElementById('report-surname').value.trim();

    const type =
        document.getElementById('report-type').value;

    if (!surname) {
        showSiteNotification('Введите фамилию.', 'warning');
        return;
    }

    const result =
        `/todo ${rank} ${surname} ${type}*Время на часах ${getCurrentTime()}`;

    document.getElementById(
        'output-report'
    ).textContent = result;
}

function generateAnnouncement() {
    const text =
        document.getElementById('announcement-text').value.trim();

    if (!text) {
        showSiteNotification('Введите текст объявления.', 'warning');
        return;
    }

    document.getElementById(
        'output-announcement'
    ).textContent = text;
}


/* ============================================================
   ПОДСЧЁТ БАЛЛОВ + ССЫЛКИ НА СКРИНШОТЫ
   ============================================================ */

function createScreenshotLinks(row) {
    let container = row.querySelector('.points-screenshots');

    if (container) {
        return container;
    }

    container = document.createElement('div');
    container.className = 'points-screenshots';

    const linksList = document.createElement('div');
    linksList.className = 'points-screenshots__list';

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'points-screenshots__add';
    addButton.textContent = '+';
    addButton.title = 'Добавить ещё ссылку на скриншот';

    addButton.addEventListener('click', () => {
        addScreenshotInput(container);
    });

    container.appendChild(linksList);
    container.appendChild(addButton);

    row.appendChild(container);

    addScreenshotInput(container);

    return container;
}


function addScreenshotInput(container) {
    const list = container.querySelector('.points-screenshots__list');

    if (!list) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'points-screenshot';

    const input = document.createElement('input');
    input.type = 'url';
    input.className = 'points-screenshot__input';
    input.placeholder = 'Ссылка на скриншот';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'points-screenshot__remove';
    removeButton.textContent = '×';
    removeButton.title = 'Удалить ссылку';

    removeButton.addEventListener('click', () => {
        wrapper.remove();

        // Если удалили последнюю ссылку —
        // оставляем одно пустое поле
        if (!list.querySelector('.points-screenshot')) {
            addScreenshotInput(container);
        }
    });

    wrapper.appendChild(input);
    wrapper.appendChild(removeButton);
    list.appendChild(wrapper);

    input.focus();
}


function updateScreenshotFields(row, count) {
    let container = row.querySelector('.points-screenshots');

    if (count > 0) {
        if (!container) {
            container = createScreenshotLinks(row);
        }

        container.style.display = 'flex';
    } else {
        if (container) {
            container.style.display = 'none';
        }
    }
}


function getScreenshotLinks(row) {
    const inputs = row.querySelectorAll('.points-screenshot__input');

    return Array.from(inputs)
        .map(input => input.value.trim())
        .filter(Boolean);
}


function recalcPoints() {
    const rows = document.querySelectorAll('.points-calc__row');
    let grandTotal = 0;

    rows.forEach(row => {
        const input = row.querySelector('.points-calc__input');
        const totalElement = row.querySelector('.points-calc__total');

        if (!input || !totalElement) return;

        const points = parseInt(input.dataset.points, 10) || 0;
        const count = parseInt(input.value, 10) || 0;

        const total = points * count;

        totalElement.textContent = total;

        grandTotal += total;

        updateScreenshotFields(row, count);
    });

    const grandTotalElement = document.getElementById('points-grand-total');

    if (grandTotalElement) {
        grandTotalElement.textContent = grandTotal;
    }
}


function generatePointsReport() {
    if (!requireEmployeeIdentity()) return;

    const onlyNonZero =
        document.getElementById('only-non-zero')?.checked ?? true;

    const rows =
        document.querySelectorAll('.points-calc__row');

    const lines = [];
    let grandTotal = 0;

    document.querySelectorAll('.points-calc__group').forEach(group => {

        const groupTitle =
            group.querySelector('.points-calc__group-title')?.textContent.trim() || '';

        const groupLines = [];

        group.querySelectorAll('.points-calc__row').forEach(row => {

            const nameElement =
                row.querySelector('.points-calc__name');

            const input =
                row.querySelector('.points-calc__input');

            if (!nameElement || !input) return;

            const name = nameElement.textContent.trim();

            const points =
                parseInt(input.dataset.points, 10) || 0;

            const count =
                parseInt(input.value, 10) || 0;

            const total = points * count;

            grandTotal += total;

            // Обновляем отображение суммы строки
            const totalElement =
                row.querySelector('.points-calc__total');

            if (totalElement) {
                totalElement.textContent = total;
            }

            updateScreenshotFields(row, count);

            // Если включено "только ненулевые"
            // и количество равно 0 — не выводим строку
            if (onlyNonZero && count === 0) {
                return;
            }

            const screenshotLinks =
                getScreenshotLinks(row);

            let line =
                `${name} [${count}/${points}] -`;

            // Добавляем ссылки только если они действительно введены
            if (screenshotLinks.length > 0) {
                line += ` ${screenshotLinks.join(' ')}`;
            }

            groupLines.push(line);
        });

        if (groupLines.length > 0) {
            lines.push(groupTitle);
            lines.push(...groupLines);
            lines.push('');
        }
    });

    // Убираем лишнюю пустую строку в конце
    while (lines.length && lines[lines.length - 1] === '') {
        lines.pop();
    }

    lines.push('');
    lines.push(`Итого: ${grandTotal} баллов`);

    const output =
        document.getElementById('output-points');

    if (output) {
        output.textContent = lines.join('\n');
    }

    const grandTotalElement =
        document.getElementById('points-grand-total');

    if (grandTotalElement) {
        grandTotalElement.textContent = grandTotal;
    }
}


/* ============================================
   САМЫЕ АКТИВНЫЕ
   ============================================ */

function pluralizeRu(number, one, few, many) {
    const n = Math.abs(Number(number)) % 100;
    const n1 = n % 10;

    if (n >= 11 && n <= 19) {
        return many;
    }

    if (n1 === 1) {
        return one;
    }

    if (n1 >= 2 && n1 <= 4) {
        return few;
    }

    return many;
}


function createLeaderRow(leader, index) {

    const row = document.createElement('div');
    row.className = 'leader-row';

    /* Номер места */
    const rank = document.createElement('div');
    rank.className = 'leader-row__rank';
    rank.textContent = String(index + 1).padStart(2, '0');

    /* ФИО */
    const name = document.createElement('div');
    name.className = 'leader-row__name';
    name.textContent = leader.fio || 'Без имени';

    /* Статистика */
    const stats = document.createElement('div');
    stats.className = 'leader-row__stats';

    const lessons = document.createElement('div');
    lessons.className = 'leader-row__lessons';

    const lessonsCount = Number(leader.lessons) || 0;

    lessons.textContent =
        `${lessonsCount} ${
            pluralizeRu(
                lessonsCount,
                'занятие',
                'занятия',
                'занятий'
            )
        }`;

    const minutes = document.createElement('div');
    minutes.className = 'leader-row__minutes';

    const minutesCount = Number(leader.minutes) || 0;

    minutes.textContent =
        `${minutesCount} ${
            pluralizeRu(
                minutesCount,
                'минута',
                'минуты',
                'минут'
            )
        }`;

    stats.appendChild(lessons);
    stats.appendChild(minutes);

    row.appendChild(rank);
    row.appendChild(name);
    row.appendChild(stats);

    return row;
}


function renderLeaders(containerId, leaders) {

    const container =
        document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = '';

    if (
        !Array.isArray(leaders) ||
        leaders.length === 0
    ) {

        const state =
            document.createElement('div');

        state.className = 'leaders-state';

        state.textContent =
            'Пока нет занятий длительностью 10 минут и более.';

        container.appendChild(state);

        return;
    }

    leaders.forEach((leader, index) => {

        container.appendChild(
            createLeaderRow(leader, index)
        );

    });
}


async function loadLeaders() {

    const weekContainer =
        document.getElementById('leaders-week');

    const allContainer =
        document.getElementById('leaders-all');

    /*
     * Если блоков статистики на странице нет,
     * ничего не делаем.
     */
    if (!weekContainer && !allContainer) {
        return;
    }

    const [
        weekData,
        allData
    ] = await Promise.all([

        getLectureApi('leaders', {
            period: 'week',
            limit: '5'
        }),

        getLectureApi('leaders', {
            period: 'all',
            limit: '5'
        })

    ]);


    /* --- НЕДЕЛЯ --- */

    if (weekContainer) {

        if (
            weekData &&
            weekData.success
        ) {

            renderLeaders(
                'leaders-week',
                weekData.leaders
            );

        } else {

            weekContainer.innerHTML = `
                <div class="leaders-state leaders-state--error">
                    Не удалось загрузить статистику.
                </div>
            `;

        }

    }


    /* --- ВСЁ ВРЕМЯ --- */

    if (allContainer) {

        if (
            allData &&
            allData.success
        ) {

            renderLeaders(
                'leaders-all',
                allData.leaders
            );

        } else {

            allContainer.innerHTML = `
                <div class="leaders-state leaders-state--error">
                    Не удалось загрузить статистику.
                </div>
            `;

        }

    }

}



/* ============================================
   ПОИСК ПО САЙТУ
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    loadLeaders();


    /* --- ВОССТАНОВЛЕНИЕ ДАННЫХ СОТРУДНИКА --- */

    const fioInput =
        document.getElementById('employee-fio');

    const staticInput =
        document.getElementById('employee-static');

    if (fioInput) {
        fioInput.value =
            localStorage.getItem('tools_employee_fio') || '';
    }

    if (staticInput) {
        staticInput.value =
            localStorage.getItem('tools_employee_static') || '';

        staticInput.addEventListener('input', () => {
            let value =
                staticInput.value.replace(/\D/g, '');

            if (value.length > 6) {
                value = value.substring(0, 6);
            }

            if (value.length > 3) {
                value =
                    value.substring(0, 3) +
                    '-' +
                    value.substring(3);
            }

            staticInput.value = value;
        });
    }


    /* --- ОБРАБОТЧИКИ ЛЕКЦИИ / ТРЕНИРОВКИ --- */

    document
        .querySelectorAll('input[name="lecture-action"]')
        .forEach(input => {
            input.addEventListener(
                'change',
                toggleLectureAction
            );
        });

    toggleLectureAction();


    /* --- ВЕЧЕРНЯЯ ПОВЕРКА --- */

    const rollCallDate =
        document.getElementById('rollcall-date');

    if (rollCallDate) {
        rollCallDate.value =
            getMoscowDate();

        rollCallDate.addEventListener(
            'change',
            loadRollCallLessons
        );

        loadRollCallLessons();
    }


    /* ============================================
       ПОИСК
       ============================================ */

    const searchIndex = [
        {
            page: 'Главная',
            emoji: '🏠',
            url: 'index.html',
            keywords: 'главная учебный батальон 1 московская мотострелковая бригада вч 12132',
            description: 'Главная страница Учебного батальона.'
        },
        {
            page: 'Устав ВСРФ',
            emoji: '📖',
            url: 'ustav.html',
            keywords: 'устав вс рф военнослужащий обязанности права командир дисциплина',
            description: 'Основные положения устава Вооружённых Сил Российской Федерации.'
        },
        {
            page: 'Строевая подготовка',
            emoji: '🥾',
            url: 'drill.html',
            keywords: 'строевая подготовка строй строевая стойка повороты движение шаг команда',
            description: 'Материалы по строевой подготовке.'
        },
        {
            page: 'КПС',
            emoji: '🛡️',
            url: 'kps.html',
            keywords: 'кпс караульно постовая служба пост караул кпп вышка склад дневальный',
            description: 'Устав караульно-постовой службы.'
        },
        {
            page: 'Лекции и тренировки',
            emoji: '🎓',
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

    const input =
        document.getElementById('searchInput');

    const clearBtn =
        document.getElementById('searchClear');

    const resultsContainer =
        document.getElementById('searchResults');

    if (!input || !resultsContainer) return;

    let activeIndex = -1;


    function performSearch(query) {
        const q = query.trim().toLowerCase();

        clearBtn.classList.toggle(
            'is-visible',
            q.length > 0
        );

        if (q.length < 2) {
            resultsContainer.classList.remove(
                'is-open'
            );

            resultsContainer.innerHTML = '';

            return;
        }

        const matches =
            searchIndex.filter(item => {
                const haystack =
                    (
                        item.page +
                        ' ' +
                        item.keywords +
                        ' ' +
                        item.description
                    ).toLowerCase();

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

            resultsContainer.classList.add(
                'is-open'
            );

            return;
        }


        const label =
            document.createElement('div');

        label.className =
            'search__group-label';

        label.textContent =
            `Найдено: ${matches.length}`;

        resultsContainer.appendChild(label);


        matches.forEach((item, idx) => {
            const link =
                document.createElement('a');

            link.href = item.url;

            link.className =
                'search__result';

            link.dataset.index = idx;

            const titleHtml =
                highlightMatch(
                    item.page,
                    query
                );

            const descHtml =
                highlightMatch(
                    item.description,
                    query
                );

            link.innerHTML = `
                <div class="search__result-title">
                    <span class="search__result-title-emoji">${item.emoji}</span>
                    ${titleHtml}
                </div>
                <div class="search__result-desc">${descHtml}</div>
            `;

            resultsContainer.appendChild(link);
        });


        const hint =
            document.createElement('div');

        hint.className =
            'search__hint';

        hint.innerHTML = `
            <span>↑ ↓ — навигация</span>
            <span><kbd>Enter</kbd> — открыть</span>
            <span><kbd>Esc</kbd> — закрыть</span>
        `;

        resultsContainer.appendChild(hint);

        resultsContainer.classList.add(
            'is-open'
        );

        activeIndex = -1;
    }


    /* --- ПОДСВЕТКА СОВПАДЕНИЙ --- */

    function highlightMatch(text, query) {
        if (!query) {
            return escapeHtml(text);
        }

        const regex =
            new RegExp(
                `(${escapeRegex(query)})`,
                'gi'
            );

        return escapeHtml(text).replace(
            regex,
            '<span class="search__highlight">$1</span>'
        );
    }


    function escapeHtml(str) {
        const div =
            document.createElement('div');

        div.textContent = str;

        return div.innerHTML;
    }


    function escapeRegex(str) {
        return str.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        );
    }


    /* --- ЗАКРЫТИЕ СПИСКА --- */

    function closeResults() {
        resultsContainer.classList.remove(
            'is-open'
        );

        activeIndex = -1;
    }


    /* --- ОЧИСТКА ПОЛЯ --- */

    function clearInput() {
        input.value = '';

        clearBtn.classList.remove(
            'is-visible'
        );

        closeResults();

        input.focus();
    }


    /* --- НАВИГАЦИЯ СТРЕЛКАМИ --- */

    function updateActiveItem() {
        const items =
            resultsContainer.querySelectorAll(
                '.search__result'
            );

        items.forEach((el, i) => {
            el.classList.toggle(
                'is-active',
                i === activeIndex
            );

            if (i === activeIndex) {
                el.scrollIntoView({
                    block: 'nearest'
                });
            }
        });
    }


    /* --- ОБРАБОТЧИКИ СОБЫТИЙ --- */

    input.addEventListener(
        'input',
        e => {
            performSearch(e.target.value);
        }
    );


    input.addEventListener(
        'focus',
        () => {
            if (
                input.value.trim().length >= 2
            ) {
                performSearch(input.value);
            }
        }
    );


    clearBtn.addEventListener(
        'click',
        clearInput
    );


    /* --- ЗАКРЫТИЕ ПО КЛИКУ ВНЕ ПОИСКА --- */

    document.addEventListener(
        'click',
        e => {
            if (
                !input.contains(e.target) &&
                !resultsContainer.contains(e.target)
            ) {
                closeResults();
            }
        }
    );


    /* --- НАВИГАЦИЯ КЛАВИАТУРОЙ --- */

    input.addEventListener(
        'keydown',
        e => {
            const items =
                resultsContainer.querySelectorAll(
                    '.search__result'
                );

            if (!items.length) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();

                activeIndex =
                    (activeIndex + 1) %
                    items.length;

                updateActiveItem();

            } else if (e.key === 'ArrowUp') {
                e.preventDefault();

                activeIndex =
                    (activeIndex - 1 + items.length) %
                    items.length;

                updateActiveItem();

            } else if (e.key === 'Enter') {

                if (
                    activeIndex >= 0 &&
                    items[activeIndex]
                ) {
                    e.preventDefault();

                    window.location.href =
                        items[activeIndex].href;
                }

            } else if (e.key === 'Escape') {
                closeResults();
                input.blur();
            }
        }
    );


    /* --- ГЛОБАЛЬНЫЙ CTRL+K / CMD+K --- */

    document.addEventListener(
        'keydown',
        e => {
            if (
                (e.ctrlKey || e.metaKey) &&
                e.key.toLowerCase() === 'k'
            ) {
                e.preventDefault();

                input.focus();
                input.select();
            }
        }
    );

        restoreLectureTimer();
});