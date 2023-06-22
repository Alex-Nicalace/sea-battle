import { linear } from './transitionTimingFunction.js';

// const init = {
//    timing: linear,
//    duration: 300,
// }

function animate({ timing = linear, draw, duration = 300, afterDraw } = {}) {
   // const { timing, draw, duration } = { ...init, ...options };
   const start = performance.now();

   function _animate(time) {
      // timeFraction изменяется от 0 до 1
      let timeFraction = (time - start) / duration;
      if (timeFraction > 1) timeFraction = 1;

      // вычисление текущего состояния анимации
      const progress = timing(timeFraction);

      draw(progress); // отрисовать её

      if (timeFraction < 1) {
         requestAnimationFrame(_animate);
      } else if (typeof (afterDraw) == 'function') afterDraw();
   }

   return _animate;
}

export default animate;

/* // EXAMPLE
      this._cartCardDel.addEventListener('click', () => {

         animate({
            draw,
            timing: (timeFraction) => back(2, timeFraction),
            duration: 1000,
         });

         function draw(progress) {
            cartCard.style.transform = `translateX(${-progress * 100}%)`;
            cartCard.style.opacity = 1 - progress;
            if (progress == 1) {
               cartCard.remove();
            }
         }
      })
 */