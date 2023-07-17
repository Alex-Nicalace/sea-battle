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
    * @param {Object} [param={}]
    * @param {import('./playArea.js').default} [param.playUser] Объект игрового поля пользователя
    * @param {import('./playArea.js').default} [param.playComp] Объект игрового поля ПК
    * @param {import('./logicComp.js').default} [param.logicComp] Объект логики ПК
    * @param {Object} [param.statistics] настроки отображения статистики выстрелов и убитых кораблей
    * @param {string} [param.statistics.quantityShots] Селектор элемента куда будет отображаться статистика выстрелов
    * @param {string} [param.statistics.listShips] Селектор контейнера кораблей где будут перечеркиваться убитые корабли
    * @param {string} [param.statistics.classNameDeadShip] Название класса убитого корабля в отображении статистики
    * @param {Object} [param.components] селекотры компонентов игрового процесса
    * @param {string} [param.statistics.cell] Селектор ячейки 
    * @param {string} [param.components.btnRnd] Селектор триггера автом. расстановки кораблей
    * @param {string} [param.components.btnReadyToGame] Селектор триггера начала игры
    * @param {string} [param.components.containerPlayers] селектор контенера игровых полей
    * @param {string} [param.components.playerHuman] селектор игрового поля пользователя 
    * @param {string} [param.components.playerPc] селектор игрового поля ПК  
    * @param {string} [param.components.containerDock] селектор контенера дока кораблей и кнопок
    * @param {string} [param.components.nameClassEmtyDock] название класса - пустой док
    * @param {string} [param.components.nameClassShooting] название класса - чей ход-выстрел
    */
   constructor({
      playUser,
      playComp,
      logicComp,
      statistics: {
         quantityShots,
         listShips,
         classNameDeadShip,
      },
      components: {
         cell,
         btnRnd,
         btnReadyToGame,
         containerPlayers,
         playerHuman,
         playerPc,
         containerDock,
         nameClassEmtyDock,
         nameClassShooting,
      }
   }) {
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
      /**
       * количество mc
       * @type {number}
       */
      this.delay = 0;
      /**
       * @type {number} Количество выстрелов, сделанное ПК
       */
      this.quantityShotsPC = 0;
      /**
       * @type {number} Количество выстрелов, сделанное пользователем
       */
      this.quantityShotsHuman = 0;
      /**
       * элемент, содержащий игровые поля
       * @type {HTMLElement}
       */
      this.containerPlayersEl = document.querySelector(containerPlayers);
      /**
       * элемент игрового поля пользователя
       * @type {HTMLElement}
       */
      this.playerHumanEl = this.containerPlayersEl.querySelector(playerHuman);
      /**
       * элемент игрового поля ПК
       * @type {HTMLElement}
       */
      this.playerPcEl = this.containerPlayersEl.querySelector(playerPc);
      /**
       * элемент куда будет отображаться статистика выстрелов ПК
       * @type {HTMLElement} 
       */
      this.quantityShotsPcEl = this.playerHumanEl.querySelector(quantityShots);
      /**
       * контейнер кораблей где будут перечеркиваться убитые корабли ПК
       * @type {HTMLElement}
       */
      this.listShipsPcEl = this.playerHumanEl.querySelector(listShips);
      /**
       * элемент куда будет отображаться статистика выстрелов пользователя
       * @type {HTMLElement} 
       */
      this.quantityShotsHumanEl = this.playerPcEl.querySelector(quantityShots);
      /**
       * контейнер кораблей где будут перечеркиваться убитые корабли пользователя
       * @type {HTMLElement}
       */
      this.listShipsHumanEl = this.playerPcEl.querySelector(listShips);
      /**
       * Название класса убитого корабля в отображении статистики убитых кораблей
       * @type {string}
       */
      this.classNameDeadShip = classNameDeadShip;
      /**
       * елемент-контенер дока кораблей и кнопок
       * @type {HTMLElement}
       */
      this.containerDockEl = this.containerPlayersEl.querySelector(containerDock);
      /**
       * название класса - чей ход-выстрел
       * @type {string}
       */
      this.nameClassShooting = nameClassShooting

      /**
       * @type {HTMLElement}
       */
      const cellElement = document.querySelector(cell);
      if (cellElement) {
         const animDurationStr = getComputedStyle(cellElement).animationDuration;
         // задержка м/у выстрелами исходя из продолжительности анимации Х на коэфициент подходящий
         this.delay = animDurationStr.replace(/(\d+)(s|ms)/gi, (m, p1, p2) => {
            return +p1 * (p2.toLowerCase() === 's' ? 1000 : 1);
         }).split(',').reduce((sum, num) => sum += +num, 0) * 1.5;
      }



      document.querySelector(btnRnd).addEventListener('click', () => {
         this.autoLocateShips();
      });

      document.querySelector(btnReadyToGame).addEventListener('click', () => {
         this.beginGame();
      });

      const toggleVisibleBtnReady = (e) => {
         if (!e.target.closest(playerHuman)) return
         this.containerDockEl.classList.toggle(nameClassEmtyDock);
      }
      this.containerPlayersEl?.addEventListener('playarea', toggleVisibleBtnReady);
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
      this.playerPcEl.classList.add(this.nameClassShooting);
      const coord = await this.playComp.makeShot();
      const { shotResult: answer, sizeShip } = this.playComp.takeShot(coord);
      if (answer === 'Miss') {
         this.playerPcEl.classList.remove(this.nameClassShooting);
         this.currentShot = this.shotComp;
      }
      this.updateQuantityShots(this.quantityShotsHumanEl, ++this.quantityShotsHuman);
      this.updateDeadShips(this.listShipsHumanEl, sizeShip);
      return answer
   }
   /**
    * Выстрел ПК
    * @returns {ShotResult}
    */
   async shotComp() {
      this.playerHumanEl.classList.add(this.nameClassShooting);
      const coord = await this.logicComp.makeShot(this.delay);
      const { shotResult: answer, sizeShip } = this.playUser.takeShot(coord);
      this.logicComp.getAnswer(answer);
      if (answer === 'Miss') {
         this.playerHumanEl.classList.remove(this.nameClassShooting);
         this.currentShot = this.shotUser;
      }
      this.updateQuantityShots(this.quantityShotsPcEl, ++this.quantityShotsPC);
      this.updateDeadShips(this.listShipsPcEl, sizeShip);
      return answer;
   }
   /**
    * 
    * @param {HTMLElement} element Контейнер кораблей по которым видно статистику
    * @param {number} sizeShip Размер корабля
    */
   updateDeadShips(element, sizeShip) {
      if (!element || !sizeShip || typeof sizeShip !== 'number') return;
      /**
       * @type {HTMLElement}
       */
      const shipEl = ([...element?.children[sizeShip - 1]?.children] || []).find(elem => !elem.classList.contains(this.classNameDeadShip));
      shipEl.innerHTML = `
         <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" hidden>
            <path d="M0,0 L100,100" vector-effect="non-scaling-stroke" stroke="red"
               stroke-width="2" fill="none" />
            <path d="M0,100 L100,0" vector-effect="non-scaling-stroke" stroke="red"
               stroke-width="2" fill="none" />
         </svg>      
      `;
      shipEl.classList.add(this.classNameDeadShip);
   }
   /**
    * @param {HTMLElement} element элемент куда будет отображаться статистика выстрелов
    * @param {number} quantity элемент куда будет отображаться статистика выстрелов
    */
   updateQuantityShots(element, quantity) {
      if (!element) return;
      element.innerHTML = quantity;
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
         case 'human':
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
      /**
       * @type {import('./playArea.js').ShotResult}
       */
      let answer;
      do {
         answer = await this.currentShot.call(this);
      } while (answer !== 'Victory');
      this.playComp.showShipsOnArea();
      const message = this.currentShot === this.shotUser ? 'Вы победитель!!!' : 'Вы проиграли ...';
      // показать результат с задержкой по анимации выстрела
      setTimeout(() => this.showDialog(message), this.delay);
      ;
   }
   /**
    * Показать диалоговое окно с укаазанным сообщением
    * @param {string} message сообщение
    */
   showDialog(message) {
      /**
       * @type {HTMLDialogElement}
       */
      const modalWinnerEl = document.querySelector('#modal-message');
      Modal.showModal(modalWinnerEl, {
         content: {
            bodyContetnt: message,
         }
      });
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
      const { done, message } = this.playUser.finalisePlacementShips();
      if (!done) {
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
       * @type {HTMLDialogElement}
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