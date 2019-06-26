const fp = require('fastify-plugin')
const { PAGINATION_DEFAULT } = require('@config/pagination.config')

module.exports = fp(async (fastify, options, next) => {
  const { PAGE_NO, PAGE_LIMIT,SORT_KEY } = PAGINATION_DEFAULT
  
  fastify.decorate('paginate', async (mongooseModel, paginateOptions, aggregateBaseOptions = []) => {
    const page = paginateOptions.page*1 || PAGE_NO
    const limit = paginateOptions.limit*1 || PAGE_LIMIT
    const sortKey = paginateOptions.sort ? Object.keys(paginateOptions.sort)[0] : SORT_KEY
    const sortMethod = paginateOptions.sort ? paginateOptions.sort[sortKey] : 'desc'
    const sort = {
      [sortKey]: sortMethod
    }

    aggregateBaseOptions['$match'] = aggregateBaseOptions['$match'] || {}

    if (paginateOptions.filters) {
      for (let prop in paginateOptions.filters) {
        if (typeof paginateOptions.filters[prop] === 'string') {
          aggregateBaseOptions['$match'][prop] = new RegExp(paginateOptions.filters[prop], 'i')
        } else {
          aggregateBaseOptions['$match'][prop] = paginateOptions.filters[prop]
        }
      }
    }

    const skip = (page-1) * limit

    const [items, total] = await Promise.all([
      mongooseModel.aggregate(aggregateBaseOptions).limit(limit+skip).skip(skip).sort(sort),
      mongooseModel.aggregate(aggregateBaseOptions).count("count")
    ])
    
    const count = total.length > 0 ? total[0].count : 0

    return { 
      page,
      lastPage: Math.ceil(count / limit),
      totalCount: count,
      items
    }
  })
})