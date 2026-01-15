getPagingData = async (totalCount, data, page, limit) => {
    console.log({ totalCount, data, page, limit });
    const totalItems = totalCount;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
    // console.log({ totalItems, data, totalPages, currentPage });
    return { totalItems, data, totalPages, currentPage };
  };
  
  getPagination = async (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? (page - 1) * limit : 0;
    // console.log({ limit, offset });
    return { limit, offset };
  };
  
  module.exports = {
    getPagination,
    getPagingData,
  };
  