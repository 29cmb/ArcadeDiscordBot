const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios')
const db = require("../../modules/db.js")
const encryption = require("../../modules/encryption.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Checks your stats'),
	async execute(interaction) {
        await db.client.connect()
        const data = await db.collections.credentials.findOne({userId: interaction.user.id}).then(() => {
            db.client.close()
        })
		if(!data) return interaction.reply("You need to run /register first!")

        const slackID = encryption.decrypt(data.slackId)
        const key = encryption.decrypt(data.apiKey)
        
        const url = `https://hackhour.hackclub.com/api/stats/${slackID}`
        axios.get(url, {
            headers: {
                "Authorization": `Bearer ${key}`,
                "User-Agent": "Arcade-Discord-Bot/0.1.0",
                "Content-Tye": "application/json"
            }
        }).then(response => {
            if(response.data.ok == true){
                interaction.reply({ content: `Total Sessions: ${response.data.data.sessions}\nTotal minutes: ${response.data.data.total}`, ephemeral: true})
            } else {
                if(response.data.error == "Unauthorized"){
                    interaction.reply({ content: "Your API key is invalid", ephemeral: true })
                } else {
                    interaction.reply({ content: `The api returned an error: ${response.data.error}`})
                }
            }
        }).catch(e => {
            if(e.response){
                if(e.response.data.error == "Unauthorized"){
                    interaction.reply({ content: "Your API key is invalid", ephemeral: true })
                } else if(e.response.data.error == "User not found") {
                    interaction.reply({ content: "User ID is invalid.", ephemeral: true})
                } else {
                    interaction.reply({ content: `The api returned an error: ${e.response.data.error}`, ephemeral: true})
                }
            } else {
                interaction.reply({ content: `An unknown error occured when trying to reach the api. This is most likely a hack club outage.`, ephemeral: true})
            }
            
        })
	},
};