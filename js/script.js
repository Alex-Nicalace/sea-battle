import PlayArea from './PlayArea.js';
import LogicComp from './LogicComp.js';
// import Referee from './Referee.js';


const playComp = new PlayArea();
playComp.createShips();
playComp.finalisePlacementShips();
playComp.assignHtml({
   containerCellSelector: '#comp tbody',
   cellSelector: '#comp tbody tr td',
   nameAttrShot: 'data-shot',
   nameAttrShotDied: 'data-shot-died',
   nameAttrShotTarget: 'data-shot-target',
}
);
playComp.printPlayArea();
// playComp.makeShootable();
console.log('playComp', playComp);

const playUser = new PlayArea();
playUser.assignHtml({
   containerCellSelector: '#user [data-square]',
   cellSelector: '#user [data-square] [data-cell]',
   nameAttrShot: 'data-shot',
   nameAttrShotDied: 'data-shot-died',
   nameAttrShotTarget: 'data-shot-target',
});
playUser.setShips({
   dockSelector: '#user [data-dock]',
   shipSelector: '#user [data-ship]',
   toolbarSelector: '#user [data-toolbar]',
   rotateBtnSelector: '#user [data-rotate]',
   nameAttrVertical: 'data-vertical',
   nameAttrCanDrop: 'data-can-drop',
   nameAttrDrag: 'data-drag',
});
playUser.makeDragableShips();

console.log('playUser', playUser);

const logicComp = new LogicComp();

// const referee = new Referee(playUser, logicComp);

class Referee {
   /**
    * 
    * @param {PlayArea} playUser 
    * @param {LogicComp} logicComp 
    */
   constructor(playUser, playComp, logicComp) {
      this.playUser = playUser;
      this.logicComp = logicComp;
      this.playComp = playComp;

      this.shotComp();
   }
   async shotUser() {
      const coord = await this.playComp.makeShot();
      const answer = this.playComp.takeShot(coord);
      if (answer === 'Miss') {
         this.shotComp()
      } else {
         this.shotUser()
      }

   }
   async shotComp() {
      const coord = await this.logicComp.makeShot();
      const answer = this.playUser.takeShot(coord);
      this.logicComp.getAnswer(answer);
      if (answer === 'Miss') {
         this.shotUser()
      } else {
         this.shotComp()
      }
   }
}



document.querySelector('#btn-auto-place').addEventListener('click', () => {
   playUser.locateShips();
   playUser.printPlayArea();
});
document.querySelector('#btn-ready').addEventListener('click', () => {
   const { message } = playUser.finalisePlacementShips();
   console.log(message);
});
document.querySelector('#btn-comp-shot').addEventListener('click', () => {
   const coordShot = logicComp.makeShot();
   const answer = playUser.takeShot(coordShot);
   logicComp.getAnswer(answer);
});
document.querySelector('#btn-print').addEventListener('click', () => {
   console.log(logicComp.area);
   console.log(playUser.area);
});
document.querySelector('#btn-start').addEventListener('click', () => {
   new Referee(playUser, playComp, logicComp);
});


// console.log(playUser);
// playUser.createShips();
// playUser.assignHtml('#user tbody tr td');
// playUser.printPlayArea();

// todo:

// подсветка тулбара только когда в движении и на поле