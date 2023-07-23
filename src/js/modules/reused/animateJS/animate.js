import { linear } from './transitionTimingFunction.js';

/**
 * Создает анимацию на основе переданных параметров.
 *
 * @param {Object} options - Объект с параметрами анимации.
 * @param {Function} [options.timing=linear] - Функция времени, определяющая прогресс анимации от 0 до 1.
 *                                            По умолчанию используется линейное время.
 * @param {Function} options.draw - Функция отрисовки анимации на каждом шаге.
 * @param {number} [options.duration=300] - Продолжительность анимации в миллисекундах. По умолчанию 300 мс.
 *
 * @returns {Promise<void>} Промис, который будет выполнен после завершения анимации.
 */
function animate({ timing = linear, draw, duration = 300 } = {}) {
   const start = performance.now();
   return new Promise(res => {
      /**
       * Внутренняя функция, используемая для анимации через requestAnimationFrame.
       *
       * @param {number} time - Время в миллисекундах, переданное функцией requestAnimationFrame.
       */
      function animate(time) {
         // timeFraction изменяется от 0 до 1
         let timeFraction = (time - start) / duration;
         if (timeFraction > 1) timeFraction = 1;

         // вычисление текущего состояния анимации
         const progress = timing(timeFraction);

         draw(progress); // отрисовать анимацию с текущим прогрессом

         if (timeFraction < 1) {
            requestAnimationFrame(animate);
         } else {
            res(); // выполнить промис после завершения анимации
         }
      }

      requestAnimationFrame(animate); // запустить анимацию
   });
}

export default animate;