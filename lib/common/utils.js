var chalk = require('chalk');

exports.log = function () {
  var string = chalk.grey(new Date() + ' : ');
  Array.from(arguments).forEach(function (argument) {
    if (typeof argument === "string") {
      string += chalk.green(argument);
    } else if (typeof argument === "Object") {
      string += chalk.purple(JSON.stringify(arguments));
    } else {
      string += chalk.blue(argument.toString());
    }
  });
  console.log(string);
};