import { connect } from "./libs/connect";
import { runMethod, Fa2 } from '../packages/fa2-interfaces/dist';
import { Nft } from './libs/nft-interface';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('./configs/' + argv._[0] + ".json").toString())


async function main() {
    let tzApi
    tzApi = await connect(configs.lambdaView)
    if (tzApi !== undefined) {
        console.log('Fetching token metadata..')
        const nft = (await tzApi.bob.at(configs.contract_address)).with(Nft);
        const fa2 = nft.with(Fa2);
        let i = 1
        let errored = false
        while (!errored) {
            try {
                const meta = await fa2.tokensMetadata([i]);
                console.log(meta)
                i++
            } catch {
                errored = true
            }
        }
    } else {
        console.log('Can\'t access tzApi')
    }
}

main()