export default function (obj: { [key: string]: any }, keys: string[]) {
  if (typeof obj !== 'object' || !Array.isArray(keys)) {
    return obj;
  }
  const cloneObj = { ...obj };
  Object.keys(cloneObj).forEach((key) => {
    if (keys.includes(key)) {
      delete cloneObj[key];
    }
  });
  return cloneObj;
}
