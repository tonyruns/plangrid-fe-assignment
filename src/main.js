(function() {
  let httpRequest;
  let calendarMap = {};
  let today = new Date();
  let currentMonthDate = new Date(today.getFullYear(), today.getMonth());
  let currentMonth = currentMonthDate.getMonth();
  let currentYear = currentMonthDate.getFullYear();
  const titleNode = document.getElementById("title");

  const monthToEnglish = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  

  document.getElementById("nextMonth").addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }

    updateCalendar();
    getCalendarEvents();
  });

  document.getElementById("prevMonth").addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }

    updateCalendar();
    getCalendarEvents();
  });
  
  document.getElementById("today").addEventListener('click', () => {
    currentMonthDate = new Date(today.getFullYear(), today.getMonth());
    currentMonth = currentMonthDate.getMonth();
    currentYear = currentMonthDate.getFullYear();
    updateCalendar();
    getCalendarEvents();
  });


  const getCalendarEvents = () => {
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleResponse;
    let curMonth = ('' + (currentMonth+1)).padStart(2, '0');
    httpRequest.open('GET', `https://launchlibrary.net/1.2/launch/${currentYear}-${curMonth}-01/${currentYear}-${curMonth}-31`);
    httpRequest.send();
  }

  const handleResponse = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        const response = JSON.parse(httpRequest.responseText);
        const {launches} = response;
        updateLaunchEvents(launches);
      } else {
        console.log('error in request');
      }
    }
  };

  const updateLaunchEvents = (launches) => {
    launches.sort((a, b) => a.wsstamp - b.wsstamp);
    launches.forEach(launch => {
      const {isostart, wsstamp: startTS, westamp: endTS, name} = launch;
      let startKey = isostart.split('T')[0];

      if (calendarMap[startKey]) {
        let event = createCalendarEvent(startTS, endTS, name);
        calendarMap[startKey].appendChild(event);
      }
    });
  }


  const updateCalendar = () => {
    clearCalender();

    titleNode.innerText = `${monthToEnglish[currentMonth]} - ${currentYear}`;

    let totalDays = getDaysInMonth(currentMonth, currentYear);

    let week = 0;
    let tempDate = new Date(currentYear, currentMonth);
    let day = tempDate.getDay();
    let dayNodes = document.querySelector(`#week${week}`).children;
    calendarMap = {};

    // fill in previous month of calendar
    let prevMonth = currentMonth - 1 < 0 ? 11 : currentMonth-1;
    let prevYear = currentMonth - 1 < 0 ? currentYear - 1 : currentYear;
    let prevTotalDays = getDaysInMonth(prevMonth, prevYear);
    for (let i = day-1; i >= 0; i--) {
      dayNodes[i].appendChild(createCalendarOutDate(prevTotalDays));
      prevTotalDays--;
    }

    // fill in dates for current month and populate map
    for (let i = 0; i < totalDays; i++) {
      let key = currentYear + ('' + (currentMonth+1)).padStart(2, '0') + ('' + (i+1)).padStart(2, '0');
      calendarMap[key] = dayNodes[day];
      calendarMap[key].appendChild(createCalendarDate(i+1));

      day++;
      if (day % 7 === 0) {
        day = 0;
        week++;
        dayNodes = document.querySelector(`#week${week}`).children;
      }
    }

    // fill in dates for next month of calendar
    for (let i = 1; ; i++) {
      dayNodes[day].appendChild(createCalendarOutDate(i));

      day++;
      if (day % 7 === 0) {
        day = 0;
        week++;
        if (week == 6) {
          break;
        }
        dayNodes = document.querySelector(`#week${week}`).children;
      }
    }
  };

  const isLeapYear = year => {
    if (year % 400 === 0) {
      return true;
    }

    if (year % 100 === 0) {
      return false;
    } 

    if (year % 4 === 0) {
      return true;
    }

    return false;
  };

  const createCalendarDate = (number) => {
    let node = document.createElement('div');
    node.innerText = number;
    node.className = 'calendar-date';

    return node;
  };

  const createCalendarOutDate = (number) => {
    let node = document.createElement('div');
    node.innerText = number;
    node.className = 'calendar-outdate';

    return node;
  }

  const createCalendarEvent = (start, end, name) => {
    let node = document.createElement('div');
    let startDate = new Date(start);
    let startTime = startDate.toLocaleTimeString();
    node.innerText = startTime + " - " + name;
    node.className = 'calendar-event';

    return node;
  }

  const clearCalender = () => {
    for (let i = 0; i < 6; i++) {
      let dayNodes = document.querySelector(`#week${i}`).children;
      for (let j = 0; j < dayNodes.length; j++) {
        while(dayNodes[j].firstChild) {
          dayNodes[j].removeChild(dayNodes[j].firstChild);
        }
      }
    }
  }

  const getDaysInMonth = (month, year) => {
    let totalDays = 31;
    if (month === 1) {
      if (isLeapYear(year)) {
        totalDays = 29;
      } else {
        totalDays = 28;
      }
    } else if (month === 3 || month === 5 || month === 8 || month === 10) {
      totalDays = 30;
    }

    return totalDays;
  }

  updateCalendar();
  getCalendarEvents();
})();