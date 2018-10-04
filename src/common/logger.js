class Logger {
    constructor(level) {
        this.level = 0;
    }

    log = (message, level = 0, ...args) => {
        if (level === level) {
            switch (level){
                case levels.assert:
                    console.assert(false, message, ...args)
                    break;
                case levels.warn:
                    console.warn(message, ...args);
                    break;
                case levels.error:
                    console.error(message, ...args);
                    break;
                default:
                    console.log(message, ...args);
            }
        }
    };
    error = (message, ...args) => {
        console.log(message, args);
    };

    warn = (message, ...args) => {
        this.log(message, levels.warn, args);
    };

    assert(condition, message, ...data) {
        if (!condition) {
            this.log(message, levels.warn, data);
        }
    }

    debug = (message, ...args) => {
        this.log(message, levels.debug, args);
    };

    info = (message, ...args) => {
        this.log(message, levels.info, args);
    };

    debugTrace = (message, ...args) => {
        this.log(message, levels.debugTrace, args);
    };
}

const levels = {
    debugTrace: 0,
    info: 1,
    debug: 2,
    warn: 3
};

export default new Logger(0);
