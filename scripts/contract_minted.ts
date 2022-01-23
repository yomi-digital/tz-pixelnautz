import { connect } from "./libs/connect";
import { runMethod, Fa2 } from '../packages/fa2-interfaces/dist';
import { Nft } from './libs/nft-interface';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('./configs/' + argv._[0] + ".json").toString())


async function main() {
    let tzApi
    tzApi = await connect(configs.lambdaView, configs.provider, configs.privKey)
    if (tzApi !== undefined) {
        const instance = await tzApi.at(configs.contract_address);
        const nft = instance.with(Nft);
        const fa2 = nft.with(Fa2);
        try {
            console.log('Fetching metadata for token ' + argv._[1] + '..')
            const meta = await fa2.tokensMetadata([argv._[1]]);
            console.log(meta)
        } catch (e) {
            console.log('Fetching errored, trying again..')
        }
    } else {
        console.log('Can\'t access tzApi')
    }
}

main()