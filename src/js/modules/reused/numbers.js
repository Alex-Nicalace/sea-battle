const randomInteger = (min, max) => {
   // получить случайное число от (min-0.5) до (max+0.5)
   const rand = min - 0.5 + Math.random() * (max - min + 1);
   return Math.round(rand);
}

function randomFloat(min, max) {
   return min + Math.random() * (max - min);
}

function numberWithSpaces(x) {
   return x.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export { randomInteger, randomFloat, numberWithSpaces }