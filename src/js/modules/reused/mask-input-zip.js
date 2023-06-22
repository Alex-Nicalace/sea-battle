export const maskZip = (selector = 'input[data-zip-code]', delimiter = '-') => {
   const inputs = document.querySelectorAll(selector);
   for (const input of inputs) {
      input.addEventListener('input', function () {
         // Удаляем все символы, кроме цифр
         let zipCode = this.value.replace(/\D/g, '');

         // Добавляем пробел после первых 5 цифр
         if (zipCode.length > 5) {
            zipCode = zipCode.slice(0, 5) + delimiter + zipCode.slice(5, 9);
         }

         // Обновляем значение элемента input
         this.value = zipCode;
      })
   }
}