/**
 * Объект для управления видимостью и прокруткой документа.
 * Необходимость возникает при отображении popup элементов.
 * @namespace
 */
export const visibilityScrollDocument = {
   /**
    * Скрывает скрол документа.
    * @function
    */
   hide() {
      const widthScroll = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.marginRight = `${widthScroll}px`;
      document.body.style.overflow = 'hidden';
   },
   /**
    * Восстанавливает видимость скрола документа.
    * @function
    */
   visible() {
      document.body.style.overflow = '';
      document.documentElement.style.marginRight = '';
   }
}