import * as kleur from 'kleur';
import * as path from 'path';
import { address } from "@oxheadalpha/fa2-interfaces";
import { TezosToolkit } from "@taquito/taquito";
import { loadFile } from "../src/config-util";
import { createNftStorage, createTokenMetadata, NftContract } from "../src/nft-interface";
import { originateContract } from '@oxheadalpha/tezos-tools';

const tzip16Meta = {
  name: 'Astronauts in the space',
  description: 'Astronauts in the space is an AI generated collection created by YOMI',
  homepage: 'https://yomi.digital/astronaut-ai',
  authors: ['YOMI WEB3 COMPANY <hey@yomi.digital>'],
  version: '1.0.0',
  license: { name: 'MIT' },
  interfaces: ['TZIP-016', 'TZIP-012', 'TZIP-021'],
  source: {
    tools: ['LIGO'],
    location: 'https://github.com/yomi-digital/tz-astronaut-ai'
  }
};

export async function originateCollection(tzt: TezosToolkit): Promise<address> {
  console.log(kleur.yellow('originating NFT collection contract...'));

  const code = await loadFile(path.join(__dirname, '../dist/fa2_nft_asset.tz'));
  const ownerAddress = await tzt.signer.publicKeyHash();
  const storage = createNftStorage(
    ownerAddress,
    JSON.stringify(tzip16Meta, null, 2)
  );
  const contract = await originateContract(tzt, code, storage, 'nft');
  return contract.address;
}

export const tokenMeta = (tokenId: number) =>
createTokenMetadata(
  tokenId,
  'ipfs://QmbYcvb4B6dtEGAmHcUM9ZaMDBBJLFLh6Jsno218M9iQMU'
);

export const mintTestTokens = (nft : NftContract, owner: address) => {
  const tokens = [1, 2].map(tokenMeta);
  return nft.mintTokens([{ owner, tokens }]);
}

export const addMinter = (nft : NftContract, minter: address) => {
  return nft.addMinter(minter);
}
