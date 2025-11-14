import AsyncStorage from "@react-native-async-storage/async-storage";

const DB = {
  storeData: async (key: string, value: any) => {
    const jsonData = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonData);
    return true;
  },

  async multiGet(keys: any) {
    const data = await AsyncStorage.multiGet(keys);

    return data.map((d: any) => JSON.parse(d[1] as any));
  },

  retrieveString: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);

      return value;
    } catch (error) {
      return false;
    }
  },

  retrieveData: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return JSON.parse(value as any);
    } catch (error) {
      return false;
    }
  },
  async multiSet(keyValuePair: any) {
    try {
      const data = Object.keys(keyValuePair).map((key) => [
        key,
        JSON.stringify(keyValuePair[key]),
      ]);
      await AsyncStorage.multiSet(data as any);
      return true;
    } catch (error) {
      return false;
    }
  },

  async remove(key: string) {
    await AsyncStorage.removeItem(key);
    return true;
  },
};

export default DB;
