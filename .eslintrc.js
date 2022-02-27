module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:vue/vue3-recommended", "prettier"],
  rules: {
    "vue/script-setup-uses-vars": "error",
    "vue/no-v-html": "off",
  },
  // set paser option to allow await at top level in js modules
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  // declare as global vue3 compiler macros to prevent no-undef errors
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
  },
}
