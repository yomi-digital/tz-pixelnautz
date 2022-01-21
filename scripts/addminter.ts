import { connect } from "./libs/connect";
import { runMethod } from '../packages/fa2-interfaces/dist';
import { Nft } from './libs/nft-interface';
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('./configs/' + argv._[0] + ".json").toString())

async function main() {
    let tzApi
    tzApi = await connect(configs.lambdaView)
    if (tzApi !== undefined) {
        console.log('Adding bob to minters so it can mint..')
        const nft = (await tzApi.bob.at(configs.contract_address)).with(Nft);
        await runMethod(nft.addMinter(configs.minter_address))
        console.log('Bob added to minter!');
    } else {
        console.log('Can\'t access tzApi')
    }
}

main()