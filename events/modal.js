const { Events } = require("discord.js")
const axios = require("axios")
const db = require('../modules/db.js')
const encryption = require("../modules/encryption.js")

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction){
        if (!interaction.isModalSubmit()) return;

        if(interaction.customId === "credentialsInput"){
            const uid = interaction.fields.getTextInputValue("slackID")
            const apiKey = interaction.fields.getTextInputValue("apiKey")

            const url = `https://hackhour.hackclub.com/api/stats/${uid}`

            axios.get(url, {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "User-Agent": "Arcade-Discord-Bot/0.1.0",
                    "Content-Tye": "application/json"
                }  
            }).then(async (response) => {
                const data = response.data
                if(data.ok == true){
                    var success

                    await db.client.connect()
                    if(await db.collections.credentials.findOne({ userId: interaction.user.id })){
                        await db.collections.credentials.updateOne({ userId: interaction.user.id }, {"$set": {
                            userId: interaction.user.id,
                            slackId: encryption.encrypt(uid),
                            apiKey: encryption.encrypt(apiKey)
                        }}).then(() => {
                            db.client.close()
                        }).catch(err => {
                            console.log(err)
                        })
                    } else {
                        await db.collections.credentials.insertOne({
                            userId: interaction.user.id,
                            slackId: encryption.encrypt(uid),
                            apiKey: encryption.encrypt(apiKey)
                        }).then(() => {
                            db.client.close()
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                    
                    interaction.reply({ content: "Credentials saved successfully!", ephemeral: true })
                }
            }).catch(err => {
                if(err.response){
                    interaction.reply({ content: "API key or user ID is invalid.", ephemeral: true })
                } else {
                    interaction.reply({ content: "Could not validate credentials, hackclub might be down.", ephemeral: true })
                }
            })
        }
    }
}