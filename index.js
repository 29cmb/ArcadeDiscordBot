// Remember to change deploy-commands back to gloabl scope
const Discord = require("discord.js")

const fs = require('fs')
const path = require('path')
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.MessageContent] })
require("dotenv").config()
client.commands = new Discord.Collection()

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}
require("./modules/deploy-commands")()
const db = require("./modules/db.js")
db.run()

// Slack
const { App } = require('@slack/bolt');
const { WebClient } = require('@slack/web-api');
const slackApp = new App({
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	token: process.env.SLACK_BOT_TOKEN,
});

(async () => {
	await slackApp.start(process.env.SLACK_PORT || 3500);
	console.log('⚡️ Bolt app is running!');
})();

const slack = require('slack-express')
const express = require('express')
const app = express()
app.use(express.json())

app.get("/", (req, res) => {
	res.send("Express server online")
})

app.post('/link', async (req, res) => {
    const payload = req.body;

    if (payload && payload.command === '/link') {
        try {
            res.status(200).send();
            const threadChannelId = payload.channel_id;

            await slackApp.client.chat.postMessage({
                channel: threadChannelId,
                text: `Thread channel ID: ${threadChannelId}`,
            });
        } catch (error) {
            console.error('Error handling slash command: ', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(400).send('Bad Request');
    }
});

app.head("/", (req, res) => {})
app.options("/", (req, res) => {})

app.listen(process.env.PORT || 5000, () => {
	console.log("express server online")
})




client.login(process.env.Token)

