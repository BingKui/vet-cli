const path = require('path');
const chalk = require('chalk');
// fs 扩展库
const fs = require('fs-extra');
// 命令行库
const shell = require('shelljs');
// 交互式命令界面
const inquirer = require('inquirer');
// 命令行loading工具
const ora = require('ora');
// git库下载工具
const download = require('download-git-repo');
// 系统资源查找库
const which = require('which');
// node 原生文件操作方法
const exists = require('fs').existsSync;

const terminalLink = require('terminal-link');

const { say } = require('cfonts');

const logger = require('./logger');

const npms = ['cnpm', 'npm'];

const cwd = process.cwd();

const ENMU = require('../constants/emnu');

// 定义来源
const origin = 'BingKui/VueElectronTemplate';

// 查找可使用的 npm 类型
function findNpm() {
    for (var i = 0; i < npms.length; i++) {
        try {
            which.sync(npms[i]);
            logger.infoTip('安装工具', '使用: ' + npms[i]);
            return npms[i];
        } catch (e) {

        }
    }
    throw new Error('请先安装 npm');
}

function getTemplate() {
    const arr = [];
    for (let key in ENMU) {
        arr.push({
            name: ENMU[key].name,
            value: ENMU[key].value,
            short: ENMU[key].short,
        });
    }
    return arr;
}

function logInfo(info) {
    say(info, {
        colors: ['#19be6b', '#19be6b', '#19be6b'],
        font: 'chrome',
        space: true,
    });
}

module.exports = function (args) {
    logInfo('vet new project!');

    const autoInstall = !(args[3] === '--no-auto-install');

    const questions = [{
        type: 'input',
        name: 'name',
        message: 'Project Name(项目名称):',
    }, {
        type: 'input',
        name: 'path',
        message: 'Init Path Default ./(初始化目录，默认目录 ./ ):',
    }, {
        type: 'list',
        name: 'template',
        message: 'Template(模板):',
        choices: getTemplate(),
    }, {
        type: 'input',
        name: 'author',
        message: 'Author(作者):',
    }, {
        type: 'input',
        name: 'desc',
        message: 'Project Description(项目介绍):',
    }, {
        type: 'input',
        name: 'appid',
        message: 'appId(打包appId):',
    }, {
        type: 'input',
        name: 'copyright',
        message: 'copyright(版权):',
    }, {
        type: 'input',
        name: 'gitsrc',
        message: 'Git Src(Git地址):',
    }, {
        type: 'input',
        name: 'license',
        message: 'License(开源协议):',
    }];

    inquirer.prompt(questions).then(function (answers) {
        // 接收输入的项目名称
        const projectName = `${answers.name}` || 'vet-new-project';
        // 重新定义项目的地址
        const targetPath = path.join(cwd, `${answers.path}` || './');
        // 检测路径是否存在
        if (exists(path.join(targetPath, projectName))) {
            // 存在，直接输入错误信息，并返回
            logger.errorTip('创建出错', 'exit: 目录已经存在');
            return;
        }
        logInfo('download template!');
        // 定义加载中的提示信息
        const spinner = ora('下载模板...');
        // 开始执行loading
        spinner.start();
        const { branch, homepage, desc, name, short } = ENMU[answers.template];
        // 下载项目
        download(`${origin}${branch}`, path.join(targetPath, projectName), {
            clone: false
        }, function (err) {
            // 关闭loading
            spinner.stop();
            if (err) {
                // 出现错误
                logger.errorTip('下载出错', `未能下载 https://github.com/${origin}${branch}`, err);
            } else {
                // 下载成功
                logger.successTip('下载成功',`下载成功 https://github.com/${origin}${branch} 到 ${targetPath}`);
                // 不自动安装依赖，直接返回
                if (!autoInstall) {
                    return;
                }
                // 定义自动安装依赖时的提示信息
                const spinnerInstall = ora('自动安装...');
                spinnerInstall.start();
                
                const npm = findNpm();
                logInfo('install dependencies!');
                // 通过 shell 进入项目目录进行安装依赖
                shell.exec(`cd ${path.join(targetPath, projectName)} && ${npm} install`, function () {
                    spinnerInstall.stop();
                    logger.successTip('安装完成', npm);
                    logger.successTip(name, `点击 ${terminalLink(`https://github.com/${origin}${branch}`, `https://github.com/${origin}${branch}`)} 了解更多。`);
                    homepage && logger.infoTip(`${short}`, `前往 ${terminalLink(homepage, homepage)} 了解更多组件库内容。`);
                    desc && logger.info(desc);
                    // 修改package内容为当前项目设置内容
                    changePkgValue(path.join(targetPath, projectName), answers, function() {
                        logInfo('project created!');
                    });
                });
            }
        })
    });
};
function changePkgValue (filePath, answers, callback) {
    fs.readFile(`${filePath}/package.json`, 'utf8', function (err, data) {
        const val = JSON.parse(data);
        val.name = answers.name;
        val.build.productName = answers.name;
        val.build.appId = answers.appid;
        val.build.copyright = answers.copyright;
        val.description = answers.desc;
        val.author = answers.author;
        val.license = answers.license || 'MIT';
        val.repository.url = answers.gitsrc ? `git+${answers.gitsrc}` : '';
        val.homepage = answers.gitsrc || '';
        val.bugs.url = answers.gitsrc || '';
        fs.writeFile(`${filePath}/package.json`, JSON.stringify(val, null, '\t'), 'utf8', function (err) {
            callback && callback();
        });
    });
};