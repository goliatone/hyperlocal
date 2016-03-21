var bleacon = require('bleacon');
var eventEmitter = new (require('events').EventEmitter)();


var SPACE_ID = process.env.HYPE_SPACE_ID || 'demo-1';
//SERVICES should be an array of urls of services
//running on this device.
var SERVICES = process.env.HYPE_SERVICES;
var SPACE_UUID = process.env.SPACE_UUID || 'demo-space-uuid';
var DEVICE_UUID = process.env.DEVICE_UUID || 'demo-device-uuid';

var socket;

console.log('Started... Discovering iBeacons!');

// Start listening for iBeacon broadcast (ONLY iPHONE UUID)
// bleacon.startScanning(['8492e75f4fd6469db132043fe94921d8', 'd0d3fa86ca7645ec9bd96af47e6df205', 'c262deb68d694b548263c9c244b21e8a'], true);
bleacon.startScanning();

// Store the beacons that are inside
var insideBeacons = [];
var beacons = {};
/**
 * Main process to monitor all beacons seen by
 * our device.
 */
bleacon.on('discover', function(beacon) {
    // Our UUID is composed by the uuid + major + minor
    var UUID = beacon.uuid + beacon.major.toString() + beacon.minor.toString();

    if(!beacons.hasOwnProperty(UUID)){
        beacons[UUID] = new Date();
    }

    if(UUID === 'b9407f30f5f8466eaff925556b57fe6d11'){
        if(beacons.last === beacon.proximity) return;
        console.log('UUID', UUID, beacon.proximity);
        beacons.last = beacon.proximity;
    }

    //We have actually checked in with the beacon, like a swipe.
    if (beacon.proximity == 'immediate') {
        // Emit event of a near beacon
        eventEmitter.emit('beaconCheckIn', {
            UUID: UUID,
            range: 'immediate'
        });
    } else if (beacon.proximity == 'near') {
        // Emit event of a near beacon
        eventEmitter.emit('beaconIsNear', {
            UUID: UUID,
            range: 'near'
        });
    } else if (beacon.proximity == 'far') {
//        console.log('beaconIsFar', UUID, beacon.proximity);
        // Emit event of a far beacon
        eventEmitter.emit('beaconIsFar', {
            UUID: UUID,
            range: 'far'
        });
    }
});

eventEmitter.on('beaconCheckIn', function(beacon){
    console.log('Check in');
    if(insideBeacons.length && isAlreadyInside(beacon)){
        return console.log('Beacon already registered');
    }
    // Start situation, nobody is connected
    // Add the beacon to the array of people that is inside
    insideBeacons.push(beacon.UUID);
    console.log('Currently we have ', insideBeacons);
    socket.emit('device.check-in', getPayload(beacon));
});

eventEmitter.on('beaconIsNear', function(beacon) {
    socket.emit('device.near', getPayload(beacon));
});

eventEmitter.on('beaconIsFar', function(beacon) {
    insideBeacons.forEach(function(insideBeacon) {
        if (insideBeacons !== beacon.UUID) return;
            var index = insideBeacons.indexOf(insideBeacon);
            if (index > -1) {
                beacons[beacon.UUID] = undefined;
                insideBeacons.splice(index, 1);
                console.log('Removing UUID', beacon.UUID);
                socket.emit('device.remove', getPayload(beacon));
            }
            console.log('Currently we have ', insideBeacons);
    });
});

function getPayload(beacon){
    return {
        id: SPACE_ID,
        uuid: beacon.UUID,
        range: beacon.range,
        services: SERVICES,
        space: SPACE_UUID,
        device: DEVICE_UUID
    };
}

/////////////////////////
/// Sockete stuff
/////////////////////////
socket = require('socket.io-client')('http://hyper-local.ngrok.io');
socket.on('connect', function(){
    console.log('connect', socket.id);
});

socket.on('event', function(data){
    console.log('event', data);
});

socket.on('disconnect', function(){
    console.log('disconnect');
});

/////////////////////////
/// Helper functions
/////////////////////////
// Check if a beacon is already inside
function isAlreadyInside(beacon) {
    var isIn = false;
    insideBeacons.forEach(function(insideBeacon) {
        // Check if it wasn't already in
        if (insideBeacon == beacon.UUID) {
            isIn = true;
        }
        return isIn;
    });
}

// Check the server response TODO something if err
function checkResponse(response) {
    if (response.code === 200) {
        console.log('Okay ', response.code);
    } else {
        console.log('There was an error: ', response.code);
    }
}
