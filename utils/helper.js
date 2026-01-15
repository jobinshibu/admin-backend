function getOffset(currentPage = 1, listPerPage = 10) {
  return parseInt((currentPage - 1) * listPerPage);
}

module.exports = { getOffset };
