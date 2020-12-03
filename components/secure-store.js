import * as SecureStore from 'expo-secure-store';

const read = async () => {
  try {
    const credentials = await SecureStore.getItemAsync('credentials');
    // console.log('value of credentials: ', credentials);
    if (credentials) {
        const myJson = JSON.parse(credentials);
        return ({
            email: myJson.email,
            password: myJson.password,
        });
    } 
  } catch (e) {
    console.log(e);
  }
};

const remember = async (email, password) => {
  const credentials = { email, password };
  try {
    await SecureStore.setItemAsync(
      'credentials',
      JSON.stringify(credentials)
    );
    // this.setState({ email: '', password: '' });
    console.log('Credentials saved and encripted on device memory.')
  } catch (e) {
    console.log(e);
  }
};

const clear = async () => {
  try {
    await SecureStore.deleteItemAsync('credentials');
    return({ email: '', password: ''});
  } catch (e) {
    console.log(e);
  }
};

const setAccess = async (option) => {
  try {
    await SecureStore.setItemAsync('access', JSON.stringify(option));
  } catch (e) {
    console.log(e);
  }
}

const checkAccess = async () => {
  try {
    const access = await SecureStore.getItemAsync('access');
    console.log('Access', access);
    if (access) {
        const myJson = JSON.parse(access);
        return myJson;
    } 
  } catch (e) {
    console.log(e);
  }
}

export { read, remember, clear, setAccess, checkAccess };