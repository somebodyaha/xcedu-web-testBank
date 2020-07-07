<template>
  <div class="app-testBank-header-btns">
    <el-avatar v-if="user.avatar" :src="user.avatar" />
    <el-avatar v-else class="bgcolor"> {{ user.name }} </el-avatar>
    <!-- <i class="icon icon-home color" /> -->
    <!-- <i class="icon icon-logout color" /> -->
  </div>
</template>
<script>
import { getUserInfo } from '@/api/index'
export default {
  data () {
    return {
      user: ''
    }
  },
  mounted () {
    getUserInfo().then(res => {
      this.user = res
    })
  }
}
</script>
