/**
 * @type {import('@ladle/react').UserConfig}
 */
export default {
  stories: 'src/**/*.stories.{js,jsx,ts,tsx}',
  defaultStory: 'button--default',
  addons: {
    a11y: {
      enabled: true,
    },
  },
};
