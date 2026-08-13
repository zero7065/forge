param location string = resourceGroup().location
param environment string = 'staging'
param containerImage string
param appName string = 'beyond'
param sku string = 'Standard'
param replicaCount int = 2
param minReplicas int = 1
param maxReplicas int = 10

var name = '${appName}-${environment}'
var tags = {
  environment: environment
  app: appName
  managedBy: 'bicep'
}

resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-11-02-preview' = {
  name: '${name}-env'
  location: location
  tags: tags
  properties: {
    workloadProfiles: [
      {
        name: 'default'
        workloadProfileType: 'GeneralPurpose'
        minimumNodes: minReplicas
        maximumNodes: maxReplicas
      }
    ]
    dapr: {
      enabled: true
    }
  }
}

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${name}-logs'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource containerApp 'Microsoft.App/containerApps@2023-11-02-preview' = {
  name: name
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
      }
      registries: [
        {
          server: split(containerImage, '/')[0]
          identity: 'system'
        }
      ]
      secrets: [
        {
          name: 'jwt-secret'
          value: '${environment}-jwt-secret-change-in-prod'
        }
        {
          name: 'groq-api-key'
          value: '${environment}-groq-key'
        }
        {
          name: 'gemini-api-key'
          value: '${environment}-gemini-key'
        }
        {
          name: 'anthropic-api-key'
          value: '${environment}-anthropic-key'
        }
        {
          name: 'openai-api-key'
          value: '${environment}-openai-key'
        }
        {
          name: 'stripe-secret-key'
          value: '${environment}-stripe-key'
        }
        {
          name: 'stripe-webhook-secret'
          value: '${environment}-stripe-webhook'
        }
        {
          name: 'paystack-secret-key'
          value: '${environment}-paystack-key'
        }
        {
          name: 'coinbase-api-key'
          value: '${environment}-coinbase-key'
        }
        {
          name: 'sentry-dsn'
          value: '${environment}-sentry-dsn'
        }
      ]
      activeRevisionsMode: 'single'
    }
    template: {
      revisionSuffix: '${environment}-${uniqueString(containerAppEnv.id)}'
      containers: [
        {
          name: 'app'
          image: containerImage
          resources: {
            cpu: 1.0
            memory: '2Gi'
          }
          env: [
            { name: 'NODE_ENV', value: environment }
            { name: 'PORT', value: '3000' }
            { name: 'APP_URL', value: 'https://${name}.azurecontainerapps.io' }
            { name: 'DB_TYPE', value: 'postgres' }
            { name: 'DB_HOST', secretRef: 'db-host' }
            { name: 'DB_PORT', value: '5432' }
            { name: 'DB_NAME', value: 'beyond_${environment}' }
            { name: 'DB_USER', secretRef: 'db-user' }
            { name: 'DB_PASSWORD', secretRef: 'db-password' }
            { name: 'AUTH_JWT_SECRET', secretRef: 'jwt-secret' }
            { name: 'AUTH_TOKEN_EXPIRY', value: '24h' }
            { name: 'SALT_ROUNDS', value: '12' }
            { name: 'GROQ_API_KEY', secretRef: 'groq-api-key' }
            { name: 'GROQ_MODEL_FAST', value: 'llama-3.1-8b-instant' }
            { name: 'GROQ_MODEL_DEEP', value: 'llama-3.3-70b-versatile' }
            { name: 'GEMINI_API_KEY', secretRef: 'gemini-api-key' }
            { name: 'GEMINI_MODEL', value: 'gemini-2.0-flash' }
            { name: 'ANTHROPIC_API_KEY', secretRef: 'anthropic-api-key' }
            { name: 'ANTHROPIC_MODEL', value: 'claude-3-5-sonnet-20241022' }
            { name: 'OPENAI_API_KEY', secretRef: 'openai-api-key' }
            { name: 'OPENAI_MODEL', value: 'gpt-4o-mini' }
            { name: 'CHROMA_DB_PATH', value: '/data/chromadb' }
            { name: 'EMBEDDING_MODEL', value: 'text-embedding-004' }
            { name: 'STRIPE_SECRET_KEY', secretRef: 'stripe-secret-key' }
            { name: 'STRIPE_WEBHOOK_SECRET', secretRef: 'stripe-webhook-secret' }
            { name: 'PAYSTACK_SECRET_KEY', secretRef: 'paystack-secret-key' }
            { name: 'COINBASE_API_KEY', secretRef: 'coinbase-api-key' }
            { name: 'BRIEFING_TIME', value: '07:00' }
            { name: 'ALERT_INTERVAL', value: '900000' }
            { name: 'LEGAL_SCAN_DAY', value: '1' }
            { name: 'LEGAL_SCAN_TIME', value: '08:00' }
            { name: 'MAX_UPLOAD_SIZE', value: '52428800' }
            { name: 'RATE_LIMIT_WINDOW', value: '60000' }
            { name: 'RATE_LIMIT_MAX', value: '60' }
            { name: 'CONSCIOUSNESS_STATE', value: 'ACTIVE' }
            { name: 'SENTRY_DSN', secretRef: 'sentry-dsn' }
            { name: 'SENTRY_ENVIRONMENT', value: environment }
          ]
          volumeMounts: [
            {
              name: 'chromadb'
              mountPath: '/data/chromadb'
            }
          ]
          probes: [
            {
              type: 'liveness'
              httpGet: { path: '/api/health', port: 3000 }
              initialDelaySeconds: 30
              periodSeconds: 10
            }
            {
              type: 'readiness'
              httpGet: { path: '/api/health', port: 3000 }
              initialDelaySeconds: 10
              periodSeconds: 5
            }
          ]
        }
      ]
      volumes: [
        {
          name: 'chromadb'
          storageType: 'Ephemeral'
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${name}-kv'
  location: location
  tags: tags
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: []
    enableRbacAuthorization: true
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

output containerAppUrl string = 'https://${name}.azurecontainerapps.io'
output containerAppName string = name
output keyVaultName string = keyVault.name