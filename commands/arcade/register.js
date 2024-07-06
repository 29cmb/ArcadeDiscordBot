const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your slack ID and api key'),
	async execute(interaction) {
        const modal = new ModalBuilder()
        modal.setCustomId("credentialsInput")
        modal.setTitle("Arcade Credentias")

        const slackID = new TextInputBuilder()
        .setCustomId("slackID")
        .setLabel("What is your slack ID?")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("\"#what-is-my-slack-id\" on the HackClub slack")
        .setRequired(true);

        const apiKey = new TextInputBuilder()
        .setCustomId("apiKey")
        .setLabel("What is your hack club API key?")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("\"/api\" in the hackclub slack")
        .setRequired(true);

        const confirmation = new TextInputBuilder()
        .setCustomId("confirmation")
        .setLabel("Type \"confirm\" to continue")
        .setPlaceholder("All data is encrypted, bot source code is on github.")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(slackID), new ActionRowBuilder().addComponents(apiKey), new ActionRowBuilder().addComponents(confirmation))

        await interaction.showModal(modal)
	},
};