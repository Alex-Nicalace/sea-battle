import { randomInteger } from './reused/numbers.js';
class Game {
   /**
    * @typedef {'Miss' | 'Hit' | 'Sunk' | 'Victory'} ShotResult
    */
   /**
    * 
    * @param {PlayArea} playUser 
    * @param {PlayArea} playComp 
    * @param {LogicComp} logicComp 
    */
   constructor(playUser, playComp, logicComp) {
      this.playUser = playUser;
      this.logicComp = logicComp;
      this.playComp = playComp;
   }
   /**
    * Текущая функция выстрела.
    * @type {function(): Promise<string>}
    * @typedef {('shotUser' | 'shotComp')} CurrentShotType
    * @type {CurrentShotType}
    */
   currentShot;
   /**
    * функция выстрела пользователя
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
    * функция выстрела ПК
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
    * 
    * @param {'random' | 'user' | 'pc'} mode 
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

}

export default Game;