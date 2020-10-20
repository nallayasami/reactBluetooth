/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import { BleHandler } from './BleHandler'
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import PushNotification from "react-native-push-notification";

import BackgroundService from 'react-native-background-actions';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.handler = new BleHandler();

    this.state = {
      devices: {},
    }

    this.startScan = this.startScan.bind(this);
    this.connect = this.connect.bind(this);
    this.stopScan = this.stopScan.bind(this);
    this.notify = this.notify.bind(this);

    this.createList = this.createList.bind(this);
  }
  async componentDidMount() {
    PushNotification.configure({
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    const veryIntensiveTask = async (taskDataArguments) => {
      // Example of an infinite loop task
      const { delay } = taskDataArguments;
      await new Promise(async (resolve) => {
        for (let i = 0; BackgroundService.isRunning(); i++) {
          console.log(i);
          await sleep(delay);
        }
      });
    };

    const options = {
      taskName: 'Example',
      taskTitle: 'ExampleTask title',
      taskDesc: 'ExampleTask description',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#ff00ff',
      linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
      parameters: {
        delay: 1000,
      },
    };


    await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.updateNotification({ taskDesc: 'New ExampleTask description' }); // Only Android, iOS will ignore this call
    // iOS will also run everything here in the background until .stop() is called
    // await BackgroundService.stop();
  }

  async componentWillUnmount() {
    // await BackgroundService.stop();
  }
  startRefresh() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      // console.log(this.state.devices);
      // if (Object.keys(this.state.devices).length > 0) {
      this.forceUpdate();
      // }
    }, 1000);
  }
  render() {
    return (
      <>
        <View style={styles.body}>
          <View style={styles.sectionContainer}>
            {/* <Button title="Notify" onPress={() => this.notify('test')}></Button> */}

            <Button title="start scan" onPress={this.startScan}></Button>
            <Text></Text>
            <Button title="Stop Scan" onPress={this.stopScan}></Button>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

            {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> */}
            {this.createList()}

          </View>
        </View>

      </>
    );
  }
  createList() {
    return Object.keys(this.state.devices).map(r => {
      return [<Button key={r} title={this.state.devices[r]} onPress={() => this.connect(r)}></Button>,
      <View style={styles.separator} key={this.state.devices[r]} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" ></View>]
    });
  }
  startScan() {
    console.log('test with handler ble');
    this.state.devices = {};
    // this.handler.stopScan();
    this.startRefresh();
    this.handler.startScan(this.state.devices);
  }
  connect(deviceId: DeviceId) {
    console.log('connect to device: ', deviceId);
    clearInterval(this.interval);
    this.handler.connect(deviceId, this.notify);
    // this.stopScan();
  }
  stopScan() {
    console.log('stop handler scan');
    this.testPush();
    this.handler.stopScan();
    clearInterval(this.interval);
  }
  notify(response) {
    // console.log('notify');
    PushNotification.localNotification({
      title: "Notfication from BLE",
      message: "Value from BLE: " + response,
    });

    // PushNotification.localNotificationSchedule({
    //   //... You can use all the options from localNotifications
    //   message: "My Notification Message", // (required)
    //   date: new Date(Date.now() + 1 * 1000), // in 60 secs
    //   allowWhileIdle: false, // (optional) set notification to work while on doze, default: false
    // });

  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

  // export default App;
