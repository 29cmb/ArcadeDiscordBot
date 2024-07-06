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
            }).then(response => {
                const data = response.data
                if(data.ok == true){
                    var success

                    if(db.findOne(db.collections.credentials, { userId: interaction.user.id })){
                        success = db.updateOne(db.collections.credentials, { userId: interaction.user.id }, {
                            userId: interaction.user.id,
                            slackId: encryption.encrypt(uid),
                            apiKey: encryption.encrypt(apiKey)
                        })
                    } else {
                        success = db.insertOne(db.collections.credentials, {
                            userId: interaction.user.id,
                            slackId: encryption.encrypt(uid),
                            apiKey: encryption.encrypt(apiKey)
                        })
                    }
                    
                    if(success){
                        interaction.reply({ content: "Credentials saved successfully!", ephemeral: true })
                    } else {
                        interaction.reply({ content: "There was an error trying to save your credentials. Please try again later", ephemeral: true })
                    }
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