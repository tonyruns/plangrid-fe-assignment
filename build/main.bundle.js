/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
  var httpRequest = void 0;
  var calendarMap = {};
  var today = new Date();
  var currentMonthDate = new Date(today.getFullYear(), today.getMonth());
  var currentMonth = currentMonthDate.getMonth();
  var currentYear = currentMonthDate.getFullYear();
  var titleNode = document.getElementById("title");

  var monthToEnglish = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  document.getElementById("nextMonth").addEventListener('click', function () {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }

    updateCalendar();
    getCalendarEvents();
  });

  document.getElementById("prevMonth").addEventListener('click', function () {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }

    updateCalendar();
    getCalendarEvents();
  });

  document.getElementById("today").addEventListener('click', function () {
    currentMonthDate = new Date(today.getFullYear(), today.getMonth());
    currentMonth = currentMonthDate.getMonth();
    currentYear = currentMonthDate.getFullYear();
    updateCalendar();
    getCalendarEvents();
  });

  var getCalendarEvents = function getCalendarEvents() {
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleResponse;
    var curMonth = ('' + (currentMonth + 1)).padStart(2, '0');
    httpRequest.open('GET', 'https://launchlibrary.net/1.2/launch/' + currentYear + '-' + curMonth + '-01/' + currentYear + '-' + curMonth + '-31');
    httpRequest.send();
  };

  var handleResponse = function handleResponse() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        var response = JSON.parse(httpRequest.responseText);
        var launches = response.launches;

        updateLaunchEvents(launches);
      } else {
        console.log('error in request');
      }
    }
  };

  var updateLaunchEvents = function updateLaunchEvents(launches) {
    launches.sort(function (a, b) {
      return a.wsstamp - b.wsstamp;
    });
    launches.forEach(function (launch) {
      var isostart = launch.isostart,
          startTS = launch.wsstamp,
          endTS = launch.westamp,
          name = launch.name;

      var startKey = isostart.split('T')[0];

      if (calendarMap[startKey]) {
        var event = createCalendarEvent(startTS, endTS, name);
        calendarMap[startKey].appendChild(event);
      }
    });
  };

  var updateCalendar = function updateCalendar() {
    clearCalender();

    titleNode.innerText = monthToEnglish[currentMonth] + ' - ' + currentYear;

    var totalDays = getDaysInMonth(currentMonth, currentYear);

    var week = 0;
    var tempDate = new Date(currentYear, currentMonth);
    var day = tempDate.getDay();
    var dayNodes = document.querySelector('#week' + week).children;
    calendarMap = {};

    // fill in previous month of calendar
    var prevMonth = currentMonth - 1 < 0 ? 11 : currentMonth - 1;
    var prevYear = currentMonth - 1 < 0 ? currentYear - 1 : currentYear;
    var prevTotalDays = getDaysInMonth(prevMonth, prevYear);
    for (var i = day - 1; i >= 0; i--) {
      dayNodes[i].appendChild(createCalendarOutDate(prevTotalDays));
      prevTotalDays--;
    }

    // fill in dates for current month and populate map
    for (var _i = 0; _i < totalDays; _i++) {
      var key = currentYear + ('' + (currentMonth + 1)).padStart(2, '0') + ('' + (_i + 1)).padStart(2, '0');
      calendarMap[key] = dayNodes[day];
      calendarMap[key].appendChild(createCalendarDate(_i + 1));

      day++;
      if (day % 7 === 0) {
        day = 0;
        week++;
        dayNodes = document.querySelector('#week' + week).children;
      }
    }

    // fill in dates for next month of calendar
    for (var _i2 = 1;; _i2++) {
      dayNodes[day].appendChild(createCalendarOutDate(_i2));

      day++;
      if (day % 7 === 0) {
        day = 0;
        week++;
        if (week == 6) {
          break;
        }
        dayNodes = document.querySelector('#week' + week).children;
      }
    }
  };

  var isLeapYear = function isLeapYear(year) {
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

  var createCalendarDate = function createCalendarDate(number) {
    var node = document.createElement('div');
    node.innerText = number;
    node.className = 'calendar-date';

    return node;
  };

  var createCalendarOutDate = function createCalendarOutDate(number) {
    var node = document.createElement('div');
    node.innerText = number;
    node.className = 'calendar-outdate';

    return node;
  };

  var createCalendarEvent = function createCalendarEvent(start, end, name) {
    var node = document.createElement('div');
    var startDate = new Date(start);
    var startTime = startDate.toLocaleTimeString();
    node.innerText = startTime + " - " + name;
    node.className = 'calendar-event';

    return node;
  };

  var clearCalender = function clearCalender() {
    for (var i = 0; i < 6; i++) {
      var dayNodes = document.querySelector('#week' + i).children;
      for (var j = 0; j < dayNodes.length; j++) {
        while (dayNodes[j].firstChild) {
          dayNodes[j].removeChild(dayNodes[j].firstChild);
        }
      }
    }
  };

  var getDaysInMonth = function getDaysInMonth(month, year) {
    var totalDays = 31;
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
  };

  updateCalendar();
  getCalendarEvents();
})();

/***/ })
/******/ ]);
//# sourceMappingURL=main.bundle.js.map