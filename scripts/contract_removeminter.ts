import { connect } from "./libs/connect";
import { runMethod } from '../packages/fa2-interfaces/dist';
import { Nft } from './libs/nft-interface';
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('./configs/' + argv._[0] + ".json").toString())

async function main() {
    let tzApi
    tzApi = await connect(configs.lambdaView, configs.provider, configs.privKey)
    if (tzApi !== undefined) {
        console.log('Removing ' + configs.minter_address + ' from minters..')
        const nft = (await tzApi.at(configs.contract_address)).with(Nft);
        await runMethod(nft.removeMinter(configs.minter_address))
        console.log(configs.minter_address+ ' removed from minters!');
    } else {
        console.log('Can\'t access tzApi')
    }
}

main()