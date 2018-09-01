(function () {
    'use strict';
    angular.module('angularjs-events-calender', ['ngTouch']);
    var getTimezoneOffset = function (date) {
        (typeof date == 'string') && (date = new Date(date));
        var jan = new Date(date.getFullYear(), 0, 1);
        var jul = new Date(date.getFullYear(), 6, 1);
        var stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        var isDST = date.getTimezoneOffset() < stdTimezoneOffset;
        var offset = isDST ? stdTimezoneOffset - 60 : stdTimezoneOffset;
        var diff = offset >= 0 ? '-' : '+';
        return diff +
            ("0" + (offset / 60)).slice(-2) + ':' +
            ("0" + (offset % 60)).slice(-2);
    };
    var CalenderPicker = function ($compile, $document, $controller) {
        var calenderPickerCtrl = $controller('CalenderPickerCtrl'); //directive controller
        return {
            open: function (options) {
                calenderPickerCtrl.openDatetimePicker(options);
            },
            close: function () {
                calenderPickerCtrl.closeDatetimePicker();
            }
        };
    };
    CalenderPicker.$inject = ['$compile', '$document', '$controller'];
    angular.module('angularjs-events-calender').factory('CalenderPicker', CalenderPicker);
    var CalenderPickerCtrl = function ($compile, $document) {
        var datetimePickerEl;
        var _this = this;
        var maxDate = '';
        var removeEl = function (el) {
            el && el.remove();
            $document[0].body.removeEventListener('click', _this.closeDatetimePicker);
        };
        this.openDatetimePicker = function (options) {
            this.closeDatetimePicker();
            var div = angular.element('<div datetime-picker-popup ng-cloak></div>');
            options.dateFormat && div.attr('date-format', options.dateFormat);
            options.ngModel && div.attr('ng-model', options.ngModel);
            options.year && div.attr('year', parseInt(options.year));
            options.month && div.attr('month', parseInt(options.month));
            options.day && div.attr('day', parseInt(options.day));
            options.hour && div.attr('hour', parseInt(options.hour));
            options.minute && div.attr('minute', parseInt(options.minute));
            options.maxDate && div.attr('maxDate', options.maxDate);
            options.minDate && div.attr('minDate', options.minDate);
            options.eventDate && div.attr('eventDate', options.eventDate);
            options.triggerButton && div.attr('triggerButton', options.triggerButton);
            console.log(options.triggerButton)
            if (options.dateOnly === '' || options.dateOnly === true) {
                div.attr('date-only', 'true');
            }
            if (options.triggerButton === '' || options.triggerButton === true) {
                div.attr('triggerbutton', 'true');
            }
            if (options.closeOnSelect === 'false') {
                div.attr('close-on-select', 'false');
            }
            var triggerEl = options.triggerEl;
            options.scope = options.scope || angular.element(triggerEl).scope();
            datetimePickerEl = $compile(div)(options.scope)[0];
            datetimePickerEl.triggerEl = options.triggerEl;
            $document[0].body.appendChild(datetimePickerEl);
            //show datetimePicker below triggerEl
            var bcr = triggerEl.getBoundingClientRect();
            var datePickerElBcr = datetimePickerEl.getBoundingClientRect();
            var bodyWidth = $('body').width();
            datetimePickerEl.style.position = 'absolute';
            if (bcr.width > datePickerElBcr.width) {
                datetimePickerEl.style.left = (bcr.left + bcr.width - datePickerElBcr.width + window.scrollX) + 'px';
            } else {
                if ((bcr.left + datePickerElBcr.width) > bodyWidth) {
                    var leftPos = bcr.left - (((bcr.left + datePickerElBcr.width) - bodyWidth) + 10);
                    datetimePickerEl.style.left = (leftPos + window.scrollX) + 'px';
                }
                else {
                    datetimePickerEl.style.left = (bcr.left + window.scrollX) + 'px';
                }
            }
            if (bcr.top < 300 || window.innerHeight - bcr.bottom > 300) {
                datetimePickerEl.style.top = (bcr.bottom + window.scrollY) + 'px';
            } else {
                datetimePickerEl.style.top = (bcr.top - datePickerElBcr.height + window.scrollY) + 'px';
            }
            $document[0].body.addEventListener('click', this.closeDatetimePicker);
        };
        this.closeDatetimePicker = function (evt) {
            var target = evt && evt.target;
            var popupEl = $document[0].querySelector('div[datetime-picker-popup]');
            if (evt && target) {
                if (target.hasAttribute('datetime-picker')) {  // element with calenderPicker behaviour
                    // do nothing
                } else if (popupEl && popupEl.contains(target)) { // calenderPicker itself
                    // do nothing
                } else {
                    removeEl(popupEl);
                }
            } else {
                removeEl(popupEl);
            }
        }
    };
    CalenderPickerCtrl.$inject = ['$compile', '$document'];
    angular.module('angularjs-events-calender').controller('CalenderPickerCtrl', CalenderPickerCtrl);
    var tmpl = [
        '<div class="angularjs-events-calender calender">',
        '  <div class="adp-month">',
        '    <span title="{{months[mv.month].fullName}}">{{months[mv.month].fullName}}</span>',
        ' <span class="year">{{mv.year}}</span>',
        '  </div>',
        '  <div class="adp-days" ng-click="callDate($event)" ng-swipe-left="addMonth(1)" ng-swipe-right="addMonth(-1)" >',
        '    <div class="adp-day-of-week" ng-class="dayOfWeek.fullName" ng-repeat="dayOfWeek in ::daysOfWeek" title="{{dayOfWeek.fullName}}">{{dayOfWeek.fullName}}</div>',
        '    <div class="adp-day leadingDay" ng-show="mv.leadingDays.length < 7" ng-repeat="day in mv.leadingDays">{{::day}}</div>',
        '    <div class="adp-day" ng-repeat="day in mv.days" ',
        '      today="{{today}}" d2="{{mv.year + \'-\' + (mv.month + 1) + \'-\' + day}}"',
        '      ng-class="{',
        '        selectable: false,',
        '        selected: selectEventDate(today, mv, day),',
        '        today: isToday(mv.year + \'-\' + (mv.month + 1) + \'-\' + day),',
        '        weekend: (mv.leadingDays.length + day)%7 == 1 || (mv.leadingDays.length + day)%7 == 0',
        '      }">',
        '      {{::day}}',
        '    </div>',
        '    <div class="adp-day trailingDay" ng-show="mv.trailingDays.length < 7" ng-repeat="day in mv.trailingDays">{{::day}}</div>',
        '  </div>',
        '</div>'].join("\n");
    var datetimePickerPopup = function ($locale, dateFilter) {
        var days, months, daysOfWeek, firstDayOfWeek;
        var initVars = function () {
            days = [], months = [];
            daysOfWeek = [], firstDayOfWeek = 1;
            for (var i = 1; i <= 31; i++) {
                days.push(i);
            }
            for (var i = 0; i < 12; i++) { //jshint ignore:line
                months.push({
                    fullName: $locale.DATETIME_FORMATS.MONTH[i],
                    shortName: $locale.DATETIME_FORMATS.SHORTMONTH[i]
                });
            }
            for (var i = 0; i < 7; i++) { //jshint ignore:line
                var day = $locale.DATETIME_FORMATS.SHORTDAY[(i + firstDayOfWeek) % 7];
                daysOfWeek.push({
                    fullName: day,
                    firstLetter: day.substr(0, 1)
                });
            }
            firstDayOfWeek = 1;
        };
        var getMonthView = function (year, month) {
            if (month > 11) {
                year++;
            } else if (month < 0) {
                year--;
            }
            month = (month + 12) % 12;
            var firstDayOfMonth = new Date(year, month, 1),
                lastDayOfMonth = new Date(year, month + 1, 0),
                lastDayOfPreviousMonth = new Date(year, month, 0),
                daysInMonth = lastDayOfMonth.getDate(),
                daysInLastMonth = lastDayOfPreviousMonth.getDate(),
                dayOfWeek = firstDayOfMonth.getDay(),
                leadingDays = (dayOfWeek - firstDayOfWeek + 7) % 7 || 7, // Ensure there are always leading days to give context
                trailingDays = days.slice(0, 6 * 7 - (leadingDays + daysInMonth));
            if (trailingDays.length > 7) {
                trailingDays = trailingDays.slice(0, trailingDays.length - 7);
            }
            return {
                year: year,
                month: month,
                days: days.slice(0, daysInMonth),
                leadingDays: days.slice(-leadingDays - (31 - daysInLastMonth), daysInLastMonth),
                trailingDays: trailingDays
            };
        };
        var linkFunc = function (scope, element, attrs, ctrl) { //jshint ignore:line
            initVars(); //initialize days, months, daysOfWeek, and firstDayOfWeek;
            var dateFormat = attrs.dateFormat || 'short';
            scope.months = months;
            scope.daysOfWeek = daysOfWeek;
            scope.inputHour;
            scope.inputMinute;
            scope.triggerButton = attrs.triggerbutton;
            if (scope.dateOnly === true) {
                element[0].querySelector('#adp-time').style.display = 'none';
            }
            if (scope.triggerButton === true) {
                element[0].querySelector('#triggerButton').style.display = 'none';
            }
            // console.log(attrs.triggerbutton)
            scope.$applyAsync(function () {
                ctrl.triggerEl = angular.element(element[0].triggerEl);
                if (attrs.ngModel) { // need to parse date string
                    var dateStr = '' + ctrl.triggerEl.scope().$eval(attrs.ngModel);
                    if (dateStr) {
                        if (!dateStr.match(/[0-9]{2}:/)) {  // if no time is given, add 00:00:00 at the end
                            dateStr += " 00:00:00";
                        }
                        dateStr = dateStr.replace(/([0-9]{2}-[0-9]{2})-([0-9]{4})/, '$2-$1');      //mm-dd-yyyy to yyyy-mm-dd
                        dateStr = dateStr.replace(/([\/-][0-9]{2,4})\ ([0-9]{2}\:[0-9]{2}\:)/, '$1T$2'); //reformat for FF
                        dateStr = dateStr.replace(/EDT|EST|CDT|CST|MDT|PDT|PST|UT|GMT/g, ''); //remove timezone
                        dateStr = dateStr.replace(/\s*\(\)\s*/, '');                          //remove timezone
                        dateStr = dateStr.replace(/[\-\+][0-9]{2}:?[0-9]{2}$/, '');           //remove timezone
                        dateStr += getTimezoneOffset(dateStr);
                        var d = new Date(dateStr);
                        scope.selectedDate = new Date(
                            d.getFullYear(),
                            d.getMonth(),
                            d.getDate(),
                            d.getHours(),
                            d.getMinutes(),
                            d.getSeconds()
                        );
                    }
                }
                if (!scope.selectedDate || isNaN(scope.selectedDate.getTime())) { // no predefined date
                    var today = new Date();
                    var year = scope.year || today.getFullYear();
                    var month = scope.month ? (scope.month - 1) : today.getMonth();
                    var day = scope.day || today.getDate();
                    var hour = scope.hour || today.getHours();
                    var minute = scope.minute || today.getMinutes();
                    scope.selectedDate = new Date(year, month, day, hour, minute, 0);
                }
                scope.inputHour = scope.selectedDate.getHours();
                scope.inputMinute = scope.selectedDate.getMinutes();
                // Default to current year and month
                scope.mv = getMonthView(scope.selectedDate.getFullYear(), scope.selectedDate.getMonth());
                // scope.today = dateFilter(new Date(), 'yyyy-M-d');
                scope.today = moment().format(dateFormat);
                if (scope.mv.year == scope.selectedDate.getFullYear() && scope.mv.month == scope.selectedDate.getMonth()) {
                    scope.selectedDay = scope.selectedDate.getDate();
                } else {
                    scope.selectedDay = null;
                }
            });
            scope.addMonth = function (amount) {
                scope.mv = getMonthView(scope.mv.year, scope.mv.month + amount);
            };
            var domEvent;
            scope.callDate = function (evt) {
                if (scope.triggerButton !== undefined || scope.calenderOnly !== undefined) {
                    domEvent = evt;
                    var target = angular.element(evt.target)[0];
                    scope.selectDate(parseInt(target.innerHTML))
                } else {
                    scope.setDate(evt);
                }
            };
            scope.setDate = function (evt) {
                var target = angular.element(evt.target)[0];
                if (target.className.indexOf('selectable') !== -1) {
                    scope.updateNgModel(parseInt(target.innerHTML));
                    if (scope.closeOnSelect !== false) {
                        ctrl.closeDatetimePicker();
                    }
                }
            };
            scope.selectDate = function (day) {
                day = day ? day : scope.selectedDate.getDate();
                scope.selectedDate = new Date(
                    scope.mv.year, scope.mv.month, day, scope.inputHour, scope.inputMinute, 0
                );
                scope.selectedDay = scope.selectedDate.getDate();
            };
            scope.updateNgModel = function (day) {
                day = day ? day : scope.selectedDate.getDate();
                scope.selectedDate = new Date(
                    scope.mv.year, scope.mv.month, day, scope.inputHour, scope.inputMinute, 0
                );
                scope.selectedDay = scope.selectedDate.getDate();
                if (attrs.ngModel) {
                    var elScope = ctrl.triggerEl.scope(), dateValue;
                    if (elScope.$eval(attrs.ngModel) && elScope.$eval(attrs.ngModel).constructor.name === 'Date') {
                        // dateValue = new Date(dateFilter(scope.selectedDate, dateFormat));
                        dateValue = moment(scope.selectedDate).format(dateFormat)
                    } else {
                        // dateValue = dateFilter(scope.selectedDate, dateFormat);
                        dateValue = moment(scope.selectedDate).format(dateFormat)
                    }
                    elScope.$eval(attrs.ngModel + '= date', {date: dateValue});
                }
            };
            scope.changeDate = function () {
                if (domEvent) {
                    scope.setDate(domEvent);
                }
                scope.updateNgModel();
                ctrl.closeDatetimePicker();
            };
            scope.getVisibility = function (d, mv, day) {
                if (attrs.mindate != undefined || attrs.maxdate != undefined) {
                    console.log(attrs.maxdate)
                    let newDate = new Date(mv.year + '-' + (mv.month + 1) + '-' + day);
                    if (attrs.mindate && attrs.maxdate) {
                        return (moment(attrs.mindate).format('YYYY-MM-DD') <= moment(newDate).format('YYYY-MM-DD') && moment(attrs.maxdate).format('YYYY-MM-DD') >= moment(newDate).format('YYYY-MM-DD') ? true : false);
                    }
                    if (attrs.maxdate) {
                        return (moment(attrs.maxdate).format('YYYY-MM-DD') >= moment(newDate).format('YYYY-MM-DD') ? true : false);
                    }
                    if (attrs.mindate) {
                        return (moment(attrs.mindate).format('YYYY-MM-DD') <= moment(newDate).format('YYYY-MM-DD') ? true : false);
                    }
                } else {
                    return true;
                }
            }
            scope.selectEventDate = function (d, mv, day) {
                if (attrs.eventdate !== undefined) {
                    let events = (attrs.eventdate).split(',');
                    let newDate = new Date(mv.year + '-' + (mv.month + 1) + '-' + day);
                    for (let i = 0; i < events.length; i++) {
                        if (moment(moment(newDate).format('YYYY-MM-DD')).isSame(events[i], 'day')) {
                            return moment(moment(newDate).format('YYYY-MM-DD')).isSame(events[i], 'day');
                            break;
                        }
                    }
                } else {
                    return false;
                }
            }
            scope.isCalenderOnly = function () {
                return scope.dateOnly === true ? true : false
                // return true;
            }
            scope.isToday = function (date) {
                let newDate = new Date(date);
                return moment(moment(newDate).format('YYYY-MM-DD')).isSame(moment().format('YYYY-MM-DD'), 'day')
            }
            scope.$on('$destroy', ctrl.closeDatetimePicker);
        };
        return {
            restrict: 'A',
            template: tmpl,
            controller: 'CalenderPickerCtrl',
            replace: true,
            scope: {
                year: '=',
                month: '=',
                day: '=',
                hour: '=',
                minute: '=',
                dateOnly: '=',
                closeOnSelect: '=',
                maxDate: '=',
                minDate: '=',
                eventDate: '=',
                triggerButton: '=',
                calenderOnly: '=',
            },
            link: linkFunc
        };
    };
    datetimePickerPopup.$inject = ['$locale', 'dateFilter'];
    angular.module('angularjs-events-calender').directive('datetimePickerPopup', datetimePickerPopup);
    var calenderPicker = function ($parse, CalenderPicker) {
        return {
            // An ngModel is required to get the controller argument
            restrict: 'E',
            scope: {
                maxDate: '@',
                minDate: '@',
                eventDate: '='
            },
            link: function (scope, element, attrs, ctrl) {
                // Attach validation watcher
                scope.$watch(attrs.ngModel, function (value) {
                    if (!value || value == '') {
                        return;
                    }
                    // The value has already been cleaned by the above code
                    var date = new Date(value);
                    ctrl.$setValidity('date', !date ? false : true);
                    var now = new Date();
                    if (attrs.hasOwnProperty('futureOnly')) {
                        ctrl.$setValidity('future-only', date < now ? false : true);
                    }
                });
                CalenderPicker.open({
                    triggerEl: element[0],
                    dateFormat: attrs.dateFormat,
                    ngModel: attrs.ngModel,
                    year: attrs.year,
                    month: attrs.month,
                    day: attrs.day,
                    hour: attrs.hour,
                    minute: attrs.minute,
                    dateOnly: attrs.dateOnly,
                    futureOnly: attrs.futureOnly,
                    closeOnSelect: attrs.closeOnSelect,
                    maxDate: attrs.maxDate,
                    minDate: attrs.minDate,
                    eventDate: scope.eventDate,
                    triggerButton: attrs.triggerButton,
                    calenderOnly: attrs.calenderOnly,
                });
            }
        };
    };
    calenderPicker.$inject = ['$parse', 'CalenderPicker'];
    angular.module('angularjs-events-calender').directive('calenderPicker', calenderPicker);
})();
