<template>
  <Codemirror
    :value="props.code"
    :options="cmOptions"
    border
    ref="cmRef"
  >
  </Codemirror>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from "vue";
import "codemirror/mode/go/go.js";
import "codemirror/mode/yaml/yaml.js";
import Codemirror from "codemirror-editor-vue3";
import type { CmComponentRef } from "codemirror-editor-vue3";
import type { EditorConfiguration } from "codemirror";

interface Props {
  code: string;
}

const props = defineProps<Props>();

const cmRef = ref<CmComponentRef>();
const cmOptions: EditorConfiguration = {
  mode: { name: "go" },
  readOnly: true,
};

// const onChange = (val: string, cm: Editor) => {
//   console.log(val);
//   console.log(cm.getValue());
// };

// const onInput = (val: string) => {
//   console.log(val);
// };

// const onReady = (cm: Editor) => {
//   console.log(cm.focus());
// };

// onMounted(() => {
//   setTimeout(() => {
//     cmRef.value?.refresh();
//   }, 1000);

//   setTimeout(() => {
//     cmRef.value?.resize(300, 200);
//   }, 2000);

//   setTimeout(() => {
//     cmRef.value?.cminstance.isClean();
//   }, 3000);
// });

onUnmounted(() => {
  cmRef.value?.destroy();
});
</script>
