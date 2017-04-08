var chalk = require('chalk');

exports.log = function () {
  var string = chalk.grey(new Date() + ' : ');
  Array.from(arguments).forEach(function (argument) {
    if (typeof argument === "string") {
      string += chalk.grey(argument);
    } else if (typeof argument === "Object") {
      string += chalk.grey(JSON.stringify(arguments));
    } else {
      string += chalk.grey(argument.toString());
    }
  });
  console.log(string);
};