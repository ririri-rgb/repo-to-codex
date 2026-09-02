import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'test/fixtures/**', 'eslint.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { parserOptions: { project: './tsconfig.json' } },
    rules: { '@typescript-eslint/consistent-type-imports': 'error' }
  },
);
