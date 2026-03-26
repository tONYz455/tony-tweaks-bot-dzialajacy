import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  PermissionsBitField,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';

const config = {
  token: process.env.TOKEN,
  clientId: '1486515350806859786',
  guildId: '409188722640945192',
  supportRoleId: '1409194225844621322',
  ticketCategoryId: '1486526374674956348',
  ticketLogChannelId: 'WSTAW_TUTAJ_ID_KANALU_LOGOW',
  defaultLanguage: 'pl',
};

const translations = {
  pl: {
    offerSent: 'Panel oferty został wysłany.',
    genericError: 'Wystąpił błąd podczas wykonywania akcji.',
    openTicket: 'Otwórz Ticket',
    closeTicket: 'Zamknij Ticket',
    ticketCreated: 'Gotowe — utworzyłem ticket:',
    ticketAlreadyExists: 'Masz już otwarty ticket:',
    ticketOnlyText: 'To działa tylko na kanale tekstowym.',
    notTicket: 'Ten kanał nie wygląda na ticket.',
    closingTicket: 'Zamykam ticket za 5 sekund...',
    newTicket: 'Nowy Ticket',
    ticketIntro: 'Cześć {user}, opisz tutaj czego potrzebujesz.',
    sendBestInfo: 'Wyślij najlepiej od razu:',
    spec1: '• specyfikację komputera',
    spec2: '• model CPU / GPU / RAM',
    spec3: '• chłodzenie',
    spec4: '• wersję Windowsa',
    spec5: '• czego dokładnie oczekujesz',
    panelSent: 'Panel wyboru języka został wysłany.',
    renameFailed: '❌ Nie udało się zmienić nazwy kanału.',
    unsupportedChannel: '❌ Ten typ kanału nie jest obsługiwany.',
  },
  en: {
    offerSent: 'Offer panel has been sent.',
    genericError: 'An error occurred while processing the action.',
    openTicket: 'Open Ticket',
    closeTicket: 'Close Ticket',
    ticketCreated: 'Done — I created a ticket:',
    ticketAlreadyExists: 'You already have an open ticket:',
    ticketOnlyText: 'This only works in a text channel.',
    notTicket: 'This channel does not look like a ticket.',
    closingTicket: 'Closing the ticket in 5 seconds...',
    newTicket: 'New Ticket',
    ticketIntro: 'Hi {user}, describe what you need here.',
    sendBestInfo: 'Please send these details right away if possible:',
    spec1: '• your PC specifications',
    spec2: '• CPU / GPU / RAM model',
    spec3: '• cooling solution',
    spec4: '• Windows version',
    spec5: '• what exactly you expect',
    panelSent: 'Language selection panel has been sent.',
    renameFailed: '❌ Failed to rename the channel.',
    unsupportedChannel: '❌ This channel type is not supported.',
  },
};

if (!config.token) {
  console.error('Brak TOKEN w zmiennych środowiskowych.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

function getLang(lang) {
  return translations[lang] || translations[config.defaultLanguage] || translations.pl;
}

function buildOfferEmbed(guild, langKey) {
  if (langKey === 'pl') {
    return new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle('📦 Pakiet Optymalizacji / Tweaks Pack')
      .setDescription(
`💸 **Cena:**
• 5€ / ~22 zł

🛠️ **Zawartość pakietu:**

⚡ **CPU Boost**
• Optymalizacje zwiększające wydajność procesora

🚀 **Opti Mods**
• Zaawansowane modyfikacje systemu

🖥️ **OPTI+MOV**
• Tweaki pod płynność i responsywność

📦 **Pack 1 & Pack 2**
• Dodatkowe zestawy optymalizacji

⚙️ **PACK REGEDIT**
• Zmiany w rejestrze Windows

💎 **Premium Tweaks**
• Najmocniejsze optymalizacje

🔧 **PTI**
• Narzędzia i konfiguracje systemowe

🎮 **Smooth Game**
• Optymalizacja pod gry (FPS, input lag)

🧩 **Tweaks 1**
• Podstawowe usprawnienia

---

🔥 **Efekt:**
• Więcej FPS
• Mniejszy lag
• Lepsza wydajność`
      )
      .setFooter({ text: guild?.name || 'Serwer' });
  }

  return new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('📦 Optimization / Tweaks Pack')
    .setDescription(
`💸 **Price:**
• 5€ / ~5.5$

🛠️ **Package Includes:**

⚡ **CPU Boost**
• Optimizations to improve CPU performance

🚀 **Opti Mods**
• Advanced system performance tweaks

🖥️ **OPTI+MOV**
• Smoothness & responsiveness tweaks

📦 **Pack 1 & Pack 2**
• Additional optimization bundles

⚙️ **PACK REGEDIT**
• Windows registry optimizations

💎 **Premium Tweaks**
• High-end advanced tweaks

🔧 **PTI**
• Extra tools & configurations

🎮 **Smooth Game**
• Gaming optimization (FPS, input lag)

🧩 **Tweaks 1**
• Basic system improvements

---

🔥 **Result:**
• More FPS
• Less lag
• Better performance`
    )
    .setFooter({ text: guild?.name || 'Server' });
}

function buildLanguageButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('send_offer_pl')
      .setLabel('Polski')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🇵🇱'),
    new ButtonBuilder()
      .setCustomId('send_offer_en')
      .setLabel('English')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🇬🇧')
  );
}

function buildTicketButtons(langKey) {
  const t = getLang(langKey);

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`open_ticket_${langKey}`)
      .setLabel(t.openTicket)
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎫'),
    new ButtonBuilder()
      .setCustomId(`close_ticket_${langKey}`)
      .setLabel(t.closeTicket)
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒')
  );
}

function sanitizeChannelName(name) {
  return String(name ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90);
}

function isSupportedRenameChannel(channel) {
  return channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice;
}

function buildSafeChannelName(emoji, baseName) {
  const safeEmoji = String(emoji ?? '').trim();
  const safeBaseName = sanitizeChannelName(baseName);

  if (safeEmoji && safeBaseName) {
    return `${safeEmoji}・${safeBaseName}`.slice(0, 100);
  }

  if (safeEmoji) {
    return safeEmoji.slice(0, 100);
  }

  if (safeBaseName) {
    return safeBaseName.slice(0, 100);
  }

  return 'kanal';
}

async function safeReply(interaction, payload) {
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp(payload);
  }
  return interaction.reply(payload);
}

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('oferta')
      .setDescription('Wysyła polski panel oferty')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    new SlashCommandBuilder()
      .setName('offer')
      .setDescription('Sends the English offer panel')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    new SlashCommandBuilder()
      .setName('panel')
      .setDescription('Wysyła panel wyboru języka / Sends language selection panel')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    new SlashCommandBuilder()
      .setName('zamknij')
      .setDescription('Zamyka aktualny ticket')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

    new SlashCommandBuilder()
      .setName('close')
      .setDescription('Closes the current ticket')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

    new SlashCommandBuilder()
      .setName('kanal-emoji')
      .setDescription('Ustawia nazwę kanału jako samo emoji')
      .addChannelOption(option =>
        option
          .setName('kanal')
          .setDescription('Wybierz kanał')
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('emoji')
          .setDescription('Emoji, np. 🔥')
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

    new SlashCommandBuilder()
      .setName('kanal-nazwa')
      .setDescription('Zmienia nazwę kanału bez emoji')
      .addChannelOption(option =>
        option
          .setName('kanal')
          .setDescription('Wybierz kanał')
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('nazwa')
          .setDescription('Nowa nazwa, np. ogloszenia')
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

    new SlashCommandBuilder()
      .setName('kanal-ustaw')
      .setDescription('Ustawia emoji i/lub nazwę kanału')
      .addChannelOption(option =>
        option
          .setName('kanal')
          .setDescription('Wybierz kanał')
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('emoji')
          .setDescription('Emoji, np. 📢')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('nazwa')
          .setDescription('Nowa nazwa, np. ogloszenia')
          .setRequired(false)
      )
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(config.token);

  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands }
  );

  console.log('Zarejestrowano komendy slash.');
}

async function createTicket(interaction, langKey = config.defaultLanguage) {
  const t = getLang(langKey);
  const guild = interaction.guild;

  const existingChannel = guild.channels.cache.find(
    channel =>
      channel.parentId === config.ticketCategoryId &&
      channel.topic === `ticket-owner:${interaction.user.id}`
  );

  if (existingChannel) {
    return safeReply(interaction, {
      content: `${t.ticketAlreadyExists} ${existingChannel}`,
      ephemeral: true,
    });
  }

  const safeName = interaction.user.username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20) || 'user';

  const channel = await guild.channels.create({
    name: `ticket-${safeName}`,
    type: ChannelType.GuildText,
    parent: config.ticketCategoryId,
    topic: `ticket-owner:${interaction.user.id}`,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
      {
        id: config.supportRoleId,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.ManageChannels,
        ],
      },
    ],
  });

  const infoEmbed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`🎫 ${t.newTicket}`)
    .setDescription([
      t.ticketIntro.replace('{user}', `${interaction.user}`),
      '',
      `**${t.sendBestInfo}**`,
      t.spec1,
      t.spec2,
      t.spec3,
      t.spec4,
      t.spec5,
    ].join('\n'));

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`close_ticket_${langKey}`)
      .setLabel(t.closeTicket)
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒')
  );

  await channel.send({
    content: `${interaction.user} <@&${config.supportRoleId}>`,
    embeds: [infoEmbed],
    components: [closeRow],
  });

  if (config.ticketLogChannelId) {
    const logChannel = guild.channels.cache.get(config.ticketLogChannelId);
    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send(`📨 Ticket opened by ${interaction.user.tag}: ${channel}`);
    }
  }

  await safeReply(interaction, {
    content: `${t.ticketCreated} ${channel}`,
    ephemeral: true,
  });
}

async function closeTicket(interaction, langKey = config.defaultLanguage) {
  const t = getLang(langKey);
  const channel = interaction.channel;

  if (!channel || channel.type !== ChannelType.GuildText) {
    return safeReply(interaction, {
      content: t.ticketOnlyText,
      ephemeral: true,
    });
  }

  if (!channel.parentId || channel.parentId !== config.ticketCategoryId) {
    return safeReply(interaction, {
      content: t.notTicket,
      ephemeral: true,
    });
  }

  await safeReply(interaction, {
    content: t.closingTicket,
    ephemeral: true,
  });

  if (config.ticketLogChannelId) {
    const logChannel = interaction.guild.channels.cache.get(config.ticketLogChannelId);
    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send(`🔒 Ticket closed: #${channel.name} by ${interaction.user.tag}`);
    }
  }

  setTimeout(async () => {
    try {
      await channel.delete();
    } catch (error) {
      console.error('Nie udało się usunąć ticketu:', error);
    }
  }, 5000);
}

client.once('ready', async () => {
  console.log(`Bot zalogowany jako ${client.user.tag}`);

  try {
    await registerCommands();
  } catch (error) {
    console.error('Błąd rejestracji komend:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'oferta') {
        if (!interaction.channel || !interaction.channel.isTextBased()) {
          return safeReply(interaction, {
            content: 'Ta komenda działa tylko na kanale tekstowym.',
            ephemeral: true,
          });
        }

        await interaction.channel.send({
          embeds: [buildOfferEmbed(interaction.guild, 'pl')],
          components: [buildTicketButtons('pl')],
        });

        return safeReply(interaction, {
          content: getLang('pl').offerSent,
          ephemeral: true,
        });
      }

      if (interaction.commandName === 'offer') {
        if (!interaction.channel || !interaction.channel.isTextBased()) {
          return safeReply(interaction, {
            content: 'This command only works in a text channel.',
            ephemeral: true,
          });
        }

        await interaction.channel.send({
          embeds: [buildOfferEmbed(interaction.guild, 'en')],
          components: [buildTicketButtons('en')],
        });

        return safeReply(interaction, {
          content: getLang('en').offerSent,
          ephemeral: true,
        });
      }

      if (interaction.commandName === 'panel') {
        if (!interaction.channel || !interaction.channel.isTextBased()) {
          return safeReply(interaction, {
            content: 'Ta komenda działa tylko na kanale tekstowym.',
            ephemeral: true,
          });
        }

        await interaction.channel.send({
          content: 'Wybierz język panelu / Choose panel language:',
          components: [buildLanguageButtons()],
        });

        return safeReply(interaction, {
          content: getLang('pl').panelSent,
          ephemeral: true,
        });
      }

      if (interaction.commandName === 'zamknij') {
        return closeTicket(interaction, 'pl');
      }

      if (interaction.commandName === 'close') {
        return closeTicket(interaction, 'en');
      }

      if (interaction.commandName === 'kanal-emoji') {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('kanal', true);
        const emoji = interaction.options.getString('emoji', true);

        if (!isSupportedRenameChannel(channel)) {
          return interaction.editReply({
            content: getLang('pl').unsupportedChannel,
          });
        }

        const newName = buildSafeChannelName(emoji, '');

        try {
          await channel.setName(newName);
          return interaction.editReply({
            content: `✅ Zmieniono nazwę kanału na: **${newName}**`,
          });
        } catch (err) {
          console.error('Błąd setName kanal-emoji:', err);
          return interaction.editReply({
            content: getLang('pl').renameFailed,
          });
        }
      }

      if (interaction.commandName === 'kanal-nazwa') {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('kanal', true);
        const newBaseName = interaction.options.getString('nazwa', true);

        if (!isSupportedRenameChannel(channel)) {
          return interaction.editReply({
            content: getLang('pl').unsupportedChannel,
          });
        }

        const newName = buildSafeChannelName('', newBaseName);

        try {
          await channel.setName(newName);
          return interaction.editReply({
            content: `✅ Zmieniono nazwę kanału na: **${newName}**`,
          });
        } catch (err) {
          console.error('Błąd setName kanal-nazwa:', err);
          return interaction.editReply({
            content: getLang('pl').renameFailed,
          });
        }
      }

      if (interaction.commandName === 'kanal-ustaw') {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('kanal', true);
        const emoji = interaction.options.getString('emoji') ?? '';
        const newBaseName = interaction.options.getString('nazwa') ?? '';

        if (!isSupportedRenameChannel(channel)) {
          return interaction.editReply({
            content: getLang('pl').unsupportedChannel,
          });
        }

        const newName = buildSafeChannelName(emoji, newBaseName);

        try {
          await channel.setName(newName);
          return interaction.editReply({
            content: `✅ Ustawiono kanał na: **${newName}**`,
          });
        } catch (err) {
          console.error('Błąd setName kanal-ustaw:', err);
          return interaction.editReply({
            content: getLang('pl').renameFailed,
          });
        }
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'send_offer_pl') {
        return safeReply(interaction, {
          embeds: [buildOfferEmbed(interaction.guild, 'pl')],
          components: [buildTicketButtons('pl')],
          ephemeral: true,
        });
      }

      if (interaction.customId === 'send_offer_en') {
        return safeReply(interaction, {
          embeds: [buildOfferEmbed(interaction.guild, 'en')],
          components: [buildTicketButtons('en')],
          ephemeral: true,
        });
      }

      if (interaction.customId === 'open_ticket_pl') {
        return createTicket(interaction, 'pl');
      }

      if (interaction.customId === 'open_ticket_en') {
        return createTicket(interaction, 'en');
      }

      if (interaction.customId === 'close_ticket_pl') {
        return closeTicket(interaction, 'pl');
      }

      if (interaction.customId === 'close_ticket_en') {
        return closeTicket(interaction, 'en');
      }
    }
  } catch (error) {
    console.error('Global interaction error:', error);

    const fallback = getLang(config.defaultLanguage).genericError;

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: fallback,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: fallback,
          ephemeral: true,
        });
      }
    } catch (replyError) {
      console.error('Błąd przy wysyłaniu fallback reply:', replyError);
    }
  }
});

client.login(config.token);
