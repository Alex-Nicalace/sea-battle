import { randomInteger } from './numbers.js';

const genId = () => {
   let id = 0;
   do {
      id = randomInteger(1, 1000);
   } while (document.getElementById(id));
   return id;
}

const bindInputLabel = () => {
   const labels = document.querySelectorAll('input+label:not([for])');
   labels.forEach(label => {
      const input = label.previousElementSibling;
      const id = input.id || genId();
      input.id = id;
      label.setAttribute('for', id);
   });
}

export { genId, bindInputLabel };