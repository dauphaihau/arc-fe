<script lang="ts" setup>
import { ROUTES } from '~/config/enums/routes';
definePageMeta({ layout: 'default' });

const enum STEPS {
  SEND_EMAIL,
  SEND_EMAIL_SUCCESS,
  RESEND_EMAIL_SUCCESS,
  TOKEN_INVALID, RESET_PASSWORD,
  RESET_PASSWORD_SUCCESS
}

const route = useRoute();
const authStore = useAuthStore();
const steps = ref(route.query?.t ? '' : STEPS.SEND_EMAIL);
const email = ref('');

const nextStep = (step: STEPS, data?: string) => {
  email.value = data ?? '';
  steps.value = step;
};

onMounted(async () => {
  if (route.query?.v) {
    navigateTo('/reset');
  }
  if (route.query?.t) {
    const isVerify = await authStore.verifyToken();
    if (isVerify) {
      steps.value = STEPS.RESET_PASSWORD;
      navigateTo('/reset?v=1');
    } else {
      steps.value = STEPS.TOKEN_INVALID;
    }
  }
});

async function resendEmail() {
  await authStore.forgetPassword(email.value);
  steps.value = STEPS.RESEND_EMAIL_SUCCESS;
}

</script>

<template>
  <div class="mt-12 max-w-lg mx-auto">
    <!--    Send email-->
    <ResetPasswordCard v-if="steps === STEPS.SEND_EMAIL">
      <template #title>
        Reset your password
      </template>
      <template #subtitle>
        Enter the email address associated with
        your account and we'll send you a link to reset your password.
      </template>
      <template #content>
        <ForgetPasswordForm
          :email="email"
          @next="(email) => nextStep(STEPS.SEND_EMAIL_SUCCESS, email)"
        />
      </template>
    </ResetPasswordCard>

    <!--  Send email success -->
    <ResetPasswordCard v-if="steps === STEPS.SEND_EMAIL_SUCCESS">
      <template #title>
        Check your email
      </template>
      <template #content>
        <p class="font-light">
          Thanks! If
          <span class="font-medium">{{ email }}</span>
          matches an email we have on file,
          then we've sent you an email
          containing further instructions for resetting your password.
        </p>
        <p class="font-light">
          If you haven't received an email in 5 minutes, check your spam,
          <UButton variant="link" class="p-0 font-base" @click="resendEmail">
            resend
          </UButton>, or
          <UButton variant="link" class="p-0 font-base" @click="steps = STEPS.SEND_EMAIL">
            try a different email
          </UButton>
          .
        </p>
      </template>
    </ResetPasswordCard>

    <!--  Resend email success -->
    <ResetPasswordCard v-if="steps === STEPS.RESEND_EMAIL_SUCCESS">
      <template #title>
        Check your email
      </template>
      <template #content>
        <p class="font-light">
          We've resent password reset instructions to
          <span class="font-medium">{{ email }}</span>
          if it is an email on file.
        </p>
        <p class="font-light text-base">
          Please check again. If you still haven't received an email
          <UButton variant="link" class="p-0 text-base" @click="steps = STEPS.SEND_EMAIL">
            try a different email
          </UButton>
          .
        </p>
      </template>
    </ResetPasswordCard>

    <!--  Token invalid -->
    <ResetPasswordCard v-if="steps === STEPS.TOKEN_INVALID">
      <template #content>
        <div class="flex flex-col justify-center items-center">
          <Icon name="ph:warning-duotone" color="black" class="mb-3 h-7 w-7" />
          <div>
            This password reset link has expired.
          </div>
          <UButton variant="link" @click="steps = STEPS.SEND_EMAIL">
            Try resetting your password again.
          </UButton>
        </div>
      </template>
    </ResetPasswordCard>

    <!--  Reset password -->
    <ResetPasswordCard v-if="steps === STEPS.RESET_PASSWORD">
      <template #title>
        Reset your password
      </template>
      <template #content>
        <ResetPasswordForm @next="nextStep(STEPS.RESET_PASSWORD_SUCCESS)" />
      </template>
    </ResetPasswordCard>

    <!--  Reset password success -->
    <ResetPasswordCard v-if="steps === STEPS.RESET_PASSWORD_SUCCESS">
      <template #title>
        You've successfully changed your password
      </template>
      <template #content>
        <NuxtLink :to="ROUTES.HOME">
          <UButton size="xl" block>
            Continue to shopping
          </UButton>
        </NuxtLink>
      </template>
    </ResetPasswordCard>
  </div>
</template>
