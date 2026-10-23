// AI Gateway — barrel export
export {
  classifyIntent,
  classifyIntentFallback,
  type AIIntent,
  type IntentResult,
  type AIProvider,
  type ProviderHealth,
  type ProviderCost,
  type ProviderSelection,
  ProviderRouter,
  providerRouter,
  scrubPII,
  logLifecycle,
  getLifecycleLogs,
  exportLifecycleLogs,
  initLifecycleTable,
  type AILifecycleRecord
} from './router.js';
