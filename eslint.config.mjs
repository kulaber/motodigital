import nextConfig from 'eslint-config-next'
import tseslint from 'typescript-eslint'

export default [
  ...nextConfig,
  {
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
    },
  },
]
