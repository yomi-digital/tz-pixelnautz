import * as kleur from 'kleur';
import { BigNumber } from 'bignumber.js';
import { address, Fa2, runMethod, runBatch } from '@oxheadalpha/fa2-interfaces';
import { Nft } from '../src/nft-interface';

import { TestApi, bootstrap } from './test-bootstrap';
import {
  mintTestTokens,
  originateCollection,
  tokenMeta,
  addMinter
} from './collection-bootstrap';

jest.setTimeout(240000);

describe('NFT Collection Minting Tests', () => {
  let api: TestApi;
  let bobAddress: address;
  let aliceAddress: address;
  let collectionAddress: address;

  beforeAll(async () => {
    const tzApi = await bootstrap();
    api = tzApi;
    bobAddress = await tzApi.bob.toolkit.signer.publicKeyHash();
    aliceAddress = await tzApi.alice.toolkit.signer.publicKeyHash();
  });

  beforeEach(async () => {
    console.log('Originating collection..')
    collectionAddress = await originateCollection(api.bob.toolkit);
    console.log('Collection address is:', collectionAddress)
    console.log('Adding bob to minters so it can mint..')
    const nft = (await api.bob.at(collectionAddress)).with(Nft);
    await runMethod(addMinter(nft, bobAddress));
    console.log('Bob added to minter!')
  });

  test('mint', async () => {
    const nft = (await api.bob.at(collectionAddress)).with(Nft);
    await runMethod(mintTestTokens(nft, bobAddress));

    const fa2 = nft.with(Fa2);
    const meta = await fa2.tokensMetadata([1, 2]);
    expect(meta.map(t => t.token_id)).toEqual([1, 2]);

    const ownership = await fa2.hasNftTokens([
      { owner: bobAddress, token_id: new BigNumber(1) },
      { owner: bobAddress, token_id: new BigNumber(1) }
    ]);
    expect(ownership).toEqual([true, true]);
  });

  test('mint and freeze', async () => {
    const nft = (await api.bob.at(collectionAddress)).with(Nft);

    const batch = api.bob.toolkit.contract.batch();
    batch.withContractCall(mintTestTokens(nft, bobAddress));
    batch.withContractCall(nft.freezeCollection());
    await runBatch(batch);

    const extraTokens = [tokenMeta(3)];
    const run = runMethod(
      nft.mintTokens([{ owner: bobAddress, tokens: extraTokens }])
    );
    await expect(run).rejects.toHaveProperty('message', 'FROZEN');
  });

  test('mint duplicate tokens', async () => {
    const nft = (await api.bob.at(collectionAddress)).with(Nft);
    await runMethod(mintTestTokens(nft, bobAddress));

    const extraTokens = [tokenMeta(1)];
    const run = runMethod(
      nft.mintTokens([{ owner: bobAddress, tokens: extraTokens }])
    );
    await expect(run).rejects.toHaveProperty('message', 'USED_TOKEN_ID');
  });

  test('non-minter mint tokens', async () => {
    const nft = (await api.alice.at(collectionAddress)).with(Nft);
    const run = runMethod(mintTestTokens(nft, bobAddress));

    await expect(run).rejects.toHaveProperty('message', 'NOT_MINTER');
  });
});
