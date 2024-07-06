const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const axios = require('axios')

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
        .setLabel("What is your slack ID? Don't know? Check the #what-is-my-slack-id channel on the hackclub slack.")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Slack ID")
        .setRequired(false);

        const apiKey = new TextInputBuilder()
        .setCustomId("apiKey")
        .setLabel("What is your hack club API key? Don't know? Run /api in any channel in the hackclub slack.")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("API Key")
        .setRequired(false);

        const confirmation = new TextInputBuilder()
        .setCustomId("confirmation")
        .setLabel("Confirm that all details above are correct and then type \"confirm\", then hit submit. All data is encrypted and the bot source code is avilable on github.")
        .setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(slackID), new ActionRowBuilder().addComponents(apiKey), new ActionRowBuilder().addComponents(confirmation))

        await interaction.showModal(modal)
	},
};