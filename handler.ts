import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const hello: APIGatewayProxyHandler = async (): Promise<any> => {
  // const getUserUseCase = new GetUserUseCase();
  // const user: any = getUserUseCase.start();

  return {
    name: 'Raul',
    username: 'Test',
  };
};
