const taquito = require('@taquito/taquito');
const signer = require('@taquito/signer');
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('./configs/' + argv._[0] + ".json").toString())
const axios = require('axios')

async function main() {
    const tezos = new taquito.TezosToolkit(configs.provider);
    tezos.setProvider({
        signer: new signer.InMemorySigner(configs.privKey)
    });
    let instance = await tezos.contract.at(configs.contract_address)
    console.log('Contract injected..')
    const storage = await instance.storage()
    let i = 0
    let finished = false
    while (!finished) {
        try {
            const metadata = await storage.assets.token_metadata.get(i)
            let values = metadata.token_info.values()
            let ipfs
            for (let value of values) {
                ipfs = Buffer.from(value, 'hex').toString()
            }
            if (ipfs !== undefined) {
                console.log('IPFS metadata is:', ipfs)
                let token = await axios.get(configs.ipfs_endpoint + '/ipfs/' + ipfs.replace('ipfs://', ''))
                console.log('Metadata details are:', token.data)
            }
            i++
        } catch {
            finished = true
        }
    }
}

main()