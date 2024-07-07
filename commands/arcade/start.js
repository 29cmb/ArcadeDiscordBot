const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, Events, ComponentType, ThreadAutoArchiveDuration } = require('discord.js');
const axios = require('axios')
const db = require("../../modules/db.js")
const encryption = require("../../modules/encryption.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Start a new session')
        .addStringOption(option => 
            option
            .setName("work")
                .setDescription("What are you working on?")
                .setRequired(true)
        ),
	async execute(interaction) {
        await db.client.connect()
        const data = await db.collections.credentials.findOne({userId: interaction.user.id})
        await db.client.close()
        
		if(!data) return interaction.reply("You need to run /register first!")
            

        const slackID = encryption.decrypt(data.slackId)
        const key = encryption.decrypt(data.apiKey)

        const url = `https://hackhour.hackclub.com/api/start/${slackID}`

        await axios.post(url, {
            work: interaction.options.getString("work")
        }, 
        { 
            headers: {
                "Authorization": `Bearer ${key}`,
                "User-Agent": "Arcade-Discord-Bot/0.1.0",
                "Content-Tye": "application/json"
            }
        }).then(async response => {
            if(response.data.ok){
                const msg = await interaction.reply("Session started!");
                const thread = await msg.startThread({
                    name: interaction.user.username,
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
                    reason: `${interaction.user.username} finished their hour!`
                });
            } else {
                if(response.data.error == "You already have an active session"){
                    interaction.reply("You already have an active session!")
                }
            }
        }).catch(e => {
            if(e.response){
                if(e.response.data.error == "You already have an active session"){
                    interaction.reply("You already have an active session!")
                } else {
                    interaction.reply({ content: `An unknown error occured when trying to reach the api. This is most likely a hack club outage.\n${e}`, ephemeral: true})
                }
            } else {
                interaction.reply({ content: `An unknown error occured when trying to reach the api. This is most likely a hack club outage.\n${e}`, ephemeral: true})
            }
           
        })
	},
};