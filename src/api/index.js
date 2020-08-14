import { axios } from '@xcedu/web-share'
// 修改提交数据
export function getListByParams (params) {
  return axios.get('/api-personalized/questions/pageList', { params })
}

export function delTestById (params) {
  return axios.delete('/api-personalized/questions', { params: params })
}

export function getBankInfoById (params) {
  return axios.get('/api-personalized/questions/findDetail', { params })
}

export function getSearchList (params) {
  return axios.get('/api-personalized/questions/getSearchList', { params })
}

export function getSemesterByYearId (params) {
  return axios.get('/api-personalized/questions/getSemesterList', { params })
}

export function getSubjectByGradeId (params) {
  return axios.get('/api-personalized/questions/getSubjectList', { params })
}

export function createExam (form) {
  return axios.post('/api-personalized/questions', form)
}

export function editExam (form) {
  return axios.put('/api-personalized/questions', form)
}

export function getExamById (params) {
  return axios.get('/api-personalized/questions/findDetail', { params })
}

export function editExamById (params) {
  return axios.get('/api-personalized/questions/view', { params })
}

export function loadBatchByIds (params) {
  return axios.get('/api-personalized/questions/indexBatchDownload', { params })
}

export function loadBatchByIdsEx (params) {
  return axios.get('/api-personalized/questions/getAnnexListByBankIds', { params })
}

export function loadDetailBatchByIds (params) {
  return axios.get('/api-personalized/questions/detailsBatchDownload', { params })
}

export function loadDetailBatchByIdsEx (params) {
  return axios.get('/api-base/attachments/infoList', { params })
}

export function getUserInfo () {
  return axios.get('/api-base/users/userInfo')
}

// 获取阿里云密钥
export function getOSSKey (data) {
  return axios.post('/api-base/attachments/settings', data)
}

export function uploadResource (data) {
  return axios.post('/api-base/attachments/save', data)
}
