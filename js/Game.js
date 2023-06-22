import { randomInteger } from './numbers.js';
class Game {
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
   currentShot;
   async shotUser() {
      const coord = await this.playComp.makeShot();
      const answer = this.playComp.takeShot(coord);
      if (answer === 'Miss') {
         this.currentShot = this.shotComp;
      }
      return answer
   }
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
    * @returns 
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