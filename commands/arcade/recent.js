const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, Events, ComponentType } = require('discord.js');
const axios = require('axios')
const db = require("../../modules/db.js")
const encryption = require("../../modules/encryption.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('recent')
		.setDescription('Get the most recent session'),
	async execute(interaction) {
        await db.client.connect()
        const data = await db.collections.credentials.findOne({userId: interaction.user.id})
        await db.client.close()
        
		if(!data) return interaction.reply("You need to run /register first!")

        const slackID = encryption.decrypt(data.slackId)
        const key = encryption.decrypt(data.apiKey)

        const url = `https://hackhour.hackclub.com/api/session/${slackID}`

        await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${key}`,
                "User-Agent": "Arcade-Discord-Bot/0.1.0",
                "Content-Tye": "application/json"
            }
        }).then(response => {
            if(response.data.ok == true){
                const data = response.data.data
                
                const embed = new EmbedBuilder()
                .setAuthor({name: "Arcade Session"})
                .setTitle(data.work)
                .addFields(
                    { name: "Date created", value: data.createdAt },
                    { name: "Minutes earned", value: data.elapsed.toString() },
                    { name: "Goal", value: data.goal }
                )
                .setThumbnail("https://imgs.search.brave.com/SPM80GBg6hoGnZCbJf4-PzyiqWlJRGPiRJTdrPh17HA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMuaGFja2NsdWIu/Y29tL2ljb24tcm91/bmRlZC5zdmc")  
                .setTimestamp()
                .setFooter({text: `Unofficial  •  Made by devcmb`, iconURL: "https://cdn.discordapp.com/avatars/998343447524155402/ee6966eccb8f087f54da4c204ab19b29.webp?size=80"})
                .setColor("Red")
                if(data.completed == false && data.paused == false){
                    embed.setDescription("Why are you looking at the bot while in a session? Go make something awesome!")
                }

                interaction.reply({ embeds: [embed] })
            } else {
                interaction.reply({ content: `The api returned an error: ${response.data.error}`, ephemeral: true})
            }
        }).catch(e => {
            console.log(e)
            interaction.reply({ content: `An unknown error occured when trying to reach the api. This is most likely a hack club outage.\n${e}`, ephemeral: true})
        })
	},
};