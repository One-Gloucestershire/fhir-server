# Deployment

1. Clone the repository
1. Run `yarn` in the fhir-works-on-aws-authz-rbac folder
1. Run `yarn build` in the fhir-works-on-aws-authz-rbac folder
1. Run `yarn` in the fhir-works-on-aws-deployment folder
1. Run `yarn build` in the fhir-works-on-aws-deployment folder
1. Follow the standard installation instructions
    1. Note that the IAM policy is incomplete, you need to add permissions for SQS and Glue too
1. Navigate to Cognito in the AWS console
1. Open the fhir-service-dev user pool
1. Under App Clients, add a new client
    1. Name: Service To Service
    1. Generate Client Secret: True
    1. No Auth Flows Enabled (except refresh token)
1. Under Resource Servers, add a new server
    1. Name: FHIR Server
    1. Identifier: custom-fhir-scope
    1. Scope Name: default
    1. Scope Description: Default Scope
1. Under App Client Settings, configure the Service To Service client
    1. OAuth 2.0 Flows: Client Credentials
    1. OAuth 2.0 Allowed Scopes: custom-fhir-scope/default
1. Make note of the Cognito URL under the Domain Name section
1. Navigate to API Gateway
1. Open the dev-fhir-service API
1. Under Resources, open the ANY method of the "/" route
1. Open the Method Request
1. Edit OAuth Scopes - add "custom-fhir-scope/default"
1. Under Resources, open the ANY method of the "/{proxy+}" route
1. Open the Method Request
1. Edit OAuth Scopes - add "custom-fhir-scope/default"
1. In the Actions dropdown, select "Deploy API" & deploy to the dev stage

# Testing

1. Make a POST request to the Cognito token endpoint
    1. The domain is in the Domain Name section of the Cognito User Pool
    1. The path is "/oauth2/token"
    1. The request body encoding is "x-www-form-urlencoded"
    1. The request body needs to include "grant_type: client_credentials" and "scope: custom-fhir-scope/default"
    1. The Authorization header needs to be "Basic <encoded client_id & client_secret>"
        1. To obtain the encoded client_id & client_secret, concatenate the client_id and client_secret together, separated by a colon, then Base64 encode it
        1. To do this in a node.js REPL, use the following code:
            ```
            Buffer.from('client_id:client_secret', 'utf8').toString('base64')
            ```
    1. Take the access_token from the response body to use in subsequent requests
1. To make a request to any of the FHIR server endpoints, set:
    1. The Authorization header to "Bearer <access_token>"
    1. The x-api-key header to the API Key which can be found in API Gateway
    1. The Domain to the API's invoke URL which can be found in API Gateway
