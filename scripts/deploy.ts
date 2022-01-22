import { bootstrap } from "./libs/bootstrap";
import { connect } from "./libs/connect";
import { createNftStorage, createTokenMetadata, NftContract } from "./libs/nft-interface";
import { originateContract } from '../packages/tezos-tools/dist';
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('./configs/' + argv._[0] + ".json").toString())

const tzip16Meta = {
    name: configs.contract.name,
    description: configs.contract.description,
    homepage: configs.contract.homepage,
    authors: configs.contract.authors,
    version: '1.0.0',
    license: { name: 'MIT' },
    interfaces: ['TZIP-016', 'TZIP-012', 'TZIP-021'],
    source: {
        tools: ['LIGO'],
        location: configs.contract.source
    }
};

async function main() {
    let tzApi
    if (argv._[0] === "sandbox" && configs.lambdaView === "") {
        console.log('Running in sandbox mode..')
        tzApi = await bootstrap(argv._[0]);
    } else if (argv._[0] === "mainnet") {
        console.log('Running in mainnet mode..')
        tzApi = await connect(configs.lambdaView);
    }
    if (tzApi !== undefined) {
        console.log('Originating NFT collection contract...');
        const tzt = tzApi.bob.toolkit
        const code = await fs.readFileSync('./contracts/fa2_nft_asset.tz').toString()
        const ownerAddress = await tzt.signer.publicKeyHash();
        const storage = createNftStorage(
            ownerAddress,
            JSON.stringify(tzip16Meta, null, 2)
        );
        const contract = await originateContract(tzt, code, storage, 'nft');
        console.log('Contract deployed, address is:', contract.address);
        configs.contract_address = contract.address;
        fs.writeFileSync('./configs/' + argv._[0] + '.json', JSON.stringify(configs));
    } else {
        console.log('Can\'t access tzApi')
    }
}

main()