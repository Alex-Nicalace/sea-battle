// коллекция функций расчёта времени.Их прямое использование называется «easeIn».
// линейная
function linear(timeFraction) {
   return timeFraction;
}
// постепенно ускоряется
function power(timeFraction, n = 2) {
   return Math.pow(timeFraction, n)
}
// дуга
function circ(timeFraction) {
   return 1 - Math.sin(Math.acos(timeFraction));
}
// выстрел из лука. словно натягивается тетева
function back(x = 1.5, timeFraction) {
   return Math.pow(timeFraction, 2) * ((x + 1) * timeFraction - x)
}
// отскоки
function bounce(timeFraction) {
   for (let a = 0, b = 1; 1; a += b, b /= 2) {
      if (timeFraction >= (7 - 4 * a) / 11) {
         return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
      }
   }
}
// эластичная
function elastic(x = 1.5, timeFraction) {
   return Math.pow(2, 10 * (timeFraction - 1)) * Math.cos(20 * Math.PI * x / 3 * timeFraction)
}

// Иногда нужно показать анимацию в обратном режиме. Преобразование функции, которое даёт такой эффект, называется «easeOut».
// принимает функцию расчёта времени и возвращает преобразованный вариант
function makeEaseOut(timing) {
   return function (timeFraction) {
      return 1 - timing(1 - timeFraction);
   }
}

// Мы можем применить эффект дважды – в начале и конце анимации.Такая трансформация называется «easeInOut».
function makeEaseInOut(timing) {
   return function (timeFraction) {
      if (timeFraction < .5)
         return timing(2 * timeFraction) / 2;
      else
         return (2 - timing(2 * (1 - timeFraction))) / 2;
   }
}

export { makeEaseOut, makeEaseInOut, linear, power, circ, back, bounce, elastic }