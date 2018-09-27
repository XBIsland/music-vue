<template>
  <div class="wapper">
    <swiper :options="swiperOption" v-if="showSlider">
      <swiper-slide v-for="item of list" :key="item.id">
        <a :href="item.linkUrl">
          <img class="slider-img needsclick" :src="item.picUrl" />
        </a>
      </swiper-slide>
      <div class="swiper-pagination"  slot="pagination"></div>
    </swiper>
  </div>
</template>

<script>

export default {
  name: 'Slider',
  props: {
    list: Array
  },
  data () {
    return {
      swiperOption: {
        pagination: '.swiper-pagination',
        loop: true,
        autoplay: 3000,
        autoplayDisableOnInteraction: false
      }
    }
  },
  computed: {
    showSlider () {
      return this.list.length
    }
  }
}
</script>

<style scoped lang="stylus">
@import '~common/stylus/variable'
.wapper >>> .swiper-pagination-bullet
  background-color: #fff
  opacity: .5
.wapper >>> .swiper-pagination-bullet-active
  width: 20px
  border-radius: 5px
  background-color: $color-text-ll
  opacity: .8
.wapper
  width: 100%
  height: 0
  padding-bottom: 40%
  overflow: hidden
  .slider-img
    width: 100%
</style>
