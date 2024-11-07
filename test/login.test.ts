import {
  describe, it, expect
} from 'vitest';
import { mount } from '@vue/test-utils';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import LayoutMarketHeader from '~/components/layouts/market/LayoutMarketHeader.vue';
import LoginForm from '~/components/dialogs/login-register/LoginForm.vue';

describe('login', () => {
  it('show mega menu cart', async () => {
    const component = await mountSuspended(LayoutMarketHeader);

    await component.find('#cart-btn').trigger('click');

    expect(component.find('#mega-menu-cart').exists()).toBeTruthy();
  });

  // TODO: test show login dialog

  it('fill email and password input', async () => {
    const component = mount(LoginForm, {
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    });

    const email = 'maimai@gmail.com';
    const password = '123456789';

    const emailInput = component.find('[name="email"]');
    const passwordInput = component.find('[name="password"]');

    await emailInput.setValue(email);
    await passwordInput.setValue(password);

    expect(emailInput.element.value).toBe(email);
    expect(passwordInput.element.value).toBe(password);
  });

  it('alert user input incorrect password', async () => {
    const component = await mountSuspended(LoginForm, {
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    });

    component.vm.unknownErrorServerMsg.value = 'Incorrect email or password';
    await component.vm.$nextTick();

    expect(component.html()).toContain('Incorrect email or password');
  });

  // TODO: test login success
});
