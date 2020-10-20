import { PermissionsAndroid } from 'react-native';
import { BleManager, Device, DeviceId, Service, Subscription } from 'react-native-ble-plx';

import { decode, encode } from 'base-64';

export default class BleHandler {
    
    constructor() {
        this.manager = new BleManager();
        this.connect = this.connect.bind(this);
    }
   
    startScan(devices) {
        this.subscription = this.manager.onStateChange((state) => {
            console.log('state change', state);
            if (state === 'PoweredOn') {
                this.scan(devices);
                // this.subscription.remove();
                // this.destroy();
            }
        }, true);
    }
    scan(devices) {
        const permission = this.requestLocationPermission();
        // console.log('permission', permission);
        console.log('Scan started');
        if (permission)
            this.manager.startDeviceScan(null, null, (error, device) => {
                if (error) {
                    console.log('error:', error);
                    return
                }
                // console.log('device: ', device);

                if (!devices[device.id] && device?.name) {
                    // console.log('adding new device : ', device?.id, ' :- ', device.name);
                    devices[device.id] = device.name;
                }
            });
    }
    // scanAndConnect() {
    //     const permission = this.requestLocationPermission();
    //     // console.log('permission', permission);
    //     console.log('Scan started');
    //     if (permission)
    //         this.manager.startDeviceScan(null, null, (error, device) => {
    //             if (error) {
    //                 console.log('error:', error);
    //                 return
    //             }
    //             // console.log('device: ', device);

    //             if (!devices[device.id]) {
    //                 // console.log('adding new device : ', device?.id, ' :- ', device.name);
    //                 devices[device.id] = device;
    //                 // if ('57:D7:FC:BB:34:94' == device.id)
    //                 if (device.name == 'LAPTOP-I13J6P8A')
    //                     this.connect(device);

    //                 // console.log('new Device added', Object.keys(devices));
    //             }
    //             // Check if it is a device you are looking for based on advertisement data
    //             // or other criteria.
    //             // if (device.name === 'TI BLE Sensor Tag' ||r
    //             //     device.name === 'SensorTag') {

    //             // Stop scanning as it's not necessary if you are scanning for one device.
    //             // this.manager.stopDeviceScan();

    //             // Proceed with connection.
    //             // }
    //         });
    // }

    connect(id) {
        this.manager.connectToDevice(id, {autoConnect: true})
            .then(device => {
                console.log('device connected: ', device.id, '-', device.isConnected());
                return device.discoverAllServicesAndCharacteristics();
            })
            .then(d => {
                console.log('check Services');
                return d.services();
            })
            .then(services => {
                console.log('services available:');
                services.forEach(service => {
                    // console.log('service :', service.uuid);
                    // if ('0000180f-0000-1000-8000-00805f9b34fb'==service.uuid){
                    // console.log('battery service')
                    this.invokeService(service);
                    // }
                })
            })
            // device.connect()
            //     .then((device) => {
            //         console.log('device connected: ', device);
            //         return device.discoverAllServicesAndCharacteristics();
            //     })
            //     .then((device) => {
            //         console.log('service connected: ', device);
            //         // Do work on device with services and characteristics
            //     })
            .catch((error) => {
                console.log('error: ', error,'-', id);
                // Handle errors
            });
    }

    invokeService(service) {

        service.characteristics()
            .then(c => {
                c.forEach(char => {
                    // console.log('readable', char.uuid, char.value, char.isReadable, char.isNotifiable, char.isWritableWithResponse);
                    // if (char.isReadable)

                    // service.readCharacteristic(char.uuid)
                    //     .then(v => {
                    //         console.log('value', v.value);
                    //     }).catch(e => {});

                    char.read()
                        .then(v => {
                            console.log('read value : ', v.value, '-', this.base16(decode(v.value)), '-', decode(v.value), ' - ', v.uuid);
                            // if('iPhone' == decode(v.value) ){
                            //     console.log(dev);
                            // }
                        })
                        .catch(e => {
                            console.log('error', e);
                        });
                    char.monitor((error, characteristic) => {
                        if (!error) {
                            // Notification.show();
                           
                            console.log('characteristic ', this.base16(decode(characteristic?.value)), decode(characteristic?.value));
                        } else {
                            if(error.message.endsWith('was disconnected')){
                                // this.manager.connectToDevice
                                console.log('error monitor: ', error, service.deviceID, error.message.endsWith('was disconnected'));
                                // this.connect(service.deviceID);
                            }
                        }
                    });
                    // if (char.isWritableWithoutResponse)
                    //     char.writeWithoutResponse(btoa('hello'))
                    //         .then(c => {
                    //             console.log('write', c)
                    //         })
                    //         .catch(e => {
                    //             console.log('error', e)
                    //         });
                });
            })

    }
    base16(input) {
        return input.split('')
            .map(function (aChar) {
                return ('0' + aChar.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
            .toUpperCase()
    }

    async requestLocationPermission() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
                title: 'Location permission for bluetooth scanning',
                message: 'wahtever',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                // console.log('Location permission for bluetooth scanning granted');
                return true;
            } else {
                console.log('Location permission for bluetooth scanning revoked');
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    stopScan() {
        // console.log('Scan stoped');
        this.manager.stopDeviceScan();
    }

    unsubscribe() {
        this.subscription.remove();
    }
    destroy() {
        this.manager.destroy();
    }
}