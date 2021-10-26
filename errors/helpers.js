const returnErrorMessage = (type, attribute, value) => {
    switch (type) {
        case form_error_type.empty:
            return global.translate('empty_error');
        case form_error_type.minMax:
            return (
                global.translate('minMax_error') +
                attribute.min +
                global.translate('and') +
                attribute.max
            );
        case form_error_type.email:
            return global.translate('email_error');
        case form_error_type.dropDown:
            return global.translate('dropdown_error');
        case form_error_type.inArray:
            return global.translate('invalidSelect');
        case form_error_type.notInArray:
            return global.translate('invalidSelect');
        case form_error_type.hexString:
            return global.translate('invalid_hexString');
        case form_error_type.notNull:
            return global.translate('not_null_error');
        case form_error_type.captcha:
            return global.translate('captcha_error');

        case form_error_type.password:
            return global.translate('empty_password');
        case form_error_type.passwordMatching:
            return global.translate('messages.passwords_does_not_match');
        case form_error_type.minMaxString:
            return (
                global.translate('minMaxString_error') +
                attribute.min +
                global.translate('and') +
                attribute.max
            );
        case form_error_type.utf8:
            return global.translate('utf8_error');
        case form_error_type.minString:
            return (
                global.translate('min_string_error') + ' ' + attribute['min']
            );
        case form_error_type.maxString:
            return global.translate('max_string_error') + attribute.max;
        case form_error_type.min:
            return global.translate('min_error') + ' ' + attribute.min;
        case form_error_type.max:
            return global.translate('max_error') + ' ' + attribute.max;
        case form_error_type.isNum:
            return global.translate('isNum_error');
        case form_error_type.NaN:
            return global.translate('isNum_error');
        case form_error_type.ipaddress:
            return global.translate('ipaddress_error');
        case form_error_type.domainOrIP:
            if (global.translate('domainOrIP_error'))
                return global.translate('domainOrIP_error');
            return global.translate('ipaddress_error');

        case form_error_type.macAddress:
            return global.translate('macAddress_error');
        case form_error_type.serialNum:
            return global.translate('serialNum_error');
        case form_error_type.hwVersion:
            return global.translate('hwVersion_error');
        case form_error_type.hexadecimal:
            return global.translate('hexadecimal_error');
        case form_error_type.selector:
            return global.translate('selector_error');
        case form_error_type.phone:
            return global.translate('phone_error');
        case form_error_type.date:
            return global.translate('date_error');
        case form_error_type.regex:
            return global.translate('regex_error');
        case form_error_type.installationDate:
            return (
                global.translate('installationDate_error') +
                attribute.min +
                global.translate('and') +
                attribute.max
            );
        case form_error_type.emailPublic:
            return global.translate('public_mails');
        case form_error_type.invalid_value:
            return global.translate('invalid_value_error');
        case form_error_type.InArrayEnhanced:
            if (global.translate('equal_value_error'))
                return global.translate('equal_value_error') + value;
            return global.translate('invalid_value_error');
        default:
            console.log('UNSUPPORTED ERROR TYPE-FIX ME FIX ME');
    }
};

const returnErrorMessageList = (errorList, value) => {
    let l = [];
    errorList.forEach((e) => {
        l.push(returnErrorMessage(e[0], e[1], value));
    });
    return l;
};

const form_error_type = {
    empty: 1,
    minMax: 2,
    email: 3,
    dropDown: 4,
    inArray: 5,
    notInArray: 6,
    hexString: 7,
    notNull: 8,
    captcha: 9,
    minMaxString: 10,
    installationDate: 11,
    password: 13,
    utf8: 14,
    minString: 15,
    // maxString: 16,
    min: 17,
    max: 18,
    isNum: 19,
    NaN: 20,
    ipaddress: 21,
    macAddress: 22,
    serialNum: 23,
    hwVersion: 24,
    hexadecimal: 25,
    selector: 26,
    phone: 27,
    date: 28,
    regex: 29,
    passwordMatching: 30,
    emailPublic: 31,
    invalid_value: 32,
    domainOrIP: 33,
    InArrayEnhanced: 34,
};

export {returnErrorMessage, returnErrorMessageList, form_error_type};
