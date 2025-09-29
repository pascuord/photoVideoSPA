// eslint.config.js (root)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  // Ignora carpetas generadas
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/out-tsc/**', 'frontend/public/**'],
  },

  // Reglas base para JS
  js.configs.recommended,

  // Reglas para TypeScript (frontend y backend)
  ...tseslint.config({
    files: ['**/*.ts'],
    ignores: [],
    languageOptions: {
      parserOptions: {
        // Importante: activa proyecto para reglas TS que lo requieran
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // Recomendadas TS
    extends: [...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    rules: {
      // Ajustes suaves típicos
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
    },
  }),

  // Backend (Node)
  {
    files: ['backend/**/*.ts'],
    languageOptions: {
      globals: {
        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    rules: {},
  },

  // Frontend (Browser)
  {
    files: ['frontend/src/**/*.ts'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
      },
    },
    rules: {},
  },
];
