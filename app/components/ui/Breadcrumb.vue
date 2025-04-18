/* eslint-disable */
<script lang="ts">
import type { AvatarProps, LinkProps } from '#ui/types'
import type { DynamicSlots, PartialString } from '#ui/types/utils'
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '#build/ui/breadcrumb'
import { tv } from 'tailwind-variants'
</script>

<script setup lang="ts" generic="T extends BreadcrumbItem">
import { useAppConfig } from '#imports'
import UAvatar from '#ui/components/Avatar.vue'
import UIcon from '#ui/components/Icon.vue'
import ULink from '#ui/components/Link.vue'
import ULinkBase from '#ui/components/LinkBase.vue'
import { pickLinkProps } from '#ui/utils/link'
import { Primitive } from 'radix-vue'

const props = defineProps<BreadcrumbProps<T>>()

const slots = defineSlots<BreadcrumbSlots<T>>()

const appConfig = _appConfig as AppConfig & { ui: { breadcrumb: Partial<typeof theme> } }

const breadcrumb = tv({ extend: tv(theme), ...(appConfig.ui?.breadcrumb || {}) })

export interface BreadcrumbItem extends Omit<LinkProps, 'raw' | 'custom'> {
  label?: string
  icon?: string
  avatar?: AvatarProps
  slot?: string
}

export interface BreadcrumbProps<T> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  items?: T[]
  /**
   * The icon to use as a separator.
   * @defaultValue appConfig.ui.icons.chevronRight
   */
  separatorIcon?: string
  class?: any
  ui?: PartialString<typeof breadcrumb.slots>
}

type SlotProps<T> = (props: { item: T, index: number, active?: boolean }) => any

export type BreadcrumbSlots<T extends { slot?: string }> = {
  'item': SlotProps<T>
  'item-leading': SlotProps<T>
  'item-label': SlotProps<T>
  'item-trailing': SlotProps<T>
  'separator': (props?: {}) => any
} & DynamicSlots<T, SlotProps<T>>

const appConfig = useAppConfig()

const ui = breadcrumb()
</script>

<template>
  <Primitive :as="as" aria-label="breadcrumb" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <ol :class="ui.list({ class: props.ui?.list })">
      <template v-for="(item, index) in items" :key="index">
        <li :class="ui.item({ class: props.ui?.item })">
          <ULink v-slot="{ active, ...slotProps }" v-bind="pickLinkProps(item)" custom>
            <ULinkBase v-bind="slotProps" as="span" :aria-current="active && (index === items!.length - 1) ? 'page' : undefined" :class="ui.link({ class: [props.ui?.link, item.class], active: index === items!.length - 1, disabled: !!item.disabled, to: !!item.to })">
              <slot :name="item.slot || 'item'" :item="item" :index="index">
                <slot :name="item.slot ? `${item.slot}-leading` : 'item-leading'" :item="item" :active="index === items!.length - 1" :index="index">
                  <UAvatar v-if="item.avatar" :size="((props.ui?.linkLeadingAvatarSize || ui.linkLeadingAvatarSize()) as AvatarProps['size'])" v-bind="item.avatar" :class="ui.linkLeadingAvatar({ class: props.ui?.linkLeadingAvatar, active: index === items!.length - 1 })" />
                  <UIcon v-else-if="item.icon" :name="item.icon" :class="ui.linkLeadingIcon({ class: props.ui?.linkLeadingIcon, active: index === items!.length - 1 })" />
                </slot>

                <span v-if="item.label || !!slots[item.slot ? `${item.slot}-label` : 'item-label']" :class="ui.linkLabel({ class: props.ui?.linkLabel })">
                  <slot :name="item.slot ? `${item.slot}-label` : 'item-label'" :item="item" :active="index === items!.length - 1" :index="index">
                    {{ item.label }}
                  </slot>
                </span>

                <slot :name="item.slot ? `${item.slot}-trailing` : 'item-trailing'" :item="item" :active="index === items!.length - 1" :index="index" />
              </slot>
            </ULinkBase>
          </ULink>
        </li>

        <li v-if="index < items!.length - 1" role="presentation" :class="ui.separator({ class: props.ui?.separator })">
          <slot name="separator">
            <UIcon :name="separatorIcon || appConfig.ui.icons.chevronRight" :class="ui.separatorIcon({ class: props.ui?.separatorIcon })" />
          </slot>
        </li>
      </template>
    </ol>
  </Primitive>
</template>
