const randomInteger = (min, max) => {
   // получить случайное число от (min-0.5) до (max+0.5)
   const rand = min - 0.5 + Math.random() * (max - min + 1);
   return Math.round(rand);
}

function randomFloat(min, max) {
   return min + Math.random() * (max - min);
}

function numberFormat(x, separator = ' ') {
   return x.toString().replace(/[^-0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export { randomInteger, randomFloat, numberFormat }