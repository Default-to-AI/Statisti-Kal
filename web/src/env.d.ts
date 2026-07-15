/// <reference types="vite/client" />

/**
 * Vite client-side env type extensions.
 *
 * All keys are optional. Components that read them use a placeholder
 * default at runtime, so an unset env var is not a build error.
 */
interface ImportMetaEnv {
  readonly VITE_BMC_USERNAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
