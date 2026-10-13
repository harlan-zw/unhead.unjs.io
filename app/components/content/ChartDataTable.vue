<script setup lang="ts" generic="Row extends Record<string, string | number>">
defineProps<{
  caption: string
  data: Row[]
  columns: { key: keyof Row, label: string }[]
}>()
</script>

<template>
  <div class="my-8 overflow-x-auto rounded-xl border border-default bg-elevated p-5 not-prose">
    <table class="w-full text-left text-sm">
      <caption class="mb-4 text-left font-semibold">
        {{ caption }}
      </caption>
      <thead>
        <tr>
          <th v-for="column in columns" :key="String(column.key)" scope="col" class="px-3 py-2">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index">
          <td v-for="column in columns" :key="String(column.key)" class="border-t border-default px-3 py-2">
            {{ row[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
