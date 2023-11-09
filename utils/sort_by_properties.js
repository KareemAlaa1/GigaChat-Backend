sortByProperties = (array, sortProperties) => {
  return array.sort((a, b) => {
    for (const prop of sortProperties) {
      const propA = a[prop];
      const propB = b[prop];

      if (propA < propB) return -1;
      if (propA > propB) return 1;
    }
    return 0;
  });
};

module.exports = sortByProperties;
