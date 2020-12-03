import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Platform, Alert } from 'react-native';
import { read, remember, clear, setAccess, checkAccess } from './components/secure-store';
import { checkDeviceForHardware, checkSupportedAuthTypes,
  checkForFingerprints, scanFingerprint } from './components/local-auth';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [scan, setScan] = useState(false);
  const [accessToData, setAccessToData] = useState('granted');

  const [compatible, setCompatible] = useState(false);
  const [types, setTypes] = useState([]);
  const [fingerprints, setFingerprints] = useState(false);
  const [result, setResult] = useState('');

  const setData = async () => {
    let access = await checkAccess();
    if (access !== 'denied') {
      setAccess('granted');
      let credentials = await read();
      if (credentials) {
        setEmail(credentials.email);
        // setPassword(credentials.password);
        setScan(true);
      }
      setCompatible(await checkDeviceForHardware());
      setTypes(await checkSupportedAuthTypes());
      setFingerprints(await checkForFingerprints());
    } else {
      setAccessToData(access);
    }
  }

  const compareData = async () => {
    if (accessToData === 'granted') {
      let credentials = await read();
      if (credentials) {
        let same = credentials.email === email;
        setScan(same);
      }
    } else {
      setScan(false);
    }
  }

  useEffect(() => {
    setData();
  }, []);

  useEffect(() => {
    console.log('Email: ', email);
    compareData();
  }, [email]);

  useEffect(() => {
    console.log('Password: ', password);
  }, [password]);

  useEffect(() => {
    console.log('Compatible: ', compatible);
  }, [compatible]);

  useEffect(() => {
    console.log('Types: ', types);
  }, [types]);

  useEffect(() => {
    console.log('Fingerprints: ', fingerprints);
  }, [fingerprints]);

  useEffect(() => {
    console.log('Result: ', result);
  }, [result]);

  const showAndroidAlert = () => {
    Alert.alert(
      types[0] === 1 ? 'Fingerprint Scan' : 'Password',
      types[0] === 1 ?
        'Place your finger over the touch sensor and press scan.'
      : 'Type your device password',
      [
        {
          text: types[0] === 1 ? 'Scan' : 'Type',
          onPress: async () => {
            let result = await scanFingerprint(types);
            if (result) {
              console.log(' ');
              console.log('Positive result.');
              let reading = await read();
              console.log(reading);
              if (reading) {
                setEmail(reading.email);
                setPassword(reading.password);

                console.log('Succesfuly Logged In!');
                Alert.alert(
                  "Successfully retrieved encrypted credentials from the device.",
                  `Logged as ${reading.email} with password: ${reading.password}.` ,
                  [
                      {text: "Ok",
                      }
                  ]
                );
              }
            }
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={email}
        // defaultValue={email}
        onChangeText={email => setEmail(email)}
        placeholder="email"
        style={{
          height: 40,
          width: '80%',
          borderColor: 'gray',
          borderWidth: 1,
          paddingLeft: 10,
        }}
      />

      <TextInput
        value={password}
        onChangeText={password => setPassword(password)}
        placeholder="password"
        style={{
          height: 40,
          width: '80%',
          borderColor: 'gray',
          borderWidth: 1,
          paddingLeft: 10,
          marginVertical: 10,
        }}
      />
      <View style={styles.space} />
      
      {
        accessToData === 'granted' &&
          <>
            <Button title="Remember (Login)"
              onPress={async () => {
                  if (email !== '' && password !== '') {
                    let reading = await read();
                    console.log(reading);
                    if (reading) {
                      if (reading.email !== email || reading.password !== password) {
                        Alert.alert(
                          null,
                          "There is already some credentials saved. Would you like to overwrite then?",
                          [
                              {text: "Yes", onPress: async () => {
                                  await remember(email, password);
                                }
                              },
                              {text: "No", onPress: () => {
                                    console.log('Logged in but credentials were not saved.')
                                }
                              }
                          ]
                        );
                      } else {
                        Alert.alert(
                          null,
                          "Successfully Logged In.",
                          [
                              {text: "Ok",
                              }
                          ]
                        );
                      }
                    } else {
                      Alert.alert(
                        null,
                        "Would you like to save your credentials so you can start with your password/fingerprint next time?",
                        [
                            {text: "Yes", onPress: async () => {
                                await remember(email, password);
                              }
                            },
                            {text: "Never", onPress: async () => {
                                // Saving access state on device
                                await setAccess('denied');
                                // Updating access state
                                setAccessToData('denied');
                              }
                            }
                        ]
                      );
                    }
                  } else {
                    Alert.alert(
                      "Alert",
                      "Type your credentials.",
                      [
                          {text: "OK"
                          }
                      ]
                    );
                    console.log('Type your credentials.');
                  }
                }
              }
            />
            <View style={styles.space} />

            <Button title="clear credentials"
              style={styles.button}
              onPress={async () => {
                  await clear();
                  let reading = await read();
                  console.log(reading);
                  if (reading === undefined) {
                    setEmail('')
                    setPassword('');
                    setScan(false);
                  }
                }
              }
            />
            <View style={styles.space} />

            <Button title="read credentials"
              onPress={async () => {
                  let reading = await read();
                  console.log(reading);
                  if (reading) {
                    setEmail(reading.email)
                    setPassword(reading.password);
                  }
                }
              }
            />
            <View style={styles.space} />
          </>
      }

      {
        scan &&
          <>
            <Button
              title="Scan Fingerprints"
              onPress={
                Platform.OS === 'android'
                  ? showAndroidAlert
                  : scanFingerprint
              }
            />
            <View style={styles.space} />
          </>
      }

      {
        accessToData === 'denied' &&
          <>
            <Button
              title="Activate Easy Login"
              onPress={async () => {
                  // Saving access state on device
                  await setAccess('granted');
                  // Updating access state
                  setAccessToData('granted');
                } 
              }
            />
            <View style={styles.space} />
          </>
      }

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 60,
    backgroundColor: '#056ecf',
    borderRadius: 5,
  },
  space: {
    marginTop: 20,
  },
});


//   render() {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.text}>
//           Compatible Device? {this.state.compatible === true ? 'True' : 'False'}
//         </Text>
//         <Text style={styles.text}>
//           Fingerprings Saved?{' '}
//           {this.state.fingerprints === true ? 'True' : 'False'}
//         </Text>
//         <Text style={styles.text}>
//           Supported Types:{' '}
//           {
//             this.state.types[0] === 1 ?
//               'Fingerprint'
//             :
//               'Device password'
//           }32
//         </Text>
//         <TouchableOpacity
//           onPress={
//             Platform.OS === 'android'
//               ? this.showAndroidAlert
//               : this.scanFingerprint
//           }
//           style={styles.button}>
//           <Text style={styles.buttonText}>{this.state.types[0] === 1 ? 'SCAN' : 'PASSWORD'}</Text>
//         </TouchableOpacity>
//         <Text>{this.state.result}</Text>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'space-around',
//     backgroundColor: '#ecf0f1',
//   },
//   text: {
//     fontSize: 18,
//     textAlign: 'center',
//   },
//   button: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 200,
//     height: 60,
//     backgroundColor: '#056ecf',
//     borderRadius: 5,
//   },
//   buttonText: {
//     fontSize: 30,
//     color: '#fff',
//   },
// });
