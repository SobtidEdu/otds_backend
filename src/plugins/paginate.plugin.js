const fp = require('fastify-plugin')
const { PAGINATION_DEFAULT } = require('@config/pagination')

module.exports = fp(async (fastify, options, next) => {
  const { PAGE_NO, PAGE_LIMIT,SORT_KEY } = PAGINATION_DEFAULT
  
  fastify.decorate('paginate', async (mongooseModel, paginateOptions, aggregateBaseOptions = []) => {
    const page = paginateOptions.page*1 || PAGE_NO
    const limit = paginateOptions.limit*1 || PAGE_LIMIT
    const sort = paginateOptions.sort || { [SORT_KEY]: 'desc' }
    
    indexOfMatchOption = aggregateBaseOptions.findIndex(option => option['$match'] !== undefined )

    if (paginateOptions.filters && Object.keys(paginateOptions.filters).length > 0) {
      let filterOption = { $match: { $and: [] } }
      for (let prop in paginateOptions.filters) {
        if (paginateOptions.filters[prop] !== '') {
          console.log(paginateOptions.filters[prop])
          filterOption['$match']['$and'].push({[prop]: new RegExp(`^${fastify.utils.addSlashes(paginateOptions.filters[prop])}`, 'i') })
        }
      }
      if (filterOption['$match']['$and'].length > 0) {
        aggregateBaseOptions.push(filterOption)
      }
    }
    

    
    if (paginateOptions.search && Object.keys(paginateOptions.search).length > 0) {
      let searchOption = { $match: { $or: [] } }
      for (let prop in paginateOptions.search) {
        if (paginateOptions.search[prop] !== '') {
          searchOption['$match']['$or'].push({[prop]: new RegExp(`^${fastify.utils.addSlashes(paginateOptions.search[prop])}`, 'i') })
        }
      }

      if (searchOption['$match']['$or'].length > 0) {
        aggregateBaseOptions.push(searchOption)
      }
    }

    const skip = (page-1) * limit

    const [items, total] = await Promise.all([
      mongooseModel.aggregate(aggregateBaseOptions).sort(sort).limit(limit+skip).skip(skip).collation({ locale: "th" }),
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