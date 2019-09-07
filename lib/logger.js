const chalk = require('chalk');
const logger = {
    _log: (style, haveBg, ...args) => {
        const value = [];
        for (let i = 0; i < args.length; i++) {
            const item = args[i];
            const type = typeof item;
            if (type === 'string' || type === 'number') {
                if (i === 0 && haveBg) {
                    value.push(chalk.bgHex(style).hex('#FFFFFF')(` ${item} `));
                } else {
                    value.push(chalk.hex(style)(item));
                }
            } else {
                value.push(item);
            }
        }
        console.log(...value);
    },
    log: (text, color) => {
        console.log(chalk.hex(color)(text));
    },
    info: (...args) => {
        logger._log('#2db7f5', false, ...args);
    },
    warn: (...args) => {
        logger._log('#ff9900', false, ...args);
    },
    error: (...args) => {
        logger._log('#ed4014', false, ...args);
    },
    success: (...args) => {
        logger._log('#19be6b', false, ...args);
    },
    infoTip: (...args) => {
        logger._log('#2db7f5', true, ...args);
    },
    warnTip: (...args) => {
        logger._log('#ff9900', true, ...args);
    },
    errorTip: (...args) => {
        logger._log('#ed4014', true, ...args);
    },
    successTip: (...args) => {
        logger._log('#19be6b', true, ...args);
    },
};

module.exports = logger;