'use strict'

const fastify = require('../../server')

const url = '/api/auth/login'

describe('server test', () => {
  afterAll(() => {
    fastify.close()
  })
  
  test('Successful login /', async (done) => {
    const response = await fastify.inject({
      method: 'POST',
      url,
      payload: {
        email: 'nuttasak@sobtid.me',
        password: 'nuttasak9737'
      }
    })
    done()
    expect(response.statusCode).toBe(200),
    expect(response.payload).toMatcObject({
      username: 'nuttasak@sobtid.me'
    })
    
  })
})
