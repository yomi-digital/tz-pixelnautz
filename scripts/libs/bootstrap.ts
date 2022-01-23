import * as kleur from 'kleur';
import { TezosToolkit, VIEW_LAMBDA } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { awaitForSandbox } from '../../packages/tezos-tools/dist';
import { address } from '../../packages/fa2-interfaces/dist';
import { TezosApi, tezosApi } from '../../packages/fa2-interfaces/dist';
import fs from 'fs'


export async function bootstrap(environment: string): Promise<TezosApi> {
  let configs = JSON.parse(fs.readFileSync('./configs/' + environment + '.json').toString())
  const toolkit = await createToolkit(configs.provider,configs.privKey);
  const api = tezosApi(toolkit);
  await awaitForSandbox(api.toolkit);
  const lambdaView = await originateLambdaViewContract(api.toolkit);
  console.log('Updating lambda view in ' + environment + '.json')
  configs.lambdaView = lambdaView
  fs.writeFileSync('./configs/' + environment + '.json', JSON.stringify(configs))
  return api.useLambdaView(lambdaView);
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
