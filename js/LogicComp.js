/**
 * @module
 */
import Area from './Area.js';
import { LogicCompError } from './Error.js';

/**
 * Объект, представляющий координату в массиве
 * @typedef {Object} Coord
 * @property {number} i - строка массива.
 * @property {number} k - столбец массива.
 * @property {boolean} isShooted - был ли выстрел по этой ячейке.
 */

/**
 * @typedef {'Miss' | 'Hit' | 'Sunk'} ShotResult
 */

/**
 * логика ПК
 * @class
 */
class LogicComp extends Area {
   constructor() {
      super();
   }
   /**
    * @type {number} количество уничтоженных кораблей собственных
    */
   numberKillsShips = 0;
   /**
    * @type {Coord} координата последнего выстрела.
    */
   lastShot;
   /**
    * @type {Coord[]} стек последних попаданий.
    */
   lastSuccessfulHits = [];
   /**
    * сгенерить координату выстрела компьютером
    * @returns {Coord}
    */
   makeShot() {
      return new Promise(res => {
         const inc = {
            up: { incI: -1, incK: 0 },
            right: { incI: 0, incK: 1 },
            down: { incI: 1, incK: 0 },
            left: { incI: 0, incK: -1 },
         }
         switch (this.lastSuccessfulHits.length) {
            case 0:
               this.lastShot = this.getRandomEmptyPoint();
               break;
            case 1:
               {
                  const { i: prevI, k: prevK } = this.lastSuccessfulHits[0],
                     excludeDirect = [];
                  let i, k, direct;
                  do {
                     direct = this.getRandomDirect(excludeDirect);
                     if (!direct) throw new LogicCompError('Logical error of the second shot, after the first hit.', this.area, excludeDirect);
                     excludeDirect.push(direct);
                     const { incI, incK } = inc[direct];
                     i = prevI + incI;
                     k = prevK + incK;
                  } while (!(this.area[i] && this.area[i][k]) || direct && this.area[i][k].cell !== this.emptyCell)
                  this.lastShot = { i, k };
               }
               break;
            default:
               {
                  const excludeDirect = [];
                  if (this.lastSuccessfulHits.some(({ i }) => i !== this.lastSuccessfulHits[0].i)) excludeDirect.push('left', 'right');
                  if (this.lastSuccessfulHits.some(({ k }) => k !== this.lastSuccessfulHits[0].k)) excludeDirect.push('up', 'down');
                  this.lastSuccessfulHits.sort((a, b) => (a.i + a.k) - (b.i + b.k));
                  let i, k, direct;
                  do {
                     direct = this.getRandomDirect(excludeDirect);
                     if (!direct) throw new LogicCompError('Logical error after the second shot.');
                     excludeDirect.push(direct);
                     const { incI, incK } = inc[direct];
                     const idx = ['left', 'up'].includes(direct) ? 0 : this.lastSuccessfulHits.length - 1;
                     const { i: prevI, k: prevK } = this.lastSuccessfulHits[idx];
                     i = prevI + incI;
                     k = prevK + incK;
                  } while (!(this.area[i] && this.area[i][k]) || direct && this.area[i][k].cell !== this.emptyCell)
                  this.lastShot = { i, k };
               }
               break;
         }
         // this.lastShot = { i: 0, k: 0 };
         const { i, k } = this.lastShot;
         this.area[i][k].cell = this.markCell;
         this.area[i][k].isShooted = true;
         res(this.lastShot);
      })
   }
   /**
    * 
    * @param {ShotResult} answer ответ, получаемый после выстрела
    */
   getAnswer(answer) {
      if (answer === 'Miss') return;
      this.lastSuccessfulHits.push(this.lastShot);
      if (answer === 'Sunk') {
         ++this.numberKillsShips;
         this.buildShip(this.lastSuccessfulHits);
         this.lastSuccessfulHits = [];
      }
   }
}

export default LogicComp;

/* 
остановился на getAnswer
как отрабатывать ответ ????
 */