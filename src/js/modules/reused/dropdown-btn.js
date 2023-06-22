/* 
должна быть такая структура создана
<div class="dropdown-btn" data-label="label" data-selector-label=".toolbar-block__label">
   <button type="button" class="dropdown-btn__trigger">
      <span class="dropdown-btn__label">label</span>
   </button>    
   <div class="dropdown-btn__content">
      <a>123</a>
      <a>123<a>
   </div>
</div>

или она создастся автоматом. если в верстке изначально
<div class="dropdown-btn" data-label="label" data-selector-label=".toolbar-block__label">
   <a>123</a>
   <a>123</a>
</div>


data-completed - наличие атрибуту означает что процесс инициализации прошел
data-selector-label=".toolbar-block__label" - указанные элементы будут себя вести подобно label т.е. при клике переводить фокус
....

не знаю по идее надо отказаться от атомат. верст ибо какой толк ....
 */
class DropdownBtn {
   constructor(dropdownEl, {
      // когда кнопка создается атоматом, то в спан вставится верстка из этого атрибута
      markerHTML,
      // cb который должен открыть список
      cbOpen = function (obj) {
         const heightContent = `${obj._content.scrollHeight}px`;
         obj._content.style.height = heightContent;
      },
      // cb который должен закрыть список
      cbClose = function (obj) {
         obj._content.style.height = '';
      }
   } = {}) {
      // data-completed => уже отрабатывался этот элемент
      // если внутри блока не будут находится ожидаемые элементы буду 
      // их создавать
      if (dropdownEl.hasAttribute('data-completed') || dropdownEl.tagName === 'SELECT') return;
      this._blockSelector = 'dropdown-btn';
      this._blockModifier = `${this._blockSelector}_open`;
      this._triggerClass = `${this._blockSelector}__trigger`;

      this._isOpen = false;
      this._dropdown = dropdownEl;
      // this._dropdown.classList.add(this._blockSelector);

      this._content = this._dropdown.querySelector(`.${this._blockSelector}__content`);
      if (!this._content) {
         this._content = document.createElement('div');
         Array.from(this._dropdown.children).forEach(element => {
            this._content.append(element);
         });
         this._content.classList.add(`${this._blockSelector}__content`);
         this._dropdown.append(this._content);
      }

      this._trigger = this._dropdown.querySelector(`.${this._triggerClass}`);
      if (!this._trigger) {
         this._trigger = document.createElement('button');
         this._trigger.type = 'button';
         this._trigger.classList.add(`${this._blockSelector}__trigger`);
         this._dropdown.prepend(this._trigger);

         this._triggerLabel = document.createElement('span');
         this._triggerLabel.classList.add(`${this._blockSelector}__label`);
         this._triggerLabel.innerHTML = markerHTML;
         this._trigger.append(this._triggerLabel);
         this._triggerLabel.firstChild.data = this._dropdown.dataset.label;
      }

      const clickButton = () => {
         !this._isOpen
            ? this.open()
            : this.close();
      }

      this._trigger.addEventListener('click', clickButton);

      this._dropdown.setAttribute('data-completed', '');

      this._cbOpen = cbOpen;
      this._cbClose = cbClose;

      this._labelPseudoItems = [...document.querySelectorAll(this._dropdown.dataset.selectorLabel)];
      this._labelPseudoItems.forEach(element => {
         element.style.cursor = 'default'
         element.addEventListener('click', () => {
            this._trigger.focus();
         })
      });
   }


   _clickDocument(e) {
      const target = e.target;
      if (!target || !this._isOpen) return;
      if (!this._dropdown.contains(target)) this.close();
   }
   open() {
      this._setPositionDropdown();
      this._dropdown.classList.add(this._blockModifier);

      if (typeof (this._cbOpen) == 'function')
         this._cbOpen(this);

      this._dropdown.style.zIndex = 45;

      this._mouseLeaveBind = this._mouseLeave.bind(this);

      this._dropdown.addEventListener('mouseleave', this._mouseLeaveBind);
      document.addEventListener('click', this._clickDocument);

      this._isOpen = true;

      const event = new CustomEvent('dropdown-open', { bubbles: true });
      this._content.dispatchEvent(event);

   }
   _mouseLeave() {
      this.close();
   }
   _resetStyleDropDown() {
      this._content.style.left = 'auto';
      this._content.style.right = 'auto';
      this._content.style.top = '';
      this._dropdown.classList.remove(`${this._blockSelector}_up`);
      this._dropdown.style.zIndex = '';
   }
   close() {
      this._dropdown.classList.remove(this._blockModifier);

      if (typeof (this._cbClose) == 'function')
         this._cbClose(this);

      this._dropdown.removeEventListener('mouseleave', this._mouseLeaveBind)
      document.removeEventListener('click', this._clickDocument);

      this._isOpen = false;

      setTimeout(() => {
         this._resetStyleDropDown();
      }, 300)

      const event = new CustomEvent('dropdown-close', { bubbles: true });
      this._content.dispatchEvent(event);
   }
   _setPositionDropdown() {
      this._resetStyleDropDown();

      const minWidthDropdown = this._dropdown.dataset.minWidth
         ? `${this._dropdown.dataset.minWidth}px`
         : '100%';
      this._content.style.minWidth = minWidthDropdown;

      const btnBox = this._trigger.getBoundingClientRect();
      const clientWidth = document.documentElement.clientWidth;
      const clientHeight = document.documentElement.clientHeight;
      const heightDropdown = this._content.scrollHeight;
      const widthDropdown = this._content.scrollWidth;
      const prop = (btnBox.left + widthDropdown) > clientWidth
         ? 'right'
         : 'left';
      this._content.style[prop] = '0';
      if (btnBox.bottom + heightDropdown > clientHeight) {
         this._content.style.top = -heightDropdown + 'px';
         this._dropdown.classList.add(`${this._blockSelector}_up`);
      }

   }
   get isOpen() {
      return this._isOpen;
   }
   set isOpen(open) {
      if (open) {
         this.open();
      } else {
         this.close();
      }
   }
}

export { DropdownBtn }