<template>
  <div>
    <div v-show="canPreview" :class="isfullScreen ? 'fullScreen' : ''">
      <div v-if="contentType == 'video'" class="containerborder">
        <video id="video" :src="previewLink" controls="controls" style="height: 100vh; width: 100%;">
          您的浏览器不支持 video 标签。
        </video>
      </div>
      <div
        v-else-if="contentType == 'audio'"
        id="audio"
        class="containerborder"
      >
        <audio
          id="audio"
          style="width: 70%; margin: 0 auto; position: absolute;  top: 50%; left: 50%; margin-left: -35%; margin-top: -27px;"
          :src="previewLink"
          preload="preload"
          loop
          controls="controls"
          controlslist="nodownload"
          oncontextmenu="return false"
        />
      </div>
      <div
        v-else-if="contentType == 'image'"
        id="img"
        class="imgContainer"
        style="overflow: auto; width: 100%;  "
      >
        <img style="width:100%;" :src="previewLink">
      </div>
      <iframe v-else id="iframeView" :src="previewLink" style="width: 100%; height: 100vh; border: 0 none;" frameborder="0" />
      <!--<div class="loadDiv">
        <div class="clearfix">
          <span v-if="!isfullScreen" class="color" style="position: relative; top: 15px;  left: 15px; cursor: pointer" @click="fullScreen"><i class="fa fa-max color" /></span>
          <span v-if="isfullScreen" class="color" style="position: relative; top: 15px;  left: 15px; cursor: pointer" @click="cancelfullScreen"><i class="fa fa-mix color" /></span>
          <a id="downloadRes" href="javascript:void(0)" @click="loadNum">
            下载
          </a>
        </div>
      </div>-->
    </div>
    <div v-if="!canPreview" style="height: 100%;" :class="isfullScreen ? 'fullScreen' : ''">
      <div id="unknown" style="display: flex; align-items: center; justify-content: center; height: 100vh;" class="containerborder">
        <div>
          <img style="width: 65px;height: 74px; display: block; margin: 0 auto;" src="@/assets/unknown.png">
          <p style="text-align: center;">文件大小:{{ size }}</p>
          <p style="font-size: 12px; color: #888;">暂不支持预览, 请下载后查看</p>
        </div>
      </div>
      <!--<div class="loadDiv">
        <div class="clearfix">
          <span v-if="!isfullScreen" class="color" style="position: relative; top: 15px;  left: 15px; cursor: pointer" @click="fullScreen"><i class="fa fa-max color" /></span>
          <span v-if="isfullScreen" class="color" style="position: relative; top: 15px;  left: 15px; cursor: pointer" @click="cancelfullScreen"><i class="fa fa-mix color" /></span>
          <a id="downloadRes" href="javascript:void(0)" @click="loadNum">
            下载
          </a>
        </div>
      </div>-->
    </div>
  </div>
</template>
<script>
import { updateDownLoadNum } from '@/api/detail'
import { loadDetailBatchByIdsEx } from '@/api/index'
import $ from 'jquery'

export default {
  data () {
    return {
      entity: {},
      itemList: [],
      contentType: '',
      previewLink: '',
      loadLink: '',
      pdfPreview: '',
      resourceId: '',
      pageResourceId: '',
      isdiv: false,
      isiframe: false,
      url: '',
      isfullScreen: false,
      canPreview: '',
      XCFrontend: {
        ossfileurl: 'http://gtyzfile.iclass30.com/',
        load: '?response-content-type=application%2Foctet-stream'
      },
      autoHeight: '',
      size: '',
      saveSort: '',
      currentId: '',
      childData: true
    }
  },
  computed: {
    videoPreviewlink: function () {
      return this.previewLink
    }
  },
  mounted: function () {
    this.getItemInfo(this.$route.params.url)
  },
  methods: {
    loadNumId: function (item) {
      var id = item.id
      var XCFrontend = this.XCFrontend
      window.open(XCFrontend.ossfileurl + item.relativePath + '/' + item.resAnnexId + item.fileSuffName + XCFrontend.load)
      updateDownLoadNum(id).then(data => {
        if (data) {
          // 成功
          this.entity.downloadNum++
        }
      })
    },
    loadNum: function () {
      window.open(this.loadLink)
      updateDownLoadNum(this.currentId).then(data => {
        if (data) {
          // 成功
          this.entity.downloadNum++
        } else {
          // 失败
        }
      })
    },
    fullScreen: function () {
      this.isfullScreen = true
      // 设置高度
      var autoHeight = $(window).height() - 50
      // $("#video").height(autoHeight);
      // $("#audio").height(autoHeight);
      // $("#img").height(autoHeight);
      // $("#pdf-content").height(autoHeight);
      // $("#unknown").height(autoHeight);
      $('#iframeView').height(autoHeight)
    },
    cancelfullScreen: function () {
      this.isfullScreen = false
      // $("#video").height('70vh');
      // $("#audio").height('70vh');
      // $("#img").height('70vh');
      // $("#pdf-content").height('70vh');
      // $("#unknown").height("70vh");
      $('#iframeView').height('100vh')
    },
    goHome: function () {
      this.$router.push({ name: '/' })
    },
    gotoDetals: function (id) {
      this.getItemInfo(id)
    },
    initPdf: function (previewLink) {
      this.url = '/pdf/web/viewer.html?file=' + this.pdfPreview
      // debugger
      // 初始化iframe 以后 根据文档的高度 设置 外部iframe 的高度
      // var autoHeight = $("#viewer").height();
    },
    getItemInfo: function (resourceId) {
      loadDetailBatchByIdsEx({ idList: resourceId }).then(data => {
        data = data[0]
        this.entity = data
        // this.itemList = data.otherResourceList
        // this.currentId = data.entity.id
        // 如果是pdf预览
        // 预览的地址 .pdf
        /* var resId = data.entity.resourceId
        for (var i = 0; i < data.entity.fjList.length; i++) {
          if (resId === data.entity.fjList[i].resAnnexId) {
            this.saveSort = i
          }
        } */
        const idx = data.url.lastIndexOf('.')
        const suff = idx === -1 ? '' : data.url.substring(idx)
        this.canPreview = this.checkFileView(suff)
        this.size = this.getFileSize(data.fileSize)
        this.contentType = this.$route.params.contentType
        if (
          this.contentType === 'video' ||
          this.contentType === 'audio' ||
          this.contentType === 'image'
        ) {
          this.previewLink = data.url
        } else if (this.canPreview) {
          // this.pdfPreview = data.url.substring(0, idx) + '.pdf'
          this.previewLink = data.url.substring(0, idx) + '.pdf'
          // this.initPdf(this.pdfPreview)
        }
        /* this.loadLink =
          this.XCFrontend.ossfileurl +
          data.entity.fjList[this.saveSort].relativePath +
          '/' +
          data.entity.resourceId +
          data.entity.fjList[this.saveSort].fileSuffName +
          this.XCFrontend.load */
      })
    },
    getFileSize: function (fileSize) {
      if (fileSize / 1024 < 1) {
        return '1KB'
      } else if (fileSize / 1024 / 1024 < 1) {
        return (fileSize / 1024).toFixed(1) + 'KB'
      } else if (fileSize / 1024 / 1024 / 1024 < 1) {
        return (fileSize / 1024 / 1024).toFixed(1) + 'MB'
      } else {
        return '>1GB'
      }
    },
    checkFileView: function (fileSuffName) {
      fileSuffName = fileSuffName.toLowerCase()
      if (
        fileSuffName === '.pdf' ||
        fileSuffName === '.txt' ||
        fileSuffName === '.doc' ||
        fileSuffName === '.docx' ||
        fileSuffName === '.ppt' ||
        fileSuffName === '.pptx' ||
        fileSuffName === '.ppsx' ||
        fileSuffName === '.wps' ||
        fileSuffName === '.png' ||
        fileSuffName === '.jpg' ||
        fileSuffName === '.wav' ||
        fileSuffName === '.flac' ||
        fileSuffName === '.mp3' ||
        fileSuffName === '.mp4' ||
        fileSuffName === '.gif' ||
        fileSuffName === '.jpeg' ||
        fileSuffName === '.mov'
      ) {
        return true
      } else {
        return false
      }
    },
    getPicName: function (contentType) {
      var type = (contentType || 'application/pdf').split('/')[0]
      var picName = 'unknown'
      switch (type) {
      case 'image':
        picName = 'image.png'
        break
      case 'text':
        picName = 'txt.png'
        break
      case 'video':
        picName = 'video.png'
        break
      case 'audio':
        picName = 'mp3.png'
      }
      // 2019-09-02 附件上传图标不符bug
      if (picName === 'unknown') {
        if (
          contentType === 'application/x-ppt' ||
          contentType === 'application/vnd.ms-powerpoint' ||
          contentType ===
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ) {
          picName = 'ppt.png'
        } else if (
          contentType === 'application/x-xls' ||
          contentType === 'application/vnd.ms-excel' ||
          contentType ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          picName = 'excel.png'
        } else if (contentType === 'application/pdf') {
          picName = 'pdf.png'
        } else if (
          contentType === 'application/msword' ||
          contentType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          picName = 'word.png'
        } else if (contentType === 'application/zip') {
          picName = 'zip.png'
        } else if (contentType === 'application/x-rar-compressed') {
          picName = 'rar.png'
        }
        if (picName === 'unknown') {
          picName = 'unknown.png'
        }
      }
      return picName
    }
  }
}
</script>
<style lang="scss" scoped>
  .fa-max,
  .fa-mix{
    font-size: 25px;
    position: relative;
    top: -5px;
  }
  .containerborder{
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  .fullScreen{
    position: fixed;
    z-index: 2;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    margin-right: 0 !important;
    transition: all .25s;
    .loadDiv{
      position: absolute;
      bottom: 0;
      margin: 0;
    }
  }
  .documentContent {
    > div {
      border-radius: 6px;
      margin-right: 15px;
    }
  }
  #pdf-content {
    width: 100%;
    height: 100%;
  }
  .xc-element {
    height: 100%;
  }
  .xc-element-header {
    background: #fff;
    position: fixed;
    width: 100%;
    top: 0;
  }
  .main-container {
    margin: 0 50px;
    position: relative;
  }
  .xc-element-body {
    margin-top: 66px;
    height: calc(100% - 66px);
    overflow: auto;
    padding: 0 50px 0 50px;
  }
  .logo {
    img {
      height: 37px;
      margin-top: 5px;
      width: 155px;
    }
  }

  .item-title {
    background: #fff;
    padding: 10px;
    img {
      width: 65px;
    }
    p {
      padding: 4px 0;
      span {
        display: inline-block;
        + span {
          margin-left: 15px;
        }
      }
    }
  }

  .resourcefileInfo-view {
    text-align: right;
    position: absolute;
    bottom: 0;
    right: 0;
    span + span {
      display: inline-block;
      margin-left: 15px;
    }
    span {
      i {
        display: inline-block;
        margin-right: 5px;
      }
    }
  }

  .item-body {
    background: #fff;
    padding: 28px 10px;
    border-radius: 6px;
    margin-top: 10px;
    h4 {
      font-size: 18px;
      font-weight: normal;
      margin-bottom: 8px;
    }
  }
  .fujian {
    .fujian-list {
      border: 1px solid #ccc;
      border-radius: 6px;
      margin-top: 10px;
      padding: 15px 20px;
    }
    .fujian-item {
      position: relative;
      margin: 10px 100px 10px 0;
      padding: 0;
      width: 100%;
      max-width: 400px;
      height: 65px;
      background: rgba(56, 179, 241, 0.1);
      border-radius: 6px;
      img {
        width: 40px;
        float: left;
        margin-right: 10px;
      }
      > div {
        p {
          span {
            display: inline-block;
            position: relative;
            width: 60%;
            text-overflow: ellipsis;
            overflow: hidden;
            word-break: keep-all;
            white-space: nowrap;
          }
          em {
            position: absolute;
            right: 5px;
            top: 11px;
          }
        }
      }
    }
  }
  .ziyuan {
    margin-top: 20px;
  }
  .resourceIndexLlist {
    li {
      position: relative;
      border-bottom: 1px solid #f0f0f0;
      height: 35px;
      line-height: 35px;
      font-size: 14px;
      color: #38b3f1;
      padding-left: 25px;
      cursor: pointer;
      &:first-child {
        em {
          background: #f54b4b;
        }
      }
      &:nth-child(2) {
        em {
          background: #ff8547;
        }
      }
      &:nth-child(3) {
        em {
          background: #ff8547;
        }
      }
      em {
        position: absolute;
        color: #fff;
        background-color: #1d9ffc;
        height: 15px;
        width: 15px;
        text-align: center;
        line-height: 15px;
        font-size: 12px;
        top: 9px;
        left: 0;
      }
      span {
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
      }
    }
  }
  .loadDiv {
    position: fixed;
    bottom: 0;
    width: 100%;
    left: 0;
    >div{
      margin-left: 60px;
      margin-right: calc(20.83333% + 55px);
      position: relative;
    }
    div{
      box-sizing: border-box;
      // width: 100%;
      height: 49px;
      border: 1px solid #ccc;
      border-top: none;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
      border-right: none;
      background: #f0f0f0;
      a {
        color: #fff;
        height: 49px;
        border-radius: 0 6px 6px 0;
        line-height: 49px;
        text-align: center;
        font-size: 16px;
        width: 85px;
        border-top-right-radius: 0;
        top: 0;
        background: #dd5a57;
        position: absolute;
        top: 0;
        right: 0;
      }
    }

  }
</style>
