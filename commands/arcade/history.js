const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios')
const db = require("../../modules/db.js")
const encryption = require("../../modules/encryption.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('history')
		.setDescription('View your arcade history'),
	async execute(interaction) {
        await db.client.connect()
        const data = await db.collections.credentials.findOne({userId: interaction.user.id})
        await db.client.close()
        
		if(!data) return interaction.reply("You need to run /register first!")

        const slackID = encryption.decrypt(data.slackId)
        const key = encryption.decrypt(data.apiKey)

        const url = `https://hackhour.hackclub.com/api/history/${slackID}`
        var embeds = []
        var page = 1

        await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${key}`,
                "User-Agent": "Arcade-Discord-Bot/0.1.0",
                "Content-Tye": "application/json"
            }
        }).then(response => {
            if(response.data.ok == true){
                response.data.data.forEach(s => {
                    console.log(s)
                    const embed = new EmbedBuilder()
                    .setTitle("Arcade History")
                    .setThumbnail("https://imgs.search.brave.com/SPM80GBg6hoGnZCbJf4-PzyiqWlJRGPiRJTdrPh17HA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMuaGFja2NsdWIu/Y29tL2ljb24tcm91/bmRlZC5zdmc")  
                    .setTimestamp()
                    embeds.push(embed)
                })
            } else {
                interaction.reply({ content: `The api returned an error: ${response.data.error}`})
            }
        }).catch(e => {
            console.log(e)
            interaction.reply({ content: `An unknown error occured when trying to reach the api. This is most likely a hack club outage.\n${e}`, ephemeral: true})
        })

        if(embeds.length != 0){
            interaction.reply({ embeds: [embeds[page - 1]] })
        } else {
            
        }
	},
};