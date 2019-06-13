const fp = require('fastify-plugin')

module.exports = fp(async (fastify, options, next) => {
  const { DEFAULT_PAGE_NO, DEFAULT_PAGE_LIMIT,DEFAULT_SORT_KEY } = fastify.config.PAGINATION
  
  fastify.decorate('paginate', async (mongooseModel, paginateOptions) => {
    const page = paginateOptions.page || DEFAULT_PAGE_NO
    const limit = paginateOptions.limit || DEFAULT_PAGE_LIMIT
    const filters = {}
    const sortKey = paginateOptions.sort ? Object.keys(paginateOptions.sort)[0] : DEFAULT_SORT_KEY
    const sortMethod = paginateOptions.sort ? paginateOptions.sort[sortKey] : 'desc'
    const sort = {
      [sortKey]: sortMethod
    }

    if (paginateOptions.filters) {
      for (let prop in paginateOptions.filters) {
        if (typeof paginateOptions.filters[prop] === 'string') {
          filters[prop] = new RegExp(paginateOptions.filters[prop], 'i')
        } else {
          filters[prop] = paginateOptions.filters[prop]
        }
      }
    }
    
    const skip = (page-1) * limit
    
    const [items, count] = await Promise.all([
      mongooseModel.find(filters).limit(limit).skip(skip).sort(sort),
      mongooseModel.count(filters)
    ])

    return { 
      page,
      lastPage: Math.ceil(count / limit),
      totalCount: count,
      items
    }
  })
})