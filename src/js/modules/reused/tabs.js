/* 
   <div data-tabs class="card-product__tabs tabs">
      <nav data-tabs-titles class="tabs__navigation">
         <button type="button" class="tabs__title tabs__title_active"><span>General info</span></button>
         <button type="button" class="tabs__title">Product details</button>
         <button type="button" class="tabs__title">Reviews</button>
      </nav>
      <div data-tabs-body class="tabs__content">
         <div class="tabs__body tabs__body_active">
            Содержимое первого таба
         </div>
         <div class="tabs__body">
            Содержимое второго таба
         </div>
         <div class="tabs__body">
            Содержимое третьего таба
         </div>
      </div>
   </div>
 */

/**
 * Представляет компонент вкладок.
 * если табы в проекте единообразны, то можно сделать структуру с контейнером с атрибутом data-tabs и на этот атрибут натравить класс
 * стилизрвать блок tabs
 * Если есть индивидуальные Табы по стилизации и поведению, то можно натравить в настройках на любой селектор и указать доп. настройки
 * @class
 */
class Tabs {
   /**
    * Создает экземпляр класса Tabs.
    * @constructor
    * @param {Element|String} [element='[data-tabs]'] - DOM-элемент или строка с селектором для контейнера вкладок.
    * @param {Object} settings - Объект с параметрами функции.
    * @param {Number} [settings.index=0] - Индекс.
    * @param {Array.<String>} [settings.classesButtonActive=['tabs-title-active']] - Массив классов активной кнопки.
    * @param {Array.<String>} [settings.classesContentActive=['tabs-body-active']] - Массив классов активного контента.
    * @param {Array.<String>} [settings.classesContentAnimate=[]] - Массив классов активной вкладки связанных с анимацией.
    * @param {String} [settings.selectorButtons='[data-tabs-titles] > button'] - Селектор переключателей табов.
    * @param {String} [settings.selectorTabsBody='[data-tabs-body] > *'] - Селектор контента вкладок.
    * @param {String} [settings.nameParam] - название параметра в адресной строке, который будет отражать номер активного таба
    */
   constructor(element = '[data-tabs]', settings) {
      if (!element) return this;

      if (typeof element === 'string') {
         const elements = document.querySelectorAll(element);
         const objects = [];
         elements.forEach((element) => {
            objects.push(new Tabs(element, settings));
         });
         return objects.length === 1 ? objects[0] : objects;
      }

      const {
         index,
         classesButtonActive = ['tabs__title_active'],
         classesContentActive = ['tabs__body_active'],
         classesContentAnimate = [],
         selectorButtons = '[data-tabs-titles] > button',
         selectorTabsBody = '[data-tabs-body] > *',
         nameParam,
      } = settings;

      // Наименования классов
      this.classesButtonActive = classesButtonActive;
      this.classesContentActive = classesContentActive;
      this.classesContentActiveExtend = [...classesContentAnimate, ...this.classesContentActive];
      // Конец наименований классов

      this.element = element;
      this.buttons = [...this.element.querySelectorAll(selectorButtons)];
      this.contents = [...this.element.querySelectorAll(selectorTabsBody)];
      this.nameParam = nameParam;
      this.maxIndex = this.buttons.length - 1;

      this.onStateChange = this.onStateChange.bind(this);

      this.init(index);
   }

   /**
    * Инициализирует компонент вкладок.
    * @param {Number | Undefined} index - Индекс начально активной вкладки.
    * @returns {Void}
    */
   init(index) {
      const activeIndex = this.getParamFromState() || index || this.buttons.findIndex((button) => button.classList.contains(this.classButtonActive));
      this.setIndex(activeIndex);

      this.buttons.forEach((button) => {
         button.addEventListener('click', (e) => this.onClickButton(e));
      });
      // событие изменения адресной строки
      window.addEventListener('popstate', this.onStateChange);
   }

   /**
    * возвращает значение параметра из адресной строки
    * @returns {number | undefined}
    */
   getParamFromState() {
      if (!this.nameParam) return;
      const { search } = window.location;
      const paramsObj = Object.fromEntries(search.slice(1).split('&').filter(item => item).map(item => item.split('=')));
      const idx = +paramsObj[this.nameParam];
      if (typeof idx === 'number') {
         return idx
      }
   }

   /**
    * изменяет активную владку исходя их параметра в адресной строке
    */
   onStateChange() {
      const idx = this.getParamFromState();
      if (idx) {
         this.setIndex(idx, true, false);
      }
   }

   /**
    * Добавляет или удаляет классы для указанных элементов на основе индекса.
    * @param {Element[]} elements - Элементы, которые нужно изменить.
    * @param {Number} index - Индекс для сравнения.
    * @param {String[]} nameClass - Имена классов для добавления или удаления.
    * @returns {Void}
    */
   setActiveClass(elements, index, nameClass = []) {
      elements.forEach((button, ind) => {
         if (+index === +ind) {
            button.classList.add(...nameClass);
         } else {
            button.classList.remove(...nameClass);
         }
      });
   }

   /**
    * Устанавливает активный индекс и обновляет пользовательский интерфейс.
    * @param {Number} [index=0] - Индекс, который будет установлен в качестве активного.
    * @param {Boolean} [isSetClassAnimate=false] - Определяет, нужно ли установить классы, связанные с анимацией.
    * @param {Boolean} [isPushState=true] - нужно ли пушить историю браузера.
    * @returns {Void}
    */
   setIndex(index = 0, isSetClassAnimate = false, isPushState = true) {
      const actualIndex = Math.max(0, Math.min(index, this.maxIndex));
      this.currentIndex = actualIndex;

      this.setActiveClass(this.buttons, this.currentIndex, this.classesButtonActive);
      const classContentActive = isSetClassAnimate
         ? this.classesContentActiveExtend
         : this.classesContentActive;
      this.setActiveClass(this.contents, this.currentIndex, classContentActive);

      if (isPushState) {
         this.changeParamInState();
      }
   }

   /**
    * отражает в адресной строке текущую активную вкладку
    * @returns 
    */
   changeParamInState() {
      if (!this.nameParam) return;
      const { pathname, search, hash } = window.location;
      const paramsObj = Object.fromEntries(search.slice(1).split('&').filter(item => item).map(item => item.split('=')));
      paramsObj[this.nameParam] = this.currentIndex;
      const paramsStr = '?' + Object.entries(paramsObj).map(([key, val]) => `${key}=${val}`).join('&');
      const newUrl = pathname + paramsStr + hash;
      history.pushState(null, null, newUrl);
   }

   /**
    * Обрабатывает событие клика на кнопках вкладок.
    * @param {Event} e - Объект события клика.
    * @returns {Void}
    */
   onClickButton(e) {
      const currentButton = e && e.currentTarget;
      if (!currentButton) return;

      const currentIndex = this.buttons.findIndex((element) => element === currentButton);
      this.setIndex(currentIndex, true);
   }

   /**
    * Возвращает текущий активный индекс.
    * @type {Number}
    */
   get index() {
      return this.currentIndex;
   }

   /**
    * Устанавливает активный индекс.
    * @type {Number}
    */
   set index(index) {
      this.setIndex(index);
   }
}

export default Tabs;