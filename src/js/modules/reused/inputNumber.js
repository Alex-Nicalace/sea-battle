/* 
isBtnFocus - будут ли кнопки приращивания фокусируемыми
 */
class InputNumber {
   constructor(el, { isBtnFocus = false } = {}) {
      if (!el) return;
      const nameClassBlock = 'number';
      this._nameClassBlock = nameClassBlock;

      this._input = el;

      this._isBtnFocus = isBtnFocus;

      this._wrapper = document.createElement('div');
      this._wrapper.className = this._input.className;
      // this.wrapper.classList.add = nameClassBlock;

      this._input.after(this._wrapper);
      this._input.className = `${nameClassBlock}__input`;

      this._buttonDown = document.createElement('button');
      this._buttonDown.type = 'button';
      this._buttonDown.classList.add(`${nameClassBlock}__down`);

      this._buttonUp = document.createElement('button');
      this._buttonUp.type = 'button';
      this._buttonUp.classList.add(`${nameClassBlock}__up`);

      if (!this._isBtnFocus) {
         this._buttonDown.tabIndex = this._buttonUp.tabIndex = -1;
      }

      this._wrapper.append(this._buttonDown);
      this._wrapper.append(this._input);
      this._wrapper.append(this._buttonUp);

      this._step = +this._input.step;
      this._min = +this._input.min;
      this._max = +this._input.max;

      this._input.addEventListener('input', () => {
         if (this._max && this._input.value > this._max) {
            this._input.value = this._max;
         }

         if (this._min && this._input.value < this._min) {
            this._input.value = this._min;
         }
      })

      this._buttonDown.addEventListener('click', () => this.dec())
      this._buttonUp.addEventListener('click', () => this.inc())
      this._wrapper.addEventListener('focusin', e => this.onFocusinWrapper(e));
   }
   get value() {
      return +this._input.value;
   }
   set value(newValue) {
      if ((this._min && newValue < this._min) || (this._max && newValue > this._max)) return;
      this._input.value = newValue;
   }
   onFocusinWrapper(e) {
      this._wrapper.classList.add(`${this._nameClassBlock}_focused`);
      const onFocusout = () => {
         this._wrapper.classList.remove(`${this._nameClassBlock}_focused`);
         this._wrapper.removeEventListener('focusout', onFocusout);
      };
      this._wrapper.addEventListener('focusout', onFocusout);
   }
   inc() {
      const newValue = +this._input.value + this._step;
      if (this._max && (newValue <= this._max)) {
         this._input.value = newValue;
      }
   }
   dec() {
      const newValue = +this._input.value - this._step;
      if (this._min && (newValue >= this._min)) {
         this._input.value = newValue;
      }
   }
}

export default InputNumber;