import {
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} from 'discord.js';
import { token, broadcastChannelId } from './config.json';

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = new Collection<
  string,
  {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction<CacheType>) => void;
  }
>();

const yesCommand = {
  data: new SlashCommandBuilder()
    .setName('yes')
    .setDescription('Sends YES to chat.'),
  async execute() {
    const channel = client.channels.cache.get(broadcastChannelId);
    if (channel?.type === ChannelType.GuildText) {
      await channel.send('YES');
    }
  },
};

const noCommand = {
  data: new SlashCommandBuilder()
    .setName('no')
    .setDescription('Sends NO to chat.'),
  async execute() {
    const channel = client.channels.cache.get(broadcastChannelId);
    if (channel?.type === ChannelType.GuildText) {
      await channel.send('NO');
    }
  },
};

const idkCommand = {
  data: new SlashCommandBuilder()
    .setName('idk')
    .setDescription("Sends I DON'T KNOW to chat."),
  async execute() {
    const channel = client.channels.cache.get(broadcastChannelId);
    if (channel?.type === ChannelType.GuildText) {
      await channel.send("I DON'T KNOW");
    }
  },
};

commands.set(yesCommand.data.name, yesCommand);
commands.set(noCommand.data.name, noCommand);
commands.set(idkCommand.data.name, idkCommand);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);
