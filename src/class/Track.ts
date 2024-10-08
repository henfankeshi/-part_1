import type { AudioTrack } from './AudioTrack'
import type { ImageTrack } from './ImageTrack'
import type { TextTrack } from './TextTrack'
import type { VideoTrack } from './VideoTrack'

export type Track = AudioTrack | ImageTrack | TextTrack | VideoTrack

export interface TrackLineItem {
  type: Track['type']
  main?: boolean
  list: Track[]
}
