const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('./configs/' + argv._[0] + ".json").toString())
const keys = JSON.parse(fs.readFileSync('./configs/keys.json').toString())
const { Configuration, OpenAIApi } = require("openai");
const pinataSDK = require('@pinata/sdk')

async function generateDescription() {
    const configuration = new Configuration({
        apiKey: keys.openai_key,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion("text-davinci-001", {
        prompt: "We are all astronauts in the space..",
        temperature: 0.7,
        max_tokens: 64,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return "We are all astronauts in the space.." + response.data.choices[0].text
}

async function main() {
    const imgs = fs.readdirSync('./nfts/imgs')
    for (let k in imgs) {
        if (!fs.existsSync('./nfts/metadata/' + k + '.json')) {
            console.log('Generating metadata for NFT #' + k)
            const description = await generateDescription()
            console.log('--')
            console.log('Generated description is:', description)
            console.log('--')
            console.log('Uploading image to IPFS..')
            try {
                const pinata = pinataSDK(keys.pinata_apiKey, keys.pinata_apiSecret);
                const fileCID = await pinata.pinFileToIPFS(fs.createReadStream('./nfts/imgs/' + imgs[k]));
                console.log('IPFS CID is:', fileCID.IpfsHash)
                console.log('--')
                console.log('Saving metadata to disk..')
                let metadata = {
                    "decimals": 0,
                    "isBooleanAmount": true,
                    "name": "Pixelnauts #" + String(k).padStart(3, '0'),
                    "description": description,
                    "tags": [
                        "ai",
                        "pixelart",
                        "astronauts"
                    ],
                    "minter": configs.minter_address,
                    "artifactUri": "ipfs://" + fileCID.IpfsHash
                }
                fs.writeFileSync('./nfts/metadata/' + k + '.json', JSON.stringify(metadata))
                console.log('NFT saved!')
                console.log('--')
            } catch (e) {
                console.log('Can\'t generate NFT #' + k)
                console.log('--')
                console.log(e)
                console.log('--')
            }
        } else {
            console.log('Metadata generated yet for NFT #' + k)
        }
    }
}

main()