/* 
data-spollers="768, max" на каком брейкпоинте включать отключать
   если нет значения то работает в обысном режиме
data-spollers-one - можно открыть только один
data-spoller-close - при клике вне споллера закрывать все сполеры
 */
import Accordion from './detail.js';

class Spollers {
   constructor(el) {
      this.el = el;
      const details = [...this.el.querySelectorAll('details')].filter(item => item.tagName === 'DETAILS' && !item.hasAttribute('data-detail-init'));
      this.items = [];
      details.forEach(detail => {
         this.items.push(new Accordion(detail, { isItemSpollers: true }));
      });
      const dataSpollers = this.el.dataset.spollers;
      [this.breakpoint, this.rule] = this.parseDataSpollers(dataSpollers);
      this.flag = 0;
      this.on();
      if (this.breakpoint && this.rule) {
         this.onResize();
         window.addEventListener('resize', () => this.onResize())
      }
      this.isOneOpen = this.el.hasAttribute('data-spollers-one');
      this.el.addEventListener('click', e => this.onElClick(e));
      this.isSpollersClose = this.el.hasAttribute('data-spoller-close');

      this.onDocumentClickBinded = this.onDocumentClick.bind(this);
      this.onDetailsChangeStateBinded = this.onDetailsChangeState.bind(this);
   }
   parseDataSpollers(dataSpollers) {
      const array = dataSpollers.split(',').map(item => item.trim());
      return [+array[0], array[1]]
   }
   off() {
      this.expandAll();

      this.el.removeAttribute('data-spollers-minimize');
      this.isSpollersStateMinimize = false;

      this.el.removeEventListener('details-change-state', this.onDetailsChangeStateBinded)
   }
   on() {
      this.shrinkAll();

      this.el.setAttribute('data-spollers-minimize', '');
      this.isSpollersStateMinimize = true;
      // включить прослушивание открытия сполеров и если есть настройка закрывать сполеры
      // при клике вне споеров, то закрывать
      if (this.isSpollersClose) {
         this.el.addEventListener('details-change-state', this.onDetailsChangeStateBinded);
      }
   }
   onResize() {
      if (this.breakpoint >= window.innerWidth) {
         if (this.flag == -1 || this.flag == 0) {
            switch (this.rule) {
               case 'min':
                  // выключение
                  this.off();
                  break;
               case 'max':
                  // включение
                  this.on();
                  break;
               default:
                  this.on();
                  break;
            }
            this.flag = 1;
         }
      } else {
         if (this.flag == 1 || this.flag == 0) {
            switch (this.rule) {
               case 'min':
                  // включение
                  this.on();
                  break;
               case 'max':
                  // выключение
                  this.off();
                  break;
               default:
                  this.off();
                  break;
            }
            this.flag = -1;
         }
      }
   }
   onElClick(e) {
      const summary = e && e.target && e.target.closest('summary');
      if (!summary) return;
      e.preventDefault();
      if (!this.isSpollersStateMinimize) return;

      const curentDetails = this.items.find(item => item.el === summary.parentElement);
      if (this.isOneOpen) {
         this.items.forEach(item => {
            if (item.el !== curentDetails.el) {
               item.shrink();
            }
         })
      }
      curentDetails.onClick(e);
   }
   isExistsOpen() {
      return this.items.some(item => item.el.open);
   }
   shrinkAll() {
      this.items.forEach(element => {
         element.shrink();
      });
   }
   expandAll() {
      this.items.forEach(element => {
         element.open();
      });
   }
   onDocumentClick(e) {
      const target = e && e.target;
      if (!target) return;
      if (!this.el.contains(target)) {
         this.shrinkAll();
         document.removeEventListener('click', this.onDocumentClickBinded);
      }
   }
   onDetailsChangeState(e) {
      const target = e && e.target;
      const open = e && e.detail && e.detail.open
      if (!target) return;
      if (open) {
         // добавить прослушивания клика вне сполера
         document.addEventListener('click', this.onDocumentClickBinded);
      }
   }
}

export default Spollers;