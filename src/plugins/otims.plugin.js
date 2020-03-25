const fp = require('fastify-plugin')
const querystring = require('querystring');
const axios = require('axios')
const moment = require('moment')

const formUrlEncoded = data =>  {
  let items = []
  for (let key in data) {
    if (typeof data[key] === 'string') items.push(`${key}=${encodeURIComponent(data[key])}`)
    else if (Array.isArray(data[key])) {
      data[key].forEach((nest, index) => {
        if (typeof nest === 'object') {
          for (let n in nest) {
            items.push(`${key}%5B${index}%5D%5B${n}%5D=${encodeURIComponent(nest[n])}`) 
          }
        } 
        else if (typeof nest === 'string') {
          items.push(`${key}%5B${index}%5D=${encodeURIComponent(nest[index])}`) 
        }
      })
    }
  }

  return items.join('&')
}

module.exports = fp(async (fastify, options) => {
  const { OTIMS_API_URL, OTIMS_TOKEN, OTIMS_USER } = process.env

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
      params.FollowIndicator = true
      params.BankType = 'Public'
      params.ComplexityLevel = '1,2,3'
    
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
              // console.log(rawIndicator)
              const item = rawIndicator.split(',') // indicatorName, questionType, noQuestions
              return parseInt(item[2]) + noitems
            }, 0)
          })
          indicators[strandIndex].indicators[indicatorIndex] = indicator
        }
      }
      return indicators
    },

    getStrands: async (params = {}) => {
      params.RequestedName = OTIMS_USER
      params.RequestedNo = `${OTIMS_USER}StrandIndicatorRequest${moment().format('YYYYMMDDHHmmSSS')}`
    
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
      params.FollowIndicator = true
      params.BankType = 'Public'
      params.ComplexityLevel = '1,2,3'
    
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
              // console.log(rawIndicator)
              const item = rawIndicator.split(',') // indicatorName, questionType, noQuestions
              return parseInt(item[2]) + noitems
            }, 0)
          }).catch(err => {
            return 0
          })
          indicators[strandIndex].indicators[indicatorIndex] = indicator
        }
      }

      return indicators.map(strand => ({
        name: strand.name,
        code: strand.code,
        noitems: strand.indicators.reduce((noitem, indicator) => noitem + indicator.noitems, 0)
      }))
    },

    getCompetitions: async (params = {}) => {
      return instance.get(`/ws/master/competition-project`, { params })
      .then(response => response.data)
    },

    requestFixedRandomTestSet: async (params = {}) => {
      params.RequestedName = OTIMS_USER
      params.RequestedNo = `${OTIMS_USER}RequestFixedRandomTestSet${params.RequestType}${moment().format('YYYYMMDDHHmmSSS')}`
      // console.log(params)
      // return params
      return instance.get(`/ws/RequestFixedRandomTestSet`, { params })
      .then(response => {
        const testSetGroup = response.data.ResponseFixedRandomTestset.ResponseTestsetGroup_ResponseFixedRandomTestset.ResponseTestsetGroup
        // console.log(testSetGroup.ResponseItemGroup_ResponseTestsetGroup.ResponseItemGroup)
        // testSetGroup.ResponseItemGroup_ResponseTestsetGroup.ResponseItemGroup.forEach(item => {
        //   if (item.QuestionType == 'SA') {
        //     console.log(item.ItemShortAnswer_ResponseItemGroup.ItemShortAnswer)
        //   }
        // })
        return params.NoStudents == 1 ? [testSetGroup] : testSetGroup
      })
      .catch(e => {
        const errorResponse = e.response.data
        console.error(e.response)
        if (errorResponse.ResponseFixedRandomTestset.ErrorMessage === '010,ไม่พบข้อสอบตามเงื่อนไขที่ต้องการจัดชุด') {
          errorResponse.ResponseFixedRandomTestset.ErrorMessage = 'ข้อสอบไม่เพียงพอสำหรับการจัดชุดข้อสอบนี้'
        }
        throw new Error(errorResponse.ResponseFixedRandomTestset.ErrorMessage)
      })
    }, 

    checkQuestion: async (questionCode) => {
      return instance.get(`/ws/check-question-item/${questionCode}`)
      .then(response => response.data)
      .catch(e => {
        const errorResponse = e.response.data
        console.error(errorResponse)
        throw new Error(errorResponse.error)
      })
    },

    requestCustomTestSet: async (params = {}) => {
      params.RequestedName = OTIMS_USER
      
      return axios.post(`${OTIMS_API_URL}/ws/request-custom-test-set`, {
        request_name: params.RequestedName,
        request_type: params.RequestType,
        test_set_type: 'FI',
        test_items: params.TestItems
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': OTIMS_TOKEN
        }
      })
      .then(response => {
        const testSetGroup = response.data.ResponseFixedRandomTestset.ResponseTestsetGroup_ResponseFixedRandomTestset.ResponseTestsetGroup
        return params.NoStudents == 1 ? [testSetGroup] : testSetGroup
      })
      .catch((e) => {
        const errorResponse = e.response.data
        console.error(e.response.config.data)
        console.error(errorResponse.ResponseFixedRandomTestset)
        if (errorResponse.ResponseFixedRandomTestset.ErrorMessage === '010,ไม่พบข้อสอบตามเงื่อนไขที่ต้องการจัดชุด') {
          errorResponse.ResponseFixedRandomTestset.ErrorMessage = 'ข้อสอบไม่เพียงพอสำหรับการจัดชุดข้อสอบนี้'
        }
        throw new Error(errorResponse.ResponseFixedRandomTestset.ErrorMessage)
      })
    },

    requestFirstItemCAT: async (params) => {
      params.RequestedName = OTIMS_USER
      params.RequestedNo = `${OTIMS_USER}RequestFirstItemCAT${params.RequestType}${moment().format('YYYYMMDDHHmmSSS')}`
      params.TestSetType = `CT`

      // return params
      return instance.get(`/ws/RequestFirstItemCAT`, { params })
      .then(response => {
        const firstItemCAT = response.data.ResponseFirstItemCAT
        console.log(firstItemCAT)
        return firstItemCAT
      })
      .catch(e => {
        console.error(e)
        const errorResponse = e.response.data
        console.error(errorResponse)
        throw new Error(errorResponse.ResponseFirstItemCAT.ErrorMessage)
      })
    },

    requestNextItemCAT: async (params) => {
      params.RequestedName = OTIMS_USER
      params.RequestedNo = `${OTIMS_USER}RequestNextItemCAT${params.RequestType}${moment().format('YYYYMMDDHHmmSSS')}`
      params.TestSetType = `CT`
      
      // return params
      return instance.get(`/ws/RequestNextItemCAT`, { params })
      .then(response => {
        const nextItemCAT = response.data.ResponseNextItemCAT
        console.log(nextItemCAT)
        return nextItemCAT
      })
      .catch(e => {
        const errorResponse = e.response.data
        console.error(errorResponse)
        throw new Error(errorResponse.ResponseNextItemCAT.ErrorMessage)
      })
    },

    requestSendTestsetStat: async (data) => {
      let TimeSpent = 0
      let params = {}
      params.RequestedName = OTIMS_USER
      params.RequestedNo = `${OTIMS_USER}RequestSendTestsetStat1${moment().format('YYYYMMDDHHmmSSS')}`
      params.TestSetID = data.code
      params.RequestTestsetGroupResult = []
      for (let i in data.results) {
        if (!data.results[i].answer) continue;
        TimeSpent = Math.floor(Math.random() * 250) + 10
        switch (data.results[i].type) {
          case 'MC':
            params.TestSetGroupResult.push({
              ItemID: data.results[i].id,
              ItemSelectedChoice: data.results[i].answer,
              ItemResult: data.results[i].result,
              TimeSpent
            })
          break;
          case 'SA':
            params.TestSetGroupResult.push({
              ItemID: data.results[i].id,
              ItemAnswer: data.results[i].answer,
              ItemResult: data.results[i].result,
              TimeSpent
            })
          break;
          case 'TF':
            data.results[i].answer.forEach((tf) => {
              params.TestSetGroupResult.push({
                ItemID: data.results[i].id,
                ItemLeftSideSeq: tf.seq,
                ItemSelectedChoice: tf.key,
                ItemResult: data.results[i].result,
                TimeSpent
              })
            })
          break;
          case 'MA':
            data.results[i].answer.forEach(ma => {
              params.TestSetGroupResult.push({
                ItemID: data.results[i].id,
                ItemLeftSideSeq: ma.seq,
                ItemSelectedChoice: ma.match,
                ItemResult: data.results[i].result,
                TimeSpent
              })
            })
          break;
        }
      }
      instance.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      console.log(params)
      console.log(formUrlEncoded(params))
      return instance.post(`/ws/RequestSendTestSetStat`, formUrlEncoded(params))
      .then(response => {
        console.log(response.data.ResponseSendTestSetStat)
        const testSetGroup = response.data.ResponseFixedRandomTestset.ResponseTestsetGroup_ResponseFixedRandomTestset.ResponseTestsetGroup
        return params.NoStudents == 1 ? [testSetGroup] : testSetGroup
      })
      .catch(e => {
        console.log(e)
        const errorResponse = e.response.data
        console.error(errorResponse)
        // throw new Error(errorResponse.ResponseFirstItemCAT.ErrorMessage)
      })
    }
  })
})