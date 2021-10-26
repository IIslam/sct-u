import crashlytics from '@react-native-firebase/crashlytics';

const errorLog = (messageObj, objName) => {
    crashlytics().recordError(new Error(`Error in ${objName}: ${messageObj}`));

    console.error(`Error in ${objName}: ${messageObj}`);
};

export {errorLog};
