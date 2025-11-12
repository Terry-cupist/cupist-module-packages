import AsyncStorage from "@react-native-async-storage/async-storage";

export const getStoredNumber = async (key: string) =>
  AsyncStorage.getItem(key).then((value) => {
    if (value == null) {
      return undefined;
    }
    return Number(value);
  });
export const setStoredNumber = async (key: string, value: number) =>
  AsyncStorage.setItem(key, value.toString());

export const getStoredString = async (key: string) =>
  AsyncStorage.getItem(key).then((value) => {
    if (value === null) {
      return "";
    }
    return value;
  });

export const setStoredString = async (key: string, value: string) =>
  AsyncStorage.setItem(key, value);

export const getStoredBoolean = (key: string) =>
  AsyncStorage.getItem(key).then((value) => {
    if (value === null || value === undefined || value === "false") {
      return false;
    }
    return true;
  });

export const setStoredBoolean = async (key: string, value: boolean) =>
  AsyncStorage.setItem(key, value.toString());

export const getStoredObject = async <T>(key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      return JSON.parse(value) as T;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
};

export const setStoredObject = async (key: string, value: any) =>
  AsyncStorage.setItem(key, JSON.stringify(value));

export const hasStoredObject = async <T>(key: string, value: any) =>
  getStoredObject<T>(key).then((obj) => {
    return Array.isArray(obj)
      ? obj.includes(value)
      : Object.keys(obj ?? {}) === value;
  });

export const removeStored = async (key: string) => AsyncStorage.removeItem(key);

export const removeMultipleStored = async (keys: string[]) =>
  AsyncStorage.multiRemove(keys);

export const removeAllStored = async () => AsyncStorage.clear();

const ARRAY_MAX_LENGTH = 100;
export const getStoredArray = async <T>(key: string): Promise<T[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    return [];
  }
};

// 깊은 비교를 위한 유틸리티 함수
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  if (typeof a !== "object") return a === b;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
};

export const storeArray = async <T>(
  key: string,
  newItem: T,
  itemValidator?: (item: T) => boolean,
): Promise<void> => {
  const currentArray = await getStoredArray<T>(key);

  const existingIndex = currentArray.findIndex(
    itemValidator ?? ((item) => deepEqual(item, newItem)),
  );
  if (existingIndex > -1) {
    currentArray.splice(existingIndex, 1);
  }

  currentArray.push(newItem);

  if (currentArray.length > ARRAY_MAX_LENGTH) {
    currentArray.shift();
  }

  const jsonValue = JSON.stringify(currentArray);
  await AsyncStorage.setItem(key, jsonValue);
};

const enqueue = async <T extends any>(
  key: string,
  data: T,
): Promise<number | undefined> => {
  try {
    const queue = await AsyncStorage.getItem(key);
    const parsedQueue = queue ? JSON.parse(queue) : [];

    parsedQueue.push(data);

    await AsyncStorage.setItem(key, JSON.stringify(parsedQueue));

    return parsedQueue.length;
  } catch (error) {
    console.error("Failed to enqueue data:", error);
  }
};

const dequeue = async (key: string) => {
  try {
    const queue = await AsyncStorage.getItem(key);
    const parsedQueue = queue ? JSON.parse(queue) : [];

    const data = parsedQueue.shift();

    await AsyncStorage.setItem(key, JSON.stringify(parsedQueue));

    return data;
  } catch (error) {
    console.error("Failed to dequeue data:", error);
    return null;
  }
};

const dequeueBatch = async (key: string, count: number, startIndex = 0) => {
  try {
    const queue = await AsyncStorage.getItem(key);
    const parsedQueue = queue ? JSON.parse(queue) : [];

    const itemsToRemove = parsedQueue.slice(startIndex, startIndex + count);
    parsedQueue.splice(startIndex, count);

    await AsyncStorage.setItem(key, JSON.stringify(parsedQueue));
    return itemsToRemove;
  } catch (error) {
    console.error("Failed to dequeue batch:", error);
    return [];
  }
};

export const localStorageQueue = {
  enqueue,
  dequeue,
  dequeueBatch,
  peek: async (key: string) => {
    try {
      const queue = await AsyncStorage.getItem(key);
      const parsedQueue = queue ? JSON.parse(queue) : [];

      return parsedQueue.length > 0 ? parsedQueue[0] : null;
    } catch (error) {
      console.error("Failed to peek queue:", error);
      return null;
    }
  },
  getItems: async (key: string, count: number = 1) => {
    try {
      const queue = await AsyncStorage.getItem(key);
      const parsedQueue = queue ? JSON.parse(queue) : [];

      return parsedQueue.slice(0, count);
    } catch (error) {
      console.error("Failed to get items:", error);
      return [];
    }
  },
  getAll: async (key: string) => {
    const queue = await AsyncStorage.getItem(key);
    return queue ? JSON.parse(queue) : [];
  },
  getSize: async (key: string) => {
    const queue = await AsyncStorage.getItem(key);
    const parsedQueue = queue ? JSON.parse(queue) : [];
    return parsedQueue.length;
  },
};
