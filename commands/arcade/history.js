const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, Events, ComponentType } = require('discord.js');
const axios = require('axios')
const db = require("../../modules/db.js")
const encryption = require("../../modules/encryption.js");

const previousButton = new ButtonBuilder()
.setCustomId("previousButtonHistory")
.setEmoji("⬅️")
.setStyle(ButtonStyle.Primary)
const nextButton = new ButtonBuilder()
.setCustomId("nextButtonHistory")
.setEmoji("➡️")
.setStyle(ButtonStyle.Primary)
const actionRow = new ActionRowBuilder()
actionRow.addComponents(previousButton, nextButton)

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
                var p = 1
                response.data.data.forEach(s => {
                    const embed = new EmbedBuilder()
                    .setAuthor({name: "Arcade History"})
                    .setTitle(s.work)
                    .addFields(
                        { name: "Date created", value: s.createdAt },
                        { name: "Minutes earned", value: s.ended == true ? s.elapsed.toString() : "Session in Progress" },
                        { name: "Goal", value: s.goal}
                    )
                    .setThumbnail("https://imgs.search.brave.com/SPM80GBg6hoGnZCbJf4-PzyiqWlJRGPiRJTdrPh17HA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMuaGFja2NsdWIu/Y29tL2ljb24tcm91/bmRlZC5zdmc")  
                    .setTimestamp()
                    .setFooter({text: `Unofficial  •  Made by devcmb  •  Page ${p}/${response.data.data.length}`, iconURL: "https://cdn.discordapp.com/avatars/998343447524155402/ee6966eccb8f087f54da4c204ab19b29.webp?size=80"})
                    .setColor("Red")
                    p++
                    embeds.push(embed)
                })
            } else {
                interaction.reply({ content: `The api returned an error: ${response.data.error}`, ephemeral: true})
            }
        }).catch(e => {
            console.log(e)
            interaction.reply({ content: `An unknown error occured when trying to reach the api. This is most likely a hack club outage.\n${e}`, ephemeral: true})
        })

        if(embeds.length != 0){
            const reply = await interaction.reply({ embeds: [embeds[page - 1]], components: [actionRow] })
            async function createCollector(){
                const b = await reply.awaitMessageComponent({ time: 240_000 })
                if(b.user.id == interaction.user.id){
                    if(b.customId == "previousButtonHistory" && page > 1){
                        if(embeds[page]){
                            await b.update({ embeds: [embeds[page]], components: [actionRow] })
                            await page--
                            await createCollector()
                        } else {
                            page++
                            await b.deferUpdate();
                        }
                    } else if(b.customId == "nextButtonHistory" && page < embeds.length) {
                        if(embeds[page]){
                            await b.update({ embeds: [embeds[page]], components: [actionRow] })
                            await page++
                            await createCollector()
                        } else {
                            page--
                            await b.deferUpdate();
                        }
                    } else {
                        await b.deferUpdate();
                    }
                } else {
                    b.reply({ content: `These buttons aren't for you!`, ephemeral: true });
                }
            }
            await createCollector()
        } else {
            interaction.reply("You don't have any history!")
        }
	},
};