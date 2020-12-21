import request from './request'
import api from '@/api'

const API = {};

for (const apiName in api) {
  API[apiName] = {}
  for (const apiDetail in api[apiName]) {
    const defaultOpt = api[apiName][apiDetail]
    API[apiName][apiDetail] = (opt) => request[defaultOpt.method]({...opt, ...defaultOpt})
  }
}

export default API;