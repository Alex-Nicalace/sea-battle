export function createIntersectionObserver(targetSelector, cb, options = {}) {
   const observer = new IntersectionObserver(cb, {
      root: null, // null - пересечение с областью видимости, либо указывается родительский элемент
      rootMargin: '0px',
      threshold: 1, // степень пересечения объекта при которой срваботает колбэк. 1 - 100%

      /* обязательные параметры для того чтобы работало свойство entry.isVisible - Свойство isVisible является 
      частью предлагаемых обновлений Intersection Observer v2, касающихся фактической видимости целевого 
      элемента для пользователя.*/
      trackVisibility: true,
      delay: 100 // minimum 100
      , ...options
   });

   const targets = document.querySelectorAll(targetSelector);
   for (const target of targets) {
      observer.observe(target);
   }
}

// new CreateIntersectionObserver('selectorOrNode', cb, {root: selectorOrNode})
export class CreateIntersectionObserver {
   constructor(selectorOrElement, cb, options = {}) {
      const { root: prevRoot } = options;
      this.observer = new IntersectionObserver(cb, {
         root: null, // null - пересечение с областью видимости, либо указывается родительский элемент
         rootMargin: '0px',
         threshold: 1, // степень пересечения объекта при которой срваботает колбэк. 1 - 100%

         /* обязательные параметры для того чтобы работало свойство entry.isVisible - Свойство isVisible является 
         частью предлагаемых обновлений Intersection Observer v2, касающихся фактической видимости целевого 
         элемента для пользователя.*/
         trackVisibility: true,
         delay: 100 // minimum 100
         , ...options
         , root: typeof (prevRoot) === 'string' ? document.querySelector(prevRoot) : prevRoot,
      });
      this.targets = [];
      if (typeof (selectorOrElement) === 'string') {
         this.targets = [...document.querySelectorAll(selectorOrElement)];
      } else if (selectorOrElement.tagName) {
         this.targets.push(selectorOrElement);
      };
   }
   observe() {
      this.targets.forEach(target => {
         this.observer.observe(target);
      });
   }
   unobserve() {
      this.targets.forEach(target => {
         this.observer.unobserve(target);
      });
   }
}

// Example callback
/*
function cb(entries, observer) {
   for (const entry of entries) {
      const target = entry.target;
      if (entry.isIntersecting) {
         console.log('show');
         // observer.unobserve(target);
      } else {
         console.log('hide');
      }
   }
};
*/

// EXAMPLE
// createIntersectionObserver('.gallery-product__video', cb, {
//    root: document.querySelector('.gallery-product__main-slider'),
// });
// createIntersectionObserver('.range-slider', cb);
// createIntersectionObserver('.advantage', cb, { rootMargin: '0px 0px', threshold: 0.5 });
// createIntersectionObserver('.subscribe', cb, { rootMargin: '0px 0px', threshold: 0.5 });