<template>
  <div class="player" v-if="playList.length > 0">
    <transition name="normal">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="this.imageOne">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle">
          <div class="middle-l">
            <div class="cd-wrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="this.imageOne">
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <!-- 进度条组件 -->
              <progress-bar @percentChange="onProgressBarChange" :percent="percent"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i class="icon-sequence"></i>
            </div>
            <div class="icon i-left">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center">
              <i @click="isPlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- 底部播放器 -->
    <transition name="mini">
      <div>
        <div class="progress-mini-bar" ref="progressMiniBar" v-show="!fullScreen"></div>
        <div @click="open" class="mini-player" ref="miniPlayer" v-show="!fullScreen">
          <div class="icon">
            <div class="img-wrapper">
              <img :class="cdCls" width="40" height="40" :src="this.imageOne">
            </div>
          </div>
          <div class="text">
            <h2 class="name" v-html="currentSong.name"></h2>
            <p class="desc" v-html="currentSong.singer"></p>
          </div>
          <div class="control">
            <i @click.stop="isPlaying" :class="miniIcon"></i>
          </div>
          <div class="control">
            <i class="icon-playlist"></i>
          </div>
        </div>
      </div>
    </transition>
    <audio ref="audio" :src="currentSong.url" @canplay="ready"
            @error="error" @timeupdate="updateTime"></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import ProgressBar from 'base/progress-bar/progress-bar'

export default {
  data () {
    return {
      songReady: false,
      currentTime: 0
    }
  },
  computed: {
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    percent () {
      return this.currentTime / this.currentSong.duration
    },
    ...mapGetters([
      'fullScreen',
      'playList',
      'currentSong',
      'playing',
      'currentIndex'
    ]),
    imageOne () {
      return this.currentSong.image ? this.currentSong.image : ''
    }
  },
  methods: {
    back () {
      this.setFullScreen(false)
    },
    open () {
      this.setFullScreen(true)
    },
    isPlaying () {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
    },
    prev () {
      if (!this.songReady) {
        return
      }
      let index = this.currentIndex - 1
      if (index === -1) {
        index = this.playList.length - 1
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.isPlaying()
      }
      this.songReady = false
    },
    next () {
      if (!this.songReady) {
        return
      }
      let index = this.currentIndex + 1
      if (index === this.playList.length) {
        index = 0
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.isPlaying()
      }
      this.songReady = false
    },
    // 限制快速点击时的报错，只有当songReady为true，才能点击
    ready () {
      this.songReady = true
    },
    // 避免当歌曲失效时，整个dom无法运行
    error () {
      this.songReady = true
    },
    // 获取音频播放时间进度
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    // 将获得的时间戳转换为分秒
    format (interval) {
      interval = interval | 0
      const minute = interval / 60 | 0
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    // 补零
    _pad (num) {
      return num < 10 ? '0' + num : num
    },
    onProgressBarChange (percent) {
      this.$refs.audio.currentTime = this.currentSong.duration * percent
      if (!this.playing) {
        this.isPlaying()
      }
    },
    // 改变mini播放器进度条
    _miniProgressBar (newP) {
      const miniWidth = this.$refs.miniPlayer.clientWidth
      const offsetWidth = miniWidth * newP
      this.$refs.progressMiniBar.style.width = `${offsetWidth}px`
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX'
    })
  },
  watch: {
    currentSong () {
      this.$nextTick(() => {
        this.$refs.audio.play()
      })
    },
    playing (newPlaying) {
      this.$nextTick(() => {
        const _audio = this.$refs.audio
        newPlaying ? _audio.play() : _audio.pause()
      })
    },
    percent (newP) {
      this._miniProgressBar(newP)
    }
  },
  components: {
    ProgressBar
  }
}
</script>

<style scoped lang="stylus">
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.player
  .normal-player
    position: fixed
    top: 0
    right: 0
    left: 0
    bottom: 0
    z-index: 150
    background: $color-background
    .background
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
      opacity: 0.6
      z-index: -1
      // css3 补
      filter: blur(20px)
    .top
      position: relative
      .back
        position: absolute
        top: 0
        left: 6px
        z-index: 50
        .icon-back
          display: block
          padding: 10px
          color: $color-theme
          font-size: $font-size-large-x
          transform: rotate(-90deg)
      .title
        width: 70%
        margin: 0 auto
        line-height: 40px
        text-align: center
        font-size: $font-size-large
        color: $color-text
      .subtitle
        line-height: 20px
        text-align: center
        color: $color-text
        font-size: $font-size-medium
    .middle
      position: fixed
      width: 100%
      top: 80px
      bottom: 180px
      white-space: nowrap
      font-size: 0
      .middle-l
        display: inline-block
        vertical-align: top
        position: relative
        width: 100%
        height: 0
        padding-bottom: 80%
        .cd-wrapper
          position: absolute
          top: 0
          left: 10%
          width: 80%
          box-sizing: border-box
          height: 100%
          .cd
            width: 100%
            height: 100%
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused
            .image
              position: absolute
              left: 0
              top: 0
              width: 100%
              height: 100%
              box-sizing: border-box
              border-radius: 50%
              border: 10px solid rgba(255, 255, 255, .1)
    .bottom
      position: absolute
      bottom: 50px
      width: 100%
      .progress-wrapper
        display: flex
        align-items: center
        width: 80%
        padding: 10px 0
        margin: 0 auto
        .time
          color: $color-text
          font-size: $font-size-small
          width: 30px
          line-height: 30px
          &.time-r
            text-align: right
          &.time-l
            text-align: left
        .progress-bar-wrapper
          flex: 1
      .operators
        display: flex
        align-items: center
        .icon
          flex: 1
          color: $color-theme
          i
            font-size: 30px
        .i-left
          text-align: right
        .i-center
          padding: 0 20px
          text-align: center
          i
            font-size: 40px
        .i-right
          text-align: left
    &.normal-enter-active, &.normal-leave-active
      transition: all .4s
      .top, .bottom
        transition: all .4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      .middle
        transition: all .4s
    &.normal-enter, &.normal-leave-to
      opacity: 0
      .top
        transform: translate3d(0, -100px, 0)
      .bottom
        transform: translate3d(0, 100px, 0)
      .middle
        transform: scale(0)
  .progress-mini-bar
    position: absolute
    // width: 100%
    bottom: 58px
    height: 2px
    background: $color-theme
    z-index: 999
  .mini-player
    display: flex
    align-items: center
    position: fixed
    left: 0
    bottom: 0
    z-index: 180
    width: 100%
    height: 60px
    background: $color-highlight-background
    .icon
      flex: 0 0 40px
      width: 40px
      height: 40px
      padding: 10px 20px
      .img-wrapper
        width: 100%
        height: 100%
        img
          border-radius: 50%
          &.play
              animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
    &.mini-enter-active, &.mini-leave-active
      transition: all .4s
    &.mini-enter, &.mini-leave-to
      opacity: 0
    .text
      display: flex
      flex-direction: column
      justify-content: center
      flex: 1
      line-height: 20px
      overflow: hidden
      .name
        margin-bottom: 2px
        no-wrap()
        font-size: $font-size-medium
        color: $color-text
      .desc
        no-wrap()
        font-size: $font-size-small
        color: $color-text-d
    .control
      flex: 0 0 30px
      width: 30px
      padding: 0 10px
      // background: #fff
      .icon-playlist, .icon-play-mini, .icon-pause-mini
        font-size: 30px
        color: $color-theme

@keyframes rotate
  0%
    transform: rotate(0)
  100%
    transform: rotate(360deg)
</style>