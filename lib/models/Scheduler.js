var ping = require('ping');
var log = require('../common/utils').log;
var noble = require('noble');
var chalk = require('chalk');
module.exports = function Scheduler() {

  var mobileCheck = function (config, callback) {
    log('Starting Mobile Check ' + config.ip);
    var hosts = [config.ip];
    var handle = setInterval(function () {
      hosts.forEach(function (host) {
        ping.sys.probe(host, callback.bind(this, handle));
      });
    }, config.interval || 3000);
  };

  var bleCheck = function () {
    var callback = function () {
      console.log(arguments);
    };
  };
  try {
    noble.on('stateChange', function (state) {
      if (state === 'poweredOn') noble.startScanning();else noble.stopScanning();
    });
    noble.on('scanStart', function () {
      log('scanStart');
    });
    noble.on('scanStop', function () {
      log('scanStop');
    });
    noble.on('discover', function (peripheral) {
      log(chalk.blue(peripheral));
      log('discover');
    });
    noble.on('warning', function (message) {});
  } catch (e) {
    log(chalk.red(e));
  }

  return {
    mobileCheck,
    bleCheck
  };
};