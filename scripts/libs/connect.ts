import { TezosToolkit } from '@taquito/taquito';
import { Handler, IpfsHttpHandler, TezosStorageHandler, MetadataProvider, Tzip16Module } from '@taquito/tzip16';
import { InMemorySigner } from '@taquito/signer';
import { awaitForSandbox } from '../../packages/tezos-tools/dist';
import { TezosApi, tezosApi } from '../../packages/fa2-interfaces/dist';

export type TestApi = {
  bob: TezosApi;
  alice: TezosApi;
};

export async function connect(lambdaView: string): Promise<TestApi> {
  const api = await flextesaApi('http://localhost:20000');
  await awaitForSandbox(api.bob.toolkit);
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
  /*const customHandler = new Map<string, Handler>([
    ['ipfs', new IpfsHttpHandler('ipfs.yomi.digital')]
  ]);
  const customMetadataProvider = new MetadataProvider(customHandler);
  toolkit.addExtension(new Tzip16Module(customMetadataProvider));*/
  return toolkit;
}

