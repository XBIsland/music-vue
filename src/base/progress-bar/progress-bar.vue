<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend.prevent="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>

const PROGRESS_BTN_WIDTH = 16
const PROGRESS_BTN_LEFT = -8

export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  mounted () {
    this.BAR_WIDTH = this.$refs.progressBar.clientWidth - PROGRESS_BTN_WIDTH
  },
  created () {
    // 用于记录触摸的数据，便于触摸事件之间数据应用
    this.touch = {}
  },
  methods: {
    progressTouchStart (e) {
      // 表示初始化成功
      this.touch.initiated = true
      // 记录当前触摸位置
      this.touch.startX = e.touches[0].pageX
      // 记录当前进度条的宽度
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      // 相比原位置偏移量
      const deltaX = e.touches[0].pageX - this.touch.startX
      // 相对整个进度偏移量
      const offsetWidth = Math.min(this.BAR_WIDTH, Math.max(0, this.touch.left + deltaX))
      const BtnLeft = PROGRESS_BTN_LEFT + offsetWidth
      // 让进度条改变，圆点改变
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style.left = `${BtnLeft}px`
    },
    progressTouchEnd () {
      this.touch.initiated = false
      this._triggerPercent()
    },
    // 向外发送进度条拉升后的比例
    _triggerPercent () {
      const percent = this.$refs.progress.clientWidth / this.BAR_WIDTH
      this.$emit('percentChange', percent)
    },
    progressClick (e) {
      // getBoundingClientRect返回元素的大小及其相对于视口的位置
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.clientX - rect.left
      const BtnLeft = PROGRESS_BTN_LEFT + offsetWidth
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style.left = `${BtnLeft}px`
      this._triggerPercent()
    }
  },
  watch: {
    percent (newPercent) {
      if (newPercent >= 0 && !this.touch.initiated) {
        // const BAR_WIDTH = this.$refs.progressBar.clientWidth - PROGRESS_BTN_WIDTH
        const offsetWidth = newPercent * this.BAR_WIDTH
        const BtnLeft = PROGRESS_BTN_LEFT + offsetWidth
        // 让进度条改变，圆点改变
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style.left = `${BtnLeft}px`
      }
    }
  }
}
</script>

<style scoped lang='stylus'>
@import '~common/stylus/variable'

.progress-bar
  height: 30px
  .bar-inner
    position: relative
    top: 13px
    height: 4px
    background: rgba(0, 0, 0, 0.3)
    .progress
      position: absolute
      background: $color-theme
      height: 100%
    .progress-btn-wrapper
      position: absolute
      top: -13px
      left: -8px
      width: 30px
      height: 30px
      .progress-btn
        position: relative
        width: 16px
        height: 16px
        top: 7px
        left: 7px
        box-sizing: border-box
        border: 3px solid $color-text
        border-radius: 50%
        background: $color-theme
</style>
