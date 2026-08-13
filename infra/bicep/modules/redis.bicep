param location string = resourceGroup().location
param environment string = 'staging'
param skuName string = 'Standard'
param capacity int = 1
param enableNonSslPort bool = false
param minimumTlsVersion string = '1.2'

var name = 'beyond-${environment}-redis'
var tags = {
  environment: environment
  app: 'beyond'
  managedBy: 'bicep'
}

resource redis 'Microsoft.Cache/Redis@2023-11-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: skuName
    family: 'C'
    capacity: capacity
  }
  properties: {
    enableNonSslPort: enableNonSslPort
    minimumTlsVersion: minimumTlsVersion
    redisConfiguration: {
      maxmemory-policy: 'allkeys-lru'
      maxmemory-reserved: 50
      notify-keyspace-events: 'Ex'
    }
    redisVersion: '7'
  }
}

output hostName string = redis.properties.hostName
output port int = redis.properties.sslPort
output primaryKey string = listKeys(redis.id, redis.apiVersion).primaryKey
output secondaryKey string = listKeys(redis.id, redis.apiVersion).secondaryKey