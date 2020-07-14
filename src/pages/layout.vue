<template>
  <section>
    <div class="app-testBank-header">
      <div class="app-testBank-header-input">
        <logo />
        <el-input v-model="bankName" placeholder="资源标题" @keyup.native.enter="fetchList">
          <template slot="append">
            <el-button type="primary" @click="fetchList">搜索</el-button>
          </template>
        </el-input>
        <el-button type="primary" @click="newExam">新建考试</el-button>
      </div>
      <user />
    </div>
    <div class="filter-nav test-bank-section">
      <div ref="gradeMenu" class="filter-label">
        <span>年级</span>
        <div class="filter-label-menu" :class="gradeOpen ? 'hiddenMenu': ''">
          <el-button type="text" :class="gradeActive === 0 ? 'active': ''" @click="selectFilter('grade', 0, 0)">全部</el-button>
          <el-button v-for="(item, index) in gradeList" :key="index" type="text" :class="gradeActive === index+1 ? 'active': ''" @click="selectFilter('grade', item.id, index +1)">
            {{ item.name }}
          </el-button>
        </div>
        <div v-if="gradeMenuShow" class="filter-label-btn">
          <el-button v-if="gradeMenuShow && gradeOpen" type="text" @click="openMenu('grade')">展开<i class="el-icon-arrow-down" /></el-button>
          <el-button v-if="gradeMenuShow && !gradeOpen" type="text" @click="closeMenu('grade')">收起<i class="el-icon-arrow-up" /></el-button>
        </div>
      </div>
      <div ref="subjectMenu" class="filter-label">
        <span>学科</span>
        <div class="filter-label-menu" :class="subjectOpen ? 'hiddenMenu': ''">
          <el-button type="text" :class="subjectActive === 0 ? 'active': ''" @click="selectFilter('subject', 0, 0)">全部</el-button>
          <el-button v-for="(item, index) in subjectList" :key="index" type="text" :class="subjectActive === index+1 ? 'active': ''" @click="selectFilter('subject',item.id, index +1)">
            {{ item.name }}
          </el-button>
        </div>
        <div v-if="subjectMenuShow" class="filter-label-btn">
          <el-button v-if="subjectMenuShow && subjectOpen" type="text" @click="openMenu('subject')">展开<i class="el-icon-arrow-down" /></el-button>
          <el-button v-if="subjectMenuShow && !subjectOpen" type="text" @click="closeMenu('subject')">收起<i class="el-icon-arrow-up" /></el-button>
        </div>
      </div>
      <div ref="typeMenu" class="filter-label">
        <span>类型</span>
        <div class="filter-label-menu" :class="typeOpen ? 'hiddenMenu': ''">
          <el-button type="text" :class="typeActive === 0 ? 'active': ''" @click="selectFilter('type',0, 0)">全部</el-button>
          <el-button v-for="(item, index) in testList" :key="index" type="text" :class="typeActive === index+1 ? 'active': ''" @click="selectFilter('type',item.id, index +1)">
            {{ item.name }}
          </el-button>
        </div>
        <div v-if="typeMenuShow" class="filter-label-btn">
          <el-button v-if="typeMenuShow && typeOpen" type="text" @click="openMenu('type')">展开<i class="el-icon-arrow-down" /></el-button>
          <el-button v-if="typeMenuShow && !typeOpen" type="text" @click="closeMenu('type')">收起<i class="el-icon-arrow-up" /></el-button>
        </div>
      </div>
    </div>
    <div class="test-bank-section test-bank-section--filter" style="padding-top: 10px; padding-bottom: 10px;">
      <el-row :gutter="10" align="middle" type="flex">
        <el-col :span="12">
          <div class="test-bank-section--filter--item">
            <span>学年</span>
            <el-select v-model="year" value-key="id" @change="getTermsList()">
              <el-option v-for="option in academicYearList" :key="option.id" :label="option.name" :value="option.id" />
            </el-select>
          </div>
          <div class="test-bank-section--filter--item">
            <span>学期</span>
            <el-select v-model="term" value-key="id" class="termSelect" @change="fetchList">
              <el-option
                v-for="item in termList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </div>
          <div class="test-bank-section--filter--item">
            <span>文理</span>
            <el-select v-model="art" @change="fetchList">
              <el-option
                v-for="item in arts"
                :key="item.value"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </div>
        </el-col>
        <el-col :span="12" style="justify-content: flex-end;">
          <el-checkbox v-model="checkAll" style="margin-right: 20px;">全选</el-checkbox>
          <el-button type="primary" size="small" @click="loadBatch">批量下载</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="test-bank-section" style="background: none; padding-left: 0; padding-right: 0; margin-left: 45px; margin-right: 45px; padding-top: 0; margin-top: 5px;">
      <template v-if="list.length">
        <div class=" bank-item-container">
          <div v-for="(item, index) in list" :key="index" class="bank-item">
            <div @click="getTestBankById(item.id)">
              <div>
                <img v-if="item.testType === 0" src="../assets/fold.png" alt="">
                <img v-if="item.testType === 1" src="../assets/wen.png" alt="">
                <img v-if="item.testType === 2" src="../assets/li.png" alt="">
                <div>
                  <strong>{{ item.bankName }}</strong>
                  <el-checkbox v-model="item.checked" @click.stop.native="" />
                  <p>
                    <span class="color">{{ item.gradeName }}</span>
                    <span>{{ item.testName }}</span>
                  </p>
                  <em>{{ item.createdDate }}</em>
                </div>
              </div>
              <div class="item-btn-groups">
                <el-button type="text"><i class="icon-edit" @click.stop="edit(item.id)" /></el-button>
                <el-button type="text"><i class="icon-delete" @click.stop="del(item.id)" /></el-button>
              </div>
            </div>
          </div>
        </div>
        <el-pagination
          :page-size="pageSize"
          :page-sizes="[8, 12, 16, 20]"
          background
          layout="prev, pager, next, jumper, sizes, total"
          :total="total"
          class="tx-c margin-top-size-nomal padding-bottom-size-nomal"
          @current-change="searchList"
          @size-change="pageSizeChange"
        />
      </template>
      <div v-else class="tx-c">
        <img src="../assets/noMsg.png">
      </div>
    </div>
    <newExam
      :edit-exam-id="editExamId"
      :is-modify="isModify"
      :dialog-visible="dialogVisible"
      @dialogClose="closeNewExamDialog"
    />
  </section>
</template>
<script>
import { delTestById, loadBatchByIdsEx, getListByParams, getSearchList, getSemesterByYearId, getSubjectByGradeId } from '@/api/index'
import { arrayToStrWithOutComma, downloadAttachment } from '../util/index'
import user from '@/component/user'
import logo from '@/component/logo'
import newExam from '@/component/exam.vue'
export default {
  components: { user, logo, newExam },
  data () {
    return {
      year: '',
      term: '0',
      art: 0,
      grade: '',
      exam: '',
      type: '',
      subject: '',
      gradeActive: 0,
      subjectActive: 0,
      typeActive: 0,
      bankName: '',
      list: [],
      checkAll: false,
      total: 0,
      page: 1,
      pageSize: 12,
      dialogVisible: false,
      checkedListArr: [],
      testList: [],
      termList: [{ name: '全部', id: '0' }],
      academicYearList: [],
      subjectList: [],
      gradeList: [],
      temrs: [],
      arts: [{
        name: '全部',
        id: 0
      }, {
        name: '文科',
        id: 1
      }, {
        name: '理科',
        id: 2
      }],
      editExamId: '',
      isModify: false,
      gradeMenuShow: false,
      subjectMenuShow: false,
      typeMenuShow: false,
      gradeOpen: '',
      subjectOpen: '',
      typeOpen: ''
    }
  },
  watch: {
    checkAll: function () {
      if (this.checkAll) {
        for (let i = 0; i < this.list.length; i++) {
          this.list[i].checked = true
        }
      } else {
        for (let i = 0; i < this.list.length; i++) {
          this.list[i].checked = false
        }
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    // window.localStorage.setItem('DirectHost', '192.168.20.144')
    const tokenParams = window.location.search.replace(/\?.*token=(.+)(&.*|#.*)?$/, (w, l) => l)
    const token = tokenParams.split('&')[0]
    if (token) {
      if (!localStorage.getItem('token')) {
        localStorage.setItem('token', token)
      }
    }
    next()
  },
  mounted: function () {
    this.fetchList()
    getSearchList().then(res => {
      this.testList = res.testList
      this.gradeList = res.gradeList
      this.subjectList = res.subjectList
      this.academicYearList = res.academicYearList
      this.academicYearList.unshift({
        name: '全部',
        id: '0'
      })
      this.year = '0'
      //  判断菜单的展开 是否显示
      this.$nextTick(function () {
        this.initMenuBtns()
      })
    })
  },
  methods: {
    initMenuBtns () {
      // 获取年级菜单的高度
      const gradeHeight = this.$refs.gradeMenu.clientHeight
      const subjectHeight = this.$refs.subjectMenu.clientHeight
      const typeHeight = this.$refs.typeMenu.clientHeight
      if (gradeHeight > 40) {
        this.gradeMenuShow = true
        this.gradeOpen = true
      }
      if (subjectHeight > 40) {
        this.subjectMenuShow = true
        this.subjectOpen = true
      }
      if (typeHeight > 40) {
        this.typeMenuShow = true
        this.typeOpen = true
      }
    },
    openMenu (command) {
      this[command + 'Open'] = false
    },
    closeMenu (command) {
      this[command + 'Open'] = true
    },
    closeNewExamDialog () {
      this.dialogVisible = false
      this.fetchList()
    },
    getTermsList () {
      getSemesterByYearId({ academicYear: this.year }).then(res => {
        this.termList = res
        this.termList.unshift({
          name: '全部',
          id: '0'
        })
        this.term = '0'
        this.fetchList()
      })
    },
    selectFilter (role, id, index) {
      if (role === 'grade') {
        // 查询学科
        getSubjectByGradeId({ gradeId: id }).then(res => {
          this.subjectList = res
          this.subject = 0
          this.type = 0
          this.subjectActive = 0
          this.typeActive = 0
        })
      }
      this[role + 'Active'] = index
      this[role] = id
      this.searchList()
    },
    loadBatch () {
      this.checkedListArr = []
      for (const item of this.list) {
        if (item.checked) {
          this.checkedListArr.push(item.id)
        }
      }
      const ids = arrayToStrWithOutComma(this.checkedListArr)
      if (ids.length === 0) {
        this.$message({
          type: 'warning',
          message: '未选中考试'
        })
      } else {
        loadBatchByIdsEx({ ids: ids }).then(res => {
          for (const item of res) {
            // window.open(item.url, '_blank')
            downloadAttachment(item.url, item.displayName)
          }
        })
      }
    },
    del (id) {
      this.$confirm('确认删除?', '信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delTestById({ ids: id }).then(res => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.fetchList()
        })
      })
    },
    edit (id) {
      this.dialogVisible = true
      this.isModify = true
      this.editExamId = id
    },
    getTestBankById (id) {
      const { href } = this.$router.resolve({ name: 'detail', params: { id: id } })
      window.open(href, '_blank')
    },
    newExam () {
      this.isModify = false
      this.dialogVisible = true
    },
    fetchList () {
      const req = {
        page: this.page,
        pageSize: this.pageSize,
        gradeId: this.grade,
        subjectId: this.subject,
        testId: this.type,
        academicYear: this.year,
        semesterId: this.term,
        testType: this.art,
        bankName: this.bankName
      }
      getListByParams(req).then(res => {
        const arr = []
        for (const item of res.records) {
          item.checked = false
          arr.push(item)
        }
        this.list = arr
        this.total = res.totalRecords
      })
    },
    searchList (page) {
      this.loading = true
      if (Number.isFinite(page)) {
        this.page = page
      }
      this.fetchList()
    },
    pageSizeChange (pageSize) {
      this.pageSize = pageSize
      this.fetchList()
    },
    delSubject (index) {
      this.form.subjectList.splice(index, 1)
    }

  }
}
</script>
