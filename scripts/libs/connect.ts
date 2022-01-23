import { TezosToolkit } from '@taquito/taquito';
import { Handler, IpfsHttpHandler, TezosStorageHandler, MetadataProvider, Tzip16Module } from '@taquito/tzip16';
import { InMemorySigner } from '@taquito/signer';
import { awaitForSandbox } from '../../packages/tezos-tools/dist';
import { TezosApi, tezosApi } from '../../packages/fa2-interfaces/dist';


export async function connect(lambdaView: string, provider: string, privKey: string): Promise<TezosApi> {
  const toolkit = await createToolkit(provider,privKey);
  const api = tezosApi(toolkit);
  await awaitForSandbox(api.toolkit);
  return api.useLambdaView(lambdaView)
}

async function createToolkit(
  rpc: string,
  secretKey: string
): Promise<TezosToolkit> {
  const signer = await InMemorySigner.fromSecretKey(secretKey);
  const toolkit = new TezosToolkit(rpc);
  toolkit.setProvider({ rpc, signer });
  /*const customHandler = new Map<string, Handler>([
    ['ipfs', new IpfsHttpHandler('ipfs.yomi.digital')]
  ]);
  const customMetadataProvider = new MetadataProvider(customHandler);
  toolkit.addExtension(new Tzip16Module(customMetadataProvider));*/
  return toolkit;
}

