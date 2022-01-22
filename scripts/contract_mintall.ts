import { connect } from "./libs/connect";
import { runMethod, Fa2 } from '../packages/fa2-interfaces/dist';
import { Nft, createTokenMetadata } from './libs/nft-interface';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('./configs/' + argv._[0] + ".json").toString())
const metadata = JSON.parse(fs.readFileSync('./nfts/list.json').toString())

const tokenMeta = (tokenId: number) => {
    if (metadata[tokenId] !== undefined) {
        console.log('Found token metadata:', metadata[tokenId])
        return [createTokenMetadata(
            tokenId,
            'ipfs://' + metadata[tokenId]
        )];
    } else {
        return false
    }
}

async function main() {
    let tzApi
    tzApi = await connect(configs.lambdaView)
    if (tzApi !== undefined) {
        for (let i = 0; i <= 100; i++) {
            console.log('Minting token #' + i + '..')
            const nft = (await tzApi.bob.at(configs.contract_address)).with(Nft);
            const tokens = tokenMeta(i)
            if (tokens !== undefined && tokens !== false) {
                const owner = configs.minter_address
                try {
                    await runMethod(nft.mintTokens([{ owner, tokens }]))
                    console.log('Nft #' + i + ' minted!');
                    console.log('--')
                } catch (e) {
                    console.log(e)
                }
            }
        }
    } else {
        console.log('Can\'t access tzApi')
    }
}

main()