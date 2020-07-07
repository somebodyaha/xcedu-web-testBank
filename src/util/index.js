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
