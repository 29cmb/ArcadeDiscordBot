const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ThreadAutoArchiveDuration, MessageCollector } = require('discord.js');
const axios = require('axios')
const db = require("../../modules/db.js")
const encryption = require("../../modules/encryption.js");
const { ActionRowBuilder } = require('@discordjs/builders');
const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

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
                await interaction.deferReply();
                const sentMsg = await interaction.editReply("Session started!");

                const thread = await sentMsg.startThread({
                    name: `${interaction.user.username}'s Arcade Session`,
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
                    reason: `${interaction.user.username} finished their hour!`
                });

                const button = new ButtonBuilder()
                .setLabel("Enable bridge")
                .setStyle(ButtonStyle.Success)
                .setCustomId("enableBridge")
                const actionRow = new ActionRowBuilder()
                actionRow.addComponents([button])

                const reply = thread.send({ content: `<@${interaction.user.id}> started a 1 hour arcade session!`, components: [actionRow] })
                const b = await reply.awaitMessageComponent({ time: 3_600_000 }) // 1 hour
                const startTime = Date.now()
                if(b.user.id == interaction.user.id){
                    if(b.customId == "enableBridge"){
                        const collectorFilter = i => i.user.id === interaction.user.id;
                        const collector = new MessageCollector(thread, {collectorFilter, time: 3_600_000 })
                        collector.on("collect", (message) => {
                            // oh no the scary part where I need to actually bridge the message
                        })

                        collector.on("end", (message) => {
                            thread.send(`<@${interaction.user.id}> finished their hour!`)
                        })
                    }
                } else {
                    b.reply({ content: `These buttons aren't for you!`, ephemeral: true });
                }
            } else {
                if(response.data.error == "You already have an active session"){
                    interaction.reply("You already have an active session!")
                }
            }
        }).catch(async e => {
            if(e.response){
                if(e.response.data.error == "You already have an active session"){
                    // interaction.reply("You already have an active session!")
                    await interaction.deferReply();
                    const sentMsg = await interaction.editReply("Session started!");

                    const thread = await sentMsg.startThread({
                        name: `${interaction.user.username}'s Arcade Session`,
                        autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
                        reason: `${interaction.user.username} finished their hour!`
                    });

                    const button = new ButtonBuilder()
                    .setLabel("Enable bridge")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("enableBridge")
                    const actionRow = new ActionRowBuilder()
                    actionRow.addComponents([button])

                    const reply = thread.send({ content: `<@${interaction.user.id}> started a 1 hour arcade session!`, components: [actionRow] })
                    const b = await reply.awaitMessageComponent({ time: 3_600_000 }) // 1 hour
                    const startTime = Date.now()
                    if(b.user.id == interaction.user.id){
                        if(b.customId == "enableBridge"){
                            const collectorFilter = i => i.user.id === interaction.user.id;
                            const collector = new MessageCollector(thread, {collectorFilter, time: 3_600_000 })
                            collector.on("collect", (message) => {
                                // oh no the scary part where I need to actually bridge the message
                            })

                            collector.on("end", (message) => {
                                thread.send(`<@${interaction.user.id}> finished their hour!`)
                            })
                        }
                    } else {
                        b.reply({ content: `These buttons aren't for you!`, ephemeral: true });
                    }
                } else {
                    interaction.reply({ content: `An unknown error occured when trying to reach the api. This is most likely a hack club outage.\n${e}`, ephemeral: true})
                }
            } else {
                interaction.reply({ content: `An unknown error occured when trying to reach the api. This is most likely a hack club outage.\n${e}`, ephemeral: true})
            }
           
        })
	},
};