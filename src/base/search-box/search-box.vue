<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" class="box" v-model="query" :placeholder="placeholder" />
    <i @click="clear" class="icon-dismiss" v-show="query"></i>
  </div>
</template>

<script>
import { debounce } from 'common/js/utiliy'

export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  data () {
    return {
      query: ''
    }
  },
  methods: {
    clear () {
      this.query = ''
    },
    setQuery (query) {
      this.query = query
    },
    blur () {
      this.$refs.query.blur()
    }
  },
  created () {
    this.$watch('query', debounce((newQuery) => {
      this.$emit('query', newQuery)
    }, 200))
  }
}
</script>

<style scoped lang="stylus">
@import "~common/stylus/variable"

.search-box
  display: flex
  align-items: center
  box-sizing: border-box
  width: 100%
  padding: 0 6px
  height: 40px
  background: $color-highlight-background
  border-radius: 6px
  .icon-search
    font-size: 24px
    color: $color-background
  .box
    flex: 1
    margin: 0 5px
    background: $color-highlight-background
    line-height: 18px
    color: $color-text
    // 去除输入框轮廓
    outline: 0
    font-size: $font-size-medium
  .icon-dismiss
    font-size: 16px
    color: $color-background
</style>
