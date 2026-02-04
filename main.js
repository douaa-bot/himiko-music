require('dotenv').config();

const { Player } = require('discord-player');
const { Client, GatewayIntentBits } = require('discord.js');
const { YoutubeiExtractor } = require('discord-player-youtubei'); // Import the new extractor

global.client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
    disableMentions: 'everyone',
});

client.config = require('./config');

// Initialisation du player
const player = new Player(client, client.config.opt.discordPlayer);
player.extractors.register(YoutubeiExtractor, {}); // Enregistrement de l'extracteur YouTube

// Chargement des handlers, commandes, etc.
console.clear();
require('./loader');

// Gestion des messages avec préfixe
const prefix = client.config.app.prefix;

client.on('messageCreate', async (message) => {
    // Ignore les messages de bots et les messages privés
    if (message.author.bot || !message.guild) return;

    // Ignore si ça ne commence pas par le préfixe
    if (!message.content.startsWith(prefix)) return;

    // Découpe la commande
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Récupère la commande depuis la collection
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute({ client, message, args });
    } catch (err) {
        console.error(`❌ Erreur avec la commande ${commandName}`, err);
        message.reply("Une erreur est survenue lors de l'exécution de la commande.");
    }
});

// Connexion au bot
client.login(client.config.app.token).catch(async (e) => {
    if (e.message === 'An invalid token was provided.') {
        require('./process_tools').throwConfigError(
            'app',
            'token',
            '\n\t   ❌ Invalid Token Provided! ❌ \n\tChange the token in the config file\n'
        );
    } else {
        console.error('❌ An error occurred while trying to login to the bot! ❌ \n', e);
    }
});
