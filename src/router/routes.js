import Layout from '@page/layout.vue'

import Detail from '@page/detail.vue'

import View from '@page/view.vue'

const testBankLayout = {
  path: '/mfs-testBank',
  component: Layout
}

const testBankDetail = {
  name: 'detail',
  path: '/mfs-testBank/detail/:id',
  component: Detail
}

const fileView = {
  name: 'view',
  path: '/mfs-testBank/detail/fileView/:url',
  component: View
}

export default [testBankLayout, testBankDetail, fileView]
