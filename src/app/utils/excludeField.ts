const excludeField = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const clone = { ...obj };

  keys.forEach((key) => {
    delete clone[key];
  });

  return clone;
};

export default excludeField;