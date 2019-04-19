module.exports = async (fastifiy, options) => {
  fastifiy.get('/', async (request, response) => {
    return { name: 'nut' }
  })
}