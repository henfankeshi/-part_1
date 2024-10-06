<script setup lang="ts">
import { AudioTrack } from '@/class/AudioTrack'
import { usePageState } from '@/stores/pageState'
import { usePlayerState } from '@/stores/playerState'
import { useTrackState } from '@/stores/trackState'
import { createFileWriter } from '@/utils/common'
import { Download, Moon, Sunny } from '@element-plus/icons-vue'
import { Combinator, type OffscreenSprite } from '@webav/av-cliper'
import { ElLoading, ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import type { Track } from '@/class/Track'

const trackState = useTrackState()

const playerState = usePlayerState()

const store = usePageState()
const size = ref(14)
const inner = ref(true)
const switchClass = computed(() => ({
  '--el-switch-border-color': store.isDark ? '#4B5563' : '#D1D5DB',
  '--el-color-white': store.isDark ? '#F3F4F6' : '#374151',
}))

async function onGenerate() {
  const loading = ElLoading.service({ text: '正在合成视频' })
  const start = performance.now()
  const sprs: Promise<OffscreenSprite>[] = []
  // 使用OffscreenSprite和Combinator进行视频合成
  for (const track of trackState.trackList.reduce((res, { list }) => res.concat(list), [] as Track[])) {
    if (track instanceof AudioTrack) {
      sprs.push(toRaw(track).combine())
    }
    else {
      sprs.push(toRaw(track).combine({ width: playerState.playerWidth, height: playerState.playerHeight }, 6))
    }
  }

  const sprites = await Promise.all(sprs)

  console.log('生成sprite耗时', performance.now() - start, 'ms')

  const com = new Combinator({
    width: 1080,
    height: 1920,
    bgColor: 'black',
  })

  await Promise.all(sprites.map((sprite, index) => {
    sprite.zIndex = 999 - index
    return com.addSprite(sprite)
  }))

  console.log('合成耗时', performance.now() - start, 'ms')

  await com.output().pipeTo(await createFileWriter())

  loading.close()

  ElMessage.success('合成视频成功')

  console.log('导出文件耗时', performance.now() - start, 'ms')
}

</script>

<template>
  <header class="h-14 w-full flex flex-nowrap flex-row items-center justify-between border-b dark:border-b-2 dark:border-darker border-gray-200">
    <div class="flex w-1/3 pl-2 items-center">
      <div class="ml-2">
      </div>
      <!-- <span class="text-xs select-none ml-4">自动保存：2023-02-10 00:51</span> -->
    </div>
    <div class="flex w-1/3 flex-row-reverse pr-10 items-center">
      <ElButton color="#683CFD" size="default" @click="onGenerate">
        <ElIcon :size="size" color="#fff" class="mr-1">
          <Download />
        </ElIcon>
        合成视频
      </ElButton>
      <el-switch
        v-model="store.isDark"
        class="mr-10"
        size="large"
        :active-icon="Moon"
        :inactive-icon="Sunny"
        :inline-prompt="inner"
        :style="switchClass"
      />
    </div>
  </header>
</template>

<style>
.github-icon {
  fill: currentColor;
}
</style>
