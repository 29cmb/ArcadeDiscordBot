const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios')
const db = require("../../modules/db.js")
const encryption = require("../../modules/encryption.js")
const r = require("../../modules/response.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause your active session'),
	async execute(interaction) {
        await db.client.connect()
        const data = await db.collections.credentials.findOne({userId: interaction.user.id})
        await db.client.close()

		if(!data) return interaction.reply("You need to run /register first!")

        const slackID = encryption.decrypt(data.slackId)
        const key = encryption.decrypt(data.apiKey)
        
        const url = `https://hackhour.hackclub.com/api/cancel/${slackID}`
        axios.post(url, {}, {
            headers: {
                "Authorization": `Bearer ${key}`,
                "User-Agent": "Arcade-Discord-Bot/0.1.0",
                "Content-Tye": "application/json"
            }
        }).then(response => {
            if(response.data.ok == true){
                interaction.reply({ content: r("end", interaction.user) })
            } else {
                interaction.reply({ content: `The api returned an error: ${response.data.error}`, ephemeral: true})
            }
        }).catch(e => {
            interaction.reply({ content: `An unknown error occured when trying to reach the api. This is most likely a hack club outage.`, ephemeral: true})
        })
	},
};