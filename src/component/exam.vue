<template>
  <el-dialog
    title="新建考试"
    :visible.sync="isShow"
    width="1000px"
    class="size-nomal-dialog"
    :close-on-click-modal="closClickModal"
    :before-close="handleClose"
    top="0"
    @open="openExamDialog"
  >
    <el-form ref="examForm" :model="form" label-width="80px" :rules="rules">
      <el-row>
        <el-col :span="11">
          <el-form-item label="学年" prop="academicYear">
            <el-select v-model="form.academicYear" @change="getSemesterByYear">
              <el-option v-for="option in academicYearList" :key="option.id" :label="option.name" :value="option.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="学期" prop="semesterId">
            <el-select v-model="form.semesterId " @change="getTermById">
              <el-option v-for="option in semesterList" :key="option.id" :label="option.name" :value="option.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="11">
          <el-form-item label="年级" prop="gradeId">
            <el-select v-model="form.gradeId" @change="getSubjectByGradeId">
              <el-option v-for="option in gradeList" :key="option.id" :label="option.name" :value="option.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="考试" prop="testId">
            <el-select v-model="form.testId " @change="setTestName">
              <el-option v-for="option in testList" :key="option.id" :label="option.name" :value="option.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="11">
          <el-form-item label="文理" prop="testType">
            <el-select v-model="form.testType " placeholder="请选择">
              <el-option v-for="(type, index) in typeList" :key="index" :label="type.name" :value="type.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-for="(item, index) in form.bankAnnexList" :key="index">
        <el-col :span="11">
          <el-form-item
            label="学科"
            :prop="'bankAnnexList.' + index + '.subjectId'"
            :rules="{
              required: true, message: '学科不能为空', trigger: ['blur', 'change']
            }"
          >
            <el-select v-model="item.subjectId" placeholder="" @change="(val) => getSubjectById(val,index)">
              <el-option v-for="option in subjectList" :key="option.id" :label="option.name" :value="option.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item
            label="资源"
            :prop="'bankAnnexList.' + index + '.bankAnnexName'"
            :rules="{
              required: true, message: '资源不能为空', trigger: ['blur', 'change']
            }"
          >
            <el-input v-model="item.bankAnnexName" class="fileUpInput" @input="changeBankAnnexName(item.bankAnnexId, index)" /><el-upload
              class="upload-demo"
              action=""
              :file-list="fileList"
              :show-file-list="false"
              :before-upload="(file) => beforeUpload(file, index)"
              :http-request="(file) => fileUpLoad(file,index)"
              :on-change="fileChange"
              :on-progress="uploadProgress"
              :on-success="uploadOnSuccess"
            >
              <el-button type="primary">上传</el-button>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="2">
          <div class="margin-small">
            <i v-if="index === (form.bankAnnexList.length -1) " class="icon icon-add-solid-o blue pointer  margin-right-size-mix" @click="addSuject" />
            <i v-if="index !== (form.bankAnnexList.length -1)" class="icon icon-minus-solid-o red pointer" @click="delSubject(index)" />
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="9" :offset="13">
          <div class="progress">
            <span :style="{width: progress + '%'}" />
          </div>
          <div class="error">
            <span class="red">{{ error }}</span>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button type="primary" size="small" @click="saveForm('examForm')">保存</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getSemesterByYearId, getSubjectByGradeId, createExam, editExamById, editExam } from '@/api/index'
import { axios } from '@xcedu/web-share'
export default {
  props: {
    isModify: {
      type: Boolean,
      default: false
    },
    editExamId: {
      type: String,
      default: ''
    },
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      fileList: [],
      isShow: false,
      academicYearList: [], // 学年
      semesterList: [], // 学期
      gradeList: [], // 年级
      testList: [], // 考试
      typeList: [{
        name: '全部',
        id: 0
      }, {
        name: '文科',
        id: 1
      }, {
        name: '理科',
        id: 2
      }],
      subjectList: [],

      form: {
        academicYear: '',
        academicYearName: '',
        gradeId: '',
        gradeName: '',
        semesterId: '',
        semesterName: '',
        testId: '',
        testName: '',
        testType: 0,
        bankAnnexList: [{
          bankAnnexName: '',
          subjectId: '',
          subjectName: '',
          bankAnnexId: ''
        }]
      },
      rules: {
        academicYear: [
          { required: true, message: '请选择学年', trigger: ['blur', 'change'] }
        ],
        semesterId: [
          { required: true, message: '请选择学期', trigger: ['blur', 'change'] }
        ],
        gradeId: [
          { required: true, message: '请选择年级', trigger: ['blur', 'change'] }
        ],
        testId: [
          { required: true, message: '请选择考试', trigger: ['blur', 'change'] }
        ]
      },
      fileObj: '',
      progress: 0,
      error: '',
      currentIndex: '',
      examId: '',
      closClickModal: false
    }
  },
  watch: {
    dialogVisible: function (newValue, oldValue) {
      this.isShow = newValue
    }
  },
  mounted () {
    this.isShow = this.dialogVisible
  },
  methods: {
    changeBankAnnexName (id, index) {
      if (id === '') {
        this.form.bankAnnexList[index].bankAnnexName = ''
      }
    },
    openExamDialog () {
      if (!this.isModify) {
        this.$nextTick(() => {
          this.$refs.examForm.resetFields()
        })
        editExamById({ id: '' }).then(res => {
          this.academicYearList = res.academicYearList
          this.semesterList = res.semesterList
          this.gradeList = res.gradeList
          this.testList = res.testList
        })
      }
      if (this.isModify) {
        this.$nextTick(() => {
          this.$refs.examForm.resetFields()
        })
        editExamById({ id: this.editExamId }).then(res => {
          this.subjectList = res.subjectList
          this.semesterList = res.semesterList
          this.academicYearList = res.academicYearList
          this.gradeList = res.gradeList
          this.testList = res.testList
          for (const annex of res.bankAnnexList) {
            annex.createdDate = ''
          }
          this.$nextTick(function () {
            this.form.bankAnnexList = res.bankAnnexList
            this.form.academicYear = res.academicYear
            this.form.academicYearName = res.academicYearName
            this.form.gradeId = res.gradeId
            this.form.gradeName = res.gradeName
            this.form.testId = res.testId
            this.form.semesterName = res.semesterName
            this.form.testType = res.testType
            this.form.semesterId = res.semesterId
          })
        })
      }
    },
    fileChange (file) {
      // 获取文件流
      this.fileObj = file.raw
    },
    beforeUpload (file, index) {
      this.currentIndex = index
      this.form.bankAnnexList[index].bankAnnexName = file.name
    },
    fileUpLoad (file, index) {
      const formData = new FormData()
      formData.append('file', this.fileObj)
      formData.append('storageDir', 'exam')
      axios.post('/api-base/attachments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: [function transformRequest (formData) {
          return formData
        }],
        onUploadProgress: function (progressEvent) {
          if (progressEvent.lengthComputable) {
            const progress = parseInt((progressEvent.loaded / progressEvent.total) * 100).toFixed(0)
            // 上传进度回调
            file.onProgress({ percent: progress })
          }
        }
      }).then(res => {
        // 上传成功回调
        file.onSuccess(res, file)
      }).catch(err => {
        this.error = err
      })
    },
    uploadProgress (event, file) {
      this.progress = event.percent
      setTimeout(() => {
        if (event.percent === '100') {
          this.progress = 0
        }
      }, 100)
    },
    uploadOnSuccess (res, file) {
      this.form.bankAnnexList[this.currentIndex].bankAnnexId = res.id
    },
    getSubjectById (val, index) {
      for (const i of this.subjectList) {
        if (i.id === val) {
          this.form.bankAnnexList[index].subjectName = i.name
        }
      }
    },
    getSubjectByGradeId () {
      getSubjectByGradeId({ gradeId: this.form.gradeId }).then(res => {
        this.subjectList = res
      })
      for (const i of this.gradeList) {
        if (i.id === this.form.gradeId) {
          this.form.gradeName = i.name
        }
      }
    },
    setTestName () {
      for (const i of this.testList) {
        if (i.id === this.form.testId) {
          this.form.testName = i.name
        }
      }
    },
    getSemesterByYear () {
      getSemesterByYearId({ academicYear: this.form.academicYear }).then(res => {
        this.semesterList = res
        this.form.semesterId = res[0].id
        this.form.semesterName = res[0].name
      })
      for (const i of this.academicYearList) {
        if (i.id === this.form.academicYear) {
          this.form.academicYearName = i.name
        }
      }
    },
    getTermById () {
      for (const i of this.termList) {
        if (i.id === this.form.semesterId) {
          this.form.semesterName = i.name
        }
      }
    },
    addSuject () {
      const item = {
        bankAnnexName: '',
        subjectId: '',
        subjectName: '',
        bankAnnexId: ''
      }
      this.form.bankAnnexList.push(item)
    },
    handleClose (done) {
      // this.$refs.examForm.clearValidate()
      this.resetForm()
      done()
      this.$emit('dialogClose')
    },
    resetForm () {
      this.form = {
        academicYear: '',
        academicYearName: '',
        gradeId: '',
        gradeName: '',
        semesterId: '',
        semesterName: '',
        testId: '',
        testName: '',
        bankAnnexList: [{
          bankAnnexName: '',
          subjectId: '',
          subjectName: '',
          bankAnnexId: ''
        }]
      }
    },
    saveForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.isModify) {
            this.$set(this.form, 'id', this.editExamId)
            editExam(this.form).then(res => {
              this.$message({
                type: 'success',
                message: '编辑成功'
              })
              this.$emit('dialogClose')
            })
          } else {
            createExam(this.form).then(res => {
              this.$message({
                type: 'success',
                message: '保存成功'
              })
              // this.$refs.examForm.clearValidate()
              this.$emit('dialogClose')
            })
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>
