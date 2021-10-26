import EmailValidator from 'email-validator';
import XRegExp from 'xregexp';

import {form_error_type} from '../errors/helpers';

function ValidateUTF8(value) {
    var regexp = new XRegExp('^\\p{L}+$');
    // 1Ciesiołkiewicz2 false
    // Ciesiołkiewicz true
    return regexp.test(value);
}

function isNumeric(str) {
    if (typeof str == 'number') return true;
    if (typeof str != 'string') return false; // we only process strings!
    return (
        !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
}

function isInteger(str) {
    let inp = str;
    if (typeof str == 'number') inp = str.toString();
    else if (typeof str != 'string') return false; // we only process strings!

    return /^-?\d+$/.test(inp);
}

const publicMailDomainsList = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'aol.com',
    'hotmail.co.uk',
    'hotmail.fr',
    'msn.com',
    'yahoo.fr',
    'wanadoo.fr',
    'orange.fr',
    'comcast.net',
    'yahoo.co.uk',
    'yahoo.com.br',
    'yahoo.co.in',
    'live.com',
    'rediffmail.com',
    'free.fr',
    'gmx.de',
    'web.de',
    'yandex.ru',
    'ymail.com',
    'libero.it',
    'outlook.com',
    'uol.com.br',
    'bol.com.br',
    'mail.ru',
    'cox.net',
    'hotmail.it',
    'sbcglobal.net',
    'sfr.fr',
    'live.fr',
    'verizon.net',
    'live.co.uk',
    'googlemail.com',
    'yahoo.es',
    'ig.com.br',
    'live.nl',
    'bigpond.com',
    'terra.com.br',
    'yahoo.it',
    'neuf.fr',
    'yahoo.de',
    'alice.it',
    'rocketmail.com',
    'att.net',
    'laposte.net',
    'facebook.com',
    'bellsouth.net',
    'yahoo.in',
    'hotmail.es',
    'charter.net',
    'yahoo.ca',
    'yahoo.com.au',
    'rambler.ru',
    'hotmail.de',
    'tiscali.it',
    'shaw.ca',
    'yahoo.co.jp',
    'sky.com',
    'earthlink.net',
    'optonline.net',
    'freenet.de',
    't-online.de',
    'aliceadsl.fr',
    'virgilio.it',
    'home.nl',
    'qq.com',
    'telenet.be',
    'me.com',
    'yahoo.com.ar',
    'tiscali.co.uk',
    'yahoo.com.mx',
    'voila.fr',
    'gmx.net',
    'mail.com',
    'planet.nl',
    'tin.it',
    'live.it',
    'ntlworld.com',
    'arcor.de',
    'yahoo.co.id',
    'frontiernet.net',
    'hetnet.nl',
    'live.com.au',
    'yahoo.com.sg',
    'zonnet.nl',
    'club-internet.fr',
    'juno.com',
    'optusnet.com.au',
    'blueyonder.co.uk',
    'bluewin.ch',
    'skynet.be',
    'sympatico.ca',
    'windstream.net',
    'mac.com',
    'centurytel.net',
    'chello.nl',
    'live.ca',
    'aim.com',
    'bigpond.net.au',
];

function isPublicMail(email) {
    let mailDomain = email.split('@')[1];
    return publicMailDomainsList.includes(mailDomain);
}

function hasValueStrict(str) {
    return str !== undefined && str !== null && str !== '';
}

export default function doValidationByType(
    PassedValue,
    validationList,
    serialNumberRegExp,
) {
    let value = PassedValue;
    let errorList = [];
    for (let element of validationList) {
        if (
            [
                'email',
                'regex',
                'hexString',
                'string',
                'UTF8',
                'selectedInput',
                'hwVersion',
                'hexadecimal',
                'ipAddress',
                'domainOrIP',
            ].includes(element.type) &&
            (element.type != 'regex' || !element.isNum)
        ) {
            if (!value && value != 0) value = '';
            else value = value.toString().trim();
        }
        if (!hasValueStrict(value)) {
            if (
                [
                    'inArray',
                    'notInArray',
                    'notNull',
                    'InArrayEnhanced',
                ].includes(element.type)
            ) {
                return {errorList: errorList, value: value};
            }
            if (element.allowEmpty) {
                return {errorList: errorList, value: value};
            } else {
                if (element.type == 'notNull') {
                    errorList.push([form_error_type.notNull, element]);
                }
                if (element.type == 'captcha') {
                    errorList.push([form_error_type.captcha, element]);
                } else errorList.push([form_error_type.empty, element]);
                return {errorList: errorList, value: value};
            }
        }

        if (hasValueStrict(element.min) && !isNumeric(element.min)) {
            console.error("MIN CAN't BE NON INTEGER VALUE", element.min);
            element.min = null;
        }
        if (!hasValueStrict(element.min)) {
            element.min = Number.MIN_SAFE_INTEGER;
        }
        if (hasValueStrict(element.max) && !isNumeric(element.max)) {
            console.error("MAX CAN't BE NON INTEGER VALUE", element.max);
            element.max = null;
        }
        if (!hasValueStrict(element.max)) {
            element.max = Number.MAX_SAFE_INTEGER;
        }
        switch (element.type) {
            case 'InArrayEnhanced':
                if (
                    element.blacklist.find((element) => element == value) !=
                    undefined
                ) {
                    errorList.push([form_error_type.InArrayEnhanced, element]);
                }
                break;
            case 'domainOrIP':
                if (
                    !/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/.test(
                        value,
                    ) &&
                    !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
                        value,
                    )
                ) {
                    errorList.push([form_error_type.domainOrIP, element]);
                }
                break;
            case 'email':
                if (!EmailValidator.validate(value)) {
                    errorList.push([form_error_type.email, element]);
                } else if (element.noPublic && isPublicMail(value)) {
                    errorList.push([form_error_type.emailPublic, element]);
                }
                break;
            case 'regex':
                if (!XRegExp(element.patt).test(value)) {
                    errorList.push([form_error_type.regex, element]);
                }
                break;
            case 'dropDown':
                if (value > element.max || value < element.min)
                    errorList.push([form_error_type.dropDown, element]);

                let keyFound = false;
                if (!element.allowEmpty && element.content) {
                    for (let idx in element.content) {
                        if (element.content[idx].key == value) {
                            keyFound = true;
                            break;
                        }
                    }
                    if (!keyFound)
                        errorList.push([form_error_type.empty, element]);
                }
                break;
            case 'inArray':
                if (
                    element.values.find((element) => element == value) ==
                    undefined
                ) {
                    errorList.push([form_error_type.inArray, element]);
                }
                break;

            case 'notInArray':
                if (
                    element.values.find((element) => element == value) !=
                    undefined
                ) {
                    errorList.push([form_error_type.notInArray, element]);
                }
                break;

            case 'arrayNotEmpty':
                if (element.min > value.length) {
                    errorList.push([form_error_type.minString, element]);
                }
                break;

            case 'hexString':
                if (!value.match(/^[A-z0-9]{12}$/)) {
                    errorList.push([form_error_type.hexString, element]);
                }
                break;
            case 'notNull':
                //handeled in generic allow Emoty
                break;
            case 'captcha':
                //handeled in generic allow Emoty

                break;
            case 'matchingPasswords':
                // if (value.length < 5)
                //     errorList.push([form_error_type.invalid_value, element]);
                break;
            case 'UTF8':
                if (!ValidateUTF8(value)) {
                    errorList.push([form_error_type.utf8, element]);
                }
                break;
            case 'string':
                if (element.min > value.length) {
                    errorList.push([form_error_type.minString, element]);
                }

                if (element.max < value.length) {
                    errorList.push([form_error_type.maxString, element]);
                }
                break;
            case 'integer':
                if (!isInteger(value)) {
                    errorList.push([form_error_type.isNum, element]);
                } else {
                    if (element.min > value) {
                        errorList.push([form_error_type.min, element]);
                    } else if (element.max < value) {
                        errorList.push([form_error_type.max, element]);
                    } else {
                        value = parseInt(value);
                    }
                }

                break;
            case 'float':
                if (!isNumeric(value)) {
                    errorList.push([form_error_type.isNum, element]);
                } else {
                    if (element.min > value) {
                        errorList.push([form_error_type.min, element]);
                    } else if (element.max < value) {
                        errorList.push([form_error_type.max, element]);
                    } else {
                        value = parseFloat(value);
                    }
                }

                break;
            case 'ipAddress':
                if (
                    !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
                        value,
                    )
                ) {
                    errorList.push([form_error_type.ipaddress, element]);
                }

                break;
            case 'macAddress':
                if (
                    !/^(([A-Fa-f0-9]{2}){5}[A-Fa-f0-9]{2}[,]?)+$/i.test(value)
                ) {
                    errorList.push([form_error_type.macAddress, element]);
                }

                break;
            case 'serialNumber':
                if (!serialNumberRegExp.test(value)) {
                    errorList.push([form_error_type.serialNum, element]);
                }

                break;
            case 'hwVersion':
                if (!/^([a-zA-Z ]{1,2})$/.test(value)) {
                    errorList.push([form_error_type.hwVersion, element]);
                }

                break;
            case 'hexadecimal':
                if (!/^[0-9a-fA-F]+$/.test(value)) {
                    errorList.push([form_error_type.hexadecimal, element]);
                }

                break;
            case 'boolean':
                if (
                    typeof value !== 'boolean' &&
                    value != 'true' &&
                    value != 'false' &&
                    !isInteger(value)
                ) {
                    errorList.push([form_error_type.selector, element]);
                } else {
                    value = value ? true : false;
                }
                break;
            case 'phone':
                if (
                    !/^(\+\d{1,2}\s*)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(
                        value,
                    )
                ) {
                    errorList.push([form_error_type.phone, element]);
                    break;
                }
                break;

            case 'installation_date':
                var theDate = new Date(value * 1000);
                if (
                    theDate.getFullYear() - new Date().getFullYear() <=
                        element.max &&
                    theDate.getFullYear() - new Date().getFullYear() >=
                        element.min
                ) {
                    value = theDate.getTime() / 1000;
                } else {
                    errorList.push([form_error_type.installationDate, element]);
                }
                break;

            default:
                // code block
                console.log('UNSUPPPORTED VALIDATION', element.type);
                break;
        }
    }

    return {errorList: errorList, value: value};
}

export {
    ValidateUTF8,
    isInteger,
    isNumeric,
    publicMailDomainsList,
    isPublicMail,
    hasValueStrict,
};
