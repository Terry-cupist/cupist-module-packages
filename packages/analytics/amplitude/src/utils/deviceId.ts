import * as Application from "expo-application";
import * as ExpoTrackingTransparency from "expo-tracking-transparency";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

// NOTE: android의 경우 ADID(aka GAID, AIFA)를 사용하고, ios의 경우 IDFV를 사용한다.
export const getDeviceId = async (): Promise<string | null> => {
  if (Platform.OS === "android") {
    try {
      const adid = await ExpoTrackingTransparency.getAdvertisingId();
      if (adid) {
        return adid;
      }
    } catch (error) {
      // do nothing
    }
    return null;
  }

  if (Platform.OS === "ios") {
    try {
      const idfv = await Application.getIosIdForVendorAsync();
      if (idfv) {
        return idfv;
      }
    } catch (error) {
      // do nothing
    }
  }

  const deviceID = await DeviceInfo.getUniqueId();
  return deviceID;
};
