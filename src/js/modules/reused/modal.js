/* class Modal {
   constructor(element, settings = {}) {
      if (!element) return this;

      if (typeof (element) === 'string') {
         const elements = document.querySelectorAll(element);
         const objects = [];
         elements.forEach(element => {
            objects.push(new Modal(element, settings))
         });
         return objects.length === 1 ? objects[0] : objects;
      }

      // <variables>
      this.element = element;
      const targetModalSelector = element.dataset.modal;
      this.modal = document.querySelector(targetModalSelector);
      // </variables>

      this.element.addEventListener('click', e => this.onClick(e))
   }
   onClick(e) {
      e.preventDefault();
      // <scroll>
      // const widthScroll = window.innerWidth - document.documentElement.clientWidth;
      // document.documentElement.style.marginRight = `${widthScroll}px`;
      // document.body.style.overflow = 'hidden';
      // </scroll>
      this.modal.showModal();
   }
} */
import animate from './animateJS/animate.js';
import { visibilityScrollDocument } from './visibilityScrollDocument.js';
class Modal {
   constructor(selector) {
      // все триггеры открытия окна
      this.triggers = document.querySelectorAll(selector);
      this.init();
   }
   init() {
      // перебор всех триггеров
      for (const trigger of this.triggers) {
         const targetModalSelector = trigger.dataset.modal;
         const modalEl = document.querySelector(targetModalSelector);

         trigger.addEventListener('click', (e) => {
            e.preventDefault();
            // открыть соответствующее окно
            this.showModal(modalEl);
         })
      }
      // <открыть модальное окно по хэшу>
      const openModalFromHash = () => {
         const hash = window.location.hash;
         const modalEl = hash && (document.querySelector(hash));
         if (!modalEl) return;
         this.showModal(modalEl, { hash });
      }
      window.addEventListener('load', openModalFromHash);
      window.addEventListener('hashchange', openModalFromHash);
      // </открыть модальное окно по хэшу>
   }
   showModal(modalEl, { hash } = {}) {
      // если нет метода showModal => некий другой ошибочный узел
      if (!modalEl.showModal) return;

      visibilityScrollDocument.hide();

      // <set event close Modal>
      const animateEffect = modalEl.dataset.animate || 'fade';
      // все триггеры закрытия окна внутри окна
      const trigersHideModal = modalEl.querySelectorAll('[data-close]');
      const closeModal = () => {
         // fin - запустить после анимации
         const fin = () => {
            // document.body.style.overflow = '';
            // document.documentElement.style.marginRight = '';
            visibilityScrollDocument.visible();
            modalEl.close();
         }
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
         const _animate = animate({ draw, afterDraw: fin });
         requestAnimationFrame(_animate);
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
      }
      // на все триггеры закрытия повесить событие
      trigersHideModal.forEach(trigger => trigger.addEventListener('click', closeModal));
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
      const _animate = animate({ draw });
      requestAnimationFrame(_animate);
      // appearElement(modalEl, { displayValue: '' });
      modalEl.showModal();

      // установить фокус на первый фокусируемый элемент
      const modalBody = modalEl.querySelector('.modal__body');
      if (modalBody) {
         const control = modalBody.querySelectorAll('a, button, input,  select, textarea')[0];
         control && control.focus();
      }
      // удалить хэш из адресной строки если открытие было по хэшу
      const removeHash = () => {
         // если хэш тот же что и при открытии то удалить
         if (hash == window.location.hash) {
            history.pushState('', '', window.location.href.split('#')[0])
         }

      }
   }
}

new Modal('[data-modal]');