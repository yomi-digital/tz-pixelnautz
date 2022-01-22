import { connect } from "./libs/connect";
import { runMethod, Fa2 } from '../packages/fa2-interfaces/dist';
import { Nft, createTokenMetadata } from './libs/nft-interface';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('./configs/' + argv._[0] + ".json").toString())

export const tokenMeta = (tokenId: number) =>
    createTokenMetadata(
        tokenId,
        'ipfs://QmbYcvb4B6dtEGAmHcUM9ZaMDBBJLFLh6Jsno218M9iQMU'
    );

async function main() {
    let tzApi
    tzApi = await connect(configs.lambdaView)
    if (tzApi !== undefined) {
        console.log('Unfreezing collection..')
        const nft = (await tzApi.bob.at(configs.contract_address)).with(Nft);
        try {
            await runMethod(nft.unfreezeCollection())
            console.log('Collection unfreezed!');
        } catch (e) {
            console.log(e)
        }
    } else {
        console.log('Can\'t access tzApi')
    }
}

main()