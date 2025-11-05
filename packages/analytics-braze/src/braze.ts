import Braze from "@braze/react-native-sdk";
export * from "@braze/react-native-sdk";
export default Braze;

export const getBrazeUserId = () => {
  return new Promise((res, rej) => {
    Braze.getUserId((error, result) => {
      if (error) {
        rej(error);
        return;
      }
      res(result);
    });
  });
};
