<template>
  <section class="app-testBank-detail">
    <div class="app-testBank-header">
      <Logo />
      <User />
    </div>
    <div class="app-testBank-detail-content">
      <div class="test-bank-section">
        <el-row :gutter="10" align="middle" type="flex">
          <el-col :span="12">
            <img v-if="bankInfo.testType === 0" src="../assets/fold.png" alt="" style="height: 65px; margin-right: 20px">
            <img v-if="bankInfo.testType === 1" src="../assets/wen.png" alt="" style="height: 65px; margin-right: 20px">
            <img v-if="bankInfo.testType === 2" src="../assets/li.png" alt="" style="height: 65px; margin-right: 20px">
            <div>
              <div class="size-large-xx padding-bottom-size-mix">{{ bankInfo.bankName }}</div>
              <div class="padding-bottom-size-mix"><span class="color">[{{ bankInfo.gradeName }}]</span><span class="margin-left-size-nomal">{{ bankInfo.testName }}</span></div>
              <div class="text-color-grey">{{ bankInfo.createdDate }}</div>
            </div>
          </el-col>
          <el-col :span="12" style="justify-content: flex-end; ">
            <el-checkbox v-model="checkAll" style="margin-right: 20px;">全选</el-checkbox>
            <el-button type="primary" size="small" @click="loadBatchByIds">批量下载</el-button>
          </el-col>
        </el-row>
      </div>
      <div class="test-bank-section">
        <div class=" bank-item-container">
          <div v-for="(item, index) in bankInfo.bankAnnexList" :key="index" class="bank-item" @click="viewFile(item.bankAnnexId, item.contentType)">
            <div style="padding-bottom: 24px;">
              <div>
                <img v-if="item.contentType === 'video'" src="../assets/video.png" alt="">
                <img v-else-if="item.contentType === 'pdf'" src="../assets/pdf.png" alt="">
                <img v-else-if="item.contentType === 'ppt'" src="../assets/ppt.png" alt="">
                <img v-else-if="item.contentType === 'word'" src="../assets/word.png" alt="">
                <img v-else-if="item.contentType === 'excel'" src="../assets/excel.png" alt="">
                <img v-else-if="item.contentType === 'audio'" src="../assets/mp3.png" alt="">
                <img v-else-if="item.contentType === 'zip'" src="../assets/zip.png" alt="">
                <img v-else-if="item.contentType === 'rar'" src="../assets/rar.png" alt="">
                <img v-else-if="item.contentType === 'text'" src="../assets/txt.png" alt="">
                <img v-else-if="item.contentType === 'image'" src="../assets/image.png" alt="">
                <img v-else-if="item.contentType === 'unknown'" src="../assets/unknown.png" alt="">
                <div>
                  <strong :title="item.bankAnnexName">{{ item.bankAnnexName }}</strong>
                  <el-checkbox v-model="item.checked" @click.stop.native="" />
                  <p>
                    <span class="color">{{ item.subjectName }}</span>
                    <em class="text-color-grey">{{ item.createdDate }}</em>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script>
// import json2 from '@/json/json2.json'
import { getBankInfoById, loadDetailBatchByIdsEx } from '@/api/index'
import { arrayToStrWithOutComma, downloadAttachment } from '../util/index'

export default {
  data () {
    return {
      bankInfo: '',
      checkedListArr: [],
      checkAll: false
    }
  },
  computed: {
    id: function () {
      return this.$route.params.id
    }
  },
  watch: {
    checkAll: function () {
      if (this.checkAll) {
        for (const item of this.bankInfo.bankAnnexList) {
          item.checked = true
        }
      } else {
        for (const item of this.bankInfo.bankAnnexList) {
          item.checked = false
        }
      }
    }
  },
  mounted () {
    getBankInfoById({ id: this.id }).then(res => {
      for (const item of res.bankAnnexList) {
        item.checked = false
      }
      this.bankInfo = res
    })
    this.getListById()
  },
  methods: {
    loadBatchByIds () {
      this.checkedListArr = []
      for (const item of this.bankInfo.bankAnnexList) {
        if (item.checked) {
          this.checkedListArr.push(item.bankAnnexId)
        }
      }
      const ids = arrayToStrWithOutComma(this.checkedListArr)
      if (ids.length === 0) {
        this.$message({
          type: 'warning',
          message: '未选中附件'
        })
      } else {
        loadDetailBatchByIdsEx({ idList: ids }).then(res => {
          for (const item of res) {
            // window.open(item.url, '_blank')
            // window.open(item.url + '?response-content-disposition=attachment; filename="' + item.displayName + '"', '_blank')
            downloadAttachment(item.url, item.displayName)
          }
        })
      }
    },
    getListById (id) {
      // this.list = json2
    },
    viewFile (url, contentType) {
      const { href } = this.$router.resolve({ name: 'view', params: { url: url, contentType: contentType } })
      window.open(href, '_blank')
    }
  }
}
</script>
