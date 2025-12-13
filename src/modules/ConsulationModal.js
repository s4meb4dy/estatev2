class ConsultationMenu {
    // Селекторы для элементов
    selectors = {
        root: '[data-js-modal-menu]', // Корневой элемент меню
        dialog: '[data-js-modal-menu-dialog]', // Диалоговое окно меню
        openButtonFirst: '[data-js-modal-menu-open-first]', // Кнопка открытия 1
        openButtonSecond: '[data-js-modal-menu-open-second]', // Кнопка открытия 2
        openButtonThird: '[data-js-modal-menu-open-third]', // Кнопка открытия 3
        openButtonFourth: '[data-js-modal-menu-open-fourth]', // Кнопка открытия 4
        openButtonFifth: '[data-js-modal-menu-open-fifth]', // Кнопка открытия 5
        takeCallback: '[data-js-modal-menu-open-sixth]',
        closeButton: '[data-js-modal-menu-close]', // Кнопка закрытия
    };

    // Классы для управления состоянием
    stateClasses = {
        isActive: 'is-active', // Класс для активного состояния меню
        isLock: 'is-lock', // Класс для блокировки скролла страницы
    };

    constructor() {
        // Инициализация элементов
        this.rootElement = document.querySelector(this.selectors.root);
        this.dialogElement = document.querySelector(this.selectors.dialog);

        // Кнопки открытия
        this.openFirstButtonElement = document.querySelector(this.selectors.openButtonFirst);
        this.openSecondButtonElement = document.querySelector(this.selectors.openButtonSecond);
        this.openThirdButtonElement = document.querySelector(this.selectors.openButtonThird);
        this.openFourthButtonElement = document.querySelector(this.selectors.openButtonFourth);
        this.openFifthButtonElement = document.querySelector(this.selectors.openButtonFifth);
        this.takeCallback = document.querySelector(this.selectors.takeCallback);

        // Кнопка закрытия
        this.closeButtonElement = this.dialogElement.querySelector(this.selectors.closeButton);

        // Привязка событий
        this.bindEvents();
    }

    // Метод для открытия меню
    openMenu = () => {
        this.rootElement.classList.add(this.stateClasses.isActive); // Добавляем класс isActive
        this.dialogElement.open = true; // Открываем диалог
        document.documentElement.classList.add(this.stateClasses.isLock); // Блокируем скролл
    };

    // Метод для закрытия меню
    closeMenu = () => {
        this.rootElement.classList.remove(this.stateClasses.isActive); // Убираем класс isActive
        this.dialogElement.open = false; // Закрываем диалог
        document.documentElement.classList.remove(this.stateClasses.isLock); // Разблокируем скролл
    };

    // Привязка событий
    bindEvents() {
        // Открытие меню по всем кнопкам
        if (this.openFirstButtonElement) {
            this.openFirstButtonElement.addEventListener('click', this.openMenu);
        }
        if (this.openSecondButtonElement) {
            this.openSecondButtonElement.addEventListener('click', this.openMenu);
        }
        if (this.openThirdButtonElement) {
            this.openThirdButtonElement.addEventListener('click', this.openMenu);
        }
        if (this.openFourthButtonElement) {
            this.openFourthButtonElement.addEventListener('click', this.openMenu);
        }
        if (this.openFifthButtonElement) {
            this.openFifthButtonElement.addEventListener('click', this.openMenu);
        }
        if (this.takeCallback) {
            this.takeCallback.addEventListener('click', this.openMenu);
        }

        // Закрытие меню по кнопке
        if (this.closeButtonElement) {
            this.closeButtonElement.addEventListener('click', this.closeMenu);
        }

        // Закрытие меню при клике вне его области
        if (this.rootElement) {
            this.rootElement.addEventListener('click', (event) => {
                if (event.target === this.rootElement) {
                    this.closeMenu();
                }
            });
        }
    }
}

// Экспорт класса (если используется модульная система)
export default ConsultationMenu;