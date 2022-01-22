import * as kleur from 'kleur';
import { TezosToolkit, VIEW_LAMBDA } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { awaitForSandbox } from '../../packages/tezos-tools/dist';
import { address } from '../../packages/fa2-interfaces/dist';
import { TezosApi, tezosApi } from '../../packages/fa2-interfaces/dist';
import fs from 'fs'

export type TestApi = {
  bob: TezosApi;
  alice: TezosApi;
};

export async function bootstrap(environment: string): Promise<TestApi> {
  const api = await flextesaApi('http://localhost:20000');
  await awaitForSandbox(api.bob.toolkit);
  const lambdaView = await originateLambdaViewContract(api.bob.toolkit);
  console.log('Updating lambda view in ' + environment + '.json')
  const configs = JSON.parse(fs.readFileSync('./configs/' + environment + '.json').toString())
  configs.lambdaView = lambdaView
  fs.writeFileSync('./configs/' + environment + '.json', JSON.stringify(configs))
  return {
    bob: api.bob.useLambdaView(lambdaView),
    alice: api.alice.useLambdaView(lambdaView)
  };
}

async function flextesaApi(rpc: string): Promise<TestApi> {
  const bob = await createToolkit(
    rpc,
    'edsk3RFgDiCt7tWB2oe96w1eRw72iYiiqZPLu9nnEY23MYRp2d8Kkx'
  );
  const alice = await createToolkit(
    rpc,
    'edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq'
  );
  return { 
    bob: tezosApi(bob), 
    alice: tezosApi(alice) 
  };
}

async function createToolkit(
  rpc: string,
  secretKey: string
): Promise<TezosToolkit> {
  const signer = await InMemorySigner.fromSecretKey(secretKey);
  const toolkit = new TezosToolkit(rpc);
  toolkit.setProvider({ rpc, signer });
  return toolkit;
}

async function originateLambdaViewContract(
  tezos: TezosToolkit
): Promise<address> {
  console.log(kleur.yellow(`originating Taquito lambda view contract...`));
  const op = await tezos.contract.originate({
    code: VIEW_LAMBDA.code,
    storage: VIEW_LAMBDA.storage
  });
  const lambdaContract = await op.contract();

  console.log(
    kleur.yellow(
      `originated Taquito lambda view ${kleur.green(lambdaContract.address)}`
    )
  );
  return lambdaContract.address;
}
