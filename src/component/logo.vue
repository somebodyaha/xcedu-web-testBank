<template>
  <img :src="logo" alt="" style="height: 40px">
</template>
<script>
import { getUserInfo } from '@/api/index'

export default {
  data () {
    return {
      logo: ''
    }
  },
  mounted () {
    getUserInfo().then(res => {
      this.logo = '/' + res.logo
    })
  }
}
</script>
