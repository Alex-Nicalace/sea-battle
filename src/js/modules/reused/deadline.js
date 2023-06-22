class Deadline {
   constructor({ daysSelector, hoursSelector, minutesSelector, secondsSelector, deadline, isDemo = false } = options) {
      this.daysEl = document.querySelector(daysSelector);
      this.hoursEl = document.querySelector(hoursSelector);
      this.minutsEl = document.querySelector(minutesSelector);
      this.secondsEl = document.querySelector(secondsSelector);

      this.deadline = deadline;
      if (isDemo) {
         const currentDate = new Date();
         const currentMonth = currentDate.getMonth();
         this.deadline = currentDate.setMonth(currentMonth + 1);
      }
   }

   init() {
      if (this.daysEl || this.hoursEl || this.minutsEl || this.secondsEl) {
         this.intervalId = setInterval(this.updateClock.bind(this), 1000);
         this.updateClock();
      }
   }

   updateClock() {
      const { days, hours, minutes, seconds, timestamp } = Deadline.countdown(this.deadline);
      this.daysEl && (this.daysEl.textContent = days);
      this.hoursEl && (this.hoursEl.textContent = hours);
      this.minutsEl && (this.minutsEl.textContent = minutes);
      this.secondsEl && (this.secondsEl.textContent = seconds);
      if (timestamp <= 0) {
         this.daysEl && (this.daysEl.textContent = "00");
         this.hoursEl && (this.hoursEl.textContent = "00");
         this.minutsEl && (this.minutsEl.textContent = "00");
         this.secondsEl && (this.secondsEl.textContent = "00");

         clearInterval(this.intervalId);
      }
   }

   static countdown(deadline) {
      const currentDate = Date.now();
      const deadlineDate = new Date(deadline);
      const timestamp = deadlineDate - currentDate,
         diffSec = timestamp / 1000,
         seconds = Math.floor(diffSec % 60),
         minutes = Math.floor(diffSec / 60 % 60),
         hours = Math.floor(diffSec / 60 / 60 % 24),
         days = Math.floor(diffSec / 60 / 60 / 24)

      const addZero = (num) => {
         return num < 99 ? ('00' + num).slice(-2) : num;
      }

      return {
         timestamp,
         seconds: addZero(seconds),
         minutes: addZero(minutes),
         hours: addZero(hours),
         days: addZero(days)
      }
   }
}

export default Deadline;