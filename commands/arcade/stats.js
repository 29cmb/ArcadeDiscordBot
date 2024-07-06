const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Checks your stats')
        .addStringOption(option => 
            option
            .setName("id")
                .setDescription("Set the slack user ID to check")
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName("key")
                .setDescription("Your hack club API key")
                .setRequired(true) // TODO: Hook up to a database so you just have to run /setCredentials
        ),
	async execute(interaction) {
		const slackID = interaction.options.getString("id")
        const key = interaction.options.getString("key")
        const url = `https://hackhour.hackclub.com/api/stats/${slackID}`
        axios.get(url, {
            headers: {
                "Authorization": `Bearer ${key}`,
                "User-Agent": "Arcade-Discord-Bot/0.1.0",
                "Content-Tye": "application/json"
            }
        }).then(response => {
            if(response.data.ok == true){
                console.log(response.data)
                interaction.reply({ content: `Total Sessions: ${response.data.data.sessions}\nTotal minutes: ${response.data.data.total}`, ephemeral: true})
            }
        })
	},
};