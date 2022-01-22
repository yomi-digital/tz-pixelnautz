import { ligo } from '../packages/tezos-tools/dist';

const main = async () => {
  const ligoEnv = ligo();
  await ligoEnv.printLigoVersion();
  console.log('Compiling contract..')
  await ligoEnv.compileContract(
    './contracts/src/fa2_nft_asset.mligo',
    'nft_asset_main',
    './contracts/fa2_nft_asset.tz'
  );
};

main();
