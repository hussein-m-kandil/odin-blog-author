import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginQuery from '@tanstack/eslint-plugin-query';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      'next-env.d.ts',
      'build/**',
      'out/**',
      '.next/**',
    ],
  },
  ...pluginQuery.configs['flat/recommended'],
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
