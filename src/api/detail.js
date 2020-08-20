// 详情页面
import { axios } from 'xc-share'
export function resLinkView (resourceId) {
  return axios({
    url: '/resources/detail',
    method: 'get',
    params: {
      resourceId: resourceId,
      flag: 1
    }
  }).then(data => data.data)
}

export function updateDownLoadNum (id) {
  return axios({
    url: '/resources/updateDownLoadNum',
    method: 'get',
    params: {
      resourceId: id
    }
  }).then(data => data.data)
}
