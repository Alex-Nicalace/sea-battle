/**
 * @typedef {Function} CallbackType - Функция, принимающая параметры node типа Node и event типа Event.
 * @param {Node} dragElement - Перетаскиваемый узел.
 * @param {Event} event - Объект события.
 * @returns {boolean} - если True то выйти из функции
 */
/**
 * Класс, представляющий перетаскиваемый элемент.
 * чтобы работало на ТАЧСКРИНАХ нужно для передвигаемого
 * эелемента установить TOUCH-ACTION: NONE;
 * @class Dragable
 */
class Dragable {
   /**
    * Создайте перетаскиваемый элемент.
    * @constructor
    * @param {String} selector - селектор
    * @param {Object} options - настройки
    * @param {CallbackType} [options.cbMouseDown] 
    * @param {CallbackType} [options.cbMouseMove]
    * @param {CallbackType} [options.cbMouseUp = (dragElement) => {}]
    */
   constructor(selector, {
      cbMouseDown,
      cbMouseMove,
      cbMouseUp = (dragElement) => {
         // переключаемся обратно на абсолютные координаты
         // чтобы закрепить элемент относительно документа
         dragElement.style.top = parseInt(dragElement.style.top) + scrollY + 'px';
         dragElement.style.position = 'absolute';
      }
   } = {}) {
      this.dragElements = [...document.querySelectorAll(selector)];
      this.cbMouseDown = cbMouseDown;
      this.cbMouseMove = cbMouseMove;
      this.cbMouseUp = cbMouseUp;
      this.onMouseDown = this.onMouseDown.bind(this);
   }
   /**
    * @type {Array<Node>} массив элементов, которые должны переаскиваться
    */
   dragElements = [];
   /** 
    * @type {CallbackType}
    * @param {Node} dragElement - Перетаскиваемый узел.
    * @param {Event} event - Объект события.
    * @returns {boolean} если True то выйти из функции
    */
   cbMouseDown;
   /**
    * @type {CallbackType}
    * @param {Node} dragElement - Перетаскиваемый узел.
    * @param {Event} event - Объект события.
    * @returns {boolean} если True то выйти из функции
    */
   cbMouseMove;
   /**
    * @type {CallbackType}
    * @param {Node} dragElement - Перетаскиваемый узел.
    * @param {Event} event - Объект события.
    * @returns {boolean} если True то выйти из функции
    */
   cbMouseUp;
   /**
    * включить Drag'n drop
    */
   on() {
      this.dragElements.forEach(dragElement => {
         dragElement.style.touchAction = 'none';
         dragElement.addEventListener('pointerdown', this.onMouseDown);
      });
   }
   /**
    * отключить Drag'n drop
    */
   off() {
      this.dragElements.forEach(dragElement => {
         dragElement.style.touchAction = '';
         dragElement.removeEventListener('pointerdown', this.onMouseDown);
      });
   }
   /**
    * @param {Event} e - объект события
    */
   onMouseDown(e) {
      const dragElement = e && e.currentTarget;
      e.preventDefault();
      if (!dragElement) return;

      // по результатм колюэка выполнять далее функцию или нет
      if (typeof this.cbMouseDown === 'function') {
         if (this.cbMouseDown(dragElement, e)) return;
      }

      dragElement.setPointerCapture(e.pointerId);
      dragElement.ondragstart = function () {
         return false;
      };

      const cbMouseMove = this.cbMouseMove;
      const cbMouseUp = this.cbMouseUp;
      let shiftX, shiftY;

      startDrag(dragElement, e.clientX, e.clientY); // e.clientX, e.clientY координаты относительно окна

      function onMouseUp(e) {
         finishDrag(e);
      };

      function onMouseMove(e) {
         moveAt(e.clientX, e.clientY);

         if (typeof (cbMouseMove) == 'function') {
            cbMouseMove(dragElement, e);
         }
      }

      // в начале перемещения элемента:
      //   запоминаем место клика по элементу (shiftX, shiftY),
      //   переключаем позиционирование элемента (position:fixed) и двигаем элемент
      function startDrag(element, clientX, clientY) {
         if (Dragable.isDragging) {
            return;
         }

         Dragable.isDragging = true;

         dragElement.addEventListener('pointermove', onMouseMove);
         dragElement.addEventListener('pointerup', onMouseUp);

         shiftX = clientX - element.getBoundingClientRect().left;
         shiftY = clientY - element.getBoundingClientRect().top;

         element.style.position = 'fixed';

         moveAt(clientX, clientY);
      };

      function finishDrag(e) {
         if (!Dragable.isDragging) {
            return;
         }

         Dragable.isDragging = false;

         if (typeof cbMouseUp === 'function') {
            cbMouseUp(dragElement, e);
         }

         dragElement.removeEventListener('pointermove', onMouseMove);
         dragElement.removeEventListener('pointerup', onMouseUp);
      }

      function moveAt(clientX, clientY) {
         // вычисляем новые координаты (относительно окна)
         let newX = clientX - shiftX;
         let newY = clientY - shiftY;

         // проверяем, не переходят ли новые координаты за нижний край окна:
         // сначала вычисляем гипотетический новый нижний край окна
         let newBottom = newY + dragElement.offsetHeight;

         // затем, если новый край окна выходит за пределы документа, прокручиваем страницу
         if (newBottom > document.documentElement.clientHeight) {
            // координата нижнего края документа относительно окна
            let docBottom = document.documentElement.getBoundingClientRect().bottom;

            // простой скролл документа на 10px вниз имеет проблему -
            // он может прокручивать документ за его пределы,
            // поэтому используем Math.min(расстояние до конца, 10)
            let scrollY = Math.min(docBottom - newBottom, 10);

            // вычисления могут быть не совсем точны - случаются ошибки при округлении,
            // которые приводят к отрицательному значению прокрутки. отфильтруем их:
            if (scrollY < 0) scrollY = 0;

            window.scrollBy(0, scrollY);

            // быстрое перемещение мыши может поместить курсор за пределы документа вниз
            // если это произошло -
            // ограничиваем новое значение Y максимально возможным исходя из размера документа:
            newY = Math.min(newY, document.documentElement.clientHeight - dragElement.offsetHeight);
         }

         // проверяем, не переходят ли новые координаты за верхний край окна (по схожему алгоритму)
         if (newY < 0) {
            // прокручиваем окно вверх
            let scrollY = Math.min(-newY, 10);

            window.scrollBy(0, -scrollY);
            // быстрое перемещение мыши может поместить курсор за пределы документа вверх
            newY = Math.max(newY, 0); // newY не может быть меньше нуля
         }

         // аналогично по оси X
         let newRight = newX + dragElement.offsetWidth;

         if (newRight > document.documentElement.clientWidth) {
            let docRight = document.documentElement.scrollWidth - document.documentElement.scrollLeft;
            let scrollX = Math.min(docRight - newRight, 10);
            if (scrollX < 0) scrollX = 0;
            window.scrollBy(scrollX, 0);
            newX = Math.min(newX, document.documentElement.clientWidth - dragElement.offsetWidth);
         }

         if (newX < 0) {
            let scrollX = Math.min(-newX, 10);
            window.scrollBy(-scrollX, 0);
            newX = Math.max(newX, 0);
         }

         dragElement.style.left = newX + 'px';
         dragElement.style.top = newY + 'px';
      }
   }
}
export default Dragable;