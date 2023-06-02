import PlayArea from './PlayArea.js';

const playComp = new PlayArea;
playComp.createPlayArea();
playComp.createShips();
playComp.assignHtml('#comp tbody tr td');
playComp.printPlayArea();

const playUser = new PlayArea;
playUser.createPlayArea();
playUser.assignHtml('#user [data-square] [data-cell]');
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
console.log(playUser);
// playUser.createShips();
// playUser.assignHtml('#user tbody tr td');
// playUser.printPlayArea();

// todo: признак завершения расстановки кораблей
// подсветка тулбара только когда в движении и на поле
// реализовать мой выстрел/ выстрел компа