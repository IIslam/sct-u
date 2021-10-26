import _ from 'lodash';

import {returnErrorMessage, form_error_type} from '../errors/helpers';
import {timeObjToString} from '../helpers';
import doValidationByType from './helpers';

const validationForTimeText = (timeAttributeOriginal) => {
    let timeAttribute = [...timeAttributeOriginal];
    let multiplier = {
        hours: 3600,
        minutes: 60,
        seconds: 1,
    };

    let minSec = 0;
    let maxSec = 0;
    let inputValue = 0;

    let minLimit = {},
        maxLimit = {},
        limitString = {};

    let errorType = null;
    timeAttribute.forEach((timeUnit) => {
        if (!timeUnit.value && timeUnit.value !== 0)
            errorType = form_error_type.empty;
        inputValue += +timeUnit.value * multiplier[timeUnit.id];
        if (timeUnit.validation[0].min) {
            minSec += +timeUnit.validation[0].min * multiplier[timeUnit.id];
            minLimit[timeUnit.id] = timeUnit.validation[0].min;
        }
        if (timeUnit.validation[0].max) {
            maxSec += +timeUnit.validation[0].max * multiplier[timeUnit.id];
            maxLimit[timeUnit.id] = timeUnit.validation[0].max;
        }
    });
    if (!errorType) {
        if (minSec > inputValue) {
            errorType = form_error_type.min;
        } else if (maxSec < inputValue) {
            errorType = form_error_type.max;
        }
    }
    if (errorType && errorType !== form_error_type.empty) {
        limitString.max = timeObjToString(maxLimit);
        limitString.min = timeObjToString(minLimit);
    }
    timeAttribute[0].error = errorType
        ? [returnErrorMessage(errorType, limitString)]
        : null;
    return timeAttribute;
};

const validationProcess = (permissionType, getPermission, inputs) => {
    let passedInputs = inputs;

    inputs.forEach((parentElement, index) => {
        if (
            getPermission(parentElement) == permissionType.WRITE &&
            parentElement.type != 'buttonsList'
        ) {
            if (
                (parentElement.validation &&
                    parentElement.validation.length != 0) ||
                parentElement.composite
            ) {
                let type = inputs[index].type;
                let value = inputs[index].value;
                let validationList = parentElement.validation;

                if (parentElement.composite) {
                    let validateChildren;
                    validateChildren =
                        parentElement.type == 'timeTextInput'
                            ? validationForTimeText(
                                  parentElement.compositeItems,
                              )
                            : validationProcess(
                                  permissionType,
                                  getPermission,
                                  parentElement.compositeItems,
                              );
                    let errors = [];
                    let finalResult = {};
                    validateChildren.forEach((element) => {
                        if (element.error) {
                            errors.push(element.error);
                        }
                        finalResult[element.id] = element.value;
                    });
                    if (errors.length > 0) inputs[index].error = errors;
                    else {
                        if (inputs[index].error) inputs[index].error = null;
                        inputs[index].value = finalResult;
                        inputs[index].value['type'] = parentElement.type;
                    }
                } else if (type == 'matchingPasswords') {
                    if (!parentElement.pass1) parentElement.pass1 = '';
                    if (!parentElement.pass2) parentElement.pass2 = '';

                    let err1 = doValidationByType(
                        parentElement.pass1,
                        validationList,
                    );
                    let err2 = doValidationByType(
                        parentElement.pass2,
                        validationList,
                    );

                    if (
                        err1.errorList.length == 0 &&
                        err2.errorList.length == 0
                    ) {
                        if (parentElement.pass1 === parentElement.pass2) {
                            if (inputs[index].error) inputs[index].error = null;
                            inputs[index].value = err1.value;
                        } else {
                            inputs[index].error = returnErrorMessage(
                                form_error_type.passwordMatching,
                                parentElement.pass1,
                            );
                        }
                    } else if (err1) {
                        inputs[index].error = returnErrorMessageList(
                            err1.errorList,
                            parentElement.pass1,
                        );
                    } else {
                        inputs[index].error = returnErrorMessageList(
                            err2.errorList,
                            parentElement.pass2,
                        );
                    }
                    passedInputs = [...inputs];
                } else {
                    let validationResponse = doValidationByType(
                        value,
                        validationList,
                    );

                    if (validationResponse.errorList.length == 0) {
                        if (inputs[index].error) inputs[index].error = null;
                        inputs[index].value = validationResponse.value;
                        if (type == 'captcha') {
                            if (typeof inputs[index].value != 'object') {
                                inputs[index].value = {
                                    value: validationResponse.value,
                                    randomCaptchaKey:
                                        inputs[index].randomCaptchaKey,
                                };
                            }
                        } else if (type == 'installation_date') {
                            inputs[
                                index
                            ].textContent = validationResponse.value.toString();
                        }
                    } else
                        inputs[index].error = returnErrorMessageList(
                            validationResponse.errorList,
                            value,
                        );

                    passedInputs = [...inputs];
                }

                //removed time,date
            } else if (!parentElement.validation) {
                console.error(
                    'This item does not have validation ==>',
                    parentElement.id,
                );
            }
        }
    });
    return passedInputs;
};

const doCustomValidation = (initialValidatedData, combinedValidator) => {
    let initialData = [...initialValidatedData];
    let hasAttributeValidationFailed = false;
    initialData.forEach((attribute) => {
        if (attribute.error) {
            hasAttributeValidationFailed = true;
        } else if (attribute.customValidator) {
            let validationObj = attribute.customValidator(attribute.value);
            if (!validationObj.isValid) {
                attribute.error = validationObj.errorMessage;
                hasAttributeValidationFailed = true;
            }
        }
    });

    if (!hasAttributeValidationFailed && combinedValidator) {
        let initialValidatedData = {};
        initialData.forEach((attribute) => {
            initialValidatedData[attribute.id] = attribute.value;
        });

        let errorObj = combinedValidator(initialValidatedData);

        initialData.forEach((attribute) => {
            if (errorObj[attribute.id]) {
                attribute.error = errorObj[attribute.id];
            }
        });
    }
    return initialData;
};

export {validationForTimeText, validationProcess, doCustomValidation};
