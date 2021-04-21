import { Machine, assign } from 'xstate';

const DELTA_T = 2;
const DELTA_T_COOL = 1.5;
const DELTA_T_HEAT = 1;
const INIT_TEMP = 72;

/* This method checks if the current temperature is too hot. If true the cooler is turned on */
const coolerTestTooHot = (context) => {
    return context.currentTemp >= context.targetTemp + DELTA_T + DELTA_T_COOL ? true : false;    
}

/* This method checks if the current temperature is too cold. If true the cooler is turned off */
const coolerTestTooCold = (context) => {
    return context.currentTemp <= context.targetTemp - DELTA_T ? true : false;
}

/* This method checks if the current temperature is too cold. If true the heater is turned on */
const heaterTestTooCold = (context) => {
    return context.currentTemp <= context.targetTemp - DELTA_T - DELTA_T_HEAT? true : false;
}

/* This method checks if the current temperature is too hot. If true the heater is turned off */
const heaterTestTooHot = (context) => {
    return context.currentTemp >= context.targetTemp + DELTA_T ? true : false;
}

/* This method updates the current temperature stored in the context */
const updateCurrentTemp = assign({
    currentTemp: (context, event) => event.currentTemp
})

/* This method updates the target temperature stored in the context */
const updateTargetTemp = assign({
    targetTemp: (context, event) => event.targetTemp
})


export const thermostatMachine = Machine({
    id: 'thermostat',
    initial: 'off',
    context: {
        currentTemp: INIT_TEMP,
        targetTemp: INIT_TEMP,
    },
    states: {
        off: {
            on: {
                UPDATECURRTEMP: {
                    actions: [
                        updateCurrentTemp
                    ],
                    target: 'checkDevices'
                },
                UPDATETARGTEMP: {
                    actions: [
                        updateTargetTemp
                    ],
                    target: 'checkDevices'
                },
            }
        },
        checkDevices: {
            on: {
                '': [
                    { target: 'coolerTurningOn', cond: coolerTestTooHot },
                    { target: 'heaterTurningOn', cond: heaterTestTooCold },
                    { target: 'off'}
                ]
            }
        },
        heaterTurningOn: {
            after: {
                1000: 'heaterOn' //assume heater takes 1 second to turn on
            }
        },
        heaterOn: {
            on: {
                UPDATECURRTEMP: {
                    actions: [
                        updateCurrentTemp
                    ],
                    target: 'checkHeater'
                },
                UPDATETARGTEMP: {
                    actions: [
                        updateTargetTemp
                    ],
                    target: 'checkHeater'
                },
            }
        },
        checkHeater: {
            on: {
                '': [
                    { target: 'heaterTurningOff', cond: heaterTestTooHot },
                    { target: 'heaterOn' },
                ]
            },
        },
        heaterTurningOff: {
            after: {
                1000: 'off' //assume heater takes 1 second to turn off
            }
        },
        coolerTurningOn: {
            after: {
                1000: 'coolerOn' //assume cooler takes 1 second to turn on
            }
        },
        coolerOn: {
            on: {
                UPDATECURRTEMP: {
                    actions: [
                        updateCurrentTemp
                    ],
                    target: 'checkCooler'
                },
                UPDATETARGTEMP: {
                    actions: [
                        updateTargetTemp
                    ],
                    target: 'checkCooler'
                },
            }
        },
        checkCooler: {
            on: {
                '': [
                    { target: 'coolerTurningOff', cond: coolerTestTooCold },
                    { target: 'coolerOn' },
                ]
            },
        },
        coolerTurningOff: {
            after: {
                1000: 'off' //assume cooler takes 1 second to turn off
            }
        }
    }
});
