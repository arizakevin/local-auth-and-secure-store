import * as LocalAuthentication from 'expo-local-authentication';

const checkDeviceForHardware = async () => {
  let compatible = await LocalAuthentication.hasHardwareAsync();
  // this.setState({ compatible });
  return compatible;
};

const checkSupportedAuthTypes = async () => {
  let array = await LocalAuthentication.supportedAuthenticationTypesAsync();
  // this.setState({ types: JSON.stringify(array) });
  console.log('Supported types:', array);
  return array;
}

const checkForFingerprints = async () => {
  let fingerprints = await LocalAuthentication.isEnrolledAsync();
  // this.setState({ fingerprints });
  return fingerprints;
};

const scanFingerprint = async (types) => {
  let result = await LocalAuthentication.authenticateAsync(
    {
      'promptMessage': types[0] === 1 ? 'Scan your finger.' : 'Type your device password.',
    }
  );
  console.log('Scan Result:', result);
  // this.setState({
  //   result: JSON.stringify(result),
  // });
  return JSON.stringify(result);
};

export { checkDeviceForHardware, checkSupportedAuthTypes, checkForFingerprints, scanFingerprint };