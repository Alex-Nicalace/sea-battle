import animate from './animateJS/animate.js';
import { visibilityScrollDocument } from './visibilityScrollDocument.js';
/**
 * Класс, представляющий модальное окно.
 */
class Modal {
   /**
    * Создает экземпляр класса Modal.
    * @param {string | undefined} selector - Селектор для выбора всех триггеров открытия окна.
    */
   constructor(selector) {
      // все триггеры открытия окна
      this.triggers = document.querySelectorAll(selector);
      this.init();
   }
   /**
    * Триггеры открытия окна.
    * @type {NodeList}
    */
   triggers;
   /**
    * Инициализация модального окна.
    * @private
    */
   init() {
      // перебор всех триггеров
      for (const trigger of this.triggers) {
         const targetModalSelector = trigger.dataset.modal;
         const modalEl = document.querySelector(targetModalSelector);

         trigger.addEventListener('click', (e) => {
            e.preventDefault();
            // открыть соответствующее окно
            Modal.showModal(modalEl);
         })
      }
      /**
       * открыть модальное окно по хэшу
       */
      const openModalFromHash = () => {
         const hash = window.location.hash;
         const modalEl = hash && (document.querySelector(hash));
         if (!modalEl) return;
         Modal.showModal(modalEl);
      }
      window.addEventListener('load', openModalFromHash);
      window.addEventListener('hashchange', openModalFromHash);
   }
   /**
    * Отображает модальное окно.
    * @param {HTMLDialogElement} modalEl - Элемент модального окна.
    * @param {Object} [options] - Дополнительные параметры.
    * @param {Object} [options.content] Контент для элементов диалогового окна
    * @param {string} [options.content.titleContetnt] Контент заголовка окна
    * @param {string} [options.content.bodyContetnt] Контент для тела диалогового окна
    * @returns {Promise<HTMLElement>} HTML-триггер загрытия окна (логика что было нажато и что делать в месте вызова)
    */
   static showModal(modalEl, { content } = {}) {
      return new Promise((res, rej) => {
         // если нет метода showModal => некий другой ошибочный узел
         if (!modalEl.showModal) rej(new Error('The element HTMLDialog is not specified'));

         if (content) {
            setContentToElement('.modal__title', content.titleContetnt);
            setContentToElement('.modal__body', content.bodyContetnt);
         }

         visibilityScrollDocument.hide();

         // <set event close Modal>
         const animateEffect = modalEl.dataset.animate || 'fade';
         // все триггеры закрытия окна внутри окна
         const trigersHideModal = modalEl.querySelectorAll('[data-close]');
         /**
          * 
          * @param {HTMLElement|undefined} element 
          */
         const closeModal = (element = undefined) => {
            // fin - запустить после анимации
            // <анимация закрытия>
            let draw;
            switch (animateEffect) {
               case 'slide-in-right':
                  draw = (progress) => {
                     modalEl.style.transform = `translateX(${progress * 100}%)`;
                     if (progress == 1) {
                        modalEl.style.transform = '';
                     }
                  }
                  break;
               case 'slide-in-left':
                  draw = (progress) => {
                     modalEl.style.transform = `translateX(${progress * -100}%)`;
                     if (progress == 1) {
                        modalEl.style.transform = '';
                     }
                  }
                  break;
               default:
                  draw = (progress) => {
                     modalEl.style.opacity = 1 - progress;
                     if (progress == 1) {
                        modalEl.style.opacity = '';
                     }
                  }
                  break;
            }
            animate({ draw })
               .then(() => {
                  // document.body.style.overflow = '';
                  // document.documentElement.style.marginRight = '';
                  visibilityScrollDocument.visible();
                  modalEl.close();
               });
            // </анимация закрытия>
            // убрать слушатели со всех триггеров закрытия
            trigersHideModal.forEach(trigger => trigger.removeEventListener('click', closeModal));
            // убрать триггер закрытия с клика по оверлею
            modalEl.removeEventListener('click', onClickOverlay);
            // убрать триггер закрытия по Esc
            modalEl.removeEventListener('keydown', onKeyDownModal);
            // убрать прослушивание отменв выбора файла
            modalEl.removeEventListener('cancel', onCancelFileSelect);
            // модалка могла быть открыта по хэшу => удалить из адреса хэш
            removeHash();
            res(element)
         }
         // на все триггеры закрытия повесить событие
         trigersHideModal.forEach(trigger => trigger.addEventListener('click', () => closeModal(trigger)));
         // клик по оверлею = закрытие
         const onClickOverlay = (e) => {
            const target = e && e.target;
            if (target == modalEl) {
               closeModal();
            }
         }
         modalEl.addEventListener('click', onClickOverlay);
         // убрать триггер закрытия по Esc
         const onKeyDownModal = (e) => {
            if (e.code === 'Escape') {
               e.preventDefault();
               closeModal();
            }
         }
         modalEl.addEventListener('keydown', onKeyDownModal);

         // в хроме отмена выбора файла закрывает <dialog>
         // возникает событие cancel которое подымается и закрывает <dialog>
         // причем свойство event.cancelable=false т.е. оменить нельзя
         // лечение => на <dialog> ставлю слушать событие cancel, проверяю что это именно случай с input.type == 'file'
         // и тогда вкл. слушатель события close и в нем опять показываю модалку... костыль а что делать ....
         // причем FireFox(FF) поведение другое событие cancel не закрывает модалку, поэтому делаю проверку промежутка времени
         // м/у событиями cancel & close если предельно мало значит Chrome. событие close удаляю если не сработало меньше чем за 102мс
         // значит не сдучай Crome
         const onCancelFileSelect = (e) => {
            const target = e && e.target;
            if (target.tagName == 'INPUT' && target.type == 'file') {
               const cancelTime = performance.now();
               const onCloseModal = () => {
                  const time = performance.now() - cancelTime;
                  if (time < 100) {
                     modalEl.showModal();
                  }
                  modalEl.removeEventListener('close', onCloseModal);
               }
               modalEl.addEventListener('close', onCloseModal);
               setTimeout(() => {
                  modalEl.removeEventListener('close', onCloseModal);
               }, 102);
            }
         }
         modalEl.addEventListener('cancel', onCancelFileSelect);
         // </set event close Modal>

         let draw;
         switch (animateEffect) {
            case 'slide-in-right':
               draw = (progress) => {
                  modalEl.style.transform = `translateX(${100 - (progress * 100)}%)`;
                  if (progress == 1) {
                     modalEl.style.transform = '';
                  }
               }
               break;
            case 'slide-in-left':
               draw = (progress) => {
                  modalEl.style.transform = `translateX(${-100 + (progress * 100)}%)`;
                  if (progress == 1) {
                     modalEl.style.transform = '';
                  }
               }
               break;
            default:
               draw = (progress) => {
                  modalEl.style.opacity = progress;
                  if (progress == 1) {
                     modalEl.style.opacity = '';
                  }
               }
               break;
         }
         animate({ draw });
         modalEl.showModal();

         // установить фокус на первый фокусируемый элемент
         const modalBody = modalEl.querySelector('.modal__body');
         if (modalBody) {
            const control = modalBody.querySelectorAll('a, button, input,  select, textarea')[0];
            control && control.focus();
         }
         // удалить хэш из адресной строки если открытие было по хэшу
         const removeHash = () => {
            const hash = `#${modalEl.id}`;
            // если хэш тот же что и при открытии то удалить
            if (hash == window.location.hash) {
               history.pushState('', '', window.location.href.split('#')[0])
            }

         }

         /**
          * 
          * @param {string} selector Селектор элемента диалогового окна
          * @param {string | HTMLElement} contetnt Контент
          */
         function setContentToElement(selector, contetnt) {
            if (contetnt === undefined) return;
            /**
             * @type {HTMLElement}
             */
            const element = modalEl.querySelector(selector);
            if (!element) return;
            element.innerHTML = contetnt;
         }
      })
   }
}

// new Modal('[data-modal]');
export default Modal;