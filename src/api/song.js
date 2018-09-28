import { commonParams } from './config'
// import { getUid } from 'common/js/uid'
import axios from 'axios'
// import { ERR_OK } from 'api/config'

export function getLyric (mid) {
  const url = '/api/lyric'

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    pcachetime: +new Date(),
    hostUin: 0,
    needNewCode: 0,
    g_tk: 6723206,
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
