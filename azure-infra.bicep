var appServicePlanName = 'mystery-mansion-asp'
var webAppPrefix = 'mystery-mansion-webapp-'
var location = 'eastus2'
var sku = 'F1'
var environments = [
  'client'
  'server'
]

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  properties: {
    reserved: true // Linux
  }
  sku: {
    name: sku
  }
}

resource webApps 'Microsoft.Web/sites@2023-12-01' = [
  for env in environments: {
    name: '${webAppPrefix}${env}'
    location: location
    properties: {
      serverFarmId: appServicePlan.id
      siteConfig: {
        linuxFxVersion: 'Node|20' // Set to Node.js v20
      }
    }
  }
]
