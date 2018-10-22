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
        <div class="middle" @click="cdOfLyric">
          <transition name="midl">
            <div class="middle-l" v-show="isShowCd">
              <div class="cd-wrapper">
                <div class="cd" :class="cdCls">
                  <img class="image" :src="this.imageOne">
                </div>
              </div>
              <!-- cd页面歌词 -->
              <div class="playing-lyric-wrapper">
                <div class="playing-lyric">{{playingLyric}}</div>
              </div>
            </div>
          </transition>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text" ref="lyricLine"
                   :class="{'current': curreentLineNum === index}"
                   v-for="(line, index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
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
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
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
    <audio ref="audio" :src="currentSong.url" @play="ready"
            @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import ProgressBar from 'base/progress-bar/progress-bar'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/utiliy'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'

export default {
  data () {
    return {
      songReady: false,
      currentTime: 0,
      minipercent: 0,
      currentLyric: null,
      curreentLineNum: 0,
      isShowCd: true,
      playingLyric: ''
    }
  },
  computed: {
    ...mapGetters([
      'fullScreen',
      'playList',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'sequenceList'
    ]),
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    percent () {
      return this.currentTime / this.currentSong.duration
    },
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
      if (this.currentLyric) {
        // togglePlay() lyric-parser歌词暂停api
        this.currentLyric.togglePlay()
      }
    },
    prev () {
      if (!this.songReady) {
        return
      }
      if (this.playList.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playList.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.isPlaying()
        }
      }
    },
    next () {
      console.log('1')
      if (!this.songReady) {
        return
      }
      if (this.playList.length === 1) {
        this.loop()
        return
      } else {
        let index = this.currentIndex + 1
        if (index === this.playList.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.isPlaying()
        }
      }
    },
    loop () {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      if (this.currentLyric) {
        // lyric-parser api 偏移到歌词一开始
        this.currentLyric.seek(0)
      }
    },
    // audio播放结束触发ended事件,利用这个事件来搞自动下一首
    end () {
      // 判断当前播放模式是否为单曲循环
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
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
      this.minipercent = this.percent
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
      const currentTime = this.currentSong.duration * percent
      this.$refs.audio.currentTime = currentTime
      if (!this.playing) {
        this.isPlaying()
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    // 改变mini播放器进度条
    _miniProgressBar (newP) {
      // miniWidth为页面视口宽度
      const miniWidth = window.innerWidth
      const offsetWidth = miniWidth * newP
      this.$refs.progressMiniBar.style.width = `${offsetWidth}px`
    },
    // 改变Mode播放模式
    changeMode () {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      // 洗牌函数
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    // 改成random模式，同步修改currentIndex，保证歌曲不变
    resetCurrentIndex (list, song) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    // 利用Lyrci组件处理数据
    getLyric (mid) {
      this.currentSong.getLyric(mid).then((lyric) => {
        // if (this.currentLyric !== lyric) {
        //   return
        // }
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        // console.log(this.currentLyric)
        // 当playing为true时 同步播放
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.curreentLineNum = 0
      })
    },
    // 操作歌词高亮及自动滚动
    handleLyric ({lineNum, txt}) {
      this.curreentLineNum = lineNum
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    // 点击CD切换歌词，控制isShow来展示与否
    cdOfLyric () {
      this.isShowCd = !this.isShowCd
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    })
  },
  watch: {
    currentSong (newSong, oldSong) {
      // console.log(newSong.mid)
      // if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
      //   return
      // }
      this.songReady = false
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
      setTimeout(() => {
        this.$refs.audio.play()
        this.getLyric(newSong.mid)
      }, 1000)
    },
    playing (newPlaying) {
      this.$nextTick(() => {
        const _audio = this.$refs.audio
        // const _currentLyric = this.currentLyric
        newPlaying ? _audio.play() : _audio.pause()
        // newPlaying ? _currentLyric.play() : _currentLyric.stop()
      })
    },
    minipercent (newP) {
      if (newP) {
        this._miniProgressBar(newP)
      }
    }
  },
  components: {
    ProgressBar,
    Scroll
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
        no-wrap()
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
        &.midl-enter-active, &.midl-leave-active
          transition: all .2s
        &.midl-enter, &.midl-leave-to
          opacity: 0
        .playing-lyric-wrapper
          position: absolute
          bottom: -20%
          width: 100%
          overflow: hidden
          text-align: center
          .playing-lyric
            height: 20px
            line-height: 20px
            font-size: $font-size-medium
            color: $color-text-l
      .middle-r
        display: inline-block
        vertical-align: top
        width: 100%
        height: 100%
        overflow: hidden
        .lyric-wrapper
          width: 80%
          margin: 0 auto
          overflow: hidden
          text-align: center
          .text
            line-height: 32px
            color: $color-text-l
            font-size: $font-size-medium
            &.current
              color: $color-text
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
