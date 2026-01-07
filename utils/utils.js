const dataParse = (data) => {
  return data ? JSON.parse(JSON.stringify(data)) : data;
};
module.exports = { dataParse };
