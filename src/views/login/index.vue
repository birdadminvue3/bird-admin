<template>
  <div class="login-container">
    <!-- 右侧切换主题、语言按钮  -->
    <div class="action-bar">
      <el-tooltip :content="t('login.themeToggle')" placement="bottom">
        <CommonWrapper>
          <DarkModeSwitch />
        </CommonWrapper>
      </el-tooltip>
      <el-tooltip :content="t('login.languageToggle')" placement="bottom">
        <LangSelect size="text-20px" />
      </el-tooltip>
    </div>
    <div class="container">
      <!-- 登录页主体 -->
      <div flex-1 flex-center>
        <div
          class="p-4xl w-full h-auto sm:w-400px border-rd-10px sm:h-480px shadow-[var(--el-box-shadow-light)] backdrop-blur-3px bg-#fff"
        >
        <div w-full flex flex-col items-center>
            <!-- logo -->
            <el-image :src="logo" style="width: 84px" />
            <!-- 标题 -->
            <h2>
              <el-badge :value="`v ${defaultSettings.version}`" type="success">
              {{ defaultSettings.title }}
            </el-badge>
            </h2>
            <h3 text-center m-0 mb-20px>{{ t("login.login") }}</h3>
            <el-form
              class="w-90%"
              ref="loginFormRef"
              :model="loginFormData"
              :rules="loginRules"
              size="large"
              :validate-on-rule-change="false"
            >
              <!-- 用户名 -->
              <el-form-item prop="username">
                  <el-input v-model.trim="loginFormData.username" :placeholder="t('login.username')">
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 密码 -->
              <el-tooltip :visible="isCapsLock" :content="t('login.capsLock')" placement="right">
                <el-form-item prop="password">
                  <el-input
                    v-model.trim="loginFormData.password"
                    :placeholder="t('login.password')"
                    type="password"
                    show-password
                    @keyup="checkCapsLock"
                    @keyup.enter="handleLoginSubmit"
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-tooltip>

              <!-- 验证码 -->
              <!-- <el-form-item prop="captchaCode">
                <div flex>
                  <el-input
                    v-model.trim="loginFormData.captchaCode"
                    :placeholder="t('login.captchaCode')"
                    @keyup.enter="handleLoginSubmit"
                  >
                    <template #prefix>
                      <div class="i-svg:captcha" />
                    </template>
                  </el-input>
                  <div cursor-pointer h="[40px]" w="[120px]" flex-center ml-10px @click="getCaptcha">
                    <el-icon v-if="codeLoading" class="is-loading"><Loading /></el-icon>

                    <img
                      v-else
                      object-cover
                      border-rd-4px
                      p-1px
                      shadow="[0_0_0_1px_var(--el-border-color)_inset]"
                      :src="captchaBase64"
                      alt="code"
                    />
                  </div>
                </div>
              </el-form-item> -->

              <!-- <div class="flex-x-between w-full">
                <el-checkbox v-model="loginFormData.rememberMe">{{ t("login.rememberMe") }}</el-checkbox>
                <el-link type="primary" underline="never" @click="toOtherForm('resetPwd')">
                  {{ t("login.forgetPassword") }}
                </el-link>
              </div> -->

              <!-- 登录按钮 -->
              <el-form-item>
                <el-button :loading="loading" type="primary" class="w-full" @click="handleLoginSubmit">
                  {{ t("login.login") }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
    <!-- 动态背景 -->
    <ul class="bg-squares">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
    </ul>
  </div>
</template>

<script setup lang="ts">

import type { FormInstance } from "element-plus";
import logo from "@/assets/login/logo.png";
import { defaultSettings } from "@/config/index";
import CommonWrapper from "@/components/CommonWrapper/index.vue";
import DarkModeSwitch from "@/components/DarkModeSwitch/index.vue";

const { t } = useI18n();
/** 登录表单数据 */
export interface LoginFormData {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码 */
  captchaCode: string;
  /** 记住我 */
  // rememberMe: boolean;
}

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
// 是否大写锁定
const isCapsLock = ref(false);

const loginFormData = ref<LoginFormData>({
  username: "admin",
  password: "123456",
  captchaKey: "",
  captchaCode: "",
  // rememberMe,
});

const loginRules = computed(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 6,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
    captchaCode: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.captchaCode.required"),
      },
    ],
  };
});

/**
 * 登录提交
 */
async function handleLoginSubmit() {
  try {
    // 1. 表单验证
    const valid = await loginFormRef.value?.validate();
    if (!valid) return;

    loading.value = true;

  //   // 2. 执行登录
  //   await userStore.login(loginFormData.value);

  //   // 3. 获取用户信息（包含用户角色，用于路由生成）
  //   await userStore.getUserInfo();

  //   // 4. 登录成功，简单跳转，让路由守卫处理后续逻辑
  //   const redirectPath = (route.query.redirect as string) || "/";

  //   // 使用push而不是replace，避免与路由守卫冲突
  //   await router.push(decodeURIComponent(redirectPath));
  // } catch (error) {
  //   // 5. 统一错误处理
  //   getCaptcha(); // 刷新验证码
  //   console.error("登录失败:", error);
  } finally {
    loading.value = false;
  }
}

// 检查输入大小写
function checkCapsLock(event: KeyboardEvent) {
  // 防止浏览器密码自动填充时报错
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  /* 渐变背景 */
  background: linear-gradient(to top left,#ffe29f,#ffa99f,#ff719a);
  // background-image: linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%);
  /* 溢出隐藏 */
  overflow: hidden;
  .action-bar {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
    // z-index: 9;
    @media (max-width: 480px) {
      top: 10px;
      right: auto;
      left: 10px;
    }

    @media (min-width: 640px) {
      top: 40px;
      right: 40px;
    }
  }
  .container{
    z-index: 9;
    .login-form{
      background: #fff;
      min-width: 300px;
      height: auto;
      min-height: 380px;
      padding: 10px;
      box-shadow: var(--el-box-shadow-light);
      border-radius: 10px;
    }
  }
  /* 背景方块 */
  .bg-squares{
    list-style: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  .bg-squares li{
    width: 40px;
    height: 40px;
    background-color: rgba(255,255,255,0.15);
    position: absolute;
    bottom: -160px;
    /* 执行动画：动画名 时长 线性 无限次播放 */
    animation: square 20s linear infinite;
  }
  /* 为每一个方块设置不同的位置、大小、动画延迟时间、动画时长、背景色 */
  .bg-squares li:nth-child(1){
    left: 10%;
  }
  .bg-squares li:nth-child(2){
    left: 20%;
    width: 80px;
    height: 80px;
    /* 动画延迟时间 */
    animation-delay: 2s;
    /* 动画时长 */
    animation-duration: 17s;
  }
  .bg-squares li:nth-child(3){
    left: 25%;
    animation-delay: 4s;
  }
  .bg-squares li:nth-child(4){
    left: 40%;
    width: 60px;
    height: 60px;
    background-color: rgba(255,255,255,0.25);
    animation-duration: 22s;
  }
  .bg-squares li:nth-child(5){
    left: 70%;
  }
  .bg-squares li:nth-child(6){
    left: 80%;
    width: 120px;
    height: 120px;
    background-color: rgba(255,255,255,0.2);
    animation-delay: 3s;
  }
  .bg-squares li:nth-child(7){
    left: 32%;
    width: 160px;
    height: 160px;
    animation-delay: 7s;
  }
  .bg-squares li:nth-child(8){
    left: 55%;
    width: 20px;
    height: 20px;
    animation-delay: 15s;
    animation-duration: 40s;
  }
  .bg-squares li:nth-child(9){
    left: 25%;
    width: 10px;
    height: 10px;
    background-color: rgba(255,255,255,0.3);
    animation-delay: 2s;
    animation-duration: 40s;
  }
  .bg-squares li:nth-child(10){
    left: 90%;
    width: 160px;
    height: 160px;
    animation-delay: 11s;
  }
  /* 定义动画 */
  @keyframes square {
    0%{
      transform: translateY(0);
    }
    100%{
      transform: translateY(-120vh) rotate(600deg);
    }
  }
}

</style>