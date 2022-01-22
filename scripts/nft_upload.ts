const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('./configs/' + argv._[0] + ".json").toString())
const keys = JSON.parse(fs.readFileSync('./configs/keys.json').toString())
const { Configuration, OpenAIApi } = require("openai");
const pinataSDK = require('@pinata/sdk')


async function main() {
    const metadata = fs.readdirSync('./nfts/metadata')
    const pinata = pinataSDK(keys.pinata_apiKey, keys.pinata_apiSecret);
    if (!fs.existsSync('./nfts/list.json')) {
        fs.writeFileSync('./nfts/list.json', JSON.stringify({}))
    }
    let final = JSON.parse(fs.readFileSync('./nfts/list.json').toString())
    console.log('Generated ' + Object.keys(final).length + ' NFTs yet.')
    for (let k in metadata) {
        let data = JSON.parse(fs.readFileSync('./nfts/metadata/' + metadata[k]).toString())
        const tokenId = parseInt(data.name.split('#')[1])
        if (final[tokenId] === undefined) {
            try {
                console.log('Uploading NFT #' + tokenId + '..')
                const metadataCID = await pinata.pinJSONToIPFS(data, { pinataMetadata: { name: '[' + configs.contract.name + '] NFT #' + data.name.split('#')[1] } })
                final[tokenId] = metadataCID.IpfsHash
                fs.writeFileSync('./nfts/list.json', JSON.stringify(final))
                console.log('List updated!')
                console.log('--')
            } catch (e) {
                console.log(e)
                console.log('--')
            }
        } else {
            console.log('Final NFT generated for #' + k)
        }
    }
}

main()