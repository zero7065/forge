param location string = resourceGroup().location
param environment string = 'staging'
param adminUsername string = 'beyond_admin'
param adminPassword string
param skuName string = 'GP_Gen5_2'
param storageMB int = 32768
param backupRetentionDays int = 7
param geoRedundantBackup bool = false

var name = 'beyond-${environment}-pg'
var tags = {
  environment: environment
  app: 'beyond'
  managedBy: 'bicep'
}

resource pgServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: skuName
    tier: 'GeneralPurpose'
  }
  properties: {
    administratorLogin: adminUsername
    administratorLoginPassword: adminPassword
    version: '15'
    storage: {
      storageSizeGB: storageMB / 1024
      storageAutoGrow: 'Enabled'
      iops: 3000
    }
    backup: {
      backupRetentionDays: backupRetentionDays
      geoRedundantBackup: geoRedundantBackup ? 'Enabled' : 'Disabled'
    }
    highAvailability: {
      mode: environment == 'prod' ? 'ZoneRedundant' : 'Disabled'
    }
    network: {
      delegatedSubnetResourceId: ''
      privateDnsZoneArmResourceId: ''
      publicNetworkAccess: 'Enabled'
    }
    maintenanceWindow: {
      customWindow: 'Disabled'
      dayOfWeek: 0
      startHour: 2
      startMinute: 0
    }
  }
}

resource pgDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-06-01-preview' = {
  name: '${pgServer.name}/beyond_${environment}'
  location: location
  properties: {
    charset: 'utf8'
    collation: 'en_US.utf8'
  }
}

resource firewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-06-01-preview' = {
  name: '${pgServer.name}/AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

output serverName string = pgServer.name
output serverFqdn string = pgServer.properties.fullyQualifiedDomainName
output databaseName string = pgDatabase.name
output adminUsername string = adminUsername