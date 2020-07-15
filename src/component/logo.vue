<template>
  <img v-if="logo" :src="logoUrl" alt="" style="height: 40px">
</template>
<script>
import { getUserInfo } from '@/api/index'

export default {
  data () {
    return {
      logo: ''
    }
  },
  computed: {
    logoUrl: function () {
      return '/api/v1/' + this.logo + '&access_token=' + localStorage.getItem('token')
    }
  },
  mounted () {
    getUserInfo().then(res => {
      this.logo = res.logo
    })
  }
}
</script>
