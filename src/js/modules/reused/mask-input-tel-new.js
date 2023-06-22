const mask = (selector, mask, isHideMask) => {
   const setCursorPosition = (pos, elem) => {
      // elem.focus();
      // закоментил т.к. логику переделать надо иначе в момент блура метод фокус и из инпута нельзя выйти

      if (elem.setSelectionRange) {
         elem.setSelectionRange(pos, pos);
      } else if (elem.createTextRange) {
         const range = elem.createTextRange();

         range.collapse(true);
         range.moveEnd('character', pos);
         range.moveStart('character', pos);
         range.select();
      }
   }

   function createMask(event) {
      // const pos = this.selectionStart;
      // if (pos < 2) event.preventDefault();

      const matrix = mask,
         def = matrix.replace(/\D/g, ''),
         val = this.value.replace(/\D/g, '');
      let i = 0;

      this.value = matrix.replace(/[_\d]/g, function (a) {
         return i < val.length ? val.charAt(i++) || def.charAt(i) : a
      });

      if (isHideMask) {
         const i = this.value.indexOf('_');
         if (i > 0) {
            this.value = this.value.slice(0, i)
         }
      }

      /* рег. выраж. негативная опережающая проверка: 
      найти число за которым не следует любое количесво символов, а после этих символов цифра */
      const newPos = this.value.search(/\d(?!.*\d)/) + 1;

      setCursorPosition(newPos, this)

      if (event.type === 'blur') {
         if (val.length == def.length) {
            this.value = '';
         }
      }
   }

   const inputs = document.querySelectorAll(selector);
   inputs.forEach(input => {
      input.addEventListener('input', createMask, false);
      input.addEventListener('focus', createMask, false);
      input.addEventListener('blur', createMask, false);
      // для возможности отмены добавляю keydown
      input.addEventListener('keydown', createMask, false);
   });
}

export { mask };