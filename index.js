const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const commands = [
  new SlashCommandBuilder()
    .setName('info')
    .setDescription('über den Bot'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registering PUBLIC slash command...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Public slash command registered');

    client.once('ready', async () => {
      console.log(`Logged in as ${client.user.tag}`);
      
      // Set bot's status
      client.user.setActivity('Bot sein', { type: 3 }); // Type 3 is "Watching"
      
      // Set bot's about me with watermark
      const watermark = "BOT";
      
      // Function to ensure watermark stays
      const ensureWatermark = async () => {
        try {
          await client.application.edit({
            description: watermark
          });
        } catch (error) {
          console.error('Failed to update application description:', error);
        }
      };

      // Set initial watermark
      await ensureWatermark();
      
      // Check and reset watermark every 5 minutes
      setInterval(ensureWatermark, 5 * 60 * 1000);
    });

  

    client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isChatInputCommand()) return;
      if (interaction.commandName !== 'info') return;

      const userId = interaction.user.id;
      let userTimers = {};
      
      // Read existing timers
      try {
        userTimers = JSON.parse(fs.readFileSync('./userTimers.json'));
      } catch (error) {
        console.error('Error reading timer file:', error);
      }

      const now = Date.now();
      let future;
      let timeLeft;

      // Check if user already has an active timer
      if (userTimers[userId] && userTimers[userId] > now) {
        future = userTimers[userId];
        timeLeft = `<t:${Math.floor(future / 1000)}:R>`;
      } else {
        // Set new timer
        future = now + 24 * 60 * 60 * 1000;
        timeLeft = `<t:${Math.floor(future / 1000)}:R>`;
        userTimers[userId] = future;
        
        // Save to file
        fs.writeFileSync('./userTimers.json', JSON.stringify(userTimers, null, 2));
      }

      const embed = new EmbedBuilder()
        .setTitle('🚀 Über den Bot')
        .setDescription(`
        **BOT von MP38102** 
        `)
        .setColor('#00D4AA')
        .setFooter({ 
          text: 'Made with ❤️ by MP38102',

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Github')
          .setStyle(ButtonStyle.Link)
          .setURL('https://github.com/MP38102/Discord-Bot')
      );

      await interaction.reply({ 
        embeds: [embed], 
        components: [row],
        ephemeral: false 
      });
    });

    client.login(TOKEN);

  } catch (err) {
    console.error(err);
  }
})();
