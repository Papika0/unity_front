declare module 'vue-virtual-scroller' {
  import { DefineComponent } from 'vue'

  export interface RecycleScrollerProps {
    items: unknown[]
    itemSize: number | null
    keyField?: string
    buffer?: number
    listTag?: string
    itemTag?: string
    minItemSize?: number
    direction?: 'vertical' | 'horizontal'
    prerender?: number
  }

  export interface DynamicScrollerProps {
    items: unknown[]
    minItemSize: number | string
    keyField?: string
  }

  export interface DynamicScrollerItemProps {
    item: unknown
    active: boolean
    sizeDependencies?: unknown[]
    watchData?: boolean
  }

  export const RecycleScroller: DefineComponent<RecycleScrollerProps>
  export const DynamicScroller: DefineComponent<DynamicScrollerProps>
  export const DynamicScrollerItem: DefineComponent<DynamicScrollerItemProps>
}
