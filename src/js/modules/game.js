import { randomInteger } from './reused/numbers.js';
import Modal from './reused/modal.js';
/**
 * @typedef {'random' | 'user' | 'pc'} FirstShot кто первый сделает выстрел
 */
/**
 * @typedef {'Miss' | 'Hit' | 'Sunk' | 'Victory'} ShotResult результат выстрела по противнику
 */
/**
 * алгоритм игры
 * @class 
 */
class Game {
   /**
    * 
    * @param {import('./playArea.js').default} playUser Объект игрового поля пользователя
    * @param {import('./playArea.js').default} playComp Объект игрового поля ПК
    * @param {import('./logicComp.js').default} logicComp Объект логики ПК
    * @param {string} btnRndSelector 
    * @param {string} btnReadyToGameSelector 
    */
   constructor(playUser, playComp, logicComp, btnRndSelector, btnReadyToGameSelector) {
      /**
       * @type {import('./playArea.js').default}
       */
      this.playUser = playUser;
      /**
       * @type {import('./logicComp.js').default}
       */
      this.logicComp = logicComp;
      /**
       * @type {import('./playArea.js').default}
       */
      this.playComp = playComp;

      document.querySelector(btnRndSelector).addEventListener('click', () => {
         this.autoLocateShips();
      });

      document.querySelector(btnReadyToGameSelector).addEventListener('click', () => {
         this.beginGame();

      });
   }
   /**
    * Текущая функция выстрела.
    * @type {function(): Promise<string>}
    * @typedef {('shotUser' | 'shotComp')} CurrentShotType
    * @type {CurrentShotType}
    */
   currentShot;
   /**
    * Выстрел пользователя
    * @returns {ShotResult}
    */
   async shotUser() {
      const coord = await this.playComp.makeShot();
      const answer = this.playComp.takeShot(coord);
      if (answer === 'Miss') {
         this.currentShot = this.shotComp;
      }
      return answer
   }
   /**
    * Выстрел ПК
    * @returns {ShotResult}
    */
   async shotComp() {
      const coord = await this.logicComp.makeShot();
      const answer = this.playUser.takeShot(coord);
      this.logicComp.getAnswer(answer);
      if (answer === 'Miss') {
         this.currentShot = this.shotUser;
      }
      return answer;
   }
   /**
    * Запускает игру
    * @param {FirstShot} mode
    */
   async start(mode = 'random') {
      if (this.isGaming) {
         console.log('Игра уже в процессе');
         return
      };
      if (!this.playUser.isReadyPlacement) {
         console.log('Игрок не подтвердил готовность к игре');
         return
      }
      if (!this.playComp.isReadyPlacement) {
         console.log('PC не подтвердил готовность к игре');
         return
      }

      const playerHuman = document.querySelector('.sea-battle_prep');
      playerHuman.classList.remove('sea-battle_prep');

      // const players = document.querySelector('.sea-battle__players');
      // players.classList.add('sea-battle__players_gaming');

      switch (mode) {
         case 'user':
            this.currentShot = this.shotUser;
            break;
         case 'pc':
            this.currentShot = this.shotComp;
            break;
         default:
            this.currentShot = randomInteger(1, 100) % 2 ? this.shotUser : this.shotComp
            break;
      }
      this.isGaming = true;
      let answer;
      do {
         answer = await this.currentShot.call(this);
      } while (answer !== 'Victory');
      const winner = this.currentShot === this.shotUser ? 'User' : 'PC';
      alert('Winner ' + winner);
   }
   /**
    * Автоматическая расстановка кораблей пользователя
    */
   autoLocateShips() {
      this.playUser.locateShips();
      // playUser.printPlayArea();
   }
   /**
    * Начать игру
    */
   async beginGame() {
      const { message } = this.playUser.finalisePlacementShips();
      if (message) {
         console.log(message);
         return;
      }
      const answer = await this.askWhoGoesFirst();
      this.start(answer);
   }
   /**
    * Запрашивает у пользователя, кто будет делать первый выстрел в игре.
    * @returns {Promise<FirstShot>} Промис, который разрешается значением выбранной опции:
    * - 'user' - если игрок хочет делать первый выстрел.
    * - 'pc' - если компьютер должен делать первый выстрел.
    * - 'random' - если случайным образом должно определиться.
    */
   askWhoGoesFirst() {
      /**
       * @type {HTMLDivElement}
       */
      const modalEl = document.querySelector('#modal-first-shot');

      /**
       * @type {HTMLDivElement}
       */
      const buttonsContainer = document.querySelector('.first-shot');

      return new Promise((resolve) => {
         /**
          * @type {FirstShot}
          */
         let value;

         /**
          * Обработчик события клика на кнопках.
          * @param {MouseEvent} e Событие клика.
          */
         const onClick = (e) => {
            const button = e?.target.closest('button');
            if (!button) return;
            value = button.value;
         };

         buttonsContainer.addEventListener('click', onClick);

         Modal.showModal(modalEl, {
            afterModalClose: () => {
               buttonsContainer.removeEventListener('click', onClick);
               resolve(value);
            },
         });
      });
   }
}

export default Game;