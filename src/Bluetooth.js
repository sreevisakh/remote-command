var noble = require('noble');
noble.on('stateChange', function(state){
  console.log('State Changed : ', state);
  if(state === 'poweredOn'){
    console.log('Start Scanning')
    noble.startScanning();
  }
});

noble.on('discover', function(peripheral){
  console.log('Discovered Perpheral', peripheral.address);
  // peripheral.connect(function(error){
  //   if(error){
  //     return console.log('Connecting to peripheral Failed')
  //   }
  //   console.log('Connected to peripheral');
  //   peripheral.discoverServices([], function(service){
  //     console.log('Discovered Services', service, error)
  //   });
  // });
})
