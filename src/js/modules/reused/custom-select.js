import { DropdownBtn } from './dropdown-btn.js'

class CustomSelect extends DropdownBtn {
   constructor(selectEl, options = {}) {
      // создаю контейнер для нового элесента
      const dropdown = document.createElement('div');
      // все отрибуты селекта копирую в новый эл.-контейнер
      for (const element of selectEl.attributes) {
         dropdown.setAttribute(element.name, element.value)
      }

      if (!super(dropdown, options)) return;

      selectEl.after(dropdown);

      this._select = selectEl;
      this._triggerEmptyValClass = `${this._triggerClass}_empty-value`;

      selectEl.className = '';
      selectEl.hidden = true;
      this._dropdown.prepend(selectEl);

      this._dropdown.classList.add(`${this._blockSelector}_select`);

      this._options = [];
      const createDropDown = () => {
         // проверить если в выпадающем списке хоть одна иконка
         const isExistsIcon = [...this._select.options].some(option => option.dataset.icon);
         if (isExistsIcon) {
            this._triggerIcon = document.createElement('img');
            this._triggerIcon.width = 16;
            this._triggerIcon.height = 16;
            this._triggerIcon.classList.add(`${this._blockSelector}__icon`);
            this._trigger.prepend(this._triggerIcon);
         }
         for (const option of this._select.options) {
            const optionBtn = document.createElement('button');

            const optionBtnLabel = document.createElement('span');
            optionBtnLabel.classList.add(`${this._blockSelector}__label-option`);
            optionBtnLabel.textContent = option.textContent;

            if (option.dataset.icon) {
               const optionBtnIcon = document.createElement('img');
               optionBtnIcon.classList.add(`${this._blockSelector}__icon-option`);
               optionBtnIcon.src = option.dataset.icon;
               optionBtnIcon.width = 16;
               optionBtnIcon.height = 16;
               optionBtn.append(optionBtnIcon);
            }

            optionBtn.type = 'button';
            optionBtn.dataset.value = option.value;
            optionBtn.append(optionBtnLabel);

            option.selected && (optionBtn.dataset.selected = '');
            optionBtn.classList.add(`${this._blockSelector}__option`);
            !option.value && optionBtn.classList.add(`${this._blockSelector}__option_empty-value`);
            this._content.append(optionBtn);
            this._options.push({ option, optionBtn })
         }
      }
      createDropDown();

      this.syncSelectedOptions();

      this._onKeyDownContentBind = this._onKeyDownContent.bind(this);

      const onClickOption = e => {
         const target = e && e.target;
         if (!target) return;

         const optionBtn = target.closest(`.${this._blockSelector}__option`);
         if (!optionBtn) return;

         const value = optionBtn.dataset.value;
         this._select.value = value;
         this.syncSelectedOptions();
         this.close();
      }
      this._content.addEventListener('click', onClickOption);
      this._content.addEventListener('dropdown-open', () => {
         const record = this._options.find(rec => rec.optionBtn.hasAttribute('data-selected'));
         if (!record) return;
         const optionBtn = record.optionBtn;
         setTimeout(() => {
            optionBtn.focus();
         }, 300);

         this._content.addEventListener('keydown', this._onKeyDownContentBind);
         const onDropdownClose = () => {
            this._content.removeEventListener('keydown', this._onKeyDownContentBind);
            this._content.removeEventListener('dropdown-close', onDropdownClose);
         }
         this._content.addEventListener('dropdown-close', onDropdownClose);
      });
   }
   _onKeyDownContent(e) {
      const keyCode = e && e.code;
      if (keyCode !== 'ArrowDown' && keyCode !== 'ArrowUp') return;

      e.preventDefault();

      const focusedElement = document.activeElement;
      const indexElement = this._options.findIndex(record => record.optionBtn == focusedElement);
      const step = keyCode == 'ArrowDown' ? 1 : -1;
      let nextIndex = indexElement + step;
      if (nextIndex > this._options.length - 1) {
         nextIndex = 0;
      }
      if (nextIndex < 0) {
         nextIndex = this._options.length - 1;
      }
      this._options[nextIndex].optionBtn.focus();
   }

   syncSelectedOptions() {
      this._options.forEach(item => {
         if (item.option.selected) {
            item.optionBtn.setAttribute('data-selected', '');
            // this._triggerLabel.textContent = item.option.textContent;
            this._triggerLabel.firstChild.data = item.option.textContent;
            if (item.option.dataset.icon && this._triggerIcon) {
               this._triggerIcon.src = item.option.dataset.icon;
            }
            if (!item.option.value) {
               this._trigger.classList.add(this._triggerEmptyValClass);
            } else {
               this._trigger.classList.remove(this._triggerEmptyValClass);
            }
         } else {
            item.optionBtn.removeAttribute('data-selected');
         }
      });
   }
   get value() {
      return this._select.value;
   }
   set value(newValue) {
      this._select.value = newValue;
      this.syncSelectedOptions();
   }
}

export { CustomSelect }