import { randomInteger } from './reused/numbers.js';
import { GridError } from './error.js';

/**
 * Объект, представляющий координату в массиве
 * @typedef {Object} Coord
 * @property {number} i - строка массива.
 * @property {number} k - столбец массива.
 * @property {boolean} isShooted - был ли выстрел по этой ячейке.
 */

/**
 * @typedef {Object} DataShip Координаты корабля
 * @property {Coord[]} DataShip.track Rоординаты непосредственно корабля.
 * @property {Coord[]} DataShip.aroundTrack Координаты примыкающих к кораблю ячеек.
 */

/**
 * ячейка игрового поля
 * @typedef {Object} AreaItem
 * @property {number | string} cell - значение ячейки в массиве
 * @property {HTMLElement} cellHtml - узел HTML соответсвующий ячейке массива
 * @property {DataShip} dataShip
 * @property {boolean} isShooted - был ли выстрел по этой ячейке.
 */

/**
 * @typedef {Array<Array<AreaItem>>} AreaType
 */

/**
 * @typedef {'up' | 'left' | 'down' | 'right'} Direct
 */

/**
 * Класс, представляющий объект сетки 10 * 10
 * @class
 */
class Area {
   constructor() {
      this.createPlayArea();
      this.totalShips = Object.values(this.schemeShips).reduce((total, num) => total + num, 0);
   }
   /**
    * @type {number} общее количество кораблей
    */
   totalShips = 0;
   /**
    * Объект настроек колличества кораблей
    * @type {Object.<number, number>}
    * @property {number} key - размер корабля
    * @property {number} value - количество кораблей
    */
   schemeShips = {
      1: 4,
      2: 3,
      3: 2,
      4: 1,
      // символьный метод, возвращающий итератор
      [Symbol.iterator]() {
         const entries = Object.entries(this);
         // метод должен вернуть объект с методом next() 
         return {
            currentI: 0,
            lastI: entries.length,
            currentK: 0,
            entries,
            // в этом методе реализуется логика итерации
            next() {
               if (this.currentI < this.lastI) {
                  const [sizeShip, quantity] = this.entries[this.currentI];
                  if (++this.currentK > quantity) {
                     this.currentI++;
                     this.currentK = 0;
                     return this.next();
                  }
                  return {
                     done: false,
                     value: sizeShip,
                  }
               } else
                  return { done: true }
            }
         }
      }
   }
   /**
    * Поле, представляющее двумерный массив объектов.
    * @type {AreaType}
    */
   area = Array(10);
   /**
    * Поле содержит значение, кот. должно обозначать пустую ячейку
    */
   emptyCell = null;
   /**
    * Поле содержит значение, которое обозначает, что ячейка занята.
    */
   markCell = '.';
   /**
    * создает игоровое поле, 2-мерный массив
    */
   createPlayArea() {
      this.area = Array(10);
      for (let i = 0; i < this.area.length; i++) {
         this.area[i] = Array(this.area.length)
         for (let k = 0; k < this.area[i].length; k++) {
            this.area[i][k] = { cell: this.emptyCell, cellHtml: null };
         }
      }
   }
   /**
    * печатает значения 2-мерного массива в сопоставленные HTML-узлы
    */
   printPlayArea() {
      /* let row = '';
      for (let i = 0; i < this.area.length; i++) {
         for (let k = 0; k < this.area.length; k++) {
            row += this.area[i][k].cell;
         }
         row += '\n';
      }
      console.log(row);
      console.table(this.area); */
      if (!this.cellsHtml) return;
      for (const item of this.cellsHtml) {
         const { i, k } = item[1];
         if (typeof this.area[i][k].cell === 'number') {
            this.area[i][k].cellHtml.innerHTML = this.area[i][k].cell;
            continue
         }
         this.area[i][k].cellHtml.innerHTML = '';
      }
   }
   /**
    * полчение случайной пустой координаты
    * @returns {Coord} координата ячейки
    */
   getRandomEmptyPoint() {
      let i, k;
      const maxIteration = this.area.length ** 2;
      const setPoints = new Set();
      do {
         i = Math.abs(randomInteger(0, 9));
         k = Math.abs(randomInteger(0, 9));
         if (setPoints.add(`${i}:${k}`).size >= maxIteration) throw new GridError('Error searching for a free cell. All cells are occupied!');
      } while (this.area[i][k].cell != this.emptyCell);
      return { i, k };
   }
   /**
    * случайно получить направление для размещения корабля
    * @param {Array<Direct>} excludeArr массив исключенных направлений
    * @returns {Direct | null}
    */
   getRandomDirect(excludeArr = []) {
      /**
       * @type {Direct[]}
       */
      const directArr = ['up', 'left', 'down', 'right'];
      const isAllOptionsExcluded = directArr.every(val => excludeArr.includes(val));
      if (isAllOptionsExcluded) return null;
      let num;
      do {
         num = Math.abs(randomInteger(0, 3));
      } while (excludeArr.indexOf(directArr[num]) > -1);
      return directArr[num];
   }
   /**
      * Размещение корабля по заданным координатам
      * @param {Coord[]} track массив координат корабля
      * @returns {String} ключ корабля в объекте shipsOnArea
      */
   buildShip(track = []) {
      const aroundTrack = [];
      const sizeShip = track.length;
      const setBorder = (i, k) => {
         const iMin = Math.max(i - 1, 0);
         const iMax = Math.min(i + 1, 9);
         const kMin = Math.max(k - 1, 0);
         const kMax = Math.min(k + 1, 9);
         for (let ii = iMin; ii <= iMax; ii++) {
            for (let kk = kMin; kk <= kMax; kk++) {
               if (/* this.area[ii][kk].cell !== this.emptyCell || */ track.find(({ i, k }) => ii === i && kk === k)) continue;
               this.area[ii][kk].cell = this.markCell;
               // res.push({ i: ii, k: kk })
               aroundTrack.push({ i: ii, k: kk })
            }
         }
      }
      track.forEach(coord => {
         this.area[coord.i][coord.k].cell = sizeShip;
         setBorder(coord.i, coord.k, sizeShip);
      });
      return aroundTrack;
   }
}

export default Area;