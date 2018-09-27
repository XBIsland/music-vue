<template>
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bgImage="bgImage"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSingerDetail } from 'api/singer'
import { ERR_OK } from 'api/config'
// import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'
import { createSong } from 'common/js/song'
import MusicList from 'components/music-list/music-list'

export default {
  computed: {
    title () {
      return this.singer.name
    },
    bgImage () {
      // console.log(this.singer.avater)
      return this.singer.avater
    },
    // 映射state的数据到当前实例
    ...mapGetters([
      'singer'
    ])
  },
  data () {
    return {
      songs: []
    }
  },
  created () {
    this._getDetail()
  },
  methods: {
    _getDetail () {
      // 如果用户在歌手详情页刷新，会获取不到singer的数据，所以让网页回退到歌手页面
      if (!this.singer.id) {
        this.$router.push('/singer')
      }
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.data.list)
          // console.log(this.songs)
        }
      })
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach((item) => {
        // 解构赋值
        let {musicData} = item
        if (musicData.songid && musicData.albumid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang="stylus">
@import '~common/stylus/variable'
// 转场动画
.slide-enter-active,.slide-leave-active
  transition: all .3s
.slide-enter,.slide-leave-to
  transform: translate3d(100%, 0, 0)
</style>
