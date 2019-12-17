const fp = require('fastify-plugin')
const { PAGINATION_DEFAULT } = require('@config/pagination')

module.exports = fp(async (fastify, options, next) => {
  const { PAGE_NO, PAGE_LIMIT,SORT_KEY } = PAGINATION_DEFAULT
  
  fastify.decorate('paginate', async (mongooseModel, paginateOptions, aggregateBaseOptions = []) => {
    const page = paginateOptions.page*1 || PAGE_NO
    const limit = paginateOptions.limit*1 || PAGE_LIMIT
    const sort = paginateOptions.sort || { [SORT_KEY]: 'desc' }
    
    indexOfMatchOption = aggregateBaseOptions.findIndex(option => option['$match'] !== undefined )
    let matchOption = { $match: {} }
    // if (indexOfMatchOption > -1) {
    //   matchOption = aggregateBaseOptions[indexOfMatchOption]
    //   aggregateBaseOptions.splice(indexOfMatchOption, 1)
    // }

    if (paginateOptions.filters) {
      for (let prop in paginateOptions.filters) {
        matchOption['$match'][prop] = new RegExp(`^${paginateOptions.filters[prop]}$`, 'i')
      }
    }

    aggregateBaseOptions.push(matchOption)

    // console.log(aggregateBaseOptions)

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