const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, Events, ComponentType } = require('discord.js');
const axios = require('axios')
const db = require("../../modules/db.js")
const encryption = require("../../modules/encryption.js");

const previousButton = new ButtonBuilder()
.setCustomId("previousButtonGoals")
.setEmoji("⬅️")
.setStyle(ButtonStyle.Primary)
const nextButton = new ButtonBuilder()
.setCustomId("nextButtonGoals")
.setEmoji("➡️")
.setStyle(ButtonStyle.Primary)
const actionRow = new ActionRowBuilder()
actionRow.addComponents(previousButton, nextButton)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('goals')
		.setDescription('View your arcade goals'),
	async execute(interaction) {
        await db.client.connect()
        const data = await db.collections.credentials.findOne({userId: interaction.user.id})
        await db.client.close()
        
		if(!data) return interaction.reply("You need to run /register first!")

        const slackID = encryption.decrypt(data.slackId)
        const key = encryption.decrypt(data.apiKey)

        const url = `https://hackhour.hackclub.com/api/goals/${slackID}`
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
                
                if(!response.data.data) return;
                response.data.data.forEach(async g => {
                    const embed = new EmbedBuilder()
                    .setAuthor({name: "Arcade Goals"})
                    .setTitle(g.name)
                    .addFields(
                        { name: "Minutes earned", value: g.minutes.toString() },
                    )
                    .setThumbnail("https://cloud-g7rxbaej0-hack-club-bot.vercel.app/0hackclubdiscordicon.png")  
                    .setTimestamp()
                    .setFooter({text: `Unofficial  •  Made by devcmb  •  Page ${p}/${response.data.data.length}`, iconURL: "https://cdn.discordapp.com/avatars/998343447524155402/ee6966eccb8f087f54da4c204ab19b29.webp?size=80"})
                    .setColor("Blurple")
                    await p++
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
            const reply = await interaction.reply({ embeds: [embeds[page - 1]], components: [actionRow] })
            async function createCollector(){
                const b = await reply.awaitMessageComponent({ time: 240_000 })
                if(b.user.id == interaction.user.id){
                    if(b.customId == "previousButtonGoals" && page > 1){
                        if(embeds[page]){
                            await b.update({ embeds: [embeds[page]], components: [actionRow] })
                            await page--
                            await createCollector()
                        } else {
                            page++
                            await b.deferUpdate();
                        }
                    } else if(b.customId == "nextButtonGoals" && page < embeds.length) {
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
            interaction.reply("You don't have any goals!")
        }
	},
};