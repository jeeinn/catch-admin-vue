import * as curd from './curd'
import store from '@/store'

export default {
  data() {
    return {
      formVisible: false,
      data: [],
      id: null,
      selectedIds: [],
      title: '新增',
      paginate: {
        sizes: [10, 15, 20, 30, 50],
        limit: 10,
        layout: 'prev, pager, next, sizes',
        current: 0,
        total: 0
      },
      queryParam: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 列表请求
    getList(params = null) {
      const query = params ? params : this.queryParam
      this.$http.get(this.url, { params: query }).then(response => {
        this.data = response.data
        this.handlePaginateResponse(response)
      })
    },
    // 弹出层
    handleCreate() {
      curd.create.apply(this)
    },
    // 新增
    handleSubmit() {
      curd.submitForm.apply(this, [this.url])
      this.formVisible = false
      this.id = null
      this.handleRefresh()
    },
    // 更新
    handleUpdate(record, col, idx) {
      this.id = record[this.pk !== undefined ? this.pk : 'id']
      curd.update.apply(this, [record])
    },
    // 删除
    handleDelete(id) {
      curd.del.apply(this, [this.url + '/' + id, '确定删除吗?'])
    },
    // 关闭
    handleCancel() {
      this.formVisible = false
      // 防止提交关闭的时候 导致数据清空 所以延迟 300ms 清空数据
      setTimeout(this.resetFormFields, 300)
      this.$refs[this.formName].clearValidate()
    },
    // 批量删除
    handleMultiDelete() {
      curd.multiDel.apply(this, [this.url, '确定批量删除吗？'])
    },
    // 搜索
    handleSearch() {
      this.getList()
    },
    // 刷新
    handleRefresh() {
      Object.keys(this.queryParam).forEach((k) => {
        // 如果未设置默认搜索参数，刷新将会清空搜索
        if (this.defaultQueryParam === undefined) {
          this.queryParam[k] = ''
        } else {
          // 清空不包含默认搜索参数
          if (this.defaultQueryParam.indexOf(k) === -1) {
            this.queryParam[k] = ''
          }
        }
      })
      // 分页
      if (this.paginate.total) {
        this.queryParam.limit = this.paginate.limit
        this.queryParam.page = 1
      }
      this.handleSearch()
    },
    // 选择全部
    handleSelectMulti(data) {
      this.selectedIds = []
      data.forEach(item => {
        this.selectedIds.push(item.id)
      })
    },
    resetFormFields() {
      Object.keys(this.formFieldsData).forEach((k) => {
        switch (typeof this.formFieldsData[k]) {
          case 'object':
            this.formFieldsData[k] = []
            break
          case 'bigint':
            this.formFieldsData[k] = 1
            break
          case 'number':
            this.formFieldsData[k] = 1
            break
          case 'string':
            this.formFieldsData[k] = ''
            break
          default:
            break

            // eslint-disable-next-line no-unreachable
            if (this.formFieldsDefaultValues !== undefined && this.formFieldsDefaultValues.indexOf(k)) {
              this.formFieldsData[k] = this.formFieldsDefaultValues[k]
            }
        }
      })
    },
    // 更新用户信息
    handleUpdateUserInfo() {
      store.dispatch('user/getInfo').then(response => {
        const { roles, permissions } = response
        store.dispatch('permission/generateRoutes', [roles, permissions]).then(r => {})
      })
    },
    handleSizeChange(val) {
      this.handlePaginateParams(val)
    },
    handleCurrentChange(val) {
      this.handlePaginateParams(0, val)
    },
    // 处理分页参数
    handlePaginateParams(limit = 0, page = 0) {
      if (limit) {
        this.queryParam.limit = limit
        this.paginate.limit = limit
      }
      if (page) {
        this.queryParam.page = page
        this.paginate.current = page
      }
      this.handleSearch()
    },
    handlePaginateResponse(response) {
      if (response.limit !== undefined) {
        this.paginate.total = response.count
        this.paginate.limit = response.limit
        this.paginate.current = response.current
      }
    }
  }
}
