/* задаче при ховере на элементе делать ховер и на предыдущем элементе */
const setClassPrevElement = (triggerSelector, className) => {
   const triggers = document.querySelectorAll(triggerSelector);
   triggers.forEach(element => {
      element.addEventListener('mouseenter', () => {
         const prevElement = element.previousElementSibling;
         if (!prevElement) return;
         prevElement.classList.add(className);
         element.addEventListener('mouseleave', onmouseleave);
         function onmouseleave() {
            prevElement.classList.remove(className);
            element.removeEventListener('mouseleave', onmouseleave)
         }
      })
   });
}
export default setClassPrevElement;