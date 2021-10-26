import {errorLog} from './errors/logger';
import {Platform} from 'react-native';
import _ from 'lodash';

const formatTime = (getZoneTimestampFromUTC, val, options, zoneId) => {
    function getDateFormattedFromUnixTimeStamp(timeStamp, format = 'default') {
        if (timeStamp != +timeStamp) return '';
        const LEAPOCH = 946684800 + 86400 * (31 + 29);
        const DAYS_PER_400Y = 365 * 400 + 97;
        const DAYS_PER_100Y = 365 * 100 + 24;
        const DAYS_PER_4Y = 365 * 4 + 1;
        const DAYS_IN_MONTH = [31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, 29];
        const SECS = timeStamp - LEAPOCH;
        let remdays, remsecs, remyears;
        let qc_cycles, c_cycles, q_cycles;
        let years, months;
        let wday, yday, leap;
        let days = Math.floor(SECS / 86400);
        remsecs = SECS % 86400;
        if (remsecs < 0) {
            remsecs += 86400;
            days--;
        }

        wday = (3 + days) % 7;
        if (wday < 0) wday += 7;

        qc_cycles = Math.floor(days / DAYS_PER_400Y);
        remdays = days % DAYS_PER_400Y;
        if (remdays < 0) {
            remdays += DAYS_PER_400Y;
            qc_cycles--;
        }

        c_cycles = Math.floor(remdays / DAYS_PER_100Y);
        if (c_cycles == 4) c_cycles--;
        remdays -= c_cycles * DAYS_PER_100Y;

        q_cycles = Math.floor(remdays / DAYS_PER_4Y);
        if (q_cycles == 25) q_cycles--;
        remdays -= q_cycles * DAYS_PER_4Y;

        remyears = Math.floor(remdays / 365);
        if (remyears == 4) remyears--;
        remdays -= remyears * 365;

        leap = !remyears && (q_cycles || !c_cycles);
        yday = remdays + 31 + 28 + leap;
        if (yday >= 365 + leap) yday -= 365 + leap;

        years = remyears + 4 * q_cycles + 100 * c_cycles + 400 * qc_cycles;

        for (months = 0; DAYS_IN_MONTH[months] <= remdays; months++)
            remdays -= DAYS_IN_MONTH[months];

        years += 2000;
        months += 3; //1 = January
        if (months > 12) {
            months -= 12;
            years++;
        }
        function zeroPad(num, places) {
            let zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join('0') + num;
        }

        function getHourFromSeconds(timeInSeconds) {
            var hours = Math.floor(timeInSeconds / 3600);
            var minutes = Math.floor((timeInSeconds % 3600) / 60);
            var period;
            if (hours >= 12 && hours != 24) {
                if (hours != 12) hours -= 12;
                period = 'PM';
            } else {
                if (hours == 0 || hours == 24) hours = 12;
                period = 'AM';
            }

            return {
                hours: hours,
                minutes: minutes,
                period: period,
            };
        }

        var daysText = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];
        var monthsText = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        var str;
        switch (format) {
            case 'date':
                str =
                    zeroPad(months, 2) +
                    '/' +
                    zeroPad(remdays + 1, 2) +
                    '/' +
                    years.toString();
                break;
            case 'LCDprojection':
                var time = getHourFromSeconds(remsecs);
                str =
                    zeroPad(time.hours, 2) +
                    ':' +
                    zeroPad(time.minutes, 2) +
                    ' ' +
                    time.period +
                    ' - ' +
                    daysText[wday] +
                    ' ' +
                    monthsText[months - 1] +
                    '/' +
                    (remdays + 1);
                break;
            case '12h':
                let hours = Math.floor(remsecs / 3600);
                let amPM = 'PM';
                if (hours < 12) {
                    amPM = 'AM';
                    if (hours == 0) {
                        hours = 12;
                    }
                } else {
                    hours -= 12;
                }
                hours = zeroPad(hours, 2);
                str =
                    zeroPad(months, 2) +
                    '/' +
                    zeroPad(remdays + 1, 2) +
                    '/' +
                    years.toString() +
                    ' ' +
                    hours +
                    ':' +
                    zeroPad(Math.floor((remsecs / 60) % 60), 2) +
                    ':' +
                    zeroPad(Math.floor(remsecs % 60), 2) +
                    ' ' +
                    amPM;
                break;
            default:
                str =
                    zeroPad(months, 2) +
                    '/' +
                    zeroPad(remdays + 1, 2) +
                    '/' +
                    years.toString() +
                    ' ' +
                    zeroPad(Math.floor(remsecs / 3600), 2) +
                    ':' +
                    zeroPad(Math.floor((remsecs / 60) % 60), 2) +
                    ':' +
                    zeroPad(Math.floor(remsecs % 60), 2);
                break;
        }
        return str;
    }

    let time = getZoneTimestampFromUTC(zoneId, val);
    time = getDateFormattedFromUnixTimeStamp(time);
    if (options.timeOnly) {
        return time.split(' ')[1];
    }

    return time.split(' ')[0];
};

const returnMax = (attribute) => {
    let value;
    if (attribute.validation)
        value = attribute.validation.find((element) => element?.max);
    if (value) return value.max;
    return undefined;
};

const isFieldRequired = (attribute) => {
    let value;
    if (attribute.validation)
        value = attribute.validation.find((element) => element?.allowEmpty);
    if (value) return !value.allowEmpty;
    return true;
};

const getKeyBoardAtrribute = (attribute) => {
    let keyboardType = 'default';
    if (attribute.type == 'integer' || attribute.type == 'float') {
        if (Platform.OS === 'android') {
            keyboardType = 'numeric';
        } else if (Platform.OS === 'ios') {
            keyboardType = 'numbers-and-punctuation';
            if (attribute.validation.length > 0) {
                let numericOb = attribute.validation.find(
                    (e) => e.type == 'integer' || e.type === 'float',
                );
                if (numericOb) {
                    let min = numericOb.min || -1;
                    let max = numericOb.max;
                    if (!numericOb.hasOwnProperty('max')) {
                        max = 1;
                    }

                    if (min >= 0 && max > 0) {
                        keyboardType = 'numeric';
                    } else {
                        keyboardType = 'numbers-and-punctuation';
                    }
                }
            }
        }
    }
    return keyboardType;
};

const deepModify = (existing, updated) => {
    let valExists = (value) => {
        return !(value === undefined || value === null);
    };
    let _deepModify = (a, b) => {
        for (const x in a) {
            if (typeof a[x] == 'function') continue; //NO modifications allowed on functions callbacks
            if (valExists(a[x]) && !valExists(b[x])) {
                delete a[x];
                continue;
            }
            if (
                (typeof a[x] != 'object' && typeof b[x] == 'object') ||
                (typeof a[x] == 'object' && typeof b[x] != 'object')
            ) {
                a[x] = _.cloneDeep(b[x]);
                continue;
            }
            if (typeof a[x] == 'object') {
                _deepModify(a[x], b[x]);
            } else if (a[x] != b[x]) {
                a[x] = b[x];
            }
        }
        for (const x in b) {
            if (!valExists(a[x]) && valExists(b[x])) {
                a[x] = _.cloneDeep(b[x]);
                return;
            }
        }
    };
    _deepModify(existing, updated);
};

const generateRandomString = (length) => {
    var result = '';
    var characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
};

const daysOfTheWeekObj = () => {
    return [
        {id: 0, name: global.translate('days.sunday')},
        {id: 1, name: global.translate('days.monday')},
        {id: 2, name: global.translate('days.tuesday')},
        {id: 3, name: global.translate('days.wednesday')},
        {id: 4, name: global.translate('days.thursday')},
        {id: 5, name: global.translate('days.friday')},
        {id: 6, name: global.translate('days.saturday')},
    ];
};

const mutateObjectProperty = (prop, value, obj) => {
    let keyList = prop.split('.');
    let idx = 0;
    let temp = obj;
    keyList.forEach((element) => {
        idx++;
        if (element in temp) {
            if (keyList.length == idx) {
                if (typeof temp[element] == 'object') {
                    if (__DEV__) {
                        console.log(
                            'FIX ME2 :mutateObjectProperty',
                            prop + ':' + value,
                            typeof prop,
                        );
                    } else {
                        errorLog('mutateObjectProperty', prop + ':' + value);
                    }
                    return false;
                }
                temp[element] = value;
                return true;
            } else if (typeof temp[element] == 'object') {
                temp = temp[element];
            } else {
                if (__DEV__) {
                    console.log(
                        'FIX ME0 :mutateObjectProperty',
                        prop + ':' + value,
                        typeof prop,
                    );
                } else {
                    errorLog('mutateObjectProperty', prop + ':' + value);
                }
                return false;
            }
        } else {
            if (__DEV__) {
                console.log(
                    'FIX ME1 :mutateObjectProperty',
                    prop + ':' + value,
                );
            } else {
                errorLog('mutateObjectProperty', prop + ':' + value);
            }
            return false;
        }
    });
};

const timeObjToString = (timeObj) => {
    let res =
        (timeObj.hours
            ? timeObj.hours +
              ' ' +
              global.translate(timeObj.hours == 1 ? 'g.hour' : 'g.hours')
            : '') +
        (timeObj.minutes
            ? ' ' +
              timeObj.minutes +
              ' ' +
              global.translate(timeObj.minutes == 1 ? 'g.minute' : 'g.minutes')
            : '') +
        (timeObj.seconds
            ? ' ' +
              timeObj.seconds +
              ' ' +
              global.translate(
                  timeObj.seconds == 1 ? 'time.second' : 'time.seconds',
              )
            : '');
    return res;
};

export {
    formatTime,
    returnMax,
    isFieldRequired,
    getKeyBoardAtrribute,
    deepModify,
    generateRandomString,
    daysOfTheWeekObj,
    mutateObjectProperty,
    timeObjToString,
};
