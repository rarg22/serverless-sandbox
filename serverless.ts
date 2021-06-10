import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'sandbox-serverless',
  },
  frameworkVersion: '2',
  custom: {
    stage: 'TEST',
    appSync: {
      name: '${self:service}-${self:custom.stage}',
      authenticationType: 'API_KEY',
      mappingTemplates: [
        {
          dataSource: 'Users',
          type: 'Query',
          field: 'getUsers',
          request: 'getUsers-request-mapping-template.txt',
          response: 'getUsers-response-mapping-template.txt',
        },
      ],
      schema: 'schema.graphql',
      dataSources: [
        {
          type: 'AWS_LAMBDA',
          name: 'Users',
          description: 'AWS Lambda To Get Users',
          config: {
            lambdaFunctionArn: {
              'Fn::GetAtt': ['HelloLambdaFunction', 'Arn'],
            },
            serviceRoleArn: {
              'Fn::GetAtt': ['AppSyncServiceRole', 'Arn'],
            },
          },
        },
      ],
    },
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-appsync-plugin'],
  provider: {
    profile: 'serverless-sandbox',
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    hello: {
      handler: 'handler.hello',
    },
  },
  resources: {
    Resources: {
      CognitoUserPool: {
        Type: 'AWS::Cognito::UserPool',
        Properties: {
          UserPoolName: '${self:service}-${self:custom.stage}-user-pool',
          AutoVerifiedAttributes: ['email'],
          Policies: {
            PasswordPolicy: {
              MinimumLength: 8,
              RequireLowercase: true,
              RequireNumbers: true,
              RequireSymbols: false,
              RequireUppercase: false,
            },
          },
        },
      },
      CognitoUserPoolClient: {
        Type: 'AWS::Cognito::UserPoolClient',
        Properties: {
          ClientName: '${self:service}-${self:custom.stage}-user-pool-client',
          UserPoolId: {
            Ref: 'CognitoUserPool',
          },
          ExplicitAuthFlows: ['ADMIN_NO_SRP_AUTH'],
          GenerateSecret: false,
        },
      },
      AppSyncServiceRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
          RoleName: '${self:service}-AppSyncServiceRole-${self:provider.stage}',
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  Service: ['appsync.amazonaws.com'],
                },
                Action: ['sts:AssumeRole'],
              },
            ],
          },
          Policies: [
            {
              PolicyName: '${self:service}-AppSyncServiceRole-Policy--${self:provider.stage}',
              PolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Action: ['lambda:InvokeFunction'],
                    Resource: ['arn:aws:lambda:${self:provider.region}:*:*'],
                  },
                ],
              },
            },
          ],
        },
      },
    },
    Outputs: {
      UserPoolId: {
        Value: {
          Ref: 'CognitoUserPool',
        },
      },
      UserPoolClientId: {
        Value: {
          Ref: 'CognitoUserPoolClient',
        },
      },
      AppSyncServiceRoleId: {
        Value: {
          Ref: 'AppSyncServiceRole',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
