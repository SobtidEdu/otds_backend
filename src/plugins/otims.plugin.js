const fp = require('fastify-plugin')
const querystring = require('querystring');
const axios = require('axios')
const moment = require('moment')

module.exports = fp(async (fastify, options) => {
  const { OTIMS_API_URL, OTIMS_TOKEN, OTIMS_USER } = fastify.env

  const instance = axios.create({
    baseURL: OTIMS_API_URL,
    headers: {'Authorization': OTIMS_TOKEN}
  });
  
  fastify.decorate('otimsApi', {
    getLessons: async (params = {}) => {
      const q = querystring.stringify(params)
      return instance.get(`/ws/master/lesson?${q}`)
      .then(response => response.data.map(lesson => ({
        code: lesson.id,
        name: lesson.name,
        noitems: lesson.noitems
      })))
    },

    getIndicators: async (params = {}) => {
      params.RequestedName = OTIMS_USER
      params.RequestedNo = `${OTIMS_USER}StrandIndicatorRequest${moment().format('YYYYMMDDHHmmSSS')}`
      params.ItemType = 'G'

      // let q = querystring.stringify(params)
      const indicators = await instance.get(`/ws/StrandIndicatorRequest`, { params })
      .then(response => response.data.Result.StrandList_ResponseStrandIndicator.StrandList.map(strand => ({
          name: strand.StrandFullname,
          code: strand.StrandCode,
          indicators: strand.IndicatorList_StrandList.IndicatorList.map(indicator => ({
            name: indicator.IndicatorFullname,
            code: indicator.IndicatorCode
          }))
        }))
      )

      params.RequestType = 1
      params.TestSetType = 'FI'
      params.FollowStrand = true
      params.ComplexityLevel = '1,2,3'
      params.FollowIndicator = true
      params.BankType = 'Public'

      for (let strandIndex in indicators) {
        for (let indicatorIndex in indicators[strandIndex].indicators) {
          const indicator = indicators[strandIndex].indicators[indicatorIndex]
          
          params.Strand = indicators[strandIndex].code
          params.Indicator = indicators[strandIndex].indicators[indicatorIndex].code

          q = querystring.stringify(params)
          indicator.noitems = await instance.get(`/ws/RequestItemsInquiry`, { params }).then(response => {
            const arrayNoQuestionType = response.data.ResponseItemInquiry.ResponseNoQuestionType_ResponseItemInquiry.ResponseNoQuestionType
            if (!arrayNoQuestionType[0]) return 0
            const indicators = arrayNoQuestionType[0].Indicator.split(';')
            return indicators.reduce((noitems, rawIndicator) => {
              console.log(rawIndicator)
              const item = rawIndicator.split(',') // indicatorName, questionType, noQuestions
              return parseInt(item[2]) + noitems
            }, 0)
          })
          indicators[strandIndex].indicators[indicatorIndex] = indicator
        }
      }
      return indicators
    },

    getCompetitions: async (params = {}) => {
      return instance.get(`/ws/master/competition-project`, { params })
      .then(response => response.data)
    },

    createExamset: async (params = {}) => {
      params.RequestedName = OTIMS_USER
      params.RequestedNo = `${OTIMS_USER}FixedRandomTestset${params.RequestType}${moment().format('YYYYMMDDHHmmSSS')}`

      // return params
      return instance.get(`/ws/RequestFixedRandomTestset`, { params })
      .then(response => response.data.map(lesson => ({
        code: lesson.id,
        name: lesson.name,
        noitems: lesson.noitems
      })))
    }
  })
})