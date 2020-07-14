export function arrayToStrWithOutComma (arr, attr) {
  let str = ''
  if (attr) {
    for (const i of arr) {
      str += i[attr] + ','
    }
  } else {
    for (const i of arr) {
      str += i + ','
    }
  }
  return str.substring(0, str.lastIndexOf(','))
}

export function downloadFile (res) {
  if (!res) {
    return
  }
  var elemIF = document.createElement('iframe')
  elemIF.style.display = 'none'
  elemIF.src = '/api/v1/api-base/attachments/downloadZip?fileListBase64=' + res + '&access_token=' + localStorage.getItem('token')
  document.body.appendChild(elemIF)
  setTimeout(() => {
    document.body.removeChild(elemIF)
  }, 1000)
}

export function downloadAttachment (url, displayName) {
  return axios({
    url: url,
    method: 'get',
    responseType: 'blob'
  }).then(res => {
    const blob = new Blob([res.data])
    if ('msSaveOrOpenBlob' in window.navigator) {
      window.navigator.msSaveOrOpenBlob(blob, displayName)
    } else {
      const URL = window.URL || window.webkitURL
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = objectUrl
      a.setAttribute('download', displayName)
      if (typeof a.download === 'undefined') {
        a.setAttribute('target', '_blank')
      }
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    }
  })
}
