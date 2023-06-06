import PlayArea from './PlayArea.js';

const playComp = new PlayArea;
playComp.createPlayArea();
playComp.createShips();
playComp.assignHtml('#comp tbody tr td');
playComp.printPlayArea();
playComp.makeShootable();

const playUser = new PlayArea;
playUser.createPlayArea();
// playUser.createShips();
playUser.assignHtml('#user [data-square] [data-cell]');
playUser.printPlayArea();
playUser.setShips({
   dockSelector: '#user [data-dock]',
   shipSelector: '#user [data-ship]',
   toolbarSelector: '#user [data-toolbar]',
   rotateBtnSelector: '#user [data-rotate]',
   nameAttrVertical: 'data-vertical',
   nameAttrCanDrop: 'data-can-drop',
   nameAttrDrag: 'data-drag',
});
playUser.makeDragableShips('#user [data-square]');
// playUser.arrangeShips();

document.querySelector('#btn-auto-place').addEventListener('click', () => {
   // playUser.createShips();
   // playUser.locateShips();
   playUser.finalisePlacement();
   playUser.printPlayArea();
});


// console.log(playUser);
// playUser.createShips();
// playUser.assignHtml('#user tbody tr td');
// playUser.printPlayArea();

// todo:
// подсветка тулбара только когда в движении и на поле
// реализовать мой выстрел/ выстрел компа