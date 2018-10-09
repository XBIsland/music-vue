<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" v-show="songs.length > 0" ref="playBtn" @click="random">
          <i class="icon-play"></i>
        </div>
      </div>
      <div class="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" :data="songs" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list @select="selectItem" :songs="songs"></song-list>
      </div>
      <loading></loading>
    </scroll>
  </div>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import Loading from 'base/loading/loading'
import { mapActions } from 'vuex'
import { playlistMixin } from 'common/js/mixin'

const RE_HEIGHT = 40

export default {
  mixins: [playlistMixin],
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: []
    },
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      scrollY: 0
    }
  },
  computed: {
    bgStyle () {
      return `background-image:url(${this.bgImage})`
    }
  },
  mounted () {
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.minTranlateY = -this.imageHeight + 40
    this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
  },
  created () {
    this.probeType = 3
    this.listenScroll = true
  },
  methods: {
    handlePlaylist (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    scroll (pos) {
      this.scrollY = pos.y
    },
    back () {
      this.$router.back()
    },
    selectItem (item, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
      // console.log(this.songs)
    },
    random () {
      this.randomPlay({
        list: this.songs
      })
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  watch: {
    scrollY (newY) {
      let translateY = Math.max(this.minTranlateY, newY)
      let zIndex = 0
      let scale = 1
      this.$refs.layer.style['transform'] = `translate3d(0, ${translateY}px, 0)`
      this.$refs.layer.style['webkitTransform'] = `translate3d(0, ${translateY}px, 0)`
      // 一个牛逼的算法
      const percent = Math.abs(newY / this.imageHeight)
      if (newY > 0) {
        scale = 1 + percent
        zIndex = 10
      }
      if (newY < this.minTranlateY) {
        zIndex = 10
        this.$refs.bgImage.style.paddingBottom = 0
        this.$refs.bgImage.style.height = `${RE_HEIGHT}px`
        this.$refs.playBtn.style.display = 'none'
      } else {
        this.$refs.bgImage.style.paddingBottom = `70%`
        this.$refs.bgImage.style.height = 0
        this.$refs.playBtn.style.display = 'block'
      }
      this.$refs.bgImage.style.zIndex = zIndex
      this.$refs.bgImage.style['transform'] = `scale(${scale})`
      this.$refs.bgImage.style['webkitTransform'] = `scale(${scale})`
    }
  },
  components: {
    Scroll,
    SongList,
    Loading
  }
}
</script>

<style scoped lang="stylus">
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.music-list
  position: fixed
  z-index: 100
  top: 0
  left: 0
  bottom: 0
  right: 0
  background: $color-background
  .back
    position: absolute
    top: 0
    left: 6px
    z-index: 50
    .icon-back
      display: block
      color: $color-theme
      font-size: $font-size-large-x
      padding: 10px
  .title
    position: absolute
    top: 0
    left: 10%
    text-align: center
    color: $color-text
    font-size: $font-size-large
    width: 80%
    line-height: 42px
    z-index: 50
    no-wrap()
  .bg-image
    position: relative
    width: 100%
    height: 0
    padding-bottom: 70%
    transform-origin: top
    background-size: cover
    .play-wrapper
      position: absolute
      bottom: 20px
      z-index: 50
      width: 100%
      .play
        text-align: center
        color: $color-theme
        font-size: 0
        .icon-play
          // display: inline-block
          // vertical-align: middle
          // margin-right: 6px
          font-size: 30px
    .filter
      position: absolute
      width: 100%
      height: 100%
      background: rgba(7, 17, 27, 0.4)
  .bg-layer
    position: relative
    width: 100%
    height: 100%
    background: $color-background
  .list
    position: absolute
    // overflow: hidden
    // top: 0
    bottom: 0
    width: 100%
    background: $color-background
    .song-list-wrapper
      padding: 20px 30px
</style>
