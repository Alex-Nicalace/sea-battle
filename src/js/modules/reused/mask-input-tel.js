document.querySelectorAll('input[type="tel"]').forEach(function (input) {
   // let keyCode;
   function mask(event) {
      // event.keyCode && (keyCode = event.keyCode);
      let pos = this.selectionStart;
      if (pos < 2) event.preventDefault();
      let matrix = '+7 (___) ___-__-__',
         i = 0,
         def = matrix.replace(/\D/g, ''),
         val = this.value.replace(/\D/g, ''),
         new_value = matrix.replace(/[_\d]/g, function (a) {
            const result = i < val.length ? val.charAt(i++) || def.charAt(i) : a
            return result;
         });
      // i = new_value.indexOf('_');
      // if (i != -1) {
      //    i < 5 && (i = 3);
      //    // new_value = new_value.slice(0, i); //  это условие убирает маску справа от ввода
      // }
      // const prReg = matrix.substr(0, this.value.length);
      // var pr1reg = prReg.replace(/_+/g,
      //    function (a) {
      //       return '\\d{1,' + a.length + '}'
      //    })
      // var reg = pr1reg.replace(/[+()]/g, '\\$&');
      // reg = new RegExp('^' + reg + '$');
      // if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) {
      //  это условие убирает маску справа от ввода
      this.value = new_value
      // };
      const new_pos = new_value.search(/\d(?!.*\d)/) + 1;
      this.selectionStart = new_pos;
      this.selectionEnd = new_pos;
      if (event.type == 'blur' && this.value.length < 5) this.value = ''
   }
   input.addEventListener('input', mask, false);
   input.addEventListener('focus', mask, false);
   input.addEventListener('blur', mask, false);
   input.addEventListener('keydown', mask, false);
});