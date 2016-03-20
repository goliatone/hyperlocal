/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var socket;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    register: function(){
        console.log('Register device with uuid', 'b9407f30f5f8466eaff925556b57fe6d11');
        var url = 'http://hyperlocal.ngrok.io';
        socket = io.connect(url, {
    		transports: [
    			'polling',
    			'websocket',
    			'htmlfile',
    			'xhr-polling',
    			'jsonp-polling'
    		]
    	});

        socket.on('connect', function() {
            console.log('We are connected');
            socket.emit('device.register', {
                uuid: 'b9407f30f5f8466eaff925556b57fe6d11'
            });
        });

        socket.on('service.found', function(data){
            console.log('service.found', data);
            app.showService(data.url);
        });

        socket.on('service.exited', function(data){
            app.webview.hide();
        });

        socket.on('error', function(e){
            console.error('Sockete error', e);
        });

        socket.connect();
    },
    makeBeacon: function(){
        estimote.beacons.requestWhenInUseAuthorization(function(){
            console.log('Yup!');
        }, function(e){
            console.error('requestWhenInUseAuthorization', e);
        });

        estimote.beacons.startAdvertisingAsBeacon(
            'B9407F30-F5F8-466E-AFF9-25556B57FE6D', // UUID
            1, // Major
            1, // Minor
            'MyRegion', // Region name (not visible?)
            function(result) {
                console.log('Beacon started') },
            function(errorMessage) {
                console.log('Error starting beacon: ' + errorMessage) });
    },
    showService: function(url){
        app.webview = cordova.EbWebview.open(0, encodeURI(url), 'left=0,top=0,width=420,height=800');
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('On Device Ready')
        app.register();
        app.makeBeacon();
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();



/*
//com.unarin.cordova.beacon

var uuid = '00000000-0000-0000-0000-000000000000';
var identifier = 'advertisedBeacon';
var minor = 333;
var major = 9;
var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

/*
 * Request iBeacon permissions
 * For iOS 8 or higher
 * /
cordova.plugins.locationManager.requestWhenInUseAuthorization();
// cordova.plugins.locationManager.requestAlwaysAuthorization();

// The Delegate is optional
var delegate = new cordova.plugins.locationManager.Delegate();

// Event when advertising starts (there may be a short delay after the request)
// The property 'region' provides details of the broadcasting Beacon
delegate.peripheralManagerDidStartAdvertising = function(pluginResult) {
    console.log('peripheralManagerDidStartAdvertising: '+ JSON.stringify(pluginResult.region));
};
// Event when bluetooth transmission state changes
// If 'state' is not set to BluetoothManagerStatePoweredOn when advertising cannot start
delegate.peripheralManagerDidUpdateState = function(pluginResult) {
    console.log('peripheralManagerDidUpdateState: '+ pluginResult.state);
};

cordova.plugins.locationManager.setDelegate(delegate);

// Verify the platform supports transmitting as a beacon
cordova.plugins.locationManager.isAdvertisingAvailable()
    .then(function(isSupported){
        if (isSupported) {
            cordova.plugins.locationManager.startAdvertising(beaconRegion)
                .fail(function(e){
                    console.log('KAKA:startAdvertising fucked up');
                    console.error(arguments);
                })
                .done();
            console.log('we are here, yo!');
        } else {
            console.log('Advertising not supported');
        }
    })
    .fail(function(e){
        console.log('KAKA:isAdvertisingAvailable fucked up');
        console.error(arguments);
    });
    .done();
*/
