import type { Config } from 'tailwindcss';
import tailwindTypography from '@tailwindcss/typography';

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        customGray: {
          50: '#FFFFFF',
          100: '#F7F8FA',
          200: '#E5E9EA',
          300: '#C3CED9',
          400: '#AABAC9',
          500: '#91A6B9',
          600: '#7891A9',
          700: '#617D98',
          800: '#6A7283',
          850: '#5B6070',
          900: '#4D505B',
          950: '#414551',
        },
      },
    },
  },
  plugins: [tailwindTypography],
};
