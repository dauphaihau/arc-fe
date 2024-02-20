import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import Test from '../src/components/test/Test.vue';

describe('Test', () => {
  it('is a Vue instance', () => {
    const wrapper = mount(Test);
    expect(wrapper.vm).toBeTruthy();
  });
});
