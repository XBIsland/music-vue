<template>
  <div class="recommend">
    <scroll class="recommend-content" :data="discList">
      <div>
        <slider :list="sliderPic"></slider>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="(item,index) in discList" class="item" :key="index">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl" >
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc">{{item.dissname}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-content" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import { getRecommend, getDiscList } from 'api/recommend'
import { ERR_OK } from 'api/config'
import Slider from 'base/slider/slider'
import Loading from 'base/loading/loading'

export default {
  components: {
    Slider,
    Scroll,
    Loading
  },
  data () {
    return {
      sliderPic: [],
      discList: []
    }
  },
  created () {
    this._getDiscList()
    this._getRecommend()
  },
  methods: {
    _getRecommend () {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          const data = res.data
          this.sliderPic = data.slider
        }
      })
    },
    _getDiscList () {
      getDiscList().then((res) => {
        if (res.code === ERR_OK) {
          const data = res.data
          this.discList = data.list
        }
      })
    }
  }
}
</script>

<style scoped lang="stylus">
@import '~common/stylus/variable'
@import '~common/stylus/mixin'
.recommend
  overflow: hidden
  position: absolute
  width: 100%
  top: 88px
  bottom: 0
  .recommend-content
    height: 100%
.recommend-list
  .list-title
    height: 65px
    line-height: 65px
    text-align: center
    font-size: $font-size-medium
    color: $color-theme
  .item
    display: flex
    box-sizing: border-box
    padding: 0 20px 20px 20px
    // text-align: center
    .icon
      padding-right: 20px
    .text
      display: flex
      flex-direction: column
      justify-content: center
      flex: 1
      line-height: 30px
      overflow: hidden
      .name
        color: $color-text
      .desc
        color: $color-text-d
        font-size: $font-size-medium
.loading-content
  position: absolute
  width: 100%
  top: 50%
</style>
