<script setup lang="ts">
import { useRouter } from "vue-router";

defineOptions({ name: "Error403" });

const { t } = useI18n();
const router = useRouter();

function goHome() {
  router.replace("/");
}

function goBack() {
  if (window.history.length > 1) router.back();
  else goHome();
}
</script>

<template>
  <div class="error-page">
    <el-result icon="warning">
      <template #title>
        <span class="error-code">403</span>
      </template>
      <template #sub-title>
        <p class="error-desc">{{ t("error.403Desc") }}</p>
      </template>
      <template #extra>
        <el-button type="primary" @click="goHome">{{ t("error.backHome") }}</el-button>
        <el-button @click="goBack">{{ t("error.backPrev") }}</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped lang="scss">
@use "./error.scss";
</style>
