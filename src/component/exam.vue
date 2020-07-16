<template>
  <el-dialog
    title="新建考试"
    :visible.sync="isShow"
    top="0"
    width="1000px"
    class="size-nomal-dialog"
    :close-on-click-modal="false"
    @closed="handleClose"
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
            <el-select v-model="form.semesterId">
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
            <el-select v-model="form.testId">
              <el-option v-for="option in testList" :key="option.id" :label="option.name" :value="option.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="11">
          <el-form-item label="文理" prop="testType">
            <el-select v-model="form.testType" placeholder="请选择">
              <el-option v-for="type in typeList" :key="type.id" :label="type.name" :value="type.id" />
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
            <el-select v-model="item.subjectId" placeholder="">
              <el-option v-for="option in subjectList" :key="option.id" :label="option.name" :value="option.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item
            label="资源"
            :prop="'bankAnnexList.' + index + '.bankAnnexName'"
            :rules="{
              required: true, message: '资源不能为空', trigger: ['change']
            }"
          >
            <el-input v-model="item.bankAnnexName" class="fileUpInput" readonly @input="changeBankAnnexName(item.bankAnnexId, index)">
              <el-upload
                slot="append"
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
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="2">
          <div class="margin-left-size-small margin-top-size-mix">
            <i class="icon icon-add-solid-o blue pointer size-large-xx margin-right-size-mix" @click="addSuject(index)" />
            <i class="icon icon-minus-solid-o red pointer size-large-xx" @click="delSubject(index)" />
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="9" :offset="13">
          <div>
            <span class="text-color-grey">.ppt .pptx .pdf .doc .docx .mp3 .mp4等格式文件</span>
          </div>
          <div v-if="progress" class="progress">
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
import { getSemesterByYearId, getSubjectByGradeId, createExam, editExamById, editExam, uploadResource } from '@/api/index'
import OSS from 'ali-oss'
import { v4 as uuidv4 } from 'uuid'

let PATH = null

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
      client: null,
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
          bankAnnexId: '',
          contentType: ''
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
      examId: ''
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
        editExamById({ id: '' }).then(res => {
          this.academicYearList = res.academicYearList
          this.semesterList = res.semesterList
          this.gradeList = res.gradeList
          this.testList = res.testList
          this.subjectList = res.subjectList
        })
      } else {
        editExamById({ id: this.editExamId }).then(res => {
          this.academicYearList = res.academicYearList
          this.semesterList = res.semesterList
          this.gradeList = res.gradeList
          this.testList = res.testList
          this.subjectList = res.subjectList
          for (const annex of res.bankAnnexList) {
            annex.createdDate = ''
          }
          this.$nextTick(function () {
            this.form.academicYear = res.academicYear
            this.form.academicYearName = res.academicYearName
            this.form.gradeId = res.gradeId
            this.form.gradeName = res.gradeName
            this.form.semesterId = res.semesterId
            this.form.semesterName = res.semesterName
            this.form.testId = res.testId
            this.form.testName = res.testName
            this.form.testType = res.testType
            this.form.bankAnnexList = res.bankAnnexList
          })
        })
      }
    },
    fileChange (file) {
      // 获取文件流
      this.fileObj = file.raw
    },
    beforeUpload (file, index) {
      if (file.name.indexOf('.') === -1) {
        this.$message.error('禁止上传无格式的文件！')
        return false
      }
      const extName = file.name.substring(file.name.lastIndexOf('.'))
      if (['.exe', '.cmd', '.bat', '.sh'].indexOf(extName) !== -1) {
        this.$message.error('禁止上传.exe, .cmd, .bat, .sh格式的文件！')
        return false
      }
      this.currentIndex = index
    },
    fileUpLoad (file, index) {
      if (!PATH) {
        const userStr = window.localStorage.getItem('user')
        PATH = userStr && JSON.parse(userStr).domainId + '/exam/'
      }
      if (!this.client) {
        this.client = new OSS({
          region: 'oss-cn-shenzhen',
          accessKeyId: 'LTAI4G2nbEWcDi9djnDY8tvJ',
          accessKeySecret: 'ZZN02tVv7BpJEhc5bWa2NlNIdL6Vvp',
          bucket: 'gtyzfile'
        })
      }
      const fileName = uuidv4().replace(/-/g, '') + this.fileObj.name.substring(this.fileObj.name.lastIndexOf('.'))
      return this.client.multipartUpload(PATH + fileName, this.fileObj, {
        progress: function (p) {
          file.onProgress({ percent: p * 100 })
        }
      }).then(function (res) {
        file.onSuccess(res, file)
      }).catch(err => {
        this.error = err
      })
    },
    uploadProgress (event, file) {
      this.progress = event.percent
      if (this.progress === 100) {
        setTimeout(() => {
          this.progress = 0
        }, 100)
      }
    },
    uploadOnSuccess (res, file) {
      if (!res) {
        return
      }
      const fileUuid = res.name.substring(res.name.lastIndexOf('/')).replace('/', '').replace(/\..*/, '')
      uploadResource({
        // contentType: 'string',
        displayName: file.name,
        // fileName: 'string',
        fileSize: file.size,
        id: fileUuid,
        // link2: res.res.requestUrls[0],
        relativePath: PATH
        // suffixName: '.mp4'
        // uploadIp: 'string'
      }).then(res2 => {
        this.form.bankAnnexList[this.currentIndex].bankAnnexId = res2.id
        this.form.bankAnnexList[this.currentIndex].contentType = res2.contentType
        this.form.bankAnnexList[this.currentIndex].bankAnnexName = res2.displayName
      })
    },
    getSubjectByGradeId (val) {
      for (const item of this.form.bankAnnexList) {
        item.subjectId = ''
      }
      // 切换了年级，下面的学科被置空后不需要校验提示
      this.$nextTick(function () {
        const props = []
        for (let i = 0; i < this.form.bankAnnexList.length; i++) {
          props.push('bankAnnexList.' + i + '.subjectId')
        }
        this.$refs.examForm.clearValidate(props)
      })
      getSubjectByGradeId({ gradeId: val }).then(res => {
        this.subjectList = res
      })
    },
    getSemesterByYear (val) {
      this.semesterList = []
      this.form.semesterId = ''
      getSemesterByYearId({ academicYear: val }).then(res => {
        this.semesterList = res
      })
    },
    addSuject (index) {
      const item = {
        bankAnnexName: '',
        subjectId: '',
        subjectName: '',
        bankAnnexId: '',
        contentType: ''
      }
      this.form.bankAnnexList.splice(index + 1, 0, item)
    },
    delSubject (index) {
      if (this.form.bankAnnexList.length === 1) {
        this.$message.error('至少需要上传一个资源')
        return
      }
      this.form.bankAnnexList.splice(index, 1)
    },
    handleClose () {
      this.resetForm()
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
        testType: 0,
        bankAnnexList: [{
          bankAnnexName: '',
          subjectId: '',
          subjectName: '',
          bankAnnexId: '',
          contentType: ''
        }]
      }
      this.$nextTick(() => {
        this.$refs.examForm.clearValidate()
      })
    },
    saveForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          for (const item of this.academicYearList) {
            if (this.form.academicYear === item.id) {
              this.form.academicYearName = item.name
              break
            }
          }
          for (const item of this.semesterList) {
            if (this.form.semesterId === item.id) {
              this.form.semesterName = item.name
              break
            }
          }
          for (const item of this.gradeList) {
            if (this.form.gradeId === item.id) {
              this.form.gradeName = item.name
              break
            }
          }
          for (const item of this.testList) {
            if (this.form.testId === item.id) {
              this.form.testName = item.name
              break
            }
          }
          for (const item of this.form.bankAnnexList) {
            for (const item2 of this.subjectList) {
              if (item.subjectId === item2.id) {
                item.subjectName = item2.name
                break
              }
            }
          }
          if (this.isModify) {
            this.$set(this.form, 'id', this.editExamId)
            editExam(this.form).then(res => {
              this.$message({
                type: 'success',
                message: '编辑成功'
              })
              this.isShow = false
            })
          } else {
            this.$delete(this.form, 'id')
            createExam(this.form).then(res => {
              this.$message({
                type: 'success',
                message: '保存成功'
              })
              this.isShow = false
            })
          }
        }
      })
    }
  }
}
</script>
