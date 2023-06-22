import { parceFileName } from './fileName.js';

const dnd = (selector, { dropZoneSelector, decorDropZoneClassName, infoElSelector, triggerSelector, maxLengthFileName } = {}) => {
   const fileInputs = document.querySelectorAll(selector);
   ['dragenter', 'dragleave', 'dragover', 'drop'].forEach(eventName => {
      fileInputs.forEach(finput => {
         finput.addEventListener(eventName, e => {
            // отменить стандартное поведение браузера (открытие файла)
            e.preventDefault();
            e.stopPropagation();
         }, false)
      })
   });

   fileInputs.forEach(finput => {
      const dropArea = finput.closest(dropZoneSelector);
      // подразумевается что элементы должны хаодится внутри dropeArea
      const infoElement = dropArea && dropArea.querySelector(infoElSelector);
      const triggerElement = dropArea && dropArea.querySelector(triggerSelector);

      triggerElement && triggerElement.addEventListener('click', () => finput.click());

      // событие onChange
      const onChangeInput = () => {
         if (finput.value) {
            const fullFilename = finput.files[0].name,
               { nameFile, extFile } = parceFileName(fullFilename);
            const
               dots = (maxLengthFileName && nameFile.length > maxLengthFileName)
                  ? "..."
                  : ".",
               fileName = (maxLengthFileName
                  ? nameFile.substring(0, 6)
                  : nameFile) + dots + extFile;
            if (infoElement) {
               infoElement.textContent = fileName;
               if (!infoElement.dataset.valueDefault) {
                  infoElement.dataset.valueDefault = infoElement.textContent;
               }
            }
         } else {
            if (infoElement && infoElement.dataset.valueDefault) {
               infoElement.textContent = infoElement.dataset.valueDefault;
            }
         }
      }

      // событие перетаскивания файла
      const onDragEnter = () => {
         dropArea && dropArea.classList.add(decorDropZoneClassName);

         const onEndDrag = () => {
            dropArea.classList.remove(decorDropZoneClassName);
            finput.removeEventListener('dragenter', onEndDrag, false);
            finput.removeEventListener('drop', onDrop, false);
         }
         finput.addEventListener('dragleave', onEndDrag, false);

         const onDrop = (e) => {
            finput.files = e.dataTransfer.files;
            onChangeInput();

            onEndDrag();
         }
         finput.addEventListener('drop', onDrop, false);
      }
      finput.addEventListener('dragenter', onDragEnter, false);

      finput.addEventListener('change', onChangeInput)
   });
}
export default dnd;