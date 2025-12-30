declare module 'vue-virtual-scroller' {
  import { DefineComponent } from 'vue'

  export interface RecycleScrollerProps {
    items: any[]
    itemSize: number | null
    keyField?: string
    buffer?: number
    listTag?: string
    itemTag?: string
    minItemSize?: number
    direction?: 'vertical' | 'horizontal'
    prerender?: number
  }

  export const RecycleScroller: DefineComponent<RecycleScrollerProps>
  export const DynamicScroller: DefineComponent<any>
  export const DynamicScrollerItem: DefineComponent<any>
}
